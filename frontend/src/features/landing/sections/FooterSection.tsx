import { Link } from 'react-router-dom'
import { Wordmark } from '../../../components/brand/BrandMark'
import { metaLabel } from '../../../components/primitives/classes'
import { cx } from '../../../lib/cx'
import { footerContent } from '../content'

const footerLinks = [
  { to: { pathname: '/', hash: '#como-funciona' }, label: 'Como funciona' },
  { to: { pathname: '/', hash: '#limites' }, label: 'Limites' },
  { to: { pathname: '/', hash: '#base' }, label: 'Base' },
  { to: { pathname: '/comparacao' }, label: 'Comparação' },
]

export function FooterSection() {
  return (
    <footer className="border-t border-rule">
      {/* Folga inferior extra fora do desktop: o lançador flutuante pode ficar sobre o rodapé. */}
      <div className="mx-auto max-w-site px-4 pb-24 pt-14 sm:px-6 lg:px-8 lg:pb-10">
        <div className="grid gap-x-10 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Wordmark />
            <p className="mt-3 text-small text-ink-soft">{footerContent.tagline}</p>
          </div>
          <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:col-span-8">
            {footerContent.colophon.map((item) => (
              <div key={item.term}>
                <dt className={cx(metaLabel, 'text-ink-faint')}>{item.term}</dt>
                <dd className="mt-1.5 text-small text-pretty text-ink-soft">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-rule pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-micro text-ink-faint">{footerContent.baseNote}</p>
          <nav aria-label="Rodapé">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-small">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-ink-soft transition-colors duration-150 hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
