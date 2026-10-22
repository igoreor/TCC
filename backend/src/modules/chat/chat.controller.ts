import { Router } from 'express';
import { getAuthUser } from '../auth/auth.middleware';
import { askSchema } from '../knowledge/schemas';
import { ChatService } from './chat.service';

export function createChatRouter(service: ChatService) {
  const router = Router();

  router.post('/ask', async (request, response, next) => {
    try {
      const user = getAuthUser(request);
      const input = askSchema.parse(request.body);
      const result = await service.ask({ ...input, userId: user.id });
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
