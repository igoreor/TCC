"""Cost estimation from an archived price table.

Prices are never hard-coded: the table must be copied from the providers'
official pricing pages on the execution date, with URL and retrieval date, so
that reported costs can be audited later. Reasoning/thinking tokens are part
of ``output_tokens`` for both providers and are billed as output.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .models import StepRecord


def load_price_table(path: str | Path) -> dict[str, Any]:
    table = json.loads(Path(path).read_text(encoding="utf-8"))
    for key in ("source_urls", "retrieved_on", "currency", "models"):
        if key not in table:
            raise ValueError(f"price table missing '{key}'")
    return table


def make_cost_fn(table: dict[str, Any] | None):
    if table is None:
        return None
    models = table["models"]

    def cost(step: StepRecord) -> float | None:
        entry = models.get(f"{step.provider}:{step.requested_model}")
        if not entry or step.input_tokens is None or step.output_tokens is None:
            return None
        input_price = entry.get("input_per_mtok")
        output_price = entry.get("output_per_mtok")
        if input_price is None or output_price is None:
            return None
        return round(step.input_tokens * input_price / 1e6 + step.output_tokens * output_price / 1e6, 8)

    return cost
