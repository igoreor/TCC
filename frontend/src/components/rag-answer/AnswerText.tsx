import { Fragment, useMemo } from 'react'
import type { SourceCitation } from '../../api/types'
import { cx } from '../../lib/cx'
import type { InlineToken } from './parseAnswer'
import { parseAnswer } from './parseAnswer'

interface AnswerTextProps {
  content: string
  sources: SourceCitation[]
  /** Prefixo dos ids dos itens da lista de fontes: cada marcador é um link para a sua fonte. */
  sourceIdPrefix: string
  activeSource?: number | null
  onCitationHover?: (index: number | null) => void
  onCitationSelect?: (index: number) => void
  className?: string
}

export function AnswerText({
  content,
  sources,
  sourceIdPrefix,
  activeSource,
  onCitationHover,
  onCitationSelect,
  className,
}: AnswerTextProps) {
  const blocks = useMemo(() => parseAnswer(content, sources), [content, sources])

  function renderInline(tokens: InlineToken[]) {
    return tokens.map((token, index) => {
      if (token.kind === 'strong') {
        return (
          <strong key={index} className="font-semibold">
            {token.value}
          </strong>
        )
      }
      if (token.kind === 'citation') {
        const source = sources[token.index - 1]
        // Link inline (e não <button>, que é inline-block): a pontuação seguinte não se separa do marcador.
        return (
          <a
            key={index}
            href={`#${sourceIdPrefix}-${token.index}`}
            aria-label={`Fonte ${token.index}: ${source.title}`}
            onMouseEnter={() => onCitationHover?.(token.index)}
            onMouseLeave={() => onCitationHover?.(null)}
            onFocus={() => onCitationHover?.(token.index)}
            onBlur={() => onCitationHover?.(null)}
            onClick={(event) => {
              event.preventDefault()
              onCitationSelect?.(token.index)
            }}
            className={cx(
              'rounded-xs px-px font-mono text-[0.8em] text-accent transition-colors duration-150 hover:bg-accent-soft',
              activeSource === token.index && 'bg-accent-soft',
            )}
          >
            [{token.index}]
          </a>
        )
      }
      return <Fragment key={index}>{token.value}</Fragment>
    })
  }

  return (
    <div className={cx('space-y-3 text-ui text-pretty text-ink', className)}>
      {blocks.map((block, index) => {
        if (block.kind === 'paragraph') {
          return (
            <p key={index}>
              {block.lines.map((line, lineIndex) => (
                <Fragment key={lineIndex}>
                  {lineIndex > 0 ? <br /> : null}
                  {renderInline(line)}
                </Fragment>
              ))}
            </p>
          )
        }
        const ListTag = block.ordered ? 'ol' : 'ul'
        return (
          <ListTag
            key={index}
            className={cx(
              'space-y-1.5 pl-5 marker:text-ink-faint',
              block.ordered ? 'list-decimal marker:font-mono marker:text-meta' : 'list-disc',
            )}
          >
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex} className="pl-1">
                {renderInline(item)}
              </li>
            ))}
          </ListTag>
        )
      })}
    </div>
  )
}
