import type { UserType } from '../../api/types'
import type { RagConversation } from '../../hooks/useRagConversation'
import { ChatWidgetPanel } from './ChatWidgetPanel'

interface ChatWidgetProps {
  isOpen: boolean
  onClose: () => void
  conversation: RagConversation
  userType: UserType
}

/** Gaveta de consulta. O estado da conversa vive no PublicLayout, então sobrevive à troca de página. */
export function ChatWidget({ isOpen, onClose, conversation, userType }: ChatWidgetProps) {
  if (!isOpen) return null
  return <ChatWidgetPanel conversation={conversation} userType={userType} onClose={onClose} />
}
