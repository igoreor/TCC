from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass(frozen=True)
class GenerationResult:
    text: str
    provider: str
    requested_model: str
    returned_model: str | None
    input_tokens: int | None
    output_tokens: int | None
    latency_ms: float
    request_id: str | None = None
    stop_reason: str | None = None
    reasoning_tokens: int | None = None
    parameters: dict[str, Any] = field(default_factory=dict)
    raw_metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class RetrievedChunk:
    chunk_id: str
    document_id: str
    text: str
    score: float
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class StepRecord:
    """One call inside a run: expansion, retrieval or generation.

    Steps are logged separately so that the extra cost and latency of query
    expansion stay visible instead of being folded into the answer totals.
    """

    name: str
    status: str = "success"
    provider: str | None = None
    requested_model: str | None = None
    returned_model: str | None = None
    input_tokens: int | None = None
    output_tokens: int | None = None
    reasoning_tokens: int | None = None
    latency_ms: float | None = None
    attempts: int = 1
    request_id: str | None = None
    stop_reason: str | None = None
    parameters: dict[str, Any] = field(default_factory=dict)
    estimated_cost_usd: float | None = None
    error: str | None = None


@dataclass
class RunRecord:
    experiment_id: str
    run_id: str
    question_id: str
    condition: str
    original_query: str
    provider: str
    model: str
    rag_enabled: bool
    expansion_strategy: str | None
    prompt_ids: list[str]
    prompt_hashes: dict[str, str]
    mode: str = "rag"
    timestamp_utc: str | None = None
    batch_id: str | None = None
    repetition: int = 0
    order_index: int | None = None
    question_split: str | None = None
    expander_provider: str | None = None
    expander_model: str | None = None
    returned_model: str | None = None
    expanded_query: str | None = None
    expansion_raw: str | None = None
    expansion_status: str | None = None
    expansion_parse_mode: str | None = None
    retrieval_query: str | None = None
    k: int | None = None
    retrieved_chunks: list[RetrievedChunk] = field(default_factory=list)
    context_sha256: str | None = None
    answer: str | None = None
    input_tokens: int | None = None
    output_tokens: int | None = None
    latency_ms: float | None = None
    request_ids: list[str] = field(default_factory=list)
    steps: list[StepRecord] = field(default_factory=list)
    estimated_cost_usd: float | None = None
    corpus_snapshot: str | None = None
    index_id: str | None = None
    software_version: str | None = None
    config_sha256: str | None = None
    status: str = "success"
    error: str | None = None
    extra: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        # Chunk text is recoverable from the frozen corpus snapshot; logging
        # identifiers, scores and the context hash keeps the raw log auditable
        # without duplicating the corpus in every record.
        for chunk in data["retrieved_chunks"]:
            chunk.pop("text", None)
        return data
