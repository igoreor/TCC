import { PrismaClient } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors';

export interface FeedbackInput {
  messageId: string;
  rating: number;
  comment?: string;
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 'P2002'
  );
}

export class FeedbackService {
  constructor(private readonly db: PrismaClient = prisma) {}

  /**
   * Registra a avaliação de uma resposta da IA. A conversa é obtida da própria resposta, e o
   * usuário, da sessão de login: nenhum dos dois é aceito do cliente.
   */
  async create(userId: string, input: FeedbackInput) {
    const message = await this.db.chatMessage.findUnique({
      where: { id: input.messageId },
      select: { id: true, role: true, sessionId: true, session: { select: { userId: true } } }
    });

    // Resposta de outra pessoa é tratada como inexistente, para não revelar que ela existe.
    if (!message || message.session.userId !== userId) {
      throw new AppError('Resposta não encontrada.', 404);
    }
    if (message.role !== 'assistant') {
      throw new AppError('Apenas respostas da IA podem ser avaliadas.', 400);
    }

    try {
      const feedback = await this.db.feedback.create({
        data: {
          userId,
          sessionId: message.sessionId,
          messageId: message.id,
          rating: input.rating,
          comment: input.comment ?? null
        }
      });

      return {
        id: feedback.id,
        messageId: feedback.messageId,
        sessionId: feedback.sessionId,
        rating: feedback.rating,
        comment: feedback.comment,
        createdAt: feedback.createdAt
      };
    } catch (error) {
      if (isUniqueViolation(error)) throw new AppError('Você já avaliou esta resposta.', 409);
      throw error;
    }
  }
}
