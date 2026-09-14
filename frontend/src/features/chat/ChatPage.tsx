import { ErrorState } from '../../components/ui/ErrorState'
import { ChatComposer } from './ChatComposer'
import { ChatMessageList } from './ChatMessageList'
import { useChatSession } from './useChatSession'
import styles from './Chat.module.css'

export function ChatPage() {
  const { messages, sendQuestion, startNewConversation, isSending, error } = useChatSession()

  return (
    <div className={styles.page}>
      <ChatMessageList messages={messages} />
      {error ? <ErrorState error={error} /> : null}
      <ChatComposer onSend={sendQuestion} onNewConversation={startNewConversation} isSending={isSending} />
    </div>
  )
}
