"""Local service that lets the NexoHansen interface show the study (D41).

It runs only on the author's machine, bound to the loopback interface:

- ``GET /results`` and ``GET /results/<experiment>/<batch>`` read batches
  already recorded under ``research/runs``. Only batches listed in the config
  are exposed, and nothing is written to them.
- ``POST /compare`` runs one question through the same pipelines as the
  experiment (same corpus, index, prompts, k and providers). A live answer is a
  demonstration, not data: it goes to ``demo_log_dir`` and never to
  ``research/runs``.

Requests that carry an ``Origin`` header come from a browser and are refused,
so a web page cannot spend the author's subscription; the NexoHansen backend
calls this service server-side.
"""
from __future__ import annotations

import hmac
import json
import os
import threading
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from uuid import uuid4

from .corpus import load_chunks
from .logging_utils import JsonlRunLogger
from .retrieval import ExactCosineRetriever, build_embedder
from .runner import Experiment

CONDITION_ORDER = ["D", "R0", "R1", "R2", "R3"]
CONDITION_LABELS = {
    "D": "Sem RAG",
    "R0": "RAG",
    "R1": "RAG + reescrita",
    "R2": "RAG + palavras-chave",
    "R3": "RAG + pseudodocumento",
}
LOOPBACK_HOSTS = {"127.0.0.1", "::1", "localhost"}
MAX_QUESTION_CHARS = 2000
MAX_BODY_BYTES = 64 * 1024
EXCERPT_CHARS = 600
TOKEN_ENV = "RAG_STUDY_SERVE_TOKEN"


class BusyError(RuntimeError):
    """Another live comparison is still running."""


class NotFoundError(LookupError):
    pass


class _LockedLogger:
    """Conditions run in parallel threads; appends to the demo log must not interleave."""

    def __init__(self, logger: JsonlRunLogger):
        self._logger = logger
        self._lock = threading.Lock()

    def append(self, record) -> None:
        with self._lock:
            self._logger.append(record)


def _excerpt(text: str | None) -> str | None:
    if text is None or len(text) <= EXCERPT_CHARS:
        return text
    return text[:EXCERPT_CHARS].rsplit(" ", 1)[0] + " …"


def condition_code(condition: str) -> str:
    """``R1-OPENAI`` -> ``R1``; ``D-CLAUDE_CLI`` -> ``D``."""
    return condition.split("-", 1)[0]


def record_view(record: dict[str, Any], chunk_lookup: dict[str, dict[str, Any]]) -> dict[str, Any]:
    """What the interface shows for one run record (live or recorded)."""
    code = condition_code(record["condition"])
    sources = []
    for position, chunk in enumerate(record.get("retrieved_chunks") or [], start=1):
        metadata = chunk.get("metadata") or {}
        corpus_chunk = chunk_lookup.get(chunk["chunk_id"], {})
        section_path = metadata.get("section_path") or corpus_chunk.get("section_path") or []
        sources.append({
            "rank": metadata.get("rank", position),
            "chunk_id": chunk["chunk_id"],
            "document_id": chunk.get("document_id"),
            "score": chunk.get("score"),
            "section": " > ".join(section_path),
            "page_start": metadata.get("page_start", corpus_chunk.get("page_start")),
            "page_end": metadata.get("page_end", corpus_chunk.get("page_end")),
            "excerpt": _excerpt(chunk.get("text") or corpus_chunk.get("text")),
        })
    return {
        "condition": code,
        "label": CONDITION_LABELS.get(code, code),
        "provider": record.get("provider"),
        "model": record.get("model"),
        "returned_model": record.get("returned_model"),
        "status": record.get("status"),
        "error": record.get("error"),
        "answer": record.get("answer"),
        "retrieval_query": None if code == "D" else record.get("retrieval_query"),
        "expansion_status": record.get("expansion_status"),
        "latency_ms": record.get("latency_ms"),
        "output_tokens": record.get("output_tokens"),
        "sources": sources,
    }


def _condition_rank(code: str) -> int:
    return CONDITION_ORDER.index(code) if code in CONDITION_ORDER else len(CONDITION_ORDER)


