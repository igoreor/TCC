import type { Request, RequestHandler } from 'express';
import { AppError } from '../../shared/errors';
import type { AuthService, AuthUser } from './auth.service';
import { readSessionToken, SESSION_COOKIE, sessionCookieOptions } from './session-cookie';

/** Bloqueia a requisição sem sessão válida e expõe o usuário autenticado em `request.authUser`. */
export function requireAuth(authService: AuthService): RequestHandler {
  return async (request, response, next) => {
    try {
      const token = readSessionToken(request);
      const user = await authService.authenticate(token);

      if (!user) {
        if (token) response.clearCookie(SESSION_COOKIE, sessionCookieOptions());
        response.status(401).json({ message: 'Autenticação necessária.' });
        return;
      }

      request.authUser = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/** Usuário identificado pela sessão; nunca por um identificador enviado pelo cliente. */
export function getAuthUser(request: Request): AuthUser {
  if (!request.authUser) throw new AppError('Autenticação necessária.', 401);
  return request.authUser;
}
