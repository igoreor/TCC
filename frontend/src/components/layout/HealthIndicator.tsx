import { useHealth } from '../../hooks/useHealth'
import type { BadgeTone } from '../../lib/severity'
import { Badge } from '../ui/Badge'
import { Spinner } from '../ui/Spinner'
import styles from './HealthIndicator.module.css'

function statusTone(status: string): BadgeTone {
  if (status === 'ok') return 'success'
  if (status === 'unknown') return 'neutral'
  return 'danger'
}

export function HealthIndicator() {
  const { data, isLoading, isError } = useHealth()

  if (isLoading) return <Spinner label="Verificando API..." />

  if (isError || !data) {
    return <Badge tone="critical">API indisponível</Badge>
  }

  return (
    <div className={styles.wrapper} title="Status do backend">
      <Badge tone={statusTone(data.api)}>API</Badge>
      <Badge tone={statusTone(data.database)}>Banco</Badge>
      <Badge tone={statusTone(data.vectorStore)}>pgvector</Badge>
    </div>
  )
}
