# Contexto do projeto — RAG Hanseníase (TCC)

Documento vivo para retomar o contexto do projeto e da colaboração com o Claude Code caso a sessão de chat seja encerrada. Cobre o que o projeto é, o que foi feito, decisões tomadas e por quê, e o que ainda está em aberto. Também serve como matéria-prima para o capítulo de desenvolvimento do TCC, se for útil.

## O que é o projeto

Backend + frontend de um sistema RAG (Retrieval-Augmented Generation) para apoio informacional à decisão clínica em hanseníase — tema do TCC:

> Desenvolvimento de um Sistema Baseado em Recuperação Aumentada por Geração (RAG) para Apoio à Decisão Clínica em Hanseníase.

O sistema **não diagnostica nem prescreve**: recupera trechos técnicos de uma base de conhecimento, gera resposta só com base neles, cita fontes, aplica regras de segurança clínica explícitas e recomenda avaliação presencial quando necessário.

Documentação técnica de arquitetura do backend (bem detalhada, vale ler antes de mexer em retrieval/safety/chat): [backend/docs/arquitetura-backend-rag-hanseniase.md](backend/docs/arquitetura-backend-rag-hanseniase.md).

## Estrutura do repositório

```
projetoTcc/                 (raiz do repo git — origin: github.com/igoreor/TCC)
  CONTEXTO.md                <- este arquivo
  backend/                   Node.js + TypeScript + Express + Prisma + PostgreSQL/pgvector
  frontend/                  React + Vite + TypeScript
```

Os dois projetos são independentes (dois `package.json`, sem workspace compartilhado) — só compartilham o mesmo repositório git.

## Linha do tempo desta sessão (2026-09-14)

O projeto tinha ficado parado desde 11/06/2026 (~3 meses). A sessão começou com um diagnóstico e evoluiu para a construção completa do frontend, correção de bugs reais do backend e reorganização do repositório. Resumo cronológico:

### 1. Diagnóstico do estado do projeto

Backend intacto e bem documentado: lint, build (`tsc`) e os 13 testes automatizados passavam sem alteração nenhuma. Mas nunca tinha sido testado contra um Postgres real — os testes usam fakes em memória — e não havia `.env`, Docker não estava rodando, e **não havia repositório git em lugar nenhum**.

### 2. Planejamento e construção do frontend

Sem frontend algum antes desta sessão. Decisões tomadas com o usuário (via perguntas diretas):
- **Escopo**: chat + painel de inspeção (não um produto com autenticação — o backend não tem auth).
- **Stack**: React + Vite + TypeScript.

Um agente de planejamento leu o código-fonte do backend inteiro (controllers, services, schemas, `prisma/schema.prisma`) para levantar o contrato exato da API antes de desenhar o frontend — inclusive achando nuances importantes que não estavam na doc, como o fato de `GET /api/chunks` retornar `{ items, pagination }` (não um array puro) e de `/api/retrieval/search` expor o ranking **bruto** (antes do reranking de segurança que o chat usa internamente).

Plano completo aprovado e salvo em `C:\Users\IGOR\.claude\plans\stateless-shimmying-wren.md` (fora do repositório, é um artefato do Claude Code).

Frontend construído com 4 telas:
- **Chat** (`/chat`) — pergunta/resposta, fontes citadas, painel de segurança (risco, fallback, disclaimer), avaliação da resposta (1-5 estrelas). Sessão mantida em `localStorage` porque o backend não tem endpoint de histórico, só `POST /api/chat/ask`.
- **Retrieval Explorer** (`/recuperacao`) — roda a busca híbrida isolada, mostra scores vetorial/textual/final por chunk.
- **Base de conhecimento** (`/base`) — documentos, chunks paginados/filtráveis, detalhe de chunk, botão de seed.
- **Avaliação** (`/avaliacao`) — perguntas seed, roda o benchmark de 25 perguntas, mostra métricas agregadas.

Decisões de arquitetura: `react-router-dom` para navegação, `@tanstack/react-query` para data-fetching/cache, CSS Modules puro (sem Tailwind/biblioteca de UI), cliente HTTP tipado à mão espelhando os DTOs do backend (`frontend/src/api/types.ts`) — sem workspace compartilhado, então se o backend mudar um DTO, esse arquivo precisa ser atualizado manualmente.

O scaffold do Vite veio com TypeScript configurado com `erasableSyntaxOnly: true` — isso proíbe parameter properties em construtores (`constructor(private x: Foo)`) e enums TS, por exemplo. Vale lembrar disso ao escrever TS novo no frontend.

