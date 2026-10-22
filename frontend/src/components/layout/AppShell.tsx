import type { ReactNode } from 'react'
import { useCurrentUser, useLogout } from '../../features/auth/useAuth'
import { Button } from '../ui/Button'
import { HealthIndicator } from './HealthIndicator'
import { NavBar } from './NavBar'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { data: user } = useCurrentUser()
  const logout = useLogout()

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>RAG Hanseníase</h1>
          <div className={styles.headerActions}>
            <HealthIndicator />
            {user ? (
              <div className={styles.account}>
                <span title="Usuário conectado">{user.username}</span>
                <Button variant="secondary" onClick={() => logout.mutate()} disabled={logout.isPending}>
                  Sair
                </Button>
              </div>
            ) : null}
          </div>
        </div>
        <NavBar />
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
