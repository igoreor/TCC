"""Build a frozen, traceable chunk corpus from an official PDF.

Every cleaning rule is typographic and logged (no manual edits), so the same
PDF and configuration always produce the same ``chunks.jsonl`` and snapshot
hash.
"""

from __future__ import annotations

import csv
import hashlib
import json
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

SECTION_NUMBER = re.compile(r"^(\d+(?:\.\d+)*)\.?(?:\s+|$)")
CITATION_SPAN = re.compile(r"[\d\s,;\-–]+")
SENTENCE_BOUNDARY = re.compile(r"(?<=[.!?;:])\s+(?=[A-ZÁÂÃÉÊÍÓÔÕÚÇ0-9•›(“\"])")
LABEL = re.compile(r"\b(Quadro|Fluxograma|Figura|Tabela)\s+\d+")


@dataclass
class CorpusConfig:
    corpus_id: str
    source_pdf: str
    expected_sha256: str
    document_id: str
    document_title: str
    publisher: str
    year: int
    document_type: str
    include_pages: list[list[int]]
    exclusions: list[dict[str, Any]]
    header_max_y: float = 60.0
    footer_min_y: float = 790.0
    furniture_max_size: float = 8.5
    heading_min_size: float = 15.0
    top_level_heading_min_size: float = 20.0
    chapter_number_min_size: float = 100.0
    drop_superscript_citations: bool = True
    max_words: int = 200
    overlap_words: int = 40
    min_words: int = 40
    # Options added for corpus v2 (other layouts). Defaults keep the PCDT
    # behaviour and its hashes unchanged.
    heading_size_levels: list[list[float]] | None = None  # [[min_size, level], ...] for unnumbered headings
    heading_max_words: int | None = None  # a longer "heading" is a large-font callout: kept as paragraph
    drop_line_patterns: list[str] = field(default_factory=list)  # full-line regexes removed as furniture
    excerpt_start: str | None = None  # keep only the text from this marker...
    excerpt_end: str | None = None  # ...up to (not including) this one
    root_section: str | None = None  # section title prefixed to every chunk (single-act documents)
    sort_blocks: bool = True  # False keeps PyMuPDF's reading order (multi-column gazettes)
    source_url: str | None = None
    license: str | None = None
    language: str = "pt"

    @classmethod
    def from_file(cls, path: str | Path) -> "CorpusConfig":
        return cls(**json.loads(Path(path).read_text(encoding="utf-8")))

    def included(self, page_number: int) -> bool:
        return any(start <= page_number <= end for start, end in self.include_pages)


@dataclass
class Element:
    kind: str  # "heading" or "paragraph"
    text: str
    page: int
    size: float = 0.0


@dataclass
class Sentence:
    text: str
    page: int
    section_path: tuple[str, ...]


@dataclass
class Chunk:
    chunk_id: str
    document_id: str
    ordinal: int
    text: str
    embed_text: str
    section_path: list[str]
    sections_touched: list[str]
    page_start: int
    page_end: int
    n_words: int
    labels: list[str]
    text_sha256: str


@dataclass
class ExtractionStats:
    pages_included: int = 0
    pages_without_text: list[int] = field(default_factory=list)
    furniture_lines_removed: int = 0
    citation_spans_removed: int = 0
    headings_detected: int = 0


def sha256_file(path: str | Path) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for block in iter(lambda: handle.read(1 << 20), b""):
            digest.update(block)
    return digest.hexdigest()


def _line_text(line: dict, config: CorpusConfig, stats: ExtractionStats) -> tuple[str, float]:
    parts = []
    sizes = []
    for span in line["spans"]:
        text = span["text"]
        if (
            config.drop_superscript_citations
            and span["flags"] & 1
            and text.strip()
            and CITATION_SPAN.fullmatch(text.strip())
        ):
            stats.citation_spans_removed += 1
            continue
        parts.append(text)
        if text.strip():
            sizes.append(span["size"])
    text = re.sub(r"\s+", " ", "".join(parts)).strip()
    return text, max(sizes) if sizes else 0.0


