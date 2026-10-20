import { Fragment } from 'react'
import type { IntentCategory, SafetyInfo } from '../../api/types'
import { cx } from '../../lib/cx'
import { fallbackReasonLabel, intentLabel } from '../../lib/labels'
import { metaLabel } from '../primitives/classes'

interface AnswerStatusProps {
  safety: SafetyInfo
  intent?: IntentCategory
  citedCount: number
  className?: string
}

export function AnswerStatus({ safety, intent, citedCount, className }: AnswerStatusProps) {
  const refused = safety.fallbackTriggered
  const details: string[] = []
  if (refused && safety.reason) details.push(fallbackReasonLabel(safety.reason))
  if (intent) details.push(`intenção: ${intentLabel(intent).toLowerCase()}`)
  if (!refused && citedCount > 0) details.push(citedCount === 1 ? '1 fonte' : `${citedCount} fontes`)

  return (
    <p className={cx('flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-meta text-ink-faint', className)}>
      {refused ? <span aria-hidden="true" className="h-2.5 w-2.5 bg-hatch text-ink-soft" /> : null}
      <span className={cx(metaLabel, refused ? 'text-ink' : 'text-accent')}>{refused ? 'Recusa segura' : 'Resposta'}</span>
      {details.map((detail) => (
        <Fragment key={detail}>
          <span aria-hidden="true">·</span>
          <span>{detail}</span>
        </Fragment>
      ))}
    </p>
  )
}
