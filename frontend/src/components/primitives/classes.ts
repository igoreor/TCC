import { cx } from '../../lib/cx'

export type ButtonVariant = 'primary' | 'secondary' | 'quiet'
export type ButtonSize = 'md' | 'sm'

const buttonBase =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xs font-medium transition-colors duration-150 disabled:opacity-45'

const buttonSizes: Record<ButtonSize, string> = {
  md: 'h-11 px-5 text-ui',
  sm: 'h-9 px-3.5 text-small',
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink-soft disabled:hover:bg-ink',
  secondary: 'border border-rule-control text-ink hover:border-ink hover:bg-paper-sunken',
  quiet: 'text-ink-soft hover:bg-paper-sunken hover:text-ink',
}

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return cx(buttonBase, buttonSizes[size], buttonVariants[variant], className)
}

/** Link de texto: o único lugar, além das citações, onde o azul-petróleo aparece como cor de texto. */
export const textLinkClasses =
  'inline-flex items-center gap-1.5 text-accent underline decoration-accent/35 underline-offset-3 transition-colors hover:decoration-accent'

/** Rótulo técnico em mono caixa-alta: seções, metadados e estados. A cor fica a cargo de quem usa. */
export const metaLabel = 'font-mono text-micro uppercase tracking-label'
