import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  DeterministicEmbeddingsProvider,
  type EmbeddingsProvider
} from '../../src/modules/embeddings/embeddings.provider';
import { EmbeddingsService } from '../../src/modules/embeddings/embeddings.service';
import type { ManifestDocument } from '../../src/modules/knowledge/document-manifest';
import { KnowledgeRepository } from '../../src/modules/knowledge/knowledge.repository';
import { KnowledgeService } from '../../src/modules/knowledge/knowledge.service';

/**
 * Ingestão e busca da base documental contra um PostgreSQL real (pgvector e busca textual).
 * Só roda com TEST_DATABASE_URL; use um banco descartável.
 */
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)('integração da base documental', () => {
  let db: PrismaClient;
  const documentId = `teste-documento-${randomUUID().slice(0, 8)}`;
  const embeddings = new EmbeddingsService(new DeterministicEmbeddingsProvider());

  const document: ManifestDocument = {
    documentId,
    title: 'Protocolo de teste da hanseníase',
    shortTitle: 'Protocolo de teste',
    institution: 'Ministério da Saúde (Brasil)',
    publicationYear: 2022,
    language: 'pt',
    jurisdiction: 'nacional',
    documentType: 'Protocolo clínico',
    sourceType: 'Protocolo oficial',
    status: 'vigente',
    officialUrl: 'https://exemplo.gov.br/protocolo.pdf',
    downloadUrl: 'https://exemplo.gov.br/protocolo-arquivo.pdf',
    sha256: 'a'.repeat(64),
    pageCount: 10,
    extraction: { contentPages: [1, 10], stripReferenceNumbers: false },
    outline: [{ title: 'Diagnóstico', level: 1, pdfPage: 3 }]
  };

  function line(index: number, content: string, section: string) {
    return JSON.stringify({
      chunk_id: `${documentId}:${String(index).padStart(4, '0')}`,
      document_id: documentId,
      chunk_index: index,
      title: section,
      section,
      subsection: null,
      section_path: [section],
      content,
      page_start: 3 + index,
      page_end: 3 + index,
      page_label_start: String(1 + index),
      page_label_end: String(1 + index),
      metadata: {
        clinical_phase: 'Exam',
        information_type: 'Clinical_Guideline',
        source_page: 1 + index,
        last_reviewed: '2026-10-23'
      }
    });
  }

  const jsonl = [
    line(
      0,
      'A baciloscopia negativa não exclui o diagnóstico de hanseníase nos casos paucibacilares.',
      '7.2 Baciloscopia'
    ),
    line(1, 'A poliquimioterapia única é o tratamento de primeira linha.', '10.1 Tratamento')
  ].join('\n');

  beforeAll(() => {
    db = new PrismaClient({ datasources: { db: { url } } });
  });

  afterAll(async () => {
    await db.document.deleteMany({ where: { documentId } });
    await db.$disconnect();
  });

  it('indexa o documento com metadados, páginas e histórico de ingestão', async () => {
    const service = new KnowledgeService(new KnowledgeRepository(db), embeddings);
    const result = await service.ingestDocument(document, jsonl);

    expect(result).toEqual({ documentId, total: 2, embedded: 2, unchanged: 0, removed: 0 });
    const stored = await db.document.findUniqueOrThrow({
      where: { documentId },
      include: { ingestionRuns: true }
    });
    expect(stored).toMatchObject({
      institution: 'Ministério da Saúde (Brasil)',
      publicationYear: 2022,
      active: true
    });
    expect(stored.ingestedAt).not.toBeNull();
    expect(stored.ingestionRuns).toHaveLength(1);
    expect(stored.ingestionRuns[0]).toMatchObject({
      status: 'concluida',
      chunksEmbedded: 2,
      embeddingModel: embeddings.modelId
    });
  });

  it('encontra o trecho pela busca textual sem acentos e devolve os metadados do documento', async () => {
    const repository = new KnowledgeRepository(db);
    // "hanseniase" e "baciloscopia" sem acento, como digitado na interface
    const results = await repository.textSearch(
      ['baciloscopia', 'negativa', 'exclui'],
      { documentId },
      5
    );

    expect(results[0].chunkId).toBe(`${documentId}:0000`);
    expect(results[0].keywordScore).toBeGreaterThan(0);
    expect(results[0].document).toMatchObject({
      shortTitle: 'Protocolo de teste',
      jurisdiction: 'nacional'
    });
    expect(results[0]).toMatchObject({ pageStart: 3, pageLabelStart: '1' });
  });

  it('compara vetores apenas do mesmo modelo de embedding e de documentos ativos', async () => {
    const repository = new KnowledgeRepository(db);
    const query = await embeddings.embed('baciloscopia negativa hanseníase');

    expect(
      await repository.vectorSearch(query, { documentId }, 5, embeddings.modelId)
    ).toHaveLength(2);
    expect(await repository.vectorSearch(query, { documentId }, 5, 'outro-modelo')).toHaveLength(0);

    await db.document.update({ where: { documentId }, data: { active: false } });
    expect(
      await repository.vectorSearch(query, { documentId }, 5, embeddings.modelId)
    ).toHaveLength(0);
    expect(await repository.textSearch(['baciloscopia'], { documentId }, 5)).toHaveLength(0);
    await db.document.update({ where: { documentId }, data: { active: true } });
  });

  it('reindexa sem gerar embedding para trechos que não mudaram e remove os que saíram', async () => {
    let calls = 0;
    const counting: EmbeddingsProvider = {
      modelId: embeddings.modelId,
      semantic: false,
      embed: (text) => embeddings.embed(text),
      embedMany: async (texts) => {
        calls += texts.length;
        return embeddings.embedMany(texts);
      }
    };
    const service = new KnowledgeService(
      new KnowledgeRepository(db),
      new EmbeddingsService(counting)
    );
    const changed = [
      line(
        0,
        'A baciloscopia negativa não exclui o diagnóstico de hanseníase nos casos paucibacilares.',
        '7.2 Baciloscopia'
      )
    ].join('\n');

    const result = await service.ingestDocument(document, changed);
    expect(result).toEqual({ documentId, total: 1, embedded: 0, unchanged: 1, removed: 1 });
    expect(calls).toBe(0);
    expect(await db.chunk.count({ where: { documentId } })).toBe(1);
  });
});
