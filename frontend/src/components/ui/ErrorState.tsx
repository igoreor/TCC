import { ApiError } from '../../api/client'
import styles from './ErrorState.module.css'

interface ErrorStateProps {
  error: unknown
}

export function ErrorState({ error }: ErrorStateProps) {
  const message = error instanceof ApiError ? error.message : 'Ocorreu um erro inesperado.'
  const issues = error instanceof ApiError ? error.issues : undefined

  return (
    <div className={styles.wrapper} role="alert">
      <p className={styles.message}>{message}</p>
      {issues ? <pre className={styles.issues}>{JSON.stringify(issues, null, 2)}</pre> : null}
    </div>
  )
}