### 3. Ambiente local, bugs reais encontrados e corrigidos no backend

Pra testar de verdade, foi preciso subir Postgres pela primeira vez na vida do projeto. Isso revelou problemas que nunca tinham sido pegos:

1. **Prisma exige `DATABASE_URL` como variável de ambiente do processo** — `schema.prisma` usa `env("DATABASE_URL")` direto, o que ignora o valor-padrão do Zod em `src/config/env.ts`. Sem um `.env` de verdade, o Prisma Client falha na inicialização mesmo com o Zod tendo um default. `.env` foi criado localmente (a partir de `.env.example`, já no `.gitignore`).

2. **Conflito de porta**: já existe um Postgres nativo do Windows escutando em `0.0.0.0:5432` nesta máquina (não relacionado a este projeto). O Postgres deste projeto foi movido para a porta **5433** — atualizado em `docker-compose.yml`, `.env`, `.env.example` e `README.md`.

3. **Volume Docker antigo com credencial diferente**: `backend_postgres_data` era de uma sessão anterior (de junho) e não aceitava a senha `postgres` atual. Corrigido **sem apagar dados** — `ALTER USER postgres WITH PASSWORD 'postgres'` direto dentro do container.

4. **Bug real: busca vetorial/textual quebrava contra Postgres de verdade.** `knowledge.repository.ts` usava `SELECT *` (e `chunks.*`) em SQL cru numa tabela com uma coluna `embedding` do tipo `vector`, que o Prisma marca como `Unsupported` e não consegue deserializar num `$queryRawUnsafe`. Todo `/api/chat/ask` e `/api/retrieval/search` dava 500. **Corrigido** listando as colunas explicitamente (excluindo `embedding`) em `vectorSearch()` e `textSearch()`. Isso nunca tinha sido detectado porque os testes automatizados só usam fakes em memória.

5. **Dois índices "invisíveis" para o Prisma**: `chunks_embedding_cosine_idx` (ivfflat) e `chunks_metadata_gin_idx` (GIN) existem via SQL cru na migration inicial mas não são representáveis em `schema.prisma` (Prisma não modela `vector`/GIN nativamente). Rodar `prisma migrate dev` detecta isso como "drift" e **apaga os dois índices**. Foram restaurados numa migration nova (`prisma/migrations/20260914181129_restore_manual_vector_and_gin_indexes/`). **Isso vai se repetir** toda vez que alguém rodar `prisma migrate dev` no futuro — depois de qualquer migration nova, checar se esses dois índices ainda existem (`\di chunks_*` no psql) e recriá-los se precisar, usando o SQL dessa migration como referência.

### 4. Achado importante para o capítulo de avaliação do TCC

Com o backend funcionando de verdade, rodei a avaliação completa (`POST /api/evaluation/run`, 25 perguntas seed) sem `OPENAI_API_KEY` configurada (ou seja, usando o provedor de embedding determinístico/mock). Resultado: **0 de 25 corretas, 0% de recall, 25/25 caíram no fallback de segurança** — mesmo quando `/api/retrieval/search` rankeia o chunk certo em #1º lugar pra a mesma pergunta (ex: score final ~0.25 pra um match limpo sobre baciloscopia). O motivo: a similaridade de cosseno do embedding mock nunca chega perto de `MIN_RETRIEVAL_SCORE=0.65`.

**Isso não é um bug — é uma decisão pendente.** Qualquer demonstração ou avaliação rodada sem uma chave OpenAI real vai *sempre* mostrar a recusa segura, nunca uma resposta fundamentada. Antes da banca ou de escrever o capítulo de avaliação, decidir uma das opções:
- configurar uma `OPENAI_API_KEY` de verdade;
- baixar `MIN_RETRIEVAL_SCORE` (`backend/.env`);
- melhorar o algoritmo do embedding determinístico (`src/modules/embeddings/embeddings.provider.ts`) para ter mais poder discriminativo.

### 5. Verificação visual do frontend

Build (`tsc -b && vite build`) e lint (`oxlint`) limpos. Verificação visual de verdade: Playwright instalado ad hoc via `npx` (não é dependência do projeto) para dirigir um Chromium headless contra as 4 telas + interações (perguntar no chat, rodar retrieval, navegar a base, abrir detalhe de chunk, rodar avaliação completa). Zero erros de console em toda a sessão. Screenshots conferidos visualmente um por um.

