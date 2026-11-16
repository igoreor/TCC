import json

import pytest

from rag_study.judging import (
    Job,
    build_keypoints,
    combine_grades,
    keypoint_problems,
    load_outputs,
    relevance_by_judge,
    relevance_jobs,
    relevance_tables,
    review_jobs,
    review_sheets,
    run_jobs,
    source_label,
    validate_relevance,
    validate_review,
)
from rag_study.models import GenerationResult
from rag_study.providers import CliError
from rag_study.questions import write_sheet
from rag_study.retry import is_fatal
from rag_study.review import KEY_COLUMNS, PASS_A_COLUMNS, PASS_B_COLUMNS

A = "pcdt2022-v1-c0001-0123abcd"
B = "pcdt2022-v1-c0002-89abcdef"
W = "who2023-v1-c0003-00aa11bb"
CHUNKS = {
    A: {"chunk_id": A, "document_id": "BR-MS-PCDT-HANSENIASE-2022", "section_path": ["6", "6.1"],
        "page_start": "27", "page_end": "27", "text": "Mancha com perda de sensibilidade."},
    B: {"chunk_id": B, "document_id": "BR-MS-PCDT-HANSENIASE-2022", "section_path": ["7"],
        "page_start": "28", "page_end": "29", "text": "Teste de sensibilidade térmica."},
    W: {"chunk_id": W, "document_id": "WHO-LEPROSY-ELIMINATION-TECHNICAL-GUIDANCE-2023", "section_path": ["2"],
        "page_start": "14", "page_end": "14", "text": "Skin patches with loss of sensation."},
}
POOL = [
    {"pool_item": "1", "question_id": "q1", "question_text": "Como é a mancha?", "item_id": B},
    {"pool_item": "2", "question_id": "q1", "question_text": "Como é a mancha?", "item_id": A},
    {"pool_item": "3", "question_id": "q2", "question_text": "Pode comer peixe?", "item_id": W},
]


class StubProvider:
    def __init__(self, name, replies):
        self.name, self.model, self.replies, self.calls = name, f"{name}-model", list(replies), 0

    def parameters(self):
        return {"stub": True}

    def generate(self, system_prompt, user_prompt, max_output_tokens, json_schema=None):
        self.calls += 1
        reply = self.replies.pop(0) if len(self.replies) > 1 else self.replies[0]
        if isinstance(reply, Exception):
            raise reply
        return GenerationResult(text=reply, provider=self.name, requested_model=self.model,
                                returned_model=self.model, input_tokens=10, output_tokens=5, latency_ms=1.0)


def labels(*grades):
    return json.dumps({"rotulos": [{"trecho": f"T{n}", "justificativa": "j", "relevancia": g}
                                   for n, g in enumerate(grades, start=1)]})


def test_relevance_jobs_group_by_question_in_pool_order():
    jobs = relevance_jobs(POOL, CHUNKS, ["claude", "gpt"])
    assert [(j.job_id, j.judge) for j in jobs] == [("q1", "claude"), ("q1", "gpt"), ("q2", "claude"), ("q2", "gpt")]
    assert jobs[0].meta["items"] == [B, A]
    assert "[T1] Documento: PCDT 2022 | Seção: 7 | p. 28-29" in jobs[0].user_prompt
    assert "[T2] Documento: PCDT 2022" in jobs[0].user_prompt
    assert "OMS 2023" in jobs[2].user_prompt


def test_validate_relevance_requires_every_passage_once():
    job = relevance_jobs(POOL, CHUNKS, ["claude"])[0]
    validate_relevance(job, json.loads(labels(2, 0)))
    with pytest.raises(ValueError):
        validate_relevance(job, json.loads(labels(2)))
    with pytest.raises(ValueError):
        validate_relevance(job, {"rotulos": [{"trecho": "T1", "justificativa": "", "relevancia": 1},
                                             {"trecho": "T1", "justificativa": "", "relevancia": 1}]})


def test_combined_grade_is_mean_rounded_down():
    assert [combine_grades(g) for g in ([2, 2], [1, 2], [0, 2], [0, 1], [1, 1], [0, 0])] == [2, 1, 1, 0, 1, 0]


