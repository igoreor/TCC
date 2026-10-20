import { BrandMark } from '../brand/BrandMark'

interface ChatWidgetFabProps {
  visible: boolean
  onOpen: () => void
}

/**
 * Atalho flutuante para a consulta: aparece só enquanto nenhum outro convite à consulta está
 * na tela. A borda clara o mantém visível sobre a seção escura de limites.
 */
export function ChatWidgetFab({ visible, onOpen }: ChatWidgetFabProps) {
  if (!visible) return null

  return (
    <button
      type="button"
      onClick={onOpen}
      className="fixed bottom-5 right-5 z-50 inline-flex h-12 items-center gap-2.5 rounded-xs border border-night-text/20 bg-night pl-4 pr-5 text-ui font-medium text-night-text shadow-raised transition-colors duration-150 hover:bg-night-raised motion-safe:animate-launcher-in sm:bottom-6 sm:right-6"
    >
      <BrandMark className="size-4 text-night-text" dotClassName="fill-night-accent" />
      Consultar a base
    </button>
  )
}
