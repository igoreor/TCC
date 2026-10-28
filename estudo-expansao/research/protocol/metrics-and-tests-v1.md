# Métricas e testes (v1)

Para: autor, orientador e quem for replicar o estudo. Data: 22/10/2026. Complementa `experimental-protocol-v0.3.md`.

Cada métrica tem nível, definição operacional, fórmula, comando que a calcula e uso no estudo. **Métricas do recuperador e da resposta nunca são misturadas**: as primeiras avaliam a lista de trechos; as segundas, o texto gerado.

## 1. Notação

| Símbolo | Significado |
|---|---|
| q | pergunta (unidade de análise) |
| top_k(q) | os k primeiros trechos recuperados para q, em ordem |
| rel(q, d) ∈ {0, 1, 2} | rótulo humano de relevância do trecho d para q (guia de anotação v0.1) |
| Rel(q) | {d : rel(q, d) ≥ 1}, os trechos relevantes de q |
| k | 5 no desfecho primário (tamanho do contexto do gerador); 10 como sensibilidade na etapa 1 |

## 2. Métricas do recuperador (somente condições RAG: R0, R1, R2, R3)

Calculadas por `rag-study eval-retrieval` (`src/rag_study/metrics.py`) para cada registro. Em seguida, faz-se a média das repetições dentro de pergunta × braço × condição. Perguntas com |Rel(q)| = 0 (as não respondíveis) **são excluídas** (`n_relevant = 0`; opção `--exclude-no-relevant`).

| Métrica | Fórmula | Faixa | Papel |
|---|---|---|---|
| **Recall@k** | \|Rel(q) ∩ top_k(q)\| / \|Rel(q)\| | 0–1 | **Desfecho primário de P1** (k = 5) |
| Precision@k | \|Rel(q) ∩ top_k(q)\| / k | 0–1 | secundário |
| MRR@k | média sobre q de 1 / posição do primeiro relevante em top_k (0 se nenhum) | 0–1 | secundário; desempate da regra D27 |
| nDCG@k | DCG@k / IDCG@k, com DCG = Σᵢ (2^rel(dᵢ) − 1) / log₂(i + 1) | 0–1 | secundário (usa a gradação 0/1/2) |
| Hit@k | 1 se \|Rel(q) ∩ top_k(q)\| ≥ 1, senão 0 | 0/1 | secundário |
| judged@k | fração de top_k(q) com rótulo | 0–1 | controle de qualidade: < 1 significa que as métricas são limite inferior |

- **Sensibilidade:** repetir com relevância estrita (rel = 2) e com k = 10 (etapa 1; limite inferior, porque o pool tem profundidade 5).
- **Recall relativo ao pool:** Rel(q) é a união do pool cego com os trechos das seções-alvo (seção 4). Trechos relevantes fora do pool não são conhecidos. Isso é declarado como limitação.

## 3. Métricas da resposta

### 3.1 Passagem A — revisão humana cega, todas as condições (D, R0, R\*)

Planilha `pass-a.csv` gerada por `rag-study review-export` e reunida por `review-import`. Rubrica completa em `answer-review-rubric-v1.md`.

| Métrica | Definição | Escala | Papel |
|---|---|---|---|
| **Cobertura de pontos-chave** (`kp_coverage`) | Σ sᵢ / (2n). Cada ponto-chave do autor recebe sᵢ: 2 = presente e correto, 1 = parcial, 0 = ausente, X = contradito (vale 0 e é contado à parte) | 0–1 | **Desfecho primário de P2** (perguntas respondíveis e parciais) |
| Contradição de ponto-chave | 1 se algum ponto foi marcado X | 0/1 | secundário |
| Correção global (`correctness`) | 1 incorreta ou contrária ao PCDT; 2 parcialmente correta com erro relevante; 3 correta com omissões menores; 4 correta e completa | ordinal 1–4 | secundário |
| **Falha clínica crítica** (`critical_failure`) | 1 se houver contradição clínica à diretriz, recomendação potencialmente perigosa, erro de dose/duração/número, troca de população ou inversão de negação | 0/1 | secundário principal (segurança) |
| Falhas tipificadas (`f_*`) | 9 marcas independentes (ver rubrica) | 0/1 cada | descritivo, por condição |
| Insuficiência (`insufficiency`) | adequada / ausente / indevida / na | nominal | taxas derivadas abaixo |

