import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { askChat } from '../api/chat'
import type { ChatAskResult, SafetyInfo, SourceCitation, UserType } from '../api/types'
import type { FeedbackState } from '../lib/feedback'

export interface RagUiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: SourceCitation[]
  safety?: SafetyInfo
  retrieval?: ChatAskResult['retrieval']
  /** Avaliação desta resposta pela pessoa; o `id` da resposta é o identificador persistido no servidor. */
  feedback?: FeedbackState
}

interface FailedRequest {
  question: string
  userType: UserType
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
  const [failedRequest, setFailedRequest] = useState<FailedRequest | null>(null)
  const mutation = useMutation({ mutationFn: askChat })

  // Pede a resposta de uma pergunta já registrada — usado tanto no envio quanto na nova tentativa.
  const request = useCallback(
    async (question: string, userType: UserType) => {
      setPendingQuestion(question)
      setFailedRequest(null)
      try {
        const result = await mutation.mutateAsync({ question, userType, sessionId })
        setSessionId(result.sessionId)
        setMessages((current) => [
          ...current,
          {
            id: result.messageId,
            role: 'assistant',
            content: result.answer,
            sources: result.sources,
            safety: result.safety,
            retrieval: result.retrieval,
          },
        ])
      } catch {
        // o erro em si já é exposto por mutation.error; aqui só guardamos o que reenviar
        setFailedRequest({ question, userType })
      } finally {
        setPendingQuestion(null)
      }
    },
    [mutation, sessionId],
  )

  const send = useCallback(
    async (question: string, userType: UserType) => {
      const trimmed = question.trim()
      if (!trimmed) return
      setMessages((current) => [...current, { id: nextId('user'), role: 'user', content: trimmed }])
      await request(trimmed, userType)
    },
    [request],
  )

  const retry = useCallback(async () => {
    if (failedRequest) await request(failedRequest.question, failedRequest.userType)
  }, [failedRequest, request])

  const reset = useCallback(() => {
    setSessionId(undefined)
    setMessages([])
    setFailedRequest(null)
    mutation.reset()
  }, [mutation])

  const setFeedback = useCallback((messageId: string, feedback: FeedbackState | undefined) => {
    setMessages((current) => current.map((message) => (message.id === messageId ? { ...message, feedback } : message)))
  }, [])

  return {
    messages,
    send,
    retry,
    reset,
    setFeedback,
    pendingQuestion,
    isPending: mutation.isPending,
    error: mutation.isError ? mutation.error : null,
  }
}

export type RagConversation = ReturnType<typeof useRagConversation>
