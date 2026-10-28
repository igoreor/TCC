import { createServer, type IncomingHttpHeaders, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { AuthService } from '../src/modules/auth/auth.service';
import { LoginRateLimiter } from '../src/modules/auth/login-rate-limiter';
import { hashPassword } from '../src/modules/auth/password';
import { StudyClient } from '../src/modules/study/study.client';
import { createInMemoryDb } from './support/in-memory-db';

// Dublê do serviço `rag-study serve`: guarda o último pedido e responde o que o teste definir.
interface HarnessCall {
  method?: string;
  url?: string;
  headers: IncomingHttpHeaders;
  body: string;
}

let harness: Server;
let harnessUrl: string;
let lastCall: HarnessCall | null;
let reply: { status: number; body: unknown };

let app: Server;
let baseUrl: string;
let cookie: string;
let store: ReturnType<typeof createInMemoryDb>;
let studyClient: StudyClient;

function listen(server: Server) {
  return new Promise<string>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(`http://127.0.0.1:${(server.address() as AddressInfo).port}`));
  });
}

function call(path: string, body?: unknown, withCookie = true) {
  return fetch(`${baseUrl}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(withCookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

beforeAll(async () => {
  harness = createServer((request, response) => {
    let body = '';
    request.on('data', (chunk) => (body += chunk));
    request.on('end', () => {
      lastCall = { method: request.method, url: request.url, headers: request.headers, body };
      response.writeHead(reply.status, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(reply.body));
    });
  });
  harnessUrl = await listen(harness);

  store = createInMemoryDb();
  studyClient = new StudyClient({ baseUrl: `${harnessUrl}/`, token: 'segredo', timeoutMs: 5_000, enabled: true });
  const services = {
    authService: new AuthService(store.db, { sessionTtlHours: 8 }),
    loginRateLimiter: new LoginRateLimiter({ maxAttempts: 3, windowMs: 60_000 }),
    studyClient
  };
  app = createApp(services as any).listen(0, '127.0.0.1');
  await new Promise((resolve) => app.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${(app.address() as AddressInfo).port}`;

  store.data.users.push({
    id: 'aaaaaaaa-0000-4000-8000-000000000009',
    username: 'nathan',
    passwordHash: await hashPassword('senha-do-nathan', { N: 2 ** 10, r: 8, p: 1 }),
    active: true
  });
  const login = await call('/api/auth/login', { username: 'nathan', password: 'senha-do-nathan' }, false);
  cookie = (login.headers.get('set-cookie') ?? '').split(';')[0];
});

afterAll(async () => {
  await new Promise<void>((resolve) => app.close(() => resolve()));
  await new Promise<void>((resolve) => harness.close(() => resolve()));
});

beforeEach(() => {
  lastCall = null;
  reply = { status: 200, body: { ok: true } };
});

describe('rotas do estudo de expansão', () => {
  it('exigem login', async () => {
    expect((await call('/api/study/status', undefined, false)).status).toBe(401);
    expect((await call('/api/study/compare', { question: 'Teste?' }, false)).status).toBe(401);
    expect(lastCall).toBeNull();
  });

  it('repassam a comparação ao serviço local com o token e sem Origin', async () => {
    reply = { status: 200, body: { question: 'Quem faz o qPCR?', results: [{ condition: 'R0' }] } };
    const response = await call('/api/study/compare', {
      question: '  Quem faz o qPCR?  ',
      arm: 'anthropic',
      conditions: ['D', 'R0']
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(reply.body);
    expect(lastCall?.method).toBe('POST');
    expect(lastCall?.url).toBe('/compare');
    expect(lastCall?.headers['x-study-token']).toBe('segredo');
    expect(lastCall?.headers.origin).toBeUndefined();
    expect(JSON.parse(lastCall?.body ?? '')).toEqual({
      question: 'Quem faz o qPCR?',
      arm: 'anthropic',
      conditions: ['D', 'R0']
    });
  });

  it('validam o pedido antes de chamar o serviço', async () => {
    for (const body of [
      { question: 'Pergunta válida?', arm: 'gemini', conditions: ['D'] },
      { question: 'Pergunta válida?', arm: 'openai', conditions: [] },
      { question: 'Pergunta válida?', arm: 'openai', conditions: ['R9'] },
      { question: 'x', arm: 'openai', conditions: ['D'] }
    ]) {
      expect((await call('/api/study/compare', body)).status).toBe(400);
    }
    expect((await call('/api/study/results/lote%2F..%2Fsegredo/x')).status).toBe(400);
    expect(lastCall).toBeNull();
  });

  it('repassam os resultados registrados e os erros do pedido', async () => {
    reply = { status: 200, body: { batches: [] } };
    expect(await (await call('/api/study/results')).json()).toEqual({ batches: [] });

    reply = { status: 200, body: { questions: [] } };
    await call('/api/study/results/e2-cli-smoke-gpt/20261023T131207Z');
    expect(lastCall?.url).toBe('/results/e2-cli-smoke-gpt/20261023T131207Z');

    reply = { status: 409, body: { message: 'outra comparação ainda está em andamento' } };
    const busy = await call('/api/study/compare', { question: 'Pergunta?', arm: 'openai', conditions: ['D'] });
    expect(busy.status).toBe(409);
    expect((await busy.json()).message).toBe('outra comparação ainda está em andamento');

    reply = { status: 500, body: { message: 'falha interna' } };
    expect((await call('/api/study/results')).status).toBe(502);
  });

  it('informam a indisponibilidade pelo status', async () => {
    reply = { status: 200, body: { dry_run: true } };
    expect(await (await call('/api/study/status')).json()).toEqual({ available: true, service: { dry_run: true } });

    const down = new StudyClient({ baseUrl: 'http://127.0.0.1:9', timeoutMs: 2_000, enabled: true });
    const off = new StudyClient({ baseUrl: harnessUrl, timeoutMs: 2_000, enabled: false });
    expect(off.enabled).toBe(false);
    await expect(off.status()).rejects.toMatchObject({ statusCode: 503 });
    await expect(down.status()).rejects.toMatchObject({ statusCode: 502 });
  });
});
