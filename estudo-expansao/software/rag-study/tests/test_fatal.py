import json
import os
import stat
from pathlib import Path

import pytest

from rag_study.providers import FakeProvider
from rag_study.retry import FatalProviderError, call_with_retry, is_fatal, is_retryable
from rag_study.runner import Experiment


class ApiError(Exception):
    def __init__(self, status_code, message, code=None):
        super().__init__(message)
        self.status_code = status_code
        self.code = code


def test_exhausted_credit_is_fatal_but_plain_rate_limit_is_transient():
    no_credit = ApiError(429, "You have no credits remaining", code="insufficient_quota")
    assert is_fatal(no_credit) and not is_retryable(no_credit)
    assert is_fatal(ApiError(400, "Your credit balance is too low to access the Anthropic API."))
    assert is_fatal(ApiError(401, "invalid api key")) and is_fatal(ApiError(404, "model not found"))
    assert not is_fatal(ApiError(429, "rate limit")) and is_retryable(ApiError(429, "rate limit"))


def test_fatal_error_is_not_retried():
    calls = []

    def fn():
        calls.append(1)
        raise ApiError(429, "no credits", code="insufficient_quota")

    with pytest.raises(FatalProviderError):
        call_with_retry(fn, max_attempts=3, sleep=lambda s: None)
    assert len(calls) == 1


def test_runner_aborts_batch_instead_of_logging_fallbacks(tmp_path, tiny_corpus, tiny_index, monkeypatch):
    prompts_dir = Path(__file__).resolve().parents[1] / "prompts"
    questions = tmp_path / "questions.jsonl"
    questions.write_text("\n".join(json.dumps({"question_id": f"q{i}", "text": f"pergunta {i}", "split": "smoke"})
                                   for i in range(3)), encoding="utf-8")
    config = {
        "experiment_id": "fatal", "questions": str(questions), "splits": ["smoke"],
        "corpus_dir": str(tiny_corpus), "index_dir": str(tiny_index),
        "embedder": {"type": "hashing", "dimension": 64}, "prompts_dir": str(prompts_dir),
        "prompts": {"direct_answer": "direct-answer-system-v1.txt", "rag_answer": "rag-answer-system-v1.txt",
                    "expansion_system": "common-expansion-system-v1.txt", "rewrite": "rewrite-clinical-v1.txt",
                    "keywords": "keywords-v1.txt", "pseudo_document": "pseudo-document-v1.txt"},
        "k": 2, "generation": {"max_output_tokens": 300}, "expansion": {"max_output_tokens": 100},
        "models": {"openai": {"provider": "openai", "model": "x"}}, "arms": ["openai"],
        "conditions": ["D", "R1"], "repetitions": 1, "seed": 1, "output_root": str(tmp_path / "runs"),
    }
    path = tmp_path / "experiment.json"
    path.write_text(json.dumps(config), encoding="utf-8")

    original = FakeProvider.generate
    calls = {"n": 0}

    def flaky(self, *args, **kwargs):
        calls["n"] += 1
        if calls["n"] > 2:
            raise ApiError(429, "You have no credits remaining", code="insufficient_quota")
        return original(self, *args, **kwargs)

    monkeypatch.setattr(FakeProvider, "generate", flaky)
    with pytest.raises(FatalProviderError):
        Experiment(path, root="", dry_run=True).run()
    batch = next((tmp_path / "runs" / "fatal").iterdir())
    manifest = json.loads((batch / "run-manifest.json").read_text(encoding="utf-8"))
    records = [json.loads(line) for line in (batch / "raw.jsonl").read_text(encoding="utf-8").splitlines()]
    assert manifest["status"] == "aborted"
    assert "credits" in manifest["abort_reason"]
    assert manifest["n_records"] == len(records) and all(r["status"] == "success" for r in records)
    assert not any(str(r.get("expansion_status", "")).startswith("fallback") for r in records)
    assert not os.stat(batch / "raw.jsonl").st_mode & stat.S_IWRITE


