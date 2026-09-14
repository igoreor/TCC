import { env } from '../../config/env';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { KnowledgeRepository } from '../knowledge/knowledge.repository';
import { ChunkDTO, RetrievalMode, SearchFilters } from '../../shared/types';

export class HybridSearchService {
  constructor(
    private readonly repository: KnowledgeRepository,
    private readonly embeddingsService: EmbeddingsService
  ) {}

  async search(input: {
    question: string;
    filters?: SearchFilters;
    mode?: RetrievalMode;
    topK?: number;
  }): Promise<ChunkDTO[]> {
    const mode = input.mode ?? 'hybrid';
    const topK = input.topK ?? env.DEFAULT_TOP_K;
    const filters = input.filters ?? {};

    const [vectorResults, textResults] = await Promise.all([
      mode === 'text'
        ? Promise.resolve<ChunkDTO[]>([])
        : this.embeddingsService.embed(input.question).then((embedding) => this.repository.vectorSearch(embedding, filters, topK)),
      mode === 'vector' ? Promise.resolve<ChunkDTO[]>([]) : this.repository.textSearch(input.question, filters, topK)
    ]);

    const byChunkId = new Map<string, ChunkDTO>();

    for (const chunk of vectorResults) {
      byChunkId.set(chunk.chunkId, {
        ...chunk,
        vectorScore: chunk.vectorScore ?? 0,
        keywordScore: 0
      });
    }

    for (const chunk of textResults) {
      const existing = byChunkId.get(chunk.chunkId);
      byChunkId.set(chunk.chunkId, {
        ...(existing ?? chunk),
        keywordScore: Math.max(existing?.keywordScore ?? 0, chunk.keywordScore ?? 0),
        vectorScore: existing?.vectorScore ?? chunk.vectorScore ?? 0
      });
    }

    return [...byChunkId.values()]
      .map((chunk) => {
        const vectorScore = chunk.vectorScore ?? 0;
        const keywordScore = chunk.keywordScore ?? 0;
        const finalScore =
          mode === 'vector'
            ? vectorScore
            : mode === 'text'
              ? keywordScore
              : vectorScore * 0.65 + keywordScore * 0.35;

        return {
          ...chunk,
          vectorScore,
          keywordScore,
          finalScore: Number(finalScore.toFixed(4))
        };
      })
      .sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0))
      .slice(0, topK);
  }
}
