import { EmbeddingsProvider, createEmbeddingsProvider } from './embeddings.provider';

export class EmbeddingsService {
  constructor(private readonly provider: EmbeddingsProvider = createEmbeddingsProvider()) {}

  embed(text: string) {
    return this.provider.embed(text);
  }
}
