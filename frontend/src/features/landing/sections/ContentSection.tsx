import type { ReactNode } from 'react'

interface ContentSectionProps {
  id: string
  title: string
  paragraphs: readonly string[]
  icon: ReactNode
  align?: 'left' | 'right'
}

export function ContentSection({ id, title, paragraphs, icon, align = 'left' }: ContentSectionProps) {
  const reversed = align === 'right'
  return (
    <section id={id} className="mx-auto max-w-5xl px-6 py-14 md:py-20">
      <div
        className={[
          'flex flex-col items-start gap-6 md:items-center md:gap-12',
          reversed ? 'md:flex-row-reverse' : 'md:flex-row',
        ].join(' ')}
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-2 text-accent motion-safe:animate-fade-in-up">
          {icon}
        </div>
        <div className="flex flex-col gap-3 motion-safe:animate-fade-in-up">
          <h2 className="font-display text-2xl font-semibold text-text-primary">{title}</h2>
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-sm leading-relaxed text-text-secondary md:text-base">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
