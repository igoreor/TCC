"""Retriever-level evaluation and blinded pooling for relevance annotation.

Only retrieval metrics live here. Answer quality (correctness, faithfulness,
citations, clinical failures) is judged separately, by human reviewers first.
"""

from __future__ import annotations

import csv
import json
import random
from collections import defaultdict
from pathlib import Path
from statistics import mean
from typing import Any

from .corpus import load_chunks
from .metrics import (
    hit_at_k,
    judged_fraction_at_k,
    ndcg_at_k,
    precision_at_k,
    recall_at_k,
    reciprocal_rank_at_k,
)

POOL_COLUMNS = ["pool_item", "question_id", "question_text", "item_id", "section", "pages", "chunk_text",
                "relevance", "annotator_id", "annotation_round", "notes"]


def load_records(paths: list[str | Path]) -> list[dict[str, Any]]:
    """Read one or more batches. When batches continue each other
    (``run --continue-from``), each unit (question, condition, repetition)
    keeps its successful record; units that only failed keep their last error."""
    records = []
    for path in paths:
        with open(path, encoding="utf-8") as handle:
            records.extend(json.loads(line) for line in handle if line.strip())
    if len(paths) < 2:
        return records
    final: dict[tuple, dict[str, Any]] = {}
    for record in records:
        key = (record["experiment_id"], record["question_id"], record["condition"], record.get("repetition", 0))
        previous = final.get(key)
        if previous is not None and previous["status"] == "success" and record["status"] == "success":
            raise ValueError(f"duas execuções bem-sucedidas para {key}; lotes sobrepostos")
        if previous is None or record["status"] == "success" or previous["status"] != "success":
            final[key] = record
    return list(final.values())


def load_qrels(path: str | Path, annotation_round: str | None = None) -> dict[str, dict[str, int]]:
    """Read adjudicated labels ``question_id,item_id,relevance,...``.

    Exactly one label per (question, item) is required; filter by
    ``annotation_round`` when the file holds several rounds.
    """
    qrels: dict[str, dict[str, int]] = defaultdict(dict)
    with open(path, encoding="utf-8", newline="") as handle:
        for row in csv.DictReader(handle):
            if annotation_round is not None and row.get("annotation_round") != annotation_round:
                continue
            if row["relevance"].strip() == "":
                continue
            grade = int(row["relevance"])
            if grade not in (0, 1, 2):
                raise ValueError(f"relevance must be 0, 1 or 2: {row}")
            if row["item_id"] in qrels[row["question_id"]]:
                raise ValueError(f"duplicate label for {row['question_id']} / {row['item_id']}")
            qrels[row["question_id"]][row["item_id"]] = grade
    return dict(qrels)


def retrieval_rows(records: list[dict[str, Any]], qrels: dict[str, dict[str, int]], k: int) -> list[dict[str, Any]]:
    rows = []
    for record in records:
        retrieval_ok = any(step["name"] == "retrieval" and step["status"] == "success"
                           for step in record.get("steps", []))
        if not record.get("rag_enabled") or not retrieval_ok:
            continue
        relevance = qrels.get(record["question_id"])
        if relevance is None:
            continue
        ranking = [chunk["chunk_id"] for chunk in record["retrieved_chunks"]]
        rows.append({
            "question_id": record["question_id"],
            "condition": record["condition"],
            "expander_model": record.get("expander_model"),
            "repetition": record.get("repetition", 0),
            "batch_id": record.get("batch_id"),
            "expansion_status": record.get("expansion_status"),
            "n_relevant": sum(1 for grade in relevance.values() if grade > 0),
            "k": k,
            "precision_at_k": precision_at_k(ranking, relevance, k),
            "recall_at_k": recall_at_k(ranking, relevance, k),
            "rr_at_k": reciprocal_rank_at_k(ranking, relevance, k),
            "ndcg_at_k": ndcg_at_k(ranking, relevance, k),
            "hit_at_k": hit_at_k(ranking, relevance, k),
            "judged_at_k": judged_fraction_at_k(ranking, relevance, k),
        })
    return rows


def summarize(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Descriptive means per condition. Inferential comparisons (paired
    bootstrap, Holm correction) belong to the statistical analysis plan."""
    groups: dict[tuple[str, str | None], list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        groups[(row["condition"], row["expander_model"])].append(row)
    summary = []
    for (condition, expander), items in sorted(groups.items(), key=lambda pair: (pair[0][0], pair[0][1] or "")):
        summary.append({
            "condition": condition,
            "expander_model": expander,
            "n": len(items),
            "n_questions": len({item["question_id"] for item in items}),
            "fallback_runs": sum(1 for item in items if str(item["expansion_status"]).startswith("fallback")),
            **{f"mean_{metric}": round(mean(item[metric] for item in items), 4)
               for metric in ("precision_at_k", "recall_at_k", "rr_at_k", "ndcg_at_k", "hit_at_k", "judged_at_k")},
        })
    return summary


def write_csv(rows: list[dict[str, Any]], path: str | Path) -> None:
    if not rows:
        raise ValueError(f"nothing to write to {path}")
    with open(path, "w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def export_pool(records: list[dict[str, Any]], questions: dict[str, str], corpus_dir: str | Path, depth: int,
                seed: int, output_path: str | Path, extra_items: dict[str, list[str]] | None = None) -> int:
    """Union of the top-``depth`` chunks of every condition, deduplicated and
    shuffled, with no condition or model information (blind annotation).

    ``extra_items`` adds chunks chosen independently of any system (the
    chunks of each question's target sections), so that relevant chunks no
    condition retrieved can still be judged."""
    chunks = {chunk["chunk_id"]: chunk for chunk in load_chunks(corpus_dir)}
    pairs = sorted({
        (record["question_id"], chunk["chunk_id"])
        for record in records
        if record.get("rag_enabled")
        for chunk in record.get("retrieved_chunks", [])[:depth]
    } | {
        (question_id, chunk_id)
        for question_id, chunk_ids in (extra_items or {}).items()
        if question_id in questions
        for chunk_id in chunk_ids
    })
    random.Random(seed).shuffle(pairs)
    with open(output_path, "w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=POOL_COLUMNS)
        writer.writeheader()
        for number, (question_id, chunk_id) in enumerate(pairs, start=1):
            chunk = chunks[chunk_id]
            writer.writerow({
                "pool_item": number,
                "question_id": question_id,
                "question_text": questions.get(question_id, ""),
                "item_id": chunk_id,
                "section": " > ".join(chunk["section_path"]),
                "pages": f"{chunk['page_start']}-{chunk['page_end']}",
                "chunk_text": chunk["text"],
                "relevance": "",
                "annotator_id": "",
                "annotation_round": "",
                "notes": "",
            })
    return len(pairs)
