import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ZodError } from 'zod';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { contentHash, embeddingText, searchText } from './chunk-text';
import { ManifestDocument, loadManifest, processedChunksPath } from './document-manifest';
import { documentChunkSchema, rawChunkSchema } from './schemas';
import { KnowledgeRepository } from './knowledge.repository';
import { AppError } from '../../shared/errors';
import { ChunkDTO } from '../../shared/types';

const EMBEDDING_BATCH = 64;

export interface DocumentIngestionResult {
  documentId: string;
  total: number;
  embedded: number;
  unchanged: number;
  removed: number;
}

export class KnowledgeService {
  constructor(
    private readonly repository: KnowledgeRepository,
    private readonly embeddingsService: EmbeddingsService
  ) {}

  /** Carrega a base oficial: todos os documentos do manifesto, a partir dos trechos processados. */
  async seedFromDefaultFile() {
    const results = await this.ingestOfficialDocuments();
    return {
      inserted: results.reduce((sum, result) => sum + result.embedded, 0),
      updated: results.reduce((sum, result) => sum + result.unchanged, 0),
      total: results.reduce((sum, result) => sum + result.total, 0),
      documents: results
    };
  }

  async ingestOfficialDocuments(options: { only?: string; manifestPath?: string } = {}) {
    const manifest = await loadManifest(options.manifestPath);
    const results: DocumentIngestionResult[] = [];
    for (const document of manifest.documents) {
      if (options.only && document.documentId !== options.only) continue;
      const content = await readFile(processedChunksPath(document.documentId), 'utf8');
      results.push(await this.ingestDocument(document, content));
    }
    return results;
  }

  /**
   * Indexa um documento oficial: grava os metadados bibliográficos, gera embeddings só para trechos
   * novos ou alterados (ou indexados com outro modelo) e remove trechos que deixaram de existir.
   */
  async ingestDocument(
    document: ManifestDocument,
    jsonl: string
  ): Promise<DocumentIngestionResult> {
    const records = jsonl
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        try {
          return documentChunkSchema.parse(JSON.parse(line));
        } catch (error) {
          throw new AppError(
            `Trecho inválido na linha ${index + 1} de ${document.documentId}.`,
            400,
            {
              error: error instanceof ZodError ? error.flatten() : String(error)
            }
          );
        }
      });

    await this.repository.upsertDocument({
      documentId: document.documentId,
      title: document.title,
      description: document.notes,
      sourceType: document.sourceType,
      sourceName: document.institution,
      version: document.edition,
      shortTitle: document.shortTitle,
      institution: document.institution,
      authorship: document.authorship,
      publicationYear: document.publicationYear,
      edition: document.edition,
      isbn: document.isbn,
      language: document.language,
      jurisdiction: document.jurisdiction,
      documentType: document.documentType,
      status: document.status,
      active: document.status === 'vigente',
      officialUrl: document.officialUrl,
      downloadUrl: document.downloadUrl,
      fileSha256: document.sha256,
      pageCount: document.pageCount,
      license: document.license,
      notes: document.notes
    });

    const model = this.embeddingsService.modelId;
    const run = await this.repository.createIngestionRun({
      documentId: document.documentId,
      embeddingModel: model,
      fileSha256: document.sha256
    });

    try {
      const existing = await this.repository.findChunkHashes(document.documentId);
      const prepared = records.map((record) => {
        const chunk = this.toChunkDTO(record);
        const text = embeddingText(
          { content: chunk.content, title: chunk.title, sectionPath: chunk.sectionPath },
          document
        );
        const hash = contentHash(text);
        const stored = existing.get(chunk.chunkId);
        const needsEmbedding =
          !stored || stored.contentHash !== hash || stored.embeddingModel !== model;
        return { chunk, text, hash, needsEmbedding };
      });

      const pending = prepared.filter((item) => item.needsEmbedding);
      for (let start = 0; start < pending.length; start += EMBEDDING_BATCH) {
        const batch = pending.slice(start, start + EMBEDDING_BATCH);
        const vectors = await this.embeddingsService.embedMany(batch.map((item) => item.text));
        batch.forEach((item, index) => Object.assign(item, { embedding: vectors[index] }));
      }

      for (const item of prepared as Array<(typeof prepared)[number] & { embedding?: number[] }>) {
        await this.repository.upsertChunk({
          ...item.chunk,
          embedding: item.embedding,
          embeddingModel: model,
          contentHash: item.hash,
          searchText: searchText(
            {
              content: item.chunk.content,
              title: item.chunk.title,
              sectionPath: item.chunk.sectionPath
            },
            document
          )
        });
      }

      const removed = await this.repository.deleteChunksNotIn(
        document.documentId,
        prepared.map((item) => item.chunk.chunkId)
      );
      await this.repository.upsertDocument({
        documentId: document.documentId,
        title: document.title,
        ingestedAt: new Date()
      });
      const result = {
        documentId: document.documentId,
        total: prepared.length,
        embedded: pending.length,
        unchanged: prepared.length - pending.length,
        removed
      };
      await this.repository.finishIngestionRun(run.id, {
        status: 'concluida',
        chunksTotal: result.total,
        chunksEmbedded: result.embedded,
        chunksUnchanged: result.unchanged,
        chunksRemoved: result.removed
      });
      return result;
    } catch (error) {
      await this.repository.finishIngestionRun(run.id, {
        status: 'falhou',
        error: String(error).slice(0, 2000)
      });
      throw error;
    }
  }

  async ingestFromFile(filePath: string) {
    const resolved = path.resolve(filePath);
    const content = await readFile(resolved, 'utf8');
    return this.ingestJsonlContent(content);
  }

  /** Ingestão de trechos avulsos no formato da base inicial (um objeto JSON por linha). */
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
        const document = { title: parsed.title, shortTitle: parsed.title };

        await this.repository.upsertDocument({
          documentId: chunk.documentId,
          title: parsed.title,
          description: `Documento lógico ${chunk.documentId}`,
          sourceType: parsed.metadata.source_type,
          sourceName: parsed.metadata.source_name,
          version: parsed.metadata.last_reviewed
        });

        const text = embeddingText({ content: chunk.content, title: chunk.title }, document);
        const embedding = await this.embeddingsService.embed(text);
        await this.repository.upsertChunk({
          ...chunk,
          embedding,
          embeddingModel: this.embeddingsService.modelId,
          contentHash: contentHash(text),
          searchText: searchText({ content: chunk.content, title: chunk.title }, document)
        });
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
      metadata,
      chunkIndex: input.chunk_index ?? null,
      sectionPath: input.section_path ?? [],
      pageStart: input.page_start ?? null,
      pageEnd: input.page_end ?? null,
      pageLabelStart: input.page_label_start ?? null,
      pageLabelEnd: input.page_label_end ?? null
    };
  }
}
