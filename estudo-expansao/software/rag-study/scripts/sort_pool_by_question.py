"""Reordena o pool de relevância por pergunta, com ordem aleatória dentro de cada pergunta.

O pool exportado por `rag-study pool` vem embaralhado entre todas as perguntas, o que obriga
quem anota a trocar de pergunta a cada linha. Agrupar por pergunta acelera a leitura sem
afetar o cegamento: a planilha continua sem condição nem modelo, e a ordem dos trechos dentro
de cada pergunta é sorteada por semente (D45). Os pares e o número `pool_item` não mudam.

Uso (a partir de C:\\TCC):
    software/rag-study/.venv/Scripts/python -I software/rag-study/scripts/sort_pool_by_question.py \
        research/qrels/pool-stage1-export.csv 20261116 research/qrels/pool-stage1-autor.csv
"""

import csv
import json
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from rag_study.questions import read_table  # noqa: E402


def main(pool_path: str, seed: str, out_path: str) -> None:
    rows = read_table(pool_path)
    if any(row.get("relevance", "").strip() for row in rows):
        raise ValueError("o pool já tem rótulos; reordene só o pool vazio")
    rng = random.Random(int(seed))
    by_question: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        by_question.setdefault(row["question_id"], []).append(row)
    ordered = []
    for question_id in sorted(by_question):
        items = sorted(by_question[question_id], key=lambda row: int(row["pool_item"]))
        rng.shuffle(items)
        ordered.extend(items)
    out = Path(out_path)
    if out.exists():
        raise FileExistsError(f"{out} já existe")
    with open(out, "w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]), delimiter=";")
        writer.writeheader()
        writer.writerows(ordered)
    print(json.dumps({"pairs": len(ordered), "questions": len(by_question)}))


if __name__ == "__main__":
    main(*sys.argv[1:4])
