import { apiClient } from './client'
import type { SeedResult } from './types'

export function seedKnowledgeBase() {
  return apiClient.post<SeedResult>('/api/knowledge/seed')
}
