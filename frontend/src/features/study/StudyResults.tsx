import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getStudyResult, listStudyResults, studyKeys } from '../../api/study'
import type { StudyConditionResult } from '../../api/study'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Select } from '../../components/ui/Select'
import { Spinner } from '../../components/ui/Spinner'
import { ConditionGrid } from './ConditionGrid'
import { modelLabel } from './labels'
import styles from './Study.module.css'

/** Respostas já registradas pelo harness (lotes de research/runs), sem nenhuma chamada nova. */
export function StudyResults() {
  const batches = useQuery({ queryKey: studyKeys.results, queryFn: listStudyResults })
  const [chosenBatch, setChosenBatch] = useState('')
  const [chosenQuestion, setChosenQuestion] = useState('')

  const batchId = chosenBatch || batches.data?.batches[0]?.id || ''
  const detail = useQuery({
    queryKey: studyKeys.result(batchId),
    queryFn: () => getStudyResult(batchId),
    enabled: Boolean(batchId),
  })

  if (batches.isPending) return <Spinner label="Carregando lotes..." />
  if (batches.isError) return <ErrorState error={batches.error} />
  if (!batches.data.batches.length) {
    return <EmptyState title="Nenhum lote configurado" description="Liste os lotes em result_batches na configuração do serviço." />
  }

  const batch = batches.data.batches.find((item) => item.id === batchId)
  const questions = detail.data?.questions ?? []
  const question = questions.find((item) => item.question_id === chosenQuestion) ?? questions[0]

  return (
    <section className={styles.section}>
      <div className={styles.controls}>
        <Select
          label="Lote"
          value={batchId}
          onChange={(event) => {
            setChosenBatch(event.target.value)
            setChosenQuestion('')
          }}
          options={batches.data.batches.map((item) => ({ value: item.id, label: item.label || item.id }))}
        />
        {questions.length ? (
          <Select
            label="Pergunta"
            value={question?.question_id ?? ''}
            onChange={(event) => setChosenQuestion(event.target.value)}
            options={questions.map((item) => ({ value: item.question_id, label: `${item.question_id} — ${item.question}` }))}
          />
        ) : null}
      </div>

      {batch ? (
        <p className={styles.caption}>
          {batch.id} · {batch.corpus_dir} · {batch.n_questions} perguntas, {batch.n_records} registros
          {batch.note ? ` · ${batch.note}` : ''}
        </p>
      ) : null}

      {detail.isPending ? <Spinner label="Carregando respostas..." /> : null}
      {detail.isError ? <ErrorState error={detail.error} /> : null}
      {question ? (
        <>
          <blockquote className={styles.question}>{question.question}</blockquote>
          {groupByModel(question.results).map(([model, results]) => (
            <div key={model} className={styles.section}>
              <h3 className={styles.modelHeading}>{model}</h3>
              <ConditionGrid results={results} />
            </div>
          ))}
        </>
      ) : null}
    </section>
  )
}

function groupByModel(results: StudyConditionResult[]): Array<[string, StudyConditionResult[]]> {
  const groups = new Map<string, StudyConditionResult[]>()
  for (const result of results) {
    const key = modelLabel(result.provider, result.model)
    groups.set(key, [...(groups.get(key) ?? []), result])
  }
  return [...groups.entries()]
}
