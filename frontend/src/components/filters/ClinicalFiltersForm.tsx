import type { SearchFilters } from '../../api/types'
import {
  clinicalCriticalityOptions,
  clinicalPhaseOptions,
  diseaseClassificationOptions,
  informationTypeOptions,
  safetyLevelOptions,
  targetDemographicOptions,
} from '../../lib/constants'
import { Select } from '../ui/Select'
import { TextField } from '../ui/TextField'
import styles from './ClinicalFiltersForm.module.css'

interface ClinicalFiltersFormProps {
  value: SearchFilters
  onChange: (filters: SearchFilters) => void
}

const booleanFlags: Array<{ key: keyof SearchFilters; label: string }> = [
  { key: 'medicationRelated', label: 'Relacionado a medicamento' },
  { key: 'diagnosisRelated', label: 'Relacionado a diagnóstico' },
  { key: 'reactionRelated', label: 'Relacionado a reação' },
  { key: 'examRelated', label: 'Relacionado a exame' },
]

export function ClinicalFiltersForm({ value, onChange }: ClinicalFiltersFormProps) {
  function set<K extends keyof SearchFilters>(key: K, next: SearchFilters[K]) {
    onChange({ ...value, [key]: next })
  }

  return (
    <div className={styles.grid}>
      <TextField
        label="ID do documento"
        value={value.documentId ?? ''}
        onChange={(event) => set('documentId', event.target.value || undefined)}
        placeholder="ex: diagnostico_clinico"
      />
      <Select
        label="Fase clínica"
        placeholder="Todas"
        options={clinicalPhaseOptions}
        value={value.clinicalPhase ?? ''}
        onChange={(event) => set('clinicalPhase', event.target.value || undefined)}
      />
      <Select
        label="Tipo de informação"
        placeholder="Todos"
        options={informationTypeOptions}
        value={value.informationType ?? ''}
        onChange={(event) => set('informationType', event.target.value || undefined)}
      />
      <Select
        label="População-alvo"
        placeholder="Todas"
        options={targetDemographicOptions}
        value={value.targetDemographic ?? ''}
        onChange={(event) => set('targetDemographic', event.target.value || undefined)}
      />
      <Select
        label="Criticidade clínica"
        placeholder="Todas"
        options={clinicalCriticalityOptions}
        value={value.clinicalCriticality ?? ''}
        onChange={(event) => set('clinicalCriticality', event.target.value || undefined)}
      />
      <Select
        label="Classificação da doença"
        placeholder="Todas"
        options={diseaseClassificationOptions}
        value={value.diseaseClassification ?? ''}
        onChange={(event) => set('diseaseClassification', event.target.value || undefined)}
      />
      <Select
        label="Nível de segurança"
        placeholder="Todos"
        options={safetyLevelOptions}
        value={value.safetyLevel ?? ''}
        onChange={(event) => set('safetyLevel', event.target.value || undefined)}
      />
      <fieldset className={styles.flags}>
        <legend className={styles.flagsLegend}>Sinalizações</legend>
        {booleanFlags.map((flag) => (
          <label key={String(flag.key)} className={styles.flagOption}>
            <input
              type="checkbox"
              checked={Boolean(value[flag.key])}
              onChange={(event) => set(flag.key, event.target.checked ? true : undefined)}
            />
            {flag.label}
          </label>
        ))}
      </fieldset>
    </div>
  )
}
