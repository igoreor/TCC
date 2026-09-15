import { Link } from 'react-router-dom'
import type { EvaluationRunResult } from '../../api/types'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { fallbackTone, riskTone } from '../../lib/severity'
import styles from './Evaluation.module.css'

interface EvaluationResultsTableProps {
  result: EvaluationRunResult
}

function truncate(text: string, max = 80): string {
  return text.length > max ? `${text.slice(0, max)}...` : text
}

export function EvaluationResultsTable({ result }: EvaluationResultsTableProps) {
  return (
    <Card>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Pergunta</th>
            <th>Chunk ideal?</th>
            <th>Risco</th>
            <th>Fallback</th>
            <th>Chunks retornados</th>
          </tr>
        </thead>
        <tbody>
          {result.results.map((item) => (
            <tr key={item.question}>
              <td>{truncate(item.question)}</td>
              <td>
                <Badge tone={item.matchedIdealChunk ? 'success' : 'danger'}>
                  {item.matchedIdealChunk ? 'Sim' : 'Não'}
                </Badge>
              </td>
              <td>
                <Badge tone={riskTone(item.riskLevel)}>{item.riskLevel}</Badge>
              </td>
              <td>
                <Badge tone={fallbackTone(item.fallbackTriggered)}>{item.fallbackTriggered ? 'Sim' : 'Não'}</Badge>
              </td>
              <td className={styles.chunkLinks}>
                {item.returnedChunks.map((chunkId, index) => (
                  <span key={chunkId}>
                    {index > 0 ? ', ' : ''}
                    <Link to={`/dashboard/base/chunks/${encodeURIComponent(chunkId)}`}>{chunkId}</Link>
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
