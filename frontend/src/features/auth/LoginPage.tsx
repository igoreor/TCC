import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ApiError } from '../../api/client'
import { Wordmark } from '../../components/brand/BrandMark'
import { Button } from '../../components/primitives/Button'
import { metaLabel, textLinkClasses } from '../../components/primitives/classes'
import { cx } from '../../lib/cx'
import type { LoginLocationState } from './loginNavigation'
import { afterLoginState, loginDestination } from './loginNavigation'
import { useCurrentUser, useLogin } from './useAuth'

const fieldClasses =
  'mt-1.5 block h-11 w-full rounded-xs border border-rule-control bg-paper-raised px-3 text-ui text-ink transition-colors duration-150 placeholder:text-ink-faint focus:border-ink focus:outline-2 focus:outline-offset-2 focus:outline-accent'

function loginErrorMessage(error: unknown) {
  if (error instanceof ApiError && [0, 401, 429].includes(error.status)) return error.message
  return 'Não foi possível entrar agora. Tente novamente em instantes.'
}

export function LoginPage() {
  const { data: user } = useCurrentUser()
  const login = useLogin()
  const location = useLocation()
  const state = location.state as LoginLocationState | null
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const usernameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    usernameRef.current?.focus()
  }, [])

  // Com a sessão aberta (inclusive logo após o login), segue para onde a pessoa queria ir.
  if (user) return <Navigate to={loginDestination(state)} replace state={afterLoginState(state)} />

  const canSubmit = username.trim().length > 0 && password.length > 0 && !login.isPending

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    login.mutate({ username: username.trim(), password }, { onError: () => setPassword('') })
  }

  return (
    <div data-ui="public" className="flex min-h-dvh flex-col">
      <header className="border-b border-rule">
        <div className="mx-auto flex h-16 max-w-site items-center px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="NexoHansen, página inicial">
            <Wordmark />
          </Link>
        </div>
      </header>

      <main id="conteudo" className="flex flex-1 justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-sm">
          <p className={cx(metaLabel, 'text-accent')}>Acesso restrito</p>
          <h1 className="mt-2 font-serif text-heading font-medium text-ink">Entrar no NexoHansen</h1>
          <p className="mt-2 text-ui text-pretty text-ink-soft">
            {state?.from || state?.consultation
              ? 'Entre para continuar. A consulta e a avaliação das respostas exigem login.'
              : 'Use o usuário e a senha fornecidos pela equipe da pesquisa.'}
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            <div>
              <label htmlFor="login-usuario" className="text-small font-medium text-ink">
                Usuário
              </label>
              <input
                id="login-usuario"
                ref={usernameRef}
                name="username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className={fieldClasses}
              />
            </div>
            <div>
              <label htmlFor="login-senha" className="text-small font-medium text-ink">
                Senha
              </label>
              <input
                id="login-senha"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={fieldClasses}
              />
            </div>

            {login.isError ? (
              <p role="alert" className="border-l-2 border-critical bg-critical-soft/60 py-2.5 pl-3 pr-3 text-small text-ink">
                {loginErrorMessage(login.error)}
              </p>
            ) : null}

            <Button type="submit" disabled={!canSubmit} className="w-full">
              {login.isPending ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

          <Link to="/" className={cx(textLinkClasses, 'mt-10 text-small')}>
            <ArrowLeft aria-hidden="true" className="size-4" />
            Voltar à página inicial
          </Link>
        </div>
      </main>
    </div>
  )
}
