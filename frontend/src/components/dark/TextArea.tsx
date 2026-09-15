import type { TextareaHTMLAttributes } from 'react'

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={[
        'w-full resize-none rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted',
        'transition-colors duration-200 focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}
