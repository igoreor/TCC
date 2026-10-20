import type { ReactNode, Ref } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { closingContent } from '../content'

interface ClosingSectionProps {
  onOpenConsultation: () => void
  actionsRef: Ref<HTMLUListElement>
}

const actionClasses = 'group flex w-full items-start justify-between gap-6 py-6 text-left'

export function ClosingSection({ onOpenConsultation, actionsRef }: ClosingSectionProps) {
  const { consult, compare } = closingContent

  return (
    <section aria-labelledby="encerramento-titulo">
      <div className="mx-auto grid max-w-site gap-x-10 gap-y-14 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-32">
        <div className="lg:col-span-7">
          <h2 id="encerramento-titulo" className="font-serif text-display font-medium text-balance text-ink">
            {closingContent.title}
          </h2>
          <p className="mt-8 max-w-measure text-lede text-pretty text-ink-soft">{closingContent.body}</p>
        </div>

        <ul ref={actionsRef} className="self-end border-t border-ink lg:col-span-5">
          <li className="border-b border-rule">
            <button type="button" onClick={onOpenConsultation} className={actionClasses}>
              <ActionText title={consult.title} description={consult.description} />
            </button>
          </li>
          <li className="border-b border-rule">
            <Link to="/comparacao" className={actionClasses}>
              <ActionText title={compare.title} description={compare.description} />
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}

function ActionText({ title, description }: { title: string; description: ReactNode }) {
  return (
    <>
      <span>
        <span className="block font-serif text-heading font-medium text-ink transition-colors duration-150 group-hover:text-accent">
          {title}
        </span>
        <span className="mt-1.5 block text-ui text-ink-soft">{description}</span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="mt-1.5 size-5 shrink-0 text-ink-faint transition-transform duration-150 group-hover:translate-x-1 group-hover:text-accent"
      />
    </>
  )
}
