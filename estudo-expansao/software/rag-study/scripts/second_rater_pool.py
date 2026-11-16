"""Planilha do segundo anotador: as linhas do pool das perguntas sorteadas.

Protocolo v0.4, seção 7: o segundo anotador rotula, de forma independente, os
pares de 20% das perguntas (`second-rater-sample-v1.json`). A planilha sai do
pool ainda vazio, nunca da planilha preenchida pelo autor, e mantém a ordem
embaralhada e a numeração do pool.

Uso (a partir de C:\\TCC):
    software/rag-study/.venv/Scripts/python -I software/rag-study/scripts/second_rater_pool.py \
        research/qrels/pool-stage1-autor.csv research/qrels/second-rater-sample-v1.json research/qrels/pool-stage1-segundo.csv
"""

import csv
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from rag_study.questions import read_table  # noqa: E402


def main(pool_path: str, sample_path: str, out_path: str) -> None:
    sample = set(json.loads(Path(sample_path).read_text(encoding="utf-8"))["sample"])
    rows = read_table(pool_path)
    if any(row.get("relevance", "").strip() for row in rows):
        raise ValueError("o pool já tem rótulos; gere a planilha do segundo anotador a partir do pool vazio")
    selected = [row for row in rows if row["question_id"] in sample]
    out = Path(out_path)
    if out.exists():
        raise FileExistsError(f"{out} já existe")
    with open(out, "w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]), delimiter=";")
        writer.writeheader()
        writer.writerows(selected)
    print(json.dumps({"questions": len({row["question_id"] for row in selected}), "pairs": len(selected),
                      "pool_pairs": len(rows)}))


if __name__ == "__main__":
    main(*sys.argv[1:4])
