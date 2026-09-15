interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: Array<SegmentedOption<T>>
  'aria-label': string
}

export function Segmented<T extends string>({ value, onChange, options, ...props }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" className="inline-flex rounded-lg border border-border bg-surface-2 p-1" {...props}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={[
              'rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
              active ? 'bg-accent text-accent-fg shadow-soft' : 'text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
