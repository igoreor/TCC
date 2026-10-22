import { Router } from 'express';
import { getAuthUser } from '../auth/auth.middleware';
import { EvaluationService } from './evaluation.service';

export function createEvaluationRouter(service: EvaluationService) {
  const router = Router();

  router.post('/seed', async (_request, response, next) => {
    try {
      response.status(201).json(await service.seedDefaultQuestions());
    } catch (error) {
      next(error);
    }
  });

  router.get('/questions', async (_request, response, next) => {
    try {
      response.json(await service.listQuestions());
    } catch (error) {
      next(error);
    }
  });

  router.post('/run', async (request, response, next) => {
    try {
      response.json(await service.run(getAuthUser(request).id));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