### 6. Descoberta do repositório git e reorganização

No meio da sessão, descobriu-se que **já existia um repositório git real** dentro de `backend/` — criado (provavelmente via GitKraken, por causa de uma pasta residual `.git/gk/`) enquanto o Claude estava ocupado com tarefas longas em background (instalações de npm/docker/playwright). Esse repositório já tinha um commit inicial ("Initial commit: backend do projeto de TCC") **e já tinha sido enviado** para `https://github.com/igoreor/TCC.git`.

O Claude tinha, sem saber disso, inicializado um repositório separado e vazio na raiz de `projetoTcc/`. Esse foi descartado, e o repositório real foi movido de `backend/.git` para `projetoTcc/.git` (histórico, remote e configuração local de usuário — `user.name=igoreor` — todos preservados no processo). Depois disso:

- Todo o conteúdo que estava na raiz do repo (antigo root = `backend/`) foi movido para a subpasta `backend/` — o git reconheceu como renomeações (66 arquivos), preservando o histórico.
- O `frontend/` inteiro foi adicionado.
- Um único commit (`f1043c6`) juntando a reorganização + as correções de backend + o frontend novo. **Sem nenhuma linha de coautoria do Claude** — instrução explícita do usuário, provavelmente por integridade acadêmica (é o TCC dele). Essa instrução vale para qualquer commit/PR futuro neste repositório.
- Esse commit **não foi enviado (push)** ainda — ficou como decisão do usuário.

### 7. Ajustes finais de ambiente

O usuário tentou rodar `npm run dev` no próprio terminal e bateu em `EADDRINUSE` na porta 3333, porque o Claude ainda tinha um backend e um frontend rodando em background (usados pra testes/screenshots). Os processos em background foram encerrados (via PID direto, já que `TaskStop` no Windows não mata processos-filho do `npm run dev` de forma confiável — fica um `node.exe` órfão segurando a porta). A partir daí, quem roda os servidores é o usuário, nos próprios terminais.

### 8. Redesign completo do frontend (mesmo dia, 2026-09-15)

O usuário não gostou do conceito do dashboard de 4 telas — a visão real era outra: uma **landing page institucional com widget de chat flutuante** e uma **tela de comparação acadêmica** (RAG seguro vs. LLM genérico lado a lado) pensada pra demonstrar na banca a diferença entre uma resposta fundamentada/segura e uma genérica sem contexto. O usuário também forneceu `backend/docs/designer-frontend-ui-ux.md` — na verdade a definição de um subagente de design (não um doc de requisitos), com uma metodologia visual concreta: dark mode como base, design tokens definidos antes dos componentes, glassmorphism pontual, gradientes sutis, glow no accent, microinterações reais, Lucide como ícone padrão, Tailwind como framework padrão.

**Decisão tomada com o usuário**: o dashboard de 4 telas não foi descartado — foi movido para `/dashboard/*` (ex: `/dashboard/chat`) e **não fica linkado** em lugar nenhum da nova UI. Continua acessível por URL direta, como ferramenta interna de inspeção, sem restyle (continua em CSS Modules/tema claro, exatamente como estava).

**O que foi construído** (tudo em `frontend/`, reaproveitando a camada de API/tipos já existente):

