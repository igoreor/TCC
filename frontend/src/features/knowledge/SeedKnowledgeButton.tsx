import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { useSeedKnowledge } from '../../hooks/useSeedKnowledge'
import styles from './Knowledge.module.css'

export function SeedKnowledgeButton() {
  const mutation = useSeedKnowledge()

  return (
    <div className={styles.seedBox}>
      <Button variant="secondary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        {mutation.isPending ? 'Indexando documentos...' : 'Carregar base oficial'}
      </Button>
      {mutation.isSuccess ? (
        <span className={styles.seedResult}>
          {mutation.data.total} trechos indexados ({mutation.data.inserted} com embedding novo)
        </span>
      ) : null}
      {mutation.isError ? <ErrorState error={mutation.error} /> : null}
    </div>
  )
}
