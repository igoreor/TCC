import type { AuthUser } from '../modules/auth/auth.service';

declare global {
  namespace Express {
    interface Request {
      /** Preenchido pelo middleware `requireAuth` a partir do cookie de sessão. */
      authUser?: AuthUser;
    }
  }
}

export {};
