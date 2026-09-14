import type { EvaluationRunResult } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { formatPercent } from '../../lib/formatters'
import styles from './Evaluation.module.css'

interface EvaluationSummaryCardsProps {
  result: EvaluationRunResult
}

export function EvaluationSummaryCards({ result }: EvaluationSummaryCardsProps) {
  const items = [
    { label: 'Perguntas', value: String(result.total) },
    { label: 'Chunk ideal encontrado', value: String(result.matchedIdealChunkCount) },
    { label: 'Recall aproximado', value: formatPercent(result.idealChunkRecallApproximation) },
    { label: 'Fallbacks acionados', value: String(result.fallbackCount) },
  ]

  return (
    <div className={styles.summaryGrid}>
      {items.map((item) => (
        <Card key={item.label} className={styles.summaryCard}>
          <span className={styles.summaryValue}>{item.value}</span>
          <span className={styles.summaryLabel}>{item.label}</span>
        </Card>
      ))}
    </div>
  )
}