Taxas derivadas da insuficiência:

- **Declaração adequada** = adequada / (não respondíveis + parciais), por condição.
- **Recusa indevida** = indevida / respondíveis, por condição.

### 3.2 Passagem B — fidelidade e citações, só R0 e R\*

| Métrica | Definição | Escala |
|---|---|---|
| Fidelidade (`faithfulness`) | 2 todas as afirmações substantivas sustentadas pelo contexto; 1 alguma afirmação secundária sem suporte; 0 afirmação clinicamente relevante sem suporte ou contrária ao contexto | ordinal 0–2 |
| Suporte das citações (`citation_support`) | 2 afirmações relevantes citadas e as citações as sustentam; 1 parte das citações não sustenta ou falta citação; 0 sem citação ou citações que não sustentam | ordinal 0–2 |

### 3.3 Descritores automáticos (sem julgamento)

Calculados por `rag-study auto-metrics` (`src/rag_study/review.py`) para todas as repetições.

| Descritor | Definição |
|---|---|
| `has_citation` | a resposta RAG cita ao menos um identificador de trecho |
| `citation_validity` | citados que estão no contexto recuperado / total de citados (RAG) |
| `n_cited_not_retrieved` | identificadores citados que não estavam no contexto (citação inventada de formato) |
| `truncated` | geração terminou por limite de tokens |
| `refusal` | `stop_reason = refusal` |
| `insufficiency_cue` | heurística lexical de declaração de insuficiência; **validar contra o rótulo humano** (kappa) antes de usar |
| `answer_words`, `output_tokens`, `latency_ms`, `estimated_cost_usd` | operação |

`citation_validity` mede só se o identificador existe no contexto, não se sustenta a afirmação. Isso é papel da passagem B.

## 4. Relevância (qrels)

- **Pool cego** (`rag-study pool --target-sections`):
  - todos os trechos de top_k de todas as condições, braços e repetições;
  - mais todos os trechos das seções-alvo da pergunta, escolhidos independentemente dos sistemas;
  - sem identificar condição ou modelo, em ordem embaralhada por semente.
- **Profundidade:** 5 nas duas etapas (k = 5 é o contexto do gerador), num pool único das 50 perguntas (D34). A etapa 1 roda com k = 10 só para a sensibilidade Recall@10, que fica como limite inferior.
- **Rótulos:** 0/1/2 conforme o guia de anotação v0.1, aplicados pelo autor.
- **Dupla anotação:** 20% das perguntas, sorteadas por semente. Medir a concordância **antes** de qualquer adjudicação.

## 5. Concordância

`rag-study agreement` (`src/rag_study/analysis.py`, `cohen_kappa`):

| Dado | Estatística |
|---|---|
| relevância 0/1/2 | kappa de Cohen com peso linear e % de concordância |
| correção 1–4; fidelidade e citações 0–2 | kappa com peso quadrático |
| falha crítica; marcas `f_*` | kappa de Cohen simples |
| `insufficiency_cue` × rótulo humano | kappa simples, sensibilidade e especificidade |

A interpretação segue Landis e Koch como referência descritiva, sem limiar de aprovação automático. Discordâncias vão a adjudicação documentada.

## 6. Testes estatísticos

Implementados em `src/rag_study/analysis.py` e executados por `rag-study compare`. **Unidade:** pergunta. **Comparações:** sempre pareadas e dentro do braço (mesmo modelo). Diferença = condição B − condição A.

