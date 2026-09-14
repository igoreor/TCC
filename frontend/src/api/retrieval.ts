import { apiClient } from './client'
import type { RetrievalMode, RetrievalSearchResult, SearchFilters } from './types'

export interface RetrievalSearchInput {
  question: string
  mode?: RetrievalMode
  topK?: number
  topN?: number
  filters?: SearchFilters
}

export function searchRetrieval(input: RetrievalSearchInput) {
  return apiClient.post<RetrievalSearchResult>('/api/retrieval/search', input)
}
