"""Build the curation matrix of published candidates (curation v2).

Fit of each candidate to each slot is computed from the agent annotations
(curation_v2_annotations.py) with fixed rules, so that every rating can be
audited. Recommendations are checked against the rules; when they disagree
the decision becomes "literal_com_ressalva" instead of hiding the conflict.
Never edits question text and never calls an evaluated model.

Usage (from C:\\TCC): python -X utf8 software/rag-study/scripts/curation_v2_build.py
"""

import csv
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "software" / "rag-study" / "src"))
sys.path.insert(0, str(Path(__file__).resolve().parent))

VERSION = sys.argv[sys.argv.index("--version") + 1] if "--version" in sys.argv else "v2"
ANNOTATIONS, RECOMMENDATIONS = (lambda m: (m.ANNOTATIONS, m.RECOMMENDATIONS))(
    __import__(f"curation_{VERSION}_annotations"))
from rag_study.questions import read_table, section_codes, write_sheet  # noqa: E402

QDIR = ROOT / "research" / "questions"


def overlap(a: str, b: str) -> bool:
    return a == b or a.startswith(b + ".") or b.startswith(a + ".")


def parse_annotations():
    notes = {}
    for line in ANNOTATIONS.strip().splitlines():
        ext_id, sections, answerable, complexity, issues, note = line.split("|")
        notes[ext_id] = {
            "sections": [] if sections == "-" else sections.split(";"),
            "answerable": answerable, "complexity": complexity,
            "issues": [issue for issue in issues.split(";") if issue], "note": note,
        }
    return notes


def thematic_fit(slot, ann) -> str:
    if slot["answerable_from_corpus"] == "não":
        return {"não": "alta", "parcial": "média"}.get(ann["answerable"], "baixa")
    targets = section_codes(slot["target_sections"])
    if not ann["sections"]:
        return "baixa"
    inside = [any(overlap(c, t) for t in targets) for c in ann["sections"]]
    return "alta" if all(inside) else "média" if any(inside) else "baixa"


def assess(slot, ext, ann):
    fit = thematic_fit(slot, ann)
    register_ok = ext["register"] == slot["register"]
    complexity_ok = ann["complexity"] == slot["complexity"]
    answer_ok = ann["answerable"] == slot["answerable_from_corpus"]
    blocking = [i for i in ann["issues"] if i in {"contexto", "F2026"} or i.startswith("duplicata")]
    if "parte_fora_pcdt" in ann["issues"] and slot["answerable_from_corpus"] != "parcial":
        blocking.append("parte_fora_pcdt")
    literal = fit == "alta" and register_ok and complexity_ok and answer_ok and not [
        b for b in blocking if not b.startswith("duplicata")]
    adapt = not literal and fit in {"alta", "média"} and "F2026" not in ann["issues"]
    problems = list(ann["issues"])
    if not register_ok:
        problems.append(f"registro {ext['register']} (vaga {slot['register']})")
    if not complexity_ok:
        problems.append(f"{ann['complexity']} (vaga {slot['complexity']})")
    if not answer_ok:
        problems.append(f"respondível={ann['answerable']} (vaga {slot['answerable_from_corpus']})")
    return {"adequacao_tematica": fit, "linguistica": "ok" if register_ok else "registro diferente",
            "complexidade": "ok" if complexity_ok else "diferente",
            "respondibilidade": "ok" if answer_ok else "diferente",
            "uso_literal": "sim" if literal else "não", "exige_adaptacao": "sim" if adapt else "não",
            "problemas": "; ".join(problems)}


