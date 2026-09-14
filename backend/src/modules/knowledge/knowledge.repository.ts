import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../../config/database';
import { ChunkDTO, SearchFilters } from '../../shared/types';

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

export interface UpsertChunkInput extends ChunkDTO {
  embedding: number[];
}

export class KnowledgeRepository {
  constructor(private readonly db: PrismaLike = prisma) {}

  async upsertDocument(input: {
    documentId: string;
    title: string;
    description?: string;
    sourceType?: string;
    sourceName?: string;
    version?: string;
  }) {
    return this.db.document.upsert({
      where: { documentId: input.documentId },
      create: input,
      update: {
        title: input.title,
        description: input.description,
        sourceType: input.sourceType,
        sourceName: input.sourceName,
        version: input.version
      }
    });
  }

  async listDocuments() {
    return this.db.document.findMany({
      orderBy: { documentId: 'asc' },
      include: { _count: { select: { chunks: true } } }
    });
  }

  async upsertChunk(input: UpsertChunkInput) {
    const embeddingLiteral = `[${input.embedding.join(',')}]`;
    const id = input.id ?? randomUUID();

    await this.db.$executeRawUnsafe(
      `
      INSERT INTO chunks (
        id, chunk_id, document_id, title, section, subsection, content, source_page,
        source_reference, clinical_phase, information_type, target_user, target_demographic,
        clinical_criticality, disease_classification, medication_related, dosage_related,
        contraindication_related, exam_related, diagnosis_related, reaction_related, safety_level,
        answer_policy, keywords, entities, metadata, embedding, created_at, updated_at
      )
      VALUES (
        $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
        $24::jsonb, $25::jsonb, $26::jsonb, $27::vector, now(), now()
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
        embedding = EXCLUDED.embedding,
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
      embeddingLiteral
    );
  }

  async findChunks(filters: SearchFilters = {}, skip = 0, take = 20): Promise<ChunkDTO[]> {
    const where = this.toPrismaWhere(filters);
    const rows: any[] = await this.db.chunk.findMany({
      where,
      skip,
      take,
      orderBy: { chunkId: 'asc' }
    });

    return rows.map((row) => this.mapPrismaChunk(row));
  }

  async countChunks(filters: SearchFilters = {}) {
    return this.db.chunk.count({ where: this.toPrismaWhere(filters) });
  }

  async findChunkByChunkId(chunkId: string): Promise<ChunkDTO | null> {
    const row = await this.db.chunk.findUnique({ where: { chunkId } });
    return row ? this.mapPrismaChunk(row) : null;
  }

  async vectorSearch(embedding: number[], filters: SearchFilters, limit: number): Promise<ChunkDTO[]> {
    const { whereSql, values } = this.toSqlWhere(filters, 2);
    const embeddingLiteral = `[${embedding.join(',')}]`;

    const rows: any[] = await this.db.$queryRawUnsafe(
      `
      SELECT
        id, chunk_id, document_id, title, section, subsection, content, source_page, source_reference,
        clinical_phase, information_type, target_user, target_demographic, clinical_criticality,
        disease_classification, medication_related, dosage_related, contraindication_related,
        exam_related, diagnosis_related, reaction_related, safety_level, answer_policy,
        keywords, entities, metadata,
        GREATEST(0, 1 - (embedding <=> $1::vector)) AS "vectorScore"
      FROM chunks
      WHERE embedding IS NOT NULL ${whereSql}
      ORDER BY embedding <=> $1::vector
      LIMIT ${Math.max(1, Math.min(limit, 100))}
      `,
      embeddingLiteral,
      ...values
    );

    return rows.map((row) => this.mapSqlChunk(row, Number(row.vectorScore ?? 0), 0));
  }

  async textSearch(question: string, filters: SearchFilters, limit: number): Promise<ChunkDTO[]> {
    const { whereSql, values } = this.toSqlWhere(filters, 2);

    const rows: any[] = await this.db.$queryRawUnsafe(
      `
      WITH query AS (SELECT plainto_tsquery('portuguese', $1) AS q)
      SELECT
        chunks.id, chunks.chunk_id, chunks.document_id, chunks.title, chunks.section, chunks.subsection,
        chunks.content, chunks.source_page, chunks.source_reference, chunks.clinical_phase,
        chunks.information_type, chunks.target_user, chunks.target_demographic, chunks.clinical_criticality,
        chunks.disease_classification, chunks.medication_related, chunks.dosage_related,
        chunks.contraindication_related, chunks.exam_related, chunks.diagnosis_related,
        chunks.reaction_related, chunks.safety_level, chunks.answer_policy,
        chunks.keywords, chunks.entities, chunks.metadata,
        LEAST(
          1,
          ts_rank_cd(
            to_tsvector(
              'portuguese',
              coalesce(title, '') || ' ' ||
              coalesce(section, '') || ' ' ||
              coalesce(subsection, '') || ' ' ||
              coalesce(content, '') || ' ' ||
              coalesce(keywords::text, '') || ' ' ||
              coalesce(entities::text, '')
            ),
            query.q
          ) + CASE WHEN content ILIKE '%' || $1 || '%' THEN 0.25 ELSE 0 END
        ) AS "keywordScore"
      FROM chunks, query
      WHERE (
        to_tsvector(
          'portuguese',
          coalesce(title, '') || ' ' ||
          coalesce(section, '') || ' ' ||
          coalesce(subsection, '') || ' ' ||
          coalesce(content, '') || ' ' ||
          coalesce(keywords::text, '') || ' ' ||
          coalesce(entities::text, '')
        ) @@ query.q
        OR content ILIKE '%' || $1 || '%'
        OR title ILIKE '%' || $1 || '%'
        OR keywords::text ILIKE '%' || $1 || '%'
      )
      ${whereSql}
      ORDER BY "keywordScore" DESC, chunk_id ASC
      LIMIT ${Math.max(1, Math.min(limit, 100))}
      `,
      question,
      ...values
    );

    return rows.map((row) => this.mapSqlChunk(row, 0, Number(row.keywordScore ?? 0)));
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

  async ensureSession(sessionId: string | undefined, userType: string) {
    if (sessionId) {
      const existing = await this.db.chatSession.findUnique({ where: { id: sessionId } });
      if (existing) return existing;
    }

    return this.db.chatSession.create({ data: { userType } });
  }

  async createChatMessage(input: { sessionId: string; role: 'user' | 'assistant'; content: string }) {
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
      ...(filters.diseaseClassification ? { diseaseClassification: filters.diseaseClassification } : {}),
      ...(typeof filters.medicationRelated === 'boolean'
        ? { medicationRelated: filters.medicationRelated }
        : {}),
      ...(typeof filters.diagnosisRelated === 'boolean' ? { diagnosisRelated: filters.diagnosisRelated } : {}),
      ...(typeof filters.reactionRelated === 'boolean' ? { reactionRelated: filters.reactionRelated } : {}),
      ...(typeof filters.examRelated === 'boolean' ? { examRelated: filters.examRelated } : {}),
      ...(filters.safetyLevel ? { safetyLevel: filters.safetyLevel } : {})
    };
  }

  private toSqlWhere(filters: SearchFilters, startIndex: number) {
    const clauses: string[] = [];
    const values: unknown[] = [];
    let index = startIndex;

    for (const [key, column] of Object.entries(filterColumns) as Array<[keyof SearchFilters, string]>) {
      const value = filters[key];
      if (value !== undefined) {
        clauses.push(`AND ${column} = $${index}`);
        values.push(value);
        index += 1;
      }
    }

    return { whereSql: clauses.length ? ` ${clauses.join(' ')}` : '', values };
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
      metadata: row.metadata ?? {}
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
      vectorScore,
      keywordScore
    };
  }
}