- **Tailwind v4** via `@tailwindcss/vite`, tokens em `src/styles/tailwind.css` (`@theme`): paleta dark (`--color-canvas #0a0a0f`, `--color-surface-1/2/3`), accent teal `#2dd4bf`, 5 tons de risco espelhando `src/lib/severity.ts`. Fontes `Inter` (corpo) e `Space Grotesk` (display) auto-hospedadas via `@fontsource-variable` (não Google Fonts — a demo roda ao vivo na banca, não dá pra depender de rede externa).
- **Achado técnico real corrigido**: `src/styles/global.css` tinha regras **sem camada CSS** (reset de `button/input/a/:focus-visible`) que, pela spec de cascade layers, sempre venceriam as utilities do Tailwind (que ficam em `@layer utilities`) — todo botão/link novo ignoraria silenciosamente as classes Tailwind. Corrigido envolvendo essas 3 regras em `@layer legacy-reset { ... }`. Verificado visualmente antes de construir qualquer coisa em cima.
- **Rotas**: `/` = landing nova, `/comparacao` = tela de comparação, `/dashboard/*` = as 4 telas antigas (nested route com `<Outlet/>`, sem mudar `AppShell.tsx`). Achou e corrigiu 6 links absolutos hardcoded (`/chat`, `/base/chunks/...`, etc.) que teriam quebrado com a mudança — incluindo um em `ChunkDetailPage.tsx` que nem o agente de planejamento tinha pego.
- **`RagAnswerBubble`** (`components/rag-answer/`) — o componente "crítico" pedido pelo usuário: resposta + badge/caixa de alerta de risco (escalação visual: risco baixo/médio = badge discreto, alto/muito alto/fallback = caixa vermelha/laranja com ícone) + fontes como chips pequenos, sem link pro `/dashboard` (decisão deliberada pra não vazar um caminho pra ferramenta que devia ficar escondida). Reaproveitado tanto no widget quanto na coluna esquerda da comparação.
- **Widget de chat flutuante** (`components/widget/`) — FAB no canto inferior direito, painel com glassmorphism, seletor de perfil de usuário, estado vazio com perguntas de exemplo clicáveis, typing indicator, erro com retry. Sessão só em memória (sem `localStorage`, de propósito — não confundir com a chave `hanseniase-chat-session-v1` que o chat do dashboard já usa).
- **Tela de comparação** (`features/comparison/`) — duas colunas, um input único embaixo. `useComparisonSession` dispara as duas chamadas com `Promise.allSettled`, desabilita o input até as duas terminarem, isola falha de um lado do outro. Lado direito ("LLM Genérico") é **simulado inteiramente no cliente** (`lib/genericLlmSimulator.ts` — sem chave OpenAI, sem endpoint novo no backend, delay artificial de 1.5–3s), com visual deliberadamente "pelado" (sem chips, sem badge colorido) — diferenciação informativa, não alarmista.
- **Landing** (`features/landing/`) — hero, 4 seções de conteúdo mockado (o que é hanseníase, sintomas, diagnóstico, tratamento — textos placeholder plausíveis, não lorem ipsum, o usuário substitui depois), seção de confiança (4 pilares).

**Dois bugs visuais reais encontrados e corrigidos durante a verificação** (não estavam no plano, apareceram só ao testar no navegador):
1. Links (`Comparação acadêmica`, `Ver comparação acadêmica`) saíam sublinhados — faltava `no-underline` explícito (Tailwind não reseta isso por padrão).
2. No mobile, o painel do widget vira tela cheia e o FAB fixo ficava **sobreposto ao botão de enviar** do composer. Corrigido escondendo o FAB (`max-md:hidden`) só quando o painel está aberto E a tela é pequena — no desktop o FAB continua visível abaixo do painel.

**Verificação**: Playwright (mesmo setup ad hoc via `npx` de antes) dirigindo o fluxo completo contra o backend real — landing, widget com pergunta real (incluindo o caso de fallback/risco alto), comparação com as duas colunas respondendo, input desabilitado/reabilitado corretamente, **backend derrubado no meio de uma comparação pra confirmar que só o lado RAG mostra erro** (com botão "Tentar novamente") **enquanto o lado genérico completa normalmente** — isolamento funcionando exatamente como projetado. `prefers-reduced-motion` emulado, mobile conferido, dashboard re-testado ponta a ponta pra confirmar que continua 100% intacto. Build e lint limpos o tempo todo.

Plano completo desse redesign (mais detalhado que este resumo) está no mesmo arquivo de antes: `C:\Users\IGOR\.claude\plans\stateless-shimmying-wren.md` (foi sobrescrito — cobre agora o redesign, não mais o dashboard original).

### 9. Segundo restyle — visual "Linear.app" (mesmo dia, 2026-09-15)

O usuário rejeitou também a estética do redesign da seção 8 (pediu pra esquecer o doc de design e o "agente de IA" usado ali) e mandou um briefing bem concreto inspirado no site do Linear.app: fundo quase preto (`#09090b`), bordas finas translúcidas (`white/5`–`white/10`), glassmorphism, gradiente sutil no texto do hero, glow discreto, header global fixo compartilhado entre `/` e `/comparacao`, chat virando **drawer** full-height (sem seletor de perfil, um só botão de fechar), input da comparação virando barra flutuante estilo "command palette".

