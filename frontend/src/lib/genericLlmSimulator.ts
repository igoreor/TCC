const OPENERS = ['Essa é uma boa pergunta.', 'Posso te ajudar com isso.', 'Vou tentar responder da melhor forma possível.']
const CLOSERS = [
  'Espero ter ajudado! Se precisar de mais alguma coisa, é só perguntar.',
  'Qualquer dúvida adicional, estou à disposição.',
]

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export interface GenericAnswer {
  content: string
}

export async function simulateGenericAnswer(question: string): Promise<GenericAnswer> {
  const delayMs = 1500 + Math.random() * 1500
  await new Promise((resolve) => setTimeout(resolve, delayMs))

  const content = [
    pick(OPENERS),
    `Sobre "${question.trim()}", de modo geral esse é um tema com múltiplos aspectos e minha resposta é baseada em conhecimento amplo, não especializado.`,
    'Recomendo confirmar qualquer informação de saúde com uma fonte oficial ou profissional qualificado, já que não tenho acesso a diretrizes clínicas atualizadas nem a uma base de conhecimento específica sobre este assunto.',
    pick(CLOSERS),
  ].join(' ')

  return { content }
}