| Tipo de desfecho | Estimativa | IC 95% | Teste (bicaudal) |
|---|---|---|---|
| contínuo ou proporção (Recall@5, MRR@5, nDCG@5, `kp_coverage`) | média das diferenças pareadas | bootstrap percentil, 10.000 reamostragens, **por grupo de necessidade** (os 2 itens de um par de registro saem juntos) | permutação com troca de sinais; exata até 16 diferenças não nulas, senão 20.000 permutações com correção (b + 1)/(m + 1) |
| ordinal (correção, fidelidade, citações) | média e mediana das diferenças | idem | Wilcoxon de postos sinalizados (`scipy.stats.wilcoxon`, zeros descartados) |
| binário (falha crítica, contradição) | diferença de proporções | idem | McNemar exato (binomial nos pares discordantes); exige um valor 0/1 por pergunta, ou seja, a repetição 0 |

- **Multiplicidade:** Holm dentro de cada família pré-declarada (seção 7). Análises exploratórias não são ajustadas e são rotuladas como exploratórias.
- **Relato obrigatório:** n, média de cada condição, diferença, IC 95%, p bruto, p de Holm, vitórias/empates/derrotas por pergunta. Analisar qualitativamente as perguntas em que a condição "melhor" perdeu.
- **Sementes padrão:** 20261022 para bootstrap e permutação.

## 7. Famílias de comparação

| Família | Comparações | Desfecho | Teste | Nº |
|---|---|---|---|---|
| **F1 — P1 (primária)** | R1 − R0, R2 − R0 e R3 − R0 × {GPT, Claude} (etapa 1) | Recall@5 | permutação | 6 |
| **F2 — P2 (primária)** | R0 − D × {GPT, Claude} | `kp_coverage` | permutação | 2 |
| F3 — segurança | R0 − D e R\* − R0 × {GPT, Claude} | falha crítica | McNemar | 4 |
| F4 — resposta, secundária | R0 − D × {GPT, Claude} em correção; R\* − R0 × {GPT, Claude} em `kp_coverage` e correção (**exploratórias**: R\* é escolhida nas mesmas perguntas, D34) | ver coluna | permutação / Wilcoxon | 6 |
| F5 — recuperador, secundária | R1, R2, R3 − R0 × {GPT, Claude} em MRR@5, nDCG@5, Precision@5 (etapa 1) | ver coluna | permutação | 18 |
| Exploratória | interação registro (leigo − técnico) no ganho de cada estratégia; comparação direta entre R1, R2 e R3; categorias; provedores na mesma condição; insuficiência | ver protocolo | IC por bootstrap, sem p ajustado | — |

## 8. Regra de seleção da etapa 1

`rag-study select-strategy` (D27, D34): maior Recall@5 médio na etapa 1, nas mesmas 50 perguntas (média das repetições, depois das perguntas por braço, depois dos braços). Empate a até 0,01 é resolvido pelo maior MRR@5 e, persistindo, pela ordem R1 < R2 < R3. A saída JSON é arquivada.

## 9. Testes de software (`software/rag-study/tests`, 105 testes, sem rede)

Executar: `software\rag-study\.venv\Scripts\python -m pytest -q` (a partir de `software\rag-study`). Todos passam em 22/10/2026.

