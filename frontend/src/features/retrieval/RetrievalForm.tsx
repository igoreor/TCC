import { useState } from 'react'
import type { FormEvent } from 'react'
import type { RetrievalMode, SearchFilters } from '../../api/types'
import { ClinicalFiltersForm } from '../../components/filters/ClinicalFiltersForm'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { TextArea } from '../../components/ui/TextArea'
import { TextField } from '../../components/ui/TextField'
import { retrievalModeOptions } from '../../lib/constants'
import styles from './Retrieval.module.css'

export interface RetrievalFormValue {
  question: string
  mode: RetrievalMode
  topK: number
  topN: number
  filters: SearchFilters
}

interface RetrievalFormProps {
  onSubmit: (value: RetrievalFormValue) => void
  isSearching: boolean
}

export function RetrievalForm({ onSubmit, isSearching }: RetrievalFormProps) {
  const [question, setQuestion] = useState('')
  const [mode, setMode] = useState<RetrievalMode>('hybrid')
  const [topK, setTopK] = useState(12)
  const [topN, setTopN] = useState(5)
  const [filters, setFilters] = useState<SearchFilters>({})

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!question.trim() || isSearching) return
    onSubmit({ question: question.trim(), mode, topK, topN, filters })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <TextArea
        label="Pergunta"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        rows={2}
        placeholder="Ex: Qual o tratamento para reação tipo 1?"
      />
      <div className={styles.formRow}>
        <Select
          label="Modo"
          value={mode}
          onChange={(event) => setMode(event.target.value as RetrievalMode)}
          options={retrievalModeOptions}
        />
        <TextField
          label="Top K (candidatos)"
          type="number"
          min={1}
          max={50}
          value={topK}
          onChange={(event) => setTopK(Number(event.target.value))}
        />
        <TextField
          label="Top N (exibidos)"
          type="number"
          min={1}
          max={20}
          value={topN}
          onChange={(event) => setTopN(Number(event.target.value))}
        />
      </div>
      <ClinicalFiltersForm value={filters} onChange={setFilters} />
      <Button type="submit" disabled={isSearching || !question.trim()}>
        {isSearching ? 'Buscando...' : 'Buscar'}
      </Button>
    </form>
  )
}
