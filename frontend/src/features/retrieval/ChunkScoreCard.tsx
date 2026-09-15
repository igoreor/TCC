import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ChunkDTO } from '../../api/types'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { ScoreBar } from '../../components/ui/ScoreBar'
import { criticalityTone, safetyLevelTone } from '../../lib/severity'
import styles from './Retrieval.module.css'

interface ChunkScoreCardProps {
  chunk: ChunkDTO
}

export function ChunkScoreCard({ chunk }: ChunkScoreCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isLong = chunk.content.length > 220
  const content = expanded || !isLong ? chunk.content : `${chunk.content.slice(0, 220)}...`

  return (
    <Card className={styles.chunkCard}>
      <div className={styles.chunkHeader}>
        <div>
          <strong>{chunk.title}</strong>
          <div className={styles.chunkMeta}>
            {chunk.section}
            {chunk.subsection ? ` / ${chunk.subsection}` : ''} · <code>{chunk.chunkId}</code>
          </div>
        </div>
        <div className={styles.chunkBadges}>
          <Badge tone={criticalityTone(chunk.clinicalCriticality)}>{chunk.clinicalCriticality}</Badge>
          <Badge tone={safetyLevelTone(chunk.safetyLevel)}>{chunk.safetyLevel}</Badge>
        </div>
      </div>

      <div className={styles.scores}>
        <ScoreBar label="Vetorial" value={chunk.vectorScore} />
        <ScoreBar label="Textual" value={chunk.keywordScore} />
        <ScoreBar label="Final" value={chunk.finalScore} />
      </div>

      <p className={styles.chunkContent}>{content}</p>
      {isLong ? (
        <button type="button" className={styles.expandButton} onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Ver menos' : 'Ver mais'}
        </button>
      ) : null}

      <Link to={`/dashboard/base/chunks/${encodeURIComponent(chunk.chunkId)}`} className={styles.chunkLink}>
        Ver detalhe do chunk →
      </Link>
    </Card>
  )
}
