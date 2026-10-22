/**
 * Situação da avaliação de uma resposta. Sem valor, o formulário está aberto.
 * Fica junto da mensagem para sobreviver ao fechamento da gaveta e à troca de página.
 */
export type FeedbackState =
  | { status: 'dismissed' }
  | { status: 'submitted'; rating: number }
  /** O servidor já tinha uma avaliação desta pessoa para a resposta (409). */
  | { status: 'duplicate' }

export const RATING_MIN = 0
export const RATING_MAX = 10
export const COMMENT_MAX_LENGTH = 1000
