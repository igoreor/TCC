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

Nota sobre `e2-cli-smoke-claude/20261023T015057Z`: executado antes da correção do envio por stdin (D31); a pergunta chegou ao modelo com quebras CRLF. Não afeta seu uso como teste funcional.

Nenhum lote até aqui tem valor analítico: todos usaram perguntas smoke (teste funcional). Os lotes `-dryrun` têm texto simulado; o lote pela API paga não obteve resposta; os lotes `e2-cli-smoke-*` obtiveram respostas reais pela assinatura (D31) e serviram para calibrar D22.
