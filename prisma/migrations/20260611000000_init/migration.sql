CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  source_type TEXT,
  source_name TEXT,
  version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id TEXT NOT NULL UNIQUE,
  document_id TEXT NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  section TEXT NOT NULL,
  subsection TEXT,
  content TEXT NOT NULL,
  source_page INTEGER,
  source_reference TEXT,
  clinical_phase TEXT NOT NULL,
  information_type TEXT NOT NULL,
  target_user TEXT NOT NULL,
  target_demographic TEXT NOT NULL,
  clinical_criticality TEXT NOT NULL,
  disease_classification TEXT NOT NULL,
  medication_related BOOLEAN NOT NULL DEFAULT false,
  dosage_related BOOLEAN NOT NULL DEFAULT false,
  contraindication_related BOOLEAN NOT NULL DEFAULT false,
  exam_related BOOLEAN NOT NULL DEFAULT false,
  diagnosis_related BOOLEAN NOT NULL DEFAULT false,
  reaction_related BOOLEAN NOT NULL DEFAULT false,
  safety_level TEXT NOT NULL,
  answer_policy TEXT NOT NULL,
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  entities JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX chunks_document_id_idx ON chunks(document_id);
CREATE INDEX chunks_clinical_phase_idx ON chunks(clinical_phase);
CREATE INDEX chunks_information_type_idx ON chunks(information_type);
CREATE INDEX chunks_clinical_criticality_idx ON chunks(clinical_criticality);
CREATE INDEX chunks_safety_level_idx ON chunks(safety_level);
CREATE INDEX chunks_metadata_gin_idx ON chunks USING GIN(metadata);
CREATE INDEX chunks_fts_idx ON chunks USING GIN (
  to_tsvector(
    'portuguese',
    coalesce(title, '') || ' ' ||
    coalesce(section, '') || ' ' ||
    coalesce(subsection, '') || ' ' ||
    coalesce(content, '') || ' ' ||
    coalesce(keywords::text, '') || ' ' ||
    coalesce(entities::text, '')
  )
);
CREATE INDEX chunks_embedding_cosine_idx ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT,
  version TEXT,
  last_reviewed TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX chat_messages_session_id_idx ON chat_messages(session_id);

CREATE TABLE retrieval_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  retrieved_chunks JSONB NOT NULL,
  filters JSONB NOT NULL,
  scores JSONB NOT NULL,
  final_answer TEXT NOT NULL,
  fallback_triggered BOOLEAN NOT NULL DEFAULT false,
  risk_level TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX retrieval_logs_session_id_idx ON retrieval_logs(session_id);

CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  reviewed_by_specialist BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX feedback_message_id_idx ON feedback(message_id);

CREATE TABLE evaluation_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  expected_answer TEXT NOT NULL,
  ideal_chunks JSONB NOT NULL,
  risk_level TEXT NOT NULL,
  correctness_criteria TEXT NOT NULL,
  critical_errors TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