Como a UI já usava tokens nomeados centralizados (`src/styles/tailwind.css`), a maior parte do resultado veio de **retunar os valores dos tokens** (não recriar componentes) — só os pedidos estruturais específicos (header global, drawer, command palette) exigiram refactor de fato: `GlobalHeader.tsx` + `PublicLayout.tsx` (novos, substituem `LandingHeader.tsx`, que foi apagado), `ChatWidgetPanel/Composer/Fab.tsx` (viram drawer full-height sem seletor de perfil, FAB some de vez quando aberto), `ComparisonPage/Column.tsx` e `SharedComposer.tsx` (sem header próprio, selos de cor nos títulos das colunas, input flutuante).

**Dois bugs reais de layout encontrados só ao testar no navegador** (de novo — planejamento bom não substitui testar de verdade):
1. O header fixo (`z-50`) bloqueava clique no botão de fechar do drawer, porque o drawer/overlay tinham `z-40` (menor). Corrigido subindo o drawer/overlay pra `z-[60]`/`z-[61]`.
2. A `ComparisonPage` não tinha nenhum espaçamento pro header fixo — o cabeçalho das colunas (título, selo colorido) ficava escondido atrás do header, só aparecendo borrado através do `backdrop-blur` dele. Corrigido trocando a estratégia de altura pra `fixed inset-x-0 bottom-0 top-16` (mais robusto que combinar `padding-top` com `height: calc(...)`, que colide com `box-sizing: border-box`).

Verificado de novo ponta a ponta com Playwright contra o backend real (drawer abrindo/fechando/perguntando, comparação com as duas colunas, mobile, dashboard antigo re-testado pra confirmar zero regressão). Build e lint limpos.

## Estado atual

- Backend e frontend funcionam de ponta a ponta contra Postgres real (visto na seção 3-5 acima).
- Repositório git em `projetoTcc/.git`, branch `main`, remote `origin` → `github.com/igoreor/TCC.git`, **1 commit à frente do `origin/main`** (não enviado ainda).
- `git config user.name` **global** não está definido nesta máquina (só localmente neste repo, herdado do commit que o usuário já tinha feito). Isso pode dar problema em outros repositórios git nesta máquina que não tenham a config local própria.
- `backend/.env` existe localmente (não versionado) com a porta 5433 e sem `OPENAI_API_KEY`.

## Como rodar

Ver [backend/README.md](backend/README.md) e [frontend/README.md](frontend/README.md) para o passo a passo completo. Resumo do dia a dia:

```bash
# terminal 1 — backend/
docker compose up -d
npm run dev

# terminal 2 — frontend/
npm run dev
```

Abrir `http://localhost:5173`. A landing (`/`) é a home agora — o dashboard antigo fica em `/dashboard/chat` etc., sem link nenhum a partir da landing. Se a base estiver vazia, popular via `/dashboard/base` (botão "Popular base (seed)") e `/dashboard/avaliacao` ("Popular perguntas (seed)").

## Decisões pendentes / próximos passos

1. **Commitar o redesign do frontend** (seção 8) — ainda está tudo só no working tree, nada commitado desde `f1043c6`.
2. **Dar push** pra `origin/main` (o commit `f1043c6` já estava pendente disso antes do redesign também).
3. **Decidir sobre `OPENAI_API_KEY` / `MIN_RETRIEVAL_SCORE`** — ver seção 4, é o achado mais importante para o TCC.
4. Lembrar de restaurar `chunks_embedding_cosine_idx` e `chunks_metadata_gin_idx` depois de qualquer `prisma migrate dev` futuro (ver seção 3, item 5).
5. Conteúdo da landing (`frontend/src/features/landing/content.ts`) é mockado — trocar por texto revisado antes de qualquer uso real.
6. Backlog já documentado pelo próprio projeto (autenticação, painel admin, upload multipart de JSONL, revisão por especialista, testes de integração com Postgres real, versionamento da base, etc.) — ver seção "Próximos passos recomendados" em [backend/docs/arquitetura-backend-rag-hanseniase.md](backend/docs/arquitetura-backend-rag-hanseniase.md).

## Referências rápidas

- Arquitetura do backend: [backend/docs/arquitetura-backend-rag-hanseniase.md](backend/docs/arquitetura-backend-rag-hanseniase.md)
- Metodologia de design usada no redesign: [backend/docs/designer-frontend-ui-ux.md](backend/docs/designer-frontend-ui-ux.md)
- Plano de implementação do frontend atual (fora do repo — foi sobrescrito, cobre o redesign): `C:\Users\IGOR\.claude\plans\stateless-shimmying-wren.md`
- Commit da reorganização backend/frontend: `f1043c6` — "Reorganiza projeto em backend/ e frontend/"
