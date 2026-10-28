import type { BadgeTone } from '../../lib/severity'

// Nomes curtos dos documentos do corpus `hanseniase-v2` (research/corpus/hanseniase-v2/README.md).
const DOCUMENT_LABELS: Record<string, string> = {
  'BR-MS-PCDT-HANSENIASE-2022': 'PCDT 2022',
  'BR-MS-ESTRATEGIA-HANSENIASE-2024-2030': 'Estratégia 2024–2030',
  'WHO-LEPROSY-ELIMINATION-TECHNICAL-GUIDANCE-2023': 'OMS 2023',
  'BR-MS-SCTIE-PORTARIA-47-2026': 'Portaria 47/2026',
  'BR-MS-SCTIE-PORTARIA-51-2026': 'Portaria 51/2026',
}

export function documentLabel(documentId: string | null): string {
  if (!documentId) return 'Documento'
  return DOCUMENT_LABELS[documentId] ?? documentId
}

export function pageLabel(start: number | null, end: number | null): string {
  if (start === null) return ''
  return end !== null && end !== start ? `p. ${start}–${end}` : `p. ${start}`
}

// Situação da expansão gravada pelo harness (`expansion_status`).
export function expansionLabel(status: string | null): { text: string; tone: BadgeTone } | null {
  if (!status || status === 'not_applicable') return null
  if (status === 'ok') return { text: 'expansão aplicada', tone: 'success' }
  if (status.startsWith('fallback')) return { text: 'expansão falhou: busca com a pergunta original', tone: 'warning' }
  return { text: status, tone: 'neutral' }
}

export function modelLabel(provider: string | null, model: string | null): string {
  const access = provider === 'claude_cli' ? 'Claude Code' : provider === 'codex_cli' ? 'Codex' : provider
  return [model, access ? `(${access})` : ''].filter(Boolean).join(' ')
}
