export interface ConversationEntry<M> {
  question: M
  answer?: M
}

/** Agrupa mensagens alternadas em pares pergunta → resposta, no formato de registro de consulta. */
export function toEntries<M extends { role: 'user' | 'assistant' }>(messages: M[]): ConversationEntry<M>[] {
  const entries: ConversationEntry<M>[] = []
  for (const message of messages) {
    if (message.role === 'user') {
      entries.push({ question: message })
    } else if (entries.length > 0) {
      entries[entries.length - 1].answer = message
    }
  }
  return entries
}
