import { EmbeddingsProvider, createEmbeddingsProvider } from './embeddings.provider';

export class EmbeddingsService {
  constructor(private readonly provider: EmbeddingsProvider = createEmbeddingsProvider()) {}

  get modelId() {
    return this.provider.modelId;
  }

  get semantic() {
    return this.provider.semantic;
  }

  embed(text: string) {
    return this.provider.embed(text);
  }

  embedMany(texts: string[]) {
    return this.provider.embedMany(texts);
  }
}
