# Arquitetura e Processo do Backend RAG para Hanseníase

Este documento explica o que foi implementado no backend, como cada parte funciona e por que as principais decisões técnicas foram tomadas.

O objetivo é servir como material de entendimento do projeto, especialmente para o TCC com o tema:

> Desenvolvimento de um Sistema Baseado em Recuperação Aumentada por Geração (RAG) para Apoio à Decisão Clínica em Hanseníase.

## 1. Visão geral

Foi criado um backend em Node.js com TypeScript para apoiar perguntas sobre hanseníase usando uma arquitetura RAG.

RAG significa Retrieval-Augmented Generation, ou Recuperação Aumentada por Geração. Na prática, antes de gerar uma resposta, o sistema busca trechos relevantes em uma base de conhecimento. A resposta final só pode usar esses trechos recuperados.

Neste projeto, a base de conhecimento é composta por chunks, que são pequenos blocos de texto com metadados clínicos. Cada chunk possui:

- texto clínico ou técnico;
- identificação única;
- documento lógico de origem;
- metadados clínicos;
- palavras-chave;
- classificação de risco;
- embedding vetorial para busca semântica;
- dados de fonte para citação.

A arquitetura foi pensada para responder perguntas como:

- sinais e sintomas;
- diagnóstico clínico;
- classificação PB/MB;
- exames;
- tratamento;
- medicamentos;
- reações hansênicas;
- prevenção de incapacidades;
- contatos e BCG;
- vigilância;
- segurança do próprio sistema.

## 2. O que foi implementado

Foi implementado apenas o backend, sem frontend.

Os principais recursos criados foram:

- API HTTP com Express;
- configuração com TypeScript;
- Prisma ORM;
- PostgreSQL com pgvector;
- Docker Compose para banco;
- schema de banco com documentos, chunks, sessões, mensagens, logs, feedback e avaliação;
- ingestão de chunks em JSONL;
- seed inicial com 15 chunks sobre hanseníase;
- validação de metadados com Zod;
- embeddings mockáveis;
- suporte opcional à OpenAI API;
- busca vetorial;
- busca textual;
- busca híbrida;
- reranking;
- classificação de intenção;
- detecção de risco clínico;
- SafetyService com regras clínicas explícitas;
- endpoint de chat;
- citação obrigatória de fontes;
- logs de retrieval;
- dataset de avaliação com 25 perguntas;
- testes automatizados;
- documentação operacional.

## 3. Estrutura geral de arquivos

A estrutura principal ficou assim:

```text
src/
  config/
    env.ts
    database.ts
    openai.ts

  modules/
    knowledge/
    chunks/
    embeddings/
    retrieval/
    chat/
    safety/
    evaluation/
    feedback/

  shared/
    errors.ts
    logger.ts
    pagination.ts
    types.ts

prisma/
  schema.prisma
  migrations/
  seed.ts

knowledge-base/
  raw/
  processed/
  docs/

sources/
docs/
tests/
```

A divisão segue uma ideia modular:

- `config` cuida da configuração externa;
- `shared` guarda tipos e utilitários comuns;
- `modules` agrupa funcionalidades de domínio;
- `prisma` representa a camada de banco;
- `knowledge-base` guarda a base de conhecimento e documentação técnica;
- `tests` guarda testes automatizados.

## 4. Por que Node.js, TypeScript e Express

Como o repositório estava vazio, foi criada uma stack limpa com:

- Node.js;
- TypeScript;
- Express;
- Prisma;
- PostgreSQL;
- pgvector;
- Zod;
- Vitest.

TypeScript foi escolhido porque ajuda a manter contratos explícitos entre as camadas. Em um sistema clínico, mesmo sendo informacional, erros de campo, metadado ou estrutura de resposta podem gerar comportamento inseguro. Tipagem reduz esse risco.

Express foi escolhido por simplicidade e maturidade. Para um backend de TCC, ele permite evoluir rápido sem esconder demais o funcionamento das rotas.

## 5. Configuração

