import type { LocatedEntry } from './outline';
import type { CleanPage } from './pdf-pages';

// Fragmentação de um documento em trechos que respeitam as seções. Cada trecho guarda as páginas
// (do PDF e impressas) e o caminho de seções, para que a fonte exibida aponte para o lugar exato.

export interface ChunkingOptions {
  /** Tamanho-alvo do trecho, em tokens estimados. */
  targetTokens?: number;
  /** Tamanho máximo de um parágrafo antes de ser dividido por frases. */
  maxTokens?: number;
  /** Trechos menores que isto não são fechados ao mudar de seção: juntam-se ao seguinte. */
  minTokens?: number;
  /** Sobreposição entre trechos consecutivos da mesma seção. */
  overlapTokens?: number;
  /** Intervalo de páginas do PDF com o conteúdo (exclui capa, ficha e sumário). */
  contentPages?: [number, number];
}

export interface ChunkDraft {
  chunkIndex: number;
  content: string;
  pageStart: number;
  pageEnd: number;
  pageLabelStart: string | null;
  pageLabelEnd: string | null;
  sectionPath: string[];
  tokens: number;
}

interface SectionedLine {
  pdfPage: number;
  text: string;
  section: number;
  tokens: number;
}

export function estimateTokens(text: string) {
  return Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.3);
}

/** Caminho de títulos de cada seção, a partir dos níveis do sumário. */
export function sectionPaths(entries: LocatedEntry[]) {
  const stack: Array<{ level: number; title: string; exclude: boolean }> = [];
  return entries.map((entry) => {
    while (stack.length && stack[stack.length - 1].level >= entry.level) stack.pop();
    const title =
      entry.number && !entry.title.startsWith(entry.number)
        ? `${entry.number} ${entry.title}`
        : entry.title;
    stack.push({ level: entry.level, title, exclude: Boolean(entry.exclude) });
    return {
      path: stack.map((item) => item.title),
      excluded: stack.some((item) => item.exclude)
    };
  });
}

function splitLongLine(text: string, maxTokens: number) {
  if (estimateTokens(text) <= maxTokens) return [text];
  const sentences = text.match(/[^.!?;]+[.!?;]+["”)]?\s*|[^.!?;]+$/g) ?? [text];
  const parts: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if (current && estimateTokens(current + sentence) > maxTokens) {
      parts.push(current.trim());
      current = '';
    }
    current += sentence;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

export function chunkDocument(
  pages: CleanPage[],
  entries: LocatedEntry[],
  options: ChunkingOptions = {}
): ChunkDraft[] {
  const targetTokens = options.targetTokens ?? 450;
  const maxTokens = options.maxTokens ?? 700;
  const minTokens = options.minTokens ?? 80;
  const overlapTokens = options.overlapTokens ?? 120;
  const [firstPage, lastPage] = options.contentPages ?? [1, Number.MAX_SAFE_INTEGER];
  const paths = sectionPaths(entries);
  const labels = new Map(pages.map((page) => [page.pdfPage, page.label]));

  // 1) Linhas na ordem do documento, cada uma com a sua seção; os títulos saem do texto.
  const headingAt = new Map(
    entries
      .filter((entry) => entry.located)
      .map((entry) => [`${entry.position.pdfPage}:${entry.position.lineIndex}`, true])
  );
  const lines: SectionedLine[] = [];
  let entryCursor = -1;
  for (const page of pages) {
    page.lines.forEach((text, lineIndex) => {
      while (
        entryCursor + 1 < entries.length &&
        (entries[entryCursor + 1].position.pdfPage < page.pdfPage ||
          (entries[entryCursor + 1].position.pdfPage === page.pdfPage &&
            entries[entryCursor + 1].position.lineIndex <= lineIndex))
      ) {
        entryCursor += 1;
      }
      if (page.pdfPage < firstPage || page.pdfPage > lastPage) return;
      if (headingAt.has(`${page.pdfPage}:${lineIndex}`)) return;
      if (entryCursor >= 0 && paths[entryCursor].excluded) return;
      for (const part of splitLongLine(text, maxTokens)) {
        lines.push({
          pdfPage: page.pdfPage,
          text: part,
          section: entryCursor,
          tokens: estimateTokens(part)
        });
      }
    });
  }

  // 2) Agrupamento em trechos.
  const chunks: ChunkDraft[] = [];
  let current: SectionedLine[] = [];
  // linhas repetidas do trecho anterior (sobreposição): sozinhas, não formam um trecho
  let carried = 0;
  const total = (items: SectionedLine[]) => items.reduce((sum, item) => sum + item.tokens, 0);

  const flush = (carryOverlap: boolean) => {
    if (!current.length) return;
    const tokensBySection = new Map<number, number>();
    for (const line of current)
      tokensBySection.set(line.section, (tokensBySection.get(line.section) ?? 0) + line.tokens);
    const [mainSection] = [...tokensBySection.entries()].sort((a, b) => b[1] - a[1])[0];
    const pageStart = Math.min(...current.map((line) => line.pdfPage));
    const pageEnd = Math.max(...current.map((line) => line.pdfPage));
    chunks.push({
      chunkIndex: chunks.length,
      content: current.map((line) => line.text).join('\n'),
      pageStart,
      pageEnd,
      pageLabelStart: labels.get(pageStart) ?? null,
      pageLabelEnd: labels.get(pageEnd) ?? null,
      sectionPath: mainSection >= 0 ? paths[mainSection].path : [],
      tokens: total(current)
    });

    if (!carryOverlap) {
      current = [];
      carried = 0;
      return;
    }
    const tail: SectionedLine[] = [];
    for (const line of [...current].reverse()) {
      if (total(tail) + line.tokens > overlapTokens || tail.length === 2) break;
      tail.unshift(line);
    }
    current = tail;
    carried = tail.length;
  };

  for (const line of lines) {
    const last = current.at(-1);
    const sectionChanged = last !== undefined && last.section !== line.section;
    if (sectionChanged && total(current) >= minTokens) {
      flush(false);
    } else if (
      current.length > carried &&
      total(current) + line.tokens > targetTokens &&
      total(current) >= minTokens
    ) {
      flush(!sectionChanged);
    }
    current.push(line);
  }
  flush(false);

  return chunks;
}