def test_run_jobs_logs_retries_invalid_json_and_resumes(tmp_path):
    jobs = relevance_jobs(POOL, CHUNKS, ["claude", "gpt"])
    claude = StubProvider("claude", ["não é json", labels(2, 1), labels(0)])
    gpt = StubProvider("gpt", [labels(1, 2), CliError("You've hit your 5-hour limit · resets 2:40pm")])
    first = run_jobs("j1", jobs, {"claude": claude, "gpt": gpt}, "sys", {"type": "object"}, validate_relevance,
                     tmp_path, workers=1)
    records = [json.loads(line) for line in (first / "raw.jsonl").read_text(encoding="utf-8").splitlines()]
    by_key = {(r["job_id"], r["judge"]): r for r in records}
    assert by_key[("q1", "claude")]["status"] == "success" and by_key[("q1", "claude")]["attempts"] == 2
    assert by_key[("q1", "gpt")]["status"] == "success"
    manifest = json.loads((first / "run-manifest.json").read_text(encoding="utf-8"))
    assert manifest["aborted"] is True  # the plan limit stops the batch

    gpt.replies = [labels(0)]
    claude.replies = [labels(0)]
    second = run_jobs("j1", jobs, {"claude": claude, "gpt": gpt}, "sys", {"type": "object"}, validate_relevance,
                      tmp_path, workers=1, continue_from=[first])
    done = load_outputs([first, second])
    assert set(done) == {("q1", "claude"), ("q1", "gpt"), ("q2", "claude"), ("q2", "gpt")}
    second_jobs = [json.loads(line)["job_id"] for line in (second / "raw.jsonl").read_text(encoding="utf-8").splitlines()]
    assert "q1" not in second_jobs or len(second_jobs) <= 2

    per_judge, final = relevance_tables(POOL, relevance_by_judge(done), {"claude": "opus", "gpt": "sol"})
    by_item = {(r["question_id"], r["item_id"]): r for r in final}
    assert by_item[("q1", B)]["rel_claude"] == 2 and by_item[("q1", B)]["rel_gpt"] == 1
    assert by_item[("q1", B)]["relevance"] == 1 and by_item[("q1", B)]["notes"] == "divergência 2x1"
    assert per_judge["claude"][0]["annotation_round"] == "llm-claude"


def test_limit_message_is_fatal():
    assert is_fatal(CliError("success: You've hit your 5-hour limit · resets 2:40pm (America/Sao_Paulo)"))
    assert is_fatal(CliError("You've hit your weekly limit"))


def test_keypoint_rules():
    meta = {"answerable": "sim", "complexity": "composta", "passages": [A, B]}
    assert keypoint_problems([{"texto": "Mancha", "trechos": [A]}, {"texto": "Teste", "trechos": [B]}], meta) == []
    assert keypoint_problems([{"texto": "Mancha", "trechos": [A]}], meta)  # composite needs 2
    assert keypoint_problems([{"texto": "Mancha", "trechos": [W]}, {"texto": "T", "trechos": [B]}], meta)
    meta_na = {"answerable": "não", "complexity": "simples", "passages": []}
    assert keypoint_problems([{"texto": "INSUFICIENTE: não há dieta", "trechos": []}], meta_na) == []
    assert keypoint_problems([{"texto": "Coma peixe", "trechos": []}], meta_na)
    meta_partial = {"answerable": "parcial", "complexity": "simples", "passages": [A]}
    assert keypoint_problems([{"texto": "Mancha", "trechos": [A]},
                              {"texto": "INSUFICIENTE: falta o resto", "trechos": []}], meta_partial) == []
    assert keypoint_problems([{"texto": "INSUFICIENTE: x", "trechos": []},
                              {"texto": "Mancha", "trechos": [A]}], meta_partial)


def test_source_label_groups_documents_and_pages():
    assert source_label([A, B, W], CHUNKS) == "PCDT 2022, p. 27-29; OMS 2023, p. 14"


def test_build_keypoints_applies_edits_and_copies_to_pair():
    drafts = {"P01": {"meta": {"questions": ["q4", "q5"], "answerable": "sim", "complexity": "simples",
                               "passages": [A, B]},
                      "output": {"pontos": [{"texto": "Mancha com perda de sensibilidade.", "trechos": [A]},
                                            {"texto": "Contexto histórico", "trechos": [B]}],
                                 "observacoes": ""}}}
    edits = {"P01": {"drop": [2], "add": [{"texto": "Teste térmico", "trechos": [B]}], "reason": "acessório"}}
    rows, provenance = build_keypoints(drafts, edits, CHUNKS)
    assert [(r["question_id"], r["key_point_n"], r["key_point"]) for r in rows] == [
        ("q4", 1, "Mancha com perda de sensibilidade (PCDT 2022, p. 27)"),
        ("q4", 2, "Teste térmico (PCDT 2022, p. 28-29)"),
        ("q5", 1, "Mancha com perda de sensibilidade (PCDT 2022, p. 27)"),
        ("q5", 2, "Teste térmico (PCDT 2022, p. 28-29)"),
    ]
    assert provenance[1]["origin"] == "acrescentado" and provenance[1]["edit_reason"] == "acessório"


