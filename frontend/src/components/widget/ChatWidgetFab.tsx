import { MessageCircle } from 'lucide-react'
import { IconButton } from '../dark/IconButton'

interface ChatWidgetFabProps {
  isOpen: boolean
  onToggle: () => void
}

export function ChatWidgetFab({ isOpen, onToggle }: ChatWidgetFabProps) {
  // O drawer já tem seu próprio botão de fechar — o FAB só existe pra abrir,
  // então some por completo enquanto o drawer está aberto (evita dois "fechar" na tela).
  if (isOpen) return null

  return (
    <IconButton
      onClick={onToggle}
      aria-label="Abrir assistente virtual"
      icon={<MessageCircle className="h-6 w-6" aria-hidden="true" />}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 bg-accent text-accent-fg shadow-glow-accent hover:bg-accent-hover"
    />
  )
}
