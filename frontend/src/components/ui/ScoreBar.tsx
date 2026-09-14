import styles from './ScoreBar.module.css'

interface ScoreBarProps {
  label: string
  value: number | undefined
}

export function ScoreBar({ label, value }: ScoreBarProps) {
  const clamped = Math.max(0, Math.min(1, value ?? 0))
  const percent = Math.round(clamped * 100)

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
