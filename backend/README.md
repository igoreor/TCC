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
DEFAULT_TOP_K=20
DEFAULT_TOP_N=8
# MIN_VECTOR_SIMILARITY=
NODE_ENV=development
PORT=3333
AUTH_SESSION_TTL_HOURS=8
CORS_ORIGIN=
```

Sem `OPENAI_API_KEY`, o backend usa embeddings determinísticos locais, análise heurística da pergunta e uma resposta extrativa com as frases dos trechos recuperados.

`DEFAULT_TOP_K` é o número de candidatos por lista de busca e `DEFAULT_TOP_N`, o de trechos enviados ao modelo. `MIN_VECTOR_SIMILARITY` é a similaridade de cosseno mínima do melhor trecho para considerar que há evidência; vazio usa o padrão do provedor (0,25 com a OpenAI e 0,08 com os embeddings determinísticos). `MIN_RETRIEVAL_SCORE`, da versão anterior, é ignorado.

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

`prisma:deploy` aplica as migrations existentes sem gerar novas. Use `prisma:migrate` apenas ao criar uma migration nova e revise o SQL gerado: o Prisma propõe remover os índices manuais `chunks_embedding_hnsw_idx`, `chunks_metadata_gin_idx` e os de busca textual, que não devem ser removidos.

Carregue a base documental oficial e o conjunto de referência da avaliação:

```bash
npm run prisma:seed
```

O seed indexa os trechos de `knowledge-base/processed` com o provedor de embeddings configurado. Veja a seção "Base documental".

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

A conversa (`sessionId`) fica vinculada ao usuário autenticado. Um `sessionId` de outra pessoa não é reaproveitado. Enviar o mesmo `sessionId` nas perguntas seguintes permite continuações como "E para crianças?".

A resposta inclui:

- `answer`: texto em Markdown, com citações `[n]` que apontam para `sources`;
- `sources`: só as fontes citadas, cada uma com `reference` (instituição, documento, ano, seção e página), `document` (metadados do manifesto), `page_label` (páginas impressas), `url` (PDF oficial aberto na página do trecho), `excerpt` (o trecho) e `verified` (se a verificação automática confirmou que o trecho sustenta a frase que o cita);
- `safety`: risco clínico, recusa e motivo;
- `retrieval`: intenção, pergunta interpretada, consultas usadas e trechos enviados ao modelo, com documento e páginas.

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

## Base documental

A base reúne documentos oficiais, descritos em `knowledge-base/manifest.json` com os metadados exibidos nas fontes (título, instituição, ano, edição, ISBN, idioma, âmbito, endereço oficial e SHA-256 do arquivo processado):

- Protocolo Clínico e Diretrizes Terapêuticas da Hanseníase (Ministério da Saúde, 2022);
- Estratégia Nacional para Enfrentamento à Hanseníase 2024-2030 (Ministério da Saúde, 2024);
- Diretrizes para o diagnóstico, tratamento e prevenção da hanseníase (OMS; tradução de 2019 da edição de 2018);
- Leprosy/Hansen disease: management of reactions and prevention of disabilities (OMS, 2020, em inglês);
- Rumo à zero hanseníase: Estratégia Global de Hanseníase 2021–2030 (OMS, 2021).

Fluxo de processamento (detalhes em `knowledge-base/README.md`):

```bash
npm run kb:build    # baixa os PDFs que faltarem, confere o SHA-256 e gera knowledge-base/processed/*.jsonl
npm run kb:ingest   # indexa os trechos no banco (DATABASE_URL), com o provedor de embeddings configurado
```

`kb:build` precisa do `pdftotext` (Poppler; no Windows, vem com o Git for Windows). Os trechos processados ficam versionados, então `kb:ingest` e o seed não dependem dele. A reindexação só gera embedding para trechos novos, alterados ou indexados com outro modelo, e remove os que deixaram de existir; cada execução fica registrada em `ingestion_runs`.

O banco de produção deve ser indexado com o mesmo provedor da API: a busca compara só vetores do mesmo modelo (`chunks.embedding_model`).

A base inicial de 15 trechos (`knowledge-base/processed/hanseniase_chunks.seed.jsonl`), redigida para desenvolvimento, continua no banco com `status = desenvolvimento` e `active = false`: não é consultada. A rota `POST /api/knowledge/ingest/jsonl` ainda aceita trechos nesse formato.

## Recuperação

1. **Leitura da pergunta** (`query-analyzer.service.ts`): a pergunta é lida no contexto da hanseníase, mesmo sem citar a doença; só sai do escopo quando trata explicitamente de outro assunto. Continuações ("E para crianças?") são completadas com as mensagens anteriores da conversa. Com o modelo, gera também reformulações e uma consulta em inglês; sem ele, usa regras e um glossário de siglas e sinônimos.
2. **Busca híbrida** (`hybrid-search.service.ts`): uma lista vetorial por consulta (pgvector, índice HNSW) e uma lista textual sobre o texto sem acentos, com os termos unidos por OU. As listas são combinadas por fusão por posição recíproca (RRF), e não pela soma de pontuações de escalas diferentes.
3. **Evidência** (`retrieval.service.ts`): se nenhum trecho alcança a similaridade mínima nem a correspondência textual mínima, uma segunda busca, mais ampla, é feita antes de concluir que os documentos não tratam do assunto.
4. **Geração** (`chat.service.ts` e `prompt-builder.service.ts`): o modelo recebe os trechos com documento, âmbito (diretriz brasileira ou OMS), seção e página, e o histórico da conversa. As citações [n] são validadas, renumeradas e conferidas automaticamente contra o trecho citado.

## Regras de segurança

Por palavra inteira e sem acentos (`safety.service.ts`). Recusam:

- pergunta sobre outro assunto;
- diagnóstico de um caso específico ("tenho hanseníase?");
- prescrição para um paciente específico, inclusive dose calculada por peso;
- no perfil paciente, qualquer pergunta sobre dose ou mudança de tratamento, e sinais de urgência relatados como situação atual;
- ausência de evidência nos documentos.

Perguntas informativas sobre gestação, crianças, reações e doses padronizadas são respondidas com base nos documentos, com risco clínico elevado e destaque para a avaliação presencial.

Toda resposta clínica inclui:

```text
Este sistema é um recurso de apoio informacional e não substitui avaliação presencial por profissional de saúde.
```

## Avaliação

O conjunto de referência (`knowledge-base/evaluation/golden-questions.json`) tem 32 perguntas: as predefinidas da interface, diretas, que combinam trechos, com sinônimos, de continuação, difíceis de recuperar, sem resposta na base, com divergência entre o Ministério da Saúde e a OMS, de segurança e de regressão. Cada uma indica o documento e as páginas da evidência e os fatos-chave esperados.

```bash
npm run eval:rag -- --label minha-execucao
```

O comando lê o banco configurado sem gravar nada e salva o relatório em `knowledge-base/evaluation/results`. Métricas: comportamento esperado (responder, recusar ou informar a lacuna), Recall@5 e Recall@8 da evidência, precisão das citações, citações confirmadas automaticamente e cobertura de fatos-chave. São indicadores aproximados para comparar versões, não prova de qualidade clínica. A rota `POST /api/evaluation/run` executa o mesmo conjunto pelo painel.

## Testes e validação

```bash
npm run lint
npm run build
npm test
```

Os testes cobrem validação de metadados, ingestão, processamento dos PDFs (limpeza, páginas, sumário e fragmentação), análise da pergunta, fusão RRF, regras de segurança (inclusive os falsos positivos antigos por subcadeias), citações, prompt, geração com modelo simulado e a pontuação da avaliação. Também cobrem login, sessão, logout, limite de tentativas, proteção das rotas e registro do feedback, inclusive pela API HTTP.

Os testes em `tests/integration` rodam contra um PostgreSQL real com as migrations aplicadas e só são executados com `TEST_DATABASE_URL` definida. Use um banco descartável, porque os testes gravam e apagam registros:

```bash
set TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/hanseniase_rag_teste?schema=public
npm test
```

Com um banco que aceita uma conexão por vez (como o PGlite), rode os testes de integração em sequência: `npx vitest run tests/integration --no-file-parallelism`.

## Observação sobre uso real

Os documentos são oficiais, mas o processamento é automático: tabelas e fluxogramas podem perder a formatação, e a verificação das citações é aproximada. O sistema não foi validado clinicamente; antes de uso assistencial, a base e as respostas precisam de revisão por especialistas. Diagnóstico e decisões da refatoração: `docs/rag-diagnostico-e-refatoracao.md`.