Os arquivos principais de configuração são:

```text
src/config/env.ts
src/config/database.ts
src/config/openai.ts
.env.example
```

### 5.1 `env.ts`

Carrega e valida variáveis de ambiente usando Zod.

Isso evita que o sistema rode com configuração inválida sem perceber. Por exemplo:

- porta inválida;
- score mínimo fora de 0 a 1;
- valores ausentes;
- ambiente incorreto.

As variáveis principais são:

```env
DATABASE_URL=
OPENAI_API_KEY=
EMBEDDING_MODEL=
CHAT_MODEL=
DEFAULT_TOP_K=12
DEFAULT_TOP_N=5
MIN_RETRIEVAL_SCORE=0.65
NODE_ENV=development
PORT=3333
```

### 5.2 `database.ts`

Cria o Prisma Client, que é usado pelos repositórios e serviços para acessar o banco.

### 5.3 `openai.ts`

Centraliza a configuração da OpenAI. O backend funciona mesmo sem chave da OpenAI, usando embeddings determinísticos locais e resposta extrativa.

Isso foi feito porque o projeto precisa ser testável e executável em ambiente local, inclusive em desenvolvimento ou testes, sem depender de API externa.

## 6. Banco de dados

O banco escolhido foi PostgreSQL com pgvector.

PostgreSQL guarda os dados relacionais:

- documentos;
- chunks;
- sessões;
- mensagens;
- logs;
- feedback;
- perguntas de avaliação.

pgvector guarda os embeddings dos chunks.

## 7. Models Prisma

O arquivo central é:

```text
prisma/schema.prisma
```

Foram criados os seguintes models:

### 7.1 Document

Representa um documento lógico da base.

Exemplos:

- `diagnostico_clinico`;
- `classificacao`;
- `tratamento_cura`;
- `reacoes`;
- `contatos_vigilancia`.

Um documento pode ter vários chunks.

### 7.2 Chunk

É a unidade principal do RAG.

Cada chunk possui:

- `chunkId`;
- `documentId`;
- título;
- seção;
- subseção;
- conteúdo;
- metadados clínicos;
- palavras-chave;
- entidades;
- embedding vetorial;
- política de resposta;
- dados de fonte.

O campo `embedding` usa:

```prisma
Unsupported("vector(1536)")?
```

Isso acontece porque o Prisma ainda não trata `vector` como tipo nativo comum. Então usamos Prisma para o modelo geral e SQL cru apenas onde o pgvector exige.

### 7.3 Source

Representa uma fonte bibliográfica ou técnica.

Foi deixado preparado para registrar:

- nome;
- tipo;
- URL;
- versão;
- data de revisão;
- observações.

### 7.4 ChatSession

Representa uma sessão de conversa.

Ela permite agrupar mensagens e logs por atendimento ou interação.

### 7.5 ChatMessage

Guarda mensagens do usuário e do assistente.

Isso é importante para auditoria e avaliação posterior.

### 7.6 RetrievalLog

Registra:

- pergunta;
- chunks recuperados;
- filtros usados;
- scores;
- resposta final;
- se houve fallback;
- nível de risco.

Esse model é fundamental para rastreabilidade. Em um sistema RAG clínico, não basta responder; é preciso saber de onde a resposta veio.

### 7.7 Feedback

Permite registrar avaliação do usuário ou especialista.

Pode ser usado futuramente para:

- auditoria de qualidade;
- revisão por especialista;
- melhoria da base;
- análise de respostas inseguras.

### 7.8 EvaluationQuestion

Guarda perguntas de avaliação do sistema.

Cada pergunta tem:

- resposta esperada;
- chunks ideais;
- nível de risco;
- critérios de acerto;
- erros críticos.

## 8. Migration SQL e pgvector

A migration inicial está em:

```text
prisma/migrations/20260611000000_init/migration.sql
```

Ela faz:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

Depois cria as tabelas e índices.

Também foi criado índice vetorial:

