import { apiClient } from './client'
import type { FeedbackInput, FeedbackResult } from './types'

export function sendFeedback(input: FeedbackInput) {
  return apiClient.post<FeedbackResult>('/api/feedback', input)
}
