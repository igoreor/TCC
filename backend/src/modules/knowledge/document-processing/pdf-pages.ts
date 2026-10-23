import { normalizeText } from '../../../shared/text';

// Limpeza do texto extraído de PDFs página a página (saída do pdftotext, páginas separadas por \f).
// Remove cabeçalhos e rodapés repetidos, identifica o número impresso de cada página e junta as
// linhas quebradas no meio de uma frase.

export interface CleanPage {
  /** Posição da página no arquivo PDF (1 = primeira). É a usada nos links com #page=. */
  pdfPage: number;
  /** Número impresso na página, quando confiável ("56", "xiii"); `null` quando não identificado. */
  label: string | null;
  /** Linhas de conteúdo, já sem cabeçalho, rodapé e número de página. */
  lines: string[];
}

export interface CleanPagesOptions {
  /** Remove números de referência colados ao fim de palavras ("registrados89." → "registrados."). */
  stripReferenceNumbers?: boolean;
  /** Fração mínima de páginas em que uma linha de borda precisa se repetir para ser descartada. */
  boilerplateMinShare?: number;
}

const ROMAN = /^[ivxlc]{1,7}$/i;
const EDGE_LINES = 3;

/** Número de página em uma linha de borda: "58", "xiii", "9 | Rumo à zero hanseníase" ou "Estratégia… | 8". */
function pageNumberIn(line: string): { value: string; arabic: boolean } | null {
  const trimmed = line.trim();
  if (/^\d{1,3}$/.test(trimmed)) return { value: trimmed, arabic: true };
  if (ROMAN.test(trimmed)) return { value: trimmed.toLowerCase(), arabic: false };
  const leading = /^(\d{1,3})\s*\|\s*\S/.exec(trimmed);
  if (leading) return { value: leading[1], arabic: true };
  const trailing = /\S\s*\|\s*(\d{1,3})$/.exec(trimmed);
  if (trailing) return { value: trailing[1], arabic: true };
  return null;
}

function edgeIndexes(lines: string[]) {
  const filled = lines
    .map((line, index) => (line.trim() ? index : -1))
    .filter((index) => index >= 0);
  return [...new Set([...filled.slice(0, EDGE_LINES), ...filled.slice(-EDGE_LINES)])];
}

function boilerplateKey(line: string) {
  return normalizeText(line)
    .replace(/\d+/g, '#')
    .replace(/\s*\|\s*/g, '|')
    .trim();
}

/** Junta linhas quebradas no meio da frase e separa itens de lista e linhas de tabela. */
export function mergeWrappedLines(lines: string[]) {
  const merged: string[] = [];
  for (const raw of lines) {
    const line = raw
      .replace(/\t+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (!line) continue;
    const previous = merged.at(-1);
    const continues =
      previous !== undefined &&
      !/[.:;!?]$/.test(previous) &&
      !/^[•▪●◦\-–*]\s/.test(line) &&
      /^[a-zà-ú(,]/.test(line);
    if (continues) {
      merged[merged.length - 1] = previous.endsWith('-')
        ? `${previous}${line}`
        : `${previous} ${line}`;
    } else {
      merged.push(line);
    }
  }
  return merged;
}

/** Remove números de referência bibliográfica colados ao fim de palavras em minúsculas. */
export function stripGluedReferenceNumbers(line: string) {
  return (
    line
      .replace(/([a-zà-ú]{3,}[)\]]?)(\d{1,3}(?:[,–-]\d{1,3})*)(?=[\s.,;:)]|$)/g, '$1')
      // depois de parêntese ou aspas: "(IC95% = 0,59-2,07)102." e "familiar ou não”16."
      .replace(/([)”"])(\d{1,3}(?:[,–-]\d{1,3})*)(?=[\s.,;:]|$)/g, '$1')
      // siglas seguidas de referência: "PQT-U16.", "OMS27." — siglas com algarismo próprio, como
      // "GIF2", "PGL-1" e "IL-10", ficam intactas
      .replace(/\b(PQT-U|PQT|OMS|WHO|BRASIL|CONITEC|GPZL|DTNs)(\d{1,3})(?=[\s.,;:)]|$)/g, '$1')
  );
}

export function cleanPages(rawPages: string[], options: CleanPagesOptions = {}): CleanPage[] {
  const pages = rawPages.map((page) => page.split('\n').map((line) => line.replace(/\s+$/, '')));
  const total = pages.length;

  // 1) Número impresso de cada página e deslocamento predominante em relação à posição no PDF.
  const detected = pages.map((lines) => {
    const edges = edgeIndexes(lines);
    // prioriza o rodapé (últimas linhas), onde a maioria dos documentos imprime a numeração
    for (const index of [...edges].reverse()) {
      const number = pageNumberIn(lines[index]);
      if (number) return { ...number, lineIndex: index };
    }
    return null;
  });

  const offsets = new Map<number, number>();
  detected.forEach((number, position) => {
    if (number?.arabic) {
      const offset = Number(number.value) - (position + 1);
      offsets.set(offset, (offsets.get(offset) ?? 0) + 1);
    }
  });
  const arabicCount = [...offsets.values()].reduce((sum, count) => sum + count, 0);
  const [bestOffset, bestCount] = [...offsets.entries()].sort((a, b) => b[1] - a[1])[0] ?? [0, 0];
  const offsetIsReliable = bestCount >= 3 && bestCount >= arabicCount * 0.5;
  const firstArabicPage = detected.findIndex(
    (number, position) => number?.arabic && Number(number.value) - (position + 1) === bestOffset
  );

  // 2) Linhas de borda repetidas em muitas páginas: cabeçalhos e rodapés.
  const minShare = options.boilerplateMinShare ?? 0.2;
  const keyPages = new Map<string, Set<number>>();
  pages.forEach((lines, position) => {
    for (const index of edgeIndexes(lines)) {
      const key = boilerplateKey(lines[index]);
      if (!key || key === '#') continue;
      if (!keyPages.has(key)) keyPages.set(key, new Set());
      keyPages.get(key)!.add(position);
    }
  });
  const boilerplate = new Set(
    [...keyPages.entries()]
      .filter(([, positions]) => positions.size >= Math.max(3, Math.ceil(total * minShare)))
      .map(([key]) => key)
  );

  return pages.map((lines, position) => {
    const pdfPage = position + 1;
    const number = detected[position];
    // um número que destoa da paginação do documento é conteúdo (célula de tabela, por exemplo)
    const numberIsPageNumber =
      number !== null &&
      (!number.arabic || !offsetIsReliable || Number(number.value) - pdfPage === bestOffset);
    let label: string | null = null;
    if (numberIsPageNumber) {
      label = number.value;
    } else if (
      offsetIsReliable &&
      firstArabicPage >= 0 &&
      position >= firstArabicPage &&
      pdfPage + bestOffset >= 1
    ) {
      label = String(pdfPage + bestOffset);
    }

    const edges = new Set(edgeIndexes(lines));
    const kept = lines.filter((line, index) => {
      if (numberIsPageNumber && index === number.lineIndex) return false;
      if (edges.has(index) && boilerplate.has(boilerplateKey(line))) return false;
      return true;
    });

    const cleaned = kept.map((line) =>
      options.stripReferenceNumbers ? stripGluedReferenceNumbers(line) : line
    );
    return { pdfPage, label, lines: mergeWrappedLines(cleaned) };
  });
}
