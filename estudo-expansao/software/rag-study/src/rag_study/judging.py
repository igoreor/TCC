"""LLM judges (protocol v0.4, amendment 2; decision D46).

On 16/11/2026 the author delegated to language models the labels that the
protocol had reserved for people (D15): relevance of the retrieval pool, the
key points and the blinded answer review. Each judgment goes through the
subscription CLIs already pinned for the study, with a versioned system
prompt and a JSON schema, and every call is kept in an immutable batch
(``research/runs/<task>/<batch>/raw.jsonl``), so the labels can be audited and
recomputed without new calls.

- Relevance: two judges (Claude and GPT) label every pair, one call per
  question, like the human sheet grouped by question. The final grade is the
  mean of the two grades rounded down: 2 only when both say 2; 0 and 1 give 0.
- Key points: drafted by one judge from the passages judged relevant, checked
  by the other, then consolidated with a logged list of edits.
- Answer review: each answer is judged by the model of the other family (GPT
  judges Claude's answers and Claude judges GPT's; protocol v0.4, section 8).
  A calibration subset is judged by both, to measure agreement between judges.
"""

from __future__ import annotations

import csv
import datetime as dt
import hashlib
import json
import re
import threading
from collections import OrderedDict, defaultdict
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Iterable, Mapping

from .providers import build_provider
from .questions import MAX_KEY_POINTS, read_table, write_sheet
from .retry import FatalProviderError, RetryExhausted, call_with_retry
from .review import FAILURE_FLAGS, PASS_A_COLUMNS, PASS_B_COLUMNS

DOC_LABELS = {
    "BR-MS-PCDT-HANSENIASE-2022": "PCDT 2022",
    "BR-MS-ESTRATEGIA-HANSENIASE-2024-2030": "Estratégia Nacional 2024-2030",
    "WHO-LEPROSY-ELIMINATION-TECHNICAL-GUIDANCE-2023": "OMS 2023",
    "BR-MS-SCTIE-PORTARIA-47-2026": "Portaria SCTIE/MS 47/2026",
    "BR-MS-SCTIE-PORTARIA-51-2026": "Portaria SCTIE/MS 51/2026",
}
INSUFFICIENT = "INSUFICIENTE:"
ANSWERABLE_TEXT = {
    "sim": "respondível (os documentos trazem a resposta)",
    "parcial": "parcial (os documentos cobrem só parte da pergunta)",
    "não": "não respondível (os documentos não trazem a resposta)",
}


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def canonical(data: Any) -> str:
    return json.dumps(data, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def _strict(properties: dict[str, Any]) -> dict[str, Any]:
    """JSON schema accepted by both CLIs' structured output (every property
    required, no extra keys)."""
    return {"type": "object", "additionalProperties": False, "required": list(properties), "properties": properties}


RELEVANCE_SCHEMA = _strict({"rotulos": {"type": "array", "items": _strict({
    "trecho": {"type": "string"},
    "justificativa": {"type": "string"},
    "relevancia": {"type": "integer", "enum": [0, 1, 2]},
})}})
KEYPOINTS_SCHEMA = _strict({
    "pontos": {"type": "array", "items": _strict({
        "texto": {"type": "string"},
        "trechos": {"type": "array", "items": {"type": "string"}},
    })},
    "observacoes": {"type": "string"},
})
VERIFY_SCHEMA = _strict({
    "pontos": {"type": "array", "items": _strict({
        "n": {"type": "integer"},
        "sustentado": {"type": "string", "enum": ["sim", "parcial", "nao"]},
        "essencial": {"type": "string", "enum": ["sim", "nao"]},
        "atomico": {"type": "string", "enum": ["sim", "nao"]},
        "correcao": {"type": "string"},
    })},
    "faltando": {"type": "array", "items": _strict({
        "texto": {"type": "string"},
        "trechos": {"type": "array", "items": {"type": "string"}},
    })},
})
PASS_A_SCHEMA = _strict({
    "pontos": {"type": "array", "items": _strict({
        "n": {"type": "integer"},
        "justificativa": {"type": "string"},
        "nota": {"type": "string", "enum": ["2", "1", "0", "X"]},
    })},
    **{flag: {"type": "integer", "enum": [0, 1]} for flag in FAILURE_FLAGS},
    "critical_failure": {"type": "integer", "enum": [0, 1]},
    "insufficiency": {"type": "string", "enum": ["adequada", "ausente", "indevida", "na"]},
    "correctness": {"type": "integer", "enum": [1, 2, 3, 4]},
    "notes": {"type": "string"},
})
PASS_B_SCHEMA = _strict({
    "analise": {"type": "string"},
    "faithfulness": {"type": "integer", "enum": [0, 1, 2]},
    "citation_support": {"type": "integer", "enum": [0, 1, 2]},
    "notes": {"type": "string"},
})


# --------------------------------------------------------------------------- configuration


def load_judges_config(path: str | Path, root: str | Path = ".") -> dict[str, Any]:
    root = Path(root)
    config = json.loads(Path(path).read_text(encoding="utf-8"))
    for spec in config["judges"].values():
        for key in ("executable", "catalog"):
            if spec.get(key):
                spec[key] = str((root / spec[key]).resolve())
    config["_root"] = str(root.resolve())
    config["_sha256"] = hashlib.sha256(Path(path).read_bytes()).hexdigest()
    return config


def judge_prompt(config: Mapping[str, Any], key: str) -> str:
    path = Path(config["_root"]) / config["prompts_dir"] / config["prompts"][key]
    return path.read_bytes().decode("utf-8")


def build_judges(config: Mapping[str, Any], names: Iterable[str]) -> dict[str, Any]:
    return {name: build_provider(config["judges"][name]) for name in names}


# --------------------------------------------------------------------------- generic runner


@dataclass
class Job:
    job_id: str
    judge: str
    user_prompt: str
    meta: dict[str, Any] = field(default_factory=dict)


def parse_json(text: str) -> dict[str, Any]:
    text = (text or "").strip()
    fence = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, re.S)
    if fence:
        text = fence.group(1)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start >= 0 and end > start:
            return json.loads(text[start:end + 1])
        raise


