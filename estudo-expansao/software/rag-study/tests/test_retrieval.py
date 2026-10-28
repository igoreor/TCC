import json

import pytest

from rag_study.retrieval import ExactCosineRetriever, HashingEmbedder, build_index


def test_index_round_trip_and_ranking(tiny_corpus, tiny_index):
    retriever = ExactCosineRetriever.load(tiny_index, tiny_corpus, HashingEmbedder())
    results = retriever.retrieve("baciloscopia negativa diagnóstico", 2)
    assert results[0].chunk_id == "tc-c0002"
    assert [r.metadata["rank"] for r in results] == [1, 2]
    assert results[0].score >= results[1].score
    assert retriever.last_latency_ms is not None


def test_ties_are_broken_by_corpus_order(tiny_corpus, tiny_index):
    retriever = ExactCosineRetriever.load(tiny_index, tiny_corpus, HashingEmbedder())
    results = retriever.retrieve("", 4)  # zero vector: every score ties at 0
    assert [r.chunk_id for r in results] == ["tc-c0000", "tc-c0001", "tc-c0002", "tc-c0003"]


def test_index_refuses_modified_corpus(tiny_corpus, tiny_index):
    path = tiny_corpus / "chunks.jsonl"
    path.write_text(path.read_text(encoding="utf-8") + "\n", encoding="utf-8")
    with pytest.raises(ValueError, match="different corpus snapshot"):
        ExactCosineRetriever.load(tiny_index, tiny_corpus, HashingEmbedder())


def test_index_refuses_other_embedder(tiny_corpus, tiny_index):
    with pytest.raises(ValueError, match="embedder mismatch"):
        ExactCosineRetriever.load(tiny_index, tiny_corpus, HashingEmbedder(dimension=32))


def test_build_index_never_overwrites(tiny_corpus, tiny_index):
    with pytest.raises(FileExistsError):
        build_index(tiny_corpus, HashingEmbedder(), tiny_index, "again")


def test_manifest_records_snapshot(tiny_corpus, tiny_index):
    manifest = json.loads((tiny_index / "manifest.json").read_text(encoding="utf-8"))
    corpus = json.loads((tiny_corpus / "manifest.json").read_text(encoding="utf-8"))
    assert manifest["corpus_snapshot_sha256"] == corpus["snapshot_sha256"]
    assert manifest["search"].startswith("exact")
