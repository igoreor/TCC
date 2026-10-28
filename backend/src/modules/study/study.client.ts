import { env } from '../../config/env';
import { AppError } from '../../shared/errors';
import type { StudyCompareInput } from './study.schemas';

export interface StudyClientOptions {
  baseUrl: string;
  token?: string;
  timeoutMs: number;
  enabled: boolean;
  fetchImpl?: typeof fetch;
}

// Códigos do serviço repassados ao navegador; os demais viram 502 (falha do serviço, não do pedido).
const FORWARDED_STATUS = new Set([400, 404, 409]);

/**
 * Cliente do serviço local do estudo de expansão de consultas (`software/rag-study`, comando
 * `serve`), do TCC do Nathan. O serviço roda o mesmo pipeline do experimento e lê os lotes já
 * registrados; o NexoHansen só exibe as respostas. Fica fora do banco e da trilha de auditoria.
 */
export class StudyClient {
  constructor(private readonly options: StudyClientOptions) {}

  get enabled() {
    return this.options.enabled && Boolean(this.options.baseUrl);
  }

  status() {
    return this.request('GET', '/health');
  }

  listResults() {
    return this.request('GET', '/results');
  }

  getResult(experimentId: string, batchId: string) {
    return this.request('GET', `/results/${encodeURIComponent(experimentId)}/${encodeURIComponent(batchId)}`);
  }

  compare(input: StudyCompareInput) {
    return this.request('POST', '/compare', input);
  }

  private async request(method: 'GET' | 'POST', path: string, body?: unknown): Promise<unknown> {
    if (!this.enabled) {
      throw new AppError(
        'O estudo de expansão só funciona na instância local, com o serviço rag-study serve (STUDY_SERVICE_URL).',
        503
      );
    }

    const fetchImpl = this.options.fetchImpl ?? fetch;
    let response: Response;
    try {
      response = await fetchImpl(`${this.options.baseUrl.replace(/\/+$/, '')}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.options.token ? { 'X-Study-Token': this.options.token } : {})
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(this.options.timeoutMs)
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new AppError('O serviço do estudo demorou demais para responder.', 504);
      }
      throw new AppError('Não foi possível conectar ao serviço do estudo. Verifique se o rag-study serve está rodando.', 502);
    }

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    if (!response.ok) {
      throw new AppError(
        payload?.message ?? `O serviço do estudo respondeu HTTP ${response.status}.`,
        FORWARDED_STATUS.has(response.status) ? response.status : 502
      );
    }
    return payload;
  }
}

export function createStudyClient() {
  return new StudyClient({
    baseUrl: env.STUDY_SERVICE_URL,
    token: env.STUDY_SERVICE_TOKEN,
    timeoutMs: env.STUDY_SERVICE_TIMEOUT_MS,
    // A comparação ao vivo usa as assinaturas pessoais do autor: nunca na instância publicada.
    enabled: env.NODE_ENV !== 'production'
  });
}
