import { PrismaClient } from '@prisma/client';
import { prisma } from '../../config/database';

export class FeedbackService {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(input: {
    messageId?: string;
    rating: number;
    comment?: string;
    reviewedBySpecialist: boolean;
  }) {
    return this.db.feedback.create({
      data: {
        messageId: input.messageId ?? null,
        rating: input.rating,
        comment: input.comment,
        reviewedBySpecialist: input.reviewedBySpecialist
      }
    });
  }
}
