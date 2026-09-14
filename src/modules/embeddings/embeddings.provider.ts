import { openAIConfig } from '../../config/openai';

export interface EmbeddingsProvider {
  embed(text: string): Promise<number[]>;
}

const EMBEDDING_DIMENSIONS = 1536;

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hashToken(token: string) {
  let hash = 2166136261;
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export class DeterministicEmbeddingsProvider implements EmbeddingsProvider {
  async embed(text: string): Promise<number[]> {
    const vector = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
    const tokens = normalizeText(text)
      .split(' ')
      .filter((token) => token.length > 2);

    for (const token of tokens) {
      const index = hashToken(token) % EMBEDDING_DIMENSIONS;
      vector[index] += 1;
    }

    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
    return vector.map((value) => Number((value / norm).toFixed(8)));
  }
}

export class OpenAIEmbeddingsProvider implements EmbeddingsProvider {
  async embed(text: string): Promise<number[]> {
    if (!openAIConfig.apiKey) {
      throw new Error('OPENAI_API_KEY nao configurada.');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAIConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: openAIConfig.embeddingModel,
        input: text
      })
    });

    if (!response.ok) {
      throw new Error(`Falha ao gerar embedding na OpenAI: ${response.status}`);
    }

    const payload = (await response.json()) as { data: Array<{ embedding: number[] }> };
    return payload.data[0].embedding;
  }
}

export function createEmbeddingsProvider(): EmbeddingsProvider {
  if (openAIConfig.enabled && process.env.NODE_ENV !== 'test') {
    return new OpenAIEmbeddingsProvider();
  }

  return new DeterministicEmbeddingsProvider();
}
