import { ArrowDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { textLinkClasses } from '../../../components/primitives/classes'
import { cx } from '../../../lib/cx'
import type { MethodStepId } from '../content'
import { methodContent } from '../content'
import { SectionLabel } from '../SectionLabel'

// Critérios de reordenação de backend/src/modules/retrieval/reranking.service.ts
const RERANKING_CRITERIA = [
  'criticidade clínica muito alta',
  'nível de segurança “alto risco”',
  'relação com a intenção: medicamento, reação, diagnóstico ou exame',
  'público citado na pergunta: gestante ou pediátrico',
]

// Campos gravados por createRetrievalLog em backend/src/modules/chat/chat.service.ts
const LOG_FIELDS = ['pergunta', 'trechos e pontuações', 'filtros', 'risco clínico', 'recusa acionada', 'resposta final']

export function MethodSection() {
  return (
    <section id="como-funciona" aria-labelledby="metodo-titulo" className="scroll-mt-16 border-b border-rule">
      <div className="mx-auto grid max-w-site gap-x-10 gap-y-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-28">
        <header className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionLabel index="01">{methodContent.label}</SectionLabel>
            <h2 id="metodo-titulo" className="mt-5 font-serif text-title font-medium text-balance text-ink">
              {methodContent.title}
            </h2>
            <p className="mt-5 max-w-measure text-body text-pretty text-ink-soft">{methodContent.intro}</p>
          </div>
        </header>

        <ol className="lg:col-span-8">
          {methodContent.steps.map((step, index) => (
            <li
              key={step.id}
              className="grid gap-x-6 gap-y-2 border-b border-rule py-8 first:border-t sm:grid-cols-[3.5rem_minmax(0,1fr)] lg:py-10"
            >
              <span className="font-mono text-meta tabular-nums text-accent sm:pt-2">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <h3 className="font-serif text-heading font-medium text-ink">{step.title}</h3>
                <p className="mt-3 max-w-measure text-body text-pretty text-ink-soft">{step.description}</p>
                <StepArtifact id={step.id} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/** Cada etapa mostra uma peça concreta do funcionamento, não uma ilustração. */
function StepArtifact({ id }: { id: MethodStepId }) {
  switch (id) {
    case 'leitura':
      return (
        <dl className="mt-6 grid grid-cols-[7rem_minmax(0,1fr)] gap-x-4 gap-y-2 border-l-2 border-rule-strong pl-4 font-mono text-meta">
          <dt className="text-ink-faint">pergunta</dt>
          <dd className="text-ink">Baciloscopia negativa exclui hanseníase?</dd>
          <dt className="text-ink-faint">intenção</dt>
          <dd className="text-accent">exame</dd>
          <dt className="text-ink-faint">fora do tema</dt>
          <dd className="text-ink-soft">recusa imediata, sem busca</dd>
        </dl>
      )
    case 'busca':
      return (
        <div className="mt-6 max-w-measure border-y border-rule py-5">
          <div className="flex items-baseline justify-between gap-6">
            <p className="font-serif text-heading text-ink">
              <i>s</i> = 0,65 · <i>s</i>
              <sub className="text-small">vet</sub> + 0,35 · <i>s</i>
              <sub className="text-small">txt</sub>
            </p>
            <span className="font-mono text-meta text-ink-faint">(1)</span>
          </div>
          <dl className="mt-4 grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-small text-ink-soft">
            <dt className="font-serif italic text-ink">
              s<sub>vet</sub>
            </dt>
            <dd>similaridade de cosseno entre a pergunta e o trecho, calculada no pgvector</dd>
            <dt className="font-serif italic text-ink">
              s<sub>txt</sub>
            </dt>
            <dd>relevância da busca textual (full-text search) do PostgreSQL</dd>
          </dl>
        </div>
      )
    case 'reordenacao':
      return (
        <ul className="mt-6 space-y-1.5 border-l-2 border-rule-strong pl-4 font-mono text-meta text-ink-soft">
          {RERANKING_CRITERIA.map((criterion) => (
            <li key={criterion}>
              <span className="text-accent">+</span> {criterion}
            </li>
          ))}
        </ul>
      )
    case 'seguranca':
      return (
        <Link to={{ hash: '#limites' }} className={cx(textLinkClasses, 'mt-5 text-ui')}>
          Ver as oito situações de recusa
          <ArrowDown aria-hidden="true" className="size-3.5" />
        </Link>
      )
    case 'resposta':
      return (
        <div className="mt-6 max-w-measure border-l-2 border-rule-strong pl-4">
          <p className="text-ui text-ink">
            … um resultado negativo não exclui hanseníase, sobretudo nas formas paucibacilares{' '}
            <span className="font-mono text-[0.8em] text-accent">[1]</span>
          </p>
          <p className="mt-2 font-mono text-meta text-ink-faint">
            <span className="text-accent">[1]</span> hans_exame_bacilo_001 · Exames complementares
          </p>
        </div>
      )
    case 'registro':
      return (
        <ul className="mt-6 flex flex-wrap gap-x-2 gap-y-1 font-mono text-meta text-ink-soft">
          {LOG_FIELDS.map((field, index) => (
            <li key={field} className="flex gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-ink-faint">
                  ·
                </span>
              ) : null}
              {field}
            </li>
          ))}
        </ul>
      )
  }
}
