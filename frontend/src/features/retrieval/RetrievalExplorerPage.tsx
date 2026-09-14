import { useMutation } from '@tanstack/react-query'
import { searchRetrieval } from '../../api/retrieval'
import { ErrorState } from '../../components/ui/ErrorState'
import type { RetrievalFormValue } from './RetrievalForm'
import { RetrievalForm } from './RetrievalForm'
import { RetrievalResults } from './RetrievalResults'
import styles from './Retrieval.module.css'

export function RetrievalExplorerPage() {
  const mutation = useMutation({ mutationFn: searchRetrieval })

  function handleSubmit(value: RetrievalFormValue) {
    mutation.mutate(value)
  }

  return (
    <div className={styles.page}>
      <h2>Retrieval Explorer</h2>
      <RetrievalForm onSubmit={handleSubmit} isSearching={mutation.isPending} />
      {mutation.isError ? <ErrorState error={mutation.error} /> : null}
      {mutation.data ? <RetrievalResults result={mutation.data} /> : null}
    </div>
  )
}
