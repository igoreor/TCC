import { useCallback, useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { askChat } from '../../api/chat'
import type { SafetyInfo, SourceCitation, UserType } from '../../api/types'

const STORAGE_KEY = 'hanseniase-chat-session-v1'

export interface ChatUiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: SourceCitation[]
  safety?: SafetyInfo
  messageId?: string
}

interface StoredSession {
  sessionId?: string
  messages: ChatUiMessage[]
}

function loadStoredSession(): StoredSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { messages: [] }
    const parsed = JSON.parse(raw) as StoredSession
    return { sessionId: parsed.sessionId, messages: Array.isArray(parsed.messages) ? parsed.messages : [] }
  } catch {
    return { messages: [] }
  }
}

function saveStoredSession(session: StoredSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
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
  const [sessionId, setSessionId] = useState<string | undefined>(() => loadStoredSession().sessionId)
  const [messages, setMessages] = useState<ChatUiMessage[]>(() => loadStoredSession().messages)

  useEffect(() => {
    saveStoredSession({ sessionId, messages })
  }, [sessionId, messages])

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

  return {
    messages,
    sendQuestion,
    startNewConversation,
    isSending: mutation.isPending,
    error: mutation.isError ? mutation.error : null,
  }
}
