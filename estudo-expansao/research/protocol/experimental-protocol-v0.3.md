# Protocolo experimental v0.3

**Status:** rascunho para revisão do autor e do orientador, não congelado. Substitui a v0.2, mantida como histórico, incorporando as decisões D18–D34 de `research/notes/decisions-log.md` (atualizado em 23/10/2026 para D31–D34: acesso pela assinatura, 1 repetição, autoria do NexoHansen e 50 perguntas sem conjunto dev). Métricas e testes estão definidos em `metrics-and-tests-v1.md`; a revisão das respostas, em `answer-review-rubric-v1.md`.

Data: 22/10/2026. Autor do TCC: Nathan Dalbert Lopes dos Santos.

## 1. Objeto e delimitação

O estudo avalia, em um corpus de documentos oficiais selecionados (corpus `hanseniase-v2`, D38: PCDT da Hanseníase 2022, Portarias SCTIE/MS 47 e 51 de 2026, Estratégia Nacional para Enfrentamento à Hanseníase 2024-2030 e orientação técnica da OMS de 2023), duas intervenções sobre modelos de linguagem:

1. **recuperação aumentada (RAG)** em comparação com a resposta direta do modelo;
2. **expansão semântica da consulta** antes da recuperação, em comparação com a consulta original.

**Relação com o NexoHansen (D18, D33).** O NexoHansen (repositório `github.com/igoreor/TCC`) foi, segundo o autor, desenvolvido em conjunto com Igor Emanuel Oliveira Rêgo. Ele é o artefato do TCC do Igor, que tem outra pergunta de pesquisa: desenvolvimento do sistema e avaliação com participantes. A coautoria precisa ser declarada nos dois trabalhos [DEFINIR APÓS ALINHAMENTO COM O IGOR E O ORIENTADOR]. Este estudo **não** usa o recuperador nem as regras de segurança do NexoHansen. Usa um harness próprio (`software/rag-study`), que permite isolar o efeito da expansão.

A contribuição própria deste TCC é:

- a expansão semântica, com três estratégias comparadas entre si e com a consulta original;
- a comparação entre dois provedores (OpenAI e Anthropic);
- a avaliação do recuperador com rótulos humanos em corpus paginado;
- a revisão cega das respostas com pontos-chave definidos antes da execução.

O estudo não avalia segurança para uso clínico real nem eficácia assistencial.

## 2. Perguntas e hipóteses

| Código | Pergunta | Hipótese (direção) | Família |
|---|---|---|---|
| **P1** (primária) | Dentro de cada provedor, cada estratégia de expansão (R1 reescrita, R2 termos, R3 pseudo-documento) recupera mais trechos relevantes que a consulta original (R0)? Qual é a melhor? | H1: Recall@5(Rj) > Recall@5(R0), j = 1, 2, 3 | F1 (6 comparações) |
| **P2** (primária) | Dentro de cada provedor, a resposta com RAG (R0) cobre mais pontos-chave do PCDT que a resposta direta (D)? | H2: kp_coverage(R0) > kp_coverage(D) | F2 |
| S1 | A resposta com RAG tem menos falhas clínicas críticas que a resposta direta? E a expansão altera essa taxa? | H3: falha(R0) < falha(D) | F3 |
| S2 | O ganho de recuperação da melhor expansão (R\*) chega à resposta? | H4: kp_coverage(R\*) ≥ kp_coverage(R0); exploratória, porque R\* é escolhida nas mesmas perguntas (D34) | F4 |
| S3 | O ganho da expansão é maior em perguntas leigas que em técnicas? | H5: Δ(leigo) > Δ(técnico), testado nos 11 pares de registro | exploratória |
| S4 | Custo, latência, truncamento, recusa e fallback por condição | descritiva | — |
| S5 | Nas perguntas parciais e não respondíveis, qual condição declara a insuficiência? | descritiva | — |
| S6 | Diferenças entre provedores na mesma condição | descritiva | — |

A hipótese H5 é o mecanismo que motiva o título: distância entre a linguagem do usuário e a do documento.

## 3. Desenho (D19, D34)

