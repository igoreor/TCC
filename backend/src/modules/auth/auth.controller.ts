import { Router } from 'express';
import { AppError } from '../../shared/errors';
import { loginSchema } from '../knowledge/schemas';
import { AuthService, normalizeUsername } from './auth.service';
import { LoginRateLimiter } from './login-rate-limiter';
import { readSessionToken, SESSION_COOKIE, sessionCookieOptions } from './session-cookie';

export function createAuthRouter(service: AuthService, limiter: LoginRateLimiter) {
  const router = Router();

  // Respostas de autenticação nunca devem ser reaproveitadas de cache.
  router.use((_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });

  router.post('/login', async (request, response, next) => {
    try {
      const input = loginSchema.parse(request.body);
      const attemptKey = `${request.ip ?? 'desconhecido'}|${normalizeUsername(input.username)}`;

      const attempt = limiter.check(attemptKey);
      if (!attempt.allowed) {
        response.setHeader('Retry-After', String(attempt.retryAfterSeconds));
        throw new AppError(
          'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
          429
        );
      }

      const result = await service.login(input.username, input.password);
      if (!result) {
        limiter.registerFailure(attemptKey);
        throw new AppError('Usuário ou senha inválidos.', 401);
      }

      limiter.reset(attemptKey);
      response.cookie(SESSION_COOKIE, result.token, sessionCookieOptions(result.expiresAt));
      response.json({ user: result.user });
    } catch (error) {
      next(error);
    }
  });

  router.post('/logout', async (request, response, next) => {
    try {
      await service.logout(readSessionToken(request));
      response.clearCookie(SESSION_COOKIE, sessionCookieOptions());
      response.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  router.get('/me', async (request, response, next) => {
    try {
      const user = await service.authenticate(readSessionToken(request));
      if (!user) throw new AppError('Não autenticado.', 401);
      response.json({ user });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
