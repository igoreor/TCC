import type { ReactNode } from 'react'
import type { StudySource } from '../../api/study'
import styles from './Study.module.css'

// O harness pede citações no formato [chunk:<id>], às vezes várias no mesmo colchete.
const INLINE = /(\*\*[^*\n]+\*\*|\[chunk:[^\]]+\])/g

interface AnswerBodyProps {
  text: string
  sources: StudySource[]
}

/**
 * Resposta com negrito e citações numeradas pela posição do trecho na lista de recuperados.
 * Citação de trecho que não foi recuperado aparece destacada: o modelo citou o que não recebeu.
 */
export function AnswerBody({ text, sources }: AnswerBodyProps) {
  const position = new Map(sources.map((source, index) => [source.chunk_id, index + 1]))
  const parts: ReactNode[] = []

  text.split(INLINE).forEach((part, index) => {
    if (!part) return
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      parts.push(<strong key={index}>{part.slice(2, -2)}</strong>)
      return
    }
    if (part.startsWith('[chunk:')) {
      const ids = part
        .slice(1, -1)
        .split(/[;,]\s*/)
        .map((id) => id.trim().replace(/^chunk:/, ''))
        .filter(Boolean)
      parts.push(
        <span key={index} className={styles.citations}>
          {ids.map((id) => {
            const rank = position.get(id)
            return rank ? (
              <span key={id} className={styles.citation} title={id}>
                [{rank}]
              </span>
            ) : (
              <span key={id} className={styles.citationMissing} title={`${id}: não está entre os trechos recuperados`}>
                [fora do contexto]
              </span>
            )
          })}
        </span>,
      )
      return
    }
    parts.push(part)
  })

  return <div className={styles.answer}>{parts}</div>
}
