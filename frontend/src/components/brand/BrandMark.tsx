import { cx } from '../../lib/cx'

interface BrandMarkProps {
  className?: string
  dotClassName?: string
}

/** Colchetes com um ponto: a forma de uma citação, que é o centro do produto. */
export function BrandMark({ className, dotClassName = 'fill-accent' }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cx('shrink-0', className)}>
      <path d="M8.5 3.75H4.75v16.5H8.5M15.5 3.75h3.75v16.5H15.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="2.25" className={dotClassName} />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2', className)}>
      <BrandMark className="h-5 w-5 text-ink" />
      <span className="font-serif text-subheading font-semibold tracking-[-0.01em] text-ink">NexoHansen</span>
    </span>
  )
}
