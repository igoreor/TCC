import { TriangleAlert } from 'lucide-react'
import type { SafetyInfo } from '../../api/types'
import { fallbackTone, riskTone } from '../../lib/severity'
import { RiskBadge } from './RiskBadge'

interface SafetyAlertProps {
  safety: SafetyInfo
}

const boxToneClasses: Record<'danger' | 'critical', string> = {
  danger: 'border-risk-danger/40 bg-risk-danger/10 text-risk-danger',
  critical: 'border-risk-critical/40 bg-risk-critical/10 text-risk-critical',
}

export function SafetyAlert({ safety }: SafetyAlertProps) {
  const isHighRisk = safety.riskLevel === 'Alto' || safety.riskLevel === 'Muito alto' || safety.fallbackTriggered

  if (!isHighRisk) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <RiskBadge tone={riskTone(safety.riskLevel)}>Risco: {safety.riskLevel}</RiskBadge>
        <p className="text-xs text-text-muted">{safety.disclaimer}</p>
      </div>
    )
  }

  const boxTone = safety.riskLevel === 'Muito alto' ? 'critical' : 'danger'

  return (
    <div className={`flex flex-col gap-2 rounded-xl border p-3.5 ${boxToneClasses[boxTone]}`}>
      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
        <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Risco: {safety.riskLevel}</span>
        {safety.fallbackTriggered ? (
          <RiskBadge tone={fallbackTone(safety.fallbackTriggered)}>Fallback acionado</RiskBadge>
        ) : null}
      </div>
      {safety.reason ? <p className="text-xs opacity-80">{safety.reason}</p> : null}
      <p className="text-xs text-text-primary/90">{safety.disclaimer}</p>
      {safety.requiresProfessionalEvaluation ? (
        <p className="text-xs font-medium">Requer avaliação profissional.</p>
      ) : null}
    </div>
  )
}
