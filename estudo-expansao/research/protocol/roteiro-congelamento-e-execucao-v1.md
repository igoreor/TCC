# Roteiro: do congelamento das perguntas à análise

Data: 16/11/2026. Referência: protocolo v0.4 (seções 6, 7, 8, 10 e 12) e `metrics-and-tests-v1.md`. Este roteiro não decide nada novo; só ordena os passos e dá os comandos.

**Situação em 16/11/2026:** a planilha `research/questions/authoring-sheet-v4.csv` já gera as 50 perguntas e passa nas checagens de formato. O `questions-check` só aponta o que depende do autor: autoria em 50 perguntas, pontos-chave em 45 e o ponto `INSUFICIENTE` nas 5 não respondíveis (teste feito numa pasta temporária, sem gravar nada em `research/`).

## Convenções

No PowerShell, a partir de `C:\TCC`:

```powershell
$env:PYTHONIOENCODING = "utf-8"; $env:HF_HUB_OFFLINE = "1"
$R = "software\rag-study\.venv\Scripts\rag-study"
```

- Lotes em `research/runs/` nunca são editados nem apagados. Cada lote novo entra em `research/runs/README.md`.
- Saídas de análise vão para `research/analysis/<etapa>/` (pasta nova). Os comandos se recusam a sobrescrever arquivos existentes.
- Chamadas aos modelos só com `--allow-api` (pelas assinaturas, D31).

## Fase 0 — o que precisa estar pronto antes (autor e orientador)

| # | Item | Quem | Onde |
|---|---|---|---|
| 0.1 | Aprovação da D42 (só perguntas publicadas) | orientador | `DUVIDAS.md`, item O1 |
| 0.2 | Confirmar cada pergunta: preencher `author` (iniciais) e `created_on` | autor | `authoring-sheet-v4.csv` |
| 0.3 | Pontos-chave: de 1 a 6 por pergunta, separados por barra vertical, com páginas em `reference_pages` | autor | idem; trechos em `reading-pack-v4.md`; passo a passo em `research/questions/GUIA-AUTOR-v4.md` |
| 0.4 | Parciais e não respondíveis: confirmar lendo os trechos e escrever o ponto `INSUFICIENTE: ...` | autor | `na-check-v4.md` |
| 0.5 | Revisão independente das perguntas e dos pontos-chave; preencher `reviewed_by` | revisor | planilha |
| 0.6 | Desfechos primários (D24) confirmados | orientador | protocolo v0.4, seção 9.1 |

A sintaxe exata dos pontos-chave está em `research/questions/AUTHORING-GUIDE.md`.

## Fase 1 — congelamento

```powershell
& $R --root . questions-build --sheet research/questions/authoring-sheet-v4.csv --out-dir research/questions --version v1
& $R --root . questions-check --questions research/questions/test-v1.jsonl --blueprint research/questions/blueprint-v4.csv `
    --keypoints research/questions/test-v1-keypoints.csv --forbidden research/questions/smoke-v0.jsonl `
    --corpus research/corpus/hanseniase-v2
```

- `--version v1` mantém os nomes `test-v1.jsonl` e `test-v1-keypoints.csv`, já usados nas configurações das etapas 1 e 2. É a primeira versão congelada do conjunto de teste; o "v4" da matriz é outra numeração.
- O `questions-check` precisa terminar com **0 erros**. Os avisos de 5 a 7 palavras iguais a um trecho da base são esperados em perguntas publicadas (a regra de cópia só gera erro em perguntas do autor) e devem ser citados no capítulo 4.3.
- Registrar em `freeze-log.md`: data, SHA-256 de `blueprint-v4.csv`, `test-v1.jsonl`, `test-v1-keypoints.csv` e das duas configurações (impressos pelo `questions-check` ou por `Get-FileHash`).
- Depois do congelamento, nada nesses arquivos muda. Uma correção gera `test-v2` e nova linha no registro.

## Fase 2 — etapa 1 (só recuperação)

```powershell
& $R --root . run --config software/rag-study/config/experiments/e3-stage1-test-retrieval.json --allow-api
# se o limite do plano interromper:
& $R --root . run --config software/rag-study/config/experiments/e3-stage1-test-retrieval.json --allow-api --continue-from research/runs/e3-stage1-test-retrieval/<lote>
```

São 300 expansões (50 perguntas × 3 estratégias × 2 expansores). Registrar o lote no `research/runs/README.md`.

### Relevância

