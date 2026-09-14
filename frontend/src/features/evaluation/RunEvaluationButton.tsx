import { Button } from '../../components/ui/Button'
import styles from './Evaluation.module.css'

interface RunEvaluationButtonProps {
  onRun: () => void
  isRunning: boolean
}

export function RunEvaluationButton({ onRun, isRunning }: RunEvaluationButtonProps) {
  return (
    <div className={styles.actionBox}>
      <Button onClick={onRun} disabled={isRunning}>
        {isRunning ? 'Executando avaliação...' : 'Rodar avaliação'}
      </Button>
      {isRunning ? (
        <span className={styles.runningHint}>
          Isso pode levar alguns minutos — as 25 perguntas são processadas sequencialmente.
        </span>
      ) : null}
    </div>
  )
}
