interface LimiterOptions {
  maxAttempts: number;
  windowMs: number;
  now?: () => number;
}

interface AttemptWindow {
  count: number;
  startedAt: number;
}

/**
 * Limita tentativas de login malsucedidas por chave (IP + usuário), em memória.
 * Suficiente para uma única instância da API; com várias instâncias, o estado precisaria ser
 * compartilhado (por exemplo, no banco ou em um cache).
 */
export class LoginRateLimiter {
  private readonly attempts = new Map<string, AttemptWindow>();

  constructor(
    private readonly options: LimiterOptions = { maxAttempts: 5, windowMs: 15 * 60 * 1000 }
  ) {}

  check(key: string): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
    const window = this.current(key);
    if (!window || window.count < this.options.maxAttempts) return { allowed: true };
    const remainingMs = window.startedAt + this.options.windowMs - this.now();
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(remainingMs / 1000)) };
  }

  registerFailure(key: string) {
    const window = this.current(key);
    if (window) {
      window.count += 1;
    } else {
      this.prune();
      this.attempts.set(key, { count: 1, startedAt: this.now() });
    }
  }

  reset(key: string) {
    this.attempts.delete(key);
  }

  private current(key: string) {
    const window = this.attempts.get(key);
    if (window && this.now() - window.startedAt >= this.options.windowMs) {
      this.attempts.delete(key);
      return undefined;
    }
    return window;
  }

  private prune() {
    const now = this.now();
    for (const [key, window] of this.attempts) {
      if (now - window.startedAt >= this.options.windowMs) this.attempts.delete(key);
    }
  }

  private now() {
    return this.options.now ? this.options.now() : Date.now();
  }
}
