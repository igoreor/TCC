import { ExternalLink } from 'lucide-react'
import { useState, type Ref } from 'react'
import type { SourceCitation } from '../../api/types'
import { cx } from '../../lib/cx'
import { metaLabel, textLinkClasses } from '../primitives/classes'

interface SourceListProps {
  sources: SourceCitation[]
  /** `retrieved`: trechos devolvidos pela busca numa resposta recusada — não foram usados no texto. */
  variant: 'cited' | 'retrieved'
  /** Prefixo dos ids dos itens, alvo dos links de citação no texto da resposta. */
  idPrefix: string
  activeSource?: number | null
  onSourceHover?: (index: number | null) => void
  listRef?: Ref<HTMLOListElement>
  className?: string
}

/** "Ministério da Saúde (Brasil) · 2022 · diretriz brasileira" */
function documentMeta(source: SourceCitation) {
  const document = source.document
  if (!document) return null
  const scope =
    document.jurisdiction === 'nacional'
      ? 'diretriz brasileira'
      : document.jurisdiction === 'internacional'
        ? 'recomendação internacional'
        : null
  return [document.institution, document.year, scope].filter(Boolean).join(' · ')
}

function languageNote(source: SourceCitation) {
  if (source.document?.language === 'en') return 'Documento em inglês: o trecho aparece no idioma original.'
  // as traduções da OMS declaram que a edição em inglês é a autêntica
  if (source.document?.edition?.startsWith('Tradução') && source.document.jurisdiction === 'internacional') {
    return 'Tradução para o português; a edição em inglês da OMS é a autêntica.'
  }
  return null
}

export function SourceList({
  sources,
  variant,
  idPrefix,
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
        {sources.map((source, position) => (
          <SourceItem
            key={source.chunk_id}
            source={source}
            index={source.index ?? position + 1}
            idPrefix={idPrefix}
            active={activeSource === (source.index ?? position + 1)}
            onHover={onSourceHover}
          />
        ))}
      </ol>
    </section>
  )
}

function SourceItem({
  source,
  index,
  idPrefix,
  active,
  onHover,
}: {
  source: SourceCitation
  index: number
  idPrefix: string
  active: boolean
  onHover?: (index: number | null) => void
}) {
  const [showExcerpt, setShowExcerpt] = useState(false)
  const documentTitle = source.document?.short_title ?? source.document?.title ?? source.title
  const meta = documentMeta(source)
  const note = languageNote(source)
  const excerptId = `${idPrefix}-${index}-trecho`

  return (
    <li
      id={`${idPrefix}-${index}`}
      data-source-index={index}
      tabIndex={-1}
      onMouseEnter={() => onHover?.(index)}
      onMouseLeave={() => onHover?.(null)}
      className={cx(
        'grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-1 border-b border-rule py-3 pr-1 transition-colors duration-150 first:border-t',
        active && 'bg-accent-soft/70',
      )}
    >
      <span className="font-mono text-meta text-accent tabular-nums">[{index}]</span>
      <div className="min-w-0">
        <p className="font-serif text-ui font-medium leading-snug text-ink" title={source.document?.title}>
          {documentTitle}
        </p>
        {meta ? <p className="mt-0.5 text-meta text-ink-faint">{meta}</p> : null}
        <p className="mt-1 text-meta text-ink-soft">
          {source.title}
          {source.page_label ? <span className="whitespace-nowrap">{` · p. ${source.page_label}`}</span> : null}
        </p>
        {note ? <p className="mt-1 text-meta text-ink-faint italic">{note}</p> : null}
        {source.verified === false ? (
          <p className="mt-1 text-meta text-ink-faint">
            A relação entre este trecho e o texto não foi confirmada automaticamente.
          </p>
        ) : null}
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta">
          {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className={textLinkClasses}
              title={source.reference}
            >
              {source.pdf_page ? 'Abrir no documento' : 'Documento oficial'}
              <ExternalLink aria-hidden="true" className="size-3" />
            </a>
          ) : null}
          <button
            type="button"
            aria-expanded={showExcerpt}
            aria-controls={excerptId}
            onClick={() => setShowExcerpt((current) => !current)}
            className="text-ink-soft underline decoration-rule-control underline-offset-3 hover:text-ink"
          >
            {showExcerpt ? 'Ocultar trecho' : 'Ver trecho'}
          </button>
        </p>
        {showExcerpt ? (
          <blockquote
            id={excerptId}
            className="mt-2 max-h-64 overflow-y-auto border-l-2 border-rule-control pl-3 text-meta whitespace-pre-line text-ink-soft"
          >
            {source.excerpt}
          </blockquote>
        ) : null}
      </div>
    </li>
  )
}
