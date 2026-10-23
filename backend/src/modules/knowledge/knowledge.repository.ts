import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../../config/database';
import { ChunkDTO, DocumentInfo, SearchFilters } from '../../shared/types';

type PrismaLike = PrismaClient;

const filterColumns: Record<keyof SearchFilters, string> = {
  documentId: 'document_id',
  clinicalPhase: 'clinical_phase',
  informationType: 'information_type',
  targetDemographic: 'target_demographic',
  clinicalCriticality: 'clinical_criticality',
  diseaseClassification: 'disease_classification',
  medicationRelated: 'medication_related',
  diagnosisRelated: 'diagnosis_related',
  reactionRelated: 'reaction_related',
  examRelated: 'exam_related',
  safetyLevel: 'safety_level'
};

// Colunas devolvidas pelas buscas: o trecho e os metadados do documento de origem. A coluna do
// vetor fica de fora — o Prisma não converte o tipo `vector` em consultas diretas.
const SEARCH_COLUMNS = `
  c.id, c.chunk_id, c.document_id, c.title, c.section, c.subsection, c.content, c.source_page,
  c.source_reference, c.clinical_phase, c.information_type, c.target_user, c.target_demographic,
  c.clinical_criticality, c.disease_classification, c.medication_related, c.dosage_related,
  c.contraindication_related, c.exam_related, c.diagnosis_related, c.reaction_related,
  c.safety_level, c.answer_policy, c.keywords, c.entities, c.metadata, c.chunk_index,
  c.section_path, c.page_start, c.page_end, c.page_label_start, c.page_label_end,
  d.title AS doc_title, d.short_title AS doc_short_title, d.institution AS doc_institution,
  d.publication_year AS doc_publication_year, d.edition AS doc_edition, d.isbn AS doc_isbn,
  d.language AS doc_language, d.jurisdiction AS doc_jurisdiction, d.document_type AS doc_document_type,
  d.status AS doc_status, d.official_url AS doc_official_url, d.download_url AS doc_download_url,
  d.notes AS doc_notes`;

export interface UpsertChunkInput extends ChunkDTO {
  /** Ausente quando o texto não mudou: o embedding gravado é mantido. */
  embedding?: number[];
  embeddingModel?: string;
  contentHash?: string;
  searchText?: string;
}

export interface UpsertDocumentInput {
  documentId: string;
  title: string;
  description?: string;
  sourceType?: string;
  sourceName?: string;
  version?: string;
  shortTitle?: string;
  institution?: string;
  authorship?: string;
  publicationYear?: number;
  edition?: string;
  isbn?: string;
  language?: string;
  jurisdiction?: string;
  documentType?: string;
  status?: string;
  active?: boolean;
  officialUrl?: string;
  downloadUrl?: string;
  fileSha256?: string;
  pageCount?: number;
  license?: string;
  notes?: string;
  ingestedAt?: Date;
}

/** Termos da consulta textual reduzidos a letras e algarismos, unidos por OU. */
export function toOrTsQuery(terms: string[]) {
  const words = [
    ...new Set(terms.flatMap((term) => term.toLowerCase().split(/[^a-z0-9]+/)))
  ].filter((word) => word.length >= 2);
  return words.join(' | ');
}

export class KnowledgeRepository {
  constructor(private readonly db: PrismaLike = prisma) {}

  async upsertDocument(input: UpsertDocumentInput) {
    const { documentId, ...data } = input;
    return this.db.document.upsert({
      where: { documentId },
      create: input,
      update: data
    });
  }

  async listDocuments() {
    return this.db.document.findMany({
      orderBy: [{ active: 'desc' }, { documentId: 'asc' }],
      include: { _count: { select: { chunks: true } } }
    });
  }

  /** Trechos por modelo de embedding, para identificar documentos indexados com outro provedor. */
  async countChunksByEmbeddingModel() {
    const rows: Array<{ document_id: string; embedding_model: string | null; total: number }> =
      await this.db.$queryRawUnsafe(
        `SELECT document_id, embedding_model, count(*)::int AS total FROM chunks GROUP BY document_id, embedding_model`
      );
    return rows;
  }

