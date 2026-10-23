import { metaLabel } from '../../../components/primitives/classes'
import { cx } from '../../../lib/cx'
import { knowledgeBaseContent } from '../content'
import { SectionLabel } from '../SectionLabel'

export function KnowledgeBaseSection() {
  const content = knowledgeBaseContent

  return (
    <section id="base" aria-labelledby="base-titulo" className="scroll-mt-16 border-b border-rule">
      <div className="mx-auto grid max-w-site gap-x-10 gap-y-14 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-28">
        <div className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
          <SectionLabel index="03">{content.label}</SectionLabel>
          <h2 id="base-titulo" className="mt-5 font-serif text-title font-medium text-balance text-ink">
            {content.title}
          </h2>
          <p className="mt-5 text-body text-pretty text-ink-soft">{content.description}</p>
          <dl className="mt-10 grid grid-cols-3 border-y border-rule">
            {content.stats.map((stat, index) => (
              <div key={stat.term} className={cx('py-4', index > 0 && 'border-l border-rule pl-4')}>
                <dt className={cx(metaLabel, 'text-ink-faint')}>{stat.term}</dt>
                <dd className="mt-1.5 font-serif text-heading tabular-nums text-ink">{stat.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 border-l-2 border-caution pl-4 text-small text-pretty text-ink-soft">{content.caveat}</p>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <div className="flex items-baseline justify-between border-b border-ink pb-3">
            <p className={cx(metaLabel, 'text-ink')}>{content.columns.topic}</p>
            <p className={cx(metaLabel, 'text-ink-faint')}>{content.columns.count}</p>
          </div>
          <ol>
            {content.topics.map((topic, index) => (
              <li
                key={topic.title}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)_2rem] items-baseline gap-x-3 border-b border-rule py-4"
              >
                <span className="font-mono text-meta tabular-nums text-ink-faint">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="flex items-baseline gap-3">
                    <span className="font-serif text-subheading font-medium text-ink">{topic.title}</span>
                    <span aria-hidden="true" className="hidden h-0.75 flex-1 bg-leader text-rule-strong sm:block" />
                  </p>
                  <p className="mt-1 text-small text-ink-soft">{topic.detail}</p>
                </div>
                <span className="text-right font-mono text-meta tabular-nums text-ink">{topic.chunks}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
