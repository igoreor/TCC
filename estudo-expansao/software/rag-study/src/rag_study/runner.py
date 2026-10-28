"""Experiment executor.

One JSON config fixes questions, corpus, index, prompts, models, ``k``,
budgets, repetitions and seed. Each execution writes a new, never-overwritten
batch directory with the raw JSONL log and a manifest of the environment.
"""

from __future__ import annotations

import hashlib
import importlib.metadata
import json
import os
import platform
import random
import stat
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .logging_utils import JsonlRunLogger
from .pipelines import DirectChatPipeline, RagChatPipeline
from .pricing import load_price_table, make_cost_fn
from .prompts import load_prompt
from .providers import FakeProvider, build_provider
from .retrieval import ExactCosineRetriever, build_embedder
from .retry import FatalProviderError

PACKAGE_ROOT = Path(__file__).resolve().parents[2]
TRACKED_PACKAGES = ["numpy", "pymupdf", "sentence-transformers", "torch", "transformers", "openai", "anthropic"]
STRATEGIES = {"R0": "original", "R1": "rewrite", "R2": "keywords", "R3": "pseudo_document"}


@dataclass
class Unit:
    condition_code: str
    arm: str | None
    pipeline: Any


def canonical_sha256(data: Any) -> str:
    return hashlib.sha256(json.dumps(data, sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest()


def software_version() -> dict[str, str]:
    digest = hashlib.sha256()
    files = sorted((PACKAGE_ROOT / "src").rglob("*.py")) + sorted((PACKAGE_ROOT / "prompts").glob("*.txt"))
    for path in files:
        digest.update(path.relative_to(PACKAGE_ROOT).as_posix().encode("utf-8"))
        digest.update(path.read_bytes())
    return {
        "package_version": importlib.metadata.version("hanseniase-rag-study"),
        "source_sha256": digest.hexdigest(),
    }


def environment() -> dict[str, Any]:
    versions = {}
    for name in TRACKED_PACKAGES:
        try:
            versions[name] = importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError:
            versions[name] = None
    lock = PACKAGE_ROOT / "uv.lock"
    return {
        "python": platform.python_version(),
        "platform": platform.platform(),
        "packages": versions,
        "uv_lock_sha256": hashlib.sha256(lock.read_bytes()).hexdigest() if lock.exists() else None,
    }


def load_questions(path: Path, splits: list[str]) -> list[dict[str, Any]]:
    questions = []
    seen = set()
    with path.open(encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            if not line.strip():
                continue
            item = json.loads(line)
            for key in ("question_id", "text", "split"):
                if not str(item.get(key, "")).strip():
                    raise ValueError(f"{path}:{line_number} missing '{key}'")
            if item["question_id"] in seen:
                raise ValueError(f"duplicate question_id: {item['question_id']}")
            seen.add(item["question_id"])
            if item["split"] in splits:
                questions.append(item)
    if not questions:
        raise ValueError(f"no questions for splits {splits} in {path}")
    return questions


class Experiment:
    def __init__(self, config_path: str | Path, root: str | Path = ".", dry_run: bool = False,
                 allow_api: bool = False, continue_from: list[str | Path] | None = None):
        self.config_path = Path(config_path)
        self.root = Path(root)
        self.config = json.loads(self.config_path.read_text(encoding="utf-8"))
        self.dry_run = dry_run
        self.allow_api = allow_api
        self.continue_from = [Path(path) for path in continue_from or []]

    def _completed_units(self, config_sha: str) -> tuple[set[tuple[str, str, int]], list[dict[str, Any]]]:
        """Units already finished with success in earlier batches of the same
        configuration. A continuation is a new batch: earlier batches are never
        edited, and units that ended in error are run again."""
        done: set[tuple[str, str, int]] = set()
        parents = []
        for batch_dir in self.continue_from:
            manifest = json.loads((batch_dir / "run-manifest.json").read_text(encoding="utf-8"))
            if manifest["config_sha256"] != config_sha:
                raise ValueError(f"{batch_dir} usa outra configuração; só é possível continuar a mesma")
            if manifest.get("dry_run") != self.dry_run:
                raise ValueError(f"{batch_dir}: não misture lotes simulados e reais")
            raw = batch_dir / "raw.jsonl"
            with raw.open(encoding="utf-8") as handle:
                for line in handle:
                    if line.strip():
                        record = json.loads(line)
                        if record["status"] == "success":
                            done.add((record["question_id"], record["condition"], record["repetition"]))
            parents.append({"batch_id": manifest["batch_id"], "status": manifest.get("status"),
                            "raw_sha256": hashlib.sha256(raw.read_bytes()).hexdigest(),
                            "software_sha256": manifest["software"]["source_sha256"]})
        return done, parents

    def path(self, value: str) -> Path:
        return self.root / value

    def _check_models(self) -> None:
        # Retrieval with the original query never calls an LLM.
        if self.dry_run or self.config.get("mode", "full") == "retrieval_original_only":
            return
        for key in self.config["arms"]:
            model = self.config["models"][key]["model"]
            if model.startswith("SET_"):
                raise ValueError(f"model ID for arm '{key}' is a placeholder: {model}")
        if not self.allow_api:
            raise PermissionError("real API calls require --allow-api (use --dry-run to test without cost)")

    def load_prompts(self) -> dict[str, Any]:
        prompts_dir = self.path(self.config["prompts_dir"])
        return {name: load_prompt(prompts_dir / file, Path(file).stem) for name, file in self.config["prompts"].items()}

    def _provider(self, arm: str):
        if self.dry_run:
            return FakeProvider(name=f"fake{arm}", model=f"fake-{arm}-v1")
        spec = dict(self.config["models"][arm])
        if "catalog" in spec:  # Codex model catalog, relative to the workspace root like every config path
            spec["catalog"] = str(self.path(spec["catalog"]))
        return build_provider(spec)

    def build_units(self, retriever, logger, cost_fn) -> list[Unit]:
        cfg = self.config
        prompts = self.load_prompts()
        mode = cfg.get("mode", "full")
        common = {"max_attempts": cfg.get("max_attempts", 3), "cost_fn": cost_fn}
        expansion = cfg.get("expansion", {})
        units: list[Unit] = []

        if mode == "retrieval_original_only":
            pipeline = RagChatPipeline(None, retriever, None, logger, k=cfg["k"], retrieval_only=True, **common)
            return [Unit("R0", None, pipeline)]

        for arm in cfg["arms"]:
            provider = self._provider(arm)
            for code in cfg["conditions"]:
                if code == "D":
                    if mode == "retrieval":
                        continue
                    pipeline = DirectChatPipeline(provider, prompts["direct_answer"], logger,
                                                  cfg["generation"]["max_output_tokens"], **common)
                    units.append(Unit(code, arm, pipeline))
                    continue
                strategy = STRATEGIES[code]
                if mode == "retrieval" and strategy == "original" and any(u.condition_code == "R0" for u in units):
                    continue  # retrieval with the original query does not depend on the arm
                expanded = strategy != "original"
                pipeline = RagChatPipeline(
                    answer_provider=None if mode == "retrieval" else provider,
                    retriever=retriever,
                    answer_system_prompt=None if mode == "retrieval" else prompts["rag_answer"],
                    logger=logger,
                    expansion_provider=provider if expanded else None,
                    expansion_system_prompt=prompts["expansion_system"] if expanded else None,
                    expansion_prompt=prompts[strategy] if expanded else None,
                    expansion_strategy=strategy,
                    k=cfg["k"],
                    max_output_tokens=cfg["generation"]["max_output_tokens"],
                    expansion_max_output_tokens=expansion.get("max_output_tokens", 400),
                    structured_expansion=expansion.get("structured_output", True),
                    retrieval_only=mode == "retrieval",
                    **common,
                )
                units.append(Unit(code, None if (mode == "retrieval" and not expanded) else arm, pipeline))
        return units

    def run(self) -> Path:
        cfg = self.config
        self._check_models()
        questions = load_questions(self.path(cfg["questions"]), cfg["splits"])
        embedder = build_embedder(cfg["embedder"])
        retriever = ExactCosineRetriever.load(self.path(cfg["index_dir"]), self.path(cfg["corpus_dir"]), embedder)
        price_table = load_price_table(self.path(cfg["pricing"])) if cfg.get("pricing") else None
        cost_fn = make_cost_fn(price_table)
        config_sha = canonical_sha256(cfg)
        done, parents = self._completed_units(config_sha)  # validated before any batch folder exists

        batch_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + ("-dryrun" if self.dry_run else "")
        out_dir = self.path(cfg["output_root"]) / cfg["experiment_id"] / batch_id
        out_dir.mkdir(parents=True, exist_ok=False)
        raw_path = out_dir / "raw.jsonl"
        raw_path.touch(exist_ok=False)
        logger = JsonlRunLogger(raw_path)

        units = self.build_units(retriever, logger, cost_fn)
        version = software_version()
        manifest = {
            "experiment_id": cfg["experiment_id"],
            "batch_id": batch_id,
            "status": "running",
            "dry_run": self.dry_run,
            "started_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "config_path": self.config_path.as_posix(),
            "config_sha256": config_sha,
            "config": cfg,
            "software": version,
            "environment": environment(),
            "corpus_snapshot_sha256": retriever.corpus_snapshot,
            "index": retriever.manifest,
            "prompts": {name: {"prompt_id": item.prompt_id, "sha256": item.sha256}
                        for name, item in self.load_prompts().items()},
            "price_table": price_table,
            "units": [{"condition": u.pipeline.condition, "arm": u.arm} for u in units],
            "n_questions": len(questions),
            # links the run to the frozen question file (freeze-log.md)
            "questions_sha256": hashlib.sha256(self.path(cfg["questions"]).read_bytes()).hexdigest(),
            "repetitions": cfg.get("repetitions", 1),
            "seed": cfg["seed"],
            "continues": parents,
        }
        manifest_path = out_dir / "run-manifest.json"
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

        rng = random.Random(cfg["seed"])
        order_index = 0
        statuses: dict[str, int] = {}
        skipped = 0
        abort_reason = None
        try:
            for repetition in range(cfg.get("repetitions", 1)):
                question_order = questions[:]
                rng.shuffle(question_order)
                for question in question_order:
                    unit_order = units[:]
                    rng.shuffle(unit_order)
                    for unit in unit_order:
                        # The full order is always drawn, so a continuation keeps
                        # the original positions (order_index) of the units it runs.
                        if (question["question_id"], unit.pipeline.condition, repetition) in done:
                            order_index += 1
                            skipped += 1
                            continue
                        record = unit.pipeline.run(
                            cfg["experiment_id"], question["question_id"], question["text"],
                            batch_id=batch_id,
                            repetition=repetition,
                            order_index=order_index,
                            question_split=question["split"],
                            corpus_snapshot=retriever.corpus_snapshot,
                            index_id=retriever.index_id,
                            software_version=version["source_sha256"],
                            config_sha256=config_sha,
                        )
                        order_index += 1
                        statuses[record.status] = statuses.get(record.status, 0) + 1
        except FatalProviderError as exc:
            abort_reason = str(exc)

        manifest.update({
            "status": "aborted" if abort_reason else "completed",
            "finished_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "n_records": sum(statuses.values()),
            "n_skipped_already_done": skipped,
            "record_status_counts": statuses,
            "raw_sha256": hashlib.sha256(raw_path.read_bytes()).hexdigest(),
        })
        if abort_reason:
            manifest["abort_reason"] = abort_reason
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
        # Raw outputs are immutable: corrections must be a new batch, never an edit.
        os.chmod(raw_path, stat.S_IREAD)
        os.chmod(manifest_path, stat.S_IREAD)
        if abort_reason:
            raise FatalProviderError(f"lote {batch_id} interrompido após {sum(statuses.values())} registros: "
                                     f"{abort_reason}. Para retomar: run --continue-from {out_dir}")
        return out_dir