```
50 perguntas (autor, sem LLM) ──► congelamento (SHA-256)
        │
        ├─ ETAPA 1 — as 50, só recuperação, k=10, 1 repetição (D32)
        │     condições: R0 (original), R1 (reescrita), R2 (5 termos), R3 (pseudo-documento)
        │     expansores: gpt-6.1-sol e claude-sonnet-5-5 (assinatura, D31)
        │     ──► qrels ──► P1: R1, R2, R3 × R0 (F1, Holm)
        │     ──► select-strategy (D27) ──► R*
        │
        └─ ETAPA 2 — as 50, completo, k=5, 1 repetição (D32), executada uma vez
              condições: D (sem RAG), R0 (RAG), R* (RAG + melhor expansão)
              braços: GPT e Claude (cada modelo expande e responde no próprio braço, D09)
              ──► revisão cega A/B ──► métricas da resposta (P2, S1, S2 exploratória, S5)
```

## 4. Constantes

| Elemento | Valor |
|---|---|
| Corpus | `hanseniase-v2` (D38): 391 trechos de 5 documentos, snapshot `4c88c18d…`; inclui o `pcdt2022-v1` intacto (206 trechos, `f401426c…`) |
| Embedding | BGE-M3 denso, revisão `5617a9f6…`, CPU (D06) |
| Busca | exata por cosseno, desempate pela ordem do corpus (D07) |
| `k` | 5 no contexto do gerador; 10 na etapa 1 (só recuperação) |
| Formato do contexto | `[chunk:<id> document:<id>]` + texto, na ordem do ranking |
| Prompts | `rag-answer-system-v2` (divergência entre documentos, D39), `direct-answer-system-v1`, `common-expansion-system-v1`, `rewrite-clinical-v1`, `keywords-v1`, `pseudo-document-v1` (hash em cada registro) |
| Pergunta ao gerador | sempre a original (D12) |
| Limites | geração 800 tokens [calibrar, D22]; expansão 400 tokens; saída estruturada na expansão (D10) |
| Retentativas | até 3 para erros transitórios; erros de conta interrompem o lote (D30) |
| Ordem | aleatória por pergunta e repetição, semente registrada |

## 5. Modelos (D21)

| Braço | Modelo | Parâmetros | Observações |
|---|---|---|---|
| OpenAI | `gpt-6.1-sol` (Responses API) | `reasoning.effort=low`, `store=false`, sem `temperature` | sem snapshot datado publicado; registrar `model` devolvido |
| Anthropic | `claude-sonnet-5-5` (Messages API) | `output_config.effort=low`, sem `temperature`, sem fallback de recusa (D28) | ID sem data é snapshot fixo segundo a documentação |

Preços de lista arquivados em `config/pricing-2026-10-22.json` (US$ 2/MTok de entrada e 10/MTok de saída nos dois). O custo estimado não aplica desconto de cache, então é um limite superior.

**Forma de acesso (D31, escolha do autor em 22/10/2026):** os mesmos modelos são chamados pelas ferramentas oficiais dos planos de assinatura, e não pela API paga.

| Braço | Acesso | Situação |
|---|---|---|
| Claude | Claude Code CLI 2.1.126 (`provider: claude_cli`), com o prompt de sistema do estudo, sem ferramentas e com limite de saída imposto | verificado; smoke 25/25 |
| GPT | Codex CLI 0.162 (`provider: codex_cli`), com o prompt do estudo como única instrução, sem ferramentas (catálogo `tool_mode=direct`) e verbosidade `medium` | verificado por captura local (prompts byte a byte iguais, sem ferramentas), chamada real e smoke 25/25 |

Limitações:

- há uma sobrecarga fixa de cerca de 180 tokens no Claude Code, cujo conteúdo não é auditável;
- não há custo em dinheiro por chamada;
- os termos de uso não autorizam explicitamente lotes grandes (ver D31).

Os adaptadores de API continuam no harness para quem for replicar.

## 6. Perguntas (D20, D34)

- **Matriz:** `research/questions/blueprint-v3.csv` (D40), com 50 vagas, todas de teste e a mesma distribuição da v2. Quatro vagas apontam para os documentos novos (T08 e T16 para as portarias de 2026, T42 para a OMS, T45 para a Estratégia). A v1 tinha mais 15 de dev, retiradas em D34.
  - 25 leigas e 25 técnicas, com 11 pares de registro.
  - 35 simples e 15 compostas.
  - 42 respondíveis, 3 parciais e 5 não respondíveis.
  - 10 categorias.
