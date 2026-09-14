import { EmptyState } from '../../components/ui/EmptyState'
import { ChatMessageBubble } from './ChatMessageBubble'
import type { ChatUiMessage } from './useChatSession'
import styles from './Chat.module.css'

interface ChatMessageListProps {
  messages: ChatUiMessage[]
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  if (!messages.length) {
    return (
      <EmptyState
        title="Nenhuma pergunta ainda"
        description="Pergunte algo sobre diagnóstico, tratamento, medicamentos ou reações hansênicas."
      />
    )
  }

  return (
    <div className={styles.messageList}>
      {messages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}
    </div>
  )
}
