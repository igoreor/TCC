import type { ReactNode } from 'react'
import { BrandMark } from '../../components/brand/BrandMark'
import { QuestionLine } from '../../components/rag-answer/QuestionLine'
import { useScrollToLatest } from '../../hooks/useScrollToLatest'
import { cx } from '../../lib/cx'

interface ComparisonEntry {
  key: string
  question: string
  content: ReactNode
}

interface ComparisonColumnProps {
  id: string
  variant: 'rag' | 'generic'
  title: string
  meta: string
  emptyNote: string
  entries: ComparisonEntry[]
  scrollSignal: string
  /** Abaixo de `md` só uma coluna aparece por vez; o seletor da página faz o papel do cabeçalho. */
  hiddenOnMobile: boolean
}

export function ComparisonColumn({
  id,
  variant,
  title,
  meta,
  emptyNote,
  entries,
  scrollSignal,
  hiddenOnMobile,
}: ComparisonColumnProps) {
  const { containerRef, latestRef } = useScrollToLatest<HTMLDivElement, HTMLLIElement>(scrollSignal)
  const titleId = `${id}-titulo`

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cx(
        'min-h-0 flex-1 flex-col md:flex',
        hiddenOnMobile ? 'hidden' : 'flex',
        variant === 'rag' ? 'md:border-r md:border-rule' : 'bg-paper-sunken/40',
      )}
    >
      <header className="hidden flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-rule px-5 py-3 sm:px-8 md:flex">
        <h2 id={titleId} className="flex items-center gap-2.5 font-serif text-subheading font-semibold text-ink">
          {variant === 'rag' ? (
            <BrandMark className="size-4 text-ink" />
          ) : (
            <span aria-hidden="true" className="size-3 border border-rule-control" />
          )}
          {title}
        </h2>
        <p className="font-mono text-micro text-ink-faint">{meta}</p>
      </header>

      <div
        ref={containerRef}
        role="log"
        aria-labelledby={titleId}
        className="relative min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8"
      >
        {entries.length === 0 ? (
          <p className="max-w-sm text-small text-pretty text-ink-faint">{emptyNote}</p>
        ) : (
          <ol className="space-y-8">
            {entries.map((entry, index) => (
              <li
                key={entry.key}
                ref={index === entries.length - 1 ? latestRef : undefined}
                className={cx(index > 0 && 'border-t border-rule pt-8')}
              >
                <QuestionLine question={entry.question} />
                <div className="mt-5">{entry.content}</div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
