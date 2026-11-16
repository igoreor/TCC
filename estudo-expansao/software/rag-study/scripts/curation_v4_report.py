"""Writes research/questions/selection-v4.md and reading-pack-v4.md from the v4 files.

The reading pack lists, for each question, the corpus passages of its target sections with
pages, so the author can write the key points (D15: the agent does not write them).

Usage (from C:\\TCC): software/rag-study/.venv/Scripts/python software/rag-study/scripts/curation_v4_report.py
"""
import collections
import csv
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
Q = ROOT / "research" / "questions"
sys.path.insert(0, str(ROOT / "software" / "rag-study" / "src"))
from rag_study.questions import resolve_sections, section_codes  # noqa: E402

PREVIOUS_16 = {"EXT005", "EXT001", "EXT119", "EXT014", "EXT013", "EXT025", "EXT138", "EXT144", "EXT061",
               "EXT095", "EXT136", "EXT069", "EXT145", "EXT015", "EXT073", "EXT125"}
EXCLUDED = [
    ("duplicata", "mantida uma por grupo: tratamento (EXT035, EXT066, EXT082, EXT099; ficaram EXT036 e EXT037), "
                  "transmissão (EXT060, EXT064, EXT086, EXT090; ficou EXT002, dúvida de médico), sintomas (EXT063, EXT080; "
                  "ficou EXT089), diagnóstico (EXT081; ficou EXT094), amamentação (EXT122; ficou EXT095), álcool (EXT098, EXT123)"),
    ("genérica demais", "EXT017, EXT038, EXT067, EXT068, EXT082, EXT084, EXT087, EXT091, EXT096, EXT100, EXT102, EXT107, "
                        "EXT109, EXT110, EXT114, EXT115, EXT116"),
    ("depende da página de origem", "EXT041, EXT065, EXT072, EXT074, EXT113, EXT120"),
    ("sobreposição com outra escolhida", "EXT026, EXT140 (abordagem e conduta nas reações), EXT101 (definição de caso), "
                                          "EXT117 (exames complementares), EXT021 e EXT134 (alta por cura), EXT135 (tuberculose), "
                                          "EXT032 (crianças MB), EXT062 (pós-alta), EXT010, EXT011, EXT003, EXT147 (contatos e BCG), "
                                          "EXT029, EXT055 (talidomida), EXT139 (estados reacionais)"),
    ("resposta incerta na base", "EXT121 (PQT na gravidez: sem frase explícita), EXT016 e EXT028 (critérios de 2026 a conferir)"),
    ("parciais e não respondíveis não usadas", "parciais: EXT006, EXT007, EXT012, EXT043, EXT046, EXT050, EXT054, EXT070, "
                                               "EXT075, EXT083, EXT108, EXT111, EXT118, EXT128 e outras do banco não anotadas; "
                                               "não respondível: EXT078"),
]


def read(path, delimiter):
    with open(path, encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle, delimiter=delimiter))


