import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { InitialEntry } from 'react-router-dom'
import { vi } from 'vitest'
import { queryKeys } from '../api/queryKeys'
import type { AuthUser } from '../api/types'
import { createQueryClient } from '../lib/queryClient'

export const TEST_USER: AuthUser = { id: 'aaaaaaaa-0000-4000-8000-000000000001', username: 'ana' }

interface RenderOptions {
  route?: InitialEntry
  /** Usuário já autenticado (`null`: sem sessão; omitido: a sessão é consultada na API). */
  user?: AuthUser | null
}

export function renderWithProviders(ui: ReactElement, { route = '/', user }: RenderOptions = {}) {
  const queryClient = createQueryClient()
  if (user !== undefined) queryClient.setQueryData(queryKeys.currentUser, user)
  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
  return { ...result, queryClient }
}

type Reply = { status: number; body?: unknown }
type Route = (request: { url: string; method: string; body: unknown }) => Reply | undefined

/** Substitui o fetch: cada chamada é registrada e respondida pela primeira rota que devolver algo. */
export function mockApi(...routes: Route[]) {
  const calls: Array<{ url: string; method: string; body: unknown; credentials?: RequestCredentials }> = []
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = init?.method ?? 'GET'
    const body = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined
    calls.push({ url, method, body, credentials: init?.credentials })
    const reply = routes.map((route) => route({ url, method, body })).find(Boolean) ?? { status: 404, body: { message: 'Rota não simulada.' } }
    return new Response(reply.body === undefined ? null : JSON.stringify(reply.body), {
      status: reply.status,
      headers: reply.body === undefined ? {} : { 'Content-Type': 'application/json' },
    })
  })
  vi.stubGlobal('fetch', fetchMock)
  return { calls, fetchMock }
}

export function respondTo(method: string, path: string, ...replies: Reply[]): Route {
  let index = 0
  return (request) => {
    if (request.method !== method || !request.url.endsWith(path)) return undefined
    const reply = replies[Math.min(index, replies.length - 1)]
    index += 1
    return reply
  }
}
