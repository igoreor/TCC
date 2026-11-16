#!/usr/bin/env bash
# Análises da etapa 2 (emenda 2, D46). Uso: bash stage2_analysis.sh <lote-pass-a> [<lote-pass-a-continuação>...] -- <lote-pass-b> [...]
set -euo pipefail
cd /c/TCC
export PYTHONIOENCODING=utf-8 HF_HUB_OFFLINE=1
R="software/rag-study/.venv/Scripts/rag-study --root ."
PY=software/rag-study/.venv/Scripts/python
Q=research/questions/test-v1.jsonl
OUT=research/analysis/stage2
T=$OUT/review-per-answer.csv
BATCHES=("$@")

[ -f research/review/stage2-llm/pass-a.csv ] || $R judge-review-collect --review-dir research/review/stage2 --batches "${BATCHES[@]}" \
  --calibration-sample research/qrels/second-rater-sample-v1.json --out-dir research/review/stage2-llm 2>&1 | grep -v "Loading weights"
$R review-import --pass-a research/review/stage2-llm/pass-a.csv --pass-b research/review/stage2-llm/pass-b.csv \
  --key research/review/stage2/review-key.csv --out $T 2>&1 | grep -v "Loading weights"
$PY software/rag-study/scripts/judge_agreement.py research/review/stage2-llm $OUT/judge-agreement.json > /dev/null

ARMS=claude_cli,codex_cli
# F2 (primária): cobertura de pontos-chave, R0 - D, perguntas respondíveis ou parciais
$R compare --table $T --metric kp_coverage --comparisons D:R0 --arms $ARMS --test permutation --family F2 \
  --questions $Q --only-questions $Q --answerable sim,parcial --out $OUT/F2.csv 2>&1 | grep -v "Loading weights" > /dev/null
# F3: falha crítica, R0 - D e R1 - R0
$R compare --table $T --metric critical_failure --comparisons D:R0,R0:R1 --arms $ARMS --test mcnemar --family F3 \
  --questions $Q --out $OUT/F3.csv 2>&1 | grep -v "Loading weights" > /dev/null
# F4: correção (R0 - D, R1 - R0) e cobertura (R1 - R0); Holm sobre as 6 comparações, juntadas abaixo
$R compare --table $T --metric correctness --comparisons D:R0,R0:R1 --arms $ARMS --test wilcoxon --family F4 \
  --questions $Q --out $OUT/F4-correctness.csv 2>&1 | grep -v "Loading weights" > /dev/null
$R compare --table $T --metric kp_coverage --comparisons R0:R1 --arms $ARMS --test permutation --family F4 \
  --questions $Q --only-questions $Q --answerable sim,parcial --out $OUT/F4-kp_coverage.csv 2>&1 | grep -v "Loading weights" > /dev/null
# Passagem B (descritiva e R1 - R0 nas 25 perguntas da amostra)
for m in faithfulness citation_support; do
  $R compare --table $T --metric $m --comparisons R0:R1 --arms $ARMS --test wilcoxon --family passB \
    --questions $Q --out $OUT/passB-$m.csv 2>&1 | grep -v "Loading weights" > /dev/null
done
# Sensibilidade: correção com todas as perguntas já está acima; cobertura com todas as perguntas
$R compare --table $T --metric kp_coverage --comparisons D:R0,R0:R1 --arms $ARMS --test permutation --family sens-all \
  --questions $Q --out $OUT/sens-kp_coverage-all.csv 2>&1 | grep -v "Loading weights" > /dev/null
# Exploratórias por subgrupo (cobertura)
for cmp in D:R0 R0:R1; do
  tag=${cmp/:/-}
  $R subgroups --table $T --metric kp_coverage --comparison $cmp --arms $ARMS --questions $Q --group-by register \
    --contrast leigo:técnico --answerable sim,parcial --out $OUT/H5-register-kp-$tag.csv 2>&1 | grep -v "Loading weights" > /dev/null
  $R subgroups --table $T --metric kp_coverage --comparison $cmp --arms $ARMS --questions $Q --group-by source_name \
    --map "BVS APS=profissional;*=institucional" --contrast profissional:institucional --answerable sim,parcial \
    --out $OUT/perfil-kp-$tag.csv 2>&1 | grep -v "Loading weights" > /dev/null
done
echo done
