# Dicionário de dados experimental v0.1

| Campo | Tipo | Descrição |
|---|---|---|
| `experiment_id` | string | versão lógica do experimento |
| `run_id` | UUID | execução individual |
| `question_id` | string | identificador estável da pergunta |
| `condition` | string | condição experimental |
| `original_query` | string | pergunta original sem alteração |
| `provider` | enum | `openai` ou `anthropic` |
| `model` | string | ID solicitado do modelo |
| `returned_model` | string/null | ID retornado pela API |
| `rag_enabled` | boolean | indica uso de recuperação |
| `expansion_strategy` | enum/null | `original`, `rewrite`, `keywords`, `pseudo_document` |
| `prompt_ids` | array | versões dos prompts utilizados |
| `prompt_hashes` | object | SHA-256 dos prompts |
| `expansion_raw` | string/null | saída integral do expansor |
| `expanded_query` | string/null | saída validada usada na recuperação |
| `retrieved_chunks` | array | ranking de chunks recuperados |
| `chunk_id` | string | identificador estável do chunk |
| `document_id` | string | documento de origem |
| `score` | number | escore bruto do recuperador |
| `answer` | string/null | resposta integral do gerador |
| `input_tokens` | integer/null | tokens informados pelo provedor |
| `output_tokens` | integer/null | tokens informados pelo provedor |
| `latency_ms` | number/null | tempo total observado |
| `request_ids` | array | IDs das requisições para auditoria |
| `status` | enum | `success` ou `error` |
| `error` | string/null | classe e mensagem do erro |
| `timestamp` | datetime | data/hora com fuso |
| `attempt` | integer | tentativa da mesma chamada |
| `estimated_cost` | decimal/null | custo calculado com tabela arquivada |
| `corpus_snapshot` | string | versão/hash do corpus |
| `index_version` | string | versão do índice |
| `software_version` | string | versão/commit do executor |

Campos de segredo, chaves de API e dados pessoais são proibidos.
