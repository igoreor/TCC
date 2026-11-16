"""Sorteio pré-especificado de perguntas: segunda anotação e segunda revisão (10) e passagem B (25).

Protocolo v0.4, seções 7 e 8: um segundo anotador rotula a relevância em 20% das
perguntas, e um segundo revisor avalia as respostas de 10 perguntas sorteadas.
O mesmo sorteio serve aos dois papéis. É feito antes de qualquer resultado,
com semente fixa, sobre o arquivo congelado de perguntas.

Uso (a partir de C:\\TCC):
    software/rag-study/.venv/Scripts/python -I software/rag-study/scripts/draw_second_rater_sample.py \
        research/questions/test-v1.jsonl 10 20261116 research/qrels/second-rater-sample-v1.json
"""

import hashlib
import json
import random
import sys
from pathlib import Path


def main(questions_path: str, n: str, seed: str, out_path: str) -> None:
    path = Path(questions_path)
    ids = [json.loads(line)["question_id"] for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    sample = sorted(random.Random(int(seed)).sample(sorted(ids), int(n)))
    out = Path(out_path)
    if out.exists():
        raise FileExistsError(f"{out} já existe; o sorteio não é refeito")
    out.parent.mkdir(parents=True, exist_ok=True)
    result = {"questions_file": path.as_posix(), "questions_sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
              "population": len(ids), "n": int(n), "seed": int(seed), "method": "random.Random(seed).sample(sorted(ids), n)",
              "sample": sample}
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main(*sys.argv[1:5])
