-- These two indexes are not representable in schema.prisma (GIN on jsonb, ivfflat on vector),
-- so `prisma migrate dev` sees them as drift and drops them on every future diff.
-- This migration restores them; re-apply the same two statements after any future
-- `prisma migrate dev` run that reports dropping them again.

CREATE INDEX IF NOT EXISTS chunks_metadata_gin_idx ON chunks USING GIN (metadata);

CREATE INDEX IF NOT EXISTS chunks_embedding_cosine_idx
ON chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
