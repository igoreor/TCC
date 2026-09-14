import { Router } from 'express';
import { ChunksService } from './chunks.service';
import { searchFiltersSchema } from '../knowledge/schemas';
import { toPagination } from '../../shared/pagination';
import { AppError } from '../../shared/errors';

export function createChunksRouter(service: ChunksService) {
  const router = Router();

  router.get('/', async (request, response, next) => {
    try {
      const pagination = toPagination(request.query);
      const filters = searchFiltersSchema.parse(request.query);
      const result = await service.list(filters, pagination.page, pagination.pageSize);
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:chunkId', async (request, response, next) => {
    try {
      const chunk = await service.findByChunkId(request.params.chunkId);
      if (!chunk) throw new AppError('Chunk não encontrado.', 404);
      response.json(chunk);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