def main() -> None:
    notes = parse_annotations()
    slots = {row["slot_id"]: row for row in read_table(QDIR / f"blueprint-{VERSION}.csv")}
    external = {row["id"]: row for row in read_table(QDIR / "external-questions-candidates.csv")}
    by_slot: dict[str, list[str]] = {}
    for row in read_table(QDIR / f"candidates-by-slot-{VERSION}.csv"):
        by_slot.setdefault(row["slot_id"], []).append(row["external_id"])

    rows, summary = [], []
    for slot_id, slot in slots.items():
        decision, rec_id, justification, pending = RECOMMENDATIONS[slot_id]
        candidates = list(by_slot.get(slot_id, []))
        if rec_id and rec_id not in candidates:
            candidates.append(rec_id)  # better match found outside the automatic top 5
        rule_literal = None
        for ext_id in candidates:
            ext, ann = external[ext_id], notes[ext_id]
            result = assess(slot, ext, ann)
            if ext_id == rec_id:
                rule_literal = result["uso_literal"] == "sim"
            rows.append({"slot_id": slot_id, "slot_registro": slot["register"], "slot_complexidade": slot["complexity"],
                         "slot_respondivel": slot["answerable_from_corpus"], "slot_secoes": slot["target_sections"],
                         "external_id": ext_id, "fora_do_top5": "sim" if ext_id not in by_slot.get(slot_id, []) else "",
                         "pergunta_literal": ext["question_verbatim"], "fonte": ext["source"], "url": ext["url"],
                         "quem_perguntou": ext["asker"], "secoes_que_aborda": ";".join(ann["sections"]) or "-",
                         "pcdt_responde": ann["answerable"], **result, "nota_do_agente": ann["note"],
                         "recomendada": "sim" if ext_id == rec_id else ""})
        if decision == "literal" and rule_literal is False:
            decision = "literal_com_ressalva"
            pending = ("a pergunta também toca seção fora das seções-alvo; usar literal só se os pontos-chave "
                       "couberem nas seções-alvo") + (f"; {pending}" if pending else "")
        rec = external.get(rec_id, {})
        summary.append({"slot_id": slot_id, "need_group": slot["need_group"], "categoria": slot["category"],
                         "registro": slot["register"], "complexidade": slot["complexity"],
                         "respondivel": slot["answerable_from_corpus"], "decisao": decision,
                         "melhor_candidata": rec_id, "texto_literal": rec.get("question_verbatim", ""),
                         "fonte": rec.get("source", ""), "url": rec.get("url", ""), "justificativa": justification,
                         "problemas": notes[rec_id]["note"] if rec_id else "", "decisao_pendente": pending})

    columns = list(rows[0])
    for name, data in ((f"curation-{VERSION}-by-candidate.csv", rows), (f"curation-{VERSION}-summary.csv", summary)):
        path = QDIR / name
        write_sheet(data, path, list(data[0]))
        print(f"{path.name}: {len(data)} linhas")
    counts = Counter(row["decisao"] for row in summary)
    used = [row["melhor_candidata"] for row in summary if row["decisao"] in {"literal", "literal_com_ressalva"}]
    print(dict(counts), "| reaproveitamento literal duplicado:", [i for i, n in Counter(used).items() if n > 1])
    write_markdown(summary, rows, counts)
    write_blind(slots, rows)
    _ = columns


def write_blind(slots, rows) -> None:
    """Selection sheet without the agent's ratings or recommendations, so the
    author can choose before seeing them (control of agent-selection bias).
    Never overwrites a sheet the author may have filled."""
    path = QDIR / f"curation-{VERSION}-blind.csv"
    if path.exists():
        print(f"{path.name} já existe; não sobrescrevo")
        return
    import random

    out = []
    for slot_id, slot in slots.items():
        candidates = sorted((r for r in rows if r["slot_id"] == slot_id), key=lambda r: r["external_id"])
        random.Random(f"blind-{slot_id}").shuffle(candidates)  # order reveals neither rank nor recommendation
        listing = " || ".join(f"{c['external_id']}: {c['pergunta_literal']} [{c['fonte'][:40]}]" for c in candidates)
        out.append({"slot_id": slot_id, "categoria": slot["category"], "registro": slot["register"],
                    "complexidade": slot["complexity"], "respondivel": slot["answerable_from_corpus"],
                    "secoes": slot["target_sections"], "nota_da_vaga": slot["design_note"],
                    "candidatas_em_ordem_aleatoria": listing, "escolha_autor": "", "uso_autor": "", "motivo_autor": ""})
    write_sheet(out, path, list(out[0]))
    print(f"{path.name}: {len(out)} vagas (sem recomendações do agente)")


def agreement(blind_path: str) -> None:
    """Agreement between the author's blind choices and the agent's
    recommendations: exact candidate match and Cohen's kappa on the use
    category (literal / adaptar / autor)."""
    from rag_study.analysis import cohen_kappa

    agent = {r["slot_id"]: r for r in read_table(QDIR / f"curation-{VERSION}-summary.csv")}
    author = [r for r in read_table(blind_path) if r["uso_autor"].strip()]
    category = {"literal": "literal", "literal_com_ressalva": "literal", "adaptar": "adaptar", "autor": "autor",
                "pendente": "autor"}
    same_choice = sum(1 for r in author
                      if r["escolha_autor"].strip().upper() == (agent[r["slot_id"]]["melhor_candidata"] or "NENHUMA"))
    a = [category[agent[r["slot_id"]]["decisao"]] for r in author]
    b = [r["uso_autor"].strip().lower() for r in author]
    print({"vagas_avaliadas": len(author), "mesma_candidata": same_choice,
           "concordancia_uso": round(sum(x == y for x, y in zip(a, b)) / len(author), 3) if author else None,
           "kappa_uso": round(cohen_kappa(a, b, ["literal", "adaptar", "autor"]), 3) if author else None})


