import type { SafetyInfo, SourceCitation } from '../../api/types'
import { SafetyAlert } from './SafetyAlert'
import { SourceChips } from './SourceChips'

interface RagAnswerBubbleProps {
  content: string
  sources: SourceCitation[]
  safety: SafetyInfo
}

export function RagAnswerBubble({ content, sources, safety }: RagAnswerBubbleProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2 p-4 shadow-soft">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">{content}</p>
      <SafetyAlert safety={safety} />
      <SourceChips sources={sources} />
    </div>
  )
}
