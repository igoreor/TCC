import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthService } from '../../src/modules/auth/auth.service';
import { hashPassword } from '../../src/modules/auth/password';
import { FeedbackService } from '../../src/modules/feedback/feedback.service';
import { KnowledgeRepository } from '../../src/modules/knowledge/knowledge.repository';

/**
 * Testes contra um PostgreSQL real, com todas as migrações aplicadas. Só rodam com
 * TEST_DATABASE_URL definida; use um banco descartável, pois os testes gravam e apagam registros.
 */
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)('integração com PostgreSQL', () => {
  // Criado no beforeAll: o corpo do describe é executado mesmo quando os testes são pulados.
  let db: PrismaClient;
  const suffix = randomUUID().slice(0, 8);
  const createdUsers: string[] = [];

  beforeAll(() => {
    db = new PrismaClient({ datasources: { db: { url } } });
  });

  async function createUser(name: string, password = 'senha-de-teste') {
    const username = `${name}.${suffix}`;
    const passwordHash = await hashPassword(password, { N: 2 ** 10, r: 8, p: 1 });
    // Mesmo comando do cadastro manual documentado: id e datas vêm dos defaults do banco.
    await db.$executeRaw`INSERT INTO users (username, password_hash) VALUES (${username}, ${passwordHash})`;
    const user = await db.user.findUniqueOrThrow({ where: { username } });
    createdUsers.push(user.id);
    return user;
  }

  async function createAnswer(userId: string) {
    const repository = new KnowledgeRepository(db);
    const session = await repository.ensureSession(undefined, 'Profissional de saúde', userId);
    await repository.createChatMessage({
      sessionId: session.id,
      role: 'user',
      content: 'Pergunta'
    });
    const answer = await repository.createChatMessage({
      sessionId: session.id,
      role: 'assistant',
      content: 'Resposta'
    });
    return { session, answer };
  }

  afterAll(async () => {
    await db.feedback.deleteMany({ where: { userId: { in: createdUsers } } });
    await db.chatSession.deleteMany({ where: { userId: { in: createdUsers } } });
    await db.user.deleteMany({ where: { id: { in: createdUsers } } });
    await db.$disconnect();
  });

  it('autentica um usuário cadastrado manualmente via SQL e encerra a sessão', async () => {
    const user = await createUser('ana');
    const auth = new AuthService(db, { sessionTtlHours: 8 });

    expect(user.active).toBe(true);
    await expect(auth.login(user.username.toUpperCase(), 'senha-errada')).resolves.toBeNull();

    const result = await auth.login(user.username.toUpperCase(), 'senha-de-teste');
    expect(result?.user).toEqual({ id: user.id, username: user.username });
    await expect(auth.authenticate(result!.token)).resolves.toEqual(result!.user);

    await auth.logout(result!.token);
    await expect(auth.authenticate(result!.token)).resolves.toBeNull();
    await expect(db.authSession.count({ where: { userId: user.id } })).resolves.toBe(0);
  });

  it('recusa senha em texto puro e usuário fora do formato', async () => {
    await expect(
      db.$executeRaw`INSERT INTO users (username, password_hash) VALUES (${`texto.${suffix}`}, 'minhasenha123')`
    ).rejects.toThrow(/users_password_hash_format/);
    await expect(
      db.$executeRaw`INSERT INTO users (username, password_hash) VALUES (${`Maiuscula.${suffix}`}, 'scrypt$x')`
    ).rejects.toThrow(/users_username_format/);
  });

  it('grava o feedback vinculado ao usuário, à conversa e à resposta', async () => {
    const user = await createUser('bia');
    const { session, answer } = await createAnswer(user.id);

    const created = await new FeedbackService(db).create(user.id, {
      messageId: answer.id,
      rating: 10,
      comment: 'Ótima'
    });

    const stored = await db.feedback.findUniqueOrThrow({ where: { id: created.id } });
    expect(stored).toMatchObject({
      userId: user.id,
      sessionId: session.id,
      messageId: answer.id,
      rating: 10,
      comment: 'Ótima'
    });
    expect(stored.createdAt).toBeInstanceOf(Date);
  });

  it('impede duplicidade pela restrição única e responde 409', async () => {
    const user = await createUser('caio');
    const { answer } = await createAnswer(user.id);
    const service = new FeedbackService(db);
    await service.create(user.id, { messageId: answer.id, rating: 5 });

    await expect(
      service.create(user.id, { messageId: answer.id, rating: 6 })
    ).rejects.toMatchObject({
      statusCode: 409
    });
    await expect(db.feedback.count({ where: { messageId: answer.id } })).resolves.toBe(1);
  });

  it('valida no banco a nota e a coerência entre resposta e conversa', async () => {
    const user = await createUser('davi');
    const first = await createAnswer(user.id);
    const second = await createAnswer(user.id);

    for (const rating of [-1, 11]) {
      await expect(
        db.feedback.create({
          data: { userId: user.id, sessionId: first.session.id, messageId: first.answer.id, rating }
        })
      ).rejects.toThrow(/feedback_rating_range/);
    }

    // Resposta da primeira conversa registrada com o identificador da segunda: barrado pela chave composta.
    await expect(
      db.feedback.create({
        data: {
          userId: user.id,
          sessionId: second.session.id,
          messageId: first.answer.id,
          rating: 7
        }
      })
    ).rejects.toThrow(/feedback_message_id_session_id_fkey/);
  });

  it('não apaga em cascata uma conversa que já tem avaliações', async () => {
    const user = await createUser('eva');
    const { session, answer } = await createAnswer(user.id);
    await new FeedbackService(db).create(user.id, { messageId: answer.id, rating: 3 });

    await expect(db.chatSession.delete({ where: { id: session.id } })).rejects.toThrow(/feedback_/);
    await expect(db.feedback.count({ where: { sessionId: session.id } })).resolves.toBe(1);
  });
});
