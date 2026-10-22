/** Estado levado para a tela de login: de onde a pessoa veio e se pretendia abrir a consulta. */
export interface LoginLocationState {
  from?: { pathname: string; search?: string; hash?: string }
  consultation?: { question?: string }
}

/** Estado entregue à página de destino depois do login. */
export interface AfterLoginState {
  openConsultation?: boolean
  question?: string
}

export function loginDestination(state: LoginLocationState | null | undefined): string {
  const from = state?.from
  // Só caminhos internos; nunca volta para o próprio login.
  if (!from || !from.pathname.startsWith('/') || from.pathname.startsWith('//') || from.pathname === '/login') return '/'
  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
}

export function afterLoginState(state: LoginLocationState | null | undefined): AfterLoginState | undefined {
  return state?.consultation ? { openConsultation: true, question: state.consultation.question } : undefined
}
