import { useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import type { UserType } from '../../api/types'
import type { RagConversation } from '../../hooks/useRagConversation'
import { cx } from '../../lib/cx'
import { trapFocus } from '../../lib/focus'
import { BrandMark } from '../brand/BrandMark'
import { QuestionComposer } from '../composer/QuestionComposer'
import { Button } from '../primitives/Button'
import { IconButton } from '../primitives/IconButton'
import { metaLabel } from '../primitives/classes'
import { ChatWidgetMessageList } from './ChatWidgetMessageList'

interface ChatWidgetPanelProps {
  conversation: RagConversation
  userType: UserType
  onClose: () => void
}

export function ChatWidgetPanel({ conversation, userType, onClose }: ChatWidgetPanelProps) {
  const { messages, send, retry, reset, setFeedback, isPending, error } = conversation
  const panelRef = useRef<HTMLElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus({ preventScroll: true })
  }, [])

  // Trava a rolagem da página enquanto a gaveta está aberta. O padding ocupa o lugar da barra de
  // rolagem para o conteúdo não saltar, e a gaveta (fixa) continua alcançando a borda da janela.
  useEffect(() => {
    const root = document.documentElement
    const scrollbarWidth = window.innerWidth - root.clientWidth
    const previous = { overflow: root.style.overflow, paddingRight: root.style.paddingRight }
    root.style.overflow = 'hidden'
    if (scrollbarWidth > 0) root.style.paddingRight = `${scrollbarWidth}px`
    return () => {
      root.style.overflow = previous.overflow
      root.style.paddingRight = previous.paddingRight
    }
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
    } else if (event.key === 'Tab') {
      trapFocus(event, panelRef.current)
    }
  }

  function ask(question: string) {
    void send(question, userType)
  }

  return (
    <div className="fixed inset-0 z-60">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-ink/30 motion-safe:animate-overlay-in" />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consulta-titulo"
        onKeyDown={handleKeyDown}
        className="absolute inset-y-0 right-0 flex w-full flex-col bg-paper-raised shadow-panel motion-safe:animate-drawer-in sm:max-w-136"
      >
        <header className="flex items-start justify-between gap-4 border-b border-rule px-5 pb-4 pt-5 sm:px-7">
          <div className="min-w-0">
            <p className={cx(metaLabel, 'flex items-center gap-2 text-ink-faint')}>
              <BrandMark className="h-3.5 w-3.5 text-ink" />
              NexoHansen
            </p>
            <h2 id="consulta-titulo" className="mt-2 font-serif text-heading font-medium text-ink">
              Consulta à base
            </h2>
            <p className="mt-1 text-small text-ink-faint">Perfil: {userType.toLowerCase()}</p>
          </div>
          <div className="-mr-2 flex items-center gap-1">
            {messages.length > 0 ? (
              <Button variant="quiet" size="sm" onClick={reset} disabled={isPending}>
                Nova consulta
              </Button>
            ) : null}
            <IconButton
              aria-label="Fechar consulta"
              icon={<X className="size-4.5" aria-hidden="true" />}
              onClick={onClose}
            />
          </div>
        </header>

        <ChatWidgetMessageList
          messages={messages}
          isPending={isPending}
          error={error}
          onAsk={ask}
          onRetry={() => void retry()}
          onFeedbackChange={setFeedback}
        />

        <QuestionComposer
          id="pergunta-consulta"
          textareaRef={textareaRef}
          onSubmit={ask}
          isBusy={isPending}
          placeholder="Escreva uma pergunta sobre hanseníase"
          submitLabel="Consultar"
          className="border-t border-rule px-5 pb-4 pt-4 sm:px-7"
        />
      </section>
    </div>
  )
}
