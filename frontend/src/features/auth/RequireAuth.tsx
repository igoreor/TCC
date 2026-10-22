import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { LoginLocationState } from './loginNavigation'
import { useCurrentUser } from './useAuth'

/** Rota que exige login: sem sessão, leva à tela de login e volta para cá depois. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { data: user, isPending } = useCurrentUser()
  const { pathname, search, hash } = useLocation()

  if (isPending) {
    return (
      <p role="status" className="px-6 py-24 text-center text-small text-ink-faint">
        Verificando a sessão…
      </p>
    )
  }

  if (!user) {
    const state: LoginLocationState = { from: { pathname, search, hash } }
    return <Navigate to="/login" replace state={state} />
  }

  return children
}
