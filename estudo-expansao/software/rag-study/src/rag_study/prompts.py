from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class PromptArtifact:
    prompt_id: str
    text: str
    sha256: str


def load_prompt(path: str | Path, prompt_id: str | None = None) -> PromptArtifact:
    prompt_path = Path(path)
    text = prompt_path.read_text(encoding="utf-8")
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return PromptArtifact(prompt_id or prompt_path.stem, text, digest)


def render_query_prompt(prompt: PromptArtifact, query: str) -> str:
    return prompt.text.replace("{{query}}", query)


EXPANSION_KEYS = {
    "rewrite": "expanded_query",
    "keywords": "search_terms",
    "pseudo_document": "hypothetical_passage",
}

KEYWORD_COUNT = 5


def expansion_json_schema(strategy: str) -> dict:
    """JSON Schema sent to the provider's structured-output option.

    Kept minimal (no minItems/maxItems) so the same schema is accepted by both
    providers; the exact item count is enforced by ``parse_expansion``.
    """
    if strategy == "keywords":
        value_schema: dict = {"type": "array", "items": {"type": "string"}}
    elif strategy in ("rewrite", "pseudo_document"):
        value_schema = {"type": "string"}
    else:
        raise ValueError(f"unsupported expansion strategy: {strategy}")
    key = EXPANSION_KEYS[strategy]
    return {
        "type": "object",
        "properties": {key: value_schema},
        "required": [key],
        "additionalProperties": False,
    }


_FENCE = re.compile(r"^\s*```(?:json)?\s*\n(.*?)\n\s*```\s*$", re.DOTALL)


def _load_json(raw_text: str) -> tuple[dict, str]:
    try:
        return json.loads(raw_text), "json"
    except json.JSONDecodeError:
        match = _FENCE.match(raw_text)
        if not match:
            raise
        return json.loads(match.group(1)), "fenced_json"


def parse_expansion_with_mode(strategy: str, raw_text: str) -> tuple[str, str]:
    """Validate an expander output and return ``(retrieval_query, parse_mode)``.

    ``parse_mode`` is ``json`` or ``fenced_json``; any other deviation from the
    requested format raises ``ValueError`` so the pipeline can apply the
    pre-specified fallback and log it.
    """
    if strategy not in EXPANSION_KEYS:
        raise ValueError(f"unsupported expansion strategy: {strategy}")
    try:
        payload, mode = _load_json(raw_text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"expansion output is not valid JSON: {exc}") from exc
    if not isinstance(payload, dict):
        raise ValueError("expansion output must be a JSON object")
    value = payload.get(EXPANSION_KEYS[strategy])
    if strategy == "keywords":
        if (
            not isinstance(value, list)
            or len(value) != KEYWORD_COUNT
            or not all(isinstance(term, str) and term.strip() for term in value)
        ):
            raise ValueError("keywords output must contain exactly five non-empty strings")
        value = " ; ".join(term.strip() for term in value)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"invalid output for strategy: {strategy}")
    return value.strip(), mode


def parse_expansion(strategy: str, raw_text: str) -> str:
    return parse_expansion_with_mode(strategy, raw_text)[0]
