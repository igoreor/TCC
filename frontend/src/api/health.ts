import { apiClient } from './client'
import type { HealthStatus } from './types'

export function getHealth() {
  return apiClient.get<HealthStatus>('/health')
}
