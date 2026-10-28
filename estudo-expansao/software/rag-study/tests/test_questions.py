import csv
import json
from collections import Counter
from pathlib import Path

import pytest

from rag_study.questions import (
    SHEET_COLUMNS,
    authoring_sheet,
    build_question_files,
    check_questions,
    load_blueprint,
    read_table,
    resolve_sections,
    write_sheet,
)

ROOT = Path(__file__).resolve().parents[3]
BLUEPRINT = ROOT / "research" / "questions" / "blueprint-v2.csv"  # current: 50 test slots, no dev (D34)
BLUEPRINT_V1 = ROOT / "research" / "questions" / "blueprint-v1.csv"  # superseded, kept for history
CORPUS = ROOT / "research" / "corpus" / "pcdt2022-v1"


@pytest.fixture(scope="module")
def blueprint():
    return load_blueprint(BLUEPRINT)


def test_blueprint_strata(blueprint):
    assert {slot["split"] for slot in blueprint} == {"test"} and len(blueprint) == 50
    assert Counter(slot["register"] for slot in blueprint) == {"leigo": 25, "técnico": 25}
    assert Counter(slot["answerable_from_corpus"] for slot in blueprint) == {"sim": 42, "parcial": 3, "não": 5}
    assert Counter(slot["complexity"] for slot in blueprint)["composta"] == 15


def test_v2_keeps_the_test_slots_of_v1_unchanged(blueprint):
    v1_test = [slot for slot in load_blueprint(BLUEPRINT_V1) if slot["split"] == "test"]
    assert v1_test == blueprint


def test_register_pairs_share_everything_but_register(blueprint):
    groups = {}
    for slot in blueprint:
        if slot["need_group"] != slot["slot_id"]:
            groups.setdefault(slot["need_group"], []).append(slot)
    assert len(groups) == 11
    for members in groups.values():
        assert len(members) == 2
        first, second = members
        assert {first["register"], second["register"]} == {"leigo", "técnico"}
        for field in ("category", "complexity", "answerable_from_corpus", "target_sections", "split"):
            assert first[field] == second[field]


@pytest.mark.skipif(not (CORPUS / "chunks.jsonl").exists(), reason="corpus congelado ausente")
def test_every_target_section_exists_in_frozen_corpus(blueprint):
    rows = authoring_sheet(blueprint, CORPUS)
    for row in rows:
        if row["answerable_from_corpus"] != "não":
            assert row["n_chunks"] > 0 and row["pages"], row["slot_id"]
        assert row["question_id"].startswith(row["split"] + "-")


def test_resolve_sections_includes_subsections(tiny_corpus):
    from rag_study.corpus import load_chunks

    resolved = resolve_sections(load_chunks(tiny_corpus), ["10"])
    assert resolved["chunk_ids"] == ["tc-c0000", "tc-c0001"] and resolved["missing"] == []
    assert resolve_sections(load_chunks(tiny_corpus), ["99"])["missing"] == ["99"]


