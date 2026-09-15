import type { ReactNode } from 'react'
import type { BadgeTone } from '../../lib/severity'

const toneClasses: Record<BadgeTone, string> = {
  success: 'bg-risk-success/15 text-risk-success border-risk-success/30',
  warning: 'bg-risk-warning/15 text-risk-warning border-risk-warning/30',
  danger: 'bg-risk-danger/15 text-risk-danger border-risk-danger/30',
  critical: 'bg-risk-critical/15 text-risk-critical border-risk-critical/30',
  neutral: 'bg-risk-neutral/15 text-risk-neutral border-risk-neutral/30',
}

interface RiskBadgeProps {
  tone: BadgeTone
  children: ReactNode
}

export function RiskBadge({ tone, children }: RiskBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}
