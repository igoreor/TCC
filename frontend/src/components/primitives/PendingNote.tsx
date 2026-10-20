import { cx } from '../../lib/cx'
import { metaLabel } from './classes'

interface PendingNoteProps {
  label: string
  detail?: string
}

/** Estado de espera de uma única requisição: não simula etapas que o cliente não acompanha. */
export function PendingNote({ label, detail }: PendingNoteProps) {
  return (
    <div role="status" className="py-1">
      <p className={cx(metaLabel, 'text-ink-faint')}>{label}</p>
      <div aria-hidden="true" className="relative mt-3 h-0.5 w-full max-w-56 overflow-hidden bg-rule">
        <span className="absolute inset-y-0 left-0 w-2/5 bg-accent motion-safe:animate-progress motion-reduce:w-full motion-reduce:bg-rule-strong" />
      </div>
      {detail ? <p className="mt-3 text-small text-ink-faint">{detail}</p> : null}
    </div>
  )
}
