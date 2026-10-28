import json
import os
import stat

import pytest

from rag_study.evaluation import export_pool, load_qrels, load_records, retrieval_rows, summarize
from rag_study.runner import Experiment

PROMPTS = {
    "direct_answer": "direct-answer-system-v1.txt",
    "rag_answer": "rag-answer-system-v1.txt",
    "expansion_system": "common-expansion-system-v1.txt",
    "rewrite": "rewrite-clinical-v1.txt",
    "keywords": "keywords-v1.txt",
    "pseudo_document": "pseudo-document-v1.txt",
}


@pytest.fixture
def experiment(tmp_path, tiny_corpus, tiny_index):
    from pathlib import Path

    prompts_dir = Path(__file__).resolve().parents[1] / "prompts"
    questions = tmp_path / "questions.jsonl"
    questions.write_text("\n".join(json.dumps(q, ensure_ascii=False) for q in [
        {"question_id": "q1", "text": "baciloscopia negativa exclui?", "split": "smoke"},
        {"question_id": "q2", "text": "quanto tempo dura o tratamento?", "split": "smoke"},
        {"question_id": "q3", "text": "pergunta de teste", "split": "test"},
    ]), encoding="utf-8")
    config = {
        "experiment_id": "unit", "questions": str(questions), "splits": ["smoke"],
        "corpus_dir": str(tiny_corpus), "index_dir": str(tiny_index),
        "embedder": {"type": "hashing", "dimension": 64}, "prompts_dir": str(prompts_dir), "prompts": PROMPTS,
        "k": 2, "generation": {"max_output_tokens": 300}, "expansion": {"max_output_tokens": 100},
        "models": {"openai": {"provider": "openai", "model": "SET_EXACT_OPENAI_MODEL_ID"},
                   "anthropic": {"provider": "anthropic", "model": "SET_EXACT_ANTHROPIC_MODEL_ID"}},
        "arms": ["openai", "anthropic"], "conditions": ["D", "R0", "R1", "R2", "R3"],
        "repetitions": 2, "seed": 7, "output_root": str(tmp_path / "runs"),
    }
    path = tmp_path / "experiment.json"
    path.write_text(json.dumps(config), encoding="utf-8")
    return path


def test_dry_run_writes_complete_immutable_batch(experiment):
    out = Experiment(experiment, root="", dry_run=True).run()
    records = load_records([out / "raw.jsonl"])
    assert len(records) == 2 * 2 * 5 * 2  # questions x arms x conditions x repetitions
    assert {r["question_split"] for r in records} == {"smoke"}
    assert not os.stat(out / "raw.jsonl").st_mode & stat.S_IWRITE
    manifest = json.loads((out / "run-manifest.json").read_text(encoding="utf-8"))
    assert manifest["status"] == "completed" and manifest["n_records"] == 40
    assert set(manifest["prompts"]) == set(PROMPTS)
    assert manifest["environment"]["packages"]["numpy"]


def test_same_seed_gives_same_order(experiment):
    first = load_records([Experiment(experiment, root="", dry_run=True).run() / "raw.jsonl"])
    import time
    time.sleep(1.1)  # batch ids have one-second resolution
    second = load_records([Experiment(experiment, root="", dry_run=True).run() / "raw.jsonl"])
    key = lambda r: (r["order_index"], r["question_id"], r["condition"])
    assert [key(r) for r in first] == [key(r) for r in second]


def test_real_run_requires_model_ids_and_permission(experiment):
    with pytest.raises(ValueError, match="placeholder"):
        Experiment(experiment, root="").run()
    config = json.loads(experiment.read_text(encoding="utf-8"))
    config["models"]["openai"]["model"] = "gpt-real"
    config["models"]["anthropic"]["model"] = "claude-real"
    experiment.write_text(json.dumps(config), encoding="utf-8")
    with pytest.raises(PermissionError):
        Experiment(experiment, root="").run()


def test_retrieval_original_only_needs_no_models(experiment):
    config = json.loads(experiment.read_text(encoding="utf-8"))
    config["mode"] = "retrieval_original_only"
    experiment.write_text(json.dumps(config), encoding="utf-8")
    records = load_records([Experiment(experiment, root="").run() / "raw.jsonl"])
    assert len(records) == 2 * 2
    assert all(r["answer"] is None and r["mode"] == "retrieval" for r in records)


def test_pool_is_blind_and_evaluation_runs(experiment, tiny_corpus, tmp_path):
    out = Experiment(experiment, root="", dry_run=True).run()
    records = load_records([out / "raw.jsonl"])
    pool_path = tmp_path / "pool.csv"
    count = export_pool(records, {"q1": "a", "q2": "b"}, tiny_corpus, depth=2, seed=1, output_path=pool_path)
    header = pool_path.read_text(encoding="utf-8").splitlines()[0]
    assert "condition" not in header and "model" not in header
    assert count == len({(r["question_id"], c["chunk_id"]) for r in records if r["rag_enabled"]
                         for c in r["retrieved_chunks"]})

    qrels = tmp_path / "qrels.csv"
    qrels.write_text("question_id,item_id,relevance,annotator_id,annotation_round,notes\n"
                     "q1,tc-c0002,2,a1,final,\nq2,tc-c0000,2,a1,final,\n", encoding="utf-8")
    rows = retrieval_rows(records, load_qrels(qrels), k=2)
    assert rows and all(0.0 <= row["recall_at_k"] <= 1.0 for row in rows)
    assert {row["condition"] for row in summarize(rows)} >= {"R0-FAKEOPENAI", "R1-FAKEANTHROPIC"}


def test_duplicate_qrels_are_rejected(tmp_path):
    path = tmp_path / "q.csv"
    path.write_text("question_id,item_id,relevance\nq1,c1,1\nq1,c1,2\n", encoding="utf-8")
    with pytest.raises(ValueError, match="duplicate"):
        load_qrels(path)
