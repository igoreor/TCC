import type { ChunkListParams } from './chunks'

export const queryKeys = {
  health: ['health'] as const,
  documents: ['documents'] as const,
  chunks: (params: ChunkListParams) => ['chunks', params] as const,
  chunk: (chunkId: string) => ['chunk', chunkId] as const,
  evaluationQuestions: ['evaluation-questions'] as const,
}
