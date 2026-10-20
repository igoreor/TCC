import type { ReactNode } from 'react'
import { metaLabel } from '../../components/primitives/classes'
import { cx } from '../../lib/cx'

interface SectionLabelProps {
  index: string
  children: ReactNode
  tone?: 'paper' | 'night'
}

export function SectionLabel({ index, children, tone = 'paper' }: SectionLabelProps) {
  const night = tone === 'night'
  return (
    <p className={cx(metaLabel, 'flex items-center gap-3', night ? 'text-night-soft' : 'text-ink-faint')}>
      <span className={night ? 'text-night-accent' : 'text-accent'}>{index}</span>
      <span aria-hidden="true" className={cx('h-px w-8', night ? 'bg-night-rule' : 'bg-rule-strong')} />
      {children}
    </p>
  )
}
