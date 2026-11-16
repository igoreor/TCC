# Protocolo experimental v0.4

**Status:** vigente desde 16/11/2026, quando o orientador aprovou a D42 (D44). Emenda 2 (D46, julgadores LLM) no fim do documento, pendente de aceite do orientador. Parte da v0.3 (mantida como histórico) e incorpora D35–D44 de `research/notes/decisions-log.md`. A mudança principal é a D42: o instrumento usa só perguntas publicadas, copiadas literalmente (seção 6). Também corrige pontos da v0.3 que já tinham sido decididos: limite de geração de 2.000 tokens (D22) e corte temporal (D38–D40). Métricas e testes estão definidos em `metrics-and-tests-v1.md`; a revisão das respostas, em `answer-review-rubric-v1.md`.

Data: 16/11/2026 (v0.3: 22/10/2026). Autor do TCC: Nathan Dalbert Lopes dos Santos.

**O que muda em relação à v0.3:**

| Seção | Mudança |
|---|---|
| 2 | H5 testada nos 4 pares de registro e, de forma exploratória, entre as 25 perguntas leigas e as 25 técnicas |
| 3 | perguntas publicadas (D42) no lugar de perguntas do autor |
| 4 | limite de geração de 2.000 tokens (D22, decidido em 23/10/2026) |
| 6 | matriz `blueprint-v4.csv`, origem `real` em todas as perguntas, seleção pelo agente por critérios fixos e confirmação pelo autor |
| 10 | análise por perfil de quem perguntou no lugar da análise por origem |
| 14 | esforço do autor sem a redação de perguntas |
| 15 | ameaças da seleção pelo agente e das perguntas institucionais |
| 17 | aprovação da D42 como critério |
| 18 | estrutura já adotada no capítulo 3 da versão (4) do manuscrito |

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
| **P2** (primária) | Dentro de cada provedor, a resposta com RAG (R0) cobre mais pontos-chave dos documentos da base que a resposta direta (D)? | H2: kp_coverage(R0) > kp_coverage(D) | F2 |
| S1 | A resposta com RAG tem menos falhas clínicas críticas que a resposta direta? E a expansão altera essa taxa? | H3: falha(R0) < falha(D) | F3 |
| S2 | O ganho de recuperação da melhor expansão (R\*) chega à resposta? | H4: kp_coverage(R\*) ≥ kp_coverage(R0); exploratória, porque R\* é escolhida nas mesmas perguntas (D34) | F4 |
| S3 | O ganho da expansão é maior em perguntas leigas que em técnicas? | H5: Δ(leigo) > Δ(técnico), nos 4 pares de registro (D42) e, sem pareamento, entre as 25 leigas e as 25 técnicas | exploratória |
| S4 | Custo, latência, truncamento, recusa e fallback por condição | descritiva | — |
| S5 | Nas perguntas parciais e não respondíveis, qual condição declara a insuficiência? | descritiva | — |
| S6 | Diferenças entre provedores na mesma condição | descritiva | — |

A hipótese H5 é o mecanismo que motiva o título: distância entre a linguagem do usuário e a do documento.

## 3. Desenho (D19, D34)

