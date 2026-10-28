"""Question set design: blueprint, authoring sheet, conversion and checks.

The blueprint fixes the strata of every slot (split, category, register,
complexity, answerability, target PCDT sections). Question text, key points
and reference pages are written by the author in the authoring sheet; this
module never generates question content (D15).
"""

from __future__ import annotations

import csv
import hashlib
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any

from .corpus import load_chunks

CATEGORIES = {
    "diagnóstico", "tratamento", "reações", "neuropatia_incapacidade", "casos_especiais", "monitoramento",
    "contatos_prevenção", "psicossocial", "epidemiologia", "gestão_políticas",
}
REGISTERS = {"leigo", "técnico"}
COMPLEXITIES = {"simples", "composta"}
ANSWERABILITY = {"sim", "parcial", "não"}
MAX_KEY_POINTS = 6
KEY_POINT_SEPARATOR = "|"
# Origin of the question text (instrument plan v1, control G). "real": published
# question copied verbatim; "adaptada": published question rewritten by the author;
# "autor": written by the author. "sintetica_externa" (model outside the evaluated
# families) is only valid after a protocol amendment approved by the advisor (D15).
ORIGINS = {"real", "adaptada", "autor", "sintetica_externa"}
EVALUATED_FAMILIES = ("gpt", "openai", "chatgpt", "codex", "claude", "anthropic")
COPIED_RUN_ERROR = 8    # consecutive words shared with a corpus chunk: copied phrase
COPIED_RUN_WARNING = 5
# Who chose a published question (traceability, curation D36): the author confirming
# the agent's recommendation, or the author choosing on their own (blind or not).
SELECTED_BY = {"agente_confirmado", "autor"}
# PCDT jargon that gives away the technical register when it appears in a lay
# question (warning only; the author decides).
TECHNICAL_TERMS = ("pqt", "poliquimioterapia", "multibacilar", "paucibacilar", "baciloscopia", "histopatolog",
                   "eritema nodoso", "reacao reversa", "neurite", "avaliacao neurologica simplificada",
                   "imunocromatograf", "qpcr", "contactante", "comunicante", "dermatoneurolog", "hipoestesia",
                   "hipocromic", "macula", "classificacao operacional", "dose supervisionada")

SHEET_COLUMNS = [
    "slot_id", "question_id", "split", "need_group", "category", "register", "complexity",
    "answerable_from_corpus", "target_sections", "section_titles", "pages", "n_chunks", "design_note",
    "candidate_external_ids", "text", "origin", "source_name", "source_url", "original_text", "generator_model",
    "selected_by", "fit_justification", "key_points", "reference_pages", "author", "created_on", "reviewed_by",
    "notes",
]
QUESTION_FIELDS = ["question_id", "text", "split", "slot_id", "need_group", "category", "register", "complexity",
                   "answerable_from_corpus", "target_sections", "origin", "source_name", "source_url",
                   "original_text", "generator_model", "selected_by", "fit_justification", "reference_pages",
                   "author", "created_on", "reviewed_by"]


def read_table(path: str | Path) -> list[dict[str, str]]:
    """Read a CSV written by this package or re-saved by Excel/LibreOffice
    (UTF-8 with or without BOM, comma or semicolon)."""
    text = Path(path).read_text(encoding="utf-8-sig")
    first_line = text.splitlines()[0] if text else ""
    delimiter = ";" if first_line.count(";") > first_line.count(",") else ","
    return [dict(row) for row in csv.DictReader(text.splitlines(), delimiter=delimiter)]