def extract_elements(config: CorpusConfig, pdf_path: str | Path) -> tuple[list[Element], ExtractionStats]:
    import pymupdf

    stats = ExtractionStats()
    elements: list[Element] = []
    document = pymupdf.open(pdf_path)
    drop = [re.compile(pattern) for pattern in config.drop_line_patterns]
    inside = config.excerpt_start is None
    finished = False
    for index, page in enumerate(document):
        page_number = index + 1
        if not config.included(page_number):
            continue
        stats.pages_included += 1
        page_had_text = False
        for block in page.get_text("dict", sort=config.sort_blocks)["blocks"]:
            paragraph: list[str] = []
            for line in block.get("lines", []):
                text, size = _line_text(line, config, stats)
                if not text:
                    continue
                if not inside:
                    if finished or config.excerpt_start not in text:
                        continue
                    inside = True
                elif config.excerpt_end and config.excerpt_end in text and config.excerpt_start not in text:
                    inside, finished = False, True
                    continue
                y0 = line["bbox"][1]
                if (y0 < config.header_max_y or y0 > config.footer_min_y) and size <= config.furniture_max_size:
                    stats.furniture_lines_removed += 1
                    continue
                if any(pattern.fullmatch(text) for pattern in drop):
                    stats.furniture_lines_removed += 1
                    continue
                page_had_text = True
                if size >= config.heading_min_size:
                    if paragraph:
                        elements.append(Element("paragraph", _join_lines(paragraph), page_number))
                        paragraph = []
                    elements.append(Element("heading", text, page_number, size))
                else:
                    paragraph.append(text)
            if paragraph:
                elements.append(Element("paragraph", _join_lines(paragraph), page_number))
        if not page_had_text:
            stats.pages_without_text.append(page_number)
    return _merge_headings(elements, config), stats


def _join_lines(lines: list[str]) -> str:
    # The PDF has no syllabic hyphenation: a trailing hyphen belongs to a
    # compound word ("bem-estar", "IL-6"), so it is kept and no space is added.
    text = lines[0]
    for line in lines[1:]:
        text = text + line if text.endswith("-") else f"{text} {line}"
    return text


def _merge_headings(elements: list[Element], config: CorpusConfig) -> list[Element]:
    """Merge heading fragments split across lines or spans.

    A chapter opener is a huge numeral followed by its title; numbered section
    headings may have the number and the title on separate lines. A new
    numbered fragment always starts a new heading.
    """
    merged: list[Element] = []
    pending: Element | None = None
    for element in elements:
        if element.kind != "heading":
            if pending:
                merged.append(pending)
                pending = None
            merged.append(element)
            continue
        is_chapter_number = element.size >= config.chapter_number_min_size and element.text.isdigit()
        starts_numbered = bool(SECTION_NUMBER.match(element.text))
        pending_is_bare_number = pending is not None and bool(re.fullmatch(r"\d+(?:\.\d+)*\.?", pending.text))
        # With size levels configured, consecutive headings of different levels are
        # distinct titles (chapter, section, subsection), not one title split in lines.
        level_changes = (pending is not None and config.heading_size_levels is not None
                         and _size_level(element.size, config) != _size_level(pending.size, config))
        if pending is None:
            pending = Element("heading", element.text, element.page, element.size)
        elif pending_is_bare_number:
            pending = Element("heading", f"{pending.text} {element.text}", pending.page, element.size)
        elif starts_numbered or is_chapter_number or level_changes:
            merged.append(pending)
            pending = Element("heading", element.text, element.page, element.size)
        else:
            pending = Element("heading", f"{pending.text} {element.text}", pending.page, max(pending.size, element.size))
    if pending:
        merged.append(pending)
    if config.heading_max_words:
        # large-font lead paragraphs and callouts are not section titles
        merged = [Element("paragraph", element.text, element.page, element.size)
                  if element.kind == "heading" and len(element.text.split()) > config.heading_max_words
                  and not SECTION_NUMBER.match(element.text) else element
                  for element in merged]
    return merged


def _size_level(size: float, config: CorpusConfig) -> int | None:
    for min_size, level in sorted(config.heading_size_levels or [], reverse=True):
        if size >= min_size:
            return int(level)
    return None


