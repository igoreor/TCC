# Estado da implementação

Atualizado em 22/10/2026. A versão anterior (03/10/2026, etapa E1) está resumida no fim.

## Funciona (executado e verificado nesta máquina)

- Corpus `pcdt2022-v1`: 206 trechos do PCDT 2022, reconstrução com hash idêntico.
- Índice BGE-M3 (revisão fixada): reconstrução com embeddings idênticos; busca exata.
- Piloto R0 só de recuperação (25 smoke) e ensaio completo com provedores simulados (lotes de 03/10).
- **Novo (22/10):**
  - Matriz de perguntas e planilha de redação (`questions-sheet`), com todas as seções-alvo resolvidas no corpus congelado.
  - Conversão e validação antes do congelamento (`questions-build`, `questions-check`).
  - Pool cego com os trechos das seções-alvo (`pool --target-sections`).
  - Descritores automáticos das respostas (`auto-metrics`).
  - Revisão humana cega em duas passagens (`review-export`, `review-import`).
  - Regra de seleção da etapa 1 (`select-strategy`).
  - Análise pareada com bootstrap por grupo, permutação, Wilcoxon, McNemar e Holm (`compare`).
  - Concordância por kappa (`agreement`).
  - Erros de conta interrompem o lote (D30).
  - Os comandos de perguntas, pool, `auto-metrics` e `review-export` foram executados de ponta a ponta sobre o lote simulado `e2-api-smoke/20261023T010256Z-dryrun`.
- 75 testes offline (`python -m pytest -q`) em 22/10; 105 em 24/10.

## Acesso pela assinatura (D31): funciona nos dois braços

- `claude_cli` (Claude Code 2.1.126, `claude-sonnet-5-5`, esforço `low`):
  - smoke `e2-cli-smoke-claude/20261023T015057Z`: 25/25 sem erro;
  - evento `init` com `tools=[]` e sem MCP;
  - limite de saída imposto.
- `codex_cli` (Codex 0.162, `gpt-6.1-sol`, esforço `low`):
  - captura local com requisição sem ferramentas e prompts byte a byte iguais;
  - smoke `e2-cli-smoke-gpt/20261023T131207Z`: 25/25 sem erro.
- Retomada de lote interrompido por limite do plano (`run --continue-from`), testada.
- As configurações das etapas 1 e 2 usam os dois braços pela assinatura, com 1 repetição (D32) e limite de 2.000 tokens (D22).

## Corpus v2 (23/10/2026, D38)

- `research/corpus/hanseniase-v2`: 391 trechos de 5 documentos oficiais e índice BGE-M3.
- Construtor ampliado com opções de diagramação (títulos por tamanho, texto de destaque, recorte do DOU, linhas descartadas) e `merge-corpora`. A reconstrução do PCDT continua byte a byte idêntica.
- Configurações das etapas 1 e 2 apontam para o corpus v2 e o prompt RAG v2.
- Smoke de recuperação R0 no v2: 25/25.

## Tela do estudo no NexoHansen (24/10/2026, D41)

- `rag-study serve` (`serve.py`, config `config/demo/live-v1.json`): serviço local que mostra no app os lotes registrados e roda perguntas ao vivo com as mesmas unidades do experimento.
  - Respostas ao vivo vão para `research/demo-logs/`, nunca para `research/runs`.
  - O serviço escuta só em 127.0.0.1, recusa pedidos de navegador e faz uma comparação por vez.
- No app, branch local `nathan/expansao-semantica`: módulo `/api/study` e tela `/dashboard/estudo`, só acréscimos, desligados em produção.
- Verificado de ponta a ponta em 26/10: navegador 16/16 (simulado e real); chamadas reais com Claude e GPT pela tela, sem erro; nada gravado no banco do app nem em `research/runs` (`research/notes/nexohansen-local.md`).
- 105 testes no harness; 52 no backend e 19 no frontend do app.

## API paga: preparada, não usada

- `e2-api-smoke/20261023T010315Z` (`gpt-6.1-sol` pela API): todas as chamadas devolveram `429 insufficient_quota`, sem custo. O autor optou pela assinatura (D31). Os adaptadores `openai`/`anthropic` continuam no harness para replicação.

## Falta
- Perguntas `dev` e `test` escritas pelo autor, revisadas e congeladas.
- Etapa 1, qrels do dev e `select-strategy`; etapa 2; qrels do teste; revisão humana; análise.
- (Opcional) LLM julgador calibrado contra a amostra humana.
- (Opcional, depende do Igor) exportar o corpus para o NexoHansen como interface de demonstração (D18).

## Histórico: estado em 03/10/2026 (E1)

Corpus, índice, harness com etapas separadas, contingência de expansão, executor com lote imutável, pool cego e métricas do recuperador; 50 testes; nenhuma API chamada.
