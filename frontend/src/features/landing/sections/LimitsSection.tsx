import { metaLabel } from '../../../components/primitives/classes'
import { cx } from '../../../lib/cx'
import { limitsContent } from '../content'
import { SectionLabel } from '../SectionLabel'

export function LimitsSection() {
  return (
    <section id="limites" aria-labelledby="limites-titulo" className="scroll-mt-16 bg-night text-night-text">
      <div className="mx-auto max-w-site px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid gap-x-10 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionLabel index="02" tone="night">
              {limitsContent.label}
            </SectionLabel>
            <h2 id="limites-titulo" className="mt-5 font-serif text-title font-medium text-balance">
              {limitsContent.title}
            </h2>
          </div>
          <p className="font-serif text-heading text-pretty text-night-text lg:col-span-7 lg:pt-11">
            {limitsContent.statement}
          </p>
        </div>

        <div className="mt-16 lg:mt-24">
          <div aria-hidden="true" className="hidden grid-cols-12 gap-x-10 border-b border-night-rule pb-3 lg:grid">
            <p className={cx(metaLabel, 'col-span-5 text-night-soft')}>{limitsContent.columns.situation}</p>
            <p className={cx(metaLabel, 'col-span-7 text-night-soft')}>{limitsContent.columns.response}</p>
          </div>
          <dl>
            {limitsContent.refusals.map((refusal) => (
              <div
                key={refusal.code}
                className="grid gap-x-10 gap-y-3 border-b border-night-rule py-6 first:border-t first:border-night-rule lg:grid-cols-12 lg:first:border-t-0"
              >
                <dt className="lg:col-span-5">
                  <span className="block text-body font-medium text-night-text">{refusal.situation}</span>
                  <span className="mt-1 block text-small text-night-soft">{refusal.triggers}</span>
                </dt>
                <dd className="font-serif text-body text-pretty text-night-text/90 lg:col-span-7">
                  “{refusal.message}”
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 max-w-measure text-small text-pretty text-night-soft">{limitsContent.footnote}</p>
        </div>
      </div>
    </section>
  )
}
