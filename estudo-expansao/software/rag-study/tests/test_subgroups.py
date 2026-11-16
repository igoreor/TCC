import csv
import json

import pytest

from rag_study.analysis import group_labels, subgroup_effects, unit_means
from rag_study.cli import main

# q1 (leigo) and q3 (técnico) form the planned register pair P1.
QUESTIONS = {
    "q1": {"register": "leigo", "need_group": "P1", "source_name": "BVS APS – SOF", "answerable_from_corpus": "sim"},
    "q2": {"register": "leigo", "need_group": "q2", "source_name": "Fiocruz", "answerable_from_corpus": "sim"},
    "q3": {"register": "técnico", "need_group": "P1", "source_name": "SES-RJ", "answerable_from_corpus": "sim"},
    "q4": {"register": "técnico", "need_group": "q4", "source_name": "BVS APS – SOF", "answerable_from_corpus": "não"},
}
# Differences R1 - R0: q1 = 1.0, q2 = 0.0, q3 = 0.0, q4 = 0.5.
ROWS = [
    {"question_id": "q1", "condition": "R0-RETRIEVAL-NONE", "recall_at_k": "0.0"},
    {"question_id": "q1", "condition": "R1-RETRIEVAL-OPENAI", "recall_at_k": "1.0"},
    {"question_id": "q2", "condition": "R0-RETRIEVAL-NONE", "recall_at_k": "0.5"},
    {"question_id": "q2", "condition": "R1-RETRIEVAL-OPENAI", "recall_at_k": "0.5"},
    {"question_id": "q3", "condition": "R0-RETRIEVAL-NONE", "recall_at_k": "1.0"},
    {"question_id": "q3", "condition": "R1-RETRIEVAL-OPENAI", "recall_at_k": "1.0"},
    {"question_id": "q4", "condition": "R0-RETRIEVAL-NONE", "recall_at_k": "0.0"},
    {"question_id": "q4", "condition": "R1-RETRIEVAL-OPENAI", "recall_at_k": "0.5"},
]
CLUSTERS = {qid: item["need_group"] for qid, item in QUESTIONS.items()}


def test_group_labels_with_prefix_map():
    labels = group_labels(QUESTIONS, "source_name", [("BVS APS", "profissional"), ("*", "institucional")])
    assert labels == {"q1": "profissional", "q2": "institucional", "q3": "institucional", "q4": "profissional"}
    assert group_labels(QUESTIONS, "register")["q3"] == "técnico"


def test_subgroup_means_contrast_and_pair():
    groups = group_labels(QUESTIONS, "register")
    results = subgroup_effects(unit_means(ROWS, "recall_at_k"), "openai", "R0", "R1", groups, CLUSTERS,
                               contrast=("leigo", "técnico"), n_boot=500, seed=1)
    by_kind = {(r["kind"], r["group"]): r for r in results}
    leigo, tecnico = by_kind[("subgroup", "leigo")], by_kind[("subgroup", "técnico")]
    assert leigo["mean_diff"] == pytest.approx(0.5) and leigo["n"] == 2
    assert tecnico["mean_diff"] == pytest.approx(0.25) and tecnico["n_clusters"] == 2
    contrast = by_kind[("contrast", "leigo - técnico")]
    assert contrast["mean_diff"] == pytest.approx(0.25)
    assert contrast["ci95_low"] <= contrast["mean_diff"] <= contrast["ci95_high"]
    # Bootstrap of two groups with values in [0, 1] stays within the possible range.
    assert -1.0 <= contrast["ci95_low"] and contrast["ci95_high"] <= 1.0
    pair = [r for r in results if r["kind"] == "pair"]
    assert len(pair) == 1 and pair[0]["group"] == "P1 (q1 - q3)"
    assert pair[0]["mean_diff"] == pytest.approx(1.0) and pair[0]["ci95_low"] is None


def test_constant_differences_give_degenerate_ci():
    groups = {"q1": "g", "q2": "g"}
    rows = [{"question_id": q, "condition": c, "m": v}
            for q in ("q1", "q2") for c, v in (("R0-X-NONE", "0.0"), ("R1-X-OPENAI", "0.2"))]
    (only,) = subgroup_effects(unit_means(rows, "m"), "openai", "R0", "R1", groups, n_boot=300, seed=2)
    assert (only["ci95_low"], only["mean_diff"], only["ci95_high"]) == pytest.approx((0.2, 0.2, 0.2))


def test_unknown_contrast_group_is_an_error():
    groups = group_labels(QUESTIONS, "register")
    with pytest.raises(ValueError, match="sem perguntas"):
        subgroup_effects(unit_means(ROWS, "recall_at_k"), "openai", "R0", "R1", groups,
                         contrast=("leigo", "outro"), n_boot=50)


def test_cli_subgroups_filters_and_writes_once(tmp_path, capsys):
    table = tmp_path / "per-question.csv"
    with open(table, "w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["question_id", "condition", "recall_at_k"])
        writer.writeheader()
        writer.writerows(ROWS)
    questions = tmp_path / "questions.jsonl"
    questions.write_text("".join(json.dumps({"question_id": q, **item}, ensure_ascii=False) + "\n"
                                 for q, item in QUESTIONS.items()), encoding="utf-8")
    out = tmp_path / "subgroups.csv"
    argv = ["subgroups", "--table", str(table), "--metric", "recall_at_k", "--comparison", "R0:R1",
            "--arms", "openai", "--questions", str(questions), "--group-by", "source_name",
            "--map", "BVS APS=profissional;*=institucional", "--answerable", "sim",
            "--n-boot", "200", "--out", str(out)]
    main(argv)
    printed = json.loads(capsys.readouterr().out)
    groups = {r["group"]: r for r in printed}
    # q4 is not answerable and is filtered out: "profissional" keeps only q1.
    assert groups["profissional"]["n"] == 1 and groups["profissional"]["mean_diff"] == pytest.approx(1.0)
    assert groups["institucional"]["mean_diff"] == pytest.approx(0.0)
    assert out.exists()
    with pytest.raises(FileExistsError):
        main(argv)
