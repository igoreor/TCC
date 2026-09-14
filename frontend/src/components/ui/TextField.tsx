import type { InputHTMLAttributes } from 'react'
import styles from './Field.module.css'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function TextField({ label, id, className, ...props }: TextFieldProps) {
  const inputId = id ?? `field-${label}`
  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.label}>{label}</span>
      <input id={inputId} className={[styles.control, className].filter(Boolean).join(' ')} {...props} />
    </label>
  )
}
