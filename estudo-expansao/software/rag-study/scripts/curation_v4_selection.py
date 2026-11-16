"""Curation v4 (10/11/2026): instrument made only of published questions, copied literally.

The author chose to drop adaptations and author-written questions and to use only
published questions (decision D42, pending the advisor). This script records the
agent's selection and writes:

- research/questions/blueprint-v4.csv     matrix rebuilt around the selected questions
- research/questions/authoring-sheet-v4.csv  sheet with text, origin and source filled;
  the author confirms each row (author) and writes the key points (D15)
- research/questions/na-check-queries-v4.csv  queries for the partial and unanswerable ones

Question text is never edited (D15). Annotations of candidates absent from curation v3
(EXT002, EXT008, EXT020, EXT024, EXT030, EXT031, EXT093, EXT141, EXT146) were made by the
agent from keyword (BM25) searches of the frozen corpus, never with the experiment's
retriever; they are proposals for the author to confirm.

Usage (from C:\\TCC): software/rag-study/.venv/Scripts/python software/rag-study/scripts/curation_v4_selection.py
"""
import csv
import importlib.util
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
Q = ROOT / "research" / "questions"

# Section codes of the PCDT carry the PCDT: alias so that numbered headings of the WHO
# document (6.1, 7.2...) are not pulled into the target sections.
# Selection order: category blocks as in the v3 matrix; inside each, answerable, partial,
# unanswerable; pairs adjacent (lay, then technical).
# (external_id, answerable, target_sections, complexity, pair, note)
SELECTION = [
    ("EXT005", "sim", "PCDT:6.1", "simples", "", "sinais de suspeição da mancha"),
    ("EXT089", "sim", "PCDT:6.1", "simples", "", "sinais e sintomas"),
    ("EXT094", "sim", "PCDT:6.1;PCDT:6.2;PCDT:7.7;P51:", "simples", "", "diagnóstico; indicações do qPCR ampliadas pela Portaria 51/2026, a resposta correta segue a norma mais recente"),
    ("EXT112", "sim", "PCDT:6.2;PCDT:7.1", "simples", "P01", "teste de sensibilidade, registro leigo"),
    ("EXT033", "sim", "PCDT:6.2;PCDT:7.1", "simples", "P01", "teste de sensibilidade, registro técnico"),
    ("EXT009", "sim", "PCDT:7.2", "simples", "", "técnica e sítios da baciloscopia"),
    ("EXT001", "sim", "PCDT:10.1.1", "simples", "", "prazo para completar a PQT-U MB (p. 60)"),
    ("EXT036", "sim", "PCDT:10.1.1", "simples", "", "por que três medicamentos"),
    ("EXT037", "sim", "PCDT:10.1.1", "simples", "", "duração do tratamento: 6 doses PB, 12 doses MB"),
    ("EXT119", "sim", "PCDT:10.1.6", "simples", "", "efeitos colaterais da PQT"),
    ("EXT014", "sim", "PCDT:10.1.6;PCDT:10.1.7;P47:", "composta", "", "conduta em evento adverso; segunda linha ampliada pela Portaria 47/2026, a resposta correta segue a norma mais recente"),
    ("EXT124", "não", "", "simples", "", "restrição alimentar durante a PQT-U: ausente dos 5 documentos (há só a absorção da minociclina com leite, em 10.1.5.4)"),
    ("EXT125", "não", "", "simples", "", "jejum na dose supervisionada: ausente dos 5 documentos (na-check-v2 e v3)"),
    ("EXT126", "não", "", "simples", "", "melhor horário para a dose autoadministrada: ausente dos 5 documentos"),
    ("EXT127", "não", "", "simples", "", "dobrar a dose esquecida: ausente dos 5 documentos (na-check-v3)"),
    ("EXT129", "não", "", "simples", "", "guardar o medicamento na geladeira: ausente dos 5 documentos"),
    ("EXT025", "sim", "PCDT:10.1.2.2;PCDT:10.1.5.8", "composta", "", "talidomida na reação tipo 2"),
    ("EXT027", "sim", "PCDT:10.1.2.2", "composta", "", "ENH recorrente após a PQT completa"),
    ("EXT138", "sim", "PCDT:6.5.1;PCDT:10.1.2.1", "simples", "", "vinheta: lesão avermelhada e inchada durante a PQT"),
    ("EXT141", "sim", "PCDT:10.1.2;PCDT:14.1.2", "simples", "", "reação após a alta: tratar a reação sem reiniciar a PQT"),
    ("EXT142", "sim", "PCDT:6.5.1;PCDT:6.5.2", "composta", "", "sinais das reações tipo 1 e tipo 2"),
    ("EXT143", "sim", "PCDT:10.1.2", "simples", "P02", "medicamentos para as reações, registro leigo"),
    ("EXT040", "sim", "PCDT:10.1.2", "composta", "P02", "tratamento das reações tipo 1 e tipo 2, registro técnico"),
    ("EXT023", "sim", "PCDT:6.6.1;PCDT:6.4.5", "simples", "", "nervos mais acometidos"),
    ("EXT061", "sim", "PCDT:7.1;PCDT:10.2.2;PCDT:6.6.2.2", "composta", "", "finalidade da avaliação neurológica simplificada"),
    ("EXT144", "sim", "PCDT:6.6.2.1;PCDT:10.1.2.1", "simples", "", "vinheta: neurite (dor no braço e fraqueza nas mãos)"),
    ("EXT018", "parcial", "PCDT:10.2.4", "simples", "", "a base trata úlceras neuropáticas, não escaras de decúbito; a resposta ideal declara a diferença"),
    ("EXT004", "sim", "PCDT:12.2;PCDT:6.1", "simples", "", "suspeição em crianças"),
    ("EXT013", "sim", "PCDT:10.1.1;PCDT:12.2", "composta", "", "doses da PQT-U para crianças com menos de 30 kg (p. 59-60)"),
    ("EXT095", "sim", "PCDT:12.1.2;PCDT:10.1.5.2", "composta", "", "amamentação durante a PQT e pigmentação pela clofazimina"),
    ("EXT136", "sim", "PCDT:12.3", "simples", "", "PQT em pessoas com HIV"),
    ("EXT039", "sim", "PCDT:14.1.1", "simples", "", "acompanhamento durante a PQT-U"),
    ("EXT069", "sim", "PCDT:14.1.2", "composta", "", "pós-alta: reações não significam volta da doença"),
    ("EXT137", "sim", "PCDT:14.1.2", "composta", "", "recidiva e diferença em relação à reação"),
    ("EXT031", "parcial", "PCDT:10.1.1", "simples", "", "a base fixa o intervalo máximo para as doses (9 e 18 meses), mas não o que fazer com a cartela da dose perdida"),
    ("EXT145", "sim", "PCDT:13", "simples", "P03", "conduta com a família do paciente, registro leigo"),
    ("EXT015", "sim", "PCDT:13", "simples", "P03", "conduta com contatos domiciliares, registro técnico"),
    ("EXT146", "sim", "PCDT:13.1.1", "simples", "P04", "BCG e hanseníase, registro leigo"),
    ("EXT020", "sim", "PCDT:13.1.1", "simples", "P04", "BCG na prevenção, registro técnico; a base recomenda a BCG aos contatos, sem discutir eficácia"),
    ("EXT024", "sim", "PCDT:13;PCDT:12.2", "composta", "", "filhos de pacientes como contatos: exame e BCG"),
    ("EXT019", "sim", "OMS:7.2.6;PCDT:13.1.1", "simples", "", "profilaxia pós-exposição: só na OMS; o PCDT 2022 não a adota. A resposta correta distingue orientação internacional de norma nacional"),
    ("EXT008", "parcial", "PCDT:6.5.3", "simples", "", "a base recomenda avaliação odontológica (6.5.3), mas não trata dos cuidados da equipe no atendimento"),
    ("EXT073", "sim", "PCDT:10.2.1.1", "simples", "", "por que o estigma e a discriminação acontecem"),
    ("EXT002", "sim", "PCDT:1", "simples", "", "transmissão (p. 17)"),
    ("EXT092", "sim", "PCDT:1", "simples", "", "incubação longa (p. 17)"),
    ("EXT093", "sim", "PCDT:5", "simples", "", "cerca de 90% dos infectados não adoecem (p. 25)"),
    ("EXT151", "sim", "OMS:4.1.2;EST:No Brasil", "simples", "", "significado de eliminação como problema de saúde pública"),
    ("EXT150", "sim", "EST:METAS;EST:DEFINIÇÃO DAS AÇÕES ESTRATÉGICAS", "composta", "", "política nacional: Estratégia 2024-2030"),
    ("EXT152", "sim", "EST:AÇÕES ESTRATÉGICAS POR GRUPOS DE MUNICÍPIOS", "simples", "", "ações dos municípios para a eliminação"),
    ("EXT030", "sim", "PCDT:10.2.1.6.1;EST:AÇÕES ESTRATÉGICAS GERAIS", "simples", "", "papel do ACS: busca ativa e acolhimento (PCDT) e capacitação (Estratégia)"),
]

