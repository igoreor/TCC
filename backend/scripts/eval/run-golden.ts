// Executa o conjunto de referência contra o banco configurado (DATABASE_URL) e grava o relatório.
//
// Uso: npm run eval:rag [-- --label <nome>] [-- --only <id1,id2>]
// Nada é gravado no banco: conversas e registros ficam em memória. Com OPENAI_API_KEY, usa os
// embeddings e o modelo da OpenAI (como em produção); sem ela, o modo local (determinístico e
// extrativo), que serve para comparar versões, mas não reflete a qualidade da recuperação semântica.
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../../src/config/database';
import { env } from '../../src/config/env';
import { ChatService } from '../../src/modules/chat/chat.service';
import { PromptBuilderService } from '../../src/modules/chat/prompt-builder.service';
import { EmbeddingsService } from '../../src/modules/embeddings/embeddings.service';
import {
  CaseOutput,
  loadGoldenSet,
  scoreCase,
  summarize
} from '../../src/modules/evaluation/golden-evaluation';
import { KNOWLEDGE_BASE_DIR } from '../../src/modules/knowledge/document-manifest';
import { KnowledgeRepository } from '../../src/modules/knowledge/knowledge.repository';
import { createLlmClient } from '../../src/modules/llm/llm.client';
import { ClinicalRiskService } from '../../src/modules/retrieval/clinical-risk.service';
import { HybridSearchService } from '../../src/modules/retrieval/hybrid-search.service';
import { IntentClassifierService } from '../../src/modules/retrieval/intent-classifier.service';
import { QueryAnalyzerService } from '../../src/modules/retrieval/query-analyzer.service';
import { RetrievalService } from '../../src/modules/retrieval/retrieval.service';
import { SafetyService } from '../../src/modules/safety/safety.service';

/** Lê do banco, mas guarda conversas e registros só em memória. */
class ReadOnlyRepository extends KnowledgeRepository {
  private readonly sessions = new Map<
    string,
    Array<{ role: 'user' | 'assistant'; content: string }>
  >();

  async ensureSession(sessionId: string | undefined, userType: string, userId: string) {
    const id = sessionId ?? randomUUID();
    const reused = this.sessions.has(id);
    if (!reused) this.sessions.set(id, []);
    return { id, userType, userId, createdAt: new Date(), reused };
  }

  async findRecentMessages(sessionId: string, limit = 6) {
    return (this.sessions.get(sessionId) ?? []).slice(-limit);
  }

  async createChatMessage(input: {
    sessionId: string;
    role: 'user' | 'assistant';
    content: string;
  }) {
    this.sessions.get(input.sessionId)?.push({ role: input.role, content: input.content });
    return {
      id: randomUUID(),
      sessionId: input.sessionId,
      role: input.role,
      content: input.content,
      createdAt: new Date()
    };
  }

  async createRetrievalLog() {
    return undefined as never;
  }
}

function argument(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const label = argument('label') ?? 'execucao';
  const only = argument('only')?.split(',');
  const golden = await loadGoldenSet();
  const questions = golden.questions.filter((question) => !only || only.includes(question.id));

  const repository = new ReadOnlyRepository(prisma);
  const embeddings = new EmbeddingsService();
  const llm = createLlmClient();
  const retrieval = new RetrievalService(
    new HybridSearchService(repository, embeddings),
    new IntentClassifierService(),
    new ClinicalRiskService(),
    new QueryAnalyzerService(llm)
  );
  const chat = new ChatService(
    retrieval,
    new SafetyService(),
    new PromptBuilderService(),
    repository,
    llm,
    embeddings
  );
  const userId = randomUUID();

  const scores = [];
  const transcripts = [];
  for (const question of questions) {
    let sessionId: string | undefined;
    for (const previous of question.history ?? []) {
      const turn = await chat.ask({
        question: previous,
        userType: question.userType ?? 'Profissional de saúde',
        userId,
        sessionId
      });
      sessionId = turn.sessionId;
    }
    const started = Date.now();
    const output = await chat.ask({
      question: question.question,
      userType: question.userType ?? 'Profissional de saúde',
      userId,
      sessionId
    });
    const caseOutput: CaseOutput = {
      answer: output.answer,
      fallbackTriggered: output.safety.fallbackTriggered,
      reason: output.safety.reason,
      context: output.retrieval.chunks.map((chunk) => ({
        chunkId: chunk.chunk_id,
        documentId: chunk.document_id,
        pageStart: chunk.page_start,
        pageEnd: chunk.page_end
      })),
      cited: output.safety.fallbackTriggered
        ? []
        : output.sources.map((source) => ({
            chunkId: source.chunk_id,
            documentId: source.document_id,
            pageStart: source.pdf_page,
            pageEnd: source.pdf_page_end,
            verified: source.verified
          }))
    };
    const score = scoreCase(question, caseOutput);
    scores.push(score);
    transcripts.push({
      ...score,
      milliseconds: Date.now() - started,
      standaloneQuestion: output.retrieval.standaloneQuestion,
      searchQueries: output.retrieval.searchQueries,
      answer: output.answer,
      sources: output.sources.map(
        (source) =>
          `[${source.index}] ${source.reference}${source.verified === false ? ' (não verificada)' : ''}`
      ),
      context: caseOutput.context.map(
        (chunk) => `${chunk.chunkId} (pdf ${chunk.pageStart}-${chunk.pageEnd})`
      )
    });
    console.log(
      `${question.id} ${score.correctBehaviour ? 'ok ' : 'ERR'} ${score.behaviour.padEnd(9)} hit@5=${score.hitAt5 ?? '-'} ` +
        `citações=${score.cited} precisão=${score.citationPrecision ?? '-'} fatos=${score.keyFactCoverage ?? '-'}`
    );
  }

  const summary = summarize(scores);
  const configuration = {
    label,
    date: new Date().toISOString(),
    embeddingModel: embeddings.modelId,
    semanticEmbeddings: embeddings.semantic,
    llm: llm?.model ?? 'nenhum (resposta extrativa)',
    topK: env.DEFAULT_TOP_K,
    topN: env.DEFAULT_TOP_N,
    minVectorSimilarity: retrieval.minVectorSimilarity
  };

  const directory = path.join(KNOWLEDGE_BASE_DIR, 'evaluation', 'results');
  await mkdir(directory, { recursive: true });
  const base = path.join(directory, `${configuration.date.slice(0, 10)}-${label}`);
  await writeFile(
    `${base}.json`,
    JSON.stringify({ configuration, summary, cases: transcripts }, null, 2) + '\n'
  );
  console.log(JSON.stringify({ configuration, summary: summary.overall }, null, 2));
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
