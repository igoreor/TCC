import { ArrowRight } from 'lucide-react'
import type { RagUiMessage } from '../../hooks/useRagConversation'
import { useScrollToLatest } from '../../hooks/useScrollToLatest'
import { toEntries } from '../../lib/conversation'
import { cx } from '../../lib/cx'
import type { FeedbackState } from '../../lib/feedback'
import { ResponseFeedback } from '../feedback/ResponseFeedback'
import { metaLabel } from '../primitives/classes'
import { QuestionLine } from '../rag-answer/QuestionLine'
import { RagEntryBody } from '../rag-answer/RagEntryBody'

// Perguntas do conjunto de avaliação do projeto (backend/knowledge-base/processed/qa_dataset.json).
const EXAMPLE_QUESTIONS = [
  'Baciloscopia negativa exclui hanseníase?',
  'Quais são os critérios cardinais da hanseníase?',
  'Como classificar um caso como multibacilar?',
  'Contatos domiciliares devem ser examinados?',
]

interface ChatWidgetMessageListProps {
  messages: RagUiMessage[]
  isPending: boolean
  error: unknown
  onAsk: (question: string) => void
  onRetry: () => void
  onFeedbackChange: (messageId: string, state: FeedbackState | undefined) => void
}

export function ChatWidgetMessageList({
  messages,
  isPending,
  error,
  onAsk,
  onRetry,
  onFeedbackChange,
}: ChatWidgetMessageListProps) {
  const entries = toEntries(messages)
  const latest = entries.at(-1)
  const { containerRef, latestRef } = useScrollToLatest<HTMLDivElement, HTMLLIElement>(
    `${entries.length}:${latest?.answer ? 'a' : ''}:${isPending ? 'p' : ''}:${error ? 'e' : ''}`,
  )

  if (entries.length === 0) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-7">
        <p className="font-serif text-subheading font-medium text-ink">Escreva uma pergunta clínica sobre hanseníase.</p>
        <p className="mt-2 text-ui text-pretty text-ink-soft">
          A resposta é redigida a partir de trechos da base de conhecimento e indica as fontes usadas. Pedidos de
          diagnóstico definitivo ou de prescrição recebem uma recusa explicada.
        </p>
        <p className={cx(metaLabel, 'mt-8 text-ink-faint')}>Exemplos do conjunto de avaliação</p>
        <ul className="mt-3">
          {EXAMPLE_QUESTIONS.map((question) => (
            <li key={question} className="border-b border-rule first:border-t">
              <button
                type="button"
                onClick={() => onAsk(question)}
                className="group flex w-full items-center justify-between gap-4 py-3 text-left text-ui text-ink transition-colors duration-150 hover:text-accent"
              >
                <span>{question}</span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-ink-faint transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      role="log"
      aria-label="Registro da consulta"
      aria-busy={isPending}
      className="relative min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7"
    >
      <ol className="space-y-8">
        {entries.map((entry, index) => {
          const isLatest = index === entries.length - 1
          const answer = entry.answer
          return (
            <li
              key={entry.question.id}
              ref={isLatest ? latestRef : undefined}
              className={cx(index > 0 && 'border-t border-rule pt-8')}
            >
              <QuestionLine question={entry.question.content} />
              <div className="mt-5">
                <RagEntryBody
                  answer={answer}
                  isLatest={isLatest}
                  isPending={isPending}
                  error={error}
                  onRetry={onRetry}
                />
              </div>
              {/* Só respostas concluídas são avaliadas; cada avaliação fica presa à sua resposta. */}
              {answer ? (
                <ResponseFeedback
                  messageId={answer.id}
                  state={answer.feedback}
                  onStateChange={(state) => onFeedbackChange(answer.id, state)}
                  className="mt-6"
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