- **Autoria:** o autor escreve sem LLM; um segundo revisor confere. Ver `AUTHORING-GUIDE.md`.
- **Resposta de referência:** de 1 a 6 pontos-chave por pergunta, com página do PDF.
- **Corte temporal (D29):** nenhuma pergunta respondível sobre temas alterados pelas Portarias SCTIE/MS 47 e 51 de 2026.
- **Validação e congelamento:** `questions-check`, com hashes registrados em `freeze-log.md`. As perguntas são congeladas antes de qualquer execução da etapa 1.
- **Perguntas smoke** (`smoke-v0`): proibidas no teste; servem só para teste funcional.

## 7. Relevância (qrels)

- **Pool:** `rag-study pool --target-sections --depth 5`. Une o top-5 de todas as condições e braços das duas etapas (R0, R1, R2, R3 e a recuperação de R\* na etapa 2) aos trechos das seções-alvo. É cego e embaralhado por semente. A anotação pode começar logo após a etapa 1, e os pares novos da etapa 2 são anotados num pool complementar.
- **Anotação:** rótulos 0/1/2 pelo guia v0.1, aplicados pelo autor.
- **Segunda anotação:** independente, em 20% das perguntas sorteadas. Kappa com peso linear antes da adjudicação.
- **Exclusão:** perguntas com nenhum trecho relevante saem das métricas do recuperador. Espera-se que sejam as não respondíveis; qualquer outra é relatada.

## 8. Revisão das respostas (D23, D25)

- **Unidade:** repetição 0 de cada pergunta × braço × condição.
- **Passagem A:** 50 × 2 × 3 = 300 respostas.
- **Passagem B:** respostas R0 e R\* = 200, ou amostra de 50% sorteada por pergunta [decidir antes da etapa 2].
- **Cegamento:** sem modelo nem condição nas planilhas; citações removidas na passagem A; ordem aleatória por semente. É parcial (estilo e extensão), o que é declarado.
- **Segundo revisor:** independente, nas 10 perguntas sorteadas (60 respostas A). Kappa quadrático para as escalas ordinais e simples para a falha crítica.
- **LLM julgador:** opcional, de família diferente do gerador avaliado e calibrado contra a amostra humana. Nunca é desfecho primário.

## 9. Desfechos

### 9.1 Primários (D24, a confirmar com o orientador)

| Pergunta | Desfecho | População |
|---|---|---|
| P1 | Recall@5, diferenças R1 − R0, R2 − R0 e R3 − R0 por braço (etapa 1; 6 comparações, Holm) | perguntas com ao menos um trecho relevante |
| P2 | `kp_coverage`, diferença R0 − D por braço | perguntas de teste respondíveis e parciais (45) |

### 9.2 Secundários e operacionais

Ver as famílias F3–F5 e as métricas em `metrics-and-tests-v1.md`. Os operacionais são tokens, custo, latência, tentativas, truncamento, recusa e fallback de expansão, por etapa e condição.

## 10. Análise estatística

- **Unidade:** pergunta. Repetições têm a média calculada antes da comparação.
- **Comparações:** pareadas, dentro do braço. Testes, IC e Holm conforme a seção 6 de `metrics-and-tests-v1.md`.
- **Bootstrap por grupo de necessidade:** os dois itens de um par de registro são reamostrados juntos.
- **Fallback de expansão (D14):** a análise principal é como executado. Sensibilidade sem os registros com `fallback_*`. A taxa de fallback é relatada por condição.
- **Dados ausentes:**
  - Registros com erro são relatados por condição.
  - Uma pergunta só entra numa comparação se tiver as duas condições.
  - Um lote interrompido por erro de conta ou limite do plano (D30) é completado com `run --continue-from` num lote novo, com a mesma configuração. A análise junta os lotes e usa o registro bem-sucedido de cada unidade.
- **Sensibilidades:** relevância estrita (rel = 2); Recall@10 (limite inferior, pool de profundidade 5); exclusão dos pares de registro (só perguntas independentes); análise por revisor.
- **Exploratórias:**
  - H5: diferença de diferenças nos 11 pares, com IC por bootstrap;
  - categorias;
  - provedores;
  - relação entre ganho de recuperação e ganho de resposta;
  - leitura qualitativa das perdas.

