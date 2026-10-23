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
  // pergunta do domínio sem categoria específica ("Quando devo encaminhar o paciente?")
  | 'general'
  | 'out_of_scope';

/** Metadados do documento de origem, como constam do manifesto. */
export interface DocumentInfo {
  documentId: string;
  title: string;
  shortTitle: string | null;
  institution: string | null;
  publicationYear: number | null;
  edition: string | null;
  isbn: string | null;
  language: string | null;
  jurisdiction: string | null;
  documentType: string | null;
  status: string;
  officialUrl: string | null;
  downloadUrl: string | null;
  notes: string | null;
}

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
  chunkIndex?: number | null;
  sectionPath?: string[];
  /** Páginas no arquivo PDF (link #page) e números impressos (citação). */
  pageStart?: number | null;
  pageEnd?: number | null;
  pageLabelStart?: string | null;
  pageLabelEnd?: string | null;
  document?: DocumentInfo;
  vectorScore?: number;
  keywordScore?: number;
  /** Pontuação de fusão por posição recíproca (RRF) entre as listas de busca. */
  fusionScore?: number;
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

/**
 * Fonte de uma resposta. O trecho (`chunk_id`) continua identificado, mas a interface exibe a
 * referência documental: instituição, título, ano, seção e página.
 */
export interface SourceCitation {
  /** Número usado no texto da resposta ([1], [2]...). */
  index: number;
  chunk_id: string;
  document_id: string;
  /** Seção mais específica do trecho. */
  title: string;
  section: string;
  section_path: string[];
  source_page: number | null;
  /** Páginas impressas ("44–45"); nulo quando o documento não tem numeração confiável. */
  page_label: string | null;
  /** Páginas do arquivo PDF ocupadas pelo trecho (o link abre na primeira). */
  pdf_page: number | null;
  pdf_page_end: number | null;
  document: {
    title: string;
    short_title: string | null;
    institution: string | null;
    year: number | null;
    edition: string | null;
    isbn: string | null;
    language: string | null;
    jurisdiction: string | null;
    document_type: string | null;
    status: string;
    official_url: string | null;
    notes: string | null;
  } | null;
  /** Link para o PDF na página do trecho, quando há arquivo de origem. */
  url: string | null;
  /** Referência em texto corrido, pronta para copiar. */
  reference: string;
  /** Texto do trecho, para conferência. */
  excerpt: string;
  /**
   * Verificação automática de que o trecho sustenta ao menos uma frase que o cita: verdadeiro,
   * falso, ou nulo quando a fonte não foi citada no texto (respostas recusadas).
   */
  verified: boolean | null;
}
