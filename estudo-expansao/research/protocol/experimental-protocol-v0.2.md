# Protocolo experimental v0.2

**Status:** rascunho para revisão do autor e do orientador. Não congelado, não registrado. Substitui a v0.1 (mantida para histórico) incorporando as decisões de `research/notes/decisions-log.md`.

## 1. Perguntas de pesquisa

**P1 — Efeito da expansão na recuperação.** Dentro de cada braço de provedor, com corpus, recuperador, `k` e gerador constantes, as estratégias R1 (reescrita), R2 (termos) e R3 (pseudo-documento) recuperam trechos relevantes melhor que a consulta original (R0)?

**P2 — Efeito do RAG na resposta.** Dentro de cada braço, a resposta com RAG sem expansão (R0) é mais correta e tem menos falhas clinicamente relevantes que a resposta direta, sem recuperação (D)?

**Secundárias:**
- **S1.** Ganhos de recuperação de R1–R3 se traduzem em respostas melhores?
- **S2.** Custo, latência, taxa de fallback e de recusa por condição.
- **S3.** Diferenças entre provedores dentro da mesma condição (descritivas).
- **S4.** Variação por categoria clínica e por registro (leigo × técnico).

Hierarquia proposta [decidir]: P1 é a pergunta que corresponde ao título; P2 é coprimária. Cada uma forma uma família própria de comparações.

## 2. Condições

| Código | Recuperação | Consulta usada na busca | Gerador |
|---|---|---|---|
| D | não | — | modelo do braço |
| R0 | sim | original | modelo do braço |
| R1 | sim | reescrita clínica (`rewrite-clinical-v1`) | modelo do braço |
| R2 | sim | 5 termos (`keywords-v1`) | modelo do braço |
| R3 | sim | pseudo-documento ≤ 100 palavras (`pseudo-document-v1`) | modelo do braço |

Braços: OpenAI e Anthropic. Em cada braço, o mesmo modelo expande e responde (D09).

## 3. Constantes

| Elemento | Valor |
|---|---|
| Corpus | `pcdt2022-v1`, snapshot `f401426c28805ef5984de02210d0fa08b9ad1ec9ba1d0c8172a85404c655cc03`, 206 trechos |
| Embedding | BGE-M3 denso, revisão `5617a9f6…`, CPU |
| Índice | `pcdt2022-v1-bge-m3`, embeddings `7f5d84f5…`, busca exata cosseno |
| `k` | 5 [decidir; sensibilidade com 10 no modo só recuperação] |
| Contexto | `[chunk:<id> document:<id>]` + texto, em ordem de ranking |
| Prompt do gerador | `rag-answer-system-v1` (R0–R3) e `direct-answer-system-v1` (D) |
| Limites | geração 800 tokens; expansão 400 tokens; até 3 tentativas para erros transitórios |
| Pergunta ao gerador | sempre a original |
| Repetições | ≥ 3 por pergunta × condição no piloto; número final a partir da variância observada |
| Ordem | aleatória por pergunta e repetição, semente fixa registrada |

## 4. Perguntas

- **Splits:** `smoke` (teste funcional, sem análise), `dev` (piloto e ajuste de prompts), `test` (congelado, executado uma única vez).
- **Autoria:** autor e/ou especialista; nunca gerada pelos modelos avaliados (D15).
- **Estratificação:** categoria clínica (diagnóstico, tratamento, reações hansênicas, neuropatia/incapacidade, monitoramento, contatos/prevenção, epidemiologia, gestão/políticas) × registro (leigo, técnico) × complexidade (simples, composta).
- Incluir uma fração de perguntas **não respondíveis** pelo corpus v1, para medir a declaração de insuficiência.
- Esquema e modelo em `research/questions/README.md`.

## 5. Relevância (qrels)

1. Executar todas as condições RAG no conjunto a anotar.
2. Exportar o pool cego (`rag-study pool`, profundidade 10): união dos trechos, sem condição nem modelo, embaralhada.
3. Rótulos 0/1/2 conforme `annotation-guideline-v0.1.md`.
4. Dupla anotação independente de pelo menos 20% dos pares [decidir]; kappa ponderado; adjudicação documentada.
5. `Recall@k` é relativo ao pool; relatar a fração de itens julgados (`judged_at_k`).

## 6. Desfechos

**Recuperador (somente R0–R3):**
- **Primário proposto:** `Recall@5`, a fração dos trechos relevantes que chegam ao contexto do gerador. Justificativa: é o que limita a resposta em RAG.
- **Secundários:** `MRR@5`, `nDCG@5`, `Precision@5`, `Hit@5`.

**Resposta:**
- **Proposta para P2:** correção avaliada por revisor humano cego (escala da rubrica) e proporção de respostas com ao menos uma falha clínica crítica.
- **Secundários:** completude, relevância, fidelidade ao contexto (somente RAG), precisão e cobertura de citações (somente RAG), declaração adequada de insuficiência.

**Falhas clínicas**, registradas separadamente: informação não sustentada, omissão relevante, contradição à diretriz, recomendação perigosa, citação inventada, alteração de negação/número/população, deriva de doença ou intenção.

**Operação:** tokens por etapa, custo (tabela arquivada), latência por etapa, tentativas, fallback de expansão, recusa, truncamento.

## 7. Análise

- **Unidade:** pergunta. Repetições são promediadas dentro de pergunta × condição antes da comparação (sem pseudorreplicação).
- **P1:** diferenças pareadas R1–R3 menos R0 por braço; IC 95% por bootstrap pareado sobre perguntas; teste de permutação pareado; Holm dentro da família (3 estratégias × 2 braços = 6 comparações).
- **P2:** D × R0 por braço; desfecho binário de falha crítica com McNemar; escala ordinal com Wilcoxon pareado e diferença de medianas; Holm.
- **Fallback:** análise principal como executado; sensibilidade sem fallbacks (D14).
- **Tamanho amostral por precisão:** após o piloto, com o desvio-padrão das diferenças pareadas σ_d, n ≈ (1,96·σ_d / E)² para semiamplitude E desejada. E é decisão do autor/orientador.
- **Exploratório:** categoria, registro, provedor, relação entre ganho de recuperação e ganho de resposta. Relatar vitória/empate/derrota por pergunta e analisar qualitativamente as regressões.
- **LLM julgador:** opcional, de família diferente da do gerador avaliado, calibrado contra a amostra humana com concordância relatada; nunca padrão-ouro.

## 8. Critérios antes do teste final

- vigência do PCDT confirmada;
- decisões D01–D14 confirmadas;
- perguntas `dev` e `test` escritas, revisadas e congeladas (com hash);
- piloto `dev` executado; prompts congelados após o piloto (nova versão = novo ID);
- IDs de modelo, parâmetros e tabela de preços arquivados;
- avaliadores humanos confirmados e guia de anotação revisado;
- desfechos primários, `k` e plano de análise congelados (idealmente registrados em OSF).

## 9. Ética e privacidade

Somente documentos públicos e perguntas sem dados pessoais. As chamadas de API enviam pergunta, prompt e trechos do PCDT (documento público); nenhum manuscrito ou dado pessoal é enviado.