def _heading_level(text: str, size: float, config: CorpusConfig) -> int:
    match = SECTION_NUMBER.match(text)
    if match:
        return match.group(1).count(".") + 1
    if config.heading_size_levels:
        for min_size, level in sorted(config.heading_size_levels, reverse=True):
            if size >= min_size:
                return int(level)
    return 1 if size >= config.top_level_heading_min_size else 2


def to_sentences(elements: list[Element], config: CorpusConfig, stats: ExtractionStats) -> list[Sentence]:
    root = [(0, config.root_section)] if config.root_section else []
    path: list[tuple[int, str]] = list(root)
    sentences: list[Sentence] = []
    for element in elements:
        if element.kind == "heading":
            stats.headings_detected += 1
            level = _heading_level(element.text, element.size, config)
            path = [item for item in path if item[0] < level] + [(level, element.text)]
            if root and path[0] != root[0]:
                path = root + path
            continue
        section = tuple(title for _, title in path)
        for part in SENTENCE_BOUNDARY.split(element.text):
            if part.strip():
                sentences.append(Sentence(part.strip(), element.page, section))
    return sentences


def _split_long(sentence: Sentence, max_words: int) -> list[Sentence]:
    words = sentence.text.split()
    if len(words) <= max_words:
        return [sentence]
    return [
        Sentence(" ".join(words[start:start + max_words]), sentence.page, sentence.section_path)
        for start in range(0, len(words), max_words)
    ]


def chunk_sentences(sentences: list[Sentence], config: CorpusConfig) -> list[Chunk]:
    """Greedy sentence packing up to ``max_words``.

    A section change closes the current chunk only if it already holds
    ``min_words``; short sections are merged forward so headings with one line
    of text do not become isolated chunks. Overlap is applied only between
    chunks of the same section.
    """
    pieces = [piece for sentence in sentences for piece in _split_long(sentence, config.max_words)]
    chunks: list[Chunk] = []
    buffer: list[Sentence] = []

    def words(items: list[Sentence]) -> int:
        return sum(len(item.text.split()) for item in items)

    def flush() -> None:
        if not buffer:
            return
        text = " ".join(item.text for item in buffer)
        section_path = list(buffer[0].section_path)
        touched: list[str] = []
        for item in buffer:
            leaf = item.section_path[-1] if item.section_path else ""
            if leaf and leaf not in touched:
                touched.append(leaf)
        digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
        ordinal = len(chunks)
        header = " > ".join(section_path)
        chunks.append(Chunk(
            chunk_id=f"{config.corpus_id}-c{ordinal:04d}-{digest[:8]}",
            document_id=config.document_id,
            ordinal=ordinal,
            text=text,
            embed_text=f"{header}\n{text}" if header else text,
            section_path=section_path,
            sections_touched=touched,
            page_start=min(item.page for item in buffer),
            page_end=max(item.page for item in buffer),
            n_words=len(text.split()),
            labels=sorted({match.group(0) for match in LABEL.finditer(text)}),
            text_sha256=digest,
        ))

    for sentence in pieces:
        section_changed = bool(buffer) and sentence.section_path != buffer[-1].section_path
        if section_changed and words(buffer) >= config.min_words:
            flush()
            buffer = []
        elif buffer and words(buffer) + len(sentence.text.split()) > config.max_words:
            flush()
            overlap: list[Sentence] = []
            for item in reversed(buffer):
                if item.section_path != sentence.section_path:
                    break
                if words(overlap) + len(item.text.split()) > config.overlap_words:
                    break
                overlap.insert(0, item)
            buffer = overlap
        buffer.append(sentence)
    flush()
    return chunks