def test_continuation_completes_an_aborted_batch_without_repeating(tmp_path, tiny_corpus, tiny_index, monkeypatch):
    from rag_study.evaluation import load_records

    prompts_dir = Path(__file__).resolve().parents[1] / "prompts"
    questions = tmp_path / "questions.jsonl"
    questions.write_text("\n".join(json.dumps({"question_id": f"q{i}", "text": f"pergunta {i}", "split": "smoke"})
                                   for i in range(3)), encoding="utf-8")
    config = {
        "experiment_id": "cont", "questions": str(questions), "splits": ["smoke"],
        "corpus_dir": str(tiny_corpus), "index_dir": str(tiny_index),
        "embedder": {"type": "hashing", "dimension": 64}, "prompts_dir": str(prompts_dir),
        "prompts": {"direct_answer": "direct-answer-system-v1.txt", "rag_answer": "rag-answer-system-v1.txt",
                    "expansion_system": "common-expansion-system-v1.txt", "rewrite": "rewrite-clinical-v1.txt",
                    "keywords": "keywords-v1.txt", "pseudo_document": "pseudo-document-v1.txt"},
        "k": 2, "generation": {"max_output_tokens": 300}, "expansion": {"max_output_tokens": 100},
        "models": {"openai": {"provider": "openai", "model": "x"}}, "arms": ["openai"],
        "conditions": ["D", "R0", "R1"], "repetitions": 2, "seed": 4, "output_root": str(tmp_path / "runs"),
    }
    path = tmp_path / "experiment.json"
    path.write_text(json.dumps(config), encoding="utf-8")

    reference = load_records([Experiment(path, root="", dry_run=True).run() / "raw.jsonl"])
    expected_order = {(r["question_id"], r["condition"], r["repetition"]): r["order_index"] for r in reference}

    original = FakeProvider.generate
    calls = {"n": 0}

    def limited(self, *args, **kwargs):
        calls["n"] += 1
        if calls["n"] > 5:
            raise ApiError(429, "usage limit reached", code="insufficient_quota")
        return original(self, *args, **kwargs)

    monkeypatch.setattr(FakeProvider, "generate", limited)
    import time
    time.sleep(1.1)  # batch ids have one-second resolution
    with pytest.raises(FatalProviderError) as info:
        Experiment(path, root="", dry_run=True).run()
    first = Path(str(info.value).split("--continue-from ")[1])
    monkeypatch.setattr(FakeProvider, "generate", original)
    time.sleep(1.1)
    second = Experiment(path, root="", dry_run=True, continue_from=[first]).run()

    merged = load_records([first / "raw.jsonl", second / "raw.jsonl"])
    assert len(merged) == len(reference) == 3 * 3 * 2
    assert all(r["status"] == "success" for r in merged)
    assert {(r["question_id"], r["condition"], r["repetition"]): r["order_index"] for r in merged} == expected_order
    manifest = json.loads((second / "run-manifest.json").read_text(encoding="utf-8"))
    assert manifest["continues"][0]["batch_id"] == first.name
    assert manifest["n_skipped_already_done"] + manifest["n_records"] == len(reference)

    changed = dict(config, k=1)
    path.write_text(json.dumps(changed), encoding="utf-8")
    with pytest.raises(ValueError):
        Experiment(path, root="", dry_run=True, continue_from=[first]).run()


def test_manifest_records_hash_of_question_file(tmp_path, tiny_corpus, tiny_index):
    import hashlib

    prompts_dir = Path(__file__).resolve().parents[1] / "prompts"
    questions = tmp_path / "questions.jsonl"
    questions.write_text(json.dumps({"question_id": "q1", "text": "pergunta", "split": "smoke"}), encoding="utf-8")
    config = {
        "experiment_id": "hash", "questions": str(questions), "splits": ["smoke"], "mode": "retrieval_original_only",
        "corpus_dir": str(tiny_corpus), "index_dir": str(tiny_index), "embedder": {"type": "hashing", "dimension": 64},
        "prompts_dir": str(prompts_dir), "prompts": {}, "k": 2, "generation": {"max_output_tokens": 10},
        "models": {}, "arms": [], "conditions": ["R0"], "repetitions": 1, "seed": 1,
        "output_root": str(tmp_path / "runs"),
    }
    path = tmp_path / "experiment.json"
    path.write_text(json.dumps(config), encoding="utf-8")
    batch = Experiment(path, root="").run()
    manifest = json.loads((batch / "run-manifest.json").read_text(encoding="utf-8"))
    assert manifest["questions_sha256"] == hashlib.sha256(questions.read_bytes()).hexdigest()
