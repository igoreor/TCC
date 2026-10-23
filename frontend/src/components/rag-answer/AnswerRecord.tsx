import type { ChatAskResult, SafetyInfo, SourceCitation } from '../../api/types'
import { AnswerStatus } from './AnswerStatus'
import { AnswerText } from './AnswerText'
import { stripDisclaimer } from './parseAnswer'
import { SafetyNote } from './SafetyNote'
import { SourceList } from './SourceList'
import { useSourceHighlight } from './useSourceHighlight'

interface AnswerRecordProps {
  content: string
  sources: SourceCitation[]
  safety: SafetyInfo
  retrieval?: ChatAskResult['retrieval']
}

/**
 * Registro de uma resposta do NexoHansen. Em contêineres estreitos (gaveta) as fontes
 * vêm abaixo do texto; a partir de 42rem passam para a margem, como notas laterais.
 */
export function AnswerRecord({ content, sources, safety, retrieval }: AnswerRecordProps) {
  const highlight = useSourceHighlight()
  const refused = safety.fallbackTriggered
  const text = stripDisclaimer(content, safety.disclaimer)

  return (
    <article className="@container">
      <AnswerStatus safety={safety} intent={retrieval?.intent} citedCount={sources.length} />
      <div className="mt-3 grid gap-x-8 gap-y-6 @2xl:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0">
          {refused ? (
            <RefusalText text={text} />
          ) : (
            <AnswerText
              content={text}
              sources={sources}
              sourceIdPrefix={highlight.idPrefix}
              activeSource={highlight.active}
              onCitationHover={highlight.setActive}
              onCitationSelect={highlight.select}
            />
          )}
          <SafetyNote safety={safety} className="mt-5" />
        </div>
        <SourceList
          sources={sources}
          variant={refused ? 'retrieved' : 'cited'}
          idPrefix={highlight.idPrefix}
          activeSource={highlight.active}
          onSourceHover={highlight.setActive}
          listRef={highlight.listRef}
        />
      </div>
    </article>
  )
}

/** A hachura marca a recusa como área restrita, sem recorrer a vermelho nem a ícone de alerta. */
function RefusalText({ text }: { text: string }) {
  return (
    <div className="relative pl-5">
      <span aria-hidden="true" className="absolute inset-y-0.5 left-0 w-2 bg-hatch text-ink-faint" />
      <p className="whitespace-pre-line text-ui text-pretty text-ink">{text}</p>
    </div>
  )
}
