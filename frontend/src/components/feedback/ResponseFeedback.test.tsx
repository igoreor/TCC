import { useState } from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FeedbackState } from '../../lib/feedback'
import { mockApi, renderWithProviders, respondTo, TEST_USER } from '../../test/helpers'
import { ResponseFeedback } from './ResponseFeedback'

const MESSAGE_ID = 'cccccccc-0000-4000-8000-000000000003'

function Harness({ initial }: { initial?: FeedbackState }) {
  const [state, setState] = useState(initial)
  return <ResponseFeedback messageId={MESSAGE_ID} state={state} onStateChange={setState} />
}

const created = (rating: number) => ({
  status: 201,
  body: { id: 'f-1', messageId: MESSAGE_ID, sessionId: 's-1', rating, comment: null, createdAt: '2026-10-22T10:00:00Z' },
})

describe('avaliação da resposta', () => {
  it('oferece notas inteiras de 0 a 10 e só pede o comentário depois da nota', () => {
    renderWithProviders(<Harness />, { user: TEST_USER })

    const options = screen.getAllByRole('radio')
    expect(options.map((option) => (option as HTMLInputElement).value)).toEqual(
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    )
    expect(screen.queryByRole('textbox')).toBeNull()

    fireEvent.click(screen.getByRole('radio', { name: '8' }))

    expect(screen.getByRole('textbox', { name: /O que estava errado/ })).toBeTruthy()
  })

  it('envia apenas a nota quando não há comentário e confirma o registro', async () => {
    const api = mockApi(respondTo('POST', '/api/feedback', created(8)))
    renderWithProviders(<Harness />, { user: TEST_USER })

    fireEvent.click(screen.getByRole('radio', { name: '8' }))
    fireEvent.click(screen.getByRole('button', { name: 'Enviar avaliação' }))

    expect(await screen.findByText('Avaliação registrada: nota 8. Obrigado.')).toBeTruthy()
    expect(api.calls).toEqual([
      { url: '/api/feedback', method: 'POST', body: { messageId: MESSAGE_ID, rating: 8 }, credentials: 'include' },
    ])
  })

  it('envia o comentário junto da nota', async () => {
    const api = mockApi(respondTo('POST', '/api/feedback', created(3)))
    renderWithProviders(<Harness />, { user: TEST_USER })

    fireEvent.click(screen.getByRole('radio', { name: '3' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '  Citou uma fonte que não trata do tema.  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar avaliação' }))

    await screen.findByText('Avaliação registrada: nota 3. Obrigado.')
    expect(api.calls[0].body).toEqual({
      messageId: MESSAGE_ID,
      rating: 3,
      comment: 'Citou uma fonte que não trata do tema.',
    })
  })

  it('informa a falha ao salvar e permite tentar novamente sem perder o que foi preenchido', async () => {
    const api = mockApi(
      respondTo('POST', '/api/feedback', { status: 500, body: { message: 'Erro interno do servidor.' } }, created(6)),
    )
    renderWithProviders(<Harness />, { user: TEST_USER })

    fireEvent.click(screen.getByRole('radio', { name: '6' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Resposta longa demais.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar avaliação' }))

    expect((await screen.findByRole('alert')).textContent).toContain('Não foi possível registrar a avaliação')
    expect((screen.getByRole('radio', { name: '6' }) as HTMLInputElement).checked).toBe(true)
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Resposta longa demais.')

    fireEvent.click(screen.getByRole('button', { name: 'Enviar avaliação' }))

    expect(await screen.findByText('Avaliação registrada: nota 6. Obrigado.')).toBeTruthy()
    expect(api.calls).toHaveLength(2)
  })

  it('trata uma avaliação repetida (409) como já registrada', async () => {
    mockApi(respondTo('POST', '/api/feedback', { status: 409, body: { message: 'Você já avaliou esta resposta.' } }))
    renderWithProviders(<Harness />, { user: TEST_USER })

    fireEvent.click(screen.getByRole('radio', { name: '5' }))
    fireEvent.click(screen.getByRole('button', { name: 'Enviar avaliação' }))

    expect(await screen.findByText('Esta resposta já tinha sido avaliada por você.')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('pode ser dispensada sem enviar e reaberta depois', () => {
    const api = mockApi()
    renderWithProviders(<Harness />, { user: TEST_USER })

    fireEvent.click(screen.getByRole('button', { name: 'Dispensar avaliação' }))

    expect(screen.queryByRole('radio')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Avaliar esta resposta' }))
    expect(screen.getAllByRole('radio')).toHaveLength(11)
    expect(api.calls).toHaveLength(0)
  })

  it('não envia sem uma nota escolhida', async () => {
    const api = mockApi()
    renderWithProviders(<Harness />, { user: TEST_USER })

    expect(screen.queryByRole('button', { name: 'Enviar avaliação' })).toBeNull()
    await waitFor(() => expect(api.calls).toHaveLength(0))
  })
})
