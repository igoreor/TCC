# Frontend — RAG Hanseníase

Painel web para o backend RAG de apoio à decisão clínica em hanseníase (TCC). React + Vite + TypeScript, consumindo a API REST do backend em `../backend`.

## Acesso

- **Login** (`/login`): usuário e senha cadastrados no banco (ver `backend/README.md`). A sessão fica em cookie HttpOnly e é encerrada pelo botão "Sair".
- A página inicial (`/`) é pública. A consulta (gaveta), a comparação (`/comparacao`) e o painel (`/dashboard/*`) exigem login. Sem sessão, a pessoa é levada ao login e depois volta para onde estava.
- Após cada resposta concluída da IA, na gaveta e no chat do painel, aparece a avaliação: nota de 0 a 10, comentário opcional, envio e opção de dispensar.

## Telas

- **Chat** (`/dashboard/chat`) — pergunta/resposta com fontes citadas, painel de segurança (risco, fallback, disclaimer) e avaliação da resposta.
- **Retrieval Explorer** (`/recuperacao`) — roda a busca híbrida isoladamente e mostra o ranking bruto com scores vetorial/textual/final por chunk.
- **Base de conhecimento** (`/base`) — documentos, chunks paginados/filtráveis e detalhe de cada chunk.
- **Avaliação** (`/avaliacao`) — perguntas de avaliação seed e execução do benchmark com métricas agregadas.

## Rodando localmente

Backend (terminal 1, a partir de `backend/`):

```bash
copy .env.example .env
docker compose up -d
npm run prisma:generate
npm run prisma:deploy
npm run dev
```

Para entrar, cadastre um usuário no banco com `npm run auth:hash-password -- --username <usuario>` (ver `backend/README.md`).

Frontend (terminal 2, a partir de `frontend/`):

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. O Vite faz proxy de `/api` e `/health` para `http://localhost:3333` (ver `vite.config.ts`), então não é preciso configurar CORS nem URL absoluta em dev.

Se a base estiver vazia, use o botão "Popular base (seed)" na tela **Base de conhecimento** (ou `POST /api/knowledge/seed`) e "Popular perguntas (seed)" em **Avaliação**.

## Scripts

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # tsc -b && vite build
npm run lint     # oxlint
npm test         # vitest + Testing Library (jsdom)
npm run preview  # serve o build de produção
```

## Configuração

`VITE_API_BASE_URL` (opcional, ver `.env.example`) sobrescreve a base da API — útil para `vite preview` sem o proxy de dev. Em desenvolvimento normal, deixe em branco.
