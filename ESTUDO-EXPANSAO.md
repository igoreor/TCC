# Estudo de expansão semântica de consultas no NexoHansen

Tela acrescentada por Nathan Dalbert para mostrar o estudo do TCC dele, "RAG com Expansão Semântica de Consultas para Apoio à Pesquisa Clínica em Hanseníase". A autoria conjunta do NexoHansen ainda está sendo combinada com o Igor e o orientador.

## O que é

A tela **Expansão semântica** (`/dashboard/estudo`) compara cinco condições para a mesma pergunta:

- **D:** sem RAG;
- **R0:** RAG;
- **R1:** RAG após reescrever a pergunta;
- **R2:** RAG após gerar palavras-chave;
- **R3:** RAG após gerar um pseudodocumento.

Cada coluna mostra a busca usada, a resposta e os trechos recuperados, com documento e página. A tela tem duas abas:

- **Resultados do experimento:** respostas já registradas pelo harness do Nathan (lotes de `research/runs`), sem nenhuma chamada nova.
- **Comparação ao vivo:** uma pergunta livre, respondida pelo mesmo pipeline do experimento, com Claude (Claude Code) ou GPT (Codex) pela assinatura do Nathan. É demonstração, não dado do experimento.

As respostas vêm do harness `software/rag-study`, que fica no workspace do Nathan (fora deste repositório), pelo serviço local `rag-study serve`. O harness usa o corpus de documentos oficiais `hanseniase-v2` e o índice BGE-M3.

## O que não muda no NexoHansen

- **O pipeline do NexoHansen (Cenário A)**, a tela `/comparacao`, os prompts, a base de conhecimento, a avaliação de 0 a 10 e o deploy.
- **Banco e trilha de auditoria:** as rotas `/api/study/*` não usam o banco, então nada do estudo entra em sessões, mensagens, registros de recuperação ou feedback.
- **Código existente:** o estudo está em arquivos próprios:
  - `backend/src/modules/study/`, `backend/tests/study.test.ts`;
  - `frontend/src/api/study.ts`, `frontend/src/features/study/`.
- **Arquivos do Igor:** só receberam linhas acrescentadas, em `backend/src/app.ts`, `backend/src/services.ts`, `backend/src/config/env.ts`, `backend/.env.example`, `frontend/src/App.tsx` e `frontend/src/components/layout/NavBar.tsx`.

## Proteções

- As rotas exigem login, como o resto da API.
- **Desligadas em produção** (`NODE_ENV=production`, o que inclui a Vercel). A comparação ao vivo usa assinaturas pessoais e não pode servir a outros usuários.
- **Fora do build de produção do frontend:** o link e a rota só existem em desenvolvimento (`npm run dev`), então o site publicado continua idêntico. `VITE_STUDY_ENABLED=true|false` força um ou outro.
- **Serviço só na máquina do Nathan:** o `rag-study serve` escuta só em `127.0.0.1` e recusa pedidos vindos de navegador. Só este backend chama o serviço.
- **Uma comparação por vez.** Cada expansão faz duas chamadas ao modelo (expandir e responder).

## Como rodar (instância local do Nathan)

1. No workspace do harness (`C:\TCC`), inicie o serviço. O comando completo está no `software/rag-study/README.md`:
   - `rag-study serve --config software/rag-study/config/demo/live-v1.json --dry-run`: modo simulado, sem chamadas;
   - `--allow-api` no lugar de `--dry-run`: Claude Code e Codex logados pela assinatura.
2. No `backend/.env` local, defina `STUDY_SERVICE_URL=http://127.0.0.1:8765`.
3. Rode o backend e o frontend como no `backend/README.md`, com banco próprio, e abra `/dashboard/estudo`.
