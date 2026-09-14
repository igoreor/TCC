import { apiClient } from './client'
import type { DocumentDTO } from './types'

export function listDocuments() {
  return apiClient.get<DocumentDTO[]>('/api/documents')
}
