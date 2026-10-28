import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { compareStudy } from '../../api/study'
import type { StudyArm, StudyConditionCode, StudyServiceStatus } from '../../api/study'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { Select } from '../../components/ui/Select'
import { Spinner } from '../../components/ui/Spinner'
import { TextArea } from '../../components/ui/TextArea'
import { ConditionGrid } from './ConditionGrid'
import { modelLabel } from './labels'
import styles from './Study.module.css'

interface StudyLiveProps {
  service: StudyServiceStatus
}

/** Uma pergunta livre, respondida em cada condição pelo mesmo pipeline do experimento. */
export function StudyLive({ service }: StudyLiveProps) {
  const [question, setQuestion] = useState('')
  const [arm, setArm] = useState<StudyArm>(service.arms[0]?.arm ?? 'openai')
  const [conditions, setConditions] = useState<StudyConditionCode[]>(service.conditions.map((item) => item.code))
  const mutation = useMutation({ mutationFn: compareStudy })

  // Sem RAG e RAG fazem uma chamada; cada expansão faz duas (expandir e responder).
  const calls = conditions.reduce((total, code) => total + (code === 'D' || code === 'R0' ? 1 : 2), 0)

  function toggle(code: StudyConditionCode) {
    setConditions((current) => (current.includes(code) ? current.filter((item) => item !== code) : [...current, code]))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (question.trim().length < 3 || !conditions.length || mutation.isPending) return
    mutation.mutate({ question: question.trim(), arm, conditions })
  }

  return (
    <section className={styles.section}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <TextArea
          label="Pergunta"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={2}
          maxLength={2000}
          placeholder="Ex.: Quem deve fazer o teste de qPCR para hanseníase?"
        />
        <div className={styles.controls}>
          <Select
            label="Modelo"
            value={arm}
            onChange={(event) => setArm(event.target.value as StudyArm)}
            options={service.arms.map((item) => ({ value: item.arm, label: modelLabel(item.provider, item.model) }))}
          />
          <fieldset className={styles.conditions}>
            <legend>Condições</legend>
            {service.conditions.map((item) => (
              <label key={item.code}>
                <input type="checkbox" checked={conditions.includes(item.code)} onChange={() => toggle(item.code)} />
                {item.label}
              </label>
            ))}
          </fieldset>
        </div>
        <div className={styles.submitRow}>
          <Button type="submit" disabled={mutation.isPending || question.trim().length < 3 || !conditions.length}>
            Comparar
          </Button>
          <span className={styles.caption}>
            {service.dry_run
              ? 'Modo simulado: nenhuma chamada aos modelos.'
              : `Usa a sua assinatura: ${calls} chamada${calls === 1 ? '' : 's'} ao modelo. Não é dado do experimento.`}
          </span>
          {service.dry_run ? <Badge tone="warning">simulado</Badge> : null}
        </div>
      </form>

      {mutation.isPending ? <Spinner label="Gerando as respostas; pode levar alguns minutos..." /> : null}
      {mutation.isError ? <ErrorState error={mutation.error} /> : null}
      {mutation.data ? (
        <>
          <blockquote className={styles.question}>{mutation.data.question}</blockquote>
          <p className={styles.caption}>
            {modelLabel(mutation.data.provider, mutation.data.model)} · registro {mutation.data.log}
          </p>
          <ConditionGrid results={mutation.data.results} />
        </>
      ) : null}
    </section>
  )
}
