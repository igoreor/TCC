import type { SourceCitation } from '../../api/types'

export type InlineToken =
  | { kind: 'text'; value: string }
  | { kind: 'strong'; value: string }
  | { kind: 'citation'; index: number }

export type AnswerBlock =
  | { kind: 'paragraph'; lines: InlineToken[][] }
  | { kind: 'list'; ordered: boolean; items: InlineToken[][] }
  | { kind: 'heading'; tokens: InlineToken[] }
  | { kind: 'table'; header: InlineToken[][]; rows: InlineToken[][][] }

const BULLET = /^[-*•]\s+/
const NUMBERED = /^\d+[.)]\s+/
const HEADING = /^#{1,4}\s+/
const TABLE_ROW = /^\|.*\|$/
const TABLE_SEPARATOR = /^:?-{3,}:?$/
const INLINE = /(\*\*[^*]+\*\*|\[[^\]\s]+\])/g

/** O backend anexa o aviso clínico ao fim de toda resposta; a nota de segurança já o exibe. */
export function stripDisclaimer(content: string, disclaimer: string | undefined): string {
  const trimmed = content.trimEnd()
  if (disclaimer && trimmed.endsWith(disclaimer)) {
    return trimmed.slice(0, -disclaimer.length).trimEnd()
  }
  return trimmed
}

/**
 * Converte um marcador entre colchetes no número da fonte (1-based).
 * Aceita o id do trecho (formato da resposta extrativa) ou o número do trecho
 * no contexto enviado ao modelo, que segue a mesma ordem de `sources`.
 */
function citationIndex(token: string, sources: SourceCitation[]): number | null {
  const byId = sources.findIndex((source) => source.chunk_id === token)
  if (byId >= 0) return byId + 1
  if (/^\d+$/.test(token)) {
    const position = Number(token)
    if (position >= 1 && position <= sources.length) return position
  }
  return null
}

function parseInline(text: string, sources: SourceCitation[]): InlineToken[] {
  const tokens: InlineToken[] = []
  for (const part of text.split(INLINE)) {
    if (!part) continue
    if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
      tokens.push({ kind: 'strong', value: part.slice(2, -2) })
      continue
    }
    if (part.startsWith('[') && part.endsWith(']')) {
      const index = citationIndex(part.slice(1, -1), sources)
      if (index !== null) {
        // espaço não separável antes do marcador: a citação nunca abre uma linha sozinha
        const previous = tokens.at(-1)
        if (previous?.kind === 'text' && previous.value.endsWith(' ')) {
          previous.value = `${previous.value.slice(0, -1)} `
        }
        tokens.push({ kind: 'citation', index })
        continue
      }
    }
    tokens.push({ kind: 'text', value: part })
  }
  return tokens
}

function tableCells(line: string): string[] {
  return line
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim())
}

/** Tabela em Markdown: a segunda linha, de traços, separa o cabeçalho das demais. */
function parseTable(lines: string[], sources: SourceCitation[]): AnswerBlock {
  const rows = lines.map(tableCells)
  const hasHeader = rows.length > 1 && rows[1].every((cell) => TABLE_SEPARATOR.test(cell))
  const header = hasHeader ? rows[0] : []
  const body = hasHeader ? rows.slice(2) : rows
  return {
    kind: 'table',
    header: header.map((cell) => parseInline(cell, sources)),
    rows: body.map((row) => row.map((cell) => parseInline(cell, sources))),
  }
}

/** Parágrafos, subtítulos, listas, tabelas e negrito — o suficiente para respostas de LLM e extrativas. */
export function parseAnswer(content: string, sources: SourceCitation[]): AnswerBlock[] {
  const blocks: AnswerBlock[] = []

  for (const section of content.split(/\n\s*\n/)) {
    let paragraph: InlineToken[][] = []
    let list: { ordered: boolean; items: InlineToken[][] } | null = null
    let table: string[] | null = null

    const flushText = () => {
      if (paragraph.length > 0) blocks.push({ kind: 'paragraph', lines: paragraph })
      if (list) blocks.push({ kind: 'list', ...list })
      paragraph = []
      list = null
    }

    for (const rawLine of section.split('\n')) {
      const line = rawLine.trim()
      if (!line) continue

      if (TABLE_ROW.test(line)) {
        flushText()
        table = table ?? []
        table.push(line)
        continue
      }
      if (table) {
        blocks.push(parseTable(table, sources))
        table = null
      }
      if (HEADING.test(line)) {
        flushText()
        blocks.push({ kind: 'heading', tokens: parseInline(line.replace(HEADING, ''), sources) })
        continue
      }

      const marker = BULLET.test(line) ? BULLET : NUMBERED.test(line) ? NUMBERED : null
      if (marker) {
        if (paragraph.length > 0) {
          blocks.push({ kind: 'paragraph', lines: paragraph })
          paragraph = []
        }
        const ordered = marker === NUMBERED
        if (list && list.ordered !== ordered) {
          blocks.push({ kind: 'list', ...list })
          list = null
        }
        list = list ?? { ordered, items: [] }
        list.items.push(parseInline(line.replace(marker, ''), sources))
      } else {
        if (list) {
          blocks.push({ kind: 'list', ...list })
          list = null
        }
        paragraph.push(parseInline(line, sources))
      }
    }

    if (table) blocks.push(parseTable(table, sources))
    flushText()
  }

  return blocks
}
