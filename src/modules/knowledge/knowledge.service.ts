import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ZodError } from 'zod';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { rawChunkSchema } from './schemas';
import { KnowledgeRepository } from './knowledge.repository';
import { AppError } from '../../shared/errors';
import { ChunkDTO } from '../../shared/types';

export class KnowledgeService {
  constructor(
    private readonly repository: KnowledgeRepository,
    private readonly embeddingsService: EmbeddingsService
  ) {}

  async seedFromDefaultFile() {
    const filePath = path.resolve(process.cwd(), 'knowledge-base/processed/hanseniase_chunks.seed.jsonl');
    return this.ingestFromFile(filePath);
  }

  async ingestFromFile(filePath: string) {
    const resolved = path.resolve(filePath);
    const content = await readFile(resolved, 'utf8');
    return this.ingestJsonlContent(content);
  }

  async ingestJsonlContent(content: string) {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const errors: Array<{ line: number; error: unknown }> = [];
    let insertedOrUpdated = 0;

    for (const [index, line] of lines.entries()) {
      try {
        const parsed = rawChunkSchema.parse(JSON.parse(line));
        const chunk = this.toChunkDTO(parsed);

        await this.repository.upsertDocument({
          documentId: chunk.documentId,
          title: parsed.title,
          description: `Documento lógico ${chunk.documentId}`,
          sourceType: parsed.metadata.source_type,
          sourceName: parsed.metadata.source_name,
          version: parsed.metadata.last_reviewed
        });

        const embedding = await this.embeddingsService.embed(chunk.content);
        await this.repository.upsertChunk({ ...chunk, embedding });
        insertedOrUpdated += 1;
      } catch (error) {
        errors.push({
          line: index + 1,
          error: error instanceof ZodError ? error.flatten() : String(error)
        });
      }
    }

    if (errors.length) {
      throw new AppError('Falha ao validar uma ou mais linhas do JSONL.', 400, { errors });
    }

    return {
      inserted: insertedOrUpdated,
      updated: 0,
      total: lines.length
    };
  }

  private toChunkDTO(input: any): ChunkDTO {
    const metadata = input.metadata;

    return {
      chunkId: input.chunk_id,
      documentId: input.document_id,
      title: input.title,
      section: input.section,
      subsection: input.subsection ?? null,
      content: input.content,
      sourcePage: metadata.source_page,
      sourceReference: metadata.source_reference,
      clinicalPhase: metadata.clinical_phase,
      informationType: metadata.information_type,
      targetUser: metadata.target_user,
      targetDemographic: metadata.target_demographic,
      clinicalCriticality: metadata.clinical_criticality,
      diseaseClassification: metadata.disease_classification,
      medicationRelated: metadata.medication_related,
      dosageRelated: metadata.dosage_related,
      contraindicationRelated: metadata.contraindication_related,
      examRelated: metadata.exam_related,
      diagnosisRelated: metadata.diagnosis_related,
      reactionRelated: metadata.reaction_related,
      safetyLevel: metadata.safety_level,
      answerPolicy: metadata.answer_policy,
      keywords: metadata.keywords,
      entities: metadata.entities,
      metadata
    };
  }
}
