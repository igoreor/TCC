import { normalizeText } from '../../../shared/text';
import type { CleanPage } from './pdf-pages';

// Estrutura de seções de um documento. O sumário impresso é a fonte das seções: ele é lido uma vez
// (parseTocLines), revisado e gravado no manifesto; na extração, cada título é localizado no texto
// da página indicada (locateOutline).

export interface OutlineEntry {
  /** Numeração impressa ("6.3.1"), quando houver. */
  number?: string;
  title: string;
  /** Nível na hierarquia (1 = capítulo). */
  level: number;
  /** Página do PDF em que a seção começa. */
  pdfPage: number;
  /** Seções excluídas da base (referências, formulários, tabelas de evidência). */
  exclude?: boolean;
}

export interface TocLine {
  title: string;
  page: string;
}

const LEADERS = /(?:\s*\.){2,}\s*/g;

/**
 * Lê as linhas de um sumário (pdftotext -layout) em pares título/página. Títulos quebrados em várias
 * linhas são unidos, e números colados ao título ("Metas23") só são aceitos se mantiverem a ordem
 * crescente das páginas — "GIF2", no meio de um título, não é número de página.
 */
export function parseTocLines(lines: string[]): TocLine[] {
  const entries: TocLine[] = [];
  let pending: string[] = [];
  let lastPage = 0;

  for (const raw of lines) {
    const line = raw.replace(LEADERS, ' ').replace(/\s+/g, ' ').trim();
    if (!line) continue;

    const spaced = /^(.*\S)\s+(\d{1,3}|[ivxlc]{1,7})$/i.exec(line);
    const glued = /^(.*[^\d\s])(\d{1,3})$/.exec(line);
    const onlyNumber = /^(\d{1,3})$/.exec(line);

    let title: string | null = null;
    let page: string | null = null;
    if (spaced) {
      [title, page] = [spaced[1], spaced[2]];
    } else if (onlyNumber && pending.length) {
      [title, page] = ['', onlyNumber[1]];
    } else if (glued && Number(glued[2]) >= lastPage) {
      [title, page] = [glued[1], glued[2]];
    }

    if (page === null) {
      pending.push(line);
      continue;
    }

    const fullTitle = [...pending, title ?? ''].join(' ').replace(/\s+/g, ' ').trim();
    pending = [];
    if (!fullTitle) continue;
    if (/^\d+$/.test(page)) lastPage = Number(page);
    entries.push({ title: fullTitle, page: page.toLowerCase() });
  }

  return entries;
}

/** Separa a numeração do título: "6.3.1 Hanseníase paucibacilar (PB)" → { number: "6.3.1", ... }. */
export function splitNumbering(title: string) {
  const match = /^(\d+(?:\.\d+)*)\.?\s+(.*)$/.exec(title.trim());
  return match ? { number: match[1], text: match[2] } : { number: undefined, text: title.trim() };
}

function headingKey(text: string) {
  return normalizeText(text)
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface LocatedEntry extends OutlineEntry {
  /** Página do PDF e linha em que o título foi encontrado. */
  position: { pdfPage: number; lineIndex: number };
  /** Falso quando o título não foi encontrado e a seção foi ancorada no início da página. */
  located: boolean;
}

/**
 * Localiza cada título na página indicada (ou na seguinte). A comparação usa o início do título,
 * sem acentos nem pontuação, e aceita a linha com ou sem a numeração.
 */
export function locateOutline(pages: CleanPage[], outline: OutlineEntry[]): LocatedEntry[] {
  const byPdfPage = new Map(pages.map((page) => [page.pdfPage, page]));
  const located: LocatedEntry[] = [];
  let cursor = { pdfPage: 0, lineIndex: -1 };

  for (const entry of outline) {
    const { text } = splitNumbering(entry.title);
    const wanted = headingKey(text).slice(0, 28);
    const withNumber = entry.number ? headingKey(`${entry.number} ${text}`).slice(0, 28) : null;
    let found: { pdfPage: number; lineIndex: number } | null = null;

    for (const pdfPage of [entry.pdfPage, entry.pdfPage + 1]) {
      const page = byPdfPage.get(pdfPage);
      if (!page) continue;
      const start = pdfPage === cursor.pdfPage ? cursor.lineIndex + 1 : 0;
      for (let lineIndex = start; lineIndex < page.lines.length; lineIndex += 1) {
        const key = headingKey(page.lines[lineIndex]);
        if (key.length < 3) continue;
        const keyWithoutNumber = headingKey(splitNumbering(page.lines[lineIndex]).text);
        if (
          keyWithoutNumber.startsWith(wanted) ||
          (withNumber !== null && key.startsWith(withNumber)) ||
          (wanted.length > 8 && wanted.startsWith(keyWithoutNumber) && keyWithoutNumber.length >= 8)
        ) {
          found = { pdfPage, lineIndex };
          break;
        }
      }
      if (found) break;
    }

    const position = found ?? { pdfPage: entry.pdfPage, lineIndex: -1 };
    if (
      position.pdfPage > cursor.pdfPage ||
      (position.pdfPage === cursor.pdfPage && position.lineIndex > cursor.lineIndex)
    ) {
      cursor = position;
    }
    located.push({ ...entry, position, located: found !== null });
  }

  return located;
}
