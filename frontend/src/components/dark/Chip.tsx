import type { HTMLAttributes, ReactNode } from 'react'

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  icon?: ReactNode
}

export function Chip({ icon, className, children, ...props }: ChipProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs text-text-secondary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {icon}
      {children}
    </span>
  )
}