```powershell
& $R --root . pool --runs research/runs/e3-stage1-test-retrieval/<lote>/raw.jsonl --questions research/questions/test-v1.jsonl `
    --corpus research/corpus/hanseniase-v2 --depth 5 --seed 20261116 --target-sections --out research/qrels/pool-stage1-autor.csv
```

- O autor rotula o pool (0, 1 ou 2) pelo `annotation-guideline-v0.1.md`, sem ver a condição.
- Um segundo anotador rotula 20% das perguntas, sorteadas. Concordância antes da adjudicação:

```powershell
& $R --root . agreement --first <rotulos-autor.csv> --second <rotulos-segundo.csv> --on question_id,item_id --column relevance --weights linear --categories 0,1,2
```

### Métricas, F1 e escolha de R\*

```powershell
& $R --root . eval-retrieval --runs research/runs/e3-stage1-test-retrieval/<lote>/raw.jsonl --qrels <qrels.csv> --k 5 --out research/analysis/stage1-k5
& $R --root . compare --table research/analysis/stage1-k5/retrieval-per-question.csv --metric recall_at_k `
    --comparisons R0:R1,R0:R2,R0:R3 --arms claude_cli,codex_cli --test permutation --family F1 `
    --questions research/questions/test-v1.jsonl --exclude-no-relevant --out research/analysis/stage1-k5/F1.csv
& $R --root . select-strategy --table research/analysis/stage1-k5/retrieval-per-question.csv --out research/analysis/stage1-k5/select-strategy.json
```

- F5 (secundária): o mesmo `compare` com `--metric rr_at_k`, `ndcg_at_k` e `precision_at_k`, família F5.
- Sensibilidades: `eval-retrieval --k 10` (limite inferior) e relevância estrita, conforme o protocolo.
- Registrar R\* no `freeze-log.md` e substituir `R_ESCOLHIDA` em `e4-stage2-test-full.json` **antes** da etapa 2.

### Emenda 2 (D46): julgadores LLM no lugar da anotação humana

Executado em 16/11/2026. Os braços se chamam `claude_cli` e `codex_cli` nas tabelas (nome do provedor).

```powershell
# relevância: dois julgadores, uma chamada por pergunta (lote em research/runs/j1-relevance-stage1/)
& $R --root . judge-relevance --pool research/qrels/pool-stage1-autor.csv --workers 6 --allow-api
# se o limite do plano interromper: o mesmo comando com --continue-from <lote(s) anterior(es)>
& $R --root . judge-relevance-collect --pool research/qrels/pool-stage1-autor.csv --batches <lotes> --name qrels-stage1
# pontos-chave: rascunho (Claude) e verificação (GPT)
& $R --root . judge-keypoints --questions research/questions/test-v1.jsonl --qrels research/qrels/qrels-stage1-final.csv `
    --sheet research/questions/authoring-sheet-v4.csv --judge claude --allow-api
& $R --root . judge-keypoints --task j3-keypoints-verify --questions research/questions/test-v1.jsonl `
    --sheet research/questions/authoring-sheet-v4.csv --judge gpt --verify-drafts <lote do rascunho> --allow-api
& $R --root . keypoints-report --questions research/questions/test-v1.jsonl --drafts <rascunho> --verifications <verificação> --out research/questions/keypoints-llm-v1-report.md
& $R --root . keypoints-build --drafts <rascunho> --edits research/questions/keypoints-llm-v1-edits.json `
    --out research/questions/test-v1-keypoints.csv --provenance research/questions/test-v1-keypoints-provenance.csv
```

Depois da etapa 2: pool complementar só com os pares novos (`pool ... --exclude research/qrels/qrels-stage1-final.csv`), `judge-relevance` nele, e a revisão:

```powershell
& $R --root . judge-review --review-dir research/review/stage2 --qrels <qrels finais das duas etapas> `
    --calibration-sample research/qrels/second-rater-sample-v1.json --workers 6 --allow-api
& $R --root . judge-review-collect --review-dir research/review/stage2 --batches <lotes A e B> `
    --calibration-sample research/qrels/second-rater-sample-v1.json --out-dir research/review/stage2-llm
& $R --root . review-import --pass-a research/review/stage2-llm/pass-a.csv --pass-b research/review/stage2-llm/pass-b.csv `
    --key research/review/stage2/review-key.csv --out research/analysis/stage2/review-per-answer.csv
