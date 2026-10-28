import json
import threading
import urllib.error
import urllib.request
from pathlib import Path

import pytest

from rag_study.runner import Experiment
from rag_study.serve import BusyError, NotFoundError, StudyService, make_server

PROMPTS_DIR = Path(__file__).resolve().parents[1] / "prompts"
PROMPTS = {
    "direct_answer": "direct-answer-system-v1.txt",
    "rag_answer": "rag-answer-system-v2.txt",
    "expansion_system": "common-expansion-system-v1.txt",
    "rewrite": "rewrite-clinical-v1.txt",
    "keywords": "keywords-v1.txt",
    "pseudo_document": "pseudo-document-v1.txt",
}


def _base_config(tmp_path, tiny_corpus, tiny_index):
    return {
        "experiment_id": "demo", "corpus_dir": str(tiny_corpus), "index_dir": str(tiny_index),
        "embedder": {"type": "hashing", "dimension": 64}, "prompts_dir": str(PROMPTS_DIR), "prompts": PROMPTS,
        "k": 2, "generation": {"max_output_tokens": 300},
        "expansion": {"max_output_tokens": 100, "structured_output": True},
        "models": {"openai": {"provider": "codex_cli", "model": "gpt-real"},
                   "anthropic": {"provider": "claude_cli", "model": "claude-real"}},
        "arms": ["openai", "anthropic"], "conditions": ["D", "R0", "R1", "R2", "R3"],
        "seed": 1, "output_root": str(tmp_path / "runs"), "demo_log_dir": str(tmp_path / "demo"),
    }


@pytest.fixture
def recorded_batch(tmp_path, tiny_corpus, tiny_index):
    questions = tmp_path / "questions.jsonl"
    questions.write_text(json.dumps({"question_id": "q1", "text": "baciloscopia negativa exclui?",
                                     "split": "smoke"}, ensure_ascii=False), encoding="utf-8")
    config = {**_base_config(tmp_path, tiny_corpus, tiny_index), "experiment_id": "unit",
              "questions": str(questions), "splits": ["smoke"], "conditions": ["D", "R0", "R1"]}
    path = tmp_path / "unit.json"
    path.write_text(json.dumps(config), encoding="utf-8")
    return Experiment(path, root="", dry_run=True).run()


@pytest.fixture
def demo_config(tmp_path, tiny_corpus, tiny_index, recorded_batch):
    config = {**_base_config(tmp_path, tiny_corpus, tiny_index),
              "result_batches": [{"path": str(recorded_batch), "label": "lote simulado", "note": "teste"}]}
    path = tmp_path / "demo.json"
    path.write_text(json.dumps(config), encoding="utf-8")
    return path


def test_compare_runs_requested_conditions_in_fixed_order(demo_config, tmp_path):
    service = StudyService(demo_config, root="", dry_run=True)
    out = service.compare("  baciloscopia negativa exclui?  ", "anthropic", ["R1", "D", "R0"])
    assert out["question"] == "baciloscopia negativa exclui?"
    assert [r["condition"] for r in out["results"]] == ["D", "R0", "R1"]
    direct, rag, expanded = out["results"]
    assert direct["retrieval_query"] is None and direct["sources"] == []
    assert rag["retrieval_query"] == "baciloscopia negativa exclui?"
    assert expanded["expansion_status"] == "ok" and expanded["retrieval_query"] != rag["retrieval_query"]
    assert all(r["status"] == "success" and r["answer"] for r in out["results"])
    source = rag["sources"][0]
    assert source["rank"] == 1 and source["excerpt"] and source["section"] and source["page_start"]
    # live answers are a demonstration: they go to the demo log, never to the runs folder
    log_lines = service.log_path.read_text(encoding="utf-8").splitlines()
    assert len(log_lines) == 3 and service.log_path.parent == (tmp_path / "demo").resolve()
    assert all(json.loads(line)["question_split"] == "demo" for line in log_lines)
    assert sorted(p.name for p in (tmp_path / "runs").iterdir()) == ["unit"]


def test_compare_validates_input(demo_config):
    service = StudyService(demo_config, root="", dry_run=True)
    with pytest.raises(ValueError, match="vazia"):
        service.compare("   ", "openai", ["D"])
    with pytest.raises(ValueError, match="2000"):
        service.compare("x" * 2001, "openai", ["D"])
    with pytest.raises(ValueError, match="braço"):
        service.compare("pergunta", "gemini", ["D"])
    for conditions in ([], ["R9"], "D"):
        with pytest.raises(ValueError, match="condições"):
            service.compare("pergunta", "openai", conditions)


