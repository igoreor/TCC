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
        description='Use o botão "Carregar base oficial" acima, ou o comando npm run kb:ingest no backend.'
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
            <th>Instituição e ano</th>
            <th>Situação</th>
            <th>Trechos</th>
            <th>Indexado</th>
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
              <td>
                {doc.officialUrl ? (
                  <a href={doc.officialUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
                    {doc.title}
                  </a>
                ) : (
                  doc.title
                )}
                {doc.language === 'en' ? ' (inglês)' : ''}
              </td>
              <td>{[doc.institution, doc.publicationYear].filter(Boolean).join(', ') || '—'}</td>
              <td title={doc.notes ?? undefined}>{doc.active ? doc.status : `${doc.status} (fora da busca)`}</td>
              <td>{doc._count.chunks}</td>
              <td>{formatDateTime(doc.ingestedAt ?? doc.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
