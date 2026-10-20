import { cx } from '../../lib/cx'
import { metaLabel } from '../primitives/classes'

interface QuestionLineProps {
  question: string
  className?: string
}

export function QuestionLine({ question, className }: QuestionLineProps) {
  return (
    <div className={className}>
      <p className={cx(metaLabel, 'text-ink-faint')}>Pergunta</p>
      <p className="mt-1.5 font-serif text-subheading font-medium text-pretty text-ink">{question}</p>
    </div>
  )
}
