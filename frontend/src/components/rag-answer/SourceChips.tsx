import { FileText } from 'lucide-react'
import type { SourceCitation } from '../../api/types'
import { Chip } from '../dark/Chip'

interface SourceChipsProps {
  sources: SourceCitation[]
}

export function SourceChips({ sources }: SourceChipsProps) {
  if (!sources.length) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {sources.map((source) => (
        <Chip
          key={source.chunk_id}
          icon={<FileText className="h-3 w-3" aria-hidden="true" />}
          title={`${source.title} — ${source.section}${source.source_page ? `, p. ${source.source_page}` : ''}`}
        >
          {source.title}
        </Chip>
      ))}
    </div>
  )
}
