const PREFIX = 'hanseniase-chat-session-v1'

/** Cada usuário tem a própria conversa salva no painel interno. */
export function chatStorageKey(userId: string) {
  return `${PREFIX}:${userId}`
}

/** Apaga as conversas salvas neste navegador, inclusive a do formato anterior ao login. */
export function clearStoredChatSessions() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key === PREFIX || key.startsWith(`${PREFIX}:`)) localStorage.removeItem(key)
    }
  } catch {
    // localStorage indisponível (ex: modo privado) - não há o que apagar
  }
}

/** Remove a conversa salva antes da autenticação, que não pertencia a nenhum usuário. */
export function clearLegacyChatSession() {
  try {
    localStorage.removeItem(PREFIX)
  } catch {
    // localStorage indisponível
  }
}
