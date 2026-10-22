import { ResponseFeedback } from '../../components/feedback/ResponseFeedback'
import { Card } from '../../components/ui/Card'
import type { FeedbackState } from '../../lib/feedback'
import { SafetyPanel } from './SafetyPanel'
import { SourcesList } from './SourcesList'
import type { ChatUiMessage } from './useChatSession'
import styles from './Chat.module.css'

interface ChatMessageBubbleProps {
  message: ChatUiMessage
  onFeedbackChange: (messageId: string, state: FeedbackState | undefined) => void
}

export function ChatMessageBubble({ message, onFeedbackChange }: ChatMessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className={styles.userBubble}>
        <p>{message.content}</p>
      </div>
    )
  }

  const messageId = message.messageId

  return (
    <Card className={styles.assistantCard}>
      <p className={styles.answer}>{message.content}</p>
      {message.safety ? <SafetyPanel safety={message.safety} /> : null}
      {message.sources ? <SourcesList sources={message.sources} /> : null}
      {messageId ? (
        // Mesmo componente da interface pública; "embedded" aplica só os ajustes de base dele.
        <div data-ui="embedded" className={styles.feedback}>
          <ResponseFeedback
            messageId={messageId}
            state={message.feedback}
            onStateChange={(state) => onFeedbackChange(messageId, state)}
          />
        </div>
      ) : null}
    </Card>
  )
}
