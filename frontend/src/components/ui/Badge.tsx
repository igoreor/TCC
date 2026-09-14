import type { ReactNode } from 'react'
import type { BadgeTone } from '../../lib/severity'
import styles from './Badge.module.css'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>
}
