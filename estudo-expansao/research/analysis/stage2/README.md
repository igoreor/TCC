# Etapa 2: resultados (16/11/2026, emenda 2, D46)

Lote de respostas: `research/runs/e4-stage2-test-full/20261116T180025Z` (300/300). Revisão pelos julgadores: `research/runs/j4-review-stage2-pass-a/20261116T190836Z` (360/360) e `research/runs/j4-review-stage2-pass-b/20261116T192153Z` (132/132). Rótulos de relevância: `research/qrels/qrels-final-all.csv`. Comandos: `software/rag-study/scripts/stage2_analysis.sh <lote-pass-a> <lote-pass-b>` (coleta, importação, concordância e todas as comparações); a junção da F4 com Holm sobre 6 foi feita à parte, com `rag_study.analysis.holm`.

Cada resposta foi julgada pelo modelo da outra família (respostas do Claude pelo GPT-6.1-sol; respostas do GPT pelo Claude Opus 5.5). Por isso, **as comparações dentro de cada braço usam um único julgador**, e os níveis absolutos não são comparáveis entre os braços.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `review-per-answer.csv` | uma linha por resposta (300), passagem A e, na amostra, passagem B |
| `F2.csv` | família F2 (primária): cobertura de pontos-chave, R0 − D, 45 perguntas respondíveis ou parciais |
| `F3.csv` | família F3: falha crítica, R0 − D e R1 − R0, McNemar exato |
| `F4.csv` | família F4 com Holm sobre as 6 comparações (`F4-correctness.csv` e `F4-kp_coverage.csv` têm o Holm parcial de cada chamada; vale o de `F4.csv`) |
| `passB-*.csv` | passagem B, R1 − R0, 25 perguntas (descritiva) |
| `sens-kp_coverage-all.csv` | sensibilidade: cobertura com as 50 perguntas |
| `H5-register-kp-*.csv`, `perfil-kp-*.csv` | exploratórias por registro e perfil |
| `judge-agreement.json` | concordância entre os julgadores nas 10 perguntas da calibração |
| `auto-metrics.csv`, `auto-metrics-summary.csv` | descritores automáticos |
| `retrieval-k5/` | métricas do recuperador na etapa 2 e réplica R1 − R0 |

## Números principais

**F2 (primária), cobertura de pontos-chave, R0 − D, 45 perguntas:**
- Claude: 0,451 → 0,631, diferença +0,180 (IC 0,026 a 0,320), p 0,025, p Holm 0,050; G/E/P 28/9/8.
- GPT: 0,523 → 0,656, diferença +0,134 (IC −0,002 a 0,262), p 0,053, p Holm 0,053; G/E/P 28/6/11.
- O teste de permutação usa 20.000 permutações; o p ajustado do Claude (0,04999) está na fronteira de 5%, dentro do erro de Monte Carlo (cerca de ±0,002).
- Sensibilidade com as 50 perguntas: +0,232 (Holm 0,013) e +0,190 (Holm 0,017).

**F3, falha crítica:**
- Claude (julgado pelo GPT): D 50%, R0 30%, R1 24%. R0 − D −0,20 (IC −0,36 a −0,04, p 0,041, Holm 0,166).
- GPT (julgado pelo Claude): D 8%, R0 2%, R1 8%. Nenhuma diferença significativa.
- Nas 60 respostas da calibração, o GPT marcou falha crítica em 21 e o Claude em 3, sobre as mesmas respostas (kappa 0,18). A diferença de nível entre os braços é efeito do julgador.

**F4 (Holm sobre 6):**
- Correção R0 − D: Claude 2,08 → 2,70 (+0,62, Holm 0,008); GPT 2,48 → 3,00 (+0,52, Holm 0,028).
- Correção R1 − R0: Claude +0,08; GPT −0,02 (Holm 1,0).
- Cobertura R1 − R0: Claude 0,631 → 0,723 (+0,093, IC 0,009 a 0,181, p 0,048, Holm 0,193); GPT −0,020 (Holm 1,0).

**Passagem B (25 perguntas, R0 e R1):**
- Fidelidade média: Claude 1,20 e 1,08; GPT 1,32 e 1,48 (escala 0–2).
- Suporte das citações: Claude 1,72 e 1,72; GPT 1,92 e 1,88.
- Nenhuma diferença R1 − R0 significativa.

**Insuficiência:**
- Nas 8 perguntas parciais ou não respondíveis, a declaração foi adequada em 31 de 32 respostas com RAG (R0 e R1, nos dois braços), contra 2 de 16 na resposta direta. A direta não declarou em 14.
- Nas 42 respondíveis, "indevida" foi frequente nas respostas com RAG: Claude 25 (R0) e 22 (R1); GPT 16 e 16. O julgador vê como referência todos os trechos relevantes da base, e o modelo vê só os cinco recuperados; assim, "indevida" mistura falha de recuperação e cautela do modelo.

**Concordância entre julgadores (10 perguntas, 60 respostas na passagem A e 32 na B):**
- Pontos-chave: 94% de acordo, kappa 0,91 (simples) e 0,97 (quadrático); cobertura Spearman 0,95 (médias 0,56 e 0,54).
- Correção: kappa quadrático 0,85.
- Insuficiência: kappa 0,79.
- Falha crítica: kappa 0,18.
- Fidelidade: kappa quadrático 0,72.
- Suporte das citações: kappa quadrático 0,03 (59% de acordo; o Claude deu 2 em 30 de 32 e o GPT em 19).

**Recuperação na etapa 2 (47 perguntas, réplica):**
- R0 Recall@5 0,462.
- R1 Claude 0,480 (+0,017, p 0,73).
- R1 GPT 0,426 (−0,036, p 0,34).

**Descritores automáticos:**
- Nenhuma resposta foi truncada ou recusada.
- Nas respostas com RAG, 100% citaram e 100% das citações estavam no contexto.
- Palavras (mediana): Claude 276/282/268 (D/R0/R1); GPT 181/160/164.
