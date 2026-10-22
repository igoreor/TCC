import { useCallback, useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { askChat } from '../../api/chat'
import type { SafetyInfo, SourceCitation, UserType } from '../../api/types'
import { chatStorageKey, clearLegacyChatSession } from '../../lib/chatStorage'
import type { FeedbackState } from '../../lib/feedback'
import { useCurrentUser } from '../auth/useAuth'

export interface ChatUiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: SourceCitation[]
  safety?: SafetyInfo
  messageId?: string
  feedback?: FeedbackState
}

interface StoredSession {
  sessionId?: string
  messages: ChatUiMessage[]
}

function loadStoredSession(key: string): StoredSession {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return { messages: [] }
    const parsed = JSON.parse(raw) as StoredSession
    return { sessionId: parsed.sessionId, messages: Array.isArray(parsed.messages) ? parsed.messages : [] }
  } catch {
    return { messages: [] }
  }
}

function saveStoredSession(key: string, session: StoredSession) {
  try {
    localStorage.setItem(key, JSON.stringify(session))
  } catch {
    // localStorage indisponível (ex: modo privado) - segue sem persistir
  }
}

let messageCounter = 0
function nextId(): string {
  messageCounter += 1
  return `local-${Date.now()}-${messageCounter}`
}

export function useChatSession() {
  // O painel só é exibido com login, então o usuário já está carregado aqui.
  const { data: user } = useCurrentUser()
  const storageKey = chatStorageKey(user?.id ?? 'anonimo')
  const [sessionId, setSessionId] = useState<string | undefined>(() => loadStoredSession(storageKey).sessionId)
  const [messages, setMessages] = useState<ChatUiMessage[]>(() => loadStoredSession(storageKey).messages)

  useEffect(() => {
    clearLegacyChatSession()
  }, [])

  useEffect(() => {
    saveStoredSession(storageKey, { sessionId, messages })
  }, [storageKey, sessionId, messages])

  const mutation = useMutation({
    mutationFn: askChat,
    onSuccess: (result) => {
      setSessionId(result.sessionId)
      setMessages((current) => [
        ...current,
        {
          id: result.messageId,
          role: 'assistant',
          content: result.answer,
          sources: result.sources,
          safety: result.safety,
          messageId: result.messageId,
        },
      ])
    },
  })

  const sendQuestion = useCallback(
    (question: string, userType: UserType) => {
      const trimmed = question.trim()
      if (!trimmed) return

      setMessages((current) => [...current, { id: nextId(), role: 'user', content: trimmed }])
      mutation.mutate({ question: trimmed, userType, sessionId })
    },
    [mutation, sessionId],
  )

  const startNewConversation = useCallback(() => {
    setSessionId(undefined)
    setMessages([])
    mutation.reset()
  }, [mutation])

  const setFeedback = useCallback((messageId: string, feedback: FeedbackState | undefined) => {
    setMessages((current) =>
      current.map((message) => (message.messageId === messageId ? { ...message, feedback } : message)),
    )
  }, [])

  return {
    messages,
    sendQuestion,
    startNewConversation,
    setFeedback,
    isSending: mutation.isPending,
    error: mutation.isError ? mutation.error : null,
  }
}
