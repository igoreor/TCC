import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { useSeedEvaluation } from '../../hooks/useSeedEvaluation'
import styles from './Evaluation.module.css'

export function SeedEvaluationButton() {
  const mutation = useSeedEvaluation()

  return (
    <div className={styles.actionBox}>
      <Button variant="secondary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        {mutation.isPending ? 'Carregando perguntas...' : 'Popular perguntas (seed)'}
      </Button>
      {mutation.isSuccess ? (
        <span className={styles.actionResult}>
          {mutation.data.created} criadas / {mutation.data.total} no total
        </span>
      ) : null}
      {mutation.isError ? <ErrorState error={mutation.error} /> : null}
    </div>
  )
}
