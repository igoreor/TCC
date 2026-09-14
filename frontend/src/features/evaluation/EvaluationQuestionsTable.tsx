import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { useEvaluationQuestions } from '../../hooks/useEvaluationQuestions'
import { riskTone } from '../../lib/severity'
import styles from './Evaluation.module.css'

function truncate(text: string, max = 90): string {
  return text.length > max ? `${text.slice(0, max)}...` : text
}

export function EvaluationQuestionsTable() {
  const { data, isLoading, isError, error } = useEvaluationQuestions()

  if (isLoading) return <Spinner label="Carregando perguntas..." />
  if (isError) return <ErrorState error={error} />
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="Nenhuma pergunta de avaliação"
        description='Use "Popular perguntas (seed)" acima para carregar as 25 perguntas padrão.'
      />
    )
  }

  return (
    <Card>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Pergunta</th>
            <th>Resposta esperada</th>
            <th>Risco</th>
            <th>Chunks ideais</th>
          </tr>
        </thead>
        <tbody>
          {data.map((question) => (
            <tr key={question.id}>
              <td>{truncate(question.question)}</td>
              <td>{truncate(question.expectedAnswer)}</td>
              <td>
                <Badge tone={riskTone(question.riskLevel)}>{question.riskLevel}</Badge>
              </td>
              <td>{question.idealChunks.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