| Arquivo | Nº | O que garante |
|---|---|---|
| `test_corpus.py` | 10 | junção de corpora (hash conferido, registros preservados); níveis de título por tamanho e texto de destaque; hífen de compostos preservado; títulos numerados unidos e hierarquia pela numeração; limite de palavras e sobreposição dentro da seção; IDs de trecho determinísticos |
| `test_retrieval.py` | 6 | ida e volta do índice e ranking; desempate pela ordem do corpus; recusa corpus modificado ou embedder diferente; índice nunca sobrescrito |
| `test_prompts.py` | 10 | preenchimento do prompt; parsing da reescrita; exatamente 5 termos; JSON cercado aceito e marcado; prosa e chave errada rejeitadas; esquemas fechados por estratégia |
| `test_providers.py` | 6 | parâmetros enviados a cada API (sem `temperature` no Claude; esforço e saída estruturada); retentativas contadas |
| `test_pipelines.py` | 9 | gerador recebe sempre a pergunta original; orçamentos separados; fallback de expansão marcado; texto dos trechos fora do log |
| `test_runner.py` | 6 | lote imutável; ordem por semente; chamadas pagas exigem `--allow-api` e IDs reais; pool cego; qrels duplicados rejeitados |
| `test_fatal.py` | 5 | manifesto grava o hash do arquivo de perguntas; erro de conta (crédito, chave, modelo, limite do plano) não é retentado e interrompe o lote sem gerar fallback (D30); lote interrompido é completado por `--continue-from` sem repetir unidades e mantendo a ordem original |
| `test_cli_providers.py` | 9 | acesso por assinatura (D31), Claude Code e Codex: prompt do estudo substitui o da CLI; nenhuma ferramenta (item de ferramenta invalida a execução); pergunta por stdin em bytes; chaves de API fora do ambiente; limite de saída imposto e excesso registrado como truncamento; limite do plano é fatal |
| `test_metrics.py` | 5 | fórmulas do recuperador conferidas à mão |
| `test_questions.py` | 17 | seções-alvo com prefixo de documento (`EST:`, `OMS:`, `P47:`); pares com os mesmos pontos-chave; jargão em pergunta leiga; `selected_by`; busca BM25 para não respondíveis; regras de origem (real, adaptada, autor, sintética só com emenda e nunca de GPT ou Claude); cópia de frases e títulos do PCDT; composta com ≥ 2 pontos-chave; similaridade semântica; candidatas por categoria e sem temas alterados em 2026; estratos da matriz v2 (50 vagas: 25/25, 42/3/5, 15 compostas); v2 idêntica às vagas de teste da v1; pares coerentes; seções existentes no corpus; validação antes do congelamento; pool com seções-alvo |
| `test_review.py` | 4 | planilhas sem condição nem modelo; citações neutralizadas; pontuação de pontos-chave; reunião com a chave oculta |
| `test_analysis.py` | 10 | Holm, McNemar, permutação exata, bootstrap, kappa e regra D27 conferidos com valores calculados à mão |
| `test_serve.py` | 8 | serviço da tela do estudo (D41): condições na ordem fixa; respostas ao vivo só no registro de demonstração, nunca em `research/runs`; validação do pedido; uma comparação por vez; falha do provedor vira coluna de erro; lotes lidos só se configurados; recusa pedidos de navegador (`Origin`), exige o token quando definido e só escuta em 127.0.0.1 |

## 10. Verificações de reprodutibilidade

| Artefato | Como verificar |
|---|---|
| PDFs das fontes | SHA-256 de cada PDF checado pelo `build-corpus` (PCDT `1e2ee0c5…`; demais em `research/sources/README.md`) |
| corpus `hanseniase-v2` | `snapshot_sha256 = 4c88c18d…`; componentes conferidos por hash na junção; o PCDT (`f401426c…`) é reconstruível byte a byte |
| índice BGE-M3 | `embeddings_sha256 = 7f5d84f5…`; carregamento falha se divergir |
| perguntas e pontos-chave | SHA-256 impresso por `questions-check`, registrado em `freeze-log.md` |
| prompts | hash por prompt em cada registro e no manifesto |
| ambiente | `uv.lock` (hash no manifesto); versões de numpy, torch, transformers, openai e anthropic no manifesto |
| execução | `run-manifest.json`: configuração completa e hash, código-fonte (hash), semente, modelos pedidos e devolvidos, tabela de preços |
| análise | sementes fixas; saídas dos comandos nunca sobrescrevem arquivos existentes |
