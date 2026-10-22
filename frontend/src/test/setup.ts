import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// APIs de navegador que o jsdom não implementa e que os componentes usam para rolagem e animação.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList
}
Element.prototype.scrollTo ??= () => undefined
Element.prototype.scrollIntoView ??= () => undefined

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  localStorage.clear()
})
