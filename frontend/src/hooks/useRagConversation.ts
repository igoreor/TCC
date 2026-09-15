import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { askChat } from '../api/chat'
import type { SafetyInfo, SourceCitation, UserType } from '../api/types'

export interface RagUiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: SourceCitation[]
  safety?: SafetyInfo
}

let counter = 0
function nextId(prefix: string): string {
  counter += 1
  return `${prefix}-${Date.now()}-${counter}`
}

export function useRagConversation() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [messages, setMessages] = useState<RagUiMessage[]>([])
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null)
  const mutation = useMutation({ mutationFn: askChat })

  const send = useCallback(
    async (question: string, userType: UserType) => {
      const trimmed = question.trim()
      if (!trimmed) return
      setMessages((current) => [...current, { id: nextId('user'), role: 'user', content: trimmed }])
      setPendingQuestion(trimmed)
      try {
        const result = await mutation.mutateAsync({ question: trimmed, userType, sessionId })
        setSessionId(result.sessionId)
        setMessages((current) => [
          ...current,
          {
            id: result.messageId,
            role: 'assistant',
            content: result.answer,
            sources: result.sources,
            safety: result.safety,
          },
        ])
      } catch {
        // silencioso de propósito: mutation.isError/error já refletem isso reativamente
      } finally {
        setPendingQuestion(null)
      }
    },
    [mutation, sessionId],
  )

  const reset = useCallback(() => {
    setSessionId(undefined)
    setMessages([])
    mutation.reset()
  }, [mutation])

  return {
    messages,
    send,
    reset,
    pendingQuestion,
    isPending: mutation.isPending,
    error: mutation.isError ? mutation.error : null,
  }
}