```sql
CREATE INDEX chunks_embedding_cosine_idx
ON chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

Esse índice acelera buscas por similaridade semântica usando distância de cosseno.

Também foi criado índice textual com Full Text Search:

```sql
CREATE INDEX chunks_fts_idx ON chunks USING GIN (...)
```

Assim o sistema consegue fazer busca textual além da busca vetorial.

## 9. Base de conhecimento

A base inicial fica em:

```text
knowledge-base/processed/hanseniase_chunks.seed.jsonl
```

Ela contém 15 chunks iniciais, cobrindo:

- sinais e sintomas;
- critérios cardinais;
- classificação PB/MB;
- baciloscopia;
- PQT-U;
- rifampicina;
- dapsona;
- clofazimina;
- reação tipo 1;
- reação tipo 2;
- incapacidades;
- contatos domiciliares;
- BCG;
- diagnóstico diferencial;
- segurança do sistema.

O formato JSONL significa que cada linha é um JSON independente.

Isso é útil porque:

- facilita ingestão incremental;
- permite processar arquivos grandes linha por linha;
- é comum em pipelines de dados;
- evita carregar um JSON gigante em memória;
- facilita versionamento de chunks.

## 10. Metadados clínicos

O schema de metadados está em:

```text
src/modules/chunks/chunk-metadata.schema.ts
```

Ele valida campos como:

- fase clínica;
- tipo de informação;
- público-alvo;
- população-alvo;
- criticidade;
- tipo de fonte;
- classificação da doença;
- relação com medicamento;
- relação com dose;
- relação com contraindicação;
- relação com exame;
- relação com diagnóstico;
- relação com reação;
- nível de segurança;
- política de resposta.

Essa validação é importante porque o retrieval e o safety dependem desses campos.

Exemplo:

Se uma pergunta menciona medicamento, o reranking prioriza chunks com:

```text
medication_related = true
```

Se a pergunta menciona reação hansênica, prioriza:

```text
reaction_related = true
```

Se o chunk é de alto risco, isso influencia a detecção de risco.

## 11. Ingestão de conhecimento

A ingestão está principalmente em:

```text
src/modules/knowledge/knowledge.service.ts
src/modules/knowledge/knowledge.repository.ts
```

O fluxo é:

```text
JSONL
  -> parse linha por linha
  -> validação Zod
  -> normalização para ChunkDTO
  -> upsert do Document
  -> geração de embedding
  -> upsert do Chunk com embedding