def _review_dir(tmp_path):
    write_sheet([
        {"review_id": "A1", "question_text": "Q?", "expected_behaviour": "responder", "key_points": "1. Um\n2. Dois",
         "answer_text": "Resposta do Claude"},
        {"review_id": "A2", "question_text": "Q2?", "expected_behaviour": "responder", "key_points": "1. Um",
         "answer_text": "Resposta do GPT"},
    ], tmp_path / "pass-a.csv", PASS_A_COLUMNS)
    write_sheet([{"review_id": "B1", "question_text": "Q?", "context": "[F1] (p. 27) texto",
                  "answer_text": "Resposta [F1]"}], tmp_path / "pass-b.csv", PASS_B_COLUMNS)
    key = [
        {"review_id": "A1", "pass": "A", "run_id": "r1", "question_id": "q1", "arm": "claude_cli",
         "condition_base": "R0"},
        {"review_id": "A2", "pass": "A", "run_id": "r2", "question_id": "q2", "arm": "codex_cli",
         "condition_base": "D"},
        {"review_id": "B1", "pass": "B", "run_id": "r1", "question_id": "q1", "arm": "claude_cli",
         "condition_base": "R0"},
    ]
    import csv

    with open(tmp_path / "review-key.csv", "w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=KEY_COLUMNS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(key)
    return tmp_path


CROSS = {"claude_cli": "gpt", "codex_cli": "claude"}


def test_review_jobs_are_cross_family_with_calibration_and_blind(tmp_path):
    review_dir = _review_dir(tmp_path)
    jobs = review_jobs(review_dir, {"q1": {A: 2}}, CHUNKS, CROSS, {"q1"}, ["claude", "gpt"])
    routing = {(j.job_id, j.judge): j.meta["role"] for j in jobs}
    assert routing == {("A1", "gpt"): "primary", ("A1", "claude"): "calibration", ("A2", "claude"): "primary",
                       ("B1", "gpt"): "primary", ("B1", "claude"): "calibration"}
    prompt = next(j.user_prompt for j in jobs if j.job_id == "A1")
    assert "Pontos-chave do gabarito (2)" in prompt and "[R1] Documento: PCDT 2022" in prompt
    for job in jobs:
        assert "claude_cli" not in job.user_prompt and "codex_cli" not in job.user_prompt and "R0" not in job.user_prompt


def test_review_sheets_fill_primary_and_calibration(tmp_path):
    review_dir = _review_dir(tmp_path)
    flags = {f: 0 for f in ("f_unsupported", "f_omission", "f_contradiction", "f_dangerous", "f_invented_source",
                            "f_negation", "f_number_dose", "f_population", "f_drift")}

    def out_a(grades, correctness):
        return {"pontos": [{"n": n, "justificativa": "", "nota": g} for n, g in enumerate(grades, start=1)],
                **flags, "critical_failure": 0, "insufficiency": "na", "correctness": correctness, "notes": ""}

    job = Job("A1", "gpt", "", {"pass": "A", "n_points": 2})
    validate_review(job, out_a(["2", "X"], 3))
    with pytest.raises(ValueError):
        validate_review(job, out_a(["2"], 3))
    outputs = {
        ("A1", "gpt"): {"output": out_a(["2", "X"], 3)},
        ("A1", "claude"): {"output": out_a(["2", "1"], 4)},
        ("A2", "claude"): {"output": out_a(["1"], 2)},
        ("B1", "gpt"): {"output": {"analise": "", "faithfulness": 2, "citation_support": 1, "notes": "ok"}},
    }
    sheets = review_sheets(review_dir, outputs, CROSS, {"claude": "opus", "gpt": "sol"}, {"q1"})
    a = {r["review_id"]: r for r in sheets["pass-a"]}
    assert a["A1"]["kp2"] == "X" and a["A1"]["reviewer_id"] == "llm-sol" and a["A2"]["reviewer_id"] == "llm-opus"
    assert [r["correctness"] for r in sheets["calib-a-claude"]] == [4]
    assert [r["correctness"] for r in sheets["calib-a-gpt"]] == [3]
    assert sheets["pass-b"][0]["citation_support"] == 1
    del outputs[("A2", "claude")]
    with pytest.raises(ValueError):
        review_sheets(review_dir, outputs, CROSS, {"claude": "opus", "gpt": "sol"}, {"q1"})
