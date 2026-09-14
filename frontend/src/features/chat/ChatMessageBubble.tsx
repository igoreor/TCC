import { Card } from '../../components/ui/Card'
import { FeedbackWidget } from './FeedbackWidget'
import { SafetyPanel } from './SafetyPanel'
import { SourcesList } from './SourcesList'
import type { ChatUiMessage } from './useChatSession'
import styles from './Chat.module.css'

interface ChatMessageBubbleProps {
  message: ChatUiMessage
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className={styles.userBubble}>
        <p>{message.content}</p>
      </div>
    )
  }

  return (
    <Card className={styles.assistantCard}>
      <p className={styles.answer}>{message.content}</p>
      {message.safety ? <SafetyPanel safety={message.safety} /> : null}
      {message.sources ? <SourcesList sources={message.sources} /> : null}
      {message.messageId ? <FeedbackWidget messageId={message.messageId} /> : null}
    </Card>
  )
}
