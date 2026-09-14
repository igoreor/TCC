import { useState } from 'react'
import type { SearchFilters } from '../../api/types'
import { ChunkFiltersBar } from './ChunkFiltersBar'
import { ChunkTable } from './ChunkTable'
import { DocumentsList } from './DocumentsList'
import { SeedKnowledgeButton } from './SeedKnowledgeButton'
import styles from './Knowledge.module.css'

export function KnowledgeBrowserPage() {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  function handleFiltersChange(next: SearchFilters) {
    setFilters(next)
    setPage(1)
  }

  function handleSelectDocument(documentId: string) {
    setFilters((current) => ({ ...current, documentId }))
    setPage(1)
  }

  function handlePageSizeChange(next: number) {
    setPageSize(next)
    setPage(1)
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h2>Base de conhecimento</h2>
        <SeedKnowledgeButton />
      </div>

      <section className={styles.section}>
        <h3>Documentos</h3>
        <DocumentsList onSelectDocument={handleSelectDocument} selectedDocumentId={filters.documentId} />
      </section>

      <section className={styles.section}>
        <h3>Chunks</h3>
        <ChunkFiltersBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
        <ChunkTable filters={filters} page={page} pageSize={pageSize} onPageChange={setPage} />
      </section>
    </div>
  )
}
