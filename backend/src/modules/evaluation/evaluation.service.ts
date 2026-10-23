import { PrismaClient } from '@prisma/client';
import { prisma } from '../../config/database';
import { ChatService } from '../chat/chat.service';
import { GoldenQuestion, loadGoldenSet, scoreCase, summarize } from './golden-evaluation';

const EXPECTED_LABEL: Record<GoldenQuestion['expected'], string> = {
  responder: 'Responder com base nos documentos',
  recusar: 'Recusar',
  informar_lacuna: 'Informar que a base não trata do assunto'
};

export class EvaluationService {
  constructor(
    private readonly chatService: ChatService | null,
    private readonly db: PrismaClient = prisma
  ) {}

  /**
   * Grava no banco o conjunto de referência (knowledge-base/evaluation/golden-questions.json), para
   * o painel. Perguntas de conjuntos anteriores, que apontavam para trechos da base inicial de
   * desenvolvimento, são substituídas: o arquivo do conjunto é a fonte da verdade.
   */
  async seedDefaultQuestions() {
    const golden = await loadGoldenSet();
    const removed = await this.db.evaluationQuestion.deleteMany({
      where: { question: { notIn: golden.questions.map((question) => question.question) } }
    });
    let created = 0;

    for (const question of golden.questions) {
      const exists = await this.db.evaluationQuestion.findFirst({
        where: { question: question.question }
      });
      if (exists) continue;
      await this.db.evaluationQuestion.create({
        data: {
          question: question.question,
          expectedAnswer: `${EXPECTED_LABEL[question.expected]}${question.expectedReason ? ` (${question.expectedReason})` : ''}`,
          idealChunks: question.evidence.map(
            (evidence) => `${evidence.documentId}#pdf ${evidence.pages[0]}-${evidence.pages[1]}`
          ),
          riskLevel: question.category,
          correctnessCriteria: question.keyFacts
            .map((alternatives) => alternatives.join(' | '))
            .join('; '),
          criticalErrors: question.evidence
            .map((evidence) => evidence.note)
            .filter(Boolean)
            .join('; ')
        }
      });
      created += 1;
    }

    return { created, removed: removed.count, total: golden.questions.length };
  }

  async listQuestions() {
    return this.db.evaluationQuestion.findMany({ orderBy: { createdAt: 'asc' } });
  }

  /** Executa o conjunto de referência; as conversas geradas ficam registradas em nome de quem iniciou. */
  async run(userId: string) {
    if (!this.chatService) {
      throw new Error('ChatService não configurado para avaliação.');
    }

    const golden = await loadGoldenSet();
    const scores = [];
    const results = [];

    for (const question of golden.questions) {
      let sessionId: string | undefined;
      for (const previous of question.history ?? []) {
        sessionId = (
          await this.chatService.ask({
            question: previous,
            userType: question.userType ?? 'Profissional de saúde',
            userId,
            sessionId
          })
        ).sessionId;
      }
      const output = await this.chatService.ask({
        question: question.question,
        userType: question.userType ?? 'Profissional de saúde',
        userId,
        sessionId
      });
      const score = scoreCase(question, {
        answer: output.answer,
        fallbackTriggered: output.safety.fallbackTriggered,
        reason: output.safety.reason,
        context: output.retrieval.chunks.map((chunk) => ({
          chunkId: chunk.chunk_id,
          documentId: chunk.document_id,
          pageStart: chunk.page_start,
          pageEnd: chunk.page_end
        })),
        cited: output.safety.fallbackTriggered
          ? []
          : output.sources.map((source) => ({
              chunkId: source.chunk_id,
              documentId: source.document_id,
              pageStart: source.pdf_page,
              pageEnd: source.pdf_page_end,
              verified: source.verified
            }))
      });
      scores.push(score);
      results.push({
        question: question.question,
        category: question.category,
        expected: question.expected,
        matchedIdealChunk: Boolean(score.hitAt8),
        correctBehaviour: score.correctBehaviour,
        keyFactCoverage: score.keyFactCoverage,
        citationPrecision: score.citationPrecision,
        returnedChunks: output.sources.map((source) => source.chunk_id),
        fallbackTriggered: output.safety.fallbackTriggered,
        riskLevel: output.safety.riskLevel
      });
    }

    const summary = summarize(scores);
    return {
      total: results.length,
      matchedIdealChunkCount: results.filter((result) => result.matchedIdealChunk).length,
      idealChunkRecallApproximation: summary.overall.recallAt8 ?? 0,
      fallbackCount: results.filter((result) => result.fallbackTriggered).length,
      summary,
      results
    };
  }
}
