import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { AfterLoginState, LoginLocationState } from '../../features/auth/loginNavigation'
import { useCurrentUser } from '../../features/auth/useAuth'
import { useRagConversation } from '../../hooks/useRagConversation'
import { ChatWidget } from '../widget/ChatWidget'
import type { ConsultationContext } from './consultation'
import { CONSULTATION_USER_TYPE } from './consultation'
import { GlobalHeader } from './GlobalHeader'

export function PublicLayout() {
  const { data: user } = useCurrentUser()
  const conversation = useRagConversation()
  const [isOpen, setIsOpen] = useState(false)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { send, isPending, reset } = conversation

  const open = useCallback(
    (question?: string) => {
      // A consulta exige login. Depois de entrar, a pessoa volta para esta página com a gaveta aberta.
      if (!user) {
        const state: LoginLocationState = {
          from: { pathname: location.pathname, search: location.search, hash: location.hash },
          consultation: { question },
        }
        navigate('/login', { state })
        return
      }
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      setIsOpen(true)
      if (question && !isPending) void send(question, CONSULTATION_USER_TYPE)
    },
    [user, location.pathname, location.search, location.hash, navigate, send, isPending],
  )

  const close = useCallback(() => {
    setIsOpen(false)
    returnFocusRef.current?.focus()
  }, [])

  // Retomada da consulta pedida antes do login; a chave da navegação evita repetir o envio.
  const resumedKey = useRef<string | null>(null)
  useEffect(() => {
    const state = location.state as AfterLoginState | null
    if (!user || !state?.openConsultation || resumedKey.current === location.key) return
    resumedKey.current = location.key
    navigate({ pathname: location.pathname, search: location.search, hash: location.hash }, { replace: true, state: null })
    open(state.question)
  }, [user, location, navigate, open])

  // Login, logout ou sessão expirada: a conversa de um usuário não fica à vista do próximo.
  const userId = user?.id ?? null
  const previousUserId = useRef(userId)
  useEffect(() => {
    if (previousUserId.current === userId) return
    previousUserId.current = userId
    reset()
    setIsOpen(false)
  }, [userId, reset])

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
