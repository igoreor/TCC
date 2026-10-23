-- Base documental oficial: metadados bibliográficos, localização dos trechos (páginas e seções),
-- modelo de embedding por trecho, histórico de ingestão, busca textual sem acentos e índice HNSW.
-- Tudo é aditivo: o código anterior continua funcionando com o banco migrado.

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "authorship" TEXT,
ADD COLUMN     "document_type" TEXT,
ADD COLUMN     "download_url" TEXT,
ADD COLUMN     "edition" TEXT,
ADD COLUMN     "file_sha256" TEXT,
ADD COLUMN     "ingested_at" TIMESTAMP(3),
ADD COLUMN     "institution" TEXT,
ADD COLUMN     "isbn" TEXT,
ADD COLUMN     "jurisdiction" TEXT,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "license" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "official_url" TEXT,
ADD COLUMN     "page_count" INTEGER,
ADD COLUMN     "publication_year" INTEGER,
ADD COLUMN     "short_title" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'vigente';

ALTER TABLE "documents"
  ADD CONSTRAINT "documents_status_check" CHECK ("status" IN ('vigente', 'substituido', 'desenvolvimento'));

-- AlterTable
ALTER TABLE "chunks" ADD COLUMN     "chunk_index" INTEGER,
ADD COLUMN     "content_hash" TEXT,
ADD COLUMN     "embedding_model" TEXT,
ADD COLUMN     "page_end" INTEGER,
ADD COLUMN     "page_label_end" TEXT,
ADD COLUMN     "page_label_start" TEXT,
ADD COLUMN     "page_start" INTEGER,
ADD COLUMN     "search_text" TEXT,
ADD COLUMN     "section_path" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "ingestion_runs" (
    "id" UUID NOT NULL,
    "document_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "embedding_model" TEXT NOT NULL,
    "file_sha256" TEXT,
    "chunks_total" INTEGER NOT NULL DEFAULT 0,
    "chunks_embedded" INTEGER NOT NULL DEFAULT 0,
    "chunks_unchanged" INTEGER NOT NULL DEFAULT 0,
    "chunks_removed" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "ingestion_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ingestion_runs_document_id_idx" ON "ingestion_runs"("document_id");

-- CreateIndex
CREATE INDEX "chunks_document_id_chunk_index_idx" ON "chunks"("document_id", "chunk_index");

-- CreateIndex
CREATE INDEX "chunks_embedding_model_idx" ON "chunks"("embedding_model");

-- AddForeignKey
ALTER TABLE "ingestion_runs" ADD CONSTRAINT "ingestion_runs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Índices que o schema.prisma não representa (como os da migração 20260914181129): recriar se um
-- `prisma migrate dev` futuro os remover.

-- Busca textual sobre o texto sem acentos ("hanseniase" passa a encontrar "hanseníase").
CREATE INDEX IF NOT EXISTS chunks_search_text_fts_idx
ON chunks USING GIN (to_tsvector('portuguese', coalesce(search_text, '')));

-- IVFFlat com 100 listas e uma sonda consulta só ~1% do índice: com poucos milhares de trechos,
-- perde vizinhos relevantes. O HNSW mantém revocação alta sem calibrar listas e sondas.
DROP INDEX IF EXISTS chunks_embedding_cosine_idx;
CREATE INDEX IF NOT EXISTS chunks_embedding_hnsw_idx ON chunks USING hnsw (embedding vector_cosine_ops);

-- A base inicial de desenvolvimento (15 trechos redigidos para testes) deixa de ser consultada:
-- não é documento oficial. Os registros ficam no banco, marcados, para o histórico das respostas.
UPDATE "documents"
SET "status" = 'desenvolvimento',
    "active" = false,
    "notes" = 'Base inicial redigida para desenvolvimento e testes; não é documento oficial e não é consultada.'
WHERE "document_id" IN (
  SELECT DISTINCT "document_id" FROM "chunks"
  WHERE "source_reference" = 'Seed técnico local para desenvolvimento e validação inicial'
);