  async findChunkHashes(documentId: string) {
    const rows = await this.db.chunk.findMany({
      where: { documentId },
      select: { chunkId: true, contentHash: true, embeddingModel: true }
    });
    return new Map(rows.map((row) => [row.chunkId, row]));
  }

  /** Remove trechos de um documento que deixaram de existir na nova versão processada. */
  async deleteChunksNotIn(documentId: string, chunkIds: string[]) {
    const result = await this.db.chunk.deleteMany({
      where: { documentId, chunkId: { notIn: chunkIds } }
    });
    return result.count;
  }

  async createIngestionRun(input: {
    documentId: string;
    embeddingModel: string;
    fileSha256?: string;
  }) {
    return this.db.ingestionRun.create({
      data: { id: randomUUID(), status: 'em_andamento', ...input }
    });
  }

  async finishIngestionRun(
    id: string,
    result: {
      status: 'concluida' | 'falhou';
      chunksTotal?: number;
      chunksEmbedded?: number;
      chunksUnchanged?: number;
      chunksRemoved?: number;
      error?: string;
    }
  ) {
    return this.db.ingestionRun.update({
      where: { id },
      data: { ...result, finishedAt: new Date() }
    });
  }

  async upsertChunk(input: UpsertChunkInput) {
    const embeddingLiteral = input.embedding ? `[${input.embedding.join(',')}]` : null;
    const id = input.id ?? randomUUID();

    await this.db.$executeRawUnsafe(
      `
      INSERT INTO chunks (
        id, chunk_id, document_id, title, section, subsection, content, source_page,
        source_reference, clinical_phase, information_type, target_user, target_demographic,
        clinical_criticality, disease_classification, medication_related, dosage_related,
        contraindication_related, exam_related, diagnosis_related, reaction_related, safety_level,
        answer_policy, keywords, entities, metadata, embedding, chunk_index, section_path, page_start,
        page_end, page_label_start, page_label_end, content_hash, embedding_model, search_text,
        created_at, updated_at
      )
      VALUES (
        $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
        $24::jsonb, $25::jsonb, $26::jsonb, $27::vector, $28, $29::jsonb, $30, $31, $32, $33, $34, $35, $36,
        now(), now()
      )
      ON CONFLICT (chunk_id) DO UPDATE SET
        document_id = EXCLUDED.document_id,
        title = EXCLUDED.title,
        section = EXCLUDED.section,
        subsection = EXCLUDED.subsection,
        content = EXCLUDED.content,
        source_page = EXCLUDED.source_page,
        source_reference = EXCLUDED.source_reference,
        clinical_phase = EXCLUDED.clinical_phase,
        information_type = EXCLUDED.information_type,
        target_user = EXCLUDED.target_user,
        target_demographic = EXCLUDED.target_demographic,
        clinical_criticality = EXCLUDED.clinical_criticality,
        disease_classification = EXCLUDED.disease_classification,
        medication_related = EXCLUDED.medication_related,
        dosage_related = EXCLUDED.dosage_related,
        contraindication_related = EXCLUDED.contraindication_related,
        exam_related = EXCLUDED.exam_related,
        diagnosis_related = EXCLUDED.diagnosis_related,
        reaction_related = EXCLUDED.reaction_related,
        safety_level = EXCLUDED.safety_level,
        answer_policy = EXCLUDED.answer_policy,
        keywords = EXCLUDED.keywords,
        entities = EXCLUDED.entities,
        metadata = EXCLUDED.metadata,
        embedding = COALESCE(EXCLUDED.embedding, chunks.embedding),
        chunk_index = EXCLUDED.chunk_index,
        section_path = EXCLUDED.section_path,
        page_start = EXCLUDED.page_start,
        page_end = EXCLUDED.page_end,
        page_label_start = EXCLUDED.page_label_start,
        page_label_end = EXCLUDED.page_label_end,
        content_hash = EXCLUDED.content_hash,
        embedding_model = COALESCE(EXCLUDED.embedding_model, chunks.embedding_model),
        search_text = EXCLUDED.search_text,
        updated_at = now()
      `,
      id,
      input.chunkId,
      input.documentId,
      input.title,
      input.section,
      input.subsection ?? null,
      input.content,
      input.sourcePage ?? null,
      input.sourceReference ?? null,
      input.clinicalPhase,
      input.informationType,
      input.targetUser,
      input.targetDemographic,
      input.clinicalCriticality,
      input.diseaseClassification,
      input.medicationRelated,
      input.dosageRelated,
      input.contraindicationRelated,
      input.examRelated,
      input.diagnosisRelated,
      input.reactionRelated,
      input.safetyLevel,
      input.answerPolicy,
      JSON.stringify(input.keywords),
      JSON.stringify(input.entities),
      JSON.stringify(input.metadata),
      embeddingLiteral,
      input.chunkIndex ?? null,
      JSON.stringify(input.sectionPath ?? []),
      input.pageStart ?? null,
      input.pageEnd ?? null,
      input.pageLabelStart ?? null,
      input.pageLabelEnd ?? null,
      input.contentHash ?? null,
      input.embedding ? (input.embeddingModel ?? null) : null,
      input.searchText ?? null
    );
  }

