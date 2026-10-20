import type { Ref } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/primitives/Button'
import { buttonClasses, metaLabel } from '../../../components/primitives/classes'
import { cx } from '../../../lib/cx'
import { heroContent } from '../content'
import { ConsultationFigure } from './ConsultationFigure'

interface HeroSectionProps {
  onOpenConsultation: (question?: string) => void
  ctaRef: Ref<HTMLButtonElement>
}

export function HeroSection({ onOpenConsultation, ctaRef }: HeroSectionProps) {
  const { title } = heroContent

  return (
    <section aria-labelledby="hero-titulo" className="border-b border-rule">
      <div className="mx-auto max-w-site px-4 pb-16 pt-28 sm:px-6 md:pt-32 lg:px-8 lg:pb-24">
        <p className={cx(metaLabel, 'text-accent')}>{heroContent.eyebrow}</p>
        <h1 id="hero-titulo" className="mt-5 max-w-[15em] font-serif text-display font-medium text-balance text-ink">
          {title.lead}
          <em className="font-normal">{title.emphasis}</em>
          {title.end}
        </h1>

        <div className="mt-12 grid gap-x-10 gap-y-14 border-t border-rule pt-10 lg:mt-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-lede text-pretty text-ink-soft">{heroContent.lede}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button ref={ctaRef} onClick={() => onOpenConsultation()}>
                {heroContent.primaryCta}
              </Button>
              <Link to={{ hash: '#como-funciona' }} className={buttonClasses({ variant: 'secondary' })}>
                {heroContent.secondaryCta}
              </Link>
            </div>
            <dl className="mt-12">
              {heroContent.facts.map((fact) => (
                <div
                  key={fact.term}
                  className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4 border-b border-rule py-3 first:border-t"
                >
                  <dt className={cx(metaLabel, 'pt-0.5 text-ink-faint')}>{fact.term}</dt>
                  <dd className="text-small text-ink-soft">{fact.detail}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-8">
            <ConsultationFigure onAsk={onOpenConsultation} />
          </div>
        </div>
      </div>
    </section>
  )
}
