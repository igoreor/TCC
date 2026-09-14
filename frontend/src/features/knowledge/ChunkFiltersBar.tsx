import type { SearchFilters } from '../../api/types'
import { ClinicalFiltersForm } from '../../components/filters/ClinicalFiltersForm'
import { Select } from '../../components/ui/Select'
import styles from './Knowledge.module.css'

interface ChunkFiltersBarProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  pageSize: number
  onPageSizeChange: (pageSize: number) => void
}

const pageSizeOptions = [
  { value: '20', label: '20 por página' },
  { value: '50', label: '50 por página' },
  { value: '100', label: '100 por página' },
]

export function ChunkFiltersBar({ filters, onFiltersChange, pageSize, onPageSizeChange }: ChunkFiltersBarProps) {
  return (
    <div className={styles.filtersBar}>
      <ClinicalFiltersForm value={filters} onChange={onFiltersChange} />
      <Select
        label="Tamanho da página"
        options={pageSizeOptions}
        value={String(pageSize)}
        onChange={(event) => onPageSizeChange(Number(event.target.value))}
      />
    </div>
  )
}
