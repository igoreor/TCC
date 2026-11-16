# Execuções

Cada lote fica em `<experimento>/<AAAAMMDDTHHMMSSZ>[-dryrun]/` com:

- `raw.jsonl`: um registro por pergunta × condição × repetição, com etapas, tokens, latência, modelo devolvido, ranking e hash do contexto. Campos em `research/protocol/data-dictionary-v0.1.md` e `software/rag-study/src/rag_study/models.py`.
- `run-manifest.json`: configuração completa e hash, versão do código, ambiente, corpus, índice, prompts, tabela de preços e contagens.

Ambos ficam somente leitura. **Nunca editar nem apagar**: correção = novo lote.

## Lotes

| Lote | Experimento | Natureza | Situação |
|---|---|---|---|
| `e1-smoke-retrieval-r0/20261003T201234Z` | R0 só recuperação, 25 perguntas smoke, k=10 | teste funcional, custo zero | substituído pelo lote seguinte (código anterior à última correção; rankings idênticos) |
| `e1-smoke-retrieval-r0/20261003T201503Z` | idem | teste funcional, custo zero | **atual** |
| `e1-smoke-dryrun-full/20261003T201319Z-dryrun` | todas as condições, provedores simulados | ensaio do pipeline | substituído (D sem `expansion_status`) |
| `e1-smoke-dryrun-full/20261003T201516Z-dryrun` | idem | ensaio do pipeline | **atual** |
| `e2-api-smoke/20261023T010256Z-dryrun` | `e2-api-smoke.json`, braço OpenAI, 5 perguntas smoke (`smoke-v0-pilot5`), 5 condições, provedores simulados | validação da configuração, custo zero | atual |
| `e2-api-smoke/20261023T010315Z` | idem, **API real** (`gpt-6.1-sol`, esforço `low`) | teste funcional | **falhou**: 25/25 registros com `429 insufficient_quota` (conta OpenAI sem crédito); nenhuma resposta gerada, custo zero. Código anterior a D30: houve 3 tentativas por chamada e as expansões ficaram como `fallback_api_error`. Sem valor analítico; repetir após inserir crédito |
| `e2-cli-smoke-claude/20261023T015057Z` | `e2-cli-smoke-claude.json`: Claude Sonnet 5.5 via Claude Code CLI (assinatura, D31), esforço `low`, 5 perguntas smoke, 5 condições, 1 repetição | teste funcional, sem custo em dinheiro | **sucesso**: 25/25 sem erro, 4 min. Expansões 15/15 com JSON válido. Gerações com `end_turn`, saída mediana de cerca de 850 tokens (máximo 1.585, incluindo raciocínio). 100% das citações RAG estavam no contexto. Base de D22 |
| `e2-cli-smoke-gpt/20261023T131207Z` | `e2-cli-smoke-gpt.json`: GPT-6.1 Sol via Codex CLI (plano ChatGPT Plus, D31), esforço `low`, verbosidade `medium`, 5 perguntas smoke, 5 condições, 1 repetição | teste funcional, sem custo em dinheiro | **sucesso**: 25/25 sem erro, 6 min, sem atingir o limite do plano. Expansões 15/15 com JSON válido. Saída mediana de 135–252 tokens por condição (máximo 565; raciocínio 0). 100% das citações RAG estavam no contexto. Pergunta enviada em bytes (sem CRLF) |
| `e1-smoke-retrieval-r0-v2/20261023T204026Z` | R0 só recuperação no corpus `hanseniase-v2` (D38), 25 perguntas smoke, k=10, sem LLM | teste funcional, custo zero | **sucesso**: 25/25. No top-5: 112 trechos do PCDT, 7 da Estratégia e 6 da OMS. Manifesto com `questions_sha256` |
| `e5-cli-smoke-pinned/20261116T134439Z` | `e5-cli-smoke-pinned.json`: os dois braços pela assinatura com as CLIs fixadas em `software/tools` (Claude Code 2.1.323, Codex 0.169.0-alpha.11.1; D44), parâmetros da etapa 2 (corpus `hanseniase-v2`, prompt RAG v2, k=5, 2.000 tokens), 5 perguntas smoke, 5 condições | teste funcional, sem custo em dinheiro | **sucesso**: 50/50 sem erro, cerca de 14 min. Expansões 30/30 válidas. Modelos devolvidos `claude-sonnet-5-5` e `gpt-6.1-sol`; gerações com `end_turn`/`completed`, sem truncamento. Saída mediana 938 tokens no Claude (máx. 1.620) e 248 no GPT (máx. 633), dentro do limite de 2.000. Citações no contexto: GPT 12/12; Claude 142/143. A exceção (R3, smoke-009) é um identificador escrito pelo modelo para dizer que um trecho "não consta", seguido dos trechos reais: na revisão das etapas, esse caso conta como citação inventada |
| `e3-stage1-test-retrieval/20261116T135604Z` | **Etapa 1** (`e3-stage1-test-retrieval.json`, SHA-256 do arquivo `bdef1c8c…`): 50 perguntas de teste congeladas (`test-v1.jsonl`, `13840869…`), R0 × R1 × R2 × R3, expansores Claude Sonnet 5.5 (Claude Code 2.1.323) e GPT-6.1 Sol (Codex 0.169.0-alpha.11.1) pela assinatura, CLIs fixadas (D44), k=10, 1 repetição, semente 20261101 | **dados do experimento** | **sucesso**: 350/350 registros sem erro (50 R0 + 300 expansões), 13:56–14:23 UTC de 16/11/2026 (27 min). Expansões 300/300 com JSON válido, nenhuma contingência e nenhuma retentativa. Latência mediana da expansão: 4,4 s no Claude e 6,1 s no GPT; saída mediana de 115 e 58,5 tokens. Modelos devolvidos `claude-sonnet-5-5` e `gpt-6.1-sol`. `raw.jsonl` `21d3d4c2…`. Pool cego de relevância: `research/qrels/pool-stage1-autor.csv` (797 pares) |

Nota sobre `e2-cli-smoke-claude/20261023T015057Z`: executado antes da correção do envio por stdin (D31); a pergunta chegou ao modelo com quebras CRLF. Não afeta seu uso como teste funcional.

Até 16/11/2026, só o lote da etapa 1 (`e3-stage1-test-retrieval/20261116T135604Z`) tem valor analítico; os demais usaram perguntas smoke (teste funcional). Os lotes `-dryrun` têm texto simulado; o lote pela API paga não obteve resposta; os lotes `e2-cli-smoke-*` obtiveram respostas reais pela assinatura (D31) e serviram para calibrar D22.
