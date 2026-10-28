from rag_study.questions import read_table, write_sheet
from rag_study.review import (
    PASS_A_COLUMNS,
    PASS_B_COLUMNS,
    auto_answer_metrics,
    export_review,
    import_review,
    key_point_coverage,
    neutral_citations,
    strip_citations,
)

A = "pcdt2022-v1-c0001-0123abcd"
B = "pcdt2022-v1-c0002-89abcdef"
GHOST = "pcdt2022-v1-c0999-ffffffff"


def test_citations_become_neutral_labels_in_context_order():
    answer = f"Prednisona [chunk:{B} document:BR-MS-PCDT] e dose [chunk:{A}]; também [{GHOST}]."
    text, labels = neutral_citations(answer, [A, B])
    assert labels == {A: "F1", B: "F2", GHOST: "F3"}
    assert text == "Prednisona [F2] e dose [F1]; também [F3]."
    assert strip_citations(text) == "Prednisona e dose; também."


def test_auto_metrics_detect_citation_not_in_context():
    record = {"run_id": "r", "question_id": "q", "condition": "R0-OPENAI", "provider": "openai",
              "rag_enabled": True, "answer": f"Sim [{A}] e não [{GHOST}].",
              "retrieved_chunks": [{"chunk_id": A}, {"chunk_id": B}],
              "steps": [{"name": "generation", "stop_reason": "max_output_tokens"}]}
    metrics = auto_answer_metrics(record)
    assert metrics["citation_validity"] == 0.5 and metrics["n_cited_not_retrieved"] == 1
    assert metrics["truncated"] == 1 and metrics["condition_base"] == "R0"
    direct = auto_answer_metrics({**record, "rag_enabled": False, "condition": "D-OPENAI", "answer":
                                  "O contexto fornecido não contém essa informação."})
    assert direct["citation_validity"] is None and direct["insufficiency_cue"] == 1


def test_key_point_coverage():
    assert key_point_coverage(["2", "1", "X", ""]) == (0.5, 1)
    assert key_point_coverage(["", ""]) == (None, 0)


def _record(condition, rag, answer, run_id):
    return {"run_id": run_id, "question_id": "test-001", "condition": condition, "provider": "openai",
            "rag_enabled": rag, "answer": answer, "repetition": 0, "batch_id": "b", "mode": "rag" if rag else "direct",
            "retrieved_chunks": [{"chunk_id": "tc-c0000"}, {"chunk_id": "tc-c0001"}] if rag else []}


def test_export_is_blind_and_import_rejoins(tmp_path, tiny_corpus):
    records = [_record("D-OPENAI", False, "Doze meses.", "r-d"),
               _record("R0-OPENAI", True, "Doze meses [chunk:tc-c0000].", "r-r0")]
    questions = {"test-001": {"question_id": "test-001", "text": "Quanto dura?", "answerable_from_corpus": "sim"}}
    counts = export_review(records, questions, {"test-001": ["Doze meses (p. 1)"]}, tiny_corpus, 0, 3,
                           tmp_path / "review")
    assert counts == {"pass_a": 2, "pass_b": 1}
    sheet_a = read_table(tmp_path / "review" / "pass-a.csv")
    flat = " ".join(" ".join(row.values()) for row in sheet_a)
    assert "OPENAI" not in flat and "R0" not in flat and "D-" not in flat
    assert {row["answer_text"] for row in sheet_a} == {"Doze meses."}  # citations removed in pass A
    sheet_b = read_table(tmp_path / "review" / "pass-b.csv")
    assert "[F1]" in sheet_b[0]["context"]

    for row in sheet_a:
        row.update(kp1="2", correctness="4", critical_failure="0", insufficiency="na", reviewer_id="NDLS",
                   **{flag: "0" for flag in PASS_A_COLUMNS if flag.startswith("f_")})
    sheet_b[0].update(faithfulness="2", citation_support="1", reviewer_id="NDLS")
    write_sheet(sheet_a, tmp_path / "a.csv", PASS_A_COLUMNS)
    write_sheet(sheet_b, tmp_path / "b.csv", PASS_B_COLUMNS)
    rows = {row["run_id"]: row for row in import_review(tmp_path / "a.csv", tmp_path / "review" / "review-key.csv",
                                                         tmp_path / "b.csv")}
    assert rows["r-d"]["condition_base"] == "D" and rows["r-d"]["kp_coverage"] == 1.0
    assert rows["r-d"]["faithfulness"] is None
    assert rows["r-r0"]["citation_support"] == 1
