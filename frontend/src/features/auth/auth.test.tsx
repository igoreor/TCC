import { fireEvent, screen, waitFor } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ApiError } from '../../api/client'
import { queryKeys } from '../../api/queryKeys'
import { GlobalHeader } from '../../components/layout/GlobalHeader'
import { createQueryClient } from '../../lib/queryClient'
import { mockApi, renderWithProviders, respondTo, TEST_USER } from '../../test/helpers'
import { LoginPage } from './LoginPage'
import type { LoginLocationState } from './loginNavigation'
import { RequireAuth } from './RequireAuth'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<GlobalHeader onOpenConsultation={() => undefined} />} />
      <Route
        path="/comparacao"
        element={
          <RequireAuth>
            <p>Conteúdo protegido</p>
          </RequireAuth>
        }
      />
    </Routes>
  )
}

function fillLogin(username: string, password: string) {
  fireEvent.change(screen.getByLabelText('Usuário'), { target: { value: username } })
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: password } })
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('rotas protegidas', () => {
  it('levam à tela de login quando não há sessão', async () => {
    mockApi(respondTo('GET', '/api/auth/me', { status: 401, body: { message: 'Não autenticado.' } }))

    renderWithProviders(<AppRoutes />, { route: '/comparacao' })

    expect(await screen.findByRole('heading', { name: 'Entrar no NexoHansen' })).toBeTruthy()
    expect(screen.queryByText('Conteúdo protegido')).toBeNull()
  })

  it('mostram o conteúdo para quem tem sessão', async () => {
    mockApi(respondTo('GET', '/api/auth/me', { status: 200, body: { user: TEST_USER } }))

    renderWithProviders(<AppRoutes />, { route: '/comparacao' })

    expect(await screen.findByText('Conteúdo protegido')).toBeTruthy()
  })
})

describe('login', () => {
  it('mostra o erro de credenciais inválidas e limpa a senha', async () => {
    const api = mockApi(
      respondTo('GET', '/api/auth/me', { status: 401, body: { message: 'Não autenticado.' } }),
      respondTo('POST', '/api/auth/login', { status: 401, body: { message: 'Usuário ou senha inválidos.' } }),
    )
    renderWithProviders(<AppRoutes />, { route: '/login' })
    await screen.findByLabelText('Usuário')

    fillLogin('ana', 'senha-errada')

    expect((await screen.findByRole('alert')).textContent).toBe('Usuário ou senha inválidos.')
    expect((screen.getByLabelText('Senha') as HTMLInputElement).value).toBe('')
    expect(api.calls.find((call) => call.url.endsWith('/api/auth/login'))?.body).toEqual({
      username: 'ana',
      password: 'senha-errada',
    })
  })

  it('informa quando a API está fora do ar', async () => {
    mockApi(respondTo('GET', '/api/auth/me', { status: 401, body: {} }))
    renderWithProviders(<AppRoutes />, { route: '/login' })
    await screen.findByLabelText('Usuário')
    // Falha de rede: o cliente da API converte em ApiError de status 0.
    const offline = mockApi(() => {
      throw new TypeError('fetch failed')
    })

    fillLogin('ana', 'qualquer')

    expect((await screen.findByRole('alert')).textContent).toContain('Não foi possível conectar à API')
    expect(offline.calls).toHaveLength(1)
  })

  it('entra e volta para a página que exigiu o login', async () => {
    mockApi(
      respondTo('GET', '/api/auth/me', { status: 401, body: {} }),
      respondTo('POST', '/api/auth/login', { status: 200, body: { user: TEST_USER } }),
    )
    const state: LoginLocationState = { from: { pathname: '/comparacao' } }
    renderWithProviders(<AppRoutes />, { route: { pathname: '/login', state } })
    await screen.findByLabelText('Usuário')

    fillLogin('ana', 'senha-correta')

    expect(await screen.findByText('Conteúdo protegido')).toBeTruthy()
  })
})

describe('logout', () => {
  it('encerra a sessão na API, apaga as conversas salvas e volta ao login', async () => {
    localStorage.setItem(`hanseniase-chat-session-v1:${TEST_USER.id}`, '{"messages":[]}')
    localStorage.setItem('outra-chave', 'mantida')
    const api = mockApi(
      respondTo('POST', '/api/auth/logout', { status: 204 }),
      respondTo('GET', '/api/auth/me', { status: 401, body: {} }),
    )
    const { queryClient } = renderWithProviders(<AppRoutes />, { route: '/', user: TEST_USER })

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(await screen.findByRole('heading', { name: 'Entrar no NexoHansen' })).toBeTruthy()
    expect(api.calls.some((call) => call.method === 'POST' && call.url.endsWith('/api/auth/logout'))).toBe(true)
    expect(queryClient.getQueryData(queryKeys.currentUser)).toBeNull()
    expect(localStorage.getItem(`hanseniase-chat-session-v1:${TEST_USER.id}`)).toBeNull()
    expect(localStorage.getItem('outra-chave')).toBe('mantida')
  })
})

describe('sessão expirada', () => {
  it('um 401 em qualquer chamada desfaz o login local, exceto na própria tentativa de login', async () => {
    const queryClient = createQueryClient()
    queryClient.setQueryData(queryKeys.currentUser, TEST_USER)
    const unauthorized = () => Promise.reject(new ApiError('Autenticação necessária.', 401))

    await queryClient
      .getMutationCache()
      .build(queryClient, { mutationFn: unauthorized, meta: { authRequest: true } })
      .execute(undefined)
      .catch(() => undefined)
    expect(queryClient.getQueryData(queryKeys.currentUser)).toEqual(TEST_USER)

    await queryClient
      .getMutationCache()
      .build(queryClient, { mutationFn: unauthorized })
      .execute(undefined)
      .catch(() => undefined)
    await waitFor(() => expect(queryClient.getQueryData(queryKeys.currentUser)).toBeNull())
  })
})
