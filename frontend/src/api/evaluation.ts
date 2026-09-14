import { apiClient } from './client'
import type { EvaluationQuestion, EvaluationRunResult, EvaluationSeedResult } from './types'

export function seedEvaluation() {
  return apiClient.post<EvaluationSeedResult>('/api/evaluation/seed')
}

export function listEvaluationQuestions() {
  return apiClient.get<EvaluationQuestion[]>('/api/evaluation/questions')
}

export function runEvaluation() {
  return apiClient.post<EvaluationRunResult>('/api/evaluation/run')
}
