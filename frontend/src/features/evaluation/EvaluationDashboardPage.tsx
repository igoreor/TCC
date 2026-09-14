import { useState } from 'react'
import type { EvaluationRunResult } from '../../api/types'
import { ErrorState } from '../../components/ui/ErrorState'
import { useRunEvaluation } from '../../hooks/useRunEvaluation'
import { EvaluationQuestionsTable } from './EvaluationQuestionsTable'
import { EvaluationResultsTable } from './EvaluationResultsTable'
import { EvaluationSummaryCards } from './EvaluationSummaryCards'
import { RunEvaluationButton } from './RunEvaluationButton'
import { SeedEvaluationButton } from './SeedEvaluationButton'
import styles from './Evaluation.module.css'

export function EvaluationDashboardPage() {
  const runMutation = useRunEvaluation()
  const [result, setResult] = useState<EvaluationRunResult | null>(null)

  function handleRun() {
    runMutation.mutate(undefined, {
      onSuccess: (data) => setResult(data),
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h2>Avaliação</h2>
        <SeedEvaluationButton />
      </div>

      <section className={styles.section}>
        <h3>Perguntas de avaliação</h3>
        <EvaluationQuestionsTable />
      </section>

      <section className={styles.section}>
        <h3>Execução</h3>
        <RunEvaluationButton onRun={handleRun} isRunning={runMutation.isPending} />
        {runMutation.isError ? <ErrorState error={runMutation.error} /> : null}
        {result ? (
          <>
            <EvaluationSummaryCards result={result} />
            <EvaluationResultsTable result={result} />
          </>
        ) : null}
      </section>
    </div>
  )
}
