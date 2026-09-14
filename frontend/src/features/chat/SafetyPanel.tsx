import type { SafetyInfo } from '../../api/types'
import { Badge } from '../../components/ui/Badge'
import { fallbackTone, riskTone } from '../../lib/severity'
import styles from './Chat.module.css'

interface SafetyPanelProps {
  safety: SafetyInfo
}

export function SafetyPanel({ safety }: SafetyPanelProps) {
  return (
    <div className={styles.safetyPanel}>
      <div className={styles.safetyBadges}>
        <Badge tone={riskTone(safety.riskLevel)}>Risco: {safety.riskLevel}</Badge>
        <Badge tone={fallbackTone(safety.fallbackTriggered)}>
          {safety.fallbackTriggered ? 'Fallback acionado' : 'Sem fallback'}
        </Badge>
        {safety.requiresProfessionalEvaluation ? <Badge tone="warning">Requer avaliação profissional</Badge> : null}
      </div>
      {safety.reason ? <p className={styles.safetyReason}>{safety.reason}</p> : null}
      <p className={styles.safetyDisclaimer}>{safety.disclaimer}</p>
    </div>
  )
}
