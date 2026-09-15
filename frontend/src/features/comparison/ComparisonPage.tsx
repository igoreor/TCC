import { RagAnswerBubble } from '../../components/rag-answer/RagAnswerBubble'
import { ComparisonColumn } from './ComparisonColumn'
import { GenericAnswerBubble } from './GenericAnswerBubble'
import { SharedComposer } from './SharedComposer'
import { useComparisonSession } from './useComparisonSession'

export function ComparisonPage() {
  const { rag, generic, submit, disabled } = useComparisonSession()

  function retryRag() {
    if (rag.pendingQuestion) void rag.send(rag.pendingQuestion, 'Profissional de saúde')
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 flex flex-col font-sans">
      <div className="flex flex-1 flex-col overflow-hidden pb-28 md:flex-row">
        <ComparisonColumn
          variant="rag"
          title="Assistente Clínico RAG (Seguro)"
          subtitle="Respostas com fontes e sinalização de risco"
          isEmpty={rag.messages.length === 0}
          isPending={rag.isPending}
          error={rag.error}
          onRetry={retryRag}
        >
          {rag.messages.map((message) => {
            if (message.role === 'user') {
              return (
                <div
                  key={message.id}
                  className="ml-auto w-fit max-w-[85%] rounded-2xl bg-accent px-4 py-2.5 text-sm text-accent-fg"
                >
                  {message.content}
                </div>
              )
            }
            if (message.safety) {
              return (
                <RagAnswerBubble
                  key={message.id}
                  content={message.content}
                  sources={message.sources ?? []}
                  safety={message.safety}
                />
              )
            }
            return null
          })}
        </ComparisonColumn>

        <div className="hidden w-px bg-white/5 md:block" />
        <div className="h-px bg-white/5 md:hidden" />

        <ComparisonColumn
          variant="generic"
          title="LLM Genérico (Sem Contexto)"
          subtitle="Sem contexto clínico específico"
          isEmpty={generic.messages.length === 0}
          isPending={generic.isPending}
        >
          {generic.messages.map((message) =>
            message.role === 'user' ? (
              <div
                key={message.id}
                className="ml-auto w-fit max-w-[85%] rounded-2xl bg-surface-3 px-4 py-2.5 text-sm text-text-primary"
              >
                {message.content}
              </div>
            ) : (
              <GenericAnswerBubble key={message.id} content={message.content} />
            ),
          )}
        </ComparisonColumn>
      </div>

      <SharedComposer onSubmit={submit} disabled={disabled} />
    </div>
  )
}
