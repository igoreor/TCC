// Gera um rascunho do sumário (outline) de um PDF para o manifesto da base documental.
// O resultado precisa ser revisado: níveis, títulos em caixa alta e seções a excluir.
//
// Uso: npm run kb:toc -- --pdf <arquivo.pdf> --pages <primeira>-<última> --offset <n>
//   --pages   páginas do PDF que contêm o sumário
//   --offset  página do PDF = página impressa + offset (ex.: o PCDT imprime "13" na página 15 → 2)
import {
  parseTocLines,
  splitNumbering
} from '../../src/modules/knowledge/document-processing/outline';
import { extractPages } from './pdftotext';

function argument(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const SMALL_WORDS = new Set([
  'a',
  'à',
  'ao',
  'aos',
  'as',
  'às',
  'da',
  'das',
  'de',
  'do',
  'dos',
  'e',
  'em',
  'na',
  'nas',
  'no',
  'nos',
  'o',
  'os',
  'ou',
  'para',
  'por',
  'com',
  'sem'
]);

function sentenceCase(title: string) {
  // Títulos em caixa alta viram frase; siglas (até 4 letras) e termos com algarismos são mantidos.
  if (title !== title.toUpperCase()) return title;
  return title
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      const original = title.split(' ')[index] ?? word;
      const isAcronym =
        original.length <= 4 && /^[A-ZÀ-Ú]+$/.test(original) && !SMALL_WORDS.has(word);
      if (/\d/.test(original) || (isAcronym && index > 0)) return original;
      return index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    })
    .join(' ');
}

const pdf = argument('pdf');
const pages = argument('pages');
const offset = Number(argument('offset') ?? 0);
if (!pdf || !pages) {
  console.error(
    'Uso: npm run kb:toc -- --pdf <arquivo.pdf> --pages <primeira>-<última> --offset <n>'
  );
  process.exit(1);
}

const [first, last] = pages.split('-').map(Number);
const lines = extractPages(pdf, { layout: true, first, last }).join('\n').split('\n');
let part = false;

const outline = parseTocLines(lines)
  .filter((entry) => /^\d+$/.test(entry.page))
  .map((entry) => {
    const { number, text } = splitNumbering(entry.title);
    if (/^(parte|part)\b/i.test(text)) part = true;
    else if (!number) part = false;
    const level = number ? number.split('.').length + (part ? 1 : 0) : 1;
    return {
      ...(number ? { number } : {}),
      title: sentenceCase(text),
      level,
      page: entry.page,
      pdfPage: Number(entry.page) + offset
    };
  });

console.log(JSON.stringify(outline, null, 2));