def test_one_live_comparison_at_a_time(demo_config):
    service = StudyService(demo_config, root="", dry_run=True)
    service._busy.acquire()
    try:
        with pytest.raises(BusyError):
            service.compare("pergunta", "openai", ["D"])
    finally:
        service._busy.release()


def test_provider_failure_becomes_an_error_column(demo_config):
    service = StudyService(demo_config, root="", dry_run=True)

    class Broken:
        condition = "D-BROKEN"

        def run(self, *args, **kwargs):
            raise RuntimeError("limite do plano atingido")

    service.units[("openai", "D")].pipeline = Broken()
    out = service.compare("pergunta", "openai", ["D", "R0"])
    assert out["results"][0]["status"] == "error" and "limite do plano" in out["results"][0]["error"]
    assert out["results"][1]["status"] == "success"


def test_guards(demo_config, tmp_path):
    config = json.loads(demo_config.read_text(encoding="utf-8"))
    with pytest.raises(PermissionError):  # real calls need --allow-api, like `run`
        StudyService(demo_config, root="")
    config["demo_log_dir"] = str(tmp_path / "runs" / "demo")
    demo_config.write_text(json.dumps(config), encoding="utf-8")
    with pytest.raises(ValueError, match="demo_log_dir"):
        StudyService(demo_config, root="", dry_run=True)


def test_recorded_batches_are_listed_and_grouped(demo_config, recorded_batch):
    service = StudyService(demo_config, root="", dry_run=True)
    batches = service.list_results()["batches"]
    assert len(batches) == 1 and batches[0]["label"] == "lote simulado" and batches[0]["dry_run"] is True
    experiment_id, batch_id = batches[0]["id"].split("/")
    detail = service.get_result(experiment_id, batch_id)
    (question,) = detail["questions"]
    assert question["question"] == "baciloscopia negativa exclui?"
    # 2 arms x (D, R1) + R0 per arm
    assert len(question["results"]) == 6
    codes = [r["condition"] for r in question["results"] if r["provider"] == question["results"][0]["provider"]]
    assert codes == sorted(codes, key=["D", "R0", "R1"].index)
    assert all(s["excerpt"] for r in question["results"] for s in r["sources"])
    with pytest.raises(NotFoundError):
        service.get_result("unit", "../../segredo")


def _request(base, path, body=None, headers=None):
    data = None if body is None else json.dumps(body).encode("utf-8")
    request = urllib.request.Request(base + path, data=data, method="POST" if body is not None else "GET",
                                     headers={"Content-Type": "application/json", **(headers or {})})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, json.loads(response.read())
    except urllib.error.HTTPError as exc:
        return exc.code, json.loads(exc.read())


def test_http_service(demo_config):
    service = StudyService(demo_config, root="", dry_run=True)
    server = make_server(service, "127.0.0.1", 0, token="segredo")
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{server.server_address[1]}"
    auth = {"X-Study-Token": "segredo"}
    try:
        assert _request(base, "/health")[0] == 401
        status, health = _request(base, "/health", headers=auth)
        assert status == 200 and health["dry_run"] is True and [c["code"] for c in health["conditions"]][0] == "D"
        # a web page in the author's browser must not be able to spend the subscription
        assert _request(base, "/compare", {"question": "x", "arm": "openai", "conditions": ["D"]},
                        {**auth, "Origin": "https://exemplo.com"})[0] == 403
        assert _request(base, "/compare", {"question": "x"}, {**auth, "Content-Type": "text/plain"})[0] == 415
        assert _request(base, "/compare", {"question": "", "arm": "openai", "conditions": ["D"]}, auth)[0] == 400
        status, out = _request(base, "/compare", {"question": "tratamento", "arm": "openai",
                                                  "conditions": ["D", "R0"]}, auth)
        assert status == 200 and [r["condition"] for r in out["results"]] == ["D", "R0"]
        status, listing = _request(base, "/results", headers=auth)
        assert status == 200 and len(listing["batches"]) == 1
        assert _request(base, "/results/" + listing["batches"][0]["id"], headers=auth)[0] == 200
        assert _request(base, "/results/x/y", headers=auth)[0] == 404
    finally:
        server.shutdown()
        server.server_close()


def test_server_only_listens_locally(demo_config):
    service = StudyService(demo_config, root="", dry_run=True)
    with pytest.raises(ValueError, match="127.0.0.1"):
        make_server(service, "0.0.0.0", 0)