  async findChunks(filters: SearchFilters = {}, skip = 0, take = 20): Promise<ChunkDTO[]> {
    const where = this.toPrismaWhere(filters);
    const rows: any[] = await this.db.chunk.findMany({
      where,
      skip,
      take,
      orderBy: [{ documentId: 'asc' }, { chunkIndex: 'asc' }, { chunkId: 'asc' }],
      include: { document: true }
    });

    return rows.map((row) => this.mapPrismaChunk(row));
  }

  async countChunks(filters: SearchFilters = {}) {
    return this.db.chunk.count({ where: this.toPrismaWhere(filters) });
  }

  async findChunkByChunkId(chunkId: string): Promise<ChunkDTO | null> {
    const row = await this.db.chunk.findUnique({ where: { chunkId }, include: { document: true } });
    return row ? this.mapPrismaChunk(row) : null;
  }

  /**
   * Busca vetorial por distância de cosseno. Só considera documentos ativos e vetores gerados pelo
   * mesmo modelo da pergunta: comparar espaços vetoriais diferentes não tem significado.
   */
  async vectorSearch(
    embedding: number[],
    filters: SearchFilters,
    limit: number,
    embeddingModel: string
  ): Promise<ChunkDTO[]> {
    const { whereSql, values } = this.toSqlWhere(filters, 3);
    const embeddingLiteral = `[${embedding.join(',')}]`;

    const rows: any[] = await this.db.$queryRawUnsafe(
      `
      SELECT ${SEARCH_COLUMNS},
        GREATEST(0, 1 - (c.embedding <=> $1::vector)) AS "vectorScore"
      FROM chunks c
      JOIN documents d ON d.document_id = c.document_id
      WHERE c.embedding IS NOT NULL AND d.active AND c.embedding_model = $2 ${whereSql}
      ORDER BY c.embedding <=> $1::vector
      LIMIT ${Math.max(1, Math.min(limit, 100))}
      `,
      embeddingLiteral,
      embeddingModel,
      ...values
    );

    return rows.map((row) => this.mapSqlChunk(row, Number(row.vectorScore ?? 0), 0));
  }

  /**
   * Busca textual sobre o texto sem acentos, com os termos unidos por OU: um trecho que contém só
   * parte dos termos também é encontrado, e a ordem favorece quem reúne mais deles.
   */
  async textSearch(terms: string[], filters: SearchFilters, limit: number): Promise<ChunkDTO[]> {
    const tsQuery = toOrTsQuery(terms);
    if (!tsQuery) return [];
    const { whereSql, values } = this.toSqlWhere(filters, 2);

    const rows: any[] = await this.db.$queryRawUnsafe(
      `
      WITH query AS (SELECT to_tsquery('portuguese', $1) AS q)
      SELECT ${SEARCH_COLUMNS},
        ts_rank_cd(to_tsvector('portuguese', coalesce(c.search_text, '')), query.q, 32) AS "keywordScore"
      FROM chunks c
      JOIN documents d ON d.document_id = c.document_id, query
      WHERE d.active AND to_tsvector('portuguese', coalesce(c.search_text, '')) @@ query.q ${whereSql}
      ORDER BY "keywordScore" DESC, c.chunk_id ASC
      LIMIT ${Math.max(1, Math.min(limit, 100))}
      `,
      tsQuery,
      ...values
    );

    return rows.map((row) => this.mapSqlChunk(row, 0, Number(row.keywordScore ?? 0)));
  }

