import type { TextareaHTMLAttributes } from 'react'
import styles from './Field.module.css'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function TextArea({ label, id, className, ...props }: TextAreaProps) {
  const areaId = id ?? (label ? `field-${label}` : undefined)
  const control = (
    <textarea
      id={areaId}
      className={[styles.control, styles.textarea, className].filter(Boolean).join(' ')}
      {...props}
    />
  )

  if (!label) return control

  return (
    <label className={styles.field} htmlFor={areaId}>
      <span className={styles.label}>{label}</span>
      {control}
    </label>
  )
}
