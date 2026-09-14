import styles from './Spinner.module.css'

interface SpinnerProps {
  label?: string
}

export function Spinner({ label = 'Carregando...' }: SpinnerProps) {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