LABELS = {"literal": "usar literal", "literal_com_ressalva": "literal com ressalva", "adaptar": "adaptar (autor)",
          "autor": "autor escreve", "pendente": "decisão pendente"}


def cell(text: str) -> str:
    return str(text).replace("|", "/").replace("\n", " ")


def write_markdown(summary, rows, counts) -> None:
    lines = [
        f"# Curadoria das perguntas publicadas ({VERSION})", "",
        "Gerado em 23/10/2026 por `software/rag-study/scripts/curation_v2_build.py`. Nenhum texto de pergunta foi "
        "redigido ou alterado (D15) e nenhum modelo avaliado foi executado.", "",
        "Cada candidata foi anotada uma vez pelo agente (seções do PCDT que aborda, se o corpus responde, complexidade "
        "e problemas; arquivo `curation_v2_annotations.py`). A adequação a cada vaga é calculada por regras fixas:",
        "",
        "- **temática alta:** todas as seções que a pergunta aborda estão nas seções-alvo da vaga;",
        "- **temática média:** parte das seções está nas seções-alvo;",
        "- **temática baixa:** nenhuma seção está nas seções-alvo;",
        "- nas vagas não respondíveis, alta = o PCDT não responde.",
        "",
        "As recomendações são do agente e **precisam da confirmação do autor**. O agente pertence a uma família avaliada; "
        "por isso só usou os critérios da vaga, nunca o desempenho esperado dos modelos (viés residual declarado).", "",
        "## Resumo", "",
        f"- usar literal: {counts.get('literal', 0)}",
        f"- literal com ressalva: {counts.get('literal_com_ressalva', 0)} (a pergunta toca seção vizinha; usar literal "
        "só se os pontos-chave couberem nas seções-alvo)",
        f"- adaptar a partir de pergunta publicada: {counts.get('adaptar', 0)} (o autor reescreve; origem `adaptada`)",
        f"- autor escreve: {counts.get('autor', 0)} (nenhuma candidata serve)",
        f"- decisão pendente: {counts.get('pendente', 0)}", "",
        "Nos pares de registro, uma pergunta real ocupa uma vaga, e a outra precisa expressar a mesma necessidade no "
        "outro registro; por isso o par geralmente leva uma adaptação.", "",
        "## Tabela consolidada", "",
        "| Vaga | Registro · complexidade · respondível | Decisão | Melhor candidata (texto literal) | Fonte | "
        "Problemas | Decisão pendente |",
        "|---|---|---|---|---|---|---|",
    ]
    for row in summary:
        candidate = (f"**{row['melhor_candidata']}**: {cell(row['texto_literal'])}"
                     if row["melhor_candidata"] else "—")
        source = f"[{cell(row['fonte'])[:60]}]({row['url']})" if row["url"] else "—"
        lines.append(f"| {row['slot_id']} ({row['need_group']}) | {row['registro']} · {row['complexidade']} · "
                     f"{row['respondivel']} | {LABELS[row['decisao']]} | {candidate} | {source} | "
                     f"{cell(row['problemas'])} | {cell(row['decisao_pendente'])} |")
    lines += ["", "## Detalhe por vaga", ""]
    for row in summary:
        lines += [f"### {row['slot_id']} · {row['categoria']} · {row['registro']} · {row['complexidade']} · "
                  f"respondível: {row['respondivel']}", "",
                  f"Decisão: **{LABELS[row['decisao']]}**. {row['justificativa']}."
                  + (f" Pendente: {row['decisao_pendente']}." if row["decisao_pendente"] else ""), "",
                  "| Candidata | Texto literal | Fonte | Temática | Registro | Complexidade | Respondível | Literal | "
                  "Adaptar | Problemas |",
                  "|---|---|---|---|---|---|---|---|---|---|"]
        for cand in (r for r in rows if r["slot_id"] == row["slot_id"]):
            mark = " ★" if cand["recomendada"] else ""
            extra = " (fora do top 5)" if cand["fora_do_top5"] else ""
            lines.append(f"| {cand['external_id']}{mark}{extra} | {cell(cand['pergunta_literal'])} | "
                         f"[{cell(cand['fonte'])[:45]}]({cand['url']}) · {cell(cand['quem_perguntou'])[:25]} | "
                         f"{cand['adequacao_tematica']} | {cand['linguistica']} | {cand['complexidade']} | "
                         f"{cand['respondibilidade']} | {cand['uso_literal']} | {cand['exige_adaptacao']} | "
                         f"{cell(cand['problemas'])} |")
        lines.append("")
    (QDIR / f"curation-{VERSION}.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"curation-{VERSION}.md escrito")


if __name__ == "__main__":
    if "--agreement" in sys.argv:
        agreement(sys.argv[sys.argv.index("--agreement") + 1])
    else:
        main()
