import type { ClinicalRiskLevel } from '../../api/types'
import { cx } from '../../lib/cx'
import { metaLabel } from '../primitives/classes'

const LEVELS: ClinicalRiskLevel[] = ['Baixo', 'Médio', 'Alto', 'Muito alto']

/**
 * Escala de 4 posições em vez de um selo colorido: quase toda pergunta clínica chega como
 * "Alto" ou "Muito alto", então a cor de aviso fica reservada para esses níveis — os mesmos
 * em que o backend marca a resposta como dependente de avaliação profissional.
 */
export function RiskScale({ level }: { level: ClinicalRiskLevel }) {
  const position = LEVELS.indexOf(level) + 1
  const elevated = position >= 3

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className={cx(metaLabel, 'text-ink-faint')}>Risco clínico</span>
      {position > 0 ? (
        <span aria-hidden="true" className="flex gap-0.5">
          {LEVELS.map((item, index) => (
            <span
              key={item}
              className={cx('h-2 w-3.5', index < position ? (elevated ? 'bg-caution' : 'bg-ink-soft') : 'bg-rule')}
            />
          ))}
        </span>
      ) : null}
      <span className={cx('text-small font-medium', elevated ? 'text-caution' : 'text-ink')}>
        {level}
        {position > 0 ? <span className="sr-only"> ({position} de 4)</span> : null}
      </span>
    </div>
  )
}
