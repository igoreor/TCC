import { env } from '../../config/env';
import { contentWords } from '../../shared/text';
import { logger } from '../../shared/logger';
import { ChunkDTO, SearchFilters, SourceCitation, UserType } from '../../shared/types';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { KnowledgeRepository } from '../knowledge/knowledge.repository';
import type { LlmClient } from '../llm/llm.client';
import { RetrievalService } from '../retrieval/retrieval.service';
import { clinicalDisclaimer } from '../safety/fallback-policy';
import { SafetyService } from '../safety/safety.service';
import {
  cosine,
  lexicallySupported,
  renumberCitations,
  sentencesByCitation,
  stripTrailingSourceList
} from './citations';
import { PromptBuilderService } from './prompt-builder.service';

// Similaridade mínima entre a frase e o trecho citado para a verificação semântica da citação.
const SEMANTIC_SUPPORT = 0.35;
const EXCERPT_LIMIT = 1800;

function pageLabel(chunk: ChunkDTO) {
  if (!chunk.pageLabelStart) return null;
  return chunk.pageLabelEnd && chunk.pageLabelEnd !== chunk.pageLabelStart
    ? `${chunk.pageLabelStart}–${chunk.pageLabelEnd}`
    : chunk.pageLabelStart;
}

/** Fonte exibida ao usuário: a referência documental, e não só o identificador do trecho. */
export function toSourceCitation(
  chunk: ChunkDTO,
  index: number,
  verified: boolean | null
): SourceCitation {
  const document = chunk.document;
  const pages = pageLabel(chunk);
  const sectionTitle = chunk.sectionPath?.at(-1) ?? chunk.title;
  const url = document?.downloadUrl
    ? `${document.downloadUrl}${chunk.pageStart ? `#page=${chunk.pageStart}` : ''}`
    : (document?.officialUrl ?? null);
  const reference = document
    ? [
        `${document.institution ?? ''}. ${document.title}`.replace(/^\.\s*/, ''),
        document.publicationYear ? String(document.publicationYear) : null,
        sectionTitle ? `Seção ${sectionTitle}` : null,
        pages ? `p. ${pages}` : null
      ]
        .filter(Boolean)
        .join('. ') + '.'
    : `${chunk.title}${chunk.section ? `, ${chunk.section}` : ''}.`;

  return {
    index,
    chunk_id: chunk.chunkId,
    document_id: chunk.documentId,
    title: sectionTitle,
    section: chunk.section,
    section_path: chunk.sectionPath ?? [],
    source_page: chunk.sourcePage ?? null,
    page_label: pages,
    pdf_page: chunk.pageStart ?? null,
    pdf_page_end: chunk.pageEnd ?? null,
    document: document
      ? {
          title: document.title,
          short_title: document.shortTitle,
          institution: document.institution,
          year: document.publicationYear,
          edition: document.edition,
          isbn: document.isbn,
          language: document.language,
          jurisdiction: document.jurisdiction,
          document_type: document.documentType,
          status: document.status,
          official_url: document.officialUrl,
          notes: document.notes
        }
      : null,
    url,
    reference,
    excerpt:
      chunk.content.length > EXCERPT_LIMIT
        ? `${chunk.content.slice(0, EXCERPT_LIMIT)}…`
        : chunk.content,
    verified
  };
}

/** Frases do trecho mais relacionadas à pergunta, na ordem original (resposta extrativa). */
function relevantSentences(content: string, question: string, limit = 2) {
  const sentences = content
    .split(/(?<=[.!?;:])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 20);
  const wanted = new Set(contentWords(question).map((word) => word.slice(0, 5)));
  const scored = sentences.map((sentence, position) => ({
    sentence,
    position,
    score: contentWords(sentence).filter((word) => wanted.has(word.slice(0, 5))).length
  }));
  const best = [...scored]
    .sort((a, b) => b.score - a.score || a.position - b.position)
    .slice(0, limit);
  return best.sort((a, b) => a.position - b.position).map((item) => item.sentence);
}

export class ChatService {
  constructor(
    private readonly retrievalService: RetrievalService,
    private readonly safetyService: SafetyService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly repository: KnowledgeRepository,
    private readonly llm: LlmClient | null = null,
    private readonly embeddings: EmbeddingsService | null = null
  ) {}

