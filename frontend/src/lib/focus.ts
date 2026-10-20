const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/** Mantém o foco do teclado dentro de um diálogo modal ao navegar com Tab. */
export function trapFocus(event: { shiftKey: boolean; preventDefault: () => void }, container: HTMLElement | null) {
  if (!container) return
  const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
  if (items.length === 0) return

  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement

  if (event.shiftKey && (active === first || !container.contains(active))) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}