```

## Fase 3 — etapa 2 (resposta completa, executada uma vez)

```powershell
& $R --root . run --config software/rag-study/config/experiments/e4-stage2-test-full.json --allow-api
```

Cerca de 400 chamadas. Depois, pool complementar só com os trechos de R\* ainda sem rótulo (mesmo comando `pool`, com o lote da etapa 2) e anotação.

### Revisão cega das respostas

```powershell
& $R --root . auto-metrics --runs research/runs/e4-stage2-test-full/<lote>/raw.jsonl --out research/analysis/stage2/auto-metrics.csv
& $R --root . review-export --runs research/runs/e4-stage2-test-full/<lote>/raw.jsonl --questions research/questions/test-v1.jsonl `
    --keypoints research/questions/test-v1-keypoints.csv --corpus research/corpus/hanseniase-v2 --repetition 0 --seed 20261117 `
    --out research/review/stage2
```

- `pass-a.csv` (300 respostas) e `pass-b.csv` (200, ou a amostra de 50% decidida pelo orientador) vão para os revisores. `review-key.csv` fica com o autor e não é aberto antes de terminar a revisão.
- Junção e concordância:

```powershell
& $R --root . review-import --pass-a <pass-a-preenchida.csv> --pass-b <pass-b-preenchida.csv> --key research/review/stage2/review-key.csv --reviewer <iniciais> --out research/analysis/stage2/review-per-answer.csv
& $R --root . agreement --first <revisor1.csv> --second <revisor2.csv> --on review_id --column correctness --weights quadratic --categories 1,2,3,4
```

## Fase 4 — análise

| Família | Comando |
|---|---|
| F2 (primária) | `compare --table research/analysis/stage2/review-per-answer.csv --metric kp_coverage --comparisons D:R0 --arms claude_cli,codex_cli --test permutation --family F2 --questions research/questions/test-v1.jsonl --only-questions research/questions/test-v1.jsonl --answerable sim,parcial` |
| F3 | `compare ... --metric critical_failure --comparisons D:R0,R0:<R*> --test mcnemar --family F3` |
| F4 (exploratória em R\*) | `compare ... --metric correctness --comparisons D:R0,R0:<R*> --test wilcoxon --family F4` e `--metric kp_coverage --comparisons R0:<R*> --test permutation` |

Executado em 16/11/2026 (emenda 2) com `bash software/rag-study/scripts/stage2_analysis.sh research/runs/j4-review-stage2-pass-a/20261116T190836Z research/runs/j4-review-stage2-pass-b/20261116T192153Z`. O script coleta os julgamentos (`judge-review-collect`), junta à chave (`review-import`, sem `--reviewer`, porque cada braço tem o seu julgador), calcula a concordância entre os julgadores e roda F2, F3, F4, a passagem B, a sensibilidade com as 50 perguntas e os subgrupos. A F4 sai em duas tabelas; o Holm sobre as 6 comparações está em `research/analysis/stage2/F4.csv`. Resumo: `research/analysis/stage2/README.md`.

### Exploratórias por subgrupo (comando `subgroups`, criado em 16/11/2026)

Diferença pareada B − A dentro de cada subgrupo, com IC por bootstrap; não calcula valor-p, porque essas análises são exploratórias.

```powershell
# H5 na etapa 1: ganho de R* sobre R0 em leigas x técnicas e nos 4 pares de registro
& $R --root . subgroups --table research/analysis/stage1-k5/retrieval-per-question.csv --metric recall_at_k --comparison R0:<R*> `
    --arms claude_cli,codex_cli --questions research/questions/test-v1.jsonl --group-by register --contrast leigo:técnico `
    --exclude-no-relevant --out research/analysis/stage1-k5/H5-register.csv
# perfil de quem perguntou: Segunda Opinião Formativa x material institucional
& $R --root . subgroups --table research/analysis/stage1-k5/retrieval-per-question.csv --metric recall_at_k --comparison R0:<R*> `
    --arms claude_cli,codex_cli --questions research/questions/test-v1.jsonl --group-by source_name `
    --map "BVS APS=profissional;*=institucional" --contrast profissional:institucional --exclude-no-relevant `
    --out research/analysis/stage1-k5/perfil.csv
# categoria
& $R --root . subgroups ... --group-by category --out research/analysis/stage1-k5/categoria.csv
```

As mesmas análises valem para `kp_coverage` na etapa 2 (com `--answerable sim,parcial` no lugar de `--exclude-no-relevant`).

## Fase 5 — escrita

As tabelas da seção 4.4 saem dos CSVs desta pasta. Os marcadores `[PREENCHER]` e os trechos em amarelo da versão (5) do manuscrito indicam onde entra cada número.