  async ask(input: {
    question: string;
    userType: UserType;
    userId: string;
    sessionId?: string;
    filters?: SearchFilters;
  }) {
    const session = await this.repository.ensureSession(
      input.sessionId,
      input.userType,
      input.userId
    );
    // O histórico é lido antes de gravar a pergunta atual: ele descreve só o que veio antes.
    const history = session.reused ? await this.repository.findRecentMessages(session.id, 6) : [];
    await this.repository.createChatMessage({
      sessionId: session.id,
      role: 'user',
      content: input.question
    });

    const retrieval = await this.retrievalService.retrieve({
      question: input.question,
      history,
      filters: input.filters,
      mode: 'hybrid',
      topK: env.DEFAULT_TOP_K,
      topN: env.DEFAULT_TOP_N
    });

    const safetyDecision = this.safetyService.evaluate({
      question: input.question,
      inDomain: retrieval.analysis.inDomain,
      hasEvidence: retrieval.hasEvidence,
      riskLevel: retrieval.riskLevel,
      userType: input.userType
    });

    let answer: string;
    let sources: SourceCitation[];
    let citationsMissing = false;

    if (safetyDecision.answer) {
      answer = safetyDecision.answer;
      // Na recusa, os trechos recuperados aparecem como consultados, sem sustentar texto algum.
      sources = retrieval.chunks
        .slice(0, 5)
        .map((chunk, index) => toSourceCitation(chunk, index + 1, null));
    } else {
      const generated = await this.generateAnswer({
        question: input.question,
        standaloneQuestion: retrieval.analysis.standaloneQuestion,
        userType: input.userType,
        chunks: retrieval.chunks,
        history,
        cautions: safetyDecision.cautions
      });
      answer = this.safetyService.appendDisclaimer(generated.text);
      sources = generated.sources;
      citationsMissing = generated.citationsMissing;
    }

    const assistantMessage = await this.repository.createChatMessage({
      sessionId: session.id,
      role: 'assistant',
      content: answer
    });

    const cited = new Set(sources.map((source) => source.chunk_id));
    await this.repository.createRetrievalLog({
      sessionId: session.id,
      question: input.question,
      retrievedChunks: retrieval.chunks.map((chunk) => ({
        chunk_id: chunk.chunkId,
        document_id: chunk.documentId,
        pages: [chunk.pageStart, chunk.pageEnd],
        score: chunk.finalScore,
        vectorScore: chunk.vectorScore,
        keywordScore: chunk.keywordScore,
        fusionScore: chunk.fusionScore,
        cited: cited.has(chunk.chunkId)
      })),
      filters: {
        ...(input.filters ?? {}),
        _analysis: {
          standaloneQuestion: retrieval.analysis.standaloneQuestion,
          searchQueries: retrieval.analysis.searchQueries,
          inDomain: retrieval.analysis.inDomain,
          isFollowUp: retrieval.analysis.isFollowUp,
          method: retrieval.analysis.method,
          broadened: retrieval.broadened
        }
      },
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
        standaloneQuestion: retrieval.analysis.standaloneQuestion,
        isFollowUp: retrieval.analysis.isFollowUp,
        searchQueries: retrieval.analysis.searchQueries,
        broadened: retrieval.broadened,
        citationsMissing,
        chunks: retrieval.chunks.map((chunk) => ({
          chunk_id: chunk.chunkId,
          document_id: chunk.documentId,
          page_start: chunk.pageStart ?? null,
          page_end: chunk.pageEnd ?? null,
          score: chunk.finalScore,
          vectorScore: chunk.vectorScore,
          keywordScore: chunk.keywordScore
        }))
      }
    };
  }

  private async generateAnswer(input: {
    question: string;
    standaloneQuestion: string;
    userType: UserType;
    chunks: ChunkDTO[];
    history: Array<{ role: 'user' | 'assistant'; content: string }>;
    cautions: string[];
  }) {
    if (this.llm) {
      try {
        return await this.generateWithLlm(input);
      } catch (error) {
        // Indisponibilidade do modelo não deixa a pessoa sem resposta: cai para a extrativa.
        logger.error('Falha na geração com o modelo; usando a resposta extrativa.', {
          error: String(error)
        });
      }
    }
    return this.generateExtractiveAnswer(input);
  }

