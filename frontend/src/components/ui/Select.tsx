import type { SelectHTMLAttributes } from 'react'
import styles from './Field.module.css'

interface Option {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: Option[]
  placeholder?: string
}

export function Select({ label, options, placeholder, id, className, ...props }: SelectProps) {
  const selectId = id ?? `select-${label}`
  return (
    <label className={styles.field} htmlFor={selectId}>
      <span className={styles.label}>{label}</span>
      <select id={selectId} className={[styles.control, className].filter(Boolean).join(' ')} {...props}>
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
