import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

export function useInView(ref: RefObject<Element | null>, rootMargin = '0px'): boolean {
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, rootMargin])

  return inView
}
