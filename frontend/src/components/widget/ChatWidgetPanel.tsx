import { X } from 'lucide-react'
import type { useRagConversation } from '../../hooks/useRagConversation'
import { IconButton } from '../dark/IconButton'
import { ChatWidgetComposer } from './ChatWidgetComposer'
import { ChatWidgetMessageList } from './ChatWidgetMessageList'

const DEFAULT_USER_TYPE = 'Profissional de saúde'

interface ChatWidgetPanelProps {
  conversation: ReturnType<typeof useRagConversation>
  onClose: () => void
}

export function ChatWidgetPanel({ conversation, onClose }: ChatWidgetPanelProps) {
  const { messages, send, pendingQuestion, isPending, error } = conversation

  function handleSend(question: string) {
    void send(question, DEFAULT_USER_TYPE)
  }

  function handleRetry() {
    if (pendingQuestion) void send(pendingQuestion, DEFAULT_USER_TYPE)
  }

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm motion-safe:animate-fade-in"
      />
      <div
        role="dialog"
        aria-label="Assistente virtual"
        className="fixed right-0 top-0 z-[61] flex h-screen w-[450px] max-w-full flex-col border-l border-white/10 bg-zinc-950/95 shadow-soft backdrop-blur-xl motion-safe:animate-fade-in-up"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-display text-sm font-semibold text-text-primary">Assistente RAG Hanseníase</h2>
          <IconButton
            icon={<X className="h-4 w-4" aria-hidden="true" />}
            aria-label="Fechar assistente virtual"
            onClick={onClose}
            className="h-8 w-8 text-text-secondary hover:bg-surface-3 hover:text-text-primary"
          />
        </header>
        <ChatWidgetMessageList
          messages={messages}
          pendingQuestion={pendingQuestion}
          error={error}
          onExampleClick={handleSend}
          onRetry={handleRetry}
        />
        <ChatWidgetComposer onSend={handleSend} isSending={isPending} />
      </div>
    </>
  )
}
