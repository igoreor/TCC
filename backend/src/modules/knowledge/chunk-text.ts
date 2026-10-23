import { createHash } from 'node:crypto';
import { normalizeText } from '../../shared/text';

// Textos derivados de um trecho para a indexação. O embedding recebe um cabeçalho com documento e
// seção: trechos curtos ("Está indicada nos casos de dúvida...") só fazem sentido com o contexto.

interface ChunkTextInput {
  content: string;
  title: string;
  sectionPath?: string[];
}

interface DocumentTextInput {
  shortTitle?: string | null;
  title: string;
  institution?: string | null;
  publicationYear?: number | null;
}

function documentLabel(document: DocumentTextInput) {
  const name = document.shortTitle ?? document.title;
  const details = [document.institution, document.publicationYear].filter(Boolean).join(', ');
  return details ? `${name} (${details})` : name;
}

export function embeddingText(chunk: ChunkTextInput, document: DocumentTextInput) {
  const section = chunk.sectionPath?.length ? chunk.sectionPath.join(' > ') : chunk.title;
  return `Documento: ${documentLabel(document)}\nSeção: ${section}\n\n${chunk.content}`;
}

/** Texto da busca textual: sem acentos, com título do documento e seções. */
export function searchText(chunk: ChunkTextInput, document: DocumentTextInput) {
  return normalizeText(
    `${document.shortTitle ?? document.title} ${(chunk.sectionPath ?? [chunk.title]).join(' ')} ${chunk.content}`
  );
}

export function contentHash(text: string) {
  return createHash('sha256').update(text).digest('hex');
}
