from __future__ import annotations

import hashlib
import uuid
from collections.abc import Callable
from datetime import datetime, timezone
from typing import Protocol

from .logging_utils import JsonlRunLogger
from .models import GenerationResult, RetrievedChunk, RunRecord, StepRecord
from .prompts import PromptArtifact, expansion_json_schema, parse_expansion_with_mode, render_query_prompt
from .providers import TextProvider
from .retry import RetryExhausted, call_with_retry

STRATEGY_CODES = {"original": "R0", "rewrite": "R1", "keywords": "R2", "pseudo_document": "R3"}

CostFn = Callable[[StepRecord], float | None]


class Retriever(Protocol):
    def retrieve(self, query: str, k: int) -> list[RetrievedChunk]:
        ...


def context_from_chunks(chunks: list[RetrievedChunk]) -> str:
    return "\n\n".join(
        f"[chunk:{chunk.chunk_id} document:{chunk.document_id}]\n{chunk.text}" for chunk in chunks
    )


def rag_user_prompt(context: str, query: str) -> str:
    return f"Contexto recuperado:\n{context}\n\nPergunta original:\n{query}"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds")


def _llm_step(name: str, provider: TextProvider, result: GenerationResult, attempts: int) -> StepRecord:
    return StepRecord(
        name=name,
        provider=result.provider,
        requested_model=result.requested_model,
        returned_model=result.returned_model,
        input_tokens=result.input_tokens,
        output_tokens=result.output_tokens,
        reasoning_tokens=result.reasoning_tokens,
        latency_ms=result.latency_ms,
        attempts=attempts,
        request_id=result.request_id,
        stop_reason=result.stop_reason,
        parameters=result.parameters,
    )


def _failed_step(name: str, provider: TextProvider, error: RetryExhausted) -> StepRecord:
    return StepRecord(
        name=name,
        status="error",
        provider=provider.name,
        requested_model=provider.model,
        attempts=error.attempts,
        error=f"{type(error.last_error).__name__}: {error.last_error}",
    )


def _finalize(record: RunRecord, cost_fn: CostFn | None) -> None:
    llm_steps = [step for step in record.steps if step.provider is not None]
    record.input_tokens = sum(step.input_tokens or 0 for step in llm_steps) or None
    record.output_tokens = sum(step.output_tokens or 0 for step in llm_steps) or None
    record.latency_ms = sum(step.latency_ms or 0.0 for step in record.steps)
    record.request_ids = [step.request_id for step in record.steps if step.request_id]
    if cost_fn is not None:
        for step in llm_steps:
            step.estimated_cost_usd = cost_fn(step)
        costs = [step.estimated_cost_usd for step in llm_steps]
        record.estimated_cost_usd = None if any(c is None for c in costs) else round(sum(costs), 8)


class DirectChatPipeline:
    """Condition D: the question goes to the model with no retrieved context."""

    def __init__(
        self,
        provider: TextProvider,
        answer_system_prompt: PromptArtifact,
        logger: JsonlRunLogger,
        max_output_tokens: int = 800,
        max_attempts: int = 3,
        cost_fn: CostFn | None = None,
        sleep=None,
    ):
        self.provider = provider
        self.answer_system_prompt = answer_system_prompt
        self.logger = logger
        self.max_output_tokens = max_output_tokens
        self.max_attempts = max_attempts
        self.cost_fn = cost_fn
        self.retry_kwargs = {"sleep": sleep} if sleep else {}

    @property
    def condition(self) -> str:
        return f"D-{self.provider.name.upper()}"

    def run(self, experiment_id: str, question_id: str, query: str, **context) -> RunRecord:
        record = RunRecord(
            experiment_id=experiment_id,
            run_id=str(uuid.uuid4()),
            question_id=question_id,
            condition=self.condition,
            original_query=query,
            provider=self.provider.name,
            model=self.provider.model,
            rag_enabled=False,
            expansion_strategy=None,
            prompt_ids=[self.answer_system_prompt.prompt_id],
            prompt_hashes={self.answer_system_prompt.prompt_id: self.answer_system_prompt.sha256},
            mode="direct",
            expansion_status="not_applicable",
            timestamp_utc=_now(),
            **context,
        )
        try:
            result, attempts = call_with_retry(
                lambda: self.provider.generate(self.answer_system_prompt.text, query, self.max_output_tokens),
                self.max_attempts, **self.retry_kwargs,
            )
            record.steps.append(_llm_step("generation", self.provider, result, attempts))
            record.answer = result.text
            record.returned_model = result.returned_model
        except RetryExhausted as exc:
            record.steps.append(_failed_step("generation", self.provider, exc))
            record.status = "error"
            record.error = f"generation: {exc}"
        _finalize(record, self.cost_fn)
        self.logger.append(record)
        return record