def load_outputs(batch_dirs: Iterable[str | Path]) -> dict[tuple[str, str], dict[str, Any]]:
    """Successful judgments of one or more batches, keyed by (job_id, judge).
    A later batch (``--continue-from``) never repeats a successful job."""
    outputs: dict[tuple[str, str], dict[str, Any]] = {}
    for batch in batch_dirs:
        with open(Path(batch) / "raw.jsonl", encoding="utf-8") as handle:
            for line in handle:
                if line.strip():
                    record = json.loads(line)
                    if record["status"] == "success":
                        outputs[(record["job_id"], record["judge"])] = record
    return outputs


def interleave(jobs: list[Job]) -> list[Job]:
    """Alternate judges so concurrent workers spread over both subscriptions."""
    by_judge: dict[str, list[Job]] = OrderedDict()
    for job in jobs:
        by_judge.setdefault(job.judge, []).append(job)
    queues = list(by_judge.values())
    ordered = []
    for index in range(max((len(q) for q in queues), default=0)):
        ordered.extend(queue[index] for queue in queues if index < len(queue))
    return ordered


def run_jobs(task: str, jobs: list[Job], providers: Mapping[str, Any], system_prompt: str, schema: dict[str, Any],
             validate: Callable[[Job, dict[str, Any]], None], out_root: str | Path, *, workers: int = 4,
             max_output_tokens: int = 8000, max_attempts: int = 3, continue_from: Iterable[str | Path] = (),
             manifest_extra: Mapping[str, Any] | None = None) -> Path:
    """Run every pending job and append one record per job to a new batch.

    An answer that is not valid JSON or fails ``validate`` is retried (up to
    ``max_attempts``); a plan or account limit stops the batch, which is then
    resumed with ``continue_from``."""
    continue_from = [str(path) for path in continue_from]
    done = load_outputs(continue_from)
    pending = interleave([job for job in jobs if (job.job_id, job.judge) not in done])
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    batch_id, suffix = stamp, 1
    while (Path(out_root) / task / batch_id).exists():
        suffix += 1
        batch_id = f"{stamp}-{suffix}"
    out_dir = Path(out_root) / task / batch_id
    out_dir.mkdir(parents=True, exist_ok=False)
    prompt_sha, schema_sha = sha256_text(system_prompt), sha256_text(canonical(schema))
    manifest: dict[str, Any] = {
        "task": task, "batch_id": batch_id, "started_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "system_prompt_sha256": prompt_sha, "schema_sha256": schema_sha,
        "judges": {name: {"provider": p.name, "model": p.model, "parameters": p.parameters()}
                   for name, p in providers.items()},
        "n_jobs": len(jobs), "n_pending": len(pending), "n_done_before": len(jobs) - len(pending),
        "continue_from": continue_from, "workers": workers, "max_output_tokens": max_output_tokens,
        **(manifest_extra or {}),
    }
    (out_dir / "run-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    raw_path = out_dir / "raw.jsonl"
    lock, stop = threading.Lock(), threading.Event()
    counts = {"success": 0, "failed": 0, "skipped": 0}

    def work(job: Job) -> None:
        if stop.is_set():
            with lock:
                counts["skipped"] += 1
            return
        provider = providers[job.judge]
        record: dict[str, Any] = {
            "task": task, "batch_id": batch_id, "job_id": job.job_id, "judge": job.judge,
            "provider": provider.name, "requested_model": provider.model, "meta": job.meta,
            "system_prompt_sha256": prompt_sha, "schema_sha256": schema_sha,
            "user_prompt_sha256": sha256_text(job.user_prompt), "user_prompt": job.user_prompt,
            "started_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        }
        errors: list[str] = []
        for attempt in range(1, max_attempts + 1):
            try:
                result, calls = call_with_retry(
                    lambda: provider.generate(system_prompt, job.user_prompt, max_output_tokens, schema))
                output = parse_json(result.text)
                validate(job, output)
            except FatalProviderError as exc:
                stop.set()
                errors.append(str(exc)[:800])
                record.update(status="failed", fatal=True, attempts=attempt, errors=errors)
                break
            except (RetryExhausted, ValueError, KeyError, TypeError) as exc:
                errors.append(f"{type(exc).__name__}: {exc}"[:800])
                continue
            record.update(status="success", attempts=attempt, provider_calls=calls, output=output,
                          output_text=result.text, returned_model=result.returned_model,
                          input_tokens=result.input_tokens, output_tokens=result.output_tokens,
                          reasoning_tokens=result.reasoning_tokens, latency_ms=result.latency_ms,
                          request_id=result.request_id, parameters=result.parameters, errors=errors)
            break
        else:
            record.update(status="failed", attempts=max_attempts, errors=errors)
        record["finished_utc"] = dt.datetime.now(dt.timezone.utc).isoformat()
        with lock:
            counts[record["status"]] += 1
            with open(raw_path, "a", encoding="utf-8") as handle:
                handle.write(json.dumps(record, ensure_ascii=False) + "\n")

    with ThreadPoolExecutor(max_workers=max(1, workers)) as pool:
        list(pool.map(work, pending))
    raw_path.touch()
    manifest.update(finished_utc=dt.datetime.now(dt.timezone.utc).isoformat(), counts=counts,
                    aborted=stop.is_set(),
                    raw_sha256=hashlib.sha256(raw_path.read_bytes()).hexdigest())
    (out_dir / "run-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return out_dir


# --------------------------------------------------------------------------- passages


def doc_label(chunk: Mapping[str, Any]) -> str:
    return DOC_LABELS.get(chunk["document_id"], chunk["document_id"])


def page_label(chunk: Mapping[str, Any]) -> str:
    start, end = str(chunk["page_start"]), str(chunk["page_end"])
    return f"p. {start}" if start == end else f"p. {start}-{end}"


def section_label(chunk: Mapping[str, Any]) -> str:
    path = chunk.get("section_path") or []
    return " > ".join(path) if isinstance(path, list) else str(path)


def passage(label: str, chunk: Mapping[str, Any]) -> str:
    return (f"[{label}] Documento: {doc_label(chunk)} | Seção: {section_label(chunk)} | {page_label(chunk)}\n"
            f"{chunk['text']}")


def source_label(chunk_ids: Iterable[str], chunks: Mapping[str, Mapping[str, Any]]) -> str:
    """'PCDT 2022, p. 27-28; OMS 2023, p. 14' for the cited chunks."""
    pages: dict[str, set[int]] = OrderedDict()
    for chunk_id in chunk_ids:
        chunk = chunks[chunk_id]
        pages.setdefault(doc_label(chunk), set()).update(range(int(chunk["page_start"]), int(chunk["page_end"]) + 1))
    parts = []
    for document, numbers in pages.items():
        ordered, ranges = sorted(numbers), []
        for number in ordered:
            if ranges and number == ranges[-1][1] + 1:
                ranges[-1][1] = number
            else:
                ranges.append([number, number])
        text = ", ".join(str(a) if a == b else f"{a}-{b}" for a, b in ranges)
        parts.append(f"{document}, p. {text}")
    return "; ".join(parts)


# --------------------------------------------------------------------------- relevance


def relevance_jobs(pool_rows: list[Mapping[str, str]], chunks: Mapping[str, Mapping[str, Any]],
                   judges: Iterable[str], only_questions: set[str] | None = None) -> list[Job]:
    """One job per question and judge; passages in the pool's (blind, shuffled) order."""
    by_question: dict[str, dict[str, Any]] = OrderedDict()
    for row in pool_rows:
        entry = by_question.setdefault(row["question_id"], {"text": row["question_text"], "items": []})
        entry["items"].append(row["item_id"])
    jobs = []
    for question_id, entry in by_question.items():
        if only_questions and question_id not in only_questions:
            continue
        items = entry["items"]
        blocks = [passage(f"T{n}", chunks[item]) for n, item in enumerate(items, start=1)]
        prompt = (f"Pergunta: {entry['text']}\n\nTrechos ({len(items)}):\n\n" + "\n\n".join(blocks)
                  + f"\n\nDê um rótulo para cada um dos {len(items)} trechos (T1 a T{len(items)}).")
        for judge in judges:
            jobs.append(Job(question_id, judge, prompt, {"question_id": question_id, "items": items}))
    return jobs


def _trecho_number(value: Any) -> str:
    return str(value).strip().strip("[]").upper()


def validate_relevance(job: Job, output: Mapping[str, Any]) -> None:
    expected = [f"T{n}" for n in range(1, len(job.meta["items"]) + 1)]
    got = [_trecho_number(item["trecho"]) for item in output["rotulos"]]
    if sorted(got) != sorted(expected):
        raise ValueError(f"esperados {len(expected)} trechos (T1..T{len(expected)}), recebidos {got}")
    for item in output["rotulos"]:
        if item["relevancia"] not in (0, 1, 2):
            raise ValueError(f"rótulo inválido: {item}")


def relevance_by_judge(outputs: Mapping[tuple[str, str], Mapping[str, Any]]
                       ) -> dict[str, dict[tuple[str, str], tuple[int, str]]]:
    labels: dict[str, dict[tuple[str, str], tuple[int, str]]] = defaultdict(dict)
    for (question_id, judge), record in outputs.items():
        items = record["meta"]["items"]
        for item in record["output"]["rotulos"]:
            index = int(_trecho_number(item["trecho"])[1:]) - 1
            labels[judge][(question_id, items[index])] = (int(item["relevancia"]), item["justificativa"])
    return labels


def combine_grades(grades: list[int]) -> int:
    """Mean rounded down: 2 only if every judge says 2; 0 and 1 give 0."""
    return sum(grades) // len(grades)


def relevance_tables(pool_rows: list[Mapping[str, str]], labels: Mapping[str, Mapping[tuple[str, str], tuple[int, str]]],
                     judge_models: Mapping[str, str]) -> tuple[dict[str, list[dict[str, Any]]], list[dict[str, Any]]]:
    """Per-judge label tables and the final table (``relevance`` = combined grade)."""
    per_judge: dict[str, list[dict[str, Any]]] = {judge: [] for judge in labels}
    final = []
    judges = sorted(labels)
    for row in pool_rows:
        key = (row["question_id"], row["item_id"])
        base = {"pool_item": row["pool_item"], "question_id": row["question_id"], "item_id": row["item_id"],
                "section": row.get("section", ""), "pages": row.get("pages", "")}
        grades = {}
        for judge in judges:
            if key in labels[judge]:
                grade, note = labels[judge][key]
                grades[judge] = grade
                per_judge[judge].append({**base, "relevance": grade, "annotator_id": f"llm-{judge_models[judge]}",
                                         "annotation_round": f"llm-{judge}", "notes": note})
        if not grades:
            raise ValueError(f"par sem rótulo de nenhum julgador: {key}")
        values = list(grades.values())
        note = "" if len(set(values)) == 1 else f"divergência {'x'.join(str(grades[j]) for j in judges if j in grades)}"
        if len(grades) < len(judges):
            note = "rótulo de um só julgador"
        final.append({**base, "relevance": combine_grades(values),
                      **{f"rel_{judge}": grades.get(judge, "") for judge in judges},
                      "annotator_id": "llm-" + "+".join(judges), "annotation_round": "final-llm", "notes": note})
    return per_judge, final


def write_semicolon_csv(rows: list[Mapping[str, Any]], path: str | Path, columns: list[str] | None = None) -> None:
    path = Path(path)
    if path.exists():
        raise FileExistsError(f"{path} já existe")
    columns = columns or list(rows[0]) if rows else (columns or [])
    with open(path, "w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns, delimiter=";", extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


# --------------------------------------------------------------------------- key points


def need_groups(questions: Iterable[Mapping[str, Any]]) -> list[list[Mapping[str, Any]]]:
    groups: dict[str, list[Mapping[str, Any]]] = OrderedDict()
    for question in sorted(questions, key=lambda q: q["question_id"]):
        groups.setdefault(question["need_group"], []).append(question)
    return list(groups.values())


def group_profile(group: list[Mapping[str, Any]]) -> dict[str, str]:
    answerable = {q["answerable_from_corpus"] for q in group}
    if len(answerable) != 1:
        raise ValueError(f"perguntas do mesmo grupo com classificações diferentes: {[q['question_id'] for q in group]}")
    composite = any(q.get("complexity") == "composta" for q in group)
    return {"answerable": answerable.pop(), "complexity": "composta" if composite else "simples"}


def keypoint_passages(group: list[Mapping[str, Any]], final_rows: list[Mapping[str, Any]],
                      max_passages: int = 14) -> list[str]:
    """Passages judged relevant for any question of the group (combined grade
    first, then the highest single-judge grade), capped at ``max_passages``."""
    ids = {q["question_id"] for q in group}
    best: dict[str, tuple[int, int]] = {}
    for row in final_rows:
        if row["question_id"] not in ids:
            continue
        judge_max = max(int(row[c]) for c in row if c.startswith("rel_") and str(row[c]).strip() != "")
        score = (int(row["relevance"]), judge_max)
        if judge_max > 0 and score > best.get(row["item_id"], (-1, -1)):
            best[row["item_id"]] = score
    ordered = sorted(best, key=lambda item: (-best[item][0], -best[item][1], item))
    return ordered[:max_passages]


def _group_header(group: list[Mapping[str, Any]], profile: Mapping[str, str], design_notes: Mapping[str, str]) -> str:
    if len(group) == 1:
        lines = [f"Pergunta: {group[0]['text']}"]
    else:
        lines = ["Esta necessidade tem duas formulações, que terão o mesmo gabarito:"]
        lines += [f"- formulação {q.get('register', '')}: {q['text']}" for q in group]
    lines.append(f"Tipo: {profile['complexity']}")
    lines.append(f"Classificação: {ANSWERABLE_TEXT[profile['answerable']]}")
    notes = [design_notes.get(q["question_id"], "") for q in group if design_notes.get(q["question_id"])]
    if profile["answerable"] != "sim" and notes:
        lines.append(f"Observação do desenho do estudo: {notes[0]}")
    return "\n".join(lines)


def keypoint_draft_jobs(questions: list[Mapping[str, Any]], final_rows: list[Mapping[str, Any]],
                        chunks: Mapping[str, Mapping[str, Any]], judge: str,
                        design_notes: Mapping[str, str] | None = None) -> list[Job]:
    jobs = []
    for group in need_groups(questions):
        profile = group_profile(group)
        passages = keypoint_passages(group, final_rows)
        blocks = "\n\n".join(passage(item, chunks[item]) for item in passages) or "(nenhum trecho foi julgado relevante)"
        prompt = (_group_header(group, profile, design_notes or {})
                  + f"\n\nTrechos julgados relevantes ({len(passages)}):\n\n{blocks}"
                  + "\n\nEscreva os pontos-chave desta pergunta.")
        jobs.append(Job(group[0]["need_group"], judge, prompt,
                        {"questions": [q["question_id"] for q in group], "passages": passages, **profile}))
    return jobs


def keypoint_problems(points: list[Mapping[str, Any]], meta: Mapping[str, Any]) -> list[str]:
    problems = []
    texts = [str(p["texto"]).strip() for p in points]
    insufficient = [t.upper().startswith(INSUFFICIENT) for t in texts]
    if not points or len(points) > MAX_KEY_POINTS:
        problems.append(f"{len(points)} pontos (permitido de 1 a {MAX_KEY_POINTS})")
    if meta["answerable"] == "não" and (len(points) != 1 or not all(insufficient)):
        problems.append("pergunta não respondível exige um único ponto INSUFICIENTE")
    if meta["answerable"] == "parcial" and (len(points) < 2 or not insufficient[-1] or any(insufficient[:-1])):
        problems.append("pergunta parcial exige pontos da parte coberta e, por último, um ponto INSUFICIENTE")
    if meta["answerable"] == "sim" and any(insufficient):
        problems.append("pergunta respondível não pode ter ponto INSUFICIENTE")
    if meta["complexity"] == "composta" and len(points) < 2:
        problems.append("pergunta composta exige pelo menos 2 pontos")
    allowed = set(meta["passages"])
    for text, flag, point in zip(texts, insufficient, points):
        if not text:
            problems.append("ponto vazio")
        if not flag and not point["trechos"]:
            problems.append(f"ponto sem trecho: {text[:60]}")
        unknown = [c for c in point["trechos"] if c not in allowed]
        if unknown:
            problems.append(f"trechos não fornecidos: {unknown}")
    return problems


def validate_keypoints(job: Job, output: Mapping[str, Any]) -> None:
    problems = keypoint_problems(output["pontos"], job.meta)
    if problems:
        raise ValueError("; ".join(problems))


def keypoint_verify_jobs(drafts: Mapping[str, Mapping[str, Any]], questions: list[Mapping[str, Any]],
                         chunks: Mapping[str, Mapping[str, Any]], judge: str,
                         design_notes: Mapping[str, str] | None = None) -> list[Job]:
    """``drafts``: need_group -> draft record (from ``load_outputs``)."""
    jobs = []
    for group in need_groups(questions):
        draft = drafts[group[0]["need_group"]]
        meta = draft["meta"]
        points = draft["output"]["pontos"]
        listed = "\n".join(f"{n}. {p['texto']} [trechos: {', '.join(p['trechos']) or 'nenhum'}]"
                           for n, p in enumerate(points, start=1))
        blocks = "\n\n".join(passage(item, chunks[item]) for item in meta["passages"]) or "(nenhum trecho foi julgado relevante)"
        prompt = (_group_header(group, meta, design_notes or {})
                  + f"\n\nPontos-chave propostos ({len(points)}):\n{listed}"
                  + f"\n\nTrechos ({len(meta['passages'])}):\n\n{blocks}"
                  + f"\n\nAvalie os {len(points)} pontos e diga se falta algum ponto essencial.")
        jobs.append(Job(group[0]["need_group"], judge, prompt, {**meta, "n_points": len(points)}))
    return jobs


def validate_verify(job: Job, output: Mapping[str, Any]) -> None:
    numbers = sorted(int(p["n"]) for p in output["pontos"])
    if numbers != list(range(1, job.meta["n_points"] + 1)):
        raise ValueError(f"esperados os pontos 1..{job.meta['n_points']}, recebidos {numbers}")


def keypoints_report(drafts: Mapping[str, Mapping[str, Any]], verifications: Mapping[str, Mapping[str, Any]],
                     questions: list[Mapping[str, Any]]) -> str:
    """Markdown for the consolidation step: each draft point with the verdict."""
    text = {q["question_id"]: q["text"] for q in questions}
    lines = ["# Pontos-chave: rascunho e verificação", ""]
    flagged = 0
    for group, draft in drafts.items():
        meta, points = draft["meta"], draft["output"]["pontos"]
        verdicts = {int(v["n"]): v for v in verifications.get(group, {}).get("output", {}).get("pontos", [])}
        missing = verifications.get(group, {}).get("output", {}).get("faltando", [])
        lines.append(f"## {group}: {', '.join(meta['questions'])} ({meta['complexity']}, {meta['answerable']})")
        lines += [f"> {text[q]}" for q in meta["questions"]]
        lines.append("")
        for n, point in enumerate(points, start=1):
            verdict = verdicts.get(n, {})
            ok = (verdict.get("sustentado") == "sim" and verdict.get("essencial") == "sim"
                  and verdict.get("atomico") == "sim")
            flagged += 0 if ok else 1
            mark = "ok" if ok else (f"**sustentado={verdict.get('sustentado')}, essencial={verdict.get('essencial')}, "
                                    f"atomico={verdict.get('atomico')}**")
            lines.append(f"{n}. {point['texto']} [{', '.join(point['trechos'])}] - {mark}")
            if verdict.get("correcao"):
                lines.append(f"   - correção sugerida: {verdict['correcao']}")
        for item in missing:
            lines.append(f"- faltando: {item['texto']} [{', '.join(item['trechos'])}]")
        if draft["output"].get("observacoes"):
            lines.append(f"- observações do rascunho: {draft['output']['observacoes']}")
        lines.append("")
    lines.insert(2, f"Pontos com alguma marca da verificação: {flagged}.")
    lines.insert(3, "")
    return "\n".join(lines)


def build_keypoints(drafts: Mapping[str, Mapping[str, Any]], edits: Mapping[str, Mapping[str, Any]],
                    chunks: Mapping[str, Mapping[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Apply the consolidation edits and return (key point rows, provenance rows).

    ``edits[group]`` may hold ``replace`` ({n: {"texto", "trechos"}}), ``drop``
    ([n]), ``add`` ([{"texto", "trechos", "after"}]) and ``reason``. Every point
    ends with its source, e.g. "(PCDT 2022, p. 27)"."""
    rows, provenance = [], []
    for group, draft in drafts.items():
        meta = draft["meta"]
        edit = edits.get(group, {})
        points = [dict(p, origem="rascunho") for p in draft["output"]["pontos"]]
        for n, new in (edit.get("replace") or {}).items():
            points[int(n) - 1] = {"texto": new["texto"], "trechos": new.get("trechos", points[int(n) - 1]["trechos"]),
                                  "origem": "editado"}
        drop = {int(n) for n in edit.get("drop", [])}
        kept = [p for n, p in enumerate(points, start=1) if n not in drop]
        for new in edit.get("add", []):
            position = int(new.get("after", len(kept)))
            kept.insert(position, {"texto": new["texto"], "trechos": new.get("trechos", []), "origem": "acrescentado"})
        problems = keypoint_problems(kept, {**meta, "passages": list(chunks)})
        if problems:
            raise ValueError(f"{group}: {'; '.join(problems)}")
        for question_id in meta["questions"]:
            for n, point in enumerate(kept, start=1):
                text = point["texto"].strip().rstrip(".")
                if point["trechos"]:
                    text = f"{text} ({source_label(point['trechos'], chunks)})"
                rows.append({"question_id": question_id, "key_point_n": n, "key_point": text})
                provenance.append({"question_id": question_id, "need_group": group, "key_point_n": n,
                                   "key_point": text, "chunk_ids": " ".join(point["trechos"]),
                                   "origin": point["origem"], "edit_reason": edit.get("reason", "")})
    return rows, provenance


# --------------------------------------------------------------------------- answer review


def numbered_points(value: str) -> list[str]:
    return [line for line in (value or "").splitlines() if re.match(r"^\d+\.\s", line)]


def reference_block(question_id: str, final_qrels: Mapping[str, Mapping[str, int]],
                    chunks: Mapping[str, Mapping[str, Any]], limit: int = 8) -> str:
    grades = final_qrels.get(question_id, {})
    ordered = sorted((item for item, grade in grades.items() if grade > 0), key=lambda i: (-grades[i], i))[:limit]
    if not ordered:
        return "(nenhum trecho dos documentos foi julgado relevante para esta pergunta)"
    return "\n\n".join(passage(f"R{n}", chunks[item]) for n, item in enumerate(ordered, start=1))


def review_jobs(review_dir: str | Path, final_qrels: Mapping[str, Mapping[str, int]],
                chunks: Mapping[str, Mapping[str, Any]], cross_family: Mapping[str, str],
                calibration_questions: set[str], judges: Iterable[str], passes: str = "AB") -> list[Job]:
    """Pass A and pass B jobs. The primary judge of an answer is the model of
    the other family; answers of the calibration questions get both judges.
    The prompt carries no model, condition or arm."""
    review_dir = Path(review_dir)
    judges = list(judges)
    key = {row["review_id"]: row for row in read_table(review_dir / "review-key.csv")}
    jobs = []

    def judges_for(meta: Mapping[str, str]) -> list[tuple[str, str]]:
        primary = cross_family[meta["arm"]]
        chosen = [(primary, "primary")]
        if meta["question_id"] in calibration_questions:
            chosen += [(other, "calibration") for other in judges if other != primary]
        return chosen

    if "A" in passes:
        for row in read_table(review_dir / "pass-a.csv"):
            meta = key[row["review_id"]]
            points = numbered_points(row["key_points"])
            prompt = (f"Pergunta: {row['question_text']}\n\nComportamento esperado: {row['expected_behaviour']}"
                      f"\n\nPontos-chave do gabarito ({len(points)}):\n" + "\n".join(points)
                      + "\n\nMaterial de referência (trechos dos documentos oficiais julgados relevantes):\n\n"
                      + reference_block(meta["question_id"], final_qrels, chunks)
                      + f"\n\nResposta avaliada:\n<<<\n{row['answer_text']}\n>>>"
                      + f"\n\nAvalie os {len(points)} pontos-chave, as falhas, a insuficiência e a correção.")
            for judge, role in judges_for(meta):
                jobs.append(Job(row["review_id"], judge, prompt, {"pass": "A", "role": role, "n_points": len(points)}))
    if "B" in passes:
        for row in read_table(review_dir / "pass-b.csv"):
            meta = key[row["review_id"]]
            prompt = (f"Pergunta: {row['question_text']}\n\nTrechos entregues ao sistema:\n\n{row['context']}"
                      f"\n\nResposta avaliada:\n<<<\n{row['answer_text']}\n>>>"
                      "\n\nAvalie a fidelidade ao contexto e o suporte das citações.")
            for judge, role in judges_for(meta):
                jobs.append(Job(row["review_id"], judge, prompt, {"pass": "B", "role": role}))
    return jobs


def validate_review(job: Job, output: Mapping[str, Any]) -> None:
    if job.meta["pass"] == "A":
        numbers = sorted(int(p["n"]) for p in output["pontos"])
        if numbers != list(range(1, job.meta["n_points"] + 1)):
            raise ValueError(f"esperados os pontos 1..{job.meta['n_points']}, recebidos {numbers}")
        for flag in (*FAILURE_FLAGS, "critical_failure"):
            if output[flag] not in (0, 1):
                raise ValueError(f"{flag} inválido: {output[flag]}")
        if output["correctness"] not in (1, 2, 3, 4):
            raise ValueError("correctness inválido")
    else:
        if output["faithfulness"] not in (0, 1, 2) or output["citation_support"] not in (0, 1, 2):
            raise ValueError("notas da passagem B inválidas")


def _filled_a(row: Mapping[str, str], output: Mapping[str, Any], reviewer: str) -> dict[str, Any]:
    filled = dict(row)
    grades = {int(p["n"]): p["nota"] for p in output["pontos"]}
    for n in range(1, MAX_KEY_POINTS + 1):
        filled[f"kp{n}"] = grades.get(n, "")
    for flag in FAILURE_FLAGS:
        filled[flag] = output[flag]
    filled.update(correctness=output["correctness"], critical_failure=output["critical_failure"],
                  insufficiency=output["insufficiency"], reviewer_id=reviewer, notes=output.get("notes", ""))
    return filled


def _filled_b(row: Mapping[str, str], output: Mapping[str, Any], reviewer: str) -> dict[str, Any]:
    return {**row, "faithfulness": output["faithfulness"], "citation_support": output["citation_support"],
            "reviewer_id": reviewer, "notes": output.get("notes", "") or output.get("analise", "")}


def review_sheets(review_dir: str | Path, outputs: Mapping[tuple[str, str], Mapping[str, Any]],
                  cross_family: Mapping[str, str], judge_models: Mapping[str, str],
                  calibration_questions: set[str]) -> dict[str, list[dict[str, Any]]]:
    """Filled sheets: ``pass-a``/``pass-b`` with the primary judge for every
    answer, and ``calib-<pass>-<judge>`` with each judge on the calibration
    questions. Raises if a primary judgment is missing."""
    review_dir = Path(review_dir)
    key = {row["review_id"]: row for row in read_table(review_dir / "review-key.csv")}
    sheets: dict[str, list[dict[str, Any]]] = defaultdict(list)
    missing = []
    for review_pass, filler in (("a", _filled_a), ("b", _filled_b)):
        for row in read_table(review_dir / f"pass-{review_pass}.csv"):
            meta = key[row["review_id"]]
            primary = cross_family[meta["arm"]]
            record = outputs.get((row["review_id"], primary))
            if record is None:
                missing.append(f"{row['review_id']}/{primary}")
                continue
            sheets[f"pass-{review_pass}"].append(filler(row, record["output"], f"llm-{judge_models[primary]}"))
            if meta["question_id"] in calibration_questions:
                for judge in judge_models:
                    other = outputs.get((row["review_id"], judge))
                    if other is not None:
                        sheets[f"calib-{review_pass}-{judge}"].append(
                            filler(row, other["output"], f"llm-{judge_models[judge]}"))
    if missing:
        raise ValueError(f"{len(missing)} julgamentos principais faltando, por exemplo {missing[:5]}")
    return dict(sheets)


def write_review_sheets(sheets: Mapping[str, list[dict[str, Any]]], out_dir: str | Path) -> dict[str, int]:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=False)
    counts = {}
    for name, rows in sheets.items():
        columns = PASS_A_COLUMNS if "-a" in name else PASS_B_COLUMNS
        write_sheet(rows, out_dir / f"{name}.csv", columns)
        counts[name] = len(rows)
    return counts
