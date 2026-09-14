import { PrismaClient } from '@prisma/client';
import { prisma } from '../../config/database';
import { ChatService } from '../chat/chat.service';
import { evaluationSeed } from './evaluation.seed';

export class EvaluationService {
  constructor(
    private readonly chatService: ChatService | null,
    private readonly db: PrismaClient = prisma
  ) {}

  async seedDefaultQuestions() {
    let created = 0;

    for (const question of evaluationSeed) {
      const exists = await this.db.evaluationQuestion.findFirst({
        where: { question: question.question }
      });

      if (!exists) {
        await this.db.evaluationQuestion.create({
          data: {
            question: question.question,
            expectedAnswer: question.expectedAnswer,
            idealChunks: question.idealChunks,
            riskLevel: question.riskLevel,
            correctnessCriteria: question.correctnessCriteria,
            criticalErrors: question.criticalErrors
          }
        });
        created += 1;
      }
    }

    return { created, total: evaluationSeed.length };
  }

  async listQuestions() {
    return this.db.evaluationQuestion.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async run() {
    if (!this.chatService) {
      throw new Error('ChatService não configurado para avaliação.');
    }

    const questions = await this.listQuestions();
    const results = [];
    let matchedIdealChunkCount = 0;
    let fallbackCount = 0;

    for (const item of questions) {
      const output = await this.chatService.ask({
        question: item.question,
        userType: 'Profissional de saúde'
      });
      const returnedChunks = output.sources.map((source) => source.chunk_id);
      const idealChunks = Array.isArray(item.idealChunks) ? (item.idealChunks as string[]) : [];
      const matched = idealChunks.some((chunkId) => returnedChunks.includes(chunkId));
      if (matched) matchedIdealChunkCount += 1;
      if (output.safety.fallbackTriggered) fallbackCount += 1;
      results.push({
        question: item.question,
        matchedIdealChunk: matched,
        returnedChunks,
        fallbackTriggered: output.safety.fallbackTriggered,
        riskLevel: output.safety.riskLevel
      });
    }

    return {
      total: questions.length,
      matchedIdealChunkCount,
      idealChunkRecallApproximation: questions.length ? matchedIdealChunkCount / questions.length : 0,
      fallbackCount,
      results
    };
  }
}
