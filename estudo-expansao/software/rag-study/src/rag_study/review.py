"""Blinded human review of answers and automatic answer descriptors.

Pass A (every condition): correctness against the author's key points,
clinical failures and handling of insufficiency. Citation markers are
removed so that the reviewer judges content, not the presence of sources.
Pass B (RAG conditions only): faithfulness to the retrieved context and
citation support, with the context shown under neutral labels [F1]..[Fk].

Condition, provider and model never appear in the sheets; they stay in a
separate key file that the reviewer must not open.
"""

from __future__ import annotations

import csv
import hashlib
import json
import random
import re
from collections import defaultdict
from pathlib import Path
from typing import Any

from .corpus import load_chunks
from .questions import MAX_KEY_POINTS, read_table, write_sheet

CHUNK_ID = re.compile(r"[a-z0-9]+-v\d+[a-z0-9]*-c\d{4}-[0-9a-f]{8}")
INSUFFICIENCY_CUES = re.compile(
    r"(contexto|trechos?|documentos?|fontes?)[^.]{0,80}(não|nao)\s+(contém|contem|apresenta|traz|menciona|informa|"
    r"aborda|permite|é suficiente|sao suficientes|são suficientes)|insufici[eê]n|não (há|consta|foi possível|é possível)"
    r" [^.]{0,40}(informação|informações|responder|dados)",
    re.IGNORECASE,
)

PASS_A_COLUMNS = (["review_id", "question_text", "expected_behaviour", "key_points", "answer_text"]
                  + [f"kp{i}" for i in range(1, MAX_KEY_POINTS + 1)]
                  + ["correctness", "critical_failure", "f_unsupported", "f_omission", "f_contradiction",
                     "f_dangerous", "f_invented_source", "f_negation", "f_number_dose", "f_population", "f_drift",
                     "insufficiency", "reviewer_id", "notes"])
PASS_B_COLUMNS = ["review_id", "question_text", "context", "answer_text", "faithfulness", "citation_support",
                  "reviewer_id", "notes"]
KEY_COLUMNS = ["review_id", "pass", "run_id", "question_id", "arm", "condition_base", "condition", "batch_id",
               "repetition", "answer_sha256"]
FAILURE_FLAGS = ["f_unsupported", "f_omission", "f_contradiction", "f_dangerous", "f_invented_source", "f_negation",
                 "f_number_dose", "f_population", "f_drift"]


def condition_base(record: dict[str, Any]) -> str:
    return str(record["condition"]).split("-", 1)[0]


def arm_of(record: dict[str, Any]) -> str:
    return record.get("provider") or record.get("expander_provider") or "none"


def neutral_citations(answer: str, retrieved_ids: list[str]) -> tuple[str, dict[str, str]]:
    """Replace corpus chunk identifiers with [F1], [F2]... following the order
    of the retrieved context, so labels match the context shown in pass B.
    Identifiers that were not retrieved get labels after the context ones."""
    labels = {chunk_id: f"F{n}" for n, chunk_id in enumerate(retrieved_ids, start=1)}
    text = answer
    for chunk_id in sorted(retrieved_ids, key=len, reverse=True):
        text = text.replace(chunk_id, labels[chunk_id])
    for found in CHUNK_ID.findall(text):
        labels.setdefault(found, f"F{len(labels) + 1}")
    text = CHUNK_ID.sub(lambda match: labels[match.group(0)], text)
    text = re.sub(r"chunk:\s*(F\d+)", r"\1", text)
    text = re.sub(r"\s*document:\s*[A-Za-z0-9_.\-]+", "", text)
    return text, labels


def strip_citations(text: str) -> str:
    text = re.sub(r"\s*\[(?:F\d+(?:\s*[,;]\s*)?)+\]", "", text)
    text = re.sub(r"\s*\((?:F\d+(?:\s*[,;]\s*)?)+\)", "", text)
    return re.sub(r"[ \t]+([.,;:])", r"\1", text)


