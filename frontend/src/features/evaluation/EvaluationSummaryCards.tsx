import type { EvaluationRunResult } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { formatPercent } from '../../lib/formatters'
import styles from './Evaluation.module.css'

interface EvaluationSummaryCardsProps {
  result: EvaluationRunResult
}

export function EvaluationSummaryCards({ result }: EvaluationSummaryCardsProps) {
  const overall = result.summary?.overall ?? {}
  const percent = (value: number | null | undefined) => (typeof value === 'number' ? formatPercent(value) : '—')
  const items = [
    { label: 'Perguntas', value: String(result.total) },
    { label: 'Comportamento esperado', value: percent(overall.correctBehaviour) },
    { label: 'Recall@8 da evidência', value: formatPercent(result.idealChunkRecallApproximation) },
    { label: 'Fatos-chave na resposta', value: percent(overall.keyFactCoverage) },
    { label: 'Recusas', value: String(result.fallbackCount) },
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
