import { apiClient, buildQuery } from './client'
import type { ChunkDTO, PaginatedChunks, SearchFilters } from './types'

export interface ChunkListParams extends SearchFilters {
  page?: number
  pageSize?: number
}

export function listChunks(params: ChunkListParams) {
  return apiClient.get<PaginatedChunks>(`/api/chunks${buildQuery(params)}`)
}

export function getChunk(chunkId: string) {
  return apiClient.get<ChunkDTO>(`/api/chunks/${encodeURIComponent(chunkId)}`)
}