## 11. Tamanho da amostra e precisão

- O n é fixado pela viabilidade da revisão humana: 45 perguntas respondíveis ou parciais, mais 5 não respondíveis.
- Precisão esperada: com desvio-padrão das diferenças pareadas σ_d, a semiamplitude do IC 95% é ≈ 1,96 σ_d / √45.
  - σ_d = 0,25 dá ≈ ±0,07 em Recall@5 ou `kp_coverage`.
  - σ_d = 0,35 dá ≈ ±0,10.
- O σ_d observado é relatado com cada comparação.
- O estudo não foi dimensionado para detectar diferenças pequenas na taxa de falha crítica. F3 é interpretada pelo IC, não pelo p isolado.

## 12. Execução

A partir de `C:\TCC`, com `$R = "software\rag-study\.venv\Scripts\rag-study"` e `HF_HUB_OFFLINE=1`.

1. Perguntas: `questions-build`, `questions-check`, registro no `freeze-log.md`.
2. Smoke pela assinatura (feito em 22–23/10/2026): `e2-cli-smoke-claude.json` e `e2-cli-smoke-gpt.json`, 25/25 cada (D22, D31).
3. Etapa 1: `run --config software/rag-study/config/experiments/e3-stage1-test-retrieval.json --allow-api` (com `--continue-from <lote>` se o limite do plano interromper). Depois:
   - `pool --target-sections --depth 5`;
   - anotação;
   - `eval-retrieval --k 5`;
   - `compare` da família F1;
   - `select-strategy`.
4. Etapa 2: substituir `R_ESCOLHIDA` em `e4-stage2-test-full.json`, registrar no `freeze-log.md` e executar **uma vez** (com continuação, se necessário).
5. Pool complementar dos trechos novos de R\* da etapa 2 e anotação.
6. Revisão: `review-export --repetition 0`, revisão A/B, `review-import` e `agreement`.
7. Análise: `compare` por família (F1–F5), com `--questions` para o bootstrap por grupo e `--exclude-no-relevant` nas métricas do recuperador.

Cada lote é registrado em `research/runs/README.md`.

## 13. Orçamento (estimativa com os preços de 22/10/2026)

| Etapa | Chamadas aproximadas | Custo estimado |
|---|---|---|
| Smoke pela assinatura (5 perguntas, 5 condições, por braço) | 80 (feito) | sem custo em dinheiro |
| Etapa 1 (50 × 3 estratégias × 2 braços × 1 repetição, D32/D34) | 300 expansões | sem custo em dinheiro (assinatura, D31) |
| Etapa 2 (50 × 3 condições × 2 braços × 1 repetição, mais as expansões de R\*) | ≈ 400 | sem custo em dinheiro (assinatura, D31); pela API seria ≈ US$ 3 |
| **Total** | ≈ 780 chamadas | **sem custo em dinheiro pela assinatura**; ≈ US$ 5 se refeito pela API (preços de 22/10/2026) |

No acesso pela assinatura, o "custo" é o consumo do limite do plano; o Claude Code registra um custo equivalente de API apenas como referência (`api_equivalent_cost_usd`).

## 14. Esforço humano estimado

| Tarefa | Volume | Horas |
|---|---|---|
| Redação das perguntas e pontos-chave | 50 perguntas | 8–12 |
| Qrels (pool único, profundidade 5, mais seções-alvo) | ≈ 50 × 20 pares | 7 |
| Passagem A | 300 respostas | 15 |
| Passagem B | 200 respostas (ou 100) | 13 (ou 7) |
| Segundo revisor e segundo anotador | 60 respostas + 20% dos qrels | 5 |

## 15. Ameaças à validade e mitigação

