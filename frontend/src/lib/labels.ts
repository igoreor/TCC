const intentLabels: Record<string, string> = {
  screening: 'Triagem',
  diagnosis: 'Diagnóstico',
  classification: 'Classificação',
  exam: 'Exame',
  treatment: 'Tratamento',
  medication: 'Medicamento',
  reaction: 'Reação hansênica',
  disability_prevention: 'Prevenção de incapacidades',
  contacts_surveillance: 'Contatos e vigilância',
  psychosocial: 'Psicossocial',
  safety: 'Segurança do sistema',
  out_of_scope: 'Fora de escopo',
}

const clinicalPhaseLabels: Record<string, string> = {
  Screening: 'Triagem',
  Diagnosis: 'Diagnóstico',
  Classification: 'Classificação',
  Exam: 'Exame',
  Treatment: 'Tratamento',
  Reaction_Management: 'Manejo de reação',
  Disability_Prevention: 'Prevenção de incapacidades',
  Follow_Up: 'Acompanhamento',
  Surveillance: 'Vigilância',
  Psychosocial: 'Psicossocial',
  Safety: 'Segurança',
  Technical: 'Técnico',
}

const informationTypeLabels: Record<string, string> = {
  Clinical_Guideline: 'Diretriz clínica',
  Epidemiological_Data: 'Dado epidemiológico',
  Pharmacological_Info: 'Informação farmacológica',
  Diagnostic_Criteria: 'Critério diagnóstico',
  Differential_Diagnosis: 'Diagnóstico diferencial',
  Public_Health: 'Saúde pública',
  Safety_Policy: 'Política de segurança',
  Technical_Implementation: 'Implementação técnica',
}

const retrievalModeLabels: Record<string, string> = {
  vector: 'Vetorial',
  text: 'Textual',
  hybrid: 'Híbrida',
}

function labelOr(map: Record<string, string>, key: string): string {
  return map[key] ?? key
}

export const intentLabel = (intent: string): string => labelOr(intentLabels, intent)
export const clinicalPhaseLabel = (phase: string): string => labelOr(clinicalPhaseLabels, phase)
export const informationTypeLabel = (type: string): string => labelOr(informationTypeLabels, type)
export const retrievalModeLabel = (mode: string): string => labelOr(retrievalModeLabels, mode)
