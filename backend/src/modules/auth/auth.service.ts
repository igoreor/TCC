import { createHash, randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../../config/database';
import { hashPassword, verifyPassword } from './password';
import { normalizeUsername } from './username';

export { normalizeUsername };

export interface AuthUser {
  id: string;
  username: string;
}

export interface LoginResult {
  user: AuthUser;
  token: string;
  expiresAt: Date;
}

interface AuthServiceOptions {
  sessionTtlHours: number;
  now?: () => Date;
}

/** O banco guarda só o hash do token; quem lê a tabela não consegue usar a sessão. */
export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export class AuthService {
  private dummyHash?: Promise<string>;

  constructor(
    private readonly db: PrismaClient = prisma,
    private readonly options: AuthServiceOptions = { sessionTtlHours: 8 }
  ) {}

  async login(username: string, password: string): Promise<LoginResult | null> {
    const user = await this.db.user.findUnique({
      where: { username: normalizeUsername(username) }
    });

    if (!user) {
      // Mesmo custo de uma verificação real, para não revelar pelo tempo de resposta se o usuário existe.
      await verifyPassword(password, await this.getDummyHash());
      return null;
    }

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword || !user.active) return null;

    const now = this.now();
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(now.getTime() + this.options.sessionTtlHours * 60 * 60 * 1000);

    await this.db.authSession.deleteMany({ where: { userId: user.id, expiresAt: { lte: now } } });
    await this.db.authSession.create({
      data: { userId: user.id, tokenHash: hashSessionToken(token), expiresAt }
    });

    return { user: { id: user.id, username: user.username }, token, expiresAt };
  }

  /** Usuário dono do token, ou `null` se a sessão não existe, expirou ou o usuário foi desativado. */
  async authenticate(token: string | undefined): Promise<AuthUser | null> {
    if (!token) return null;

    const session = await this.db.authSession.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      include: { user: true }
    });
    if (!session) return null;

    if (session.expiresAt <= this.now()) {
      await this.db.authSession.deleteMany({ where: { id: session.id } });
      return null;
    }

    if (!session.user.active) return null;
    return { id: session.user.id, username: session.user.username };
  }

  async logout(token: string | undefined) {
    if (!token) return;
    await this.db.authSession.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
  }

  private now() {
    return this.options.now ? this.options.now() : new Date();
  }

  private getDummyHash() {
    this.dummyHash ??= hashPassword(randomBytes(16).toString('hex'));
    return this.dummyHash;
  }
}