```

O endpoint é:

```http
POST /api/knowledge/ingest/jsonl
```

Ele aceita:

- caminho local do arquivo;
- conteúdo JSONL no corpo da requisição.

Há também:

```http
POST /api/knowledge/seed
```

Esse endpoint carrega o arquivo seed padrão.

## 12. Embeddings

Os embeddings ficam no módulo:

```text
src/modules/embeddings/
```

Foram criados dois provedores:

### 12.1 OpenAIEmbeddingsProvider

Usa a API da OpenAI quando `OPENAI_API_KEY` está configurada.

Ele chama:

```text
https://api.openai.com/v1/embeddings
```

### 12.2 DeterministicEmbeddingsProvider

É um provedor local e determinístico.

Ele transforma texto em vetor de 1536 dimensões usando tokens normalizados e hashing simples.

Esse mock não tem a qualidade semântica de um modelo real, mas serve para:

- desenvolvimento local;
- testes automatizados;
- seed sem custo;
- funcionamento sem chave externa.

A decisão de implementar esse fallback foi importante porque o requisito dizia que o sistema deveria funcionar mesmo sem chave OpenAI configurada.

## 13. Busca vetorial

A busca vetorial acontece em:

```text
src/modules/knowledge/knowledge.repository.ts
```

Ela:

1. gera embedding da pergunta;
2. compara com embeddings dos chunks;
3. usa operador do pgvector:

```sql
embedding <=> $1::vector
```

Esse operador calcula distância de cosseno.

Depois o sistema converte distância em score:

```text
vectorScore = 1 - cosineDistance
```

Quanto maior o score, mais parecido o chunk é com a pergunta.

## 14. Busca textual

A busca textual também acontece no repositório.

Ela usa PostgreSQL Full Text Search com:

```sql
plainto_tsquery('portuguese', pergunta)
to_tsvector('portuguese', campos_do_chunk)
```

Os campos usados incluem:

- título;
- seção;
- subseção;
- conteúdo;
- keywords;
- entities.

Além disso, há uma busca simples com `ILIKE` para capturar correspondências diretas.

Isso é importante porque busca vetorial e busca textual resolvem problemas diferentes:

- vetorial captura sentido aproximado;
- textual captura termos técnicos exatos.

Em saúde, termos exatos importam muito. Por exemplo:

- `baciloscopia`;
- `talidomida`;
- `BCG`;
- `PQT-U`;
- `neurite`.

## 15. Busca híbrida

A busca híbrida está em:

```text
src/modules/retrieval/hybrid-search.service.ts
```

Ela combina:

- resultado vetorial;
- resultado textual.

O score final é:

```text
finalScore = vectorScore * 0.65 + keywordScore * 0.35
```

Por que 65/35?

Porque a busca semântica deve ter peso maior para capturar intenção, mas a busca textual ainda precisa ter peso relevante para termos clínicos específicos.

Exemplo:

Se o usuário pergunta:

```text
Baciloscopia negativa exclui hanseníase?
```

A palavra `baciloscopia` é muito importante. Mesmo que o embedding ajude, a busca textual reforça esse chunk.

## 16. Reranking

Depois da busca híbrida, o sistema aplica reranking em:

```text
src/modules/retrieval/reranking.service.ts
```

O reranking ajusta a ordem dos chunks com base no contexto clínico.

Ele prioriza:

- chunks de criticidade muito alta em perguntas clínicas;
- chunks de medicamento quando a intenção é medicamento;
- chunks de reação quando a intenção é reação;
- chunks de diagnóstico quando a intenção é diagnóstico;
- chunks de exame quando a intenção é exame;
- chunks para gestante se a pergunta menciona gestante;
- chunks pediátricos se a pergunta menciona criança;
- chunks de alto risco em perguntas clínicas.

Isso é necessário porque o melhor chunk não é sempre apenas o mais parecido semanticamente. Em perguntas clínicas, criticidade e segurança também importam.

## 17. Classificação de intenção

A classificação está em:

```text
src/modules/retrieval/intent-classifier.service.ts
```

Ela usa regras simples por palavras-chave.

Categorias implementadas:

- `screening`;
- `diagnosis`;
- `classification`;
- `exam`;
- `treatment`;
- `medication`;
- `reaction`;
- `disability_prevention`;
- `contacts_surveillance`;
- `psychosocial`;
- `safety`;
- `out_of_scope`.

Exemplos:

```text
mancha, dormência, formigamento -> screening
diagnóstico, critérios, confirmar -> diagnosis
PB, MB, paucibacilar, multibacilar -> classification
baciloscopia, PCR, biópsia -> exam
PQT, tratamento, cura -> treatment
rifampicina, dapsona, clofazimina -> medication
reação, neurite, ENH -> reaction
BCG, contato -> contacts_surveillance
```

Essa abordagem é simples, mas adequada para a primeira versão porque é:

- previsível;
- testável;
- explicável;
- fácil de ajustar.

Em uma versão futura, essa classificação pode ser substituída ou complementada por um modelo.

## 18. Detecção de risco clínico

A detecção de risco está em:

```text
src/modules/retrieval/clinical-risk.service.ts
```

Ela classifica a pergunta como:

- `Baixo`;
- `Médio`;
- `Alto`;
- `Muito alto`.

Risco muito alto é usado para situações como:

- prescrição individual;
- dose;
- gestante;
- criança;
- talidomida;
- reação hansênica;
- neurite;
- déficit motor;
- acometimento ocular;
- recidiva;
- efeitos adversos graves;
- diagnóstico definitivo;
- iniciar, parar ou alterar medicamento.

Risco alto é usado para:

- diagnóstico;
- classificação PB/MB;
- tratamento;
- exames;
- contatos e BCG;
- prevenção de incapacidades.

Risco médio é usado para:

- explicações educativas;
- transmissão;
- estigma;
- epidemiologia.

Risco baixo é usado para:

- funcionamento técnico do sistema.

Essa camada é separada do SafetyService para manter responsabilidades claras:

- `ClinicalRiskService` classifica o risco;
- `SafetyService` decide o que bloquear ou permitir.

## 19. SafetyService

O SafetyService está em:

```text
src/modules/safety/safety.service.ts
```

Ele é uma das partes mais importantes do backend.

Ele aplica regras clínicas antes da geração final da resposta.

Bloqueios implementados:

- fora do escopo;
- gestação;
- criança;
- emergência ou sinais graves;
- neurite ou reação grave;
- diagnóstico definitivo;
- prescrição individualizada;
- ausência de chunks relevantes.

Exemplos de respostas de segurança:

```text
Não posso prescrever ou ajustar medicação individualmente.
```

```text
Não é possível confirmar diagnóstico definitivo sem exame clínico presencial.
```

```text
A base recuperada não contém informação suficiente para responder com segurança.
```

Toda resposta clínica inclui:

```text
Este sistema é um recurso de apoio informacional e não substitui avaliação presencial por profissional de saúde.
```

Essa camada existe porque um sistema RAG não deve apenas recuperar informação. Ele também precisa impedir usos perigosos.

## 20. ChatService

O chat está em:

```text
src/modules/chat/chat.service.ts
```

O endpoint principal é:

```http
POST /api/chat/ask
```

O fluxo completo é:

```text
Pergunta do usuário
  -> cria ou reutiliza sessão
  -> salva mensagem do usuário
  -> classifica intenção
  -> recupera chunks
  -> detecta risco clínico
  -> aplica reranking
  -> aplica SafetyService
  -> gera resposta
  -> salva mensagem do assistente
  -> grava RetrievalLog
  -> retorna answer, sources e safety
