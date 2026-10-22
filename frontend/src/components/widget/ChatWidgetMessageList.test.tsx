import { useState } from 'react'
import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { SafetyInfo } from '../../api/types'
import type { RagUiMessage } from '../../hooks/useRagConversation'
import type { FeedbackState } from '../../lib/feedback'
import { mockApi, renderWithProviders, respondTo, TEST_USER } from '../../test/helpers'
import { ChatWidgetMessageList } from './ChatWidgetMessageList'

const safety: SafetyInfo = {
  riskLevel: 'Alto',
  fallbackTriggered: false,
  requiresProfessionalEvaluation: true,
  disclaimer: 'Este sistema é um recurso de apoio informacional.',
}

const question = (id: string, content: string): RagUiMessage => ({ id, role: 'user', content })
const answer = (id: string, content: string): RagUiMessage => ({ id, role: 'assistant', content, sources: [], safety })

function Harness({ initial, isPending = false }: { initial: RagUiMessage[]; isPending?: boolean }) {
  const [messages, setMessages] = useState(initial)
  const setFeedback = (messageId: string, feedback: FeedbackState | undefined) =>
    setMessages((current) => current.map((message) => (message.id === messageId ? { ...message, feedback } : message)))

  return (
    <ChatWidgetMessageList
      messages={messages}
      isPending={isPending}
      error={null}
      onAsk={() => undefined}
      onRetry={() => undefined}
      onFeedbackChange={setFeedback}
    />
  )
}

const forms = () => screen.queryAllByRole('form', { name: 'Avalie esta resposta' })

describe('avaliação no registro da consulta', () => {
  it('aparece depois de cada resposta concluída, e não enquanto a resposta é aguardada', () => {
    renderWithProviders(
      <Harness
        isPending
        initial={[question('q-1', 'Primeira pergunta'), answer('r-1', 'Primeira resposta.'), question('q-2', 'Segunda pergunta')]}
      />,
      { user: TEST_USER },
    )

    expect(forms()).toHaveLength(1)
    expect(screen.getByText('Consultando a base')).toBeTruthy()
  })

  it('associa cada avaliação à sua resposta e permite avaliar respostas da mesma conversa de forma independente', async () => {
    const api = mockApi(
      respondTo('POST', '/api/feedback', {
        status: 201,
        body: { id: 'f-2', messageId: 'r-2', sessionId: 's-1', rating: 9, comment: null, createdAt: '2026-10-22T10:00:00Z' },
      }),
    )
    renderWithProviders(
      <Harness
        initial={[
          question('q-1', 'Primeira pergunta'),
          answer('r-1', 'Primeira resposta.'),
          question('q-2', 'Segunda pergunta'),
          answer('r-2', 'Segunda resposta.'),
        ]}
      />,
      { user: TEST_USER },
    )

    expect(forms()).toHaveLength(2)
    const second = forms()[1]
    fireEvent.click(within(second).getByRole('radio', { name: '9' }))
    fireEvent.click(within(second).getByRole('button', { name: 'Enviar avaliação' }))

    expect(await screen.findByText('Avaliação registrada: nota 9. Obrigado.')).toBeTruthy()
    expect(api.calls[0].body).toEqual({ messageId: 'r-2', rating: 9 })
    // A avaliação da primeira resposta continua disponível.
    expect(forms()).toHaveLength(1)
  })
})
