export class ApiError extends Error {
  status: number
  issues?: unknown
  details?: unknown

  constructor(message: string, status: number, issues?: unknown, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.issues = issues
    this.details = details
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

interface ErrorBody {
  message?: string
  issues?: unknown
  details?: unknown
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    })
  } catch {
    throw new ApiError('Não foi possível conectar à API. Verifique se o backend está rodando.', 0)
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const body: ErrorBody | null = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    throw new ApiError(
      body?.message ?? `Erro inesperado (HTTP ${response.status}).`,
      response.status,
      body?.issues,
      body?.details,
    )
  }

  return body as T
}

export function buildQuery(params: object): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),
}