def auto_answer_metrics(record: dict[str, Any]) -> dict[str, Any]:
    """Descriptors computed without judgment. ``insufficiency_cue`` is a
    lexical heuristic and must be checked against the human label before use."""
    answer = record.get("answer") or ""
    retrieved = [chunk["chunk_id"] for chunk in record.get("retrieved_chunks", [])]
    cited = list(dict.fromkeys(CHUNK_ID.findall(answer)))
    valid = [chunk_id for chunk_id in cited if chunk_id in retrieved]
    generation = [step for step in record.get("steps", []) if step.get("name") == "generation"]
    stop = generation[-1].get("stop_reason") if generation else None
    return {
        "run_id": record["run_id"],
        "question_id": record["question_id"],
        "arm": arm_of(record),
        "condition_base": condition_base(record),
        "repetition": record.get("repetition", 0),
        "status": record.get("status"),
        "answer_words": len(answer.split()),
        "has_citation": int(bool(cited)) if record.get("rag_enabled") else None,
        "n_cited": len(cited) if record.get("rag_enabled") else None,
        "citation_validity": (len(valid) / len(cited)) if record.get("rag_enabled") and cited else None,
        "n_cited_not_retrieved": len(cited) - len(valid) if record.get("rag_enabled") else None,
        "truncated": int(str(stop) in {"max_tokens", "max_output_tokens", "incomplete"}),
        "refusal": int(str(stop) == "refusal"),
        "insufficiency_cue": int(bool(INSUFFICIENCY_CUES.search(answer))),
        "output_tokens": record.get("output_tokens"),
        "latency_ms": record.get("latency_ms"),
        "estimated_cost_usd": record.get("estimated_cost_usd"),
    }


def _expected_behaviour(question: dict[str, Any]) -> str:
    return {
        "sim": "responder com base no PCDT 2022",
        "parcial": "responder a parte coberta e declarar o que falta",
        "não": "declarar que a informação não está disponível; não inventar",
    }.get(question.get("answerable_from_corpus", ""), "")


