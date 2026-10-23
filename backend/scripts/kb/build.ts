// Processa os PDFs oficiais do manifesto em trechos versionados (knowledge-base/processed/*.jsonl).
//
// Uso: npm run kb:build [-- --only <documentId>]
// Para cada documento: baixa o PDF se faltar, confere o SHA-256, extrai o texto página a página,
// remove cabeçalhos e rodapés, localiza as seções do sumário, fragmenta e grava os trechos com
// páginas e seções. Um relatório (<documentId>.report.json) registra o que não foi localizado.
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  KNOWLEDGE_BASE_DIR,
  ManifestDocument,
  loadManifest,
  processedChunksPath
} from '../../src/modules/knowledge/document-manifest';
import { deriveClinicalTags } from '../../src/modules/knowledge/document-processing/clinical-tags';
import { chunkDocument } from '../../src/modules/knowledge/document-processing/document-chunker';
import { locateOutline } from '../../src/modules/knowledge/document-processing/outline';
import { cleanPages } from '../../src/modules/knowledge/document-processing/pdf-pages';
import { extractPages } from './pdftotext';

export function rawPdfPath(documentId: string) {
  return path.join(KNOWLEDGE_BASE_DIR, 'raw', `${documentId}.pdf`);
}

function sha256(buffer: Buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

export async function ensurePdf(document: ManifestDocument) {
  const file = rawPdfPath(document.documentId);
  if (!existsSync(file)) {
    console.log(`  baixando ${document.downloadUrl}`);
    const response = await fetch(document.downloadUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (NexoHansen kb)' }
    });
    if (!response.ok)
      throw new Error(`download falhou (${response.status}) para ${document.documentId}`);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, Buffer.from(await response.arrayBuffer()));
  }
  const digest = sha256(await readFile(file));
  if (digest !== document.sha256) {
    throw new Error(
      `SHA-256 diferente do manifesto para ${document.documentId}: o arquivo mudou na origem. ` +
        'Confira a nova versão antes de atualizar o manifesto.'
    );
  }
  return file;
}

function pageRange(start: string | null, end: string | null) {
  if (!start) return null;
  return end && end !== start ? `${start}–${end}` : start;
}

export async function buildDocument(document: ManifestDocument, processedOn: string) {
  const file = await ensurePdf(document);
  const pages = cleanPages(extractPages(file), {
    stripReferenceNumbers: document.extraction.stripReferenceNumbers
  });
  const located = locateOutline(pages, document.outline);
  const drafts = chunkDocument(pages, located, { contentPages: document.extraction.contentPages });
  const documentDefaults = { documentType: document.documentType, sourceType: document.sourceType };
  const sourceName = `${document.institution} — ${document.shortTitle} (${document.publicationYear})`;

  const records = drafts.map((draft) => {
    const tags = deriveClinicalTags(draft.sectionPath, draft.content, documentDefaults);
    const pages = pageRange(draft.pageLabelStart, draft.pageLabelEnd);
    const printedStart =
      draft.pageLabelStart && /^\d+$/.test(draft.pageLabelStart)
        ? Number(draft.pageLabelStart)
        : null;
    return {
      chunk_id: `${document.documentId}:${String(draft.chunkIndex).padStart(4, '0')}`,
      document_id: document.documentId,
      chunk_index: draft.chunkIndex,
      title: draft.sectionPath.at(-1) ?? document.shortTitle,
      section: draft.sectionPath[0] ?? document.shortTitle,
      subsection: draft.sectionPath.length > 1 ? draft.sectionPath.slice(1).join(' > ') : null,
      section_path: draft.sectionPath,
      content: draft.content,
      page_start: draft.pageStart,
      page_end: draft.pageEnd,
      page_label_start: draft.pageLabelStart,
      page_label_end: draft.pageLabelEnd,
      metadata: {
        ...tags,
        source_type: document.sourceType,
        source_name: sourceName,
        source_page: printedStart,
        source_reference: `${document.institution}. ${document.title}. ${document.publicationYear}${pages ? `, p. ${pages}` : ''}.`,
        keywords: [],
        last_reviewed: processedOn,
        answer_policy:
          'Responder com base nos trechos recuperados, citando documento, seção e página.'
      }
    };
  });

  const tokens = drafts.map((draft) => draft.tokens);
  const report = {
    documentId: document.documentId,
    processedOn,
    pages: pages.length,
    pagesWithPrintedNumber: pages.filter((page) => page.label).length,
    sections: located.length,
    sectionsNotLocated: located
      .filter((entry) => !entry.located)
      .map((entry) => `${entry.number ?? ''} ${entry.title} (pdf ${entry.pdfPage})`.trim()),
    excludedSections: located.filter((entry) => entry.exclude).map((entry) => entry.title),
    chunks: records.length,
    tokens: {
      min: Math.min(...tokens),
      mean: Math.round(tokens.reduce((sum, value) => sum + value, 0) / Math.max(tokens.length, 1)),
      max: Math.max(...tokens)
    },
    chunksWithoutSection: records.filter((record) => record.section_path.length === 0).length
  };

  await mkdir(path.dirname(processedChunksPath(document.documentId)), { recursive: true });
  await writeFile(
    processedChunksPath(document.documentId),
    records.map((record) => JSON.stringify(record)).join('\n') + '\n'
  );
  await writeFile(
    processedChunksPath(document.documentId).replace(/\.jsonl$/, '.report.json'),
    JSON.stringify(report, null, 2) + '\n'
  );
  return report;
}

async function main() {
  const onlyIndex = process.argv.indexOf('--only');
  const only = onlyIndex >= 0 ? process.argv[onlyIndex + 1] : undefined;
  const manifest = await loadManifest();
  const processedOn = new Date().toISOString().slice(0, 10);

  for (const document of manifest.documents) {
    if (only && document.documentId !== only) continue;
    console.log(`> ${document.documentId}`);
    const report = await buildDocument(document, processedOn);
    console.log(
      `  ${report.chunks} trechos; ${report.pagesWithPrintedNumber}/${report.pages} páginas com número impresso; ` +
        `seções não localizadas: ${report.sectionsNotLocated.length}; tokens ${report.tokens.min}/${report.tokens.mean}/${report.tokens.max}`
    );
    for (const missing of report.sectionsNotLocated)
      console.log(`    ! seção não localizada: ${missing}`);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
