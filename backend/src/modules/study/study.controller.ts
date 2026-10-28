import { Router } from 'express';
import { AppError, isAppError } from '../../shared/errors';
import type { StudyClient } from './study.client';
import { studyBatchParamsSchema, studyCompareSchema } from './study.schemas';

export function createStudyRouter(client?: StudyClient) {
  const router = Router();

  function requireClient() {
    if (!client) throw new AppError('Estudo de expansão não configurado.', 503);
    return client;
  }

  // Sempre 200: a tela usa a resposta para explicar por que o estudo está indisponível.
  router.get('/status', async (_request, response, next) => {
    try {
      if (!client?.enabled) {
        response.json({ available: false, reason: 'Serviço do estudo não configurado nesta instância.' });
        return;
      }
      response.json({ available: true, service: await client.status() });
    } catch (error) {
      if (isAppError(error)) {
        response.json({ available: false, reason: error.message });
        return;
      }
      next(error);
    }
  });

  router.get('/results', async (_request, response, next) => {
    try {
      response.json(await requireClient().listResults());
    } catch (error) {
      next(error);
    }
  });

  router.get('/results/:experimentId/:batchId', async (request, response, next) => {
    try {
      const params = studyBatchParamsSchema.parse(request.params);
      response.json(await requireClient().getResult(params.experimentId, params.batchId));
    } catch (error) {
      next(error);
    }
  });

  router.post('/compare', async (request, response, next) => {
    try {
      const input = studyCompareSchema.parse(request.body);
      response.json(await requireClient().compare(input));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
