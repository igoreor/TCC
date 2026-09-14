import { Router } from 'express';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeRepository } from './knowledge.repository';
import { ingestJsonlSchema } from './schemas';

export function createKnowledgeRouter(service: KnowledgeService, repository: KnowledgeRepository) {
  const router = Router();

  router.post('/ingest/jsonl', async (request, response, next) => {
    try {
      const input = ingestJsonlSchema.parse(request.body);
      const result = input.filePath
        ? await service.ingestFromFile(input.filePath)
        : await service.ingestJsonlContent(input.content ?? '');
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post('/seed', async (_request, response, next) => {
    try {
      const result = await service.seedFromDefaultFile();
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get('/documents', async (_request, response, next) => {
    try {
      response.json(await repository.listDocuments());
    } catch (error) {
      next(error);
    }
  });

  return router;
}
