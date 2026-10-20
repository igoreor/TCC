import { Link, useLocation } from 'react-router-dom'
import { cx } from '../../lib/cx'
import { Wordmark } from '../brand/BrandMark'
import { Button } from '../primitives/Button'

const sectionLinks = [
  { hash: '#como-funciona', label: 'Como funciona' },
  { hash: '#limites', label: 'Limites' },
  { hash: '#base', label: 'Base' },
]

const navLinkClasses = 'rounded-xs px-3 py-2 text-small text-ink-soft transition-colors duration-150 hover:text-ink'

interface GlobalHeaderProps {
  onOpenConsultation: () => void
}

export function GlobalHeader({ onOpenConsultation }: GlobalHeaderProps) {
  const { pathname } = useLocation()
  const onComparison = pathname === '/comparacao'

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-rule bg-paper">
      <div className="mx-auto flex h-full max-w-site items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <Wordmark />
          <span className="hidden border-l border-rule pl-3 text-small text-ink-faint xl:inline">
            Apoio à decisão clínica em hanseníase
          </span>
        </Link>

        <nav aria-label="Principal" className="flex items-center gap-3">
          <ul className="hidden items-center md:flex">
            {sectionLinks.map((link) => (
              <li key={link.hash}>
                <Link to={{ pathname: '/', hash: link.hash }} className={navLinkClasses}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/comparacao"
                aria-current={onComparison ? 'page' : undefined}
                className={cx(
                  navLinkClasses,
                  onComparison && 'text-ink underline decoration-accent decoration-2 underline-offset-6',
                )}
              >
                Comparação
              </Link>
            </li>
          </ul>
          <Button size="sm" onClick={onOpenConsultation}>
            <span className="sm:hidden">Consultar</span>
            <span className="hidden sm:inline">Abrir consulta</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
