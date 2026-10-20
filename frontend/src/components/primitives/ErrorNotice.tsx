import { ApiError } from '../../api/client'
import { Button } from './Button'

interface ErrorNoticeProps {
  error: unknown
  onRetry?: () => void
  title?: string
}

export function ErrorNotice({ error, onRetry, title = 'A consulta não foi concluída.' }: ErrorNoticeProps) {
  const message = error instanceof ApiError ? error.message : 'Ocorreu um erro inesperado.'

  return (
    <div role="alert" className="border-l-2 border-critical bg-critical-soft/60 py-3 pl-4 pr-3">
      <p className="text-ui font-medium text-ink">{title}</p>
      <p className="mt-0.5 text-small text-ink-soft">{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-3">
          Tentar novamente
        </Button>
      ) : null}
    </div>
  )
}