```

A resposta final tem formato semelhante a:

```json
{
  "answer": "string",
  "sources": [
    {
      "chunk_id": "string",
      "document_id": "string",
      "title": "string",
      "section": "string",
      "source_page": null
    }
  ],
  "safety": {
    "riskLevel": "Alto",
    "fallbackTriggered": false,
    "requiresProfessionalEvaluation": true,
    "disclaimer": "Este sistema é um recurso de apoio informacional..."
  }
}
```

## 21. Geração de resposta

A geração fica no ChatService e usa o PromptBuilder.

Arquivos:

```text
src/modules/chat/prompt-builder.service.ts
src/modules/chat/chat.service.ts
```

Se houver `OPENAI_API_KEY`, o backend chama a API de chat da OpenAI com um system prompt restritivo.

Se não houver chave, usa resposta extrativa local:

- pega os chunks recuperados;
- monta uma resposta com os conteúdos;
- cita os chunks;
- adiciona nota de segurança.

Isso garante que o backend seja utilizável sem API externa, mesmo que a qualidade linguística da resposta seja mais simples.

## 22. Prompt interno

O prompt interno foi salvo em:

```text
src/modules/chat/prompt-builder.service.ts
knowledge-base/docs/system_prompt.md
```

Ele instrui o modelo a:

- responder somente com chunks recuperados;
- citar fontes;
- não usar conhecimento externo;
- não inventar condutas;
- não diagnosticar definitivamente;
- não prescrever;
- recomendar avaliação presencial em alto risco;
- adaptar linguagem para profissional ou paciente.

Mesmo com prompt, a segurança principal não depende só do modelo. Ela é aplicada antes pelo SafetyService.

Isso é intencional.

Prompt é orientação. Código é controle.

## 23. Logs e auditoria

Cada pergunta respondida gera um `RetrievalLog`.

O log guarda:

- pergunta;
- chunks usados;
- scores;
- filtros;
- resposta final;
- fallback;
- risco.

Isso permite responder perguntas como:

- Quais fontes sustentaram essa resposta?
- O sistema acionou fallback?
- Qual foi o score dos chunks?
- A pergunta era de risco alto?
- O retrieval trouxe chunks adequados?

Em sistemas clínicos, rastreabilidade é parte da segurança.

## 24. Feedback

O módulo de feedback fica em:

```text
src/modules/feedback/
```

Endpoint:

```http
POST /api/feedback
```

Ele permite registrar:

- nota;
- comentário;
- se foi revisado por especialista;
- mensagem associada.

Esse recurso é útil para avaliação contínua da qualidade do sistema.

## 25. Avaliação

O módulo de avaliação fica em:

```text
src/modules/evaluation/
```

O dataset inicial tem 25 perguntas e também foi salvo em:

```text
knowledge-base/processed/qa_dataset.json
```

Endpoints:

```http
POST /api/evaluation/seed
GET /api/evaluation/questions
POST /api/evaluation/run
```

A avaliação inicial mede:

- total de perguntas;
- se retornou algum chunk ideal;
- contagem de fallbacks;
- chunks retornados;
- risco classificado.

Não é uma avaliação clínica definitiva. É uma primeira camada de teste funcional do RAG.

## 26. Testes automatizados

Os testes estão em:

```text
tests/core.test.ts
```

Eles cobrem:

- validação de metadados;
- ingestão JSONL;
- classificação de intenção;
- detecção de risco clínico;
- fallback sem chunks;
- fallback fora do escopo;
- bloqueio de prescrição;
- busca por chunks de diagnóstico;
- busca por chunks de tratamento;
- retorno com fontes;
- resposta sobre baciloscopia negativa;
- resposta sobre não interromper PQT em reação sem orientação;
- talidomida e gestação como alto risco.

Os testes usam fakes em memória para não depender do banco nem da OpenAI.

Isso permite validar a lógica principal rapidamente.

## 27. Endpoints criados

### Health

```http
GET /health
```

Verifica:

- API;
- banco;
- extensão vector.

### Conhecimento

```http
POST /api/knowledge/ingest/jsonl
POST /api/knowledge/seed
```

### Documentos

```http
GET /api/documents
```

### Chunks

```http
GET /api/chunks
GET /api/chunks/:chunkId
```

### Retrieval

```http
POST /api/retrieval/search
```

Retorna chunks ranqueados sem gerar resposta final.

### Chat

```http
POST /api/chat/ask
```

Executa o fluxo completo de RAG, safety, resposta e logging.

### Avaliação

```http
POST /api/evaluation/seed
GET /api/evaluation/questions
POST /api/evaluation/run
```

### Feedback

```http
POST /api/feedback
```

## 28. Fluxo completo de uma pergunta

Exemplo:

```text
Baciloscopia negativa exclui hanseníase?
```

O sistema faz:

1. Recebe a pergunta em `/api/chat/ask`.
2. Classifica intenção como `exam`.
3. Gera embedding da pergunta.
4. Executa busca vetorial.
5. Executa busca textual.
6. Combina scores.
7. Aplica reranking.
8. Detecta risco clínico como alto.
9. Verifica SafetyService.
10. Se houver chunks suficientes, gera resposta.
11. Cita fontes.
12. Adiciona disclaimer.
13. Salva mensagem e log.
14. Retorna resposta.

O chunk esperado é:

```text
hans_exame_bacilo_001
```

Porque ele contém:

```text
Resultado negativo não exclui hanseníase, especialmente nas formas paucibacilares.
```

## 29. Como rodar localmente

Instalar dependências:

```bash
npm install
```

Criar `.env`:

```bash
copy .env.example .env
```

Subir banco:

```bash
docker compose up -d
```

Gerar Prisma Client:

```bash
npm run prisma:generate
```

Rodar migrations:

```bash
npm run prisma:migrate
```

Carregar seed:

```bash
npm run prisma:seed
```

Rodar API:

```bash
npm run dev
```

Testar health:

```bash
curl http://localhost:3333/health
```

Testar pergunta:

```bash
curl -X POST http://localhost:3333/api/chat/ask ^
  -H "Content-Type: application/json" ^
  -d "{\"question\":\"Baciloscopia negativa exclui hanseníase?\",\"userType\":\"Profissional de saúde\"}"
