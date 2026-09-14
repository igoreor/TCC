export type BadgeTone = 'success' | 'warning' | 'danger' | 'critical' | 'neutral'

export function riskTone(riskLevel: string): BadgeTone {
  switch (riskLevel) {
    case 'Baixo':
      return 'success'
    case 'Médio':
      return 'warning'
    case 'Alto':
      return 'danger'
    case 'Muito alto':
      return 'critical'
    default:
      return 'neutral'
  }
}

export function criticalityTone(criticality: string): BadgeTone {
  switch (criticality) {
    case 'Baixa':
      return 'success'
    case 'Média':
      return 'warning'
    case 'Alta':
      return 'danger'
    case 'Muito alta':
      return 'critical'
    default:
      return 'neutral'
  }
}

export function safetyLevelTone(safetyLevel: string): BadgeTone {
  switch (safetyLevel) {
    case 'Educativo':
      return 'success'
    case 'Requer confirmação profissional':
      return 'warning'
    case 'Encaminhar serviço de saúde':
      return 'danger'
    case 'Alto risco':
      return 'critical'
    default:
      return 'neutral'
  }
}

export function fallbackTone(fallbackTriggered: boolean): BadgeTone {
  return fallbackTriggered ? 'critical' : 'success'
}
