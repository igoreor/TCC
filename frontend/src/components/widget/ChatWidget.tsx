import { useRagConversation } from '../../hooks/useRagConversation'
import { ChatWidgetFab } from './ChatWidgetFab'
import { ChatWidgetPanel } from './ChatWidgetPanel'

interface ChatWidgetProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function ChatWidget({ isOpen, onOpenChange }: ChatWidgetProps) {
  const conversation = useRagConversation()

  return (
    <>
      {isOpen ? <ChatWidgetPanel conversation={conversation} onClose={() => onOpenChange(false)} /> : null}
      <ChatWidgetFab isOpen={isOpen} onToggle={() => onOpenChange(!isOpen)} />
    </>
  )
}
