import { Router } from 'express';
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

  router.post('/run', async (_request, response, next) => {
    try {
      response.json(await service.run());
    } catch (error) {
      next(error);
    }
  });

  return router;
}
