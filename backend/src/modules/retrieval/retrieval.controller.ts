import { Router } from 'express';
import { retrievalSearchSchema } from '../knowledge/schemas';
import { RetrievalService } from './retrieval.service';

export function createRetrievalRouter(service: RetrievalService) {
  const router = Router();

  router.post('/search', async (request, response, next) => {
    try {
      const input = retrievalSearchSchema.parse(request.body);
      const result = await service.retrieve({
        question: input.question,
        filters: input.filters,
        mode: input.mode,
        topK: input.topK,
        topN: input.topN,
        applyMinScore: false
      });

      response.json({
        intent: result.intent,
        riskLevel: result.riskLevel,
        chunks: result.rawChunks
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
