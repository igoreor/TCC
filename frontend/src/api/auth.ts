import { ApiError, apiClient } from './client'
import type { AuthUser, LoginInput } from './types'

export async function login(input: LoginInput) {
  const { user } = await apiClient.post<{ user: AuthUser }>('/api/auth/login', input)
  return user
}

export function logout() {
  return apiClient.post<null>('/api/auth/logout')
}

/** Usuário da sessão atual, ou `null` quando não há sessão válida. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { user } = await apiClient.get<{ user: AuthUser }>('/api/auth/me')
    return user
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}
