import { metaLabel } from '../../components/primitives/classes'
import { cx } from '../../lib/cx'

/** Resposta do lado simulado: sem fontes, sem nota de segurança — a ausência é o que se compara. */
export function GenericAnswer({ content }: { content: string }) {
  return (
    <div>
      <p className={cx(metaLabel, 'text-ink-faint')}>Resposta simulada</p>
      <p className="mt-3 whitespace-pre-wrap text-ui text-pretty text-ink-soft">{content}</p>
      <p className="mt-4 border-t border-rule pt-3 font-mono text-meta text-ink-faint">
        sem fontes · sem regras de segurança · gerada no navegador
      </p>
    </div>
  )
}
