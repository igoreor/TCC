export type UserType = 'Profissional de saúde' | 'Paciente' | 'Desenvolvedor'

export type ClinicalRiskLevel = 'Baixo' | 'Médio' | 'Alto' | 'Muito alto'

export type RetrievalMode = 'vector' | 'text' | 'hybrid'

export type IntentCategory =
  | 'screening'
  | 'diagnosis'
  | 'classification'
  | 'exam'
  | 'treatment'
  | 'medication'
  | 'reaction'
  | 'disability_prevention'
  | 'contacts_surveillance'
  | 'psychosocial'
  | 'safety'
  | 'out_of_scope'

export interface ChunkDTO {
  id?: string
  chunkId: string
  documentId: string
  title: string
  section: string
  subsection?: string | null
  content: string
  sourcePage?: number | null
  sourceReference?: string | null
  clinicalPhase: string
  informationType: string
  targetUser: string
  targetDemographic: string
  clinicalCriticality: string
  diseaseClassification: string
  medicationRelated: boolean
  dosageRelated: boolean
  contraindicationRelated: boolean
  examRelated: boolean
  diagnosisRelated: boolean
  reactionRelated: boolean
  safetyLevel: string
  answerPolicy: string
  keywords: string[]
  entities: string[]
  metadata: Record<string, unknown>
  vectorScore?: number
  keywordScore?: number
  finalScore?: number
}

export interface SearchFilters {
  documentId?: string
  clinicalPhase?: string
  informationType?: string
  targetDemographic?: string
  clinicalCriticality?: string
  diseaseClassification?: string
  medicationRelated?: boolean
  diagnosisRelated?: boolean
  reactionRelated?: boolean
  examRelated?: boolean
  safetyLevel?: string
}

export interface SourceCitation {
  chunk_id: string
  document_id: string
  title: string
  section: string
  source_page: number | null
}

export interface DocumentDTO {
  id: string
  documentId: string
  title: string
  description: string | null
  sourceType: string | null
  sourceName: string | null
  version: string | null
  createdAt: string
  updatedAt: string
  _count: { chunks: number }
}

export interface HealthStatus {
  api: string
  database: 'ok' | 'error' | 'unknown'
  vectorStore: 'ok' | 'error' | 'unknown' | 'missing'
}

export interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedChunks {
  items: ChunkDTO[]
  pagination: PaginationInfo
}

export interface SeedResult {
  inserted: number
  updated: number
  total: number
}

export interface RetrievalSearchResult {
  intent: IntentCategory
  riskLevel: ClinicalRiskLevel
  chunks: ChunkDTO[]
}

export interface SafetyInfo {
  riskLevel: ClinicalRiskLevel
  fallbackTriggered: boolean
  requiresProfessionalEvaluation: boolean
  disclaimer: string
  reason?: string
}

export interface ChatAskResult {
  sessionId: string
  messageId: string
  answer: string
  sources: SourceCitation[]
  safety: SafetyInfo
  retrieval: {
    intent: IntentCategory
    chunks: Array<{ chunk_id: string; score: number }>
  }
}

export interface EvaluationQuestion {
  id: string
  question: string
  expectedAnswer: string
  idealChunks: string[]
  riskLevel: ClinicalRiskLevel
  correctnessCriteria: string
  criticalErrors: string
  createdAt: string
}

export interface EvaluationSeedResult {
  created: number
  total: number
}

export interface EvaluationRunResultItem {
  question: string
  matchedIdealChunk: boolean
  returnedChunks: string[]
  fallbackTriggered: boolean
  riskLevel: ClinicalRiskLevel
}

export interface EvaluationRunResult {
  total: number
  matchedIdealChunkCount: number
  idealChunkRecallApproximation: number
  fallbackCount: number
  results: EvaluationRunResultItem[]
}

export interface FeedbackInput {
  messageId?: string
  rating: number
  comment?: string
  reviewedBySpecialist?: boolean
}

export interface FeedbackResult {
  id: string
  messageId: string | null
  rating: number
  comment: string | null
  reviewedBySpecialist: boolean
  createdAt: string
}
