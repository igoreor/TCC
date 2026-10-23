import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

// Manifesto da base documental (knowledge-base/manifest.json). Cada documento traz os metadados
// verificáveis que aparecem nas fontes, a origem do arquivo (com SHA-256) e o sumário revisado.
// Nenhum campo é preenchido por inferência: o que não consta do documento fica vazio.

const outlineEntrySchema = z.object({
  number: z.string().optional(),
  title: z.string().min(1),
  level: z.number().int().min(1).max(6),
  /** Página impressa indicada no sumário, quando houver. */
  page: z.string().optional(),
  pdfPage: z.number().int().positive(),
  exclude: z.boolean().optional()
});

export const manifestDocumentSchema = z.object({
  documentId: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(3),
  /** Nome curto exibido junto da citação ("PCDT da Hanseníase"). */
  shortTitle: z.string().min(2),
  institution: z.string().min(2),
  /** Unidade responsável dentro da instituição, como consta do documento. */
  authorship: z.string().optional(),
  publicationYear: z.number().int().min(1900).max(2100),
  edition: z.string().optional(),
  isbn: z.string().optional(),
  language: z.enum(['pt', 'en', 'es']),
  jurisdiction: z.enum(['nacional', 'internacional']),
  documentType: z.enum(['Protocolo clínico', 'Diretriz', 'Orientação técnica', 'Estratégia']),
  sourceType: z.enum([
    'Protocolo oficial',
    'Diretriz',
    'Documento técnico',
    'Relatório técnico',
    'Artigo'
  ]),
  status: z.enum(['vigente', 'substituido']).default('vigente'),
  /** Endereço oficial do documento (página de catálogo ou PDF do órgão emissor). */
  officialUrl: z.string().url(),
  /** De onde o PDF processado foi baixado. */
  downloadUrl: z.string().url(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  pageCount: z.number().int().positive(),
  license: z.string().optional(),
  notes: z.string().optional(),
  extraction: z.object({
    contentPages: z.tuple([z.number().int().positive(), z.number().int().positive()]),
    stripReferenceNumbers: z.boolean().default(false)
  }),
  outline: z.array(outlineEntrySchema).min(1)
});

export const manifestSchema = z.object({
  version: z.literal(1),
  documents: z.array(manifestDocumentSchema).min(1)
});

export type ManifestDocument = z.infer<typeof manifestDocumentSchema>;
export type KnowledgeManifest = z.infer<typeof manifestSchema>;

// Os comandos rodam a partir de backend/, como os demais scripts do projeto.
export const KNOWLEDGE_BASE_DIR = path.resolve(
  process.env.KNOWLEDGE_BASE_DIR ?? path.join(process.cwd(), 'knowledge-base')
);
export const MANIFEST_PATH = path.join(KNOWLEDGE_BASE_DIR, 'manifest.json');

export async function loadManifest(file = MANIFEST_PATH): Promise<KnowledgeManifest> {
  return manifestSchema.parse(JSON.parse(await readFile(file, 'utf8')));
}

/** Arquivo JSONL com os trechos processados de um documento. */
export function processedChunksPath(documentId: string) {
  return path.join(KNOWLEDGE_BASE_DIR, 'processed', `${documentId}.jsonl`);
}

/** Link para a página do PDF oficial (parâmetro de abertura #page, aceito pelos leitores de PDF). */
export function pageUrl(
  document: Pick<ManifestDocument, 'downloadUrl'>,
  pdfPage: number | null | undefined
) {
  return pdfPage ? `${document.downloadUrl}#page=${pdfPage}` : document.downloadUrl;
}
