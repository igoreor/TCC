import hashlib
import json

import pytest

CHUNKS = [
    ("tc-c0000", "A poliquimioterapia única é o tratamento da hanseníase multibacilar por doze meses.", ["10 Abordagem"]),
    ("tc-c0001", "A reação hansênica tipo 1 é tratada com prednisona.", ["10 Abordagem", "10.1.2 Reações"]),
    ("tc-c0002", "A baciloscopia negativa não exclui o diagnóstico de hanseníase.", ["7 Exames"]),
    ("tc-c0003", "Contatos domiciliares devem ser examinados anualmente por cinco anos.", ["13 Contatos"]),
]


def write_tiny_corpus(directory):
    directory.mkdir(parents=True)
    with (directory / "chunks.jsonl").open("w", encoding="utf-8", newline="\n") as handle:
        for ordinal, (chunk_id, text, path) in enumerate(CHUNKS):
            handle.write(json.dumps({
                "chunk_id": chunk_id, "document_id": "DOC", "ordinal": ordinal, "text": text,
                "embed_text": f"{' > '.join(path)}\n{text}", "section_path": path, "sections_touched": path[-1:],
                "page_start": ordinal + 1, "page_end": ordinal + 1, "n_words": len(text.split()),
                "labels": [], "text_sha256": hashlib.sha256(text.encode()).hexdigest(),
            }, ensure_ascii=False, sort_keys=True) + "\n")
    snapshot = hashlib.sha256((directory / "chunks.jsonl").read_bytes()).hexdigest()
    (directory / "manifest.json").write_text(json.dumps({"corpus_id": "tc", "snapshot_sha256": snapshot}),
                                             encoding="utf-8")
    return directory


@pytest.fixture
def tiny_corpus(tmp_path):
    return write_tiny_corpus(tmp_path / "corpus")


@pytest.fixture
def tiny_index(tiny_corpus, tmp_path):
    from rag_study.retrieval import HashingEmbedder, build_index

    build_index(tiny_corpus, HashingEmbedder(), tmp_path / "index", "tc-hash")
    return tmp_path / "index"