class RagChatPipeline:
    """Conditions R0-R3 (and retrieval-only runs).

    Fairness rules enforced here:
    - the generator always receives the original question;
    - every strategy uses the same ``k``, generator, answer prompt and
      ``max_output_tokens``; expansion has its own cap, equal across strategies;
    - if expansion fails (API error or invalid output), retrieval falls back to
      the original query and the run is flagged ``expansion_status=fallback_*``
      instead of being dropped, so missing data does not differ by condition.
    """

    def __init__(
        self,
        answer_provider: TextProvider | None,
        retriever: Retriever,
        answer_system_prompt: PromptArtifact | None,
        logger: JsonlRunLogger,
        expansion_provider: TextProvider | None = None,
        expansion_system_prompt: PromptArtifact | None = None,
        expansion_prompt: PromptArtifact | None = None,
        expansion_strategy: str = "original",
        k: int = 5,
        max_output_tokens: int = 800,
        expansion_max_output_tokens: int = 400,
        structured_expansion: bool = True,
        retrieval_only: bool = False,
        max_attempts: int = 3,
        cost_fn: CostFn | None = None,
        sleep=None,
    ):
        if expansion_strategy not in STRATEGY_CODES:
            raise ValueError(f"unsupported expansion strategy: {expansion_strategy}")
        if expansion_strategy != "original" and not all(
            [expansion_provider, expansion_system_prompt, expansion_prompt]
        ):
            raise ValueError("expanded RAG requires provider, system prompt, and strategy prompt")
        if not retrieval_only and not (answer_provider and answer_system_prompt):
            raise ValueError("RAG generation requires an answer provider and answer prompt")
        self.answer_provider = answer_provider
        self.retriever = retriever
        self.answer_system_prompt = answer_system_prompt
        self.logger = logger
        self.expansion_provider = expansion_provider
        self.expansion_system_prompt = expansion_system_prompt
        self.expansion_prompt = expansion_prompt
        self.expansion_strategy = expansion_strategy
        self.k = k
        self.max_output_tokens = max_output_tokens
        self.expansion_max_output_tokens = expansion_max_output_tokens
        self.structured_expansion = structured_expansion
        self.retrieval_only = retrieval_only
        self.max_attempts = max_attempts
        self.cost_fn = cost_fn
        self.retry_kwargs = {"sleep": sleep} if sleep else {}

    @property
    def condition(self) -> str:
        code = STRATEGY_CODES[self.expansion_strategy]
        if self.retrieval_only:
            owner = self.expansion_provider.name.upper() if self.expansion_provider else "NONE"
            return f"{code}-RETRIEVAL-{owner}"
        return f"{code}-{self.answer_provider.name.upper()}"

    def _prompt_artifacts(self) -> list[PromptArtifact]:
        items = [self.answer_system_prompt, self.expansion_system_prompt, self.expansion_prompt]
        return [item for item in items if item is not None]

    def _expand(self, record: RunRecord, query: str) -> str:
        rendered = render_query_prompt(self.expansion_prompt, query)
        schema = expansion_json_schema(self.expansion_strategy) if self.structured_expansion else None
        try:
            result, attempts = call_with_retry(
                lambda: self.expansion_provider.generate(
                    self.expansion_system_prompt.text, rendered, self.expansion_max_output_tokens, schema
                ),
                self.max_attempts, **self.retry_kwargs,
            )
        except RetryExhausted as exc:
            record.steps.append(_failed_step("expansion", self.expansion_provider, exc))
            record.expansion_status = "fallback_api_error"
            return query
        step = _llm_step("expansion", self.expansion_provider, result, attempts)
        record.steps.append(step)
        record.expansion_raw = result.text
        try:
            expanded, mode = parse_expansion_with_mode(self.expansion_strategy, result.text)
        except ValueError as exc:
            step.status = "invalid_output"
            step.error = str(exc)
            record.expansion_status = "fallback_invalid_output"
            return query
        record.expanded_query = expanded
        record.expansion_parse_mode = mode
        record.expansion_status = "ok"
        return expanded

    def run(self, experiment_id: str, question_id: str, query: str, **context) -> RunRecord:
        artifacts = self._prompt_artifacts()
        record = RunRecord(
            experiment_id=experiment_id,
            run_id=str(uuid.uuid4()),
            question_id=question_id,
            condition=self.condition,
            original_query=query,
            provider=self.answer_provider.name if self.answer_provider else "none",
            model=self.answer_provider.model if self.answer_provider else "none",
            rag_enabled=True,
            expansion_strategy=self.expansion_strategy,
            prompt_ids=[item.prompt_id for item in artifacts],
            prompt_hashes={item.prompt_id: item.sha256 for item in artifacts},
            mode="retrieval" if self.retrieval_only else "rag",
            timestamp_utc=_now(),
            expander_provider=self.expansion_provider.name if self.expansion_provider else None,
            expander_model=self.expansion_provider.model if self.expansion_provider else None,
            k=self.k,
            expansion_status="not_applicable" if self.expansion_strategy == "original" else None,
            **context,
        )
        retrieval_query = query
        if self.expansion_strategy != "original":
            retrieval_query = self._expand(record, query)
        record.retrieval_query = retrieval_query

        try:
            chunks = self.retriever.retrieve(retrieval_query, self.k)
        except Exception as exc:
            record.steps.append(StepRecord(name="retrieval", status="error", error=f"{type(exc).__name__}: {exc}"))
            record.status = "error"
            record.error = f"retrieval: {exc}"
            _finalize(record, self.cost_fn)
            self.logger.append(record)
            return record
        record.steps.append(StepRecord(
            name="retrieval",
            latency_ms=getattr(self.retriever, "last_latency_ms", None),
            parameters={"k": self.k},
        ))
        record.retrieved_chunks = chunks
        context_text = context_from_chunks(chunks)
        record.context_sha256 = hashlib.sha256(context_text.encode("utf-8")).hexdigest()

        if not self.retrieval_only:
            try:
                result, attempts = call_with_retry(
                    lambda: self.answer_provider.generate(
                        self.answer_system_prompt.text, rag_user_prompt(context_text, query), self.max_output_tokens
                    ),
                    self.max_attempts, **self.retry_kwargs,
                )
                record.steps.append(_llm_step("generation", self.answer_provider, result, attempts))
                record.answer = result.text
                record.returned_model = result.returned_model
            except RetryExhausted as exc:
                record.steps.append(_failed_step("generation", self.answer_provider, exc))
                record.status = "error"
                record.error = f"generation: {exc}"
        _finalize(record, self.cost_fn)
        self.logger.append(record)
        return record
