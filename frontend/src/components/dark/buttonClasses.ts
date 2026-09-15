export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary:
    'border border-accent/40 bg-accent/10 text-accent shadow-[0_0_24px_-6px_rgba(45,212,191,0.5)] hover:border-accent/60 hover:bg-accent/15',
  secondary: 'border border-white/10 bg-transparent text-zinc-300 hover:border-white/20 hover:text-zinc-100',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-2',
}

export function buttonClasses(variant: ButtonVariant = 'primary', className?: string): string {
  return [base, variants[variant], className].filter(Boolean).join(' ')
}