  /** Mensagens mais recentes da conversa, em ordem cronológica, para interpretar continuações. */
  async findRecentMessages(sessionId: string, limit = 6) {
    const rows = await this.db.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { role: true, content: true }
    });
    return rows.reverse() as Array<{ role: 'user' | 'assistant'; content: string }>;
  }

  async createRetrievalLog(input: {
    sessionId?: string | null;
    question: string;
    retrievedChunks: unknown;
    filters: unknown;
    scores: unknown;
    finalAnswer: string;
    fallbackTriggered: boolean;
    riskLevel: string;
  }) {
    return this.db.retrievalLog.create({
      data: {
        sessionId: input.sessionId ?? null,
        question: input.question,
        retrievedChunks: input.retrievedChunks as any,
        filters: input.filters as any,
        scores: input.scores as any,
        finalAnswer: input.finalAnswer,
        fallbackTriggered: input.fallbackTriggered,
        riskLevel: input.riskLevel
      }
    });
  }

  /** Reaproveita a conversa só quando ela pertence ao usuário; caso contrário, abre uma nova. */
  async ensureSession(sessionId: string | undefined, userType: string, userId: string) {
    if (sessionId) {
      const existing = await this.db.chatSession.findFirst({ where: { id: sessionId, userId } });
      if (existing) return { ...existing, reused: true };
    }

    const created = await this.db.chatSession.create({ data: { userType, userId } });
    return { ...created, reused: false };
  }

  async createChatMessage(input: {
    sessionId: string;
    role: 'user' | 'assistant';
    content: string;
  }) {
    return this.db.chatMessage.create({
      data: {
        sessionId: input.sessionId,
        role: input.role,
        content: input.content
      }
    });
  }

  private toPrismaWhere(filters: SearchFilters) {
    return {
      ...(filters.documentId ? { documentId: filters.documentId } : {}),
      ...(filters.clinicalPhase ? { clinicalPhase: filters.clinicalPhase } : {}),
      ...(filters.informationType ? { informationType: filters.informationType } : {}),
      ...(filters.targetDemographic ? { targetDemographic: filters.targetDemographic } : {}),
      ...(filters.clinicalCriticality ? { clinicalCriticality: filters.clinicalCriticality } : {}),
      ...(filters.diseaseClassification
        ? { diseaseClassification: filters.diseaseClassification }
        : {}),
      ...(typeof filters.medicationRelated === 'boolean'
        ? { medicationRelated: filters.medicationRelated }
        : {}),
      ...(typeof filters.diagnosisRelated === 'boolean'
        ? { diagnosisRelated: filters.diagnosisRelated }
        : {}),
      ...(typeof filters.reactionRelated === 'boolean'
        ? { reactionRelated: filters.reactionRelated }
        : {}),
      ...(typeof filters.examRelated === 'boolean' ? { examRelated: filters.examRelated } : {}),
      ...(filters.safetyLevel ? { safetyLevel: filters.safetyLevel } : {})
    };
  }

  private toSqlWhere(filters: SearchFilters, startIndex: number) {
    const clauses: string[] = [];
    const values: unknown[] = [];
    let index = startIndex;

    for (const [key, column] of Object.entries(filterColumns) as Array<
      [keyof SearchFilters, string]
    >) {
      const value = filters[key];
      if (value !== undefined) {
        clauses.push(`AND c.${column} = $${index}`);
        values.push(value);
        index += 1;
      }
    }

    return { whereSql: clauses.length ? ` ${clauses.join(' ')}` : '', values };
  }

  private mapDocument(row: any): DocumentInfo | undefined {
    if (!row) return undefined;
    return {
      documentId: row.documentId,
      title: row.title,
      shortTitle: row.shortTitle ?? null,
      institution: row.institution ?? null,
      publicationYear: row.publicationYear ?? null,
      edition: row.edition ?? null,
      isbn: row.isbn ?? null,
      language: row.language ?? null,
      jurisdiction: row.jurisdiction ?? null,
      documentType: row.documentType ?? null,
      status: row.status ?? 'vigente',
      officialUrl: row.officialUrl ?? null,
      downloadUrl: row.downloadUrl ?? null,
      notes: row.notes ?? null
    };
  }

  private mapPrismaChunk(row: any): ChunkDTO {
    return {
      id: row.id,
      chunkId: row.chunkId,
      documentId: row.documentId,
      title: row.title,
      section: row.section,
      subsection: row.subsection,
      content: row.content,
      sourcePage: row.sourcePage,
      sourceReference: row.sourceReference,
      clinicalPhase: row.clinicalPhase,
      informationType: row.informationType,
      targetUser: row.targetUser,
      targetDemographic: row.targetDemographic,
      clinicalCriticality: row.clinicalCriticality,
      diseaseClassification: row.diseaseClassification,
      medicationRelated: row.medicationRelated,
      dosageRelated: row.dosageRelated,
      contraindicationRelated: row.contraindicationRelated,
      examRelated: row.examRelated,
      diagnosisRelated: row.diagnosisRelated,
      reactionRelated: row.reactionRelated,
      safetyLevel: row.safetyLevel,
      answerPolicy: row.answerPolicy,
      keywords: Array.isArray(row.keywords) ? row.keywords : [],
      entities: Array.isArray(row.entities) ? row.entities : [],
      metadata: row.metadata ?? {},
      chunkIndex: row.chunkIndex ?? null,
      sectionPath: Array.isArray(row.sectionPath) ? row.sectionPath : [],
      pageStart: row.pageStart ?? null,
      pageEnd: row.pageEnd ?? null,
      pageLabelStart: row.pageLabelStart ?? null,
      pageLabelEnd: row.pageLabelEnd ?? null,
      document: this.mapDocument(row.document)
    };
  }

  private mapSqlChunk(row: any, vectorScore = 0, keywordScore = 0): ChunkDTO {
    return {
      id: row.id,
      chunkId: row.chunk_id,
      documentId: row.document_id,
      title: row.title,
      section: row.section,
      subsection: row.subsection,
      content: row.content,
      sourcePage: row.source_page,
      sourceReference: row.source_reference,
      clinicalPhase: row.clinical_phase,
      informationType: row.information_type,
      targetUser: row.target_user,
      targetDemographic: row.target_demographic,
      clinicalCriticality: row.clinical_criticality,
      diseaseClassification: row.disease_classification,
      medicationRelated: row.medication_related,
      dosageRelated: row.dosage_related,
      contraindicationRelated: row.contraindication_related,
      examRelated: row.exam_related,
      diagnosisRelated: row.diagnosis_related,
      reactionRelated: row.reaction_related,
      safetyLevel: row.safety_level,
      answerPolicy: row.answer_policy,
      keywords: Array.isArray(row.keywords) ? row.keywords : [],
      entities: Array.isArray(row.entities) ? row.entities : [],
      metadata: row.metadata ?? {},
      chunkIndex: row.chunk_index ?? null,
      sectionPath: Array.isArray(row.section_path) ? row.section_path : [],
      pageStart: row.page_start ?? null,
      pageEnd: row.page_end ?? null,
      pageLabelStart: row.page_label_start ?? null,
      pageLabelEnd: row.page_label_end ?? null,
      document: {
        documentId: row.document_id,
        title: row.doc_title,
        shortTitle: row.doc_short_title ?? null,
        institution: row.doc_institution ?? null,
        publicationYear: row.doc_publication_year ?? null,
        edition: row.doc_edition ?? null,
        isbn: row.doc_isbn ?? null,
        language: row.doc_language ?? null,
        jurisdiction: row.doc_jurisdiction ?? null,
        documentType: row.doc_document_type ?? null,
        status: row.doc_status ?? 'vigente',
        officialUrl: row.doc_official_url ?? null,
        downloadUrl: row.doc_download_url ?? null,
        notes: row.doc_notes ?? null
      },
      vectorScore,
      keywordScore
    };
  }
}
