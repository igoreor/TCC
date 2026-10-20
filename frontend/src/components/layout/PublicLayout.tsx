import { useCallback, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useRagConversation } from '../../hooks/useRagConversation'
import { ChatWidget } from '../widget/ChatWidget'
import type { ConsultationContext } from './consultation'
import { CONSULTATION_USER_TYPE } from './consultation'
import { GlobalHeader } from './GlobalHeader'

export function PublicLayout() {
  const conversation = useRagConversation()
  const [isOpen, setIsOpen] = useState(false)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const { send, isPending } = conversation

  const open = useCallback(
    (question?: string) => {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      setIsOpen(true)
      if (question && !isPending) void send(question, CONSULTATION_USER_TYPE)
    },
    [send, isPending],
  )

  const close = useCallback(() => {
    setIsOpen(false)
    returnFocusRef.current?.focus()
  }, [])

  const context: ConsultationContext = { isOpen, open }

  return (
    <div data-ui="public" className="min-h-dvh">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-70 focus:bg-ink focus:px-4 focus:py-2 focus:text-small focus:text-paper"
      >
        Pular para o conteúdo
      </a>
      <GlobalHeader onOpenConsultation={() => open()} />
      <Outlet context={context} />
      <ChatWidget isOpen={isOpen} onClose={close} conversation={conversation} userType={CONSULTATION_USER_TYPE} />
    </div>
  )
}
