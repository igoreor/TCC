import type { RetrievalMode, UserType } from '../api/types'
import { clinicalPhaseLabel, informationTypeLabel, retrievalModeLabel } from './labels'

export interface SelectOption {
  value: string
  label: string
}

export const clinicalPhaseOptions: SelectOption[] = [
  'Screening',
  'Diagnosis',
  'Classification',
  'Exam',
  'Treatment',
  'Reaction_Management',
  'Disability_Prevention',
  'Follow_Up',
  'Surveillance',
  'Psychosocial',
  'Safety',
  'Technical',
].map((value) => ({ value, label: clinicalPhaseLabel(value) }))

export const informationTypeOptions: SelectOption[] = [
  'Clinical_Guideline',
  'Epidemiological_Data',
  'Pharmacological_Info',
  'Diagnostic_Criteria',
  'Differential_Diagnosis',
  'Public_Health',
  'Safety_Policy',
  'Technical_Implementation',
].map((value) => ({ value, label: informationTypeLabel(value) }))

export const targetDemographicOptions: SelectOption[] = ['Adulto', 'Pediátrico', 'Gestante', 'Contato domiciliar', 'Geral'].map(
  (value) => ({ value, label: value }),
)

export const clinicalCriticalityOptions: SelectOption[] = ['Baixa', 'Média', 'Alta', 'Muito alta'].map((value) => ({
  value,
  label: value,
}))

export const diseaseClassificationOptions: SelectOption[] = [
  'PB',
  'MB',
  'Indeterminada',
  'Tuberculoide',
  'Dimorfa',
  'Virchowiana',
  'Não aplicável',
].map((value) => ({ value, label: value }))

export const safetyLevelOptions: SelectOption[] = [
  'Educativo',
  'Requer confirmação profissional',
  'Encaminhar serviço de saúde',
  'Alto risco',
].map((value) => ({ value, label: value }))

export const retrievalModeOptions: Array<{ value: RetrievalMode; label: string }> = (
  ['hybrid', 'vector', 'text'] as RetrievalMode[]
).map((value) => ({ value, label: retrievalModeLabel(value) }))

export const userTypeOptions: UserType[] = ['Profissional de saúde', 'Paciente', 'Desenvolvedor']