  private async generateWithLlm(input: Parameters<ChatService['generateAnswer']>[0]) {
    const prompt = this.promptBuilder.build(input);
    const raw = await this.llm!.complete({
      temperature: 0.1,
      maxTokens: 1400,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user }
      ]
    });

    // o aviso clínico e a lista de fontes são exibidos à parte pela interface
    const cleaned = stripTrailingSourceList(raw.replace(clinicalDisclaimer, '').trim());
    const { text, order } = renumberCitations(cleaned, input.chunks.length);
    const citedChunks = order.map((position) => input.chunks[position - 1]);

    if (!citedChunks.length) {
      // Resposta sem citações: as fontes consultadas aparecem, mas nenhuma é dada como confirmada.
      return {
        text,
        sources: input.chunks.map((chunk, index) => toSourceCitation(chunk, index + 1, false)),
        citationsMissing: true
      };
    }

    const verified = await this.verifyCitations(text, citedChunks);
    return {
      text,
      sources: citedChunks.map((chunk, index) =>
        toSourceCitation(chunk, index + 1, verified[index])
      ),
      citationsMissing: false
    };
  }

  /**
   * Confere se cada fonte citada sustenta ao menos uma frase que a cita: primeiro por termos em
   * comum; se não bastar e houver embeddings semânticos, pela similaridade entre frase e trecho
   * (necessária para os trechos em inglês, citados em respostas em português).
   */
  private async verifyCitations(answer: string, citedChunks: ChunkDTO[]) {
    const sentences = sentencesByCitation(answer);
    const verified = citedChunks.map((chunk, index) =>
      (sentences.get(index + 1) ?? []).some((sentence) =>
        lexicallySupported(sentence, chunk.content)
      )
    );

    if (!this.embeddings?.semantic || verified.every(Boolean)) return verified;

    const pending = citedChunks
      .map((chunk, index) => ({ chunk, index, sentences: sentences.get(index + 1) ?? [] }))
      .filter((item) => !verified[item.index] && item.sentences.length);
    if (!pending.length) return verified;

    try {
      const texts = pending.flatMap((item) => [item.chunk.content, ...item.sentences]);
      const vectors = await this.embeddings.embedMany(texts);
      let cursor = 0;
      for (const item of pending) {
        const chunkVector = vectors[cursor];
        const sentenceVectors = vectors.slice(cursor + 1, cursor + 1 + item.sentences.length);
        cursor += 1 + item.sentences.length;
        verified[item.index] = sentenceVectors.some(
          (vector) => cosine(vector, chunkVector) >= SEMANTIC_SUPPORT
        );
      }
    } catch (error) {
      logger.error('Falha na verificação semântica das citações.', { error: String(error) });
    }
    return verified;
  }

  /** Sem modelo de linguagem: as frases mais pertinentes de cada trecho, com a fonte. */
  private generateExtractiveAnswer(input: {
    question: string;
    standaloneQuestion: string;
    chunks: ChunkDTO[];
  }) {
    const chunks = input.chunks.slice(0, 4);
    if (!chunks.length) {
      return {
        text: 'Não encontrei trechos pertinentes nos documentos da base.',
        sources: [],
        citationsMissing: false
      };
    }

    const lines = chunks.map((chunk, index) => {
      const sentences = relevantSentences(chunk.content, input.standaloneQuestion);
      const where = [
        chunk.document?.shortTitle ?? chunk.documentId,
        chunk.sectionPath?.at(-1) ?? chunk.title
      ].join(', ');
      const pages = pageLabel(chunk);
      return `- **${where}${pages ? ` (p. ${pages})` : ''}:** ${sentences.join(' ')} [${index + 1}]`;
    });

    return {
      text: `Trechos dos documentos oficiais que tratam da pergunta (resposta extrativa, sem modelo de linguagem):\n\n${lines.join('\n')}`,
      sources: chunks.map((chunk, index) => toSourceCitation(chunk, index + 1, true)),
      citationsMissing: false
    };
  }
}
