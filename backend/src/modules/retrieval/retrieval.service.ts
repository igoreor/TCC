import { env } from '../../config/env';
import { contentWords } from '../../shared/text';
import {
  ChunkDTO,
  ClinicalRiskLevel,
  IntentCategory,
  RetrievalMode,
  SearchFilters
} from '../../shared/types';
import { ClinicalRiskService } from './clinical-risk.service';
import { HybridSearchService } from './hybrid-search.service';
import { IntentClassifierService } from './intent-classifier.service';
import {
  ConversationTurn,
  QueryAnalysis,
  QueryAnalyzerService,
  glossaryExpansions
} from './query-analyzer.service';

export interface RetrievalResult {
  analysis: QueryAnalysis;
  intent: IntentCategory;
  riskLevel: ClinicalRiskLevel;
  /** Trechos selecionados para a resposta. */
  chunks: ChunkDTO[];
  /** Todos os candidatos da fusão, para inspeção. */
  rawChunks: ChunkDTO[];
  /** Há ao menos um trecho com similaridade ou correspondência textual suficiente. */
  hasEvidence: boolean;
  bestVectorScore: number;
  bestKeywordScore: number;
  /** A primeira busca não bastou e uma segunda, mais ampla, foi feita. */
  broadened: boolean;
}

// Pontuação textual (ts_rank_cd normalizado) mínima para contar como evidência sem apoio vetorial.
const MIN_KEYWORD_EVIDENCE = 0.1;

export class RetrievalService {
  constructor(
    private readonly hybridSearch: HybridSearchService,
    private readonly intentClassifier: IntentClassifierService,
    private readonly riskService: ClinicalRiskService,
    private readonly queryAnalyzer: QueryAnalyzerService
  ) {}

  /** Similaridade mínima conforme o provedor: as escalas de cosseno diferem bastante entre eles. */
  get minVectorSimilarity() {
    return env.MIN_VECTOR_SIMILARITY ?? (this.hybridSearch.semanticEmbeddings ? 0.25 : 0.08);
  }

  async retrieve(input: {
    question: string;
    history?: ConversationTurn[];
    filters?: SearchFilters;
    mode?: RetrievalMode;
    topK?: number;
    topN?: number;
    /** Falso no explorador do painel: devolve os candidatos mesmo sem evidência suficiente. */
    applyMinScore?: boolean;
  }): Promise<RetrievalResult> {
    const analysis = await this.queryAnalyzer.analyze(input.question, input.history ?? []);
    const intent = analysis.inDomain
      ? this.intentClassifier.classify(analysis.standaloneQuestion)
      : 'out_of_scope';
    const riskLevel = this.riskService.detectClinicalRisk(analysis.standaloneQuestion, intent);
    const empty = {
      analysis,
      intent,
      riskLevel,
      chunks: [],
      rawChunks: [],
      hasEvidence: false,
      bestVectorScore: 0,
      bestKeywordScore: 0,
      broadened: false
    };

    if (!analysis.inDomain && input.applyMinScore !== false) return empty;

    const search = (queries: string[], lexicalTerms: string[]) =>
      this.hybridSearch.search({
        queries,
        lexicalTerms,
        filters: input.filters,
        mode: input.mode,
        topK: input.topK
      });

    let result = await search(analysis.searchQueries, analysis.lexicalTerms);
    let hasEvidence = this.hasEvidence(result.bestVectorScore, result.bestKeywordScore);
    let broadened = false;

    // Antes de concluir que a base não trata do assunto, uma busca mais ampla: só as palavras de
    // conteúdo da pergunta, com siglas e sinônimos expandidos.
    if (!hasEvidence && input.applyMinScore !== false) {
      const words = contentWords(analysis.standaloneQuestion).join(' ');
      const expansions = glossaryExpansions(analysis.standaloneQuestion);
      const broad = await search(
        [`${words} ${expansions.join(' ')} hanseníase`.trim()],
        [...analysis.lexicalTerms, ...contentWords(expansions.join(' '))]
      );
      broadened = true;
      if (broad.candidates.length) {
        result = {
          candidates: [
            ...result.candidates,
            ...broad.candidates.filter(
              (chunk) => !result.candidates.some((other) => other.chunkId === chunk.chunkId)
            )
          ],
          bestVectorScore: Math.max(result.bestVectorScore, broad.bestVectorScore),
          bestKeywordScore: Math.max(result.bestKeywordScore, broad.bestKeywordScore)
        };
        hasEvidence = this.hasEvidence(result.bestVectorScore, result.bestKeywordScore);
      }
    }

    const topN = input.topN ?? env.DEFAULT_TOP_N;
    // Fora do contexto ficam os candidatos sem apoio de nenhum dos dois lados.
    const supported = result.candidates.filter(
      (chunk) =>
        (chunk.vectorScore ?? 0) >= this.minVectorSimilarity * 0.8 ||
        (chunk.keywordScore ?? 0) >= MIN_KEYWORD_EVIDENCE / 2
    );
    const selected =
      input.applyMinScore === false
        ? result.candidates.slice(0, topN)
        : hasEvidence
          ? supported.slice(0, topN)
          : [];

    return {
      analysis,
      intent,
      riskLevel,
      chunks: selected,
      rawChunks: result.candidates,
      hasEvidence,
      bestVectorScore: result.bestVectorScore,
      bestKeywordScore: result.bestKeywordScore,
      broadened
    };
  }

  private hasEvidence(bestVectorScore: number, bestKeywordScore: number) {
    return bestVectorScore >= this.minVectorSimilarity || bestKeywordScore >= MIN_KEYWORD_EVIDENCE;
  }
}
