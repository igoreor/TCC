import { openAIConfig } from '../../config/openai';
import { env } from '../../config/env';
import { KnowledgeRepository } from '../knowledge/knowledge.repository';
import { RetrievalService } from '../retrieval/retrieval.service';
import { SafetyService } from '../safety/safety.service';
import { PromptBuilderService } from './prompt-builder.service';
import { ChunkDTO, SearchFilters, SourceCitation, UserType } from '../../shared/types';

export class ChatService {
  constructor(
    private readonly retrievalService: RetrievalService,
    private readonly safetyService: SafetyService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly repository: KnowledgeRepository
  ) {}

  async ask(input: {
    question: string;
    userType: UserType;
    sessionId?: string;
    filters?: SearchFilters;
  }) {
    const session = await this.repository.ensureSession(input.sessionId, input.userType);
    await this.repository.createChatMessage({
      sessionId: session.id,
      role: 'user',
      content: input.question
    });

    const retrieval = await this.retrievalService.retrieve({
      question: input.question,
      filters: input.filters,
      mode: 'hybrid',
      topK: env.DEFAULT_TOP_K,
      topN: env.DEFAULT_TOP_N,
      applyMinScore: true
    });

    const safetyDecision = this.safetyService.evaluate({
      question: input.question,
      chunks: retrieval.chunks,
      intent: retrieval.intent,
      riskLevel: retrieval.riskLevel
    });

    const sources = this.toSources(retrieval.chunks);
    const answer =
      safetyDecision.answer ??
      this.safetyService.appendDisclaimer(
        await this.generateAnswer({
          question: input.question,
          userType: input.userType,
          chunks: retrieval.chunks
        })
      );

    const assistantMessage = await this.repository.createChatMessage({
      sessionId: session.id,
      role: 'assistant',
      content: answer
    });

    await this.repository.createRetrievalLog({
      sessionId: session.id,
      question: input.question,
      retrievedChunks: retrieval.chunks.map((chunk) => ({
        chunk_id: chunk.chunkId,
        score: chunk.finalScore,
        vectorScore: chunk.vectorScore,
        keywordScore: chunk.keywordScore
      })),
      filters: input.filters ?? {},
      scores: retrieval.chunks.map((chunk) => ({
        chunk_id: chunk.chunkId,
        finalScore: chunk.finalScore
      })),
      finalAnswer: answer,
      fallbackTriggered: safetyDecision.fallbackTriggered,
      riskLevel: retrieval.riskLevel
    });

    return {
      sessionId: session.id,
      messageId: assistantMessage.id,
      answer,
      sources,
      safety: {
        riskLevel: retrieval.riskLevel,
        fallbackTriggered: safetyDecision.fallbackTriggered,
        requiresProfessionalEvaluation: safetyDecision.requiresProfessionalEvaluation,
        disclaimer: safetyDecision.disclaimer,
        reason: safetyDecision.reason
      },
      retrieval: {
        intent: retrieval.intent,
        chunks: retrieval.chunks.map((chunk) => ({
          chunk_id: chunk.chunkId,
          score: chunk.finalScore
        }))
      }
    };
  }

  private async generateAnswer(input: { question: string; userType: UserType; chunks: ChunkDTO[] }) {
    if (!input.chunks.length) {
      return 'A base recuperada não contém informação suficiente para responder com segurança.';
    }

    if (openAIConfig.enabled && process.env.NODE_ENV !== 'test') {
      return this.generateWithOpenAI(input);
    }

    return this.generateExtractiveAnswer(input);
  }

  private async generateWithOpenAI(input: { question: string; userType: UserType; chunks: ChunkDTO[] }) {
    const prompt = this.promptBuilder.build(input);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAIConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: openAIConfig.chatModel,
        temperature: 0.1,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Falha ao gerar resposta na OpenAI: ${response.status}`);
    }

    const payload = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return payload.choices[0]?.message.content ?? 'A base recuperada não contém informação suficiente para responder com segurança.';
  }

  private generateExtractiveAnswer(input: { question: string; userType: UserType; chunks: ChunkDTO[] }) {
    const intro =
      input.userType === 'Paciente'
        ? 'Com base nos trechos recuperados da base de hanseníase:'
        : 'Com base nos chunks recuperados da base de hanseníase:';

    const body = input.chunks
      .map((chunk) => `- ${chunk.content} [${chunk.chunkId}]`)
      .join('\n');

    const sourceLine = input.chunks
      .map(
        (chunk) =>
          `${chunk.chunkId} (${chunk.title}, ${chunk.section}, documento ${chunk.documentId}${
            chunk.sourcePage ? `, p. ${chunk.sourcePage}` : ''
          })`
      )
      .join('; ');

    return `${intro}\n${body}\n\nFontes usadas: ${sourceLine}.`;
  }

  private toSources(chunks: ChunkDTO[]): SourceCitation[] {
    return chunks.map((chunk) => ({
      chunk_id: chunk.chunkId,
      document_id: chunk.documentId,
      title: chunk.title,
      section: chunk.section,
      source_page: chunk.sourcePage ?? null
    }));
  }
}
