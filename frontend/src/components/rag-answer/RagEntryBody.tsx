import type { RagUiMessage } from '../../hooks/useRagConversation'
import { ErrorNotice } from '../primitives/ErrorNotice'
import { PendingNote } from '../primitives/PendingNote'
import { AnswerRecord } from './AnswerRecord'

interface RagEntryBodyProps {
  answer?: RagUiMessage
  isLatest: boolean
  isPending: boolean
  error: unknown
  onRetry: () => void
}

/** O que aparece sob uma pergunta: resposta, espera, erro com nova tentativa ou registro incompleto. */
export function RagEntryBody({ answer, isLatest, isPending, error, onRetry }: RagEntryBodyProps) {
  if (answer?.safety) {
    return (
      <AnswerRecord
        content={answer.content}
        sources={answer.sources ?? []}
        safety={answer.safety}
        retrieval={answer.retrieval}
      />
    )
  }
  if (answer) return <p className="whitespace-pre-line text-ui text-ink">{answer.content}</p>
  if (isLatest && isPending) {
    return <PendingNote label="Consultando a base" detail="Buscando trechos e verificando as regras de segurança." />
  }
  if (isLatest && error) return <ErrorNotice error={error} onRetry={onRetry} />
  return <p className="text-small text-ink-faint">Consulta não concluída.</p>
}
