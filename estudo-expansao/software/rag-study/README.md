# rag-study

Harness experimental do TCC: chat direto (D) × chat com RAG, e, no RAG, consulta original (R0) × expansões semânticas (R1 reescrita, R2 termos, R3 pseudo-documento), com modelos OpenAI e Anthropic. Recuperação e resposta são registradas e avaliadas separadamente.

A interface web em `C:\TCC\TCC` é a demonstração; os experimentos rodam aqui, em lote.

## Instalação

```powershell
cd C:\TCC\software\rag-study
uv sync --all-extras        # versões travadas em uv.lock (Python 3.12)
.venv\Scripts\python -m pytest -q
```

O BGE-M3 (revisão fixada) é baixado do Hugging Face na primeira construção do índice. Depois disso, defina `HF_HUB_OFFLINE=1` para não consultar a rede.

## Comandos (executar a partir de `C:\TCC`)

```powershell
$R = "software\rag-study\.venv\Scripts\rag-study"
# 1. corpus imutável a partir do PDF (falha se o hash da fonte mudar)
& $R --root . build-corpus --config software/rag-study/config/corpus-pcdt2022-v1.json --out research/corpus/<id>
# 2. índice BGE-M3
& $R --root . build-index --corpus research/corpus/<id> --embedder software/rag-study/config/embedder-bge-m3.json --index-id <id>-bge-m3 --out research/corpus/<id>/index-bge-m3
# 3. experimento
& $R --root . run --config <config.json> --dry-run      # provedores simulados, custo zero
& $R --root . run --config <config.json> --allow-api    # chamadas reais e pagas
# 4. pool cego para anotação de relevância
& $R --root . pool --runs research/runs/<exp>/<lote>/raw.jsonl --questions <perguntas.jsonl> --corpus research/corpus/<id> --depth 10 --seed <n> --out <pool.csv>
# 5. métricas do recuperador
& $R --root . eval-retrieval --runs <raw.jsonl ...> --qrels <qrels.csv> --k 5 --out <pasta-nova>
```

### Comandos acrescentados em 22/10/2026 (protocolo v0.3)

```powershell
# perguntas: planilha de redação, conversão e validação antes do congelamento
& $R --root . questions-sheet --blueprint research/questions/blueprint-v1.csv --corpus research/corpus/pcdt2022-v1 --out <planilha.csv>
& $R --root . questions-build --sheet <planilha preenchida.csv> --out-dir research/questions
& $R --root . questions-check --questions <test.jsonl> <dev.jsonl> --blueprint research/questions/blueprint-v1.csv --keypoints <test-keypoints.csv> --forbidden research/questions/smoke-v0.jsonl
# pool que inclui os trechos das seções-alvo de cada pergunta
& $R --root . pool ... --target-sections
# etapa 1: regra pré-especificada de escolha da expansão (D27)
& $R --root . select-strategy --table <retrieval-per-question.csv> --out <selecao.json>
# respostas: descritores automáticos e revisão humana cega (passagens A e B)
& $R --root . auto-metrics --runs <raw.jsonl> --out <auto.csv>
& $R --root . review-export --runs <raw.jsonl> --questions <test.jsonl> --keypoints <test-keypoints.csv> --corpus research/corpus/pcdt2022-v1 --repetition 0 --seed <n> --out <pasta-nova>
& $R --root . review-import --pass-a <pass-a.csv> --pass-b <pass-b.csv> --key <review-key.csv> --out <revisoes.csv>
# análise pareada por família, com Holm; concordância entre avaliadores
& $R --root . compare --table <tabela.csv> --metric recall_at_k --comparisons R0:R2 --arms openai,anthropic --test permutation --family F1 --questions <test.jsonl> --exclude-no-relevant --out <f1.csv>
& $R --root . agreement --first <a.csv> --second <b.csv> --on question_id,item_id --column relevance --weights linear --categories 0,1,2
```

Nenhum comando de análise sobrescreve arquivos existentes. Definições das métricas e dos testes: `research/protocol/metrics-and-tests-v1.md`.

### Tela do estudo no NexoHansen (D41)

```powershell
$env:HF_HUB_OFFLINE = "1"
# modo simulado: nenhuma chamada aos modelos (para testar a tela)
& $R --root . serve --config software/rag-study/config/demo/live-v1.json --dry-run
# modo real: Claude Code e Codex pela assinatura, como na etapa 2
& $R --root . serve --config software/rag-study/config/demo/live-v1.json --allow-api
```

- O serviço escuta só em `127.0.0.1:8765` e tem três rotas:
  - `GET /results` lê os lotes de `result_batches`;
  - `POST /compare` roda uma pergunta nas condições pedidas;
  - `GET /health` mostra o estado do serviço.
- As respostas ao vivo vão para `research/demo-logs/` e não são dados do experimento.
- No backend do NexoHansen, defina `STUDY_SERVICE_URL=http://127.0.0.1:8765`.
- No modo simulado, as expansões aparecem como "falhou": o provedor simulado só devolve JSON com saída estruturada, que a configuração desliga (D31).

Chaves: `OPENAI_API_KEY` e `ANTHROPIC_API_KEY` só como variáveis de ambiente, nunca em arquivo.

## Configuração de experimento

Ver `config/experiment.example.json` (modelo do piloto E2) e `config/experiments/`. Campos-chave:

- `mode`: `full` (D + RAG), `retrieval` (só expansão + busca) ou `retrieval_original_only` (R0 sem LLM).
- `arms` / `models`: ID exato do modelo. OpenAI aceita `temperature` e `reasoning_effort`; Anthropic aceita `effort`. Os modelos Claude atuais rejeitam `temperature`.
- `conditions`: subconjunto de `D, R0, R1, R2, R3`.
- `k`, `generation.max_output_tokens` e `expansion.max_output_tokens` são iguais para todas as condições do braço.
- `pricing`: tabela copiada das páginas oficiais na data da execução (`config/pricing.template.json`). Sem ela, o custo fica nulo.

## Garantias implementadas

| Regra | Onde |
|---|---|
| gerador recebe sempre a pergunta original | `pipelines.py` (`rag_user_prompt`) |
| orçamentos separados de expansão e geração, iguais entre estratégias | `RagChatPipeline` |
| falha de expansão recorre à consulta original e fica marcada (`fallback_*`) | `RagChatPipeline._expand` |
| tokens, latência, tentativas, modelo devolvido e `stop_reason` por etapa | `StepRecord` |
| sem retentativas ocultas do SDK nem fallback de modelo por recusa | `providers.py` |
| corpus e índice verificados por hash ao carregar | `ExactCosineRetriever.load` |
| ordem das condições aleatória por semente | `runner.py` |
| lote novo a cada execução; `raw.jsonl` somente leitura | `runner.py` |
| chamadas pagas exigem `--allow-api` e IDs reais | `Experiment._check_models` |

## Estrutura

```text
config/        corpus, embedder, experimentos, modelo de preços
prompts/       prompts literais versionados (o hash entra em cada registro)
src/rag_study/ corpus, retrieval, providers, pipelines, runner, evaluation, metrics, pricing, retry, cli
tests/         50 testes offline (nenhuma chamada de rede)
```

Decisões e justificativas: `research/notes/decisions-log.md`. Protocolo: `research/protocol/experimental-protocol-v0.2.md`.
