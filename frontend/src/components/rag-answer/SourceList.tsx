import type { Ref } from 'react'
import type { SourceCitation } from '../../api/types'
import { cx } from '../../lib/cx'
import { formatScore } from '../../lib/formatters'
import { metaLabel } from '../primitives/classes'

interface SourceListProps {
  sources: SourceCitation[]
  /** `retrieved`: trechos devolvidos pela busca numa resposta recusada — não foram usados no texto. */
  variant: 'cited' | 'retrieved'
  /** Prefixo dos ids dos itens, alvo dos links de citação no texto da resposta. */
  idPrefix: string
  scores?: Map<string, number>
  activeSource?: number | null
  onSourceHover?: (index: number | null) => void
  listRef?: Ref<HTMLOListElement>
  className?: string
}

export function SourceList({
  sources,
  variant,
  idPrefix,
  scores,
  activeSource,
  onSourceHover,
  listRef,
  className,
}: SourceListProps) {
  if (sources.length === 0) return null

  const heading = variant === 'cited' ? 'Fontes' : 'Trechos encontrados'

  return (
    <section aria-label={heading} className={cx('min-w-0', className)}>
      <h3 className={cx(metaLabel, 'flex items-baseline justify-between gap-3 text-ink-faint')}>
        <span>{heading}</span>
        <span className="tabular-nums">{sources.length}</span>
      </h3>
      {variant === 'retrieved' ? (
        <p className="mt-1.5 text-meta text-ink-faint">Recuperados pela busca, mas não usados: a pergunta foi recusada.</p>
      ) : null}
      <ol ref={listRef} className="mt-2.5">
        {sources.map((source, position) => {
          const index = position + 1
          const score = scores?.get(source.chunk_id)
          return (
            <li
              key={source.chunk_id}
              id={`${idPrefix}-${index}`}
              data-source-index={index}
              tabIndex={-1}
              onMouseEnter={() => onSourceHover?.(index)}
              onMouseLeave={() => onSourceHover?.(null)}
              className={cx(
                'grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-1 border-b border-rule py-3 pr-1 transition-colors duration-150 first:border-t',
                activeSource === index && 'bg-accent-soft/70',
              )}
            >
              <span className="font-mono text-meta text-accent tabular-nums">[{index}]</span>
              <div className="min-w-0">
                <p className="font-serif text-ui font-medium leading-snug text-ink">{source.title}</p>
                <p className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 font-mono text-meta text-ink-faint">
                  <span className="break-all">{source.chunk_id}</span>
                  {score !== undefined ? (
                    <span className="tabular-nums" title="Pontuação final da busca híbrida, após a reordenação (0 a 1)">
                      {formatScore(score)}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-meta text-ink-faint">
                  {source.section}
                  {source.source_page ? ` · p. ${source.source_page}` : ''}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
