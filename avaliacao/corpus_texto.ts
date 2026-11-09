// Gera avaliacao/corpus_texto/<documento>.md: o texto exato de cada trecho indexado (o corpus que a
// IA consulta), com identificador, seção e páginas, para a construção das respostas de referência.
// Uso: npx tsx avaliacao/corpus_texto.ts
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(__dirname, '..');
const KB = path.join(RAIZ, 'backend', 'knowledge-base');
const manifest = JSON.parse(readFileSync(path.join(KB, 'manifest.json'), 'utf8'));
const destino = path.join(__dirname, 'corpus_texto');
mkdirSync(destino, { recursive: true });

for (const doc of manifest.documents) {
  const linhas = readFileSync(path.join(KB, 'processed', `${doc.documentId}.jsonl`), 'utf8').split('\n').filter(Boolean);
  const partes = [
    `# ${doc.title}`,
    '',
    `${doc.institution}, ${doc.publicationYear}. Documento: \`${doc.documentId}\`. Idioma: ${doc.language}. Páginas do PDF usadas: ${doc.extraction.contentPages.join(' a ')}.`,
    '',
    `Exclusões: ${doc.notes}`,
    ''
  ];
  for (const linha of linhas) {
    const t = JSON.parse(linha);
    const impressas = t.page_label_start
      ? t.page_label_end && t.page_label_end !== t.page_label_start
        ? `p. ${t.page_label_start}–${t.page_label_end}`
        : `p. ${t.page_label_start}`
      : 'p. ?';
    partes.push(`## [${t.chunk_id}] ${(t.section_path ?? [t.section]).join(' > ')} | ${impressas} | PDF ${t.page_start}–${t.page_end}`, '', t.content, '');
  }
  writeFileSync(path.join(destino, `${doc.documentId}.md`), partes.join('\n'));
  console.log(`${doc.documentId}: ${linhas.length} trechos`);
}
