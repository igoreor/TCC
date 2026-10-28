import type { StudyConditionResult } from '../../api/study'
import { Badge } from '../../components/ui/Badge'
import { AnswerBody } from './AnswerBody'
import { documentLabel, expansionLabel, pageLabel } from './labels'
import styles from './Study.module.css'

interface ConditionGridProps {
  results: StudyConditionResult[]
}

/** Uma coluna por condição: busca usada, resposta e trechos recuperados. */
export function ConditionGrid({ results }: ConditionGridProps) {
  return (
    <div className={styles.grid}>
      {results.map((result) => (
        <ConditionColumn key={`${result.provider}-${result.condition}-${result.repetition ?? 0}`} result={result} />
      ))}
    </div>
  )
}

function ConditionColumn({ result }: { result: StudyConditionResult }) {
  const expansion = expansionLabel(result.expansion_status)

  return (
    <article className={styles.column} aria-label={result.label}>
      <header className={styles.columnHeader}>
        <h4>{result.label}</h4>
        <div className={styles.badges}>
          <Badge tone="neutral">{result.condition}</Badge>
          {result.status !== 'success' ? <Badge tone="danger">erro</Badge> : null}
          {expansion ? <Badge tone={expansion.tone}>{expansion.text}</Badge> : null}
        </div>
      </header>

      {result.retrieval_query !== null ? (
        <div className={styles.query}>
          <span className={styles.caption}>Busca usada</span>
          <p>{result.retrieval_query}</p>
        </div>
      ) : (
        <p className={styles.caption}>Sem recuperação: o modelo responde só com o que já sabe.</p>
      )}

      {result.status === 'success' ? (
        <AnswerBody text={result.answer ?? ''} sources={result.sources} />
      ) : (
        <p className={styles.error} role="alert">
          {result.error ?? 'Falha sem mensagem.'}
        </p>
      )}

      {result.sources.length ? (
        <details className={styles.sources}>
          <summary>Trechos recuperados ({result.sources.length})</summary>
          <ol>
            {result.sources.map((source) => (
              <li key={source.chunk_id} value={source.rank}>
                <div className={styles.sourceMeta}>
                  <strong>{documentLabel(source.document_id)}</strong>
                  <span>{pageLabel(source.page_start, source.page_end)}</span>
                  {source.score !== null ? <span>similaridade {source.score.toFixed(3)}</span> : null}
                </div>
                {source.section ? <div className={styles.caption}>{source.section}</div> : null}
                {source.excerpt ? <p className={styles.excerpt}>{source.excerpt}</p> : null}
                <code className={styles.chunkId}>{source.chunk_id}</code>
              </li>
            ))}
          </ol>
        </details>
      ) : null}

      <footer className={styles.columnFooter}>
        {result.latency_ms !== null ? <span>{(result.latency_ms / 1000).toFixed(1)} s</span> : null}
        {result.output_tokens !== null ? <span>{result.output_tokens} tokens de saída</span> : null}
        {result.returned_model ? <span>{result.returned_model}</span> : null}
      </footer>
    </article>
  )
}
