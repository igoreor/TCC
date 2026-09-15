import { useEffect, useRef } from 'react'
import type { RagUiMessage } from '../../hooks/useRagConversation'
import { EmptyState } from '../dark/EmptyState'
import { ErrorInline } from '../dark/ErrorInline'
import { RagAnswerBubble } from '../rag-answer/RagAnswerBubble'
import { TypingIndicator } from './TypingIndicator'

const EXAMPLE_QUESTIONS = ['O que é hanseníase?', 'Quais os sintomas iniciais?', 'Como é feito o diagnóstico?']

interface ChatWidgetMessageListProps {
  messages: RagUiMessage[]
  pendingQuestion: string | null
  error: unknown
  onExampleClick: (question: string) => void
  onRetry: () => void
}

export function ChatWidgetMessageList({
  messages,
  pendingQuestion,
  error,
  onExampleClick,
  onRetry,
}: ChatWidgetMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, pendingQuestion, error])

  if (messages.length === 0 && !pendingQuestion) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <EmptyState
          title="Olá! Como posso ajudar?"
          description="Pergunte sobre sintomas, diagnóstico, tratamento ou qualquer dúvida sobre hanseníase."
          action={EXAMPLE_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => onExampleClick(question)}
              className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-text-secondary transition-colors duration-200 hover:border-border-strong hover:text-text-primary"
            >
              {question}
            </button>
          ))}
        />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      {messages.map((message) => {
        if (message.role === 'user') {
          return (
            <div
              key={message.id}
              className="ml-auto w-fit max-w-[85%] rounded-2xl bg-accent px-4 py-2.5 text-sm text-accent-fg"
            >
              {message.content}
            </div>
          )
        }

        if (message.safety) {
          return (
            <RagAnswerBubble
              key={message.id}
              content={message.content}
              sources={message.sources ?? []}
              safety={message.safety}
            />
          )
        }

        return (
          <div key={message.id} className="rounded-2xl border border-border bg-surface-2 p-4 text-sm text-text-primary">
            {message.content}
          </div>
        )
      })}
      {pendingQuestion ? <TypingIndicator /> : null}
      {error ? <ErrorInline error={error} onRetry={onRetry} /> : null}
      <div ref={bottomRef} />
    </div>
  )
}
