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
AUTH_SESSION_TTL_HOURS=8
CORS_ORIGIN=
```

Sem `OPENAI_API_KEY`, o backend usa embeddings determinísticos locais e uma resposta extrativa baseada nos chunks recuperados.

`AUTH_SESSION_TTL_HOURS` define a duração da sessão de login. Em produção o cookie de sessão só trafega por HTTPS (`AUTH_COOKIE_SECURE`, ligado por padrão quando `NODE_ENV=production`). `CORS_ORIGIN` só é necessário se o frontend for servido de outra origem, sem o proxy do Vite.

## Banco de dados

Suba o PostgreSQL com pgvector:

```bash
docker compose up -d
```

Gere o Prisma Client e aplique as migrations versionadas:

```bash
npm run prisma:generate
npm run prisma:deploy
```

`prisma:deploy` aplica as migrations existentes sem gerar novas. Use `prisma:migrate` apenas ao criar uma migration nova e revise o SQL gerado: o Prisma propõe remover os índices manuais `chunks_embedding_cosine_idx` e `chunks_metadata_gin_idx`, que não devem ser removidos.

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

## Autenticação e usuários

Todas as rotas em `/api` exigem login, exceto `/api/auth/*`. O login (`POST /api/auth/login`) cria uma sessão no banco e devolve o token em um cookie `HttpOnly` e `SameSite=Lax`. O banco guarda apenas o hash SHA-256 do token. O logout (`POST /api/auth/logout`) apaga a sessão. Tentativas seguidas com senha errada são limitadas por IP e usuário.

Não há cadastro pela interface: os usuários são criados diretamente no banco. As senhas são guardadas com hash scrypt, e o banco recusa qualquer valor que não comece com `scrypt$`.

1. Gere o hash; a senha é pedida sem aparecer no terminal (use PowerShell ou CMD no Windows):

   ```bash
   npm run auth:hash-password -- --username maria.silva
   ```

2. Abra o psql e cole o `INSERT` impresso pelo script. Não o coloque entre aspas duplas no shell, porque o `$` do hash seria interpretado:

   ```bash
   docker exec -it hanseniase-rag-postgres psql -U postgres -d hanseniase_rag
   ```

   ```sql
   INSERT INTO users (username, password_hash) VALUES ('maria.silva', 'scrypt$N=32768,r=8,p=3$...');
   ```

O usuário deve ter de 3 a 64 caracteres entre letras minúsculas, números, `.`, `_` e `-`.

Para desativar um acesso, use `UPDATE users SET active = false WHERE username = 'maria.silva';`; as sessões abertas deixam de valer imediatamente. Para trocar a senha, gere um novo hash e use `UPDATE users SET password_hash = '...' WHERE username = 'maria.silva';`.

## Endpoint principal

```bash
curl -c cookies.txt -X POST http://localhost:3333/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"maria.silva\",\"password\":\"SUA_SENHA\"}"

curl -b cookies.txt -X POST http://localhost:3333/api/chat/ask ^
  -H "Content-Type: application/json" ^
  -d "{\"question\":\"Baciloscopia negativa exclui hanseníase?\",\"userType\":\"Profissional de saúde\"}"
```

A conversa (`sessionId`) fica vinculada ao usuário autenticado. Um `sessionId` de outra pessoa não é reaproveitado.

A resposta inclui:

- `answer`
- `sources`
- `safety`
- `retrieval`

## Endpoints

- `GET /health`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
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

## Avaliação das respostas (feedback)

`POST /api/feedback` registra a avaliação de uma resposta da IA para a pesquisa:

```json
{ "messageId": "<id da resposta devolvido por /api/chat/ask>", "rating": 8, "comment": "opcional" }
```

- A nota é um inteiro de 0 a 10, validado na API e por uma restrição `CHECK` no banco. O comentário é opcional, com até 1000 caracteres.
- O usuário vem da sessão, e a conversa vem da própria resposta: nenhum dos dois é aceito do cliente.
- Só a dona da conversa avalia as respostas dela; de outra conversa, a API responde `404`.
- Cada pessoa avalia cada resposta uma única vez. Uma segunda avaliação recebe `409`, garantido pela chave única `(message_id, user_id)`.
- A tabela `feedback` guarda `user_id`, `session_id`, `message_id`, `rating`, `comment` e `created_at`. A chave estrangeira composta `(message_id, session_id)` impede registrar a conversa errada. Conversas e respostas avaliadas não são apagadas em cascata.

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

Rodar avaliação (com o cookie obtido no login):

```bash
curl -b cookies.txt -X POST http://localhost:3333/api/evaluation/run
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

Os testes cobrem validação de metadados, ingestão JSONL, intenção, risco clínico, fallback, bloqueio de prescrição, retrieval, fontes e regras críticas sobre baciloscopia, PQT, talidomida e gestação. Também cobrem login, sessão, logout, limite de tentativas, proteção das rotas e registro do feedback, inclusive pela API HTTP.

Os testes em `tests/integration` rodam contra um PostgreSQL real com as migrations aplicadas e só são executados com `TEST_DATABASE_URL` definida. Use um banco descartável, porque os testes gravam e apagam registros:

```bash
set TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/hanseniase_rag_teste?schema=public
npm test
```

## Observação sobre uso real

A base seed é mínima e serve para desenvolvimento. Antes de qualquer uso em ambiente real, substitua ou complemente os chunks por documentos oficiais e científicos revisados, com páginas, referências, data de revisão e validação por especialista.
