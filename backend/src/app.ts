import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { ZodError } from 'zod';
import { prisma } from './config/database';
import { isAppError } from './shared/errors';
import { createServices } from './services';
import { createChatRouter } from './modules/chat/chat.controller';
import { createChunksRouter } from './modules/chunks/chunks.controller';
import { createEvaluationRouter } from './modules/evaluation/evaluation.controller';
import { createFeedbackRouter } from './modules/feedback/feedback.controller';
import { createKnowledgeRouter } from './modules/knowledge/knowledge.controller';
import { createRetrievalRouter } from './modules/retrieval/retrieval.controller';

export function createApp() {
  const services = createServices();
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '5mb' }));
  app.use(morgan('dev'));

  app.get('/health', async (_request, response) => {
    const checks = {
      api: 'ok',
      database: 'unknown',
      vectorStore: 'unknown'
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = 'ok';
    } catch {
      checks.database = 'error';
    }

    try {
      const result = await prisma.$queryRaw<Array<{ extname: string }>>`
        SELECT extname FROM pg_extension WHERE extname = 'vector'
      `;
      checks.vectorStore = result.length ? 'ok' : 'missing';
    } catch {
      checks.vectorStore = 'error';
    }

    response.status(checks.database === 'ok' && checks.vectorStore === 'ok' ? 200 : 503).json(checks);
  });

  app.get('/api/documents', async (_request, response, next) => {
    try {
      response.json(await services.knowledgeRepository.listDocuments());
    } catch (error) {
      next(error);
    }
  });

  app.use('/api/knowledge', createKnowledgeRouter(services.knowledgeService, services.knowledgeRepository));
  app.use('/api/chunks', createChunksRouter(services.chunksService));
  app.use('/api/retrieval', createRetrievalRouter(services.retrievalService));
  app.use('/api/chat', createChatRouter(services.chatService));
  app.use('/api/evaluation', createEvaluationRouter(services.evaluationService));
  app.use('/api/feedback', createFeedbackRouter(services.feedbackService));

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof ZodError) {
      response.status(400).json({
        message: 'Erro de validação.',
        issues: error.flatten()
      });
      return;
    }

    if (isAppError(error)) {
      response.status(error.statusCode).json({
        message: error.message,
        details: error.details
      });
      return;
    }

    response.status(500).json({
      message: 'Erro interno do servidor.',
      details: error instanceof Error ? error.message : String(error)
    });
  });

  return app;
}
