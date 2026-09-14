import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { useDocuments } from '../../hooks/useDocuments'
import { formatDateTime } from '../../lib/formatters'
import styles from './Knowledge.module.css'

interface DocumentsListProps {
  onSelectDocument: (documentId: string) => void
  selectedDocumentId?: string
}

export function DocumentsList({ onSelectDocument, selectedDocumentId }: DocumentsListProps) {
  const { data, isLoading, isError, error } = useDocuments()

  if (isLoading) return <Spinner label="Carregando documentos..." />
  if (isError) return <ErrorState error={error} />

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="Nenhum documento na base"
        description='Use o botão "Popular base (seed)" acima para carregar os 15 chunks iniciais sobre hanseníase.'
      />
    )
  }

  return (
    <Card>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Documento</th>
            <th>Título</th>
            <th>Fonte</th>
            <th>Versão</th>
            <th>Chunks</th>
            <th>Atualizado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((doc) => (
            <tr
              key={doc.id}
              className={doc.documentId === selectedDocumentId ? styles.rowSelected : styles.row}
              onClick={() => onSelectDocument(doc.documentId)}
            >
              <td>
                <code>{doc.documentId}</code>
              </td>
              <td>{doc.title}</td>
              <td>{doc.sourceName ?? '—'}</td>
              <td>{doc.version ?? '—'}</td>
              <td>{doc._count.chunks}</td>
              <td>{formatDateTime(doc.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