```
50 perguntas publicadas, literais (D42) + pontos-chave do autor (sem LLM) ──► congelamento (SHA-256)
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
| Limites | geração 2.000 tokens (D22, decidido em 23/10/2026 a partir dos smokes pela assinatura); expansão 400 tokens; JSON pedido na instrução de expansão (pelas CLIs não há saída estruturada imposta) |
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
| Claude | Claude Code CLI 2.1.323, cópia fixada em `software/tools` (D44) (`provider: claude_cli`), com o prompt de sistema do estudo, sem ferramentas e com limite de saída imposto | smoke 25/25 com a 2.1.126 (23/10); smoke `e5-cli-smoke-pinned` com a 2.1.323 (16/11) |
| GPT | Codex CLI 0.169.0-alpha.11.1, cópia fixada em `software/tools` (D44) (`provider: codex_cli`), com o prompt do estudo como única instrução, sem ferramentas (catálogo `tool_mode=direct`) e verbosidade `medium` | verificado por captura local (prompts byte a byte iguais, sem ferramentas), chamada real e smoke 25/25 |

Limitações:

- há uma sobrecarga fixa de cerca de 180 tokens no Claude Code, cujo conteúdo não é auditável;
- não há custo em dinheiro por chamada;
- os termos de uso não autorizam explicitamente lotes grandes (ver D31).

Os adaptadores de API continuam no harness para quem for replicar.

## 6. Perguntas (D34, D35–D37, D42)

- **Origem (D42, a aprovar):** as 50 perguntas são perguntas publicadas, copiadas literalmente do banco de 152 (`external-questions-candidates.csv`), com fonte e link. Nenhuma foi adaptada ou escrita pelo autor ou por modelo.
  - 18 são dúvidas de profissionais da atenção primária enviadas à Segunda Opinião Formativa (BVS APS): 7 de médicos, 6 de enfermeiros, 3 de agentes comunitários, 1 de fisioterapeuta e 1 sem profissão informada. O `selection-v4.md` conta 17, porque considera só as que informam a profissão.
  - 32 vêm de materiais institucionais: perguntas frequentes da SES-RJ (19), da Fiocruz (5) e do Ministério da Saúde (4), títulos de seção de publicação oficial do Ministério da Saúde (3) e uma "pergunta da semana" do TelessaúdeRS-UFRGS (1).
- **Seleção:** feita pelo agente (Claude Code, família avaliada) em 10/11/2026, por critérios fixos e nunca pelo desempenho esperado dos modelos (`research/questions/selection-v4.md`):
  - fora as duplicatas, as perguntas genéricas e as que dependem da página de origem;
  - prioridade para as dúvidas de profissionais;
  - uma pergunta por necessidade de informação, salvo os pares de registro;
  - mesma distribuição da matriz v3;
  - similaridade BGE-M3 entre perguntas abaixo de 0,90 (máximo observado: 0,84);
  - respondibilidade conferida por busca lexical BM25 nos cinco documentos, nunca pelo recuperador do experimento.
- **Confirmação:** o autor confirma cada pergunta preenchendo `author` em `authoring-sheet-v4.csv`; `questions-check` recusa pergunta sem esse campo. O viés residual da seleção pelo agente é declarado (seção 15).
- **Matriz:** `research/questions/blueprint-v4.csv`, refeita em torno das perguntas escolhidas.
  - 25 leigas e 25 técnicas, com 4 pares de registro (P01–P04).
  - 38 simples e 12 compostas.
  - 42 respondíveis, 3 parciais e 5 não respondíveis.
  - 10 categorias.
  - Os códigos de seção do PCDT levam o prefixo `PCDT:` (D42); os dos outros documentos, `EST:`, `OMS:`, `P47:` e `P51:` (D40).
- **Resposta de referência:** de 1 a 6 pontos-chave por pergunta, escritos pelo autor sem LLM, com a página do documento (`reading-pack-v4.md` traz os trechos). Nas parciais e não respondíveis, a parte ausente vira um ponto `INSUFICIENTE: ...`. Os dois itens de um par de registro têm exatamente os mesmos pontos-chave.
- **Corte temporal (D38–D40):** a base inclui as Portarias SCTIE/MS 47 e 51 de 2026. Nas perguntas sobre temas que elas alteraram (T03, qPCR; T11, segunda linha por evento adverso), o ponto-chave segue a norma mais recente, e a resposta que só traz a regra de 2022 não cobre esse ponto.
- **Revisão independente:** uma pessoa que não é o autor, de preferência profissional de saúde, revisa as perguntas e os pontos-chave sem a indicação de origem, antes do congelamento.
- **Validação e congelamento:** `questions-build --version v1` (gera `test-v1.jsonl` e `test-v1-keypoints.csv`, nomes já usados nas configurações das etapas 1 e 2) e `questions-check`, com hashes registrados em `freeze-log.md`. As perguntas são congeladas antes de qualquer execução da etapa 1. Roteiro: `roteiro-congelamento-e-execucao-v1.md`.
- **Perguntas smoke** (`smoke-v0`): proibidas no teste; servem só para teste funcional.

## 7. Relevância (qrels)

- **Pool:** `rag-study pool --target-sections --depth 5`. Une o top-5 de todas as condições e braços das duas etapas (R0, R1, R2, R3 e a recuperação de R\* na etapa 2) aos trechos das seções-alvo. É cego e embaralhado por semente. A anotação pode começar logo após a etapa 1, e os pares novos da etapa 2 são anotados num pool complementar.
- **Anotação:** rótulos 0/1/2 pelo guia v0.1, aplicados pelo autor.
- **Segunda anotação:** independente, nas 10 perguntas sorteadas em 16/11/2026 (`research/qrels/second-rater-sample-v1.json`, 155 pares). Kappa com peso linear antes da adjudicação. **Reserva (D45):** sem segunda pessoa até 27/11/2026, o autor reanota às cegas as mesmas 10 perguntas, com pelo menos 7 dias de intervalo, e a concordância intra-avaliador é relatada como limitação.
- **Exclusão:** perguntas com nenhum trecho relevante saem das métricas do recuperador. Espera-se que sejam as não respondíveis; qualquer outra é relatada.

## 8. Revisão das respostas (D23, D25)

- **Unidade:** repetição 0 de cada pergunta × braço × condição.
- **Passagem A:** 50 × 2 × 3 = 300 respostas.
- **Passagem B (D45):** respostas R0 e R\* de uma amostra de 50% das perguntas, sorteada antes da etapa 2 (25 perguntas, `research/review/pass-b-sample-v1.json`, semente 20261117): 100 respostas. Exportada com `review-export --pass-b-sample`.
- **Cegamento:** sem modelo nem condição nas planilhas; citações removidas na passagem A; ordem aleatória por semente. É parcial (estilo e extensão), o que é declarado.
- **Segundo revisor:** independente, nas mesmas 10 perguntas sorteadas (60 respostas A). Kappa quadrático para as escalas ordinais e simples para a falha crítica. **Reserva (D45):** a mesma regra intra-avaliador da segunda anotação.
- **LLM julgador:** opcional, de família diferente do gerador avaliado e calibrado contra a amostra humana. Nunca é desfecho primário.

## 9. Desfechos

### 9.1 Primários (D24, confirmados em 16/11/2026, D45)

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
  - H5: diferença de diferenças nos 4 pares, com IC por bootstrap, e diferença entre as médias do ganho nas leigas e nas técnicas (não pareada, IC por bootstrap); com 4 pares, a estimativa pareada é só descritiva;
  - perfil de quem perguntou (D42, substitui a análise por origem): dúvidas de profissionais da Segunda Opinião Formativa (18) × perguntas institucionais (32);
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
| Confirmação das perguntas e redação dos pontos-chave (D42) | 50 perguntas | 8–10 |
| Qrels (pool único, profundidade 5, mais seções-alvo) | ≈ 50 × 20 pares | 7 |
| Passagem A | 300 respostas | 15 |
| Passagem B | 200 respostas (ou 100) | 13 (ou 7) |
| Segundo revisor e segundo anotador | 60 respostas + 20% dos qrels | 5 |

## 15. Ameaças à validade e mitigação

| Ameaça | Mitigação |
|---|---|
| Perguntas escritas por quem conhece o corpus favoreceriam R0 (sobreposição lexical) | eliminada pela D42: todas as perguntas são publicadas e literais; a checagem de cópia continua como aviso |
| Seleção das perguntas pelo agente, de uma família avaliada (D42) | critérios fixos da vaga, nunca o desempenho esperado; respondibilidade por BM25, não pelo recuperador do experimento; confirmação pergunta a pergunta pelo autor; revisão independente; viés residual declarado |
| 32 das 50 perguntas vêm de material institucional, escrito para educar, e não de dúvidas espontâneas | prioridade às dúvidas de profissionais na seleção; análise exploratória por perfil de quem perguntou |
| Viés de seleção da estratégia | P1 testa as três estratégias com Holm, sem seleção. A escolha de R\* (regra pré-especificada D27) usa as mesmas perguntas, então a comparação R\* × R0 nas respostas (S2) é declarada exploratória (D34) |
| Recall relativo ao pool | pool com as seções-alvo, independente dos sistemas; `judged@k` relatado |
| Revisor não cego à presença de RAG | citações removidas na passagem A; o cegamento parcial é declarado; segundo revisor |
| Família do avaliador | Claude e GPT não redigem perguntas, pontos-chave nem rótulos (D15); o LLM julgador, se houver, não é primário |
| Não determinismo dos modelos | 1 repetição (D32): a variação entra no erro sem ser estimada; modelo devolvido registrado; repetição extra em amostra se houver folga |
| Atualização silenciosa do alias da OpenAI | data e `model` devolvido em cada registro; execução da etapa 2 concentrada em curto período |
| Corpus desatualizado (PCDT em revisão) | portarias de 2026 incluídas no corpus v2 (D38); prompt v2 manda seguir a norma brasileira mais recente (D39); corte temporal declarado |
| Documentos com funções diferentes no mesmo corpus (norma, estratégia, orientação internacional em inglês) | identificador do documento no contexto; pontos-chave distinguem norma nacional de recomendação internacional; análise exploratória por documento recuperado |
| Tabelas linearizadas no corpus | pontos-chave conferidos no PDF; limitação de D05 |
| Validade externa (cinco documentos oficiais, quatro em português e um em inglês; dois modelos) | delimitação explícita; nenhuma generalização para "literatura sobre hanseníase" |
| Sobreposição com o TCC do Igor | contribuição delimitada (seção 1); coautoria do NexoHansen a declarar nos dois trabalhos (D33) |

## 16. Ética e privacidade

São usados só documentos públicos e perguntas publicadas, sem dados pessoais. As chamadas aos modelos enviam a instrução, a pergunta e trechos de documentos públicos; nenhum manuscrito, dado pessoal ou chave vai para arquivo do workspace. Revisores e anotadores atuam como membros da equipe de pesquisa, julgando textos públicos; nenhum dado sobre eles é coletado além das iniciais que identificam cada avaliação, e a concordância mede a confiabilidade do instrumento. Por isso, o estudo não tem participantes de pesquisa e não foi submetido ao sistema CEP/Conep (D45). A participação é voluntária, com menção nos agradecimentos mediante consentimento.

## 17. Critérios antes da etapa 2

- [x] D42 (só perguntas publicadas) aprovada pelo orientador; perguntas confirmadas pelo autor em bloco (D44).
- [x] Desfechos primários (D24) e famílias confirmados (D45; o orientador pode rever).
- [x] As 50 perguntas congeladas, com hash no `freeze-log.md` (16/11/2026). Pontos-chave: congelar antes da etapa 2 (D44).
- [x] Smoke com os dois braços sem erro; D22 decidido (23/10/2026).
- [ ] Etapa 1 concluída, F1 analisada e R\* registrado.
- [x] Passagem B amostral decidida e sorteada (D45). [ ] Revisores definidos (reservas da D45 se não houver).
- [x] Versões das CLIs fixadas até o fim da etapa 2 (Claude Code 2.1.323 e Codex 0.169.0-alpha.11.1, cópias em `software/tools`, D44).
- [ ] Uso em lote confirmado com o administrador do plano Claude, se for institucional (D32).
- [ ] Idealmente, este protocolo registrado (OSF ou anexo datado ao TCC).

## 18. Relação com o manuscrito

O capítulo 3 das versões (4) a (7) do manuscrito segue a estrutura que a v0.3 sugeria: caracterização, desenho, base, recuperação, expansão, geração e modelos, perguntas, execução, avaliação da recuperação e das respostas, análise, reprodutibilidade, ameaças e ética. A partir da versão (6), a seção 3.7 e o Quadro 8 seguem a seção 6 deste protocolo, já aprovada.

## Emenda 1 (16/11/2026, D45)

Decisões tomadas pelo autor, por delegação ao agente, depois da etapa 1 e antes da etapa 2. Nenhuma altera o que a etapa 1 mediu:
- desfechos primários D24 e instrução de resposta v2 (D39) confirmados;
- passagem B amostral (seção 8), sorteada antes da etapa 2;
- regras de reserva para a segunda anotação e a segunda revisão (seções 7 e 8);
- texto de ética (seção 16);
- planilhas de relevância agrupadas por pergunta, com ordem aleatória dentro de cada uma (o cegamento quanto à condição não muda).

O orientador pode rever qualquer item antes da etapa 2.

## Emenda 2 (16/11/2026, D46): julgadores LLM no lugar da anotação e da revisão humanas

Pedido do autor, depois da etapa 1 e antes de qualquer rótulo de relevância. Substitui, nas seções 7, 8 e 14, o trabalho humano pelos julgadores abaixo. As perguntas continuam as 50 publicadas e congeladas; nenhum modelo as escreveu.

| Seção | Como era | Como fica |
|---|---|---|
| 7. Relevância | autor rotula o pool; segundo anotador em 10 perguntas | dois julgadores (Claude Opus 5.5 e GPT-6.1-sol, esforço médio) rotulam todos os pares, uma chamada por pergunta, com o guia de anotação como instrução. Rótulo final = média dos dois arredondada para baixo. A concordância entre os julgadores substitui a concordância entre anotadores |
| 6 e 12. Pontos-chave | autor redige; revisor independente confere | Claude Opus 5.5 redige a partir dos trechos julgados relevantes; GPT-6.1-sol verifica cada ponto; o agente consolida e registra cada edição. Congelados antes da etapa 2, sem que nenhum julgador tenha visto respostas |
| 8. Revisão das respostas | autor e segundo revisor, às cegas | julgador da outra família, às cegas, com a rubrica v1 adaptada aos cinco documentos e o material de referência (trechos julgados relevantes). Nas 10 perguntas da amostra do segundo avaliador, os dois julgadores avaliam todas as respostas (concordância entre julgadores) |
| 8. "LLM julgador nunca é desfecho primário" | regra do protocolo | revogada. Os desfechos primários P1 e P2 passam a ser medidos contra rótulos de julgadores LLM, o que o TCC declara como a principal limitação |
| 14. Esforço humano | cerca de 55 horas do autor | validação humana recomendada: 155 pares de relevância e 60 respostas das 10 perguntas sorteadas (cerca de 4 h 20 min). Se feita, relata-se a concordância humano × julgador; se não, a ausência de validação é declarada |

Prompts: `software/rag-study/prompts/judge-*-v1.txt`. Configuração: `software/rag-study/config/judges/judges-v1.json`. Lotes: `research/runs/j1-relevance-stage1/` e seguintes. O orientador precisa aceitar esta emenda; se recusar, a anotação humana volta a valer, e os rótulos dos julgadores ficam como análise de sensibilidade.

Execução da emenda (16/11/2026): relevância dos pools das etapas 1 e 2 (`j1`, `j5`), pontos-chave (`j2`, `j3`) e revisão (`j4`), todos concluídos. Duas adições à análise, feitas depois de ver os dados e declaradas como tais: a cobertura de pontos-chave com as 50 perguntas (sensibilidade) e a leitura da falha crítica e do suporte das citações só dentro de cada braço, porque a concordância entre os julgadores foi baixa nessas medidas (kappa 0,18 e 0,03). A F4 usa Holm sobre as 6 comparações (`research/analysis/stage2/F4.csv`).
