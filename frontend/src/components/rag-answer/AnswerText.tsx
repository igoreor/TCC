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
        if (block.kind === 'heading') {
          return (
            <h4 key={index} className="pt-1 font-serif text-ui font-semibold text-ink">
              {renderInline(block.tokens)}
            </h4>
          )
        }
        if (block.kind === 'table') {
          return (
            <div key={index} className="overflow-x-auto">
              <table className="w-full border-collapse text-small">
                {block.header.length ? (
                  <thead>
                    <tr>
                      {block.header.map((cell, cellIndex) => (
                        <th
                          key={cellIndex}
                          className="border-b border-rule-control px-2 py-1.5 text-left align-bottom font-semibold"
                        >
                          {renderInline(cell)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                ) : null}
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-rule">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-2 py-1.5 align-top">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
