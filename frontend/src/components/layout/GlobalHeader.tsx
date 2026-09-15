import { Link, useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Início' },
  { to: '/comparacao', label: 'Comparação Acadêmica' },
]

export function GlobalHeader() {
  const { pathname } = useLocation()

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-base font-semibold text-zinc-100 no-underline">
          <Sparkles className="h-5 w-5 text-accent drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]" aria-hidden="true" />
          RAG Hanseníase
        </Link>
        <nav className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={[
                'text-sm no-underline transition-opacity duration-200',
                pathname === link.to ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-100',
              ].join(' ')}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
