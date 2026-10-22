import { describe, expect, it } from 'vitest';
import { FeedbackService } from '../src/modules/feedback/feedback.service';
import { KnowledgeRepository } from '../src/modules/knowledge/knowledge.repository';
import { feedbackSchema } from '../src/modules/knowledge/schemas';
import { createInMemoryDb } from './support/in-memory-db';

const ANA = 'aaaaaaaa-0000-4000-8000-000000000001';
const BIA = 'bbbbbbbb-0000-4000-8000-000000000002';

describe('validação do feedback', () => {
  const messageId = 'cccccccc-0000-4000-8000-000000000003';

  it('aceita notas inteiras de 0 a 10, com ou sem comentário', () => {
    expect(feedbackSchema.parse({ messageId, rating: 0 })).toEqual({ messageId, rating: 0 });
    expect(
      feedbackSchema.parse({ messageId, rating: 10, comment: '  Citou a fonte errada.  ' })
    ).toEqual({
      messageId,
      rating: 10,
      comment: 'Citou a fonte errada.'
    });
  });

  it('rejeita notas fora do intervalo, fracionárias ou enviadas como texto', () => {
    for (const rating of [-1, 11, 7.5, '8', null]) {
      expect(feedbackSchema.safeParse({ messageId, rating }).success).toBe(false);
    }
  });

  it('exige o identificador da resposta e limita o comentário', () => {
    expect(feedbackSchema.safeParse({ rating: 5 }).success).toBe(false);
    expect(feedbackSchema.safeParse({ messageId: 'resposta-1', rating: 5 }).success).toBe(false);
    expect(
      feedbackSchema.safeParse({ messageId, rating: 5, comment: 'x'.repeat(1001) }).success
    ).toBe(false);
  });

  it('trata comentário em branco como ausente e descarta um userId enviado pelo cliente', () => {
    const parsed = feedbackSchema.parse({ messageId, rating: 5, comment: '   ', userId: BIA });

    expect(parsed).toEqual({ messageId, rating: 5 });
    expect('userId' in parsed).toBe(false);
  });
});

describe('registro do feedback', () => {
  it('vincula a avaliação ao usuário autenticado, à conversa e à resposta avaliada', async () => {
    const { db, data, addConversation } = createInMemoryDb();
    const { session, answer } = addConversation(ANA);

    const result = await new FeedbackService(db).create(ANA, {
      messageId: answer.id,
      rating: 8,
      comment: 'Faltou citar a página.'
    });

    expect(result).toMatchObject({
      messageId: answer.id,
      sessionId: session.id,
      rating: 8,
      comment: 'Faltou citar a página.'
    });
    expect(data.feedback).toEqual([
      expect.objectContaining({ userId: ANA, sessionId: session.id, messageId: answer.id })
    ]);
  });

  it('registra apenas a nota quando não há comentário', async () => {
    const { db, data, addConversation } = createInMemoryDb();
    const { answer } = addConversation(ANA);

    await new FeedbackService(db).create(ANA, { messageId: answer.id, rating: 0 });

    expect(data.feedback[0]).toMatchObject({ rating: 0, comment: null });
  });

  it('permite avaliar respostas diferentes da mesma conversa de forma independente', async () => {
    const { db, data, addConversation } = createInMemoryDb();
    const { session, answer } = addConversation(ANA);
    const second = {
      id: 'dddddddd-0000-4000-8000-000000000004',
      sessionId: session.id,
      role: 'assistant' as const,
      content: 'Outra resposta'
    };
    data.chatMessages.push(second);
    const service = new FeedbackService(db);

    await service.create(ANA, { messageId: answer.id, rating: 4 });
    await service.create(ANA, { messageId: second.id, rating: 9 });

    expect(data.feedback.map((item) => [item.messageId, item.rating])).toEqual([
      [answer.id, 4],
      [second.id, 9]
    ]);
  });

  it('impede a segunda avaliação da mesma resposta pelo mesmo usuário', async () => {
    const { db, data, addConversation } = createInMemoryDb();
    const { answer } = addConversation(ANA);
    const service = new FeedbackService(db);
    await service.create(ANA, { messageId: answer.id, rating: 7 });

    await expect(service.create(ANA, { messageId: answer.id, rating: 3 })).rejects.toMatchObject({
      statusCode: 409
    });
    expect(data.feedback).toHaveLength(1);
  });

  it('não permite avaliar resposta de outra pessoa, de conversa antiga sem dono ou inexistente', async () => {
    const { db, data, addConversation } = createInMemoryDb();
    const fromBia = addConversation(BIA).answer;
    const legacy = addConversation(null).answer;
    const service = new FeedbackService(db);

    for (const messageId of [fromBia.id, legacy.id, 'eeeeeeee-0000-4000-8000-000000000005']) {
      await expect(service.create(ANA, { messageId, rating: 5 })).rejects.toMatchObject({
        statusCode: 404
      });
    }
    expect(data.feedback).toHaveLength(0);
  });

  it('aceita apenas respostas da IA, não perguntas do usuário', async () => {
    const { db, addConversation } = createInMemoryDb();
    const { question } = addConversation(ANA);

    await expect(
      new FeedbackService(db).create(ANA, { messageId: question.id, rating: 5 })
    ).rejects.toMatchObject({
      statusCode: 400
    });
  });

  it('propaga falhas de persistência sem registrar a avaliação', async () => {
    const { db, data, addConversation } = createInMemoryDb();
    const { answer } = addConversation(ANA);
    db.feedback.create = async () => {
      throw new Error('conexão com o banco perdida');
    };

    await expect(
      new FeedbackService(db).create(ANA, { messageId: answer.id, rating: 6 })
    ).rejects.toThrow('conexão com o banco perdida');
    expect(data.feedback).toHaveLength(0);
  });
});

describe('dono da conversa', () => {
  it('reaproveita só a conversa do próprio usuário e abre uma nova nos demais casos', async () => {
    const { db, data } = createInMemoryDb();
    const repository = new KnowledgeRepository(db);

    const own = await repository.ensureSession(undefined, 'Profissional de saúde', ANA);
    expect(own.userId).toBe(ANA);
    expect((await repository.ensureSession(own.id, 'Profissional de saúde', ANA)).id).toBe(own.id);

    const fromAnother = await repository.ensureSession(own.id, 'Profissional de saúde', BIA);
    expect(fromAnother.id).not.toBe(own.id);
    expect(fromAnother.userId).toBe(BIA);

    data.chatSessions.push({
      id: 'ffffffff-0000-4000-8000-000000000006',
      userType: 'Paciente',
      userId: null
    });
    const afterLegacy = await repository.ensureSession(
      'ffffffff-0000-4000-8000-000000000006',
      'Paciente',
      ANA
    );
    expect(afterLegacy.id).not.toBe('ffffffff-0000-4000-8000-000000000006');
  });
});