class StudyService:
    def __init__(self, config_path: str | Path, root: str | Path = ".", dry_run: bool = False,
                 allow_api: bool = False, retriever: ExactCosineRetriever | None = None):
        self.experiment = Experiment(config_path, root, dry_run=dry_run, allow_api=allow_api)
        self.config = cfg = self.experiment.config
        if cfg.get("mode", "full") != "full":
            raise ValueError("a configuração da demonstração precisa de mode=full")
        self.experiment._check_models()  # same gate as `run`: --allow-api, no placeholder model IDs
        self.dry_run = dry_run

        log_dir = self.experiment.path(cfg["demo_log_dir"]).resolve()
        runs_dir = self.experiment.path(cfg["output_root"]).resolve()
        if log_dir == runs_dir or runs_dir in log_dir.parents:
            raise ValueError("demo_log_dir não pode ficar dentro de output_root: respostas ao vivo não são dados")

        if retriever is None:
            retriever = ExactCosineRetriever.load(self.experiment.path(cfg["index_dir"]),
                                                  self.experiment.path(cfg["corpus_dir"]),
                                                  build_embedder(cfg["embedder"]))
        self.retriever = retriever
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + ("-dryrun" if dry_run else "")
        self.batch_id = f"live-{stamp}"
        self.log_path = log_dir / f"{self.batch_id}.jsonl"
        logger = _LockedLogger(JsonlRunLogger(self.log_path))
        self.units = {(unit.arm, unit.condition_code): unit
                      for unit in self.experiment.build_units(retriever, logger, None)}
        self._live_chunks = {chunk["chunk_id"]: chunk for chunk in retriever.chunks}
        self._corpora: dict[str, dict[str, dict[str, Any]]] = {}
        self._busy = threading.Lock()

    # ---- status -------------------------------------------------------------

    def status(self) -> dict[str, Any]:
        cfg = self.config
        return {
            "experiment_id": cfg["experiment_id"],
            "dry_run": self.dry_run,
            "corpus_dir": cfg["corpus_dir"],
            "corpus_snapshot_sha256": self.retriever.corpus_snapshot,
            "k": cfg["k"],
            "arms": [{"arm": arm, "provider": cfg["models"][arm]["provider"], "model": cfg["models"][arm]["model"]}
                     for arm in cfg["arms"]],
            "conditions": [{"code": code, "label": CONDITION_LABELS.get(code, code)}
                           for code in cfg["conditions"]],
        }

    # ---- live comparison ----------------------------------------------------

    def compare(self, question: Any, arm: Any, conditions: Any) -> dict[str, Any]:
        if not isinstance(question, str) or not question.strip():
            raise ValueError("a pergunta está vazia")
        question = question.strip()
        if len(question) > MAX_QUESTION_CHARS:
            raise ValueError(f"a pergunta passa de {MAX_QUESTION_CHARS} caracteres")
        if arm not in self.config["arms"]:
            raise ValueError(f"braço desconhecido: {arm!r}; use um de {self.config['arms']}")
        if (not isinstance(conditions, list) or not conditions
                or any(code not in self.config["conditions"] for code in conditions)):
            raise ValueError(f"condições inválidas; use uma ou mais de {self.config['conditions']}")
        conditions = sorted(set(conditions), key=_condition_rank)

        if not self._busy.acquire(blocking=False):
            raise BusyError("outra comparação ainda está em andamento")
        try:
            question_id = f"live-{uuid4().hex[:8]}"
            with ThreadPoolExecutor(max_workers=len(conditions)) as pool:
                futures = {code: pool.submit(self._run_unit, arm, code, question_id, question)
                           for code in conditions}
                results = [futures[code].result() for code in conditions]
        finally:
            self._busy.release()
        spec = self.config["models"][arm]
        return {"question_id": question_id, "question": question, "arm": arm, "provider": spec["provider"],
                "model": spec["model"], "dry_run": self.dry_run, "log": self.log_path.name, "results": results}

    def _run_unit(self, arm: str, code: str, question_id: str, question: str) -> dict[str, Any]:
        unit = self.units[(arm, code)]
        try:
            record = unit.pipeline.run(self.config["experiment_id"], question_id, question,
                                       batch_id=self.batch_id, question_split="demo")
        except Exception as exc:  # FatalProviderError (plan limit, login) and anything else
            return {"condition": code, "label": CONDITION_LABELS.get(code, code), "status": "error",
                    "error": f"{type(exc).__name__}: {exc}", "answer": None, "retrieval_query": None,
                    "expansion_status": None, "latency_ms": None, "output_tokens": None, "sources": [],
                    "provider": self.config["models"][arm]["provider"],
                    "model": self.config["models"][arm]["model"], "returned_model": None}
        return record_view(record.to_dict(), self._live_chunks)

    # ---- recorded batches ---------------------------------------------------

    def _batch_entries(self) -> list[dict[str, Any]]:
        entries = []
        for item in self.config.get("result_batches", []):
            batch_dir = self.experiment.path(item["path"])
            manifest = json.loads((batch_dir / "run-manifest.json").read_text(encoding="utf-8"))
            entries.append({"dir": batch_dir, "manifest": manifest, "label": item.get("label", ""),
                            "note": item.get("note", ""),
                            "id": f"{manifest['experiment_id']}/{manifest['batch_id']}"})
        return entries

    @staticmethod
    def _summary(entry: dict[str, Any]) -> dict[str, Any]:
        manifest = entry["manifest"]
        config = manifest["config"]
        return {
            "id": entry["id"],
            "experiment_id": manifest["experiment_id"],
            "batch_id": manifest["batch_id"],
            "label": entry["label"],
            "note": entry["note"],
            "status": manifest.get("status"),
            "dry_run": manifest.get("dry_run"),
            "corpus_dir": config.get("corpus_dir"),
            "conditions": config.get("conditions"),
            "models": {arm: config["models"][arm]["model"] for arm in config.get("arms", [])},
            "n_questions": manifest.get("n_questions"),
            "n_records": manifest.get("n_records"),
        }

    def list_results(self) -> dict[str, Any]:
        return {"batches": [self._summary(entry) for entry in self._batch_entries()]}

    def _corpus_lookup(self, corpus_dir: str) -> dict[str, dict[str, Any]]:
        if corpus_dir not in self._corpora:
            self._corpora[corpus_dir] = {chunk["chunk_id"]: chunk
                                         for chunk in load_chunks(self.experiment.path(corpus_dir))}
        return self._corpora[corpus_dir]

    def get_result(self, experiment_id: str, batch_id: str) -> dict[str, Any]:
        wanted = f"{experiment_id}/{batch_id}"
        entry = next((item for item in self._batch_entries() if item["id"] == wanted), None)
        if entry is None:  # only configured batches are readable: no path from the request touches the disk
            raise NotFoundError(f"lote não disponível: {wanted}")
        lookup = self._corpus_lookup(entry["manifest"]["config"]["corpus_dir"])
        questions: dict[str, dict[str, Any]] = {}
        with (entry["dir"] / "raw.jsonl").open(encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                record = json.loads(line)
                item = questions.setdefault(record["question_id"], {
                    "question_id": record["question_id"], "question": record["original_query"], "results": []})
                item["results"].append({**record_view(record, lookup), "repetition": record.get("repetition", 0)})
        for item in questions.values():
            item["results"].sort(key=lambda r: (r["provider"] or "", _condition_rank(r["condition"]),
                                                r["repetition"]))
        return {"batch": self._summary(entry),
                "questions": [questions[key] for key in sorted(questions)]}


def make_handler(service: StudyService, token: str | None = None):
    class Handler(BaseHTTPRequestHandler):
        server_version = "rag-study-serve"

        def _send(self, status: HTTPStatus, payload: dict[str, Any]) -> None:
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

        def _refuse(self) -> bool:
            if self.headers.get("Origin"):
                self._send(HTTPStatus.FORBIDDEN, {"message": "chamadas de navegador não são aceitas; "
                                                             "use o backend do NexoHansen"})
                return True
            if token and not hmac.compare_digest(self.headers.get("X-Study-Token", ""), token):
                self._send(HTTPStatus.UNAUTHORIZED, {"message": "token do serviço ausente ou incorreto"})
                return True
            return False

        def _dispatch(self, action) -> None:
            try:
                self._send(HTTPStatus.OK, action())
            except BusyError as exc:
                self._send(HTTPStatus.CONFLICT, {"message": str(exc)})
            except NotFoundError as exc:
                self._send(HTTPStatus.NOT_FOUND, {"message": str(exc)})
            except ValueError as exc:
                self._send(HTTPStatus.BAD_REQUEST, {"message": str(exc)})
            except Exception as exc:  # noqa: BLE001 - the service must answer, not hang the backend
                self._send(HTTPStatus.INTERNAL_SERVER_ERROR, {"message": f"{type(exc).__name__}: {exc}"})

        def do_GET(self) -> None:  # noqa: N802 - http.server API
            if self._refuse():
                return
            parts = [part for part in self.path.split("?", 1)[0].split("/") if part]
            if parts == ["health"]:
                self._dispatch(service.status)
            elif parts == ["results"]:
                self._dispatch(service.list_results)
            elif len(parts) == 3 and parts[0] == "results":
                self._dispatch(lambda: service.get_result(parts[1], parts[2]))
            else:
                self._send(HTTPStatus.NOT_FOUND, {"message": "rota inexistente"})

        def do_POST(self) -> None:  # noqa: N802 - http.server API
            if self._refuse():
                return
            if self.path.split("?", 1)[0].rstrip("/") != "/compare":
                self._send(HTTPStatus.NOT_FOUND, {"message": "rota inexistente"})
                return
            if not (self.headers.get("Content-Type") or "").startswith("application/json"):
                self._send(HTTPStatus.UNSUPPORTED_MEDIA_TYPE, {"message": "envie JSON"})
                return
            length = int(self.headers.get("Content-Length") or 0)
            if length > MAX_BODY_BYTES:
                self._send(HTTPStatus.REQUEST_ENTITY_TOO_LARGE, {"message": "corpo grande demais"})
                return
            try:
                body = json.loads(self.rfile.read(length) or b"{}")
            except json.JSONDecodeError:
                self._send(HTTPStatus.BAD_REQUEST, {"message": "JSON inválido"})
                return
            if not isinstance(body, dict):
                self._send(HTTPStatus.BAD_REQUEST, {"message": "o corpo deve ser um objeto JSON"})
                return
            self._dispatch(lambda: service.compare(body.get("question"), body.get("arm"), body.get("conditions")))

    return Handler


def make_server(service: StudyService, host: str = "127.0.0.1", port: int = 8765,
                token: str | None = None) -> ThreadingHTTPServer:
    if host not in LOOPBACK_HOSTS:
        raise ValueError("o serviço só escuta na própria máquina (127.0.0.1): a assinatura é de uso pessoal")
    return ThreadingHTTPServer((host, port), make_handler(service, token if token is not None
                                                           else os.environ.get(TOKEN_ENV) or None))
