import { env } from '../../config/env';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { KnowledgeRepository } from '../knowledge/knowledge.repository';
import { ChunkDTO, RetrievalMode, SearchFilters } from '../../shared/types';

// Busca híbrida com fusão por posição recíproca (RRF; Cormack, Clarke e Büttcher, 2009). Cada
// consulta gera uma lista vetorial, e os termos geram uma lista textual. A fusão usa a posição de
// cada trecho nas listas, e não a pontuação bruta: similaridade de cosseno e ts_rank_cd estão em
// escalas diferentes, e somá-las com pesos fixos deixava o resultado dependente do provedor.

const RRF_K = 60;

export interface HybridSearchResult {
  candidates: ChunkDTO[];
  bestVectorScore: number;
  bestKeywordScore: number;
}

/** Fusão RRF de listas ordenadas; o peso multiplica a contribuição de cada lista. */
export function reciprocalRankFusion(lists: Array<{ items: ChunkDTO[]; weight: number }>) {
  const fused = new Map<string, ChunkDTO>();
  for (const { items, weight } of lists) {
    items.forEach((chunk, rank) => {
      const contribution = weight / (RRF_K + rank + 1);
      const current = fused.get(chunk.chunkId);
      fused.set(chunk.chunkId, {
        ...(current ?? chunk),
        vectorScore: Math.max(current?.vectorScore ?? 0, chunk.vectorScore ?? 0),
        keywordScore: Math.max(current?.keywordScore ?? 0, chunk.keywordScore ?? 0),
        fusionScore: (current?.fusionScore ?? 0) + contribution
      });
    });
  }

  const ranked = [...fused.values()].sort((a, b) => (b.fusionScore ?? 0) - (a.fusionScore ?? 0));
  const top = ranked[0]?.fusionScore ?? 1;
  // pontuação final relativa ao primeiro colocado (0 a 1), para exibição no painel
  return ranked.map((chunk) => ({
    ...chunk,
    finalScore: Number(((chunk.fusionScore ?? 0) / top).toFixed(4))
  }));
}

export class HybridSearchService {
  constructor(
    private readonly repository: KnowledgeRepository,
    private readonly embeddingsService: EmbeddingsService
  ) {}

  get embeddingModel() {
    return this.embeddingsService.modelId;
  }

  get semanticEmbeddings() {
    return this.embeddingsService.semantic;
  }

  async search(input: {
    queries: string[];
    lexicalTerms: string[];
    filters?: SearchFilters;
    mode?: RetrievalMode;
    topK?: number;
  }): Promise<HybridSearchResult> {
    const mode = input.mode ?? 'hybrid';
    const topK = input.topK ?? env.DEFAULT_TOP_K;
    const filters = input.filters ?? {};
    const queries = input.queries.filter((query) => query.trim());

    const vectorLists =
      mode === 'text' || !queries.length
        ? []
        : await this.embeddingsService
            .embedMany(queries)
            .then((embeddings) =>
              Promise.all(
                embeddings.map((embedding) =>
                  this.repository.vectorSearch(
                    embedding,
                    filters,
                    topK,
                    this.embeddingsService.modelId
                  )
                )
              )
            );
    const textList =
      mode === 'vector' ? [] : await this.repository.textSearch(input.lexicalTerms, filters, topK);

    // A lista textual pesa como metade das listas vetoriais somadas (no mínimo, como uma delas):
    // várias reformulações da mesma pergunta não devem abafar a correspondência exata de termos.
    const textWeight = Math.max(1, vectorLists.length * 0.5);
    const candidates = reciprocalRankFusion([
      ...vectorLists.map((items) => ({ items, weight: 1 })),
      { items: textList, weight: textWeight }
    ]);

    return {
      candidates,
      bestVectorScore: Math.max(0, ...vectorLists.flat().map((chunk) => chunk.vectorScore ?? 0)),
      bestKeywordScore: Math.max(0, ...textList.map((chunk) => chunk.keywordScore ?? 0))
    };
  }
}