def build_corpus(config: CorpusConfig, workspace_root: str | Path, output_dir: str | Path) -> dict[str, Any]:
    import pymupdf

    root = Path(workspace_root)
    pdf_path = root / config.source_pdf
    actual = sha256_file(pdf_path)
    if actual != config.expected_sha256:
        raise ValueError(f"source PDF hash mismatch: expected {config.expected_sha256}, got {actual}")

    elements, stats = extract_elements(config, pdf_path)
    sentences = to_sentences(elements, config, stats)
    chunks = chunk_sentences(sentences, config)

    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=False)
    chunks_path = out / "chunks.jsonl"
    with chunks_path.open("w", encoding="utf-8", newline="\n") as handle:
        for chunk in chunks:
            handle.write(json.dumps(asdict(chunk), ensure_ascii=False, sort_keys=True) + "\n")

    with (out / "sections.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["page", "heading"])
        for element in elements:
            if element.kind == "heading":
                writer.writerow([element.page, element.text])

    with (out / "exclusions.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["page_start", "page_end", "reason"])
        for item in config.exclusions:
            writer.writerow([item["pages"][0], item["pages"][1], item["reason"]])
        for page in stats.pages_without_text:
            writer.writerow([page, page, "página incluída sem texto extraível (separador ou imagem)"])

    word_counts = [chunk.n_words for chunk in chunks]
    manifest = {
        "corpus_id": config.corpus_id,
        "created_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "snapshot_sha256": sha256_file(chunks_path),
        "source": {
            "path": config.source_pdf,
            "sha256": actual,
            "pages_total": pymupdf.open(pdf_path).page_count,
            "document_id": config.document_id,
            "title": config.document_title,
            "publisher": config.publisher,
            "year": config.year,
            "document_type": config.document_type,
            "url": config.source_url,
            "license": config.license,
            "language": config.language,
        },
        "extractor": {"library": "pymupdf", "version": pymupdf.VersionBind},
        "config": asdict(config),
        "stats": {
            **asdict(stats),
            "sentences": len(sentences),
            "chunks": len(chunks),
            "words_total": sum(word_counts),
            "words_min": min(word_counts) if word_counts else 0,
            "words_max": max(word_counts) if word_counts else 0,
            "words_mean": round(sum(word_counts) / len(word_counts), 1) if word_counts else 0,
        },
    }
    (out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return manifest


def load_chunks(corpus_dir: str | Path) -> list[dict[str, Any]]:
    with (Path(corpus_dir) / "chunks.jsonl").open(encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def merge_corpora(component_dirs: list[str | Path], corpus_id: str, output_dir: str | Path) -> dict[str, Any]:
    """Concatenate frozen single-document corpora into one multi-document
    corpus. Chunk records are kept as built (ids, text, pages, document_id);
    only ``ordinal`` is renumbered, so the first component keeps its ordinals.
    Each component is verified against its own snapshot hash."""
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=False)
    chunks: list[dict[str, Any]] = []
    components = []
    sections_rows, exclusion_rows = [], []
    for directory in map(Path, component_dirs):
        manifest = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))
        snapshot = sha256_file(directory / "chunks.jsonl")
        if snapshot != manifest["snapshot_sha256"]:
            raise ValueError(f"{directory}: chunks.jsonl does not match its manifest")
        component_chunks = load_chunks(directory)
        components.append({"corpus_id": manifest["corpus_id"], "snapshot_sha256": snapshot,
                           "source": manifest["source"], "chunks": len(component_chunks)})
        chunks.extend(component_chunks)
        for name, rows in (("sections.csv", sections_rows), ("exclusions.csv", exclusion_rows)):
            if (directory / name).exists():
                with (directory / name).open(encoding="utf-8", newline="") as handle:
                    rows.extend({"component": manifest["corpus_id"], **row} for row in csv.DictReader(handle))
    ids = [chunk["chunk_id"] for chunk in chunks]
    if len(set(ids)) != len(ids):
        raise ValueError("duplicate chunk_id across components")
    chunks_path = out / "chunks.jsonl"
    with chunks_path.open("w", encoding="utf-8", newline="\n") as handle:
        for ordinal, chunk in enumerate(chunks):
            handle.write(json.dumps({**chunk, "ordinal": ordinal}, ensure_ascii=False, sort_keys=True) + "\n")
    for name, rows in (("sections.csv", sections_rows), ("exclusions.csv", exclusion_rows)):
        if rows:
            with (out / name).open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
                writer.writeheader()
                writer.writerows(rows)
    word_counts = [chunk["n_words"] for chunk in chunks]
    manifest = {
        "corpus_id": corpus_id,
        "created_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "snapshot_sha256": sha256_file(chunks_path),
        "components": components,
        "stats": {"chunks": len(chunks), "documents": len({chunk["document_id"] for chunk in chunks}),
                  "words_total": sum(word_counts), "words_mean": round(sum(word_counts) / len(word_counts), 1)},
    }
    (out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return manifest
