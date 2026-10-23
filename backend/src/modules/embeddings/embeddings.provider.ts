import { openAIConfig } from '../../config/openai';
import { tokenize } from '../../shared/text';

export interface EmbeddingsProvider {
  /** Identifica o espaço vetorial: vetores de modelos diferentes nunca são comparados. */
  readonly modelId: string;
  /** Verdadeiro quando a similaridade capta sentido, e não só sobreposição de palavras. */
  readonly semantic: boolean;
  embed(text: string): Promise<number[]>;
  embedMany(texts: string[]): Promise<number[][]>;
}

export const EMBEDDING_DIMENSIONS = 1536;
export const DETERMINISTIC_MODEL_ID = 'deterministic-hash-v1';

function hashToken(token: string) {
  let hash = 2166136261;
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

/** Vetor por dispersão de palavras: permite rodar e testar sem serviço externo, sem captar sentido. */
export class DeterministicEmbeddingsProvider implements EmbeddingsProvider {
  readonly modelId = DETERMINISTIC_MODEL_ID;
  readonly semantic = false;

  async embed(text: string): Promise<number[]> {
    const vector = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
    const tokens = tokenize(text).filter((token) => token.length > 2);

    for (const token of tokens) {
      const index = hashToken(token) % EMBEDDING_DIMENSIONS;
      vector[index] += 1;
    }

    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
    return vector.map((value) => Number((value / norm).toFixed(8)));
  }

  async embedMany(texts: string[]) {
    return Promise.all(texts.map((text) => this.embed(text)));
  }
}

// Limite seguro de entradas por requisição à API de embeddings.
const OPENAI_BATCH_SIZE = 96;

export class OpenAIEmbeddingsProvider implements EmbeddingsProvider {
  readonly modelId = openAIConfig.embeddingModel;
  readonly semantic = true;

  async embed(text: string): Promise<number[]> {
    const [embedding] = await this.request([text]);
    return embedding;
  }

  async embedMany(texts: string[]) {
    const vectors: number[][] = [];
    for (let start = 0; start < texts.length; start += OPENAI_BATCH_SIZE) {
      vectors.push(...(await this.request(texts.slice(start, start + OPENAI_BATCH_SIZE))));
    }
    return vectors;
  }

  private async request(input: string[]) {
    if (!openAIConfig.apiKey) {
      throw new Error('OPENAI_API_KEY nao configurada.');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAIConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: openAIConfig.embeddingModel, input }),
      signal: AbortSignal.timeout(60_000)
    });

    if (!response.ok) {
      throw new Error(`Falha ao gerar embedding na OpenAI: ${response.status}`);
    }

    const payload = (await response.json()) as {
      data: Array<{ index: number; embedding: number[] }>;
    };
    return [...payload.data].sort((a, b) => a.index - b.index).map((item) => item.embedding);
  }
}

export function createEmbeddingsProvider(): EmbeddingsProvider {
  if (openAIConfig.enabled && process.env.NODE_ENV !== 'test') {
    return new OpenAIEmbeddingsProvider();
  }

  return new DeterministicEmbeddingsProvider();
}
