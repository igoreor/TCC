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
  | 'general'
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

/** Documento de origem de uma fonte, como consta do manifesto da base. */
export interface SourceDocument {
  title: string
  short_title: string | null
  institution: string | null
  year: number | null
  edition: string | null
  isbn: string | null
  language: string | null
  jurisdiction: string | null
  document_type: string | null
  status: string
  official_url: string | null
  notes: string | null
}

/** Fonte de uma resposta: a referência documental, com o trecho para conferência. */
export interface SourceCitation {
  /** Número usado no texto da resposta. */
  index: number
  chunk_id: string
  document_id: string
  /** Seção mais específica do trecho. */
  title: string
  section: string
  section_path: string[]
  source_page: number | null
  /** Páginas impressas ("44–45"), quando o documento tem numeração confiável. */
  page_label: string | null
  pdf_page: number | null
  pdf_page_end: number | null
  document: SourceDocument | null
  /** PDF oficial aberto na página do trecho. */
  url: string | null
  reference: string
  excerpt: string
  /** Verificação automática de que o trecho sustenta a frase que o cita; nulo quando não citado. */
  verified: boolean | null
}

export interface DocumentDTO {
  id: string
  documentId: string
  title: string
  description: string | null
  sourceType: string | null
  sourceName: string | null
  version: string | null
  shortTitle: string | null
  institution: string | null
  publicationYear: number | null
  edition: string | null
  language: string | null
  jurisdiction: string | null
  status: string
  active: boolean
  officialUrl: string | null
  downloadUrl: string | null
  notes: string | null
  ingestedAt: string | null
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
    /** Pergunta interpretada no contexto da conversa. */
    standaloneQuestion?: string
    isFollowUp?: boolean
    searchQueries?: string[]
    broadened?: boolean
    /** O modelo não indicou quais trechos sustentam o texto. */
    citationsMissing?: boolean
    chunks: Array<{ chunk_id: string; score: number; document_id?: string; page_start?: number | null; page_end?: number | null }>
  }
}

export interface EvaluationQuestion {
  id: string
  question: string
  expectedAnswer: string
  /** Referências da evidência esperada (documento e páginas do PDF). */
  idealChunks: string[]
  /** Categoria da pergunta no conjunto de referência. */
  riskLevel: string
  correctnessCriteria: string
  criticalErrors: string
  createdAt: string
}

export interface EvaluationSeedResult {
  created: number
  removed?: number
  total: number
}

export interface EvaluationRunResultItem {
  question: string
  category?: string
  expected?: string
  correctBehaviour?: boolean
  keyFactCoverage?: number | null
  citationPrecision?: number | null
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
  summary?: { overall: Record<string, number | null> }
  results: EvaluationRunResultItem[]
}

export interface FeedbackInput {
  messageId: string
  /** Inteiro de 0 (pior) a 10 (melhor). */
  rating: number
  comment?: string
}

export interface FeedbackResult {
  id: string
  messageId: string
  sessionId: string
  rating: number
  comment: string | null
  createdAt: string
}

export interface AuthUser {
  id: string
  username: string
}

export interface LoginInput {
  username: string
  password: string
}
