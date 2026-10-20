import { useCallback, useId, useRef, useState } from 'react'
import { scrollBehavior } from '../../lib/motion'

/** Liga marcadores de citação no texto aos itens da lista de fontes (destaque mútuo e salto). */
export function useSourceHighlight() {
  const [active, setActive] = useState<number | null>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const idPrefix = `fonte${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  const select = useCallback((index: number) => {
    setActive(index)
    const item = listRef.current?.querySelector<HTMLElement>(`[data-source-index="${index}"]`)
    if (!item) return
    item.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() })
    item.focus({ preventScroll: true })
  }, [])

  return { active, setActive, select, listRef, idPrefix }
}
