import { useOutletContext } from 'react-router-dom'
import type { UserType } from '../../api/types'

/** Perfil fixo da interface pública: o backend usa linguagem técnica para este perfil. */
export const CONSULTATION_USER_TYPE: UserType = 'Profissional de saúde'

export interface ConsultationContext {
  isOpen: boolean
  /** Abre a gaveta de consulta; com `question`, já envia a pergunta. */
  open: (question?: string) => void
}

export function useConsultation(): ConsultationContext {
  return useOutletContext<ConsultationContext>()
}