def main():
    bank = {row["id"]: row for row in read(Q / "external-questions-candidates.csv", ";")}
    sheet = read(Q / "authoring-sheet-v4.csv", ";")
    chunks = [json.loads(line) for line in open(ROOT / "research/corpus/hanseniase-v2/chunks.jsonl", encoding="utf-8")]
    by_id = {chunk["chunk_id"]: chunk for chunk in chunks}

    count = lambda key: collections.Counter(row[key] for row in sheet)
    askers = collections.Counter(bank[row["candidate_external_ids"]]["asker"] for row in sheet)
    pairs = sorted({row["need_group"] for row in sheet if row["need_group"].startswith("P")})
    out = ["# Seleção de perguntas v4: só perguntas publicadas", "",
           "Proposta do agente em 10/11/2026, a pedido do autor (D42). **Precisa da confirmação do autor, pergunta a pergunta, "
           "e da aprovação do orientador**, porque muda o desenho validado (matriz v3, com adaptações e perguntas do autor).", "",
           "Nenhum texto foi redigido ou alterado (D15): as 50 perguntas são cópias literais do banco de 152 perguntas publicadas "
           "(`external-questions-candidates.csv`), com fonte. Os pontos-chave continuam a cargo do autor.", "",
           "## Critérios", "",
           "1. Pergunta publicada, copiada literalmente, com fonte conferida.",
           "2. Fora: duplicatas (fica uma por grupo, de preferência a dúvida de profissional), perguntas genéricas demais "
           "e perguntas que dependem da página de origem (\"Estes\", \"este teste\", \"o medicamento\").",
           "3. Prioridade para as dúvidas enviadas por profissionais ao serviço de Segunda Opinião Formativa (BVS APS).",
           "4. Uma pergunta por necessidade de informação, salvo os pares leigo-técnico que pedem a mesma informação.",
           "5. Mesma distribuição de respondibilidade e de registro da matriz v3: 42 respondíveis, 3 parciais e 5 não "
           "respondíveis; 25 leigas e 25 técnicas; as 10 categorias representadas.",
           "6. Respondibilidade conferida por busca de palavra-chave nos 5 documentos (BM25), nunca pelo recuperador do "
           "experimento; parciais e não respondíveis listadas em `na-check-v4.md` para o autor confirmar lendo os trechos.",
           "7. Similaridade semântica entre as perguntas (BGE-M3): nenhum par acima de 0,90; o maior foi 0,84.", "",
           "## Resultado", "",
           f"- Respondibilidade: {dict(count('answerable_from_corpus'))}",
           f"- Registro: {dict(count('register'))}",
           f"- Complexidade: {dict(count('complexity'))}",
           f"- Categoria: {dict(count('category'))}",
           f"- Quem perguntou: {dict(askers)}",
           f"- Pares leigo-técnico: {len(pairs)} ({', '.join(pairs)}); a matriz v3 tinha 11",
           f"- Das 16 perguntas da seleção anterior (documento enviado ao orientador), {sum(row['candidate_external_ids'] in PREVIOUS_16 for row in sheet)} continuam.", "",
           "| Vaga | Pergunta publicada (literal) | Registro | Categoria | Comp. | Respondível | Seções-alvo | Quem perguntou | Observação |",
           "|---|---|---|---|---|---|---|---|---|"]
    for row in sheet:
        b = bank[row["candidate_external_ids"]]
        pair = f" ({row['need_group']})" if row["need_group"].startswith("P") else ""
        note = row["fit_justification"].split("; ", 1)[-1]
        out.append(f"| {row['slot_id']}{pair} | **{row['candidate_external_ids']}**: {row['text']} | {row['register']} | "
                   f"{row['category']} | {row['complexity'][:4]}. | {row['answerable_from_corpus']} | {row['target_sections'] or '—'} | "
                   f"{b['asker']} | {note} |")
    out += ["", "## Perguntas do banco que ficaram de fora", "", "| Motivo | Perguntas |", "|---|---|"]
    out += [f"| {reason} | {ids} |" for reason, ids in EXCLUDED]
    out += ["", "## O que muda no desenho (para o orientador decidir)", "",
            "- **Pares leigo-técnico:** 4 em vez de 11. A hipótese H5 (ganho maior em perguntas leigas) passa a ser examinada "
            "nos 4 pares e, de forma exploratória, pela comparação entre as 25 leigas e as 25 técnicas.",
            "- **Origem:** todas `real`. A análise por origem (publicada × do autor) deixa de existir; no lugar, pode-se comparar "
            "dúvidas de profissionais (Segunda Opinião Formativa) com perguntas institucionais.",
            "- **Viés de seleção:** a escolha foi feita pelo agente, que pertence a uma família avaliada, só por critérios da vaga "
            "e nunca pelo desempenho esperado. Todas ficam com `selected_by=agente_confirmado`, e o viés residual é declarado.",
            "- **Validade:** ganha naturalidade (todas são perguntas reais publicadas) e elimina o risco de o autor, que conhece o "
            "PCDT, redigir perguntas próximas do texto. Perde equilíbrio fino da matriz, que agora segue o banco disponível.",
            "- **Documentos a atualizar depois da aprovação:** protocolo (seção 6), capítulo 3.7 e Quadro 8 do manuscrito (4).", "",
            "## Próximos passos do autor", "",
            "1. Ler a tabela e recusar o que não fizer sentido (eu troco pela próxima candidata do mesmo grupo).",
            "2. Na planilha `authoring-sheet-v4.csv`, preencher `author` em cada linha para confirmar a pergunta.",
            "3. Escrever os pontos-chave (1 a 6 por pergunta, com página), usando `reading-pack-v4.md`. Nos pares, os dois itens "
            "precisam ter os mesmos pontos-chave; se não fizer sentido, o par vira duas perguntas independentes.",
            "4. Marcar as conclusões em `na-check-v4.md` (parciais e não respondíveis).",
            "5. Revisão independente e congelamento (`questions-build`, `questions-check --corpus`, `freeze-log.md`)."]
    (Q / "selection-v4.md").write_text("\n".join(out) + "\n", encoding="utf-8")

    pack = ["# Pacote de leitura v4", "",
            "Trechos dos 5 documentos nas seções-alvo de cada pergunta, para o autor escrever os pontos-chave com a página. "
            "Gerado automaticamente; os trechos são cópias do corpus congelado `hanseniase-v2`. Tabelas aparecem linearizadas: "
            "conferir doses e esquemas no PDF.", ""]
    for row in sheet:
        pack += [f"## {row['slot_id']} · {row['candidate_external_ids']} · {row['answerable_from_corpus']}", "",
                 f"> {row['text']}", "", f"Seções-alvo: {row['target_sections'] or '— (não respondível)'}", ""]
        codes = section_codes(row["target_sections"])
        if not codes:
            pack += ["Nenhum trecho: a informação não está nos 5 documentos. Ponto-chave do tipo `INSUFICIENTE: ...`.", ""]
            continue
        for chunk_id in resolve_sections(chunks, codes)["chunk_ids"]:
            chunk = by_id[chunk_id]
            pages = f"p. {chunk['page_start']}" + (f"–{chunk['page_end']}" if chunk["page_end"] != chunk["page_start"] else "")
            pack += [f"**{' > '.join(chunk['section_path'])}** ({chunk['document_id']}, {pages})", "", chunk["text"], ""]
    (Q / "reading-pack-v4.md").write_text("\n".join(pack) + "\n", encoding="utf-8")
    print("escritos: selection-v4.md, reading-pack-v4.md")


if __name__ == "__main__":
    main()