```

## 30. Validações realizadas

Foram executados:

```bash
npm run lint
npm run build
npm test
npx prisma validate
```

Resultados:

- lint passou;
- build passou;
- 13 testes passaram;
- schema Prisma válido.

Também foi tentado subir o Docker:

```bash
docker compose up -d
```

Mas o Docker Desktop não estava ativo no ambiente, então o banco não pôde ser iniciado naquele momento.

Por isso, o `/health` respondeu:

```json
{
  "api": "ok",
  "database": "error",
  "vectorStore": "error"
}
```

Isso significa que a API estava rodando, mas o banco e o pgvector não estavam disponíveis.

## 31. Por que a segurança foi implementada em código

Em sistemas com LLM, não é suficiente colocar regras apenas no prompt.

Um modelo pode:

- interpretar mal;
- alucinar;
- ignorar instruções;
- responder além das fontes;
- suavizar alertas.

Por isso, as regras críticas foram implementadas em código antes da geração final.

Exemplo:

Se a pergunta for:

```text
Qual dose de rifampicina eu devo tomar?
```

O sistema não deixa a geração livre responder. O SafetyService bloqueia com mensagem segura.

Isso reduz o risco de resposta perigosa.

## 32. Por que toda resposta precisa de fontes

Em RAG clínico, uma resposta sem fonte é frágil.

As fontes permitem:

- rastrear de qual chunk veio a informação;
- auditar resposta;
- revisar erro;
- melhorar a base;
- demonstrar transparência;
- reduzir alucinação.

Por isso, o endpoint `/api/chat/ask` sempre retorna o array:

```json
"sources": []
```

Quando não há fonte suficiente, o sistema aciona fallback.

## 33. Limitações atuais

Esta é uma primeira versão funcional.

Limitações:

- a base seed é pequena;
- os chunks são sintéticos para desenvolvimento;
- a resposta sem OpenAI é extrativa e simples;
- a classificação de intenção usa regras;
- a avaliação é funcional, não validação clínica completa;
- não há autenticação;
- não há painel administrativo;
- não há upload multipart real de arquivo JSONL;
- não há revisão por especialista integrada ao fluxo;
- não há cache de embeddings;
- não há testes end-to-end com banco porque o Docker não estava ativo.

## 34. Próximos passos recomendados

Evoluções naturais:

1. Alimentar a base com documentos oficiais reais.
2. Revisar chunks com especialista.
3. Adicionar páginas e referências bibliográficas completas.
4. Criar ingestão por upload multipart.
5. Implementar autenticação.
6. Criar painel de revisão de respostas.
7. Adicionar testes de integração com PostgreSQL real.
8. Melhorar avaliação com métricas de groundedness e faithfulness.
9. Criar versionamento de base de conhecimento.
10. Implementar reprocessamento de embeddings.
11. Melhorar classificação de intenção com modelo ou classificador treinado.
12. Criar trilha de auditoria para respostas de risco alto e muito alto.

## 35. Resumo da arquitetura

Em forma simples:

```text
Usuário
  -> API Express
  -> ChatService
  -> IntentClassifier
  -> HybridSearch
      -> Embeddings
      -> pgvector
      -> Full Text Search
  -> Reranking
  -> ClinicalRiskService
  -> SafetyService
  -> Geração com chunks
  -> Fontes
  -> Logs
  -> Resposta
```

O ponto central é:

> O sistema não tenta ser um médico. Ele organiza informação recuperada, cita fontes, respeita limites clínicos e orienta avaliação profissional quando necessário.

Essa separação é essencial para o tema do TCC: apoio à decisão clínica, não substituição da decisão clínica.
