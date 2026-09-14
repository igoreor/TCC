import { prisma } from './config/database';
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
import { RerankingService } from './modules/retrieval/reranking.service';
import { RetrievalService } from './modules/retrieval/retrieval.service';
import { SafetyService } from './modules/safety/safety.service';

export function createServices() {
  const knowledgeRepository = new KnowledgeRepository(prisma);
  const embeddingsService = new EmbeddingsService();
  const chunkingService = new ChunkingService();
  const knowledgeService = new KnowledgeService(knowledgeRepository, embeddingsService);
  const chunksService = new ChunksService(knowledgeRepository);

  const intentClassifier = new IntentClassifierService();
  const clinicalRiskService = new ClinicalRiskService();
  const rerankingService = new RerankingService();
  const hybridSearchService = new HybridSearchService(knowledgeRepository, embeddingsService);
  const retrievalService = new RetrievalService(
    hybridSearchService,
    intentClassifier,
    clinicalRiskService,
    rerankingService
  );

  const safetyService = new SafetyService();
  const promptBuilder = new PromptBuilderService();
  const chatService = new ChatService(retrievalService, safetyService, promptBuilder, knowledgeRepository);
  const evaluationService = new EvaluationService(chatService, prisma);
  const feedbackService = new FeedbackService(prisma);

  return {
    knowledgeRepository,
    embeddingsService,
    chunkingService,
    knowledgeService,
    chunksService,
    intentClassifier,
    clinicalRiskService,
    rerankingService,
    hybridSearchService,
    retrievalService,
    safetyService,
    promptBuilder,
    chatService,
    evaluationService,
    feedbackService
  };
}
