import type { RetrievalSearchResult } from '../../api/types'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { intentLabel } from '../../lib/labels'
import { riskTone } from '../../lib/severity'
import { ChunkScoreCard } from './ChunkScoreCard'
import styles from './Retrieval.module.css'

interface RetrievalResultsProps {
  result: RetrievalSearchResult
}

export function RetrievalResults({ result }: RetrievalResultsProps) {
  return (
    <div className={styles.results}>
      <div className={styles.summary}>
        <Badge tone="neutral">Intenção: {intentLabel(result.intent)}</Badge>
        <Badge tone={riskTone(result.riskLevel)}>Risco: {result.riskLevel}</Badge>
        <span className={styles.summaryCaption}>
          Ranking bruto da busca híbrida — antes do reranking de segurança usado no chat.
        </span>
      </div>
      {result.chunks.length === 0 ? (
        <EmptyState title="Nenhum chunk encontrado" description="Ajuste a pergunta, o modo de busca ou os filtros." />
      ) : (
        <div className={styles.chunkList}>
          {result.chunks.map((chunk) => (
            <ChunkScoreCard key={chunk.chunkId} chunk={chunk} />
          ))}
        </div>
      )}
    </div>
  )
}
