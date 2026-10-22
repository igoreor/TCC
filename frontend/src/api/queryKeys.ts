import type { ChunkListParams } from './chunks'

export const queryKeys = {
  currentUser: ['auth', 'current-user'] as const,
  health: ['health'] as const,
  documents: ['documents'] as const,
  chunks: (params: ChunkListParams) => ['chunks', params] as const,
  chunk: (chunkId: string) => ['chunk', chunkId] as const,
  evaluationQuestions: ['evaluation-questions'] as const,
}
