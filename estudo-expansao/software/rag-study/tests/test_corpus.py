from rag_study.corpus import (
    CorpusConfig,
    Element,
    ExtractionStats,
    Sentence,
    _join_lines,
    _merge_headings,
    chunk_sentences,
    to_sentences,
)


def config(**overrides):
    values = dict(
        corpus_id="t", source_pdf="x.pdf", expected_sha256="0", document_id="DOC", document_title="T",
        publisher="P", year=2022, document_type="d", include_pages=[[1, 10]], exclusions=[],
        max_words=20, overlap_words=6, min_words=8,
    )
    values.update(overrides)
    return CorpusConfig(**values)


def words(n, tag):
    return " ".join(f"{tag}{i}" for i in range(n)) + "."


def test_compound_hyphen_is_kept_without_space():
    assert _join_lines(["promover o bem-", "estar do paciente"]) == "promover o bem-estar do paciente"
    assert _join_lines(["primeira linha", "segunda"]) == "primeira linha segunda"


def test_chapter_number_merges_with_title():
    elements = [Element("heading", "1", 17, 156.8), Element("heading", "Introdução", 17, 24.0),
                Element("paragraph", "Texto.", 17)]
    merged = _merge_headings(elements, config())
    assert merged[0].text == "1 Introdução"


def test_numbered_heading_split_across_lines_is_merged_and_new_number_starts_new_heading():
    elements = [Element("heading", "10.1.2 Tratamento das reações", 62, 20.0),
                Element("heading", "hansênicas", 62, 20.0),
                Element("heading", "10.1.2.1", 62, 18.0),
                Element("heading", "Reação tipo 1", 62, 18.0)]
    merged = [e.text for e in _merge_headings(elements, config())]
    assert merged == ["10.1.2 Tratamento das reações hansênicas", "10.1.2.1 Reação tipo 1"]


def test_section_path_follows_numbering_depth():
    elements = [Element("heading", "10 Abordagem", 1, 24.0), Element("heading", "10.1 Tratamento", 1, 20.0),
                Element("paragraph", "Frase A. Frase B.", 1), Element("heading", "11 Resistência", 2, 24.0),
                Element("paragraph", "Frase C.", 2)]
    sentences = to_sentences(elements, config(), ExtractionStats())
    assert sentences[0].section_path == ("10 Abordagem", "10.1 Tratamento")
    assert sentences[-1].section_path == ("11 Resistência",)


def test_chunks_respect_max_words_and_overlap_within_section():
    section = ("1 S",)
    sentences = [Sentence(words(5, f"s{i}_"), 1, section) for i in range(8)]
    chunks = chunk_sentences(sentences, config())
    assert all(chunk.n_words <= 20 for chunk in chunks)
    # 4 sentences of 5 words fill the first chunk; the last one (5 <= 6 words) is repeated as overlap
    assert chunks[0].text.endswith("s3_4.")
    assert chunks[1].text.startswith("s3_0")


def test_short_section_is_merged_forward_and_long_section_closes_chunk():
    sentences = [Sentence(words(3, "a"), 1, ("1 A",)), Sentence(words(10, "b"), 1, ("2 B",)),
                 Sentence(words(4, "c"), 2, ("3 C",))]
    chunks = chunk_sentences(sentences, config())
    assert len(chunks) == 2
    assert chunks[0].sections_touched == ["1 A", "2 B"]
    assert chunks[1].section_path == ["3 C"]


def test_chunk_ids_are_deterministic():
    sentences = [Sentence(words(6, f"x{i}_"), 1, ("1 S",)) for i in range(6)]
    first = [chunk.chunk_id for chunk in chunk_sentences(sentences, config())]
    second = [chunk.chunk_id for chunk in chunk_sentences(sentences, config())]
    assert first == second
    assert len(set(first)) == len(first)


def test_overlong_sentence_is_split():
    chunks = chunk_sentences([Sentence(words(45, "z"), 1, ("1 S",))], config())
    assert all(chunk.n_words <= 20 for chunk in chunks)
    assert sum(chunk.n_words for chunk in chunks) == 45


def test_merge_keeps_chunks_and_rejects_tampering(tmp_path):
    import json

    from conftest import write_tiny_corpus
    from rag_study.corpus import load_chunks, merge_corpora

    first = write_tiny_corpus(tmp_path / "a")
    second = tmp_path / "b"
    second.mkdir()
    rows = [dict(row, chunk_id=row["chunk_id"].replace("tc-", "td-"), document_id="DOC2") for row in load_chunks(first)]
    (second / "chunks.jsonl").write_text("\n".join(json.dumps(r, ensure_ascii=False, sort_keys=True) for r in rows) + "\n",
                                         encoding="utf-8")
    from rag_study.corpus import sha256_file
    (second / "manifest.json").write_text(json.dumps({"corpus_id": "td", "snapshot_sha256": sha256_file(second / "chunks.jsonl"),
                                                      "source": {"document_id": "DOC2"}}), encoding="utf-8")
    (first / "manifest.json").write_text(json.dumps({"corpus_id": "tc", "snapshot_sha256": sha256_file(first / "chunks.jsonl"),
                                                     "source": {"document_id": "DOC"}}), encoding="utf-8")
    manifest = merge_corpora([first, second], "merged", tmp_path / "m")
    merged = load_chunks(tmp_path / "m")
    assert len(merged) == 8 and manifest["stats"]["documents"] == 2
    assert [c["ordinal"] for c in merged] == list(range(8))
    assert merged[0]["text"] == load_chunks(first)[0]["text"]
    (second / "chunks.jsonl").write_text("adulterado\n", encoding="utf-8")
    try:
        merge_corpora([first, second], "merged", tmp_path / "m2")
    except ValueError:
        pass
    else:
        raise AssertionError("tampered component accepted")


def test_layout_options_levels_callouts_and_root(tmp_path):
    from rag_study.corpus import CorpusConfig, Element, ExtractionStats, _merge_headings, to_sentences

    config = CorpusConfig(corpus_id="x", source_pdf="", expected_sha256="", document_id="D", document_title="",
                          publisher="", year=2024, document_type="", include_pages=[[1, 1]], exclusions=[],
                          heading_size_levels=[[25, 1], [15, 2], [12.9, 3]], heading_max_words=5,
                          root_section="Documento X")
    elements = [Element("heading", "Contexto", 1, 30.0), Element("heading", "DADOS", 1, 15.7),
                Element("heading", "No Brasil", 1, 13.0), Element("paragraph", "Texto do Brasil.", 1, 9.7),
                Element("heading", "uma frase longa em destaque que não é título de seção", 1, 13.8),
                Element("paragraph", "Mais texto.", 1, 9.7)]
    merged = _merge_headings(elements, config)
    sentences = to_sentences(merged, config, ExtractionStats())
    assert sentences[0].section_path == ("Documento X", "Contexto", "DADOS", "No Brasil")
    assert any("destaque" in s.text for s in sentences)  # callout kept as text, not as a section
