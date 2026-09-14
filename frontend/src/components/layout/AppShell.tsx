import type { ReactNode } from 'react'
import { HealthIndicator } from './HealthIndicator'
import { NavBar } from './NavBar'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>RAG Hanseníase</h1>
          <HealthIndicator />
        </div>
        <NavBar />
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
