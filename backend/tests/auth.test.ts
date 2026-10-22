import { describe, expect, it } from 'vitest';
import { AuthService, hashSessionToken } from '../src/modules/auth/auth.service';
import { LoginRateLimiter } from '../src/modules/auth/login-rate-limiter';
import { hashPassword, verifyPassword } from '../src/modules/auth/password';
import { createInMemoryDb } from './support/in-memory-db';

// Parâmetros leves só para acelerar os testes; a verificação lê os parâmetros do próprio hash.
const FAST = { N: 2 ** 10, r: 8, p: 1 };

async function setup(options: { now?: () => Date } = {}) {
  const store = createInMemoryDb();
  store.data.users.push(
    {
      id: 'u-ana',
      username: 'ana.souza',
      passwordHash: await hashPassword('senha-correta', FAST),
      active: true
    },
    {
      id: 'u-bia',
      username: 'bia',
      passwordHash: await hashPassword('outra-senha', FAST),
      active: false
    }
  );
  const service = new AuthService(store.db, { sessionTtlHours: 8, now: options.now });
  return { ...store, service };
}

describe('hash de senha', () => {
  it('gera hash scrypt com sal e confere apenas a senha correta', async () => {
    const hash = await hashPassword('minha senha', FAST);

    expect(hash).toMatch(/^scrypt\$N=1024,r=8,p=1\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
    expect(hash).not.toContain('minha senha');
    await expect(verifyPassword('minha senha', hash)).resolves.toBe(true);
    await expect(verifyPassword('minha senhA', hash)).resolves.toBe(false);
  });

  it('usa sal aleatório: a mesma senha gera hashes diferentes', async () => {
    expect(await hashPassword('repetida', FAST)).not.toBe(await hashPassword('repetida', FAST));
  });

  it('rejeita hash malformado, texto puro ou com parâmetros fora dos limites', async () => {
    await expect(verifyPassword('senha', 'senha')).resolves.toBe(false);
    await expect(verifyPassword('senha', 'scrypt$N=1024,r=8,p=1$')).resolves.toBe(false);
    await expect(verifyPassword('senha', 'scrypt$N=999999999,r=8,p=1$c2Fs$aGFzaA==')).resolves.toBe(
      false
    );
  });
});

describe('login e sessão', () => {
  it('autentica credenciais válidas e guarda apenas o hash do token', async () => {
    const { service, data } = await setup();

    const result = await service.login('  Ana.Souza ', 'senha-correta');

    expect(result?.user).toEqual({ id: 'u-ana', username: 'ana.souza' });
    expect(result?.token.length).toBeGreaterThanOrEqual(40);
    expect(data.authSessions).toHaveLength(1);
    expect(data.authSessions[0].tokenHash).toBe(hashSessionToken(result!.token));
    expect(data.authSessions[0].tokenHash).not.toBe(result!.token);
  });

  it('recusa senha errada, usuário inexistente e usuário desativado', async () => {
    const { service, data } = await setup();

    await expect(service.login('ana.souza', 'senha-errada')).resolves.toBeNull();
    await expect(service.login('inexistente', 'senha-correta')).resolves.toBeNull();
    await expect(service.login('bia', 'outra-senha')).resolves.toBeNull();
    expect(data.authSessions).toHaveLength(0);
  });

  it('reconhece a sessão pelo token e a encerra no logout', async () => {
    const { service } = await setup();
    const { token } = (await service.login('ana.souza', 'senha-correta'))!;

    await expect(service.authenticate(token)).resolves.toEqual({
      id: 'u-ana',
      username: 'ana.souza'
    });
    await service.logout(token);
    await expect(service.authenticate(token)).resolves.toBeNull();
    await expect(service.authenticate(undefined)).resolves.toBeNull();
    await expect(service.authenticate('token-inventado')).resolves.toBeNull();
  });

  it('expira a sessão após o prazo e remove o registro', async () => {
    let now = new Date('2026-10-22T10:00:00Z');
    const { service, data } = await setup({ now: () => now });
    const { token } = (await service.login('ana.souza', 'senha-correta'))!;

    now = new Date('2026-10-22T17:59:00Z');
    await expect(service.authenticate(token)).resolves.not.toBeNull();

    now = new Date('2026-10-22T18:00:00Z');
    await expect(service.authenticate(token)).resolves.toBeNull();
    expect(data.authSessions).toHaveLength(0);
  });

  it('deixa de aceitar a sessão de um usuário desativado', async () => {
    const { service, data } = await setup();
    const { token } = (await service.login('ana.souza', 'senha-correta'))!;

    data.users[0].active = false;

    await expect(service.authenticate(token)).resolves.toBeNull();
  });
});

describe('limite de tentativas de login', () => {
  it('bloqueia após o número máximo de falhas e libera ao fim da janela', () => {
    let now = 0;
    const limiter = new LoginRateLimiter({ maxAttempts: 3, windowMs: 60_000, now: () => now });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect(limiter.check('ip|ana').allowed).toBe(true);
      limiter.registerFailure('ip|ana');
    }

    expect(limiter.check('ip|ana')).toEqual({ allowed: false, retryAfterSeconds: 60 });
    expect(limiter.check('ip|bia').allowed).toBe(true);

    now = 60_000;
    expect(limiter.check('ip|ana').allowed).toBe(true);
  });

  it('zera a contagem após um login bem-sucedido', () => {
    const limiter = new LoginRateLimiter({ maxAttempts: 2, windowMs: 60_000 });
    limiter.registerFailure('ip|ana');
    limiter.reset('ip|ana');
    limiter.registerFailure('ip|ana');

    expect(limiter.check('ip|ana').allowed).toBe(true);
  });
});
