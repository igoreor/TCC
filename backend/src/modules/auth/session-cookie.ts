import type { CookieOptions, Request } from 'express';
import { env } from '../../config/env';

export const SESSION_COOKIE = 'nexohansen_sessao';

/** HttpOnly: o token não fica acessível a scripts da página. SameSite=Lax: não acompanha POSTs de outros sites. */
export function sessionCookieOptions(expiresAt?: Date): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.AUTH_COOKIE_SECURE,
    path: '/',
    ...(expiresAt ? { expires: expiresAt } : {})
  };
}

export function readSessionToken(request: Request): string | undefined {
  const header = request.headers.cookie;
  if (!header) return undefined;

  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1 || part.slice(0, separator).trim() !== SESSION_COOKIE) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim()) || undefined;
    } catch {
      return undefined;
    }
  }

  return undefined;
}
