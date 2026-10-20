import { useEffect, useRef } from 'react'
import { scrollBehavior } from '../lib/motion'

/**
 * Rola um contêiner até o início do registro mais recente sempre que `signal` muda.
 * Mostra a pergunta nova no topo, em vez de jogar o leitor para o fim de uma resposta longa.
 * O contêiner precisa ser `position: relative` para que `offsetTop` seja relativo a ele.
 */
export function useScrollToLatest<C extends HTMLElement, L extends HTMLElement>(signal: string) {
  const containerRef = useRef<C>(null)
  const latestRef = useRef<L>(null)

  useEffect(() => {
    const container = containerRef.current
    const latest = latestRef.current
    if (!container || !latest) return
    container.scrollTo({ top: Math.max(0, latest.offsetTop - 24), behavior: scrollBehavior() })
  }, [signal])

  return { containerRef, latestRef }
}
