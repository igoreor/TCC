export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 }).format(value)
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

export function formatScore(value: number | undefined): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(value ?? 0)
}
