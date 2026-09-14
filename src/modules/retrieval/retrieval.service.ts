import { env } from '../../config/env';
import { ChunkDTO, ClinicalRiskLevel, IntentCategory, RetrievalMode, SearchFilters } from '../../shared/types';
import { ClinicalRiskService } from './clinical-risk.service';
import { HybridSearchService } from './hybrid-search.service';
import { IntentClassifierService } from './intent-classifier.service';
import { RerankingService } from './reranking.service';

export class RetrievalService {
  constructor(
    private readonly hybridSearch: HybridSearchService,
    private readonly intentClassifier: IntentClassifierService,
    private readonly riskService: ClinicalRiskService,
    private readonly rerankingService: RerankingService
  ) {}

  async retrieve(input: {
    question: string;
    filters?: SearchFilters;
    mode?: RetrievalMode;
    topK?: number;
    topN?: number;
    applyMinScore?: boolean;
  }): Promise<{
    intent: IntentCategory;
    riskLevel: ClinicalRiskLevel;
    chunks: ChunkDTO[];
    rawChunks: ChunkDTO[];
  }> {
    const intent = this.intentClassifier.classify(input.question);

    if (intent === 'out_of_scope') {
      return {
        intent,
        riskLevel: this.riskService.detectClinicalRisk(input.question, [], intent),
        chunks: [],
        rawChunks: []
      };
    }

    const rawChunks = await this.hybridSearch.search({
      question: input.question,
      filters: input.filters,
      mode: input.mode,
      topK: input.topK
    });

    const riskLevel = this.riskService.detectClinicalRisk(input.question, rawChunks, intent);
    const reranked = this.rerankingService.rerank(rawChunks, {
      question: input.question,
      intent,
      riskLevel
    });

    const minScore = input.applyMinScore === false ? 0 : env.MIN_RETRIEVAL_SCORE;
    const enoughScore =
      reranked.length > 0 && (reranked[0].finalScore ?? 0) >= Math.min(minScore, intent === 'screening' ? 0.45 : minScore);

    return {
      intent,
      riskLevel,
      rawChunks,
      chunks: enoughScore ? reranked.slice(0, input.topN ?? env.DEFAULT_TOP_N) : []
    };
  }
}
