import type { ComponentProps, ReactNode } from 'react'
import { cx } from '../../lib/cx'

interface IconButtonProps extends ComponentProps<'button'> {
  icon: ReactNode
  'aria-label': string
}

export function IconButton({ icon, className, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xs text-ink-soft transition-colors duration-150 hover:bg-paper-sunken hover:text-ink disabled:opacity-45',
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  )
}
