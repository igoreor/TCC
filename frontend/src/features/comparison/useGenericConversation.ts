import { useCallback, useState } from 'react'
import { simulateGenericAnswer } from '../../lib/genericLlmSimulator'

export interface GenericUiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

let counter = 0
function nextId(prefix: string): string {
  counter += 1
  return `${prefix}-${Date.now()}-${counter}`
}

export function useGenericConversation() {
  const [messages, setMessages] = useState<GenericUiMessage[]>([])
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null)

  const send = useCallback(async (question: string) => {
    const trimmed = question.trim()
    if (!trimmed) return
    setMessages((current) => [...current, { id: nextId('generic-user'), role: 'user', content: trimmed }])
    setPendingQuestion(trimmed)
    const result = await simulateGenericAnswer(trimmed)
    setMessages((current) => [
      ...current,
      { id: nextId('generic-assistant'), role: 'assistant', content: result.content },
    ])
    setPendingQuestion(null)
  }, [])

  const reset = useCallback(() => {
    setMessages([])
    setPendingQuestion(null)
  }, [])

  return { messages, send, reset, pendingQuestion, isPending: pendingQuestion !== null }
}
