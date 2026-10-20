import type { SafetyInfo } from '../../api/types'
import { cx } from '../../lib/cx'
import { RiskScale } from './RiskScale'

interface SafetyNoteProps {
  safety: SafetyInfo
  className?: string
}

export function SafetyNote({ safety, className }: SafetyNoteProps) {
  const needsEvaluation = safety.requiresProfessionalEvaluation

  return (
    <aside
      aria-label="Nota de segurança"
      className={cx('border-l-2 pl-4', needsEvaluation ? 'border-caution' : 'border-rule-strong', className)}
    >
      <RiskScale level={safety.riskLevel} />
      {needsEvaluation ? (
        <p className="mt-2 text-small font-medium text-caution">Requer avaliação profissional presencial.</p>
      ) : null}
      <p className="mt-1.5 text-small text-ink-soft">{safety.disclaimer}</p>
    </aside>
  )
}
