export type UserType = 'Profissional de saúde' | 'Paciente' | 'Desenvolvedor';

export type ClinicalRiskLevel = 'Baixo' | 'Médio' | 'Alto' | 'Muito alto';

export type RetrievalMode = 'vector' | 'text' | 'hybrid';

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
  | 'out_of_scope';

export interface ChunkDTO {
  id?: string;
  chunkId: string;
  documentId: string;
  title: string;
  section: string;
  subsection?: string | null;
  content: string;
  sourcePage?: number | null;
  sourceReference?: string | null;
  clinicalPhase: string;
  informationType: string;
  targetUser: string;
  targetDemographic: string;
  clinicalCriticality: string;
  diseaseClassification: string;
  medicationRelated: boolean;
  dosageRelated: boolean;
  contraindicationRelated: boolean;
  examRelated: boolean;
  diagnosisRelated: boolean;
  reactionRelated: boolean;
  safetyLevel: string;
  answerPolicy: string;
  keywords: string[];
  entities: string[];
  metadata: Record<string, unknown>;
  vectorScore?: number;
  keywordScore?: number;
  finalScore?: number;
}

export interface SearchFilters {
  documentId?: string;
  clinicalPhase?: string;
  informationType?: string;
  targetDemographic?: string;
  clinicalCriticality?: string;
  diseaseClassification?: string;
  medicationRelated?: boolean;
  diagnosisRelated?: boolean;
  reactionRelated?: boolean;
  examRelated?: boolean;
  safetyLevel?: string;
}

export interface SourceCitation {
  chunk_id: string;
  document_id: string;
  title: string;
  section: string;
  source_page: number | null;
}
