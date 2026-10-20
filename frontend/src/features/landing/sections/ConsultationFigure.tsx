import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { metaLabel, textLinkClasses } from '../../../components/primitives/classes'
import { AnswerStatus } from '../../../components/rag-answer/AnswerStatus'
import { AnswerText } from '../../../components/rag-answer/AnswerText'
import { QuestionLine } from '../../../components/rag-answer/QuestionLine'
import { SafetyNote } from '../../../components/rag-answer/SafetyNote'
import { SourceList } from '../../../components/rag-answer/SourceList'
import { useSourceHighlight } from '../../../components/rag-answer/useSourceHighlight'
import { cx } from '../../../lib/cx'
import { figureContent, figureExample } from '../content'

interface ConsultationFigureProps {
  onAsk: (question: string) => void
}

/**
 * Fig. 1 — uma consulta anotada. Usa as mesmas peças do registro real da gaveta
 * (QuestionLine, AnswerText, SafetyNote, SourceList), só com dados de exemplo.
 */
export function ConsultationFigure({ onAsk }: ConsultationFigureProps) {
  const highlight = useSourceHighlight()
  const { question, intent, answer, sources, safety } = figureExample

  return (
    <figure>
      <div className="border border-rule bg-paper-raised shadow-raised">
        <div
          className={cx(
            metaLabel,
            'flex items-center justify-between gap-4 border-b border-rule px-5 py-2.5 text-ink-faint',
          )}
        >
          <span>Consulta</span>
          <span>Exemplo ilustrativo</span>
        </div>

        <div className="@container py-6 pl-12 pr-5 sm:py-8 sm:pr-8">
          <Annotated n={1}>
            <QuestionLine question={question} />
          </Annotated>

          <div className="mt-7 grid gap-x-10 gap-y-8 @2xl:grid-cols-[minmax(0,1fr)_14rem]">
            <div className="min-w-0">
              <Annotated n={2}>
                <AnswerStatus safety={safety} intent={intent} citedCount={sources.length} />
                <AnswerText
                  className="mt-3"
                  content={answer}
                  sources={sources}
                  sourceIdPrefix={highlight.idPrefix}
                  activeSource={highlight.active}
                  onCitationHover={highlight.setActive}
                  onCitationSelect={highlight.select}
                />
              </Annotated>
              <Annotated n={3} className="mt-6">
                <SafetyNote safety={safety} />
              </Annotated>
            </div>
            <Annotated n={4}>
              <SourceList
                sources={sources}
                variant="cited"
                idPrefix={highlight.idPrefix}
                activeSource={highlight.active}
                onSourceHover={highlight.setActive}
                listRef={highlight.listRef}
              />
            </Annotated>
          </div>
        </div>
      </div>

      <figcaption className="mt-5">
        <p className="text-small text-ink-soft">
          <span className={cx(metaLabel, 'mr-2 text-ink')}>Fig. 1</span>
          {figureContent.caption}
        </p>
        <ol className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {figureContent.notes.map((note, index) => (
            <li key={note} className="flex gap-3 text-small text-ink-soft">
              <Marker n={index + 1} />
              <span>{note}</span>
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => onAsk(question)} className={cx(textLinkClasses, 'mt-5 text-small')}>
          {figureContent.tryIt}
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </button>
      </figcaption>
    </figure>
  )
}

function Annotated({ n, className, children }: { n: number; className?: string; children: ReactNode }) {
  return (
    <div className={cx('relative', className)}>
      <Marker n={n} className="absolute -left-8 top-0" />
      {children}
    </div>
  )
}

function Marker({ n, className }: { n: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-accent font-mono text-micro text-accent',
        className,
      )}
    >
      {n}
    </span>
  )
}
