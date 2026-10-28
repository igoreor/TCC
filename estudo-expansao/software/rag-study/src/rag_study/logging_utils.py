from __future__ import annotations

import json
from pathlib import Path

from .models import RunRecord


class JsonlRunLogger:
    def __init__(self, output_path: str | Path):
        self.output_path = Path(output_path)

    def append(self, record: RunRecord) -> None:
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        with self.output_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record.to_dict(), ensure_ascii=False, sort_keys=True) + "\n")