def _tiny_blueprint(path):
    rows = [
        {"slot_id": "T01", "split": "test", "need_group": "P01", "category": "tratamento", "register": "leigo",
         "complexity": "simples", "answerable_from_corpus": "sim", "target_sections": "10", "design_note": ""},
        {"slot_id": "T02", "split": "test", "need_group": "P01", "category": "tratamento", "register": "técnico",
         "complexity": "simples", "answerable_from_corpus": "sim", "target_sections": "10", "design_note": ""},
        {"slot_id": "T03", "split": "test", "need_group": "T03", "category": "epidemiologia", "register": "leigo",
         "complexity": "simples", "answerable_from_corpus": "não", "target_sections": "", "design_note": ""},
        {"slot_id": "V01", "split": "dev", "need_group": "V01", "category": "diagnóstico", "register": "técnico",
         "complexity": "simples", "answerable_from_corpus": "sim", "target_sections": "7", "design_note": ""},
    ]
    with open(path, "w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    return load_blueprint(path)


def test_sheet_roundtrip_and_checks(tmp_path, tiny_corpus):
    blueprint = _tiny_blueprint(tmp_path / "bp.csv")
    rows = authoring_sheet(blueprint, tiny_corpus)
    texts = {
        "T01": "por quanto tempo a pessoa toma o remédio da hanseníase?",
        "T02": "qual a duração da poliquimioterapia única para hanseníase multibacilar?",
        "T03": "quantos casos houve na minha cidade no ano passado?",
        "V01": "baciloscopia negativa exclui o diagnóstico de hanseníase?",
    }
    for row in rows:
        row.update(text=texts[row["slot_id"]], origin="autor", author="NDLS", created_on="2026-10-22", reviewed_by="X",
                   key_points="Ponto A (p. 1) | Ponto B (p. 1)" if row["slot_id"] != "T03" else "INSUFICIENTE: dado local")
    sheet = tmp_path / "sheet.csv"
    write_sheet(rows, sheet, SHEET_COLUMNS)
    assert read_table(sheet)[0]["slot_id"] == "T01"  # semicolon + BOM is read back

    written = build_question_files(sheet, tmp_path)
    test_items = [json.loads(line) for line in written["test_questions"].read_text(encoding="utf-8").splitlines()]
    assert [item["question_id"] for item in test_items] == ["test-001", "test-002", "test-003"]
    assert test_items[0]["target_sections"] == ["10"]
    report = check_questions([written["test_questions"], written["dev_questions"]], blueprint,
                             [written["test_keypoints"]])
    assert report["errors"] == [] and report["n_questions"] == 4
    with pytest.raises(FileExistsError):
        build_question_files(sheet, tmp_path)


def test_check_flags_mismatch_missing_slot_and_leakage(tmp_path):
    blueprint = _tiny_blueprint(tmp_path / "bp.csv")
    test = tmp_path / "test.jsonl"
    dev = tmp_path / "dev.jsonl"
    base = {"split": "test", "category": "tratamento", "complexity": "simples", "answerable_from_corpus": "sim",
            "author": "NDLS"}
    test.write_text("\n".join(json.dumps(item, ensure_ascii=False) for item in [
        {**base, "question_id": "test-001", "slot_id": "T01", "need_group": "P01", "register": "técnico",
         "text": "qual a duração da poliquimioterapia única multibacilar?"},
    ]), encoding="utf-8")
    dev.write_text(json.dumps({"question_id": "dev-001", "slot_id": "V01", "split": "dev", "need_group": "V01",
                               "category": "diagnóstico", "register": "técnico", "complexity": "simples",
                               "answerable_from_corpus": "sim", "author": "NDLS",
                               "text": "qual a duração da poliquimioterapia única multibacilar?"},
                              ensure_ascii=False), encoding="utf-8")
    report = check_questions([test, dev], blueprint)
    joined = " ".join(report["errors"])
    assert "register" in joined  # T01 is a lay slot
    assert "T02" in joined and "T03" in joined  # empty slots
    assert "muito parecidas" in joined  # same question in dev and test


def test_pool_adds_target_section_chunks_blind(tmp_path, tiny_corpus):
    from rag_study.evaluation import export_pool

    record = {"question_id": "q1", "rag_enabled": True, "retrieved_chunks": [{"chunk_id": "tc-c0002"}]}
    count = export_pool([record], {"q1": "pergunta"}, tiny_corpus, 5, 1, tmp_path / "pool.csv",
                        extra_items={"q1": ["tc-c0000", "tc-c0002"], "other": ["tc-c0003"]})
    rows = read_table(tmp_path / "pool.csv")
    assert count == 2 and sorted(row["item_id"] for row in rows) == ["tc-c0000", "tc-c0002"]
    assert "condition" not in rows[0]


def _write_items(path, items):
    path.write_text("\n".join(json.dumps(item, ensure_ascii=False) for item in items), encoding="utf-8")
    return path


def _base(**fields):
    item = {"question_id": "test-001", "slot_id": "T01", "split": "test", "need_group": "P01",
            "category": "tratamento", "register": "leigo", "complexity": "simples", "answerable_from_corpus": "sim",
            "author": "NDLS", "reviewed_by": "X", "text": "quanto tempo a pessoa toma o remédio da hanseníase?"}
    item.update(fields)
    return item


def test_origin_rules(tmp_path):
    blueprint = _tiny_blueprint(tmp_path / "bp.csv")
    published = "Qual a duração do tratamento da hanseníase multibacilar?"
    cases = {
        "ok_real": _base(origin="real", text=published, original_text=published, source_name="BVS APS",
                         source_url="https://aps.bvs.br/x"),
        "real_changed": _base(origin="real", original_text=published, source_name="BVS", source_url="u"),
        "adapted_without_source": _base(origin="adaptada", original_text=published),
        "synthetic_not_approved": _base(origin="sintetica_externa", generator_model="modelo-x"),
        "synthetic_evaluated_family": _base(origin="sintetica_externa", generator_model="claude-sonnet-5-5"),
        "missing": _base(),
    }
    reports = {name: check_questions([_write_items(tmp_path / f"{name}.jsonl", [item])], blueprint)
               for name, item in cases.items()}
    assert not [e for e in reports["ok_real"]["errors"] if "origin" in e or "real" in e]
    assert any("idêntico ao publicado" in e for e in reports["real_changed"]["errors"])
    assert any("source_name" in e for e in reports["adapted_without_source"]["errors"])
    assert any("emenda" in e for e in reports["synthetic_not_approved"]["errors"])
    approved = check_questions([tmp_path / "synthetic_evaluated_family.jsonl"], blueprint, allow_external_synthetic=True)
    assert any("D15" in e for e in approved["errors"])
    assert any("origin deve ser" in e for e in reports["missing"]["errors"])
    assert reports["ok_real"]["origins"] == {"real": 1}


def test_copied_phrases_and_headings_are_flagged(tmp_path, tiny_corpus):
    blueprint = _tiny_blueprint(tmp_path / "bp.csv")
    copied = _base(origin="autor", text="Contatos domiciliares devem ser examinados anualmente por cinco anos, certo?")
    own = _base(question_id="test-002", slot_id="T02", register="técnico", origin="autor",
                text="Por quanto tempo devo acompanhar quem mora com o paciente?")
    report = check_questions([_write_items(tmp_path / "q.jsonl", [copied, own])], blueprint, corpus_dir=tiny_corpus)
    assert report["longest_corpus_run"]["test-001"] >= 8 and report["longest_corpus_run"]["test-002"] == 0
    assert any("test-001" in e and "copiadas" in e for e in report["errors"])


def test_semantic_similarity_report(tiny_corpus, tiny_index):
    from rag_study.questions import semantic_similarity_report
    from rag_study.retrieval import ExactCosineRetriever, HashingEmbedder

    retriever = ExactCosineRetriever.load(tiny_index, tiny_corpus, HashingEmbedder())
    questions = [
        {"question_id": "a", "slot_id": "A", "need_group": "A", "text": "reação tipo 1 tratada com prednisona",
         "target_sections": ["10.1.2"]},
        {"question_id": "b", "slot_id": "B", "need_group": "B", "text": "reação tipo 1 tratada com prednisona",
         "target_sections": ["10.1.2"]},
        {"question_id": "c", "slot_id": "C", "need_group": "C", "text": "exame dos contatos domiciliares",
         "target_sections": ["13"]},
    ]
    rows, pairs = semantic_similarity_report(questions, retriever, 0.9)
    by_id = {row["question_id"]: row for row in rows}
    assert by_id["a"]["top_chunk"] == "tc-c0001" and by_id["a"]["first_target_rank"] == 1
    assert pairs == [{"a": "a", "b": "b", "cosine": 1.0}]


def test_composite_needs_two_key_points(tmp_path):
    blueprint = _tiny_blueprint(tmp_path / "bp.csv")
    for slot in blueprint:
        if slot["slot_id"] == "T01":
            slot["complexity"] = "composta"
    item = _base(origin="autor", complexity="composta")
    keypoints = tmp_path / "kp.csv"
    keypoints.write_text("question_id,key_point_n,key_point\ntest-001,1,Doze meses (p. 1)\n", encoding="utf-8")
    report = check_questions([_write_items(tmp_path / "q.jsonl", [item])], blueprint, [keypoints])
    assert any("composta exige" in e for e in report["errors"])


def test_candidates_respect_category_and_2026_flags(tmp_path, tiny_corpus, tiny_index):
    from rag_study.questions import candidate_matches
    from rag_study.retrieval import ExactCosineRetriever, HashingEmbedder

    retriever = ExactCosineRetriever.load(tiny_index, tiny_corpus, HashingEmbedder())
    blueprint = _tiny_blueprint(tmp_path / "bp.csv")
    external = [
        {"id": "E1", "question_verbatim": "quanto tempo dura o tratamento?", "category": "tratamento",
         "register": "leigo", "flag_2026": "", "source": "MS", "url": "u", "asker": "x"},
        {"id": "E2", "question_verbatim": "a claritromicina é segunda linha?", "category": "tratamento",
         "register": "técnico", "flag_2026": "tema alterado em 2026", "source": "MS", "url": "u", "asker": "x"},
        {"id": "E3", "question_verbatim": "quantos casos houve no estado?", "category": "epidemiologia",
         "register": "leigo", "flag_2026": "", "source": "MS", "url": "u", "asker": "x"},
    ]
    rows = candidate_matches(blueprint, external, retriever.chunks, retriever.embedder, retriever.embeddings)
    by_slot = {}
    for row in rows:
        by_slot.setdefault(row["slot_id"], []).append(row["external_id"])
    assert by_slot["T01"] == ["E1"] and "E2" not in by_slot["T02"]  # same category, 2026 change excluded
    assert by_slot["T03"] == ["E3"]  # unanswerable slot ranked by low corpus similarity
    assert "V01" not in by_slot  # no candidate of that category


def test_pairs_must_share_key_points_and_lay_jargon_is_flagged(tmp_path):
    blueprint = _tiny_blueprint(tmp_path / "bp.csv")
    lay = _base(origin="autor", text="Quanto tempo dura a PQT de quem tem hanseníase multibacilar?")
    tech = _base(question_id="test-002", slot_id="T02", register="técnico", origin="autor",
                 text="Qual a duração da poliquimioterapia única na forma multibacilar?")
    keypoints = tmp_path / "kp.csv"
    keypoints.write_text("question_id,key_point_n,key_point\ntest-001,1,Doze doses (p. 58)\n"
                         "test-002,1,Seis doses (p. 58)\n", encoding="utf-8")
    report = check_questions([_write_items(tmp_path / "q.jsonl", [lay, tech])], blueprint, [keypoints])
    assert any("par P01" in e for e in report["errors"])
    assert any("test-001" in w and "pqt" in w and "multibacilar" in w for w in report["warnings"])
    assert not any("test-002" in w and "termos técnicos" in w for w in report["warnings"])


def test_published_questions_need_selected_by(tmp_path):
    blueprint = _tiny_blueprint(tmp_path / "bp.csv")
    published = "Qual a duração do tratamento da hanseníase?"
    item = _base(origin="real", text=published, original_text=published, source_name="MS", source_url="u")
    report = check_questions([_write_items(tmp_path / "q.jsonl", [item])], blueprint)
    assert any("selected_by" in e for e in report["errors"])
    item["selected_by"] = "agente_confirmado"
    report = check_questions([_write_items(tmp_path / "q2.jsonl", [item])], blueprint)
    assert not any("selected_by" in e for e in report["errors"])


def test_lexical_index_and_unanswerability_report(tiny_corpus):
    from rag_study.corpus import load_chunks
    from rag_study.questions import LexicalIndex, unanswerability_report

    chunks = load_chunks(tiny_corpus)
    hits = LexicalIndex(chunks).search("os contatos domiciliares precisam ser examinados?", k=3)
    assert hits[0][1]["chunk_id"] == "tc-c0003"
    assert LexicalIndex(chunks).search("geladeira", k=3) == []  # no shared term, nothing returned
    report = unanswerability_report(chunks, [{"id": "EXT1", "slot_id": "T48", "text": "precisa de jejum na dose?"}])
    assert "precisa de jejum" in report and "nenhum trecho responde" in report


def test_document_aliases_in_target_sections():
    chunks = [
        {"chunk_id": "a", "document_id": "BR-MS-PCDT-HANSENIASE-2022", "section_path": ["10 Abordagem"], "sections_touched": [],
         "page_start": 1, "page_end": 1},
        {"chunk_id": "b", "document_id": "BR-MS-ESTRATEGIA-HANSENIASE-2024-2030", "section_path": ["Estratégia", "METAS", "META 1 X"],
         "sections_touched": [], "page_start": 2, "page_end": 2},
        {"chunk_id": "c", "document_id": "BR-MS-SCTIE-PORTARIA-47-2026", "section_path": ["Portaria 47"], "sections_touched": [],
         "page_start": 1, "page_end": 1},
    ]
    assert resolve_sections(chunks, ["EST:METAS"])["chunk_ids"] == ["b"]
    assert resolve_sections(chunks, ["P47:"])["chunk_ids"] == ["c"]
    assert resolve_sections(chunks, ["10;P47:".split(";")[0], "P47:"])["chunk_ids"] == ["a", "c"]
    assert resolve_sections(chunks, ["PCDT:METAS"])["missing"] == ["PCDT:METAS"]
