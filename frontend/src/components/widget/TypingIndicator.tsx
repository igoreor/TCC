export function TypingIndicator() {
  return (
    <div className="flex w-fit items-center rounded-2xl border border-border bg-surface-2 px-4 py-3">
      <span className="flex items-center gap-1.5 motion-reduce:hidden">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" />
      </span>
      <span className="hidden text-xs text-text-muted motion-reduce:inline">Digitando…</span>
    </div>
  )
}
