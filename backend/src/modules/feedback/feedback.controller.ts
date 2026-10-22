import { Router } from 'express';
import { getAuthUser } from '../auth/auth.middleware';
import { feedbackSchema } from '../knowledge/schemas';
import { FeedbackService } from './feedback.service';

export function createFeedbackRouter(service: FeedbackService) {
  const router = Router();

  router.post('/', async (request, response, next) => {
    try {
      const user = getAuthUser(request);
      const input = feedbackSchema.parse(request.body);
      response.status(201).json(await service.create(user.id, input));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
