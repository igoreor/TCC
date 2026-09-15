import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { ChunkDTO } from '../../api/types'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { useChunk } from '../../hooks/useChunk'
import { criticalityTone, safetyLevelTone } from '../../lib/severity'
import styles from './Knowledge.module.css'

const flagLabels: Array<{ key: keyof ChunkDTO & string; label: string }> = [
  { key: 'medicationRelated', label: 'Medicamento' },
  { key: 'dosageRelated', label: 'Dosagem' },
  { key: 'contraindicationRelated', label: 'Contraindicação' },
  { key: 'examRelated', label: 'Exame' },
  { key: 'diagnosisRelated', label: 'Diagnóstico' },
  { key: 'reactionRelated', label: 'Reação' },
]

export function ChunkDetailPage() {
  const { chunkId } = useParams<{ chunkId: string }>()
  const { data: chunk, isLoading, isError, error } = useChunk(chunkId)
  const [showMetadata, setShowMetadata] = useState(false)

  if (isLoading) return <Spinner label="Carregando chunk..." />
  if (isError) return <ErrorState error={error} />
  if (!chunk) return null

  return (
    <div className={styles.detailPage}>
      <Link to="/dashboard/base" className={styles.backLink}>
        ← Voltar para a base de conhecimento
      </Link>
      <Card className={styles.detailCard}>
        <h2>{chunk.title}</h2>
        <p className={styles.chunkMeta}>
          <code>{chunk.chunkId}</code> · {chunk.section}
          {chunk.subsection ? ` / ${chunk.subsection}` : ''} · documento <code>{chunk.documentId}</code>
          {chunk.sourcePage ? ` · p. ${chunk.sourcePage}` : ''}
        </p>

        <div className={styles.detailBadges}>
          <Badge tone={criticalityTone(chunk.clinicalCriticality)}>Criticidade: {chunk.clinicalCriticality}</Badge>
          <Badge tone={safetyLevelTone(chunk.safetyLevel)}>{chunk.safetyLevel}</Badge>
          <Badge tone="neutral">{chunk.clinicalPhase}</Badge>
          <Badge tone="neutral">{chunk.informationType}</Badge>
          <Badge tone="neutral">{chunk.targetDemographic}</Badge>
          <Badge tone="neutral">{chunk.diseaseClassification}</Badge>
        </div>

        <p className={styles.detailContent}>{chunk.content}</p>

        <div className={styles.flagsGrid}>
          {flagLabels.map((flag) => (
            <span key={flag.key} className={chunk[flag.key] ? styles.flagOn : styles.flagOff}>
              {chunk[flag.key] ? '✓' : '—'} {flag.label}
            </span>
          ))}
        </div>

        {chunk.keywords.length ? (
          <div className={styles.pillRow}>
            {chunk.keywords.map((keyword) => (
              <span key={keyword} className={styles.pill}>
                {keyword}
              </span>
            ))}
          </div>
        ) : null}

        {chunk.sourceReference ? <p className={styles.sourceReference}>{chunk.sourceReference}</p> : null}

        <button type="button" className={styles.metadataToggle} onClick={() => setShowMetadata((v) => !v)}>
          {showMetadata ? 'Ocultar metadata bruta' : 'Ver metadata bruta'}
        </button>
        {showMetadata ? <pre className={styles.metadataBlock}>{JSON.stringify(chunk.metadata, null, 2)}</pre> : null}
      </Card>
    </div>
  )
}
