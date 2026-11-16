"""Concordância entre os dois julgadores nas perguntas de calibração (emenda 2, D46).

Uso: python judge_agreement.py <pasta com calib-a-claude.csv, calib-a-gpt.csv, calib-b-claude.csv, calib-b-gpt.csv> <saida.json>

Compara, resposta a resposta (mesmo review_id), as notas dos dois julgadores:
pontos-chave (2/1/0/X, kappa quadrático com X tratado como 0 e kappa simples),
correção (1-4, quadrático), falha crítica (simples), insuficiência (simples),
cobertura de pontos-chave (correlação de Spearman e diferença média) e, na
passagem B, fidelidade e suporte das citações (0-2, quadrático).
"""
import json
import sys
from pathlib import Path

from scipy.stats import spearmanr

from rag_study.analysis import cohen_kappa
from rag_study.questions import MAX_KEY_POINTS, read_table
from rag_study.review import key_point_coverage


def pair_rows(folder: Path, review_pass: str):
    first = {r["review_id"]: r for r in read_table(folder / f"calib-{review_pass}-claude.csv")}
    second = {r["review_id"]: r for r in read_table(folder / f"calib-{review_pass}-gpt.csv")}
    shared = sorted(set(first) & set(second))
    return [(first[k], second[k]) for k in shared]


def summary(a, b, categories, weights=None):
    return {"n": len(a), "percent_agreement": sum(x == y for x, y in zip(a, b)) / len(a) if a else None,
            "kappa": cohen_kappa(a, b, categories, weights) if a else None, "weights": weights}


def main(folder: str, out: str) -> None:
    folder = Path(folder)
    result = {}
    rows = pair_rows(folder, "a")
    kp_a, kp_b = [], []
    for first, second in rows:
        for n in range(1, MAX_KEY_POINTS + 1):
            x, y = first.get(f"kp{n}", "").strip().upper(), second.get(f"kp{n}", "").strip().upper()
            if x and y:
                kp_a.append(x)
                kp_b.append(y)
    result["key_points_simple"] = summary(kp_a, kp_b, ["X", "0", "1", "2"])
    result["key_points_quadratic_x_as_0"] = summary([x.replace("X", "0") for x in kp_a],
                                                    [y.replace("X", "0") for y in kp_b], ["0", "1", "2"], "quadratic")
    result["correctness"] = summary([r[0]["correctness"] for r in rows], [r[1]["correctness"] for r in rows],
                                    ["1", "2", "3", "4"], "quadratic")
    result["critical_failure"] = summary([r[0]["critical_failure"] for r in rows],
                                         [r[1]["critical_failure"] for r in rows], ["0", "1"])
    result["insufficiency"] = summary([r[0]["insufficiency"] for r in rows], [r[1]["insufficiency"] for r in rows],
                                      ["adequada", "ausente", "indevida", "na"])
    cov_a = [key_point_coverage([r[0].get(f"kp{n}", "") for n in range(1, MAX_KEY_POINTS + 1)])[0] for r in rows]
    cov_b = [key_point_coverage([r[1].get(f"kp{n}", "") for n in range(1, MAX_KEY_POINTS + 1)])[0] for r in rows]
    pairs = [(x, y) for x, y in zip(cov_a, cov_b) if x is not None and y is not None]
    rho = spearmanr([p[0] for p in pairs], [p[1] for p in pairs]).statistic if len(pairs) > 2 else None
    result["kp_coverage"] = {"n": len(pairs), "spearman": rho,
                             "mean_claude": sum(p[0] for p in pairs) / len(pairs),
                             "mean_gpt": sum(p[1] for p in pairs) / len(pairs)}
    rows_b = pair_rows(folder, "b")
    for column in ("faithfulness", "citation_support"):
        result[column] = summary([r[0][column] for r in rows_b], [r[1][column] for r in rows_b], ["0", "1", "2"],
                                 "quadratic")
    Path(out).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main(*sys.argv[1:3])
