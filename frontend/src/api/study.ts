import { apiClient } from './client'

// Estudo de expansão de consultas (TCC do Nathan). Os dados vêm do harness `software/rag-study`
// pelo backend (/api/study); os nomes dos campos seguem os registros do harness.

export type StudyConditionCode = 'D' | 'R0' | 'R1' | 'R2' | 'R3'
export type StudyArm = 'openai' | 'anthropic'

export interface StudySource {
  rank: number
  chunk_id: string
  document_id: string | null
  score: number | null
  section: string
  page_start: number | null
  page_end: number | null
  excerpt: string | null
}

export interface StudyConditionResult {
  condition: StudyConditionCode
  label: string
  provider: string | null
  model: string | null
  returned_model: string | null
  status: string
  error: string | null
  answer: string | null
  retrieval_query: string | null
  expansion_status: string | null
  latency_ms: number | null
  output_tokens: number | null
  sources: StudySource[]
  repetition?: number
}

export interface StudyServiceStatus {
  experiment_id: string
  dry_run: boolean
  corpus_dir: string
  corpus_snapshot_sha256: string
  k: number
  arms: Array<{ arm: StudyArm; provider: string; model: string }>
  conditions: Array<{ code: StudyConditionCode; label: string }>
}

export type StudyStatus = { available: true; service: StudyServiceStatus } | { available: false; reason: string }

export interface StudyBatchSummary {
  id: string
  experiment_id: string
  batch_id: string
  label: string
  note: string
  status: string | null
  dry_run: boolean | null
  corpus_dir: string | null
  conditions: string[] | null
  models: Record<string, string>
  n_questions: number | null
  n_records: number | null
}

export interface StudyQuestionResults {
  question_id: string
  question: string
  results: StudyConditionResult[]
}

export interface StudyBatchDetail {
  batch: StudyBatchSummary
  questions: StudyQuestionResults[]
}

export interface StudyCompareInput {
  question: string
  arm: StudyArm
  conditions: StudyConditionCode[]
}

export interface StudyCompareResult {
  question_id: string
  question: string
  arm: StudyArm
  provider: string
  model: string
  dry_run: boolean
  log: string
  results: StudyConditionResult[]
}

export const studyKeys = {
  status: ['study', 'status'] as const,
  results: ['study', 'results'] as const,
  result: (batchId: string) => ['study', 'result', batchId] as const,
}

export function getStudyStatus() {
  return apiClient.get<StudyStatus>('/api/study/status')
}

export function listStudyResults() {
  return apiClient.get<{ batches: StudyBatchSummary[] }>('/api/study/results')
}

/** `id` no formato `experimento/lote`, como devolvido em `listStudyResults`. */
export function getStudyResult(id: string) {
  const path = id.split('/').map(encodeURIComponent).join('/')
  return apiClient.get<StudyBatchDetail>(`/api/study/results/${path}`)
}

export function compareStudy(input: StudyCompareInput) {
  return apiClient.post<StudyCompareResult>('/api/study/compare', input)
}
