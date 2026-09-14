import { Link } from 'react-router-dom'
import type { SearchFilters } from '../../api/types'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Pagination } from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import { useChunks } from '../../hooks/useChunks'
import { criticalityTone } from '../../lib/severity'
import styles from './Knowledge.module.css'

interface ChunkTableProps {
  filters: SearchFilters
  page: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function ChunkTable({ filters, page, pageSize, onPageChange }: ChunkTableProps) {
  const { data, isLoading, isError, error } = useChunks({ ...filters, page, pageSize })

  if (isLoading && !data) return <Spinner label="Carregando chunks..." />
  if (isError) return <ErrorState error={error} />
  if (!data || data.items.length === 0) {
    return <EmptyState title="Nenhum chunk encontrado" description="Ajuste os filtros ou popule a base." />
  }

  return (
    <Card>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Chunk ID</th>
            <th>Título</th>
            <th>Fase</th>
            <th>Criticidade</th>
            <th>Documento</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((chunk) => (
            <tr key={chunk.chunkId}>
              <td>
                <Link to={`/base/chunks/${encodeURIComponent(chunk.chunkId)}`}>{chunk.chunkId}</Link>
              </td>
              <td>{chunk.title}</td>
              <td>{chunk.clinicalPhase}</td>
              <td>
                <Badge tone={criticalityTone(chunk.clinicalCriticality)}>{chunk.clinicalCriticality}</Badge>
              </td>
              <td>
                <code>{chunk.documentId}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={onPageChange} />
    </Card>
  )
}