def write_sheet(rows: list[dict[str, Any]], path: str | Path, columns: list[str]) -> None:
    """Spreadsheet-friendly CSV: UTF-8 with BOM and semicolons, which Excel in
    Portuguese opens without an import wizard."""
    with open(path, "w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns, delimiter=";", extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def section_codes(value: str) -> list[str]:
    return [code.strip() for code in value.split(";") if code.strip()]


def _matches(code: str, heading: str) -> bool:
    return heading == code or heading.startswith(code + " ")


# Document aliases for target sections in multi-document corpora (corpus v2):
# "EST:METAS" = heading "METAS" of the national strategy; "P47:" = the whole act.
DOCUMENT_ALIASES = {
    "PCDT": "BR-MS-PCDT-HANSENIASE", "EST": "BR-MS-ESTRATEGIA-HANSENIASE", "OMS": "WHO-LEPROSY-ELIMINATION",
    "P47": "BR-MS-SCTIE-PORTARIA-47", "P51": "BR-MS-SCTIE-PORTARIA-51",
}


def _split_alias(code: str) -> tuple[str | None, str]:
    alias, sep, heading = code.partition(":")
    if sep and alias in DOCUMENT_ALIASES:
        return DOCUMENT_ALIASES[alias], heading.strip()
    return None, code


def resolve_sections(chunks: list[dict[str, Any]], codes: list[str]) -> dict[str, Any]:
    """Chunks whose section path (or touched sections) contains a heading
    numbered (or titled) ``code``; subsections are included. A code may be
    prefixed with a document alias (``EST:METAS``); ``P47:`` selects the whole
    document."""
    titles: dict[str, str] = {}
    selected = []
    for chunk in chunks:
        headings = list(chunk.get("section_path", [])) + list(chunk.get("sections_touched", []))
        hit = False
        for code in codes:
            document, heading_code = _split_alias(code)
            if document is not None and not str(chunk.get("document_id", "")).startswith(document):
                continue
            if document is not None and not heading_code:
                titles.setdefault(code, chunk.get("section_path", [code])[0] if chunk.get("section_path") else code)
                hit = True
                continue
            for heading in headings:
                if _matches(heading_code, heading):
                    titles.setdefault(code, heading)
                    hit = True
        if hit:
            selected.append(chunk)
    missing = [code for code in codes if code not in titles]
    return {
        "titles": [titles[code] for code in codes if code in titles],
        "missing": missing,
        "chunk_ids": [chunk["chunk_id"] for chunk in selected],
        "pages": (min(c["page_start"] for c in selected), max(c["page_end"] for c in selected)) if selected else None,
    }


def load_blueprint(path: str | Path) -> list[dict[str, str]]:
    rows = read_table(path)
    errors = []
    for row in rows:
        for field, allowed in (("category", CATEGORIES), ("register", REGISTERS), ("complexity", COMPLEXITIES),
                               ("answerable_from_corpus", ANSWERABILITY)):
            if row[field] not in allowed:
                errors.append(f"{row['slot_id']}: {field}={row[field]!r}")
        if row["answerable_from_corpus"] != "não" and not section_codes(row["target_sections"]):
            errors.append(f"{row['slot_id']}: slot respondível sem seção-alvo")
    if len({row["slot_id"] for row in rows}) != len(rows):
        errors.append("slot_id duplicado")
    if errors:
        raise ValueError("blueprint inválido: " + "; ".join(errors))
    return rows


def question_id_for(slot: dict[str, str]) -> str:
    return f"{slot['split']}-{int(slot['slot_id'][1:]):03d}"


def authoring_sheet(blueprint: list[dict[str, str]], corpus_dir: str | Path) -> list[dict[str, Any]]:
    chunks = load_chunks(corpus_dir)
    rows = []
    for slot in blueprint:
        codes = section_codes(slot["target_sections"])
        resolved = resolve_sections(chunks, codes) if codes else None
        if resolved and resolved["missing"]:
            raise ValueError(f"{slot['slot_id']}: seções sem trecho no corpus: {resolved['missing']}")
        rows.append({
            **slot,
            "question_id": question_id_for(slot),
            "section_titles": " ; ".join(resolved["titles"]) if resolved else "",
            "pages": f"{resolved['pages'][0]}-{resolved['pages'][1]}" if resolved else "",
            "n_chunks": len(resolved["chunk_ids"]) if resolved else 0,
            "candidate_external_ids": "", "text": "", "origin": "", "source_name": "", "source_url": "",
            "original_text": "", "generator_model": "", "fit_justification": "", "key_points": "",
            "reference_pages": "", "author": "", "created_on": "", "reviewed_by": "", "notes": "",
        })
    return rows


def split_key_points(value: str) -> list[str]:
    return [point.strip() for point in value.split(KEY_POINT_SEPARATOR) if point.strip()]


def build_question_files(sheet_path: str | Path, out_dir: str | Path, version: str = "v1") -> dict[str, Path]:
    """Convert the filled authoring sheet into ``<split>-<version>.jsonl`` and
    ``<split>-<version>-keypoints.csv``. Refuses to overwrite existing files:
    a frozen set changes only through a new version."""
    rows = [row for row in read_table(sheet_path) if row.get("text", "").strip()]
    out_dir = Path(out_dir)
    written: dict[str, Path] = {}
    for split in sorted({row["split"] for row in rows}):
        items = [row for row in rows if row["split"] == split]
        jsonl = out_dir / f"{split}-{version}.jsonl"
        keypoints = out_dir / f"{split}-{version}-keypoints.csv"
        for path in (jsonl, keypoints):
            if path.exists():
                raise FileExistsError(f"{path} já existe; gere uma nova versão em vez de sobrescrever")
        with open(jsonl, "w", encoding="utf-8", newline="\n") as handle:
            for row in items:
                record = {field: row.get(field, "").strip() for field in QUESTION_FIELDS}
                record["target_sections"] = section_codes(row.get("target_sections", ""))
                handle.write(json.dumps(record, ensure_ascii=False) + "\n")
        with open(keypoints, "w", encoding="utf-8", newline="") as handle:
            writer = csv.writer(handle)
            writer.writerow(["question_id", "key_point_n", "key_point"])
            for row in items:
                for number, point in enumerate(split_key_points(row.get("key_points", "")), start=1):
                    writer.writerow([row["question_id"], number, point])
        written[f"{split}_questions"] = jsonl
        written[f"{split}_keypoints"] = keypoints
    return written


def _tokens(text: str) -> set[str]:
    folded = unicodedata.normalize("NFD", text.lower())
    folded = "".join(char for char in folded if unicodedata.category(char) != "Mn")
    return {token for token in re.findall(r"[a-z0-9]+", folded) if len(token) > 2}


def jaccard(a: str, b: str) -> float:
    ta, tb = _tokens(a), _tokens(b)
    return len(ta & tb) / len(ta | tb) if ta | tb else 0.0


def load_question_file(path: str | Path) -> list[dict[str, Any]]:
    with open(path, encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def _words(text: str) -> list[str]:
    folded = unicodedata.normalize("NFD", text.lower())
    folded = "".join(char for char in folded if unicodedata.category(char) != "Mn")
    return re.findall(r"[a-z0-9]+", folded)


class CorpusOverlap:
    """Longest word sequence a question shares with any corpus chunk (copied
    phrase detector, control B/F). Word n-grams of the corpus are indexed once."""

    MAX_N = 15

    def __init__(self, chunks: list[dict[str, Any]]):
        self.grams: dict[int, set[tuple[str, ...]]] = {n: set() for n in range(COPIED_RUN_WARNING, self.MAX_N + 1)}
        self.headings: set[str] = set()
        for chunk in chunks:
            words = _words(chunk["text"])
            for n in self.grams:
                self.grams[n].update(tuple(words[i:i + n]) for i in range(len(words) - n + 1))
            for heading in chunk.get("section_path", []):
                title = " ".join(_words(re.sub(r"^[\d.]+\s*", "", heading)))
                if len(title.split()) >= 3:
                    self.headings.add(title)

    def longest_run(self, text: str) -> int:
        words = _words(text)
        best = 0
        for n in range(COPIED_RUN_WARNING, min(self.MAX_N, len(words)) + 1):
            if any(tuple(words[i:i + n]) in self.grams[n] for i in range(len(words) - n + 1)):
                best = n
            else:
                break
        return best

    def copied_heading(self, text: str) -> str | None:
        normalized = " ".join(_words(text))
        return next((title for title in self.headings if title in normalized), None)


def _check_origin(item: dict[str, Any], allow_external_synthetic: bool) -> tuple[list[str], list[str]]:
    qid, origin = item.get("question_id", "?"), item.get("origin", "")
    errors, warnings = [], []
    if origin not in ORIGINS:
        return [f"{qid}: origin deve ser {sorted(ORIGINS)}, recebido {origin!r}"], []
    if origin in {"real", "adaptada"}:
        if not item.get("source_name") or not item.get("source_url"):
            errors.append(f"{qid}: pergunta {origin} exige source_name e source_url")
        if not item.get("original_text"):
            errors.append(f"{qid}: pergunta {origin} exige original_text (texto publicado, literal)")
        elif origin == "real" and item["original_text"].strip() != str(item.get("text", "")).strip():
            errors.append(f"{qid}: origem 'real' exige texto idêntico ao publicado; se mudou, use 'adaptada'")
        elif origin == "adaptada" and item["original_text"].strip() == str(item.get("text", "")).strip():
            warnings.append(f"{qid}: marcada como 'adaptada' mas idêntica ao original; use 'real'")
    if origin == "sintetica_externa":
        model = str(item.get("generator_model", "")).lower()
        if not model:
            errors.append(f"{qid}: sintetica_externa exige generator_model")
        elif any(family in model for family in EVALUATED_FAMILIES):
            errors.append(f"{qid}: gerada por família avaliada ({model}); proibido pela D15")
        if not allow_external_synthetic:
            errors.append(f"{qid}: perguntas sintéticas só após emenda ao protocolo aprovada pelo orientador (D15)")
    return errors, warnings


def check_questions(question_paths: list[str | Path], blueprint: list[dict[str, str]],
                    keypoints_paths: list[str | Path] = (), forbidden_paths: list[str | Path] = (),
                    near_duplicate_threshold: float = 0.6, corpus_dir: str | Path | None = None,
                    allow_external_synthetic: bool = False) -> dict[str, Any]:
    """Validate authored questions against the blueprint before freezing.

    Errors block freezing; warnings need a human decision (for example, two
    questions with very similar wording that are not a planned register pair).
    With ``corpus_dir``, phrases copied from the corpus and reproduced section
    titles are flagged (instrument plan v1, controls B and F).
    """
    errors: list[str] = []
    warnings: list[str] = []
    slots = {slot["slot_id"]: slot for slot in blueprint}
    questions = [item for path in question_paths for item in load_question_file(path)]
    ids = Counter(item.get("question_id") for item in questions)
    errors += [f"question_id duplicado: {qid}" for qid, count in ids.items() if count > 1]

    for item in questions:
        qid = item.get("question_id", "?")
        if not str(item.get("text", "")).strip():
            errors.append(f"{qid}: texto vazio")
            continue
        slot = slots.get(item.get("slot_id", ""))
        if slot is None:
            errors.append(f"{qid}: slot_id ausente ou fora do blueprint")
            continue
        for field in ("split", "need_group", "category", "register", "complexity", "answerable_from_corpus"):
            if item.get(field) != slot[field]:
                errors.append(f"{qid}: {field}={item.get(field)!r} difere do blueprint ({slot[field]!r})")
        if not item.get("author"):
            errors.append(f"{qid}: autoria não registrada")
        if not item.get("reviewed_by"):
            warnings.append(f"{qid}: sem revisor registrado")
        if len(str(item["text"]).split()) < 4:
            warnings.append(f"{qid}: pergunta com menos de 4 palavras")
        origin_errors, origin_warnings = _check_origin(item, allow_external_synthetic)
        errors += origin_errors
        warnings += origin_warnings
        if item.get("origin") in {"real", "adaptada"} and item.get("selected_by") not in SELECTED_BY:
            errors.append(f"{qid}: selected_by deve ser {sorted(SELECTED_BY)} (quem escolheu a pergunta publicada)")
        if item.get("register") == "leigo":
            folded = " ".join(_words(str(item["text"])))
            jargon = [term for term in TECHNICAL_TERMS if term in folded]
            if jargon:
                warnings.append(f"{qid}: pergunta leiga com termos técnicos do PCDT: {', '.join(jargon)}")

    overlap_report: dict[str, int] = {}
    if corpus_dir is not None:
        overlap = CorpusOverlap(load_chunks(corpus_dir))
        for item in questions:
            if not str(item.get("text", "")).strip():
                continue
            qid, run = item["question_id"], overlap.longest_run(item["text"])
            overlap_report[qid] = run
            if run >= COPIED_RUN_ERROR and item.get("origin") not in {"real"}:
                errors.append(f"{qid}: {run} palavras seguidas copiadas de um trecho do PCDT")
            elif run >= COPIED_RUN_WARNING:
                warnings.append(f"{qid}: {run} palavras seguidas iguais a um trecho do PCDT; reformular?")
            heading = overlap.copied_heading(item["text"])
            if heading:
                warnings.append(f"{qid}: reproduz o título de seção '{heading}'")

    keypoints: Counter = Counter()
    keypoint_sets: dict[str, set[str]] = {}
    for path in keypoints_paths:
        for row in read_table(path):
            keypoints[row["question_id"]] += 1
            keypoint_sets.setdefault(row["question_id"], set()).add(" ".join(_words(row["key_point"])))
    if keypoints_paths:
        # register pairs must ask for the same information (control: pair equivalence)
        members: dict[str, list[dict[str, Any]]] = {}
        for item in questions:
            group = item.get("need_group")
            if group and group != item.get("slot_id"):
                members.setdefault(group, []).append(item)
        for group, items in members.items():
            if len(items) == 2:
                a, b = items
                if keypoint_sets.get(a["question_id"]) != keypoint_sets.get(b["question_id"]):
                    errors.append(f"par {group}: {a['question_id']} e {b['question_id']} com pontos-chave diferentes; "
                                  "o par deve pedir a mesma informação")
    if keypoints_paths:
        for item in questions:
            if item.get("split") != "test":
                continue
            count = keypoints[item["question_id"]]
            if item.get("answerable_from_corpus") == "não":
                if count < 1:
                    errors.append(f"{item['question_id']}: registrar o que falta no corpus (1 ponto 'INSUFICIENTE: ...')")
            elif not 1 <= count <= MAX_KEY_POINTS:
                errors.append(f"{item['question_id']}: {count} pontos-chave (esperado 1 a {MAX_KEY_POINTS})")
            elif item.get("complexity") == "composta" and count < 2:
                # objective difficulty criterion (instrument plan v1, control C)
                errors.append(f"{item['question_id']}: composta exige ao menos 2 pontos-chave (2 unidades de informação)")
            elif item.get("complexity") == "simples" and count > 3:
                warnings.append(f"{item['question_id']}: simples com {count} pontos-chave; não seria composta?")

    pairs = {(slot["need_group"]) for slot in blueprint if slot["need_group"] != slot["slot_id"]}
    for i, first in enumerate(questions):
        for second in questions[i + 1:]:
            score = jaccard(first.get("text", ""), second.get("text", ""))
            same_pair = first.get("need_group") == second.get("need_group") and first.get("need_group") in pairs
            if score >= near_duplicate_threshold and not same_pair:
                message = f"{first['question_id']} e {second['question_id']} muito parecidas (Jaccard {score:.2f})"
                (errors if first.get("split") != second.get("split") else warnings).append(message)

    forbidden = [item for path in forbidden_paths for item in load_question_file(path)]
    for item in questions:
        for other in forbidden:
            if jaccard(item.get("text", ""), other.get("text", "")) >= near_duplicate_threshold:
                errors.append(f"{item['question_id']} reaproveita {other['question_id']} (conjunto proibido)")

    covered = Counter(item.get("slot_id") for item in questions)
    expected = {slot_id for slot_id, slot in slots.items()
                if slot["split"] in {item.get("split") for item in questions}}
    missing = sorted(expected - set(covered))
    if missing:
        errors.append(f"vagas sem pergunta: {', '.join(missing)}")

    strata = Counter((item.get("split"), item.get("register"), item.get("answerable_from_corpus"))
                     for item in questions)
    return {
        "n_questions": len(questions),
        "files": {str(path): hashlib.sha256(Path(path).read_bytes()).hexdigest()
                  for path in [*question_paths, *keypoints_paths]},
        "strata": {"/".join(key): value for key, value in sorted(strata.items())},
        "origins": dict(sorted(Counter(item.get("origin", "") for item in questions).items())),
        "longest_corpus_run": overlap_report,
        "errors": errors,
        "warnings": warnings,
    }


def semantic_similarity_report(questions: list[dict[str, Any]], retriever, pair_threshold: float = 0.90
                               ) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Dense similarity (same embedder as the index) of each question to the
    corpus and to every other question (instrument plan v1, control F).

    High similarity to the corpus is expected for answerable questions and is
    reported, not penalized: the copy check is lexical (``CorpusOverlap``).
    Question pairs above ``pair_threshold`` that are not a planned register
    pair are listed as possible thematic redundancy for human review.
    """
    texts = [item["text"] for item in questions]
    vectors = retriever.embedder.encode(texts)
    to_corpus = vectors @ retriever.embeddings.T
    between = vectors @ vectors.T
    target_ids = {}
    for item in questions:
        codes = item.get("target_sections") or []
        target_ids[item["question_id"]] = set(resolve_sections(retriever.chunks, codes)["chunk_ids"]) if codes else set()
    rows = []
    for i, item in enumerate(questions):
        order = to_corpus[i].argsort()[::-1]
        top = retriever.chunks[int(order[0])]
        targets = target_ids[item["question_id"]]
        rank_of_target = next((rank for rank, position in enumerate(order, start=1)
                               if retriever.chunks[int(position)]["chunk_id"] in targets), None)
        others = [(float(between[i, j]), questions[j]["question_id"]) for j in range(len(questions)) if j != i]
        nearest = max(others) if others else (None, None)
        rows.append({
            "question_id": item["question_id"], "register": item.get("register"), "origin": item.get("origin"),
            "max_cosine_corpus": round(float(to_corpus[i, order[0]]), 4), "top_chunk": top["chunk_id"],
            "top_chunk_section": " > ".join(top["section_path"]),
            "first_target_rank": rank_of_target,
            "nearest_question": nearest[1], "nearest_question_cosine": None if nearest[0] is None else round(nearest[0], 4),
        })
    pairs = []
    for i in range(len(questions)):
        for j in range(i + 1, len(questions)):
            same_pair = (questions[i].get("need_group") == questions[j].get("need_group")
                         and questions[i].get("need_group") != questions[i].get("slot_id"))
            if between[i, j] >= pair_threshold and not same_pair:
                pairs.append({"a": questions[i]["question_id"], "b": questions[j]["question_id"],
                              "cosine": round(float(between[i, j]), 4)})
    return rows, pairs


def candidate_matches(blueprint: list[dict[str, str]], external: list[dict[str, str]], chunks: list[dict[str, Any]],
                      embedder, corpus_vectors, top_n: int = 5) -> list[dict[str, Any]]:
    """Suggest published questions (verbatim, with source) for each slot.

    Candidates must share the slot's category. Answerable slots rank them by
    dense similarity to the *titles* of the target sections, not to chunk text,
    so the suggestion follows the topic without preferring questions that are
    already easy for the retriever. Questions flagged as changed by the 2026
    ordinances are excluded from answerable slots. Unanswerable slots rank by
    the lowest similarity to the whole corpus. The author chooses; nothing here
    writes or edits question text (D15).
    """
    ext_vectors = embedder.encode([row["question_verbatim"] for row in external])
    corpus_max = (ext_vectors @ corpus_vectors.T).max(axis=1)
    rows = []
    for slot in blueprint:
        pool = [i for i, row in enumerate(external) if row["category"] == slot["category"]]
        codes = section_codes(slot["target_sections"])
        if slot["answerable_from_corpus"] != "não":
            # topics changed in 2026 are valid only where the slot targets the 2026 acts (corpus v2)
            targets_2026 = any(code.startswith(("P47:", "P51:")) for code in codes)
            if not targets_2026:
                pool = [i for i in pool if external[i]["flag_2026"] != "tema alterado em 2026"]
            titles = resolve_sections(chunks, codes)["titles"] if codes else []
            topic = embedder.encode([" ; ".join(re.sub(r"^[\d.]+\s*", "", title) for title in titles)])[0]
            scored = sorted(((float(ext_vectors[i] @ topic), i) for i in pool), reverse=True)
            basis = "similaridade com os títulos das seções-alvo"
        else:
            scored = sorted(((-float(corpus_max[i]), i) for i in pool), reverse=True)
            basis = "menor similaridade com o corpus inteiro (conferir se o PCDT de fato não responde)"
        for rank, (score, i) in enumerate(scored[:top_n], start=1):
            row = external[i]
            rows.append({
                "slot_id": slot["slot_id"], "slot_register": slot["register"], "slot_category": slot["category"],
                "slot_answerable": slot["answerable_from_corpus"], "rank": rank, "external_id": row["id"],
                "score": round(abs(score), 4), "basis": basis,
                "register_matches": row["register"] == slot["register"], "flag_2026": row["flag_2026"],
                "question_verbatim": row["question_verbatim"], "source": row["source"], "url": row["url"],
                "asker": row["asker"],
            })
    return rows


STOPWORDS = set("""a ao aos as com da das de do dos e ela ele em entre essa esse esta este eu ha isso ja
la mais mas me mesmo na nao nas no nos o os ou para pela pelo per pode por porque qual quais quando que
quem se sem ser seu sua suas seus so tem ter um uma umas uns voce deve devem como sao foi esta estao""".split())


class LexicalIndex:
    """BM25 over chunk text and section titles, independent of the experiment's
    dense retriever. Used to *verify* that unanswerable questions are not
    answered anywhere in the corpus (instrument plan, control: non-answerable),
    without revealing how the evaluated pipeline (R0) ranks them."""

    def __init__(self, chunks: list[dict[str, Any]], k1: float = 1.5, b: float = 0.75):
        import math

        self.chunks, self.k1, self.b = chunks, k1, b
        self.docs = [self._terms(" ".join(chunk.get("section_path", [])) + " " + chunk["text"]) for chunk in chunks]
        self.avg = sum(len(doc) for doc in self.docs) / len(self.docs)
        frequency = Counter(term for doc in self.docs for term in set(doc))
        n = len(self.docs)
        self.idf = {term: math.log(1 + (n - df + 0.5) / (df + 0.5)) for term, df in frequency.items()}
        self.counts = [Counter(doc) for doc in self.docs]

    @staticmethod
    def _terms(text: str) -> list[str]:
        # crude stemming: 6-character prefixes of non-stopwords
        return [word[:6] for word in _words(text) if word not in STOPWORDS and len(word) > 2]

    def search(self, query: str, k: int = 10) -> list[tuple[float, dict[str, Any]]]:
        terms = self._terms(query)
        scored = []
        for doc, counts, chunk in zip(self.docs, self.counts, self.chunks):
            score = 0.0
            for term in terms:
                tf = counts.get(term, 0)
                if tf:
                    score += self.idf[term] * tf * (self.k1 + 1) / (tf + self.k1 * (1 - self.b + self.b * len(doc) / self.avg))
            scored.append((score, chunk))
        scored.sort(key=lambda pair: -pair[0])
        return [(round(score, 3), chunk) for score, chunk in scored[:k] if score > 0]


def unanswerability_report(chunks: list[dict[str, Any]], queries: list[dict[str, str]], k: int = 10) -> str:
    """Markdown for a human to read the k lexically closest chunks of each
    query and tick whether any of them answers it."""
    index = LexicalIndex(chunks)
    lines = ["# Verificação das perguntas não respondíveis e parciais", "",
             "Busca lexical BM25 sobre o corpus `pcdt2022-v1` (independente do recuperador do experimento). "
             "Para cada pergunta, leia os trechos e marque se algum responde, total ou parcialmente. "
             "A busca é lexical e não atravessa idiomas: para o documento da OMS (inglês), informe termos em inglês "
             "na coluna terms_en. "
             "A ausência de palavra-chave não basta: a decisão é humana.", ""]
    for query in queries:
        # BM25 does not cross languages: English terms (column terms_en) are needed
        # to reach the WHO document of corpus v2.
        terms_en = (query.get("terms_en") or "").strip()
        lines += [f"## {query.get('id', '')} {query.get('slot_id', '')}".strip(), "", f"> {query['text']}", ""]
        if terms_en:
            lines += [f"Termos em inglês usados também: *{terms_en}*", ""]
        lines += ["Conclusão do autor: [ ] nenhum trecho responde · [ ] responde em parte · [ ] responde", ""]
        for rank, (score, chunk) in enumerate(index.search(f"{query['text']} {terms_en}".strip(), k), start=1):
            pages = f"p. {chunk['page_start']}" + (f"–{chunk['page_end']}" if chunk["page_end"] != chunk["page_start"] else "")
            lines += [f"{rank}. **{' > '.join(chunk['section_path'])[-90:]}** ({pages}, BM25 {score})", "",
                      f"   {chunk['text']}", ""]
    return "\n".join(lines)