| Ameaça | Mitigação |
|---|---|
| Perguntas escritas pelo mesmo autor que conhece o corpus favorecem R0 (sobreposição lexical) | proibição de copiar frases; pares leigo/técnico; revisão externa; análise por registro |
| Viés de seleção da estratégia | P1 testa as três estratégias com Holm, sem seleção. A escolha de R\* (regra pré-especificada D27) usa as mesmas perguntas, então a comparação R\* × R0 nas respostas (S2) é declarada exploratória (D34) |
| Recall relativo ao pool | pool com as seções-alvo, independente dos sistemas; `judged@k` relatado |
| Revisor não cego à presença de RAG | citações removidas na passagem A; o cegamento parcial é declarado; segundo revisor |
| Família do avaliador | Claude e GPT não redigem perguntas, pontos-chave nem rótulos (D15); o LLM julgador, se houver, não é primário |
| Não determinismo dos modelos | 1 repetição (D32): a variação entra no erro sem ser estimada; modelo devolvido registrado; repetição extra em amostra se houver folga |
| Atualização silenciosa do alias da OpenAI | data e `model` devolvido em cada registro; execução da etapa 2 concentrada em curto período |
| Corpus desatualizado (PCDT em revisão) | portarias de 2026 incluídas no corpus v2 (D38); prompt v2 manda seguir a norma brasileira mais recente (D39); corte temporal declarado |
| Documentos com funções diferentes no mesmo corpus (norma, estratégia, orientação internacional em inglês) | identificador do documento no contexto; pontos-chave distinguem norma nacional de recomendação internacional; análise exploratória por documento recuperado |
| Tabelas linearizadas no corpus | pontos-chave conferidos no PDF; limitação de D05 |
| Validade externa (um documento, português, dois modelos) | delimitação explícita; nenhuma generalização para "literatura sobre hanseníase" |
| Sobreposição com o TCC do Igor | contribuição delimitada (seção 1); coautoria do NexoHansen a declarar nos dois trabalhos (D33) |

## 16. Ética e privacidade

São usados só documentos públicos e perguntas sem dados pessoais. As chamadas às APIs enviam a pergunta, o prompt e os trechos do PCDT (documento público); nenhum manuscrito, dado pessoal ou chave vai para arquivo do workspace. Revisores e anotadores não são sujeitos de pesquisa; atuam como avaliadores. Confirmar com o orientador se a instituição exige algum registro.

## 17. Critérios antes da etapa 2

- [ ] Desfechos primários (D24) e famílias confirmados com o orientador.
- [ ] As 50 perguntas congeladas, com hash no `freeze-log.md`.
- [x] Smoke com os dois braços sem erro; D22 decidido (23/10/2026).
- [ ] Etapa 1 concluída, F1 analisada e R\* registrado.
- [ ] Revisores definidos; decisão sobre a passagem B completa ou amostral.
- [ ] Versões das CLIs fixadas até o fim da etapa 2 (Claude Code 2.1.126, Codex 0.162); uso em lote confirmado com o administrador do plano Claude, se for institucional (D32).
- [ ] Idealmente, este protocolo registrado (OSF ou anexo datado ao TCC).

## 18. Estrutura sugerida para o capítulo de Metodologia do manuscrito

A metodologia atual do manuscrito descreve LangChain, ChromaDB, Gemini e RAGAs, que não correspondem ao que será executado (ver `claude-code-handoff.md`). Sugestão de estrutura, para o autor decidir com o orientador:

1. **Caracterização da pesquisa:** aplicada, experimental, quantitativa com análise qualitativa das falhas.
2. **Corpus:** os 5 documentos oficiais e a função de cada um; critérios de inclusão e exclusão de páginas; extração e regras por diagramação; recorte das portarias no DOU; chunking; versão e hash (D01–D05, D29, D38).
3. **Arquitetura do pipeline:** embedding, busca exata, `k`, formato do contexto, prompts (D06, D07, D10, D12); figura do fluxo D/R0/R\*.
4. **Expansão semântica:** três estratégias, saída estruturada, regra de contingência (D14), seleção na etapa 1 (D27).
5. **Modelos e parâmetros:** tabela da seção 5; justificativa da faixa e do esforço (D21, D22, D28).
6. **Conjunto de perguntas:** matriz, autoria, revisão, pontos-chave, congelamento (D20).
7. **Procedimento experimental:** duas etapas, repetições, ordem aleatória, registro imutável (D16, D19, D23, D30).
8. **Avaliação:** relevância e métricas do recuperador; revisão cega e métricas da resposta; concordância (D25).
9. **Análise estatística:** famílias, testes, IC, Holm, sensibilidades.
10. **Reprodutibilidade:** hashes, ambiente travado, código e dados disponíveis.
11. **Ameaças à validade e ética.**
