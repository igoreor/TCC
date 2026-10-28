"""Copia a parte publicável do estudo para a pasta `estudo-expansao/` do repositório do NexoHansen (D41).

A versão de trabalho continua no workspace do autor (C:\\TCC). O repositório recebe uma cópia
byte a byte (hashes de corpus, prompts e perguntas continuam válidos) só do que está em ALLOW:
código, testes, configurações e prompts do harness, protocolo, corpora com índices, lotes e
instrumento de perguntas. Notas internas, rascunhos, cópias do Drive, manuscritos, PDFs e
registros da demonstração ficam de fora.

Uso (a partir de C:\\TCC):
    software/rag-study/.venv/Scripts/python -X utf8 software/rag-study/scripts/publish_to_nexohansen.py TCC/estudo-expansao
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import sys
from pathlib import Path

ALLOW = [
    "software/rag-study/src",
    "software/rag-study/tests",
    "software/rag-study/scripts",
    "software/rag-study/config",
    "software/rag-study/prompts",
    "software/rag-study/README.md",
    "software/rag-study/IMPLEMENTATION_STATUS.md",
    "software/rag-study/VALIDATION_PENDING.md",
    "software/rag-study/pyproject.toml",
    "software/rag-study/uv.lock",
    "research/protocol",
    "research/corpus",
    "research/runs",
    "research/questions",
    "research/sources/README.md",
    "research/demo-logs/README.md",
]
SKIP_PARTS = {"__pycache__", ".pytest_cache", ".venv", ".ruff_cache", ".mypy_cache"}
SKIP_SUFFIXES = {".pyc", ".pyo"}
BINARY_SUFFIXES = {".npy", ".pdf", ".png", ".jpg", ".xlsx"}
# Arquivos da raiz de destino mantidos à mão, nunca apagados pela sincronização.
OWN_FILES = {"README.md", ".gitattributes", ".gitignore"}
FORBIDDEN = [
    (re.compile(r"sk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}"), "chave de API"),
    (re.compile(r"(?:OPENAI|ANTHROPIC)_API_KEY\s*=\s*['\"]?[A-Za-z0-9_-]{8,}"), "chave de API atribuída"),
    (re.compile(r"[A-Za-z]:[\\/]+Users[\\/]+", re.IGNORECASE), "caminho de usuário do Windows"),
    (re.compile(r"/home/[a-z_][a-z0-9_-]*/|/Users/[A-Za-z]"), "caminho de usuário"),
]


def selected_files(root: Path) -> list[Path]:
    files = []
    for entry in ALLOW:
        path = root / entry
        if not path.exists():
            raise FileNotFoundError(f"não encontrado: {entry}")
        candidates = [path] if path.is_file() else sorted(p for p in path.rglob("*") if p.is_file())
        for file in candidates:
            relative = file.relative_to(root)
            if (SKIP_PARTS & set(relative.parts) or file.suffix in SKIP_SUFFIXES
                    or any(part.endswith(".egg-info") for part in relative.parts)):
                continue
            files.append(relative)
    return files


def check_text(path: Path) -> list[str]:
    if path.suffix in BINARY_SUFFIXES:
        return []
    text = path.read_bytes().decode("utf-8", errors="replace")
    return [f"{path}: {label}" for pattern, label in FORBIDDEN if pattern.search(text)]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("dest", help="pasta estudo-expansao/ dentro do repositório do NexoHansen")
    parser.add_argument("--root", default=".", help="workspace do autor (C:\\TCC)")
    args = parser.parse_args(argv)
    root, dest = Path(args.root).resolve(), Path(args.dest).resolve()
    if root in dest.parents and not (dest.parent / ".git").exists():
        raise SystemExit(f"{dest} precisa ficar na raiz de um repositório git")

    files = selected_files(root)
    problems = [problem for relative in files for problem in check_text(root / relative)]
    if problems:
        print("Nada foi copiado. Conteúdo proibido:", *problems, sep="\n  ", file=sys.stderr)
        return 1

    wanted = {relative.as_posix() for relative in files}
    removed = 0
    for top in {Path(entry).parts[0] for entry in ALLOW}:
        for existing in sorted((dest / top).rglob("*")) if (dest / top).exists() else []:
            relative = existing.relative_to(dest).as_posix()
            if existing.is_file() and relative not in wanted:
                existing.unlink()
                removed += 1
    copied = 0
    for relative in files:
        target = dest / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists() or sha256(target) != sha256(root / relative):
            shutil.copyfile(root / relative, target)
            copied += 1

    # Os corpora conferem o próprio hash ao carregar; uma cópia com quebra de linha alterada falharia ali.
    for manifest_path in (dest / "research" / "corpus").rglob("manifest.json"):
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        chunks = manifest_path.parent / "chunks.jsonl"
        if "snapshot_sha256" in manifest and chunks.exists() and sha256(chunks) != manifest["snapshot_sha256"]:
            raise SystemExit(f"hash divergente depois da cópia: {chunks}")

    size = sum((dest / relative).stat().st_size for relative in files)
    print(f"{len(files)} arquivos ({size / 1e6:.1f} MB): {copied} copiados, {removed} removidos, "
          f"{len(files) - copied} sem mudança")
    return 0


if __name__ == "__main__":
    sys.exit(main())
