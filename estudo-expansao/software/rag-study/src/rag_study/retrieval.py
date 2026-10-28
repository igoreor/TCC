"""Dense retrieval with exact cosine search over a frozen corpus snapshot.

Exact (brute-force) search is used instead of an approximate index such as
HNSW: with a few hundred chunks it is fast, and it removes approximation error
and insertion-order effects from the comparison between conditions.
"""

from __future__ import annotations

import hashlib
import json
import platform
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Protocol

import numpy as np

from .corpus import load_chunks, sha256_file
from .models import RetrievedChunk


class Embedder(Protocol):
    def encode(self, texts: list[str]) -> np.ndarray:
        """Return L2-normalized float32 vectors, one row per text."""
        ...

    def describe(self) -> dict[str, Any]:
        ...


class SentenceTransformerEmbedder:
    def __init__(self, model_id: str, revision: str, device: str = "cpu", batch_size: int = 16):
        from sentence_transformers import SentenceTransformer

        self.model_id = model_id
        self.revision = revision
        self.device = device
        self.batch_size = batch_size
        self.model = SentenceTransformer(model_id, revision=revision, device=device)

    def encode(self, texts: list[str]) -> np.ndarray:
        vectors = self.model.encode(
            texts,
            batch_size=self.batch_size,
            normalize_embeddings=True,
            convert_to_numpy=True,
            show_progress_bar=False,
        )
        return np.asarray(vectors, dtype=np.float32)

    def describe(self) -> dict[str, Any]:
        import sentence_transformers
        import torch

        return {
            "type": "sentence-transformers",
            "model_id": self.model_id,
            "revision": self.revision,
            "dimension": getattr(self.model, "get_embedding_dimension",
                                 self.model.get_sentence_embedding_dimension)(),
            "max_seq_length": self.model.max_seq_length,
            "normalize": True,
            "device": self.device,
            "batch_size": self.batch_size,
            "sentence_transformers_version": sentence_transformers.__version__,
            "torch_version": torch.__version__,
        }


class HashingEmbedder:
    """Deterministic bag-of-words embedder for tests and offline smoke runs."""

    def __init__(self, dimension: int = 64):
        self.dimension = dimension

    def encode(self, texts: list[str]) -> np.ndarray:
        matrix = np.zeros((len(texts), self.dimension), dtype=np.float32)
        for row, text in enumerate(texts):
            for token in text.lower().split():
                bucket = int(hashlib.sha256(token.encode("utf-8")).hexdigest(), 16) % self.dimension
                matrix[row, bucket] += 1.0
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return matrix / norms

    def describe(self) -> dict[str, Any]:
        return {"type": "hashing", "model_id": "hashing-bow", "revision": "1", "dimension": self.dimension}


def build_embedder(spec: dict[str, Any]) -> Embedder:
    if spec["type"] == "sentence-transformers":
        return SentenceTransformerEmbedder(spec["model_id"], spec["revision"], spec.get("device", "cpu"),
                                           spec.get("batch_size", 16))
    if spec["type"] == "hashing":
        return HashingEmbedder(spec.get("dimension", 64))
    raise ValueError(f"unknown embedder type: {spec['type']}")


def _array_sha256(array: np.ndarray) -> str:
    return hashlib.sha256(np.ascontiguousarray(array).tobytes()).hexdigest()


def build_index(corpus_dir: str | Path, embedder: Embedder, output_dir: str | Path, index_id: str) -> dict[str, Any]:
    corpus_manifest = json.loads((Path(corpus_dir) / "manifest.json").read_text(encoding="utf-8"))
    actual_snapshot = sha256_file(Path(corpus_dir) / "chunks.jsonl")
    if actual_snapshot != corpus_manifest["snapshot_sha256"]:
        raise ValueError("corpus chunks.jsonl does not match its manifest snapshot hash")
    chunks = load_chunks(corpus_dir)
    started = time.perf_counter()
    embeddings = embedder.encode([chunk["embed_text"] for chunk in chunks])
    seconds = time.perf_counter() - started

    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=False)
    np.save(out / "embeddings.npy", embeddings)
    ids = [chunk["chunk_id"] for chunk in chunks]
    (out / "ids.json").write_text(json.dumps(ids, ensure_ascii=False), encoding="utf-8")
    manifest = {
        "index_id": index_id,
        "created_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "corpus_id": corpus_manifest["corpus_id"],
        "corpus_snapshot_sha256": actual_snapshot,
        "text_field": "embed_text",
        "embedder": embedder.describe(),
        "similarity": "cosine (inner product of L2-normalized vectors)",
        "search": "exact brute-force; ties broken by corpus order",
        "n_vectors": int(embeddings.shape[0]),
        "dimension": int(embeddings.shape[1]),
        "embeddings_sha256": _array_sha256(embeddings),
        "build_seconds": round(seconds, 2),
        "platform": {"python": platform.python_version(), "machine": platform.machine(), "system": platform.system()},
    }
    (out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return manifest


class ExactCosineRetriever:
    def __init__(self, chunks: list[dict[str, Any]], embeddings: np.ndarray, embedder: Embedder,
                 manifest: dict[str, Any]):
        self.chunks = chunks
        self.embeddings = embeddings
        self.embedder = embedder
        self.manifest = manifest
        self.last_latency_ms: float | None = None

    @classmethod
    def load(cls, index_dir: str | Path, corpus_dir: str | Path, embedder: Embedder) -> "ExactCosineRetriever":
        index_dir = Path(index_dir)
        manifest = json.loads((index_dir / "manifest.json").read_text(encoding="utf-8"))
        snapshot = sha256_file(Path(corpus_dir) / "chunks.jsonl")
        if snapshot != manifest["corpus_snapshot_sha256"]:
            raise ValueError("index was built from a different corpus snapshot")
        expected = manifest["embedder"]
        actual = embedder.describe()
        for key in ("model_id", "revision", "dimension"):
            if expected.get(key) != actual.get(key):
                raise ValueError(f"embedder mismatch on {key}: index={expected.get(key)} runtime={actual.get(key)}")
        embeddings = np.load(index_dir / "embeddings.npy")
        if _array_sha256(embeddings) != manifest["embeddings_sha256"]:
            raise ValueError("embeddings.npy does not match the index manifest")
        chunks = load_chunks(corpus_dir)
        ids = json.loads((index_dir / "ids.json").read_text(encoding="utf-8"))
        if ids != [chunk["chunk_id"] for chunk in chunks]:
            raise ValueError("index ids do not match corpus order")
        return cls(chunks, embeddings, embedder, manifest)

    @property
    def index_id(self) -> str:
        return self.manifest["index_id"]

    @property
    def corpus_snapshot(self) -> str:
        return self.manifest["corpus_snapshot_sha256"]

    def retrieve(self, query: str, k: int) -> list[RetrievedChunk]:
        started = time.perf_counter()
        vector = self.embedder.encode([query])[0]
        scores = self.embeddings @ vector
        # lexsort uses the last key as primary: descending score, then corpus order.
        order = np.lexsort((np.arange(len(scores)), -scores))[:k]
        self.last_latency_ms = (time.perf_counter() - started) * 1000
        results = []
        for rank, position in enumerate(order, start=1):
            chunk = self.chunks[int(position)]
            results.append(RetrievedChunk(
                chunk_id=chunk["chunk_id"],
                document_id=chunk["document_id"],
                text=chunk["text"],
                score=float(scores[position]),
                metadata={
                    "rank": rank,
                    "page_start": chunk["page_start"],
                    "page_end": chunk["page_end"],
                    "section_path": chunk["section_path"],
                },
            ))
        return results
