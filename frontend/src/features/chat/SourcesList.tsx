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
            [{source.index}] {source.reference}{' '}
            {source.url ? (
              <a href={source.url} target="_blank" rel="noreferrer">
                abrir documento
              </a>
            ) : null}
            {' · '}
            <Link to={`/dashboard/base/chunks/${encodeURIComponent(source.chunk_id)}`}>trecho {source.chunk_id}</Link>
            {source.verified === false ? ' · relação não confirmada automaticamente' : ''}
          </li>
        ))}
      </ul>
    </details>
  )
}
