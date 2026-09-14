import { Link } from 'react-router-dom'
import type { SourceCitation } from '../../api/types'
import styles from './Chat.module.css'

interface SourcesListProps {
  sources: SourceCitation[]
}

export function SourcesList({ sources }: SourcesListProps) {
  if (!sources.length) return null

  return (
    <details className={styles.sources}>
      <summary>Fontes ({sources.length})</summary>
      <ul>
        {sources.map((source) => (
          <li key={source.chunk_id}>
            <Link to={`/base/chunks/${encodeURIComponent(source.chunk_id)}`}>{source.title}</Link>
            {' — '}
            {source.section}
            {source.source_page ? `, p. ${source.source_page}` : ''}
          </li>
        ))}
      </ul>
    </details>
  )
}
