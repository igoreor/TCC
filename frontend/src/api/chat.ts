import { apiClient } from './client'
import type { ChatAskResult, SearchFilters, UserType } from './types'

export interface AskChatInput {
  question: string
  userType: UserType
  sessionId?: string
  filters?: SearchFilters
}

export function askChat(input: AskChatInput) {
  return apiClient.post<ChatAskResult>('/api/chat/ask', input)
}
