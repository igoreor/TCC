import { ApiError } from '../../api/client'
import { Button } from './Button'

interface ErrorInlineProps {
  error: unknown
  onRetry?: () => void
}

export function ErrorInline({ error, onRetry }: ErrorInlineProps) {
  const message = error instanceof ApiError ? error.message : 'Ocorreu um erro inesperado.'

  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-2 rounded-xl border border-risk-danger/30 bg-risk-danger/10 px-3.5 py-3 text-sm text-text-primary"
    >
      <p>{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry} className="text-xs">
          Tentar novamente
        </Button>
      ) : null}
    </div>
  )
}
