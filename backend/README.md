# Backend RAG para Apoio à Decisão Clínica em Hanseníase

Backend em Node.js, TypeScript, Express, PostgreSQL, Prisma e pgvector para um sistema RAG voltado ao apoio informacional em hanseníase.

O sistema recupera chunks técnicos previamente processados, aplica busca híbrida, reranking, regras de segurança clínica, geração baseada apenas em fontes recuperadas e logs de perguntas/respostas.

## Limite clínico

Este sistema não substitui avaliação presencial, diagnóstico profissional, protocolos oficiais ou decisão de médicos, enfermeiros e equipes de saúde. Ele recusa diagnóstico definitivo, prescrição individualizada e recomenda avaliação presencial em situações de risco.

## Stack

- Node.js + TypeScript
- Express
- PostgreSQL + pgvector
- Prisma ORM
- Zod
- OpenAI API opcional
- Embeddings mockáveis sem chave da OpenAI
- Vitest
- ESLint + Prettier

## Configuração

```bash
npm install
copy .env.example .env
```

Edite `.env` se necessário:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/hanseniase_rag?schema=public
OPENAI_API_KEY=
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4o-mini
DEFAULT_TOP_K=12
DEFAULT_TOP_N=5
MIN_RETRIEVAL_SCORE=0.65
NODE_ENV=development
PORT=3333
```

Sem `OPENAI_API_KEY`, o backend usa embeddings determinísticos locais e uma resposta extrativa baseada nos chunks recuperados.

## Banco de dados

Suba o PostgreSQL com pgvector:

```bash
docker compose up -d
```

Gere o Prisma Client e aplique migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Carregue os chunks seed e perguntas de avaliação:

```bash
npm run prisma:seed
```

## Rodar a API

```bash
npm run dev
```

API local:

```text
http://localhost:3333
```

Health check:

```bash
curl http://localhost:3333/health
```

## Endpoint principal

```bash
curl -X POST http://localhost:3333/api/chat/ask ^
  -H "Content-Type: application/json" ^
  -d "{\"question\":\"Baciloscopia negativa exclui hanseníase?\",\"userType\":\"Profissional de saúde\"}"
```

A resposta inclui:

- `answer`
- `sources`
- `safety`
- `retrieval`

## Endpoints

- `GET /health`
- `POST /api/knowledge/ingest/jsonl`
- `POST /api/knowledge/seed`
- `GET /api/documents`
- `GET /api/chunks`
- `GET /api/chunks/:chunkId`
- `POST /api/retrieval/search`
- `POST /api/chat/ask`
- `POST /api/evaluation/seed`
- `GET /api/evaluation/questions`
- `POST /api/evaluation/run`
- `POST /api/feedback`

## Ingestão JSONL

O arquivo seed está em:

```text
knowledge-base/processed/hanseniase_chunks.seed.jsonl
```

Cada linha contém:

- `chunk_id`
- `document_id`
- `title`
- `section`
- `subsection`
- `content`
- `metadata`

Os metadados são validados por Zod em `src/modules/chunks/chunk-metadata.schema.ts`.

## Retrieval

A busca híbrida combina:

- busca vetorial com pgvector;
- busca textual com PostgreSQL Full Text Search;
- score final `vectorScore * 0.65 + keywordScore * 0.35`;
- reranking por criticidade, medicamento, reação, diagnóstico, exame, gestante, pediátrico e alto risco.

## Safety

`SafetyService` aplica fallback e bloqueios:

- sem chunks relevantes;
- fora do escopo;
- diagnóstico definitivo;
- prescrição individualizada;
- emergência ou sinais graves;
- gestante;
- criança;
- reação hansênica grave.

Toda resposta clínica inclui:

```text
Este sistema é um recurso de apoio informacional e não substitui avaliação presencial por profissional de saúde.
```

## Avaliação

O dataset inicial tem 25 perguntas em:

```text
knowledge-base/processed/qa_dataset.json
```

Rodar avaliação:

```bash
curl -X POST http://localhost:3333/api/evaluation/run
```

Métricas iniciais:

- total de perguntas;
- aproximação de recall por chunk ideal;
- quantidade de fallbacks;
- chunks retornados por pergunta.

## Testes e validação

```bash
npm run lint
npm run build
npm test
```

Os testes cobrem validação de metadados, ingestão JSONL, intenção, risco clínico, fallback, bloqueio de prescrição, retrieval, fontes e regras críticas sobre baciloscopia, PQT, talidomida e gestação.

## Observação sobre uso real

A base seed é mínima e serve para desenvolvimento. Antes de qualquer uso em ambiente real, substitua ou complemente os chunks por documentos oficiais e científicos revisados, com páginas, referências, data de revisão e validação por especialista.
