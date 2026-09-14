import { Router } from 'express';
import { askSchema } from '../knowledge/schemas';
import { ChatService } from './chat.service';

export function createChatRouter(service: ChatService) {
  const router = Router();

  router.post('/ask', async (request, response, next) => {
    try {
      const input = askSchema.parse(request.body);
      const result = await service.ask(input);
      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