def export_review(records: list[dict[str, Any]], questions: dict[str, dict[str, Any]],
                  key_points: dict[str, list[str]], corpus_dir: str | Path, repetition: int, seed: int,
                  out_dir: str | Path) -> dict[str, int]:
    """Write ``pass-a.csv``, ``pass-b.csv`` and ``review-key.csv`` (kept from the reviewer)."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=False)
    chunks = {chunk["chunk_id"]: chunk for chunk in load_chunks(corpus_dir)}
    selected = [r for r in records if r.get("repetition", 0) == repetition and r.get("mode") != "retrieval"
                and r.get("answer") is not None and r["question_id"] in questions]
    seen: set[tuple[str, str, str]] = set()
    for record in selected:
        unit = (record["question_id"], arm_of(record), condition_base(record))
        if unit in seen:
            raise ValueError(f"mais de um registro para {unit} na repetição {repetition}; separe os lotes")
        seen.add(unit)

    rng = random.Random(seed)
    order_a = selected[:]
    rng.shuffle(order_a)
    order_b = [r for r in selected if r.get("rag_enabled")]
    rng.shuffle(order_b)
    ids = rng.sample(range(1000, 10000), len(order_a) + len(order_b))

    rows_a, rows_b, key = [], [], []
    for record in order_a:
        review_id = f"A{ids.pop()}"
        question = questions[record["question_id"]]
        retrieved = [chunk["chunk_id"] for chunk in record.get("retrieved_chunks", [])]
        neutral, _ = neutral_citations(record["answer"], retrieved)
        points = key_points.get(record["question_id"], [])
        rows_a.append({
            "review_id": review_id,
            "question_text": question["text"],
            "expected_behaviour": _expected_behaviour(question),
            "key_points": "\n".join(f"{n}. {point}" for n, point in enumerate(points, start=1)),
            "answer_text": strip_citations(neutral),
        })
        key.append(_key_row(review_id, "A", record))
    for record in order_b:
        review_id = f"B{ids.pop()}"
        retrieved = [chunk["chunk_id"] for chunk in record.get("retrieved_chunks", [])]
        neutral, labels = neutral_citations(record["answer"], retrieved)
        context = "\n\n".join(f"[{labels[chunk_id]}] (p. {chunks[chunk_id]['page_start']}) {chunks[chunk_id]['text']}"
                              for chunk_id in retrieved)
        rows_b.append({
            "review_id": review_id,
            "question_text": questions[record["question_id"]]["text"],
            "context": context,
            "answer_text": neutral,
        })
        key.append(_key_row(review_id, "B", record))

    write_sheet(rows_a, out_dir / "pass-a.csv", PASS_A_COLUMNS)
    write_sheet(rows_b, out_dir / "pass-b.csv", PASS_B_COLUMNS)
    with open(out_dir / "review-key.csv", "w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=KEY_COLUMNS)
        writer.writeheader()
        writer.writerows(key)
    return {"pass_a": len(rows_a), "pass_b": len(rows_b)}


def _key_row(review_id: str, review_pass: str, record: dict[str, Any]) -> dict[str, Any]:
    return {
        "review_id": review_id,
        "pass": review_pass,
        "run_id": record["run_id"],
        "question_id": record["question_id"],
        "arm": arm_of(record),
        "condition_base": condition_base(record),
        "condition": record["condition"],
        "batch_id": record.get("batch_id"),
        "repetition": record.get("repetition", 0),
        "answer_sha256": hashlib.sha256(record["answer"].encode("utf-8")).hexdigest(),
    }


def _binary(value: str, field: str, review_id: str) -> int:
    value = value.strip()
    if value not in {"0", "1"}:
        raise ValueError(f"{review_id}: {field} deve ser 0 ou 1, recebido {value!r}")
    return int(value)


def key_point_coverage(values: list[str]) -> tuple[float | None, int]:
    """Key point scores: 2 present and correct, 1 partial, 0 absent,
    X contradicted (scored 0 and flagged). Returns (coverage 0..1, contradicted)."""
    scores, contradicted = [], 0
    for value in values:
        value = value.strip().upper()
        if value == "":
            continue
        if value == "X":
            scores.append(0)
            contradicted += 1
        elif value in {"0", "1", "2"}:
            scores.append(int(value))
        else:
            raise ValueError(f"pontuação de ponto-chave inválida: {value!r}")
    return ((sum(scores) / (2 * len(scores))) if scores else None), contradicted


def import_review(pass_a_path: str | Path, key_path: str | Path, pass_b_path: str | Path | None = None,
                  reviewer: str | None = None) -> list[dict[str, Any]]:
    """Join the filled sheets back to the hidden key. One row per answer."""
    key = {row["review_id"]: row for row in read_table(key_path)}
    by_run: dict[str, dict[str, Any]] = defaultdict(dict)
    for row in read_table(pass_a_path):
        if reviewer and row.get("reviewer_id") != reviewer:
            continue
        if not row.get("correctness", "").strip():
            continue
        meta = key[row["review_id"]]
        coverage, contradicted = key_point_coverage([row.get(f"kp{i}", "") for i in range(1, MAX_KEY_POINTS + 1)])
        correctness = int(row["correctness"])
        if correctness not in (1, 2, 3, 4):
            raise ValueError(f"{row['review_id']}: correctness deve ser 1 a 4")
        flags = {flag: _binary(row.get(flag, "0") or "0", flag, row["review_id"]) for flag in FAILURE_FLAGS}
        insufficiency = row.get("insufficiency", "").strip()
        if insufficiency not in {"adequada", "ausente", "indevida", "na"}:
            raise ValueError(f"{row['review_id']}: insufficiency deve ser adequada, ausente, indevida ou na")
        by_run[meta["run_id"]].update({
            "run_id": meta["run_id"], "question_id": meta["question_id"], "arm": meta["arm"],
            "condition_base": meta["condition_base"], "reviewer_id_a": row.get("reviewer_id"),
            "kp_coverage": coverage, "kp_contradicted": contradicted, "correctness": correctness,
            "critical_failure": _binary(row["critical_failure"], "critical_failure", row["review_id"]),
            "any_failure": int(any(flags.values())), **flags, "insufficiency": insufficiency,
        })
    if pass_b_path:
        for row in read_table(pass_b_path):
            if reviewer and row.get("reviewer_id") != reviewer:
                continue
            if not row.get("faithfulness", "").strip():
                continue
            meta = key[row["review_id"]]
            faithfulness, support = int(row["faithfulness"]), int(row["citation_support"])
            if faithfulness not in (0, 1, 2) or support not in (0, 1, 2):
                raise ValueError(f"{row['review_id']}: faithfulness e citation_support devem ser 0, 1 ou 2")
            by_run[meta["run_id"]].update({"run_id": meta["run_id"], "question_id": meta["question_id"],
                                           "arm": meta["arm"], "condition_base": meta["condition_base"],
                                           "faithfulness": faithfulness, "citation_support": support})
    columns = list(dict.fromkeys(column for row in by_run.values() for column in row))
    return [{column: row.get(column) for column in columns} for row in by_run.values()]


def load_key_points(path: str | Path) -> dict[str, list[str]]:
    points: dict[str, list[tuple[int, str]]] = defaultdict(list)
    for row in read_table(path):
        points[row["question_id"]].append((int(row["key_point_n"]), row["key_point"]))
    return {qid: [text for _, text in sorted(items)] for qid, items in points.items()}


def load_question_map(paths: list[str | Path]) -> dict[str, dict[str, Any]]:
    questions = {}
    for path in paths:
        with open(path, encoding="utf-8") as handle:
            for line in handle:
                if line.strip():
                    item = json.loads(line)
                    questions[item["question_id"]] = item
    return questions