# BM25 terms for the partial and unanswerable ones (English for the WHO document)
TERMS_EN = {
    "EXT008": "dental care oral health protective equipment",
    "EXT018": "pressure ulcer bedsore wound care",
    "EXT031": "missed supervised dose blister pack restart",
    "EXT124": "diet food restriction treatment",
    "EXT125": "fasting supervised dose",
    "EXT126": "best time take medicine",
    "EXT127": "missed dose double dose",
    "EXT129": "store medicine refrigerator",
}


def read_semicolon(path):
    with open(path, encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle, delimiter=";"))


def main():
    bank = {row["id"]: row for row in read_semicolon(Q / "external-questions-candidates.csv")}
    ids = [row[0] for row in SELECTION]
    assert len(ids) == len(set(ids)) == 50

    blueprint = Q / "blueprint-v4.csv"
    sheet = Q / "authoring-sheet-v4.csv"
    queries = Q / "na-check-queries-v4.csv"
    for path in (blueprint, sheet, queries):
        if path.exists():
            raise SystemExit(f"{path} já existe; não sobrescrevo (gerar v5)")

    rows = []
    for n, (eid, answerable, sections, complexity, pair, note) in enumerate(SELECTION, start=1):
        slot = f"T{n:02d}"
        b = bank[eid]
        design = f"Pergunta publicada {eid}, literal. {note[0].upper()}{note[1:]}."
        if pair:
            design = f"Par {pair}. " + design
        rows.append({
            "slot_id": slot, "split": "test", "need_group": pair or slot, "category": b["category"],
            "register": b["register"], "complexity": complexity, "answerable_from_corpus": answerable,
            "target_sections": sections, "design_note": design,
        })
    with open(blueprint, "w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

    tmp = Q / "_authoring-sheet-v4-tmp.csv"
    subprocess.run([sys.executable, "-m", "rag_study.cli", "questions-sheet", "--blueprint", str(blueprint),
                    "--corpus", str(ROOT / "research" / "corpus" / "hanseniase-v2"), "--out", str(tmp)],
                   check=True, cwd=ROOT / "software" / "rag-study" / "src")
    filled = read_semicolon(tmp)
    tmp.unlink()
    for row, (eid, answerable, sections, complexity, pair, note) in zip(filled, SELECTION):
        b = bank[eid]
        row.update({
            "candidate_external_ids": eid, "text": b["question_verbatim"], "origin": "real",
            "source_name": b["source"], "source_url": b["url"], "original_text": b["question_verbatim"],
            "selected_by": "agente_confirmado",
            "fit_justification": f"{b['asker']}; {note}",
        })
    with open(sheet, "w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(filled[0]), delimiter=";")
        writer.writeheader()
        writer.writerows(filled)

    with open(queries, "w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["id", "slot_id", "text", "terms_en"])
        writer.writeheader()
        for row, (eid, answerable, *_rest) in zip(rows, SELECTION):
            if answerable != "sim":
                writer.writerow({"id": eid, "slot_id": row["slot_id"], "text": bank[eid]["question_verbatim"],
                                 "terms_en": TERMS_EN[eid]})
    print(f"escritos: {blueprint.name}, {sheet.name}, {queries.name}")


if __name__ == "__main__":
    main()
