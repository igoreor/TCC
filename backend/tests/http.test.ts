import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import { AuthService } from '../src/modules/auth/auth.service';
import { LoginRateLimiter } from '../src/modules/auth/login-rate-limiter';
import { hashPassword } from '../src/modules/auth/password';
import { FeedbackService } from '../src/modules/feedback/feedback.service';
import { createInMemoryDb } from './support/in-memory-db';

const ANA_ID = 'aaaaaaaa-0000-4000-8000-000000000001';

let server: Server;
let baseUrl: string;
let store: ReturnType<typeof createInMemoryDb>;
const chatService = { ask: vi.fn() };

function startServer() {
  store = createInMemoryDb();
  const services = {
    authService: new AuthService(store.db, { sessionTtlHours: 8 }),
    loginRateLimiter: new LoginRateLimiter({ maxAttempts: 3, windowMs: 60_000 }),
    feedbackService: new FeedbackService(store.db),
    chatService,
    knowledgeRepository: { listDocuments: async () => [] }
  };
  const app = createApp(services as any);

  return new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
      resolve();
    });
  });
}

function call(path: string, options: { method?: string; body?: unknown; cookie?: string } = {}) {
  return fetch(`${baseUrl}${path}`, {
    method: options.method ?? (options.body === undefined ? 'GET' : 'POST'),
    headers: {
      'Content-Type': 'application/json',
      ...(options.cookie ? { Cookie: options.cookie } : {})
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
}

async function login(username = 'ana', password = 'senha-da-ana') {
  const response = await call('/api/auth/login', { body: { username, password } });
  const setCookie = response.headers.get('set-cookie') ?? '';
  return { response, setCookie, cookie: setCookie.split(';')[0] };
}

beforeAll(async () => {
  await startServer();
  store.data.users.push({
    id: ANA_ID,
    username: 'ana',
    passwordHash: await hashPassword('senha-da-ana', { N: 2 ** 10, r: 8, p: 1 }),
    active: true
  });
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

beforeEach(() => {
  chatService.ask.mockReset();
  chatService.ask.mockResolvedValue({
    sessionId: 's-1',
    messageId: 'm-1',
    answer: 'Resposta.',
    sources: []
  });
});

describe('rotas protegidas', () => {
  it('bloqueiam o acesso sem sessão', async () => {
    for (const [path, body] of [
      ['/api/chat/ask', { question: 'O que é hanseníase?' }],
      ['/api/feedback', { messageId: ANA_ID, rating: 5 }],
      ['/api/documents', undefined]
    ] as const) {
      const response = await call(path, { body });
      expect(response.status, path).toBe(401);
      expect(await response.json()).toEqual({ message: 'Autenticação necessária.' });
    }
    expect(chatService.ask).not.toHaveBeenCalled();
  });

  it('não aceitam um cookie inventado', async () => {
    const response = await call('/api/chat/ask', {
      body: { question: 'O que é hanseníase?' },
      cookie: 'nexohansen_sessao=token-inventado'
    });

    expect(response.status).toBe(401);
    expect(chatService.ask).not.toHaveBeenCalled();
  });
});

describe('login', () => {
  it('recusa credenciais inválidas com mensagem genérica e sem cookie', async () => {
    for (const [username, password] of [
      ['ana', 'senha-errada'],
      ['ninguem', 'senha-da-ana']
    ]) {
      const response = await call('/api/auth/login', { body: { username, password } });
      expect(response.status).toBe(401);
      expect(await response.json()).toMatchObject({ message: 'Usuário ou senha inválidos.' });
      expect(response.headers.get('set-cookie')).toBeNull();
    }
  });

  it('abre a sessão em cookie HttpOnly sem expor hash nem token no corpo', async () => {
    const { response, setCookie } = await login();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ user: { id: ANA_ID, username: 'ana' } });
    expect(setCookie).toMatch(/^nexohansen_sessao=[\w-]{40,};/);
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Lax');
    expect(setCookie).toContain('Path=/');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('informa o usuário da sessão atual', async () => {
    const { cookie } = await login();

    const response = await call('/api/auth/me', { cookie });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ user: { id: ANA_ID, username: 'ana' } });
    expect((await call('/api/auth/me')).status).toBe(401);
  });

  it('limita tentativas seguidas com senha errada', async () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await call('/api/auth/login', { body: { username: 'limite', password: 'errada' } });
    }

    const response = await call('/api/auth/login', {
      body: { username: 'limite', password: 'errada' }
    });

    expect(response.status).toBe(429);
    expect(Number(response.headers.get('retry-after'))).toBeGreaterThan(0);
  });
});

describe('logout', () => {
  it('encerra a sessão no servidor e apaga o cookie', async () => {
    const { cookie } = await login();

    const response = await call('/api/auth/logout', { method: 'POST', cookie });

    expect(response.status).toBe(204);
    expect(response.headers.get('set-cookie')).toMatch(
      /nexohansen_sessao=;.*Expires=Thu, 01 Jan 1970/
    );
    expect((await call('/api/auth/me', { cookie })).status).toBe(401);
    expect(
      (await call('/api/chat/ask', { body: { question: 'O que é hanseníase?' }, cookie })).status
    ).toBe(401);
  });
});

describe('chat autenticado', () => {
  it('usa o usuário da sessão e ignora um userId enviado pelo cliente', async () => {
    const { cookie } = await login();

    const response = await call('/api/chat/ask', {
      body: { question: 'O que é hanseníase?', userId: 'outro-usuario' },
      cookie
    });

    expect(response.status).toBe(200);
    expect(chatService.ask).toHaveBeenCalledWith(expect.objectContaining({ userId: ANA_ID }));
  });
});

describe('feedback autenticado', () => {
  it('registra nota com e sem comentário, vinculada ao usuário da sessão', async () => {
    const { cookie } = await login();
    const first = store.addConversation(ANA_ID);
    const second = store.addConversation(ANA_ID);

    const withComment = await call('/api/feedback', {
      body: {
        messageId: first.answer.id,
        rating: 9,
        comment: 'Clara e com fontes.',
        userId: 'outro-usuario'
      },
      cookie
    });
    const withoutComment = await call('/api/feedback', {
      body: { messageId: second.answer.id, rating: 3 },
      cookie
    });

    expect(withComment.status).toBe(201);
    expect(await withComment.json()).toMatchObject({
      messageId: first.answer.id,
      sessionId: first.session.id,
      rating: 9,
      comment: 'Clara e com fontes.'
    });
    expect(withoutComment.status).toBe(201);
    expect(store.data.feedback.map((item) => [item.userId, item.messageId, item.comment])).toEqual([
      [ANA_ID, first.answer.id, 'Clara e com fontes.'],
      [ANA_ID, second.answer.id, null]
    ]);
  });

  it('rejeita notas fora de 0 a 10 com erro de validação', async () => {
    const { cookie } = await login();
    const { answer } = store.addConversation(ANA_ID);

    for (const rating of [-1, 11, 4.5]) {
      const response = await call('/api/feedback', {
        body: { messageId: answer.id, rating },
        cookie
      });
      expect(response.status, String(rating)).toBe(400);
    }
    expect(store.data.feedback.some((item) => item.messageId === answer.id)).toBe(false);
  });

  it('responde 409 a uma segunda avaliação da mesma resposta', async () => {
    const { cookie } = await login();
    const { answer } = store.addConversation(ANA_ID);
    await call('/api/feedback', { body: { messageId: answer.id, rating: 6 }, cookie });

    const duplicate = await call('/api/feedback', {
      body: { messageId: answer.id, rating: 2 },
      cookie
    });

    expect(duplicate.status).toBe(409);
    expect(await duplicate.json()).toMatchObject({ message: 'Você já avaliou esta resposta.' });
  });

  it('responde 500 com mensagem genérica quando o banco falha ao gravar', async () => {
    const { cookie } = await login();
    const { answer } = store.addConversation(ANA_ID);
    const original = store.db.feedback.create;
    store.db.feedback.create = async () => {
      throw new Error('conexão com o banco perdida');
    };
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      const response = await call('/api/feedback', {
        body: { messageId: answer.id, rating: 5 },
        cookie
      });
      expect(response.status).toBe(500);
      expect(await response.json()).toMatchObject({ message: 'Erro interno do servidor.' });
    } finally {
      store.db.feedback.create = original;
      errorLog.mockRestore();
    }
  });
});
