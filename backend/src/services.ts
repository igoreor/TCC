import { prisma } from './config/database';
import { env } from './config/env';
import { AuthService } from './modules/auth/auth.service';
import { LoginRateLimiter } from './modules/auth/login-rate-limiter';
import { ChatService } from './modules/chat/chat.service';
import { PromptBuilderService } from './modules/chat/prompt-builder.service';
import { ChunksService } from './modules/chunks/chunks.service';
import { EmbeddingsService } from './modules/embeddings/embeddings.service';
import { EvaluationService } from './modules/evaluation/evaluation.service';
import { FeedbackService } from './modules/feedback/feedback.service';
import { KnowledgeRepository } from './modules/knowledge/knowledge.repository';
import { KnowledgeService } from './modules/knowledge/knowledge.service';
import { ChunkingService } from './modules/knowledge/chunking.service';
import { ClinicalRiskService } from './modules/retrieval/clinical-risk.service';
import { HybridSearchService } from './modules/retrieval/hybrid-search.service';
import { IntentClassifierService } from './modules/retrieval/intent-classifier.service';
import { QueryAnalyzerService } from './modules/retrieval/query-analyzer.service';
import { createLlmClient } from './modules/llm/llm.client';
import { RetrievalService } from './modules/retrieval/retrieval.service';
import { SafetyService } from './modules/safety/safety.service';

export function createServices() {
  const knowledgeRepository = new KnowledgeRepository(prisma);
  const embeddingsService = new EmbeddingsService();
  const chunkingService = new ChunkingService();
  const knowledgeService = new KnowledgeService(knowledgeRepository, embeddingsService);
  const chunksService = new ChunksService(knowledgeRepository);

  // Sem OPENAI_API_KEY (ou em teste), não há modelo: análise heurística e resposta extrativa.
  const llmClient = createLlmClient();
  const intentClassifier = new IntentClassifierService();
  const clinicalRiskService = new ClinicalRiskService();
  const queryAnalyzer = new QueryAnalyzerService(llmClient);
  const hybridSearchService = new HybridSearchService(knowledgeRepository, embeddingsService);
  const retrievalService = new RetrievalService(
    hybridSearchService,
    intentClassifier,
    clinicalRiskService,
    queryAnalyzer
  );

  const safetyService = new SafetyService();
  const promptBuilder = new PromptBuilderService();
  const chatService = new ChatService(
    retrievalService,
    safetyService,
    promptBuilder,
    knowledgeRepository,
    llmClient,
    embeddingsService
  );
  const evaluationService = new EvaluationService(chatService, prisma);
  const feedbackService = new FeedbackService(prisma);
  const authService = new AuthService(prisma, { sessionTtlHours: env.AUTH_SESSION_TTL_HOURS });
  const loginRateLimiter = new LoginRateLimiter();

  return {
    authService,
    loginRateLimiter,
    knowledgeRepository,
    embeddingsService,
    chunkingService,
    knowledgeService,
    chunksService,
    intentClassifier,
    clinicalRiskService,
    queryAnalyzer,
    hybridSearchService,
    retrievalService,
    safetyService,
    promptBuilder,
    chatService,
    evaluationService,
    feedbackService
  };
}
