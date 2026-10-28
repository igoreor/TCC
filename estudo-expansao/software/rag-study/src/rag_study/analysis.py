"""Pre-specified paired analysis (protocol v0.3, section 8).

Unit of analysis: the question. Repetitions are averaged within
question x arm x condition before any comparison (no pseudoreplication).
Comparisons are always within arm (same generator/expander).

- Continuous or proportion outcomes: mean paired difference, 95% CI by
  bootstrap over need groups (planned register pairs resampled together),
  two-sided sign-flip permutation test.
- Ordinal outcomes: Wilcoxon signed-rank test (scipy) plus the same CI.
- Binary outcomes: exact McNemar test on discordant pairs.
- Multiplicity: Holm within each pre-declared family.
"""

from __future__ import annotations

import itertools
import math
import random
from collections import defaultdict
from collections.abc import Iterable, Mapping, Sequence
from statistics import mean
from typing import Any

EXACT_PERMUTATION_LIMIT = 16


def arm_from_condition(condition: str) -> str:
    """``R1-RETRIEVAL-OPENAI`` -> ``openai``; ``R0-RETRIEVAL-NONE`` -> ``none``."""
    return condition.rsplit("-", 1)[-1].lower() if "-" in condition else "none"


def base_condition(condition: str) -> str:
    return condition.split("-", 1)[0]


def unit_means(rows: Iterable[Mapping[str, Any]], metric: str) -> dict[tuple[str, str, str], float]:
    """Mean of ``metric`` per (question, arm, condition), skipping missing values."""
    values: dict[tuple[str, str, str], list[float]] = defaultdict(list)
    for row in rows:
        value = row.get(metric)
        if value is None or value == "":
            continue
        condition = row.get("condition_base") or base_condition(str(row["condition"]))
        arm = row.get("arm") or arm_from_condition(str(row["condition"]))
        values[(str(row["question_id"]), str(arm).lower(), condition)].append(float(value))
    return {key: mean(items) for key, items in values.items()}


def paired_values(means: Mapping[tuple[str, str, str], float], arm: str, a: str, b: str) -> list[tuple[str, float, float]]:
    """Questions with both conditions in ``arm``. A condition that does not
    depend on the arm (R0 in retrieval-only runs, logged as arm ``none``)
    is shared by every arm."""
    def lookup(question: str, condition: str) -> float | None:
        return means.get((question, arm, condition), means.get((question, "none", condition)))

    questions = sorted({key[0] for key in means})
    pairs = []
    for question in questions:
        va, vb = lookup(question, a), lookup(question, b)
        if va is not None and vb is not None:
            pairs.append((question, va, vb))
    return pairs


def bootstrap_ci(diffs: Sequence[float], clusters: Sequence[str], n_boot: int, seed: int,
                 alpha: float = 0.05) -> tuple[float, float]:
    """Percentile CI of the mean difference, resampling clusters with replacement."""
    by_cluster: dict[str, list[float]] = defaultdict(list)
    for diff, cluster in zip(diffs, clusters):
        by_cluster[cluster].append(diff)
    groups = list(by_cluster.values())
    rng = random.Random(seed)
    stats = []
    for _ in range(n_boot):
        sample = [value for _ in groups for value in rng.choice(groups)]
        stats.append(sum(sample) / len(sample))
    stats.sort()
    low = stats[max(0, math.floor((alpha / 2) * n_boot))]
    high = stats[min(n_boot - 1, math.ceil((1 - alpha / 2) * n_boot) - 1)]
    return low, high


def sign_flip_pvalue(diffs: Sequence[float], n_perm: int, seed: int) -> float:
    """Two-sided paired permutation test of the mean difference. Exact when
    there are at most 16 non-zero differences; otherwise Monte Carlo with
    the (b+1)/(m+1) correction."""
    nonzero = [d for d in diffs if d != 0]
    if not nonzero:
        return 1.0
    observed = abs(sum(diffs))
    tolerance = 1e-12
    if len(nonzero) <= EXACT_PERMUTATION_LIMIT:
        extreme = total = 0
        for signs in itertools.product((1, -1), repeat=len(nonzero)):
            total += 1
            if abs(sum(s * d for s, d in zip(signs, nonzero))) >= observed - tolerance:
                extreme += 1
        return extreme / total
    rng = random.Random(seed)
    extreme = 0
    for _ in range(n_perm):
        if abs(sum(d if rng.random() < 0.5 else -d for d in nonzero)) >= observed - tolerance:
            extreme += 1
    return (extreme + 1) / (n_perm + 1)


def mcnemar_exact(b: int, c: int) -> float:
    """Two-sided exact McNemar test: binomial test on the discordant pairs."""
    n = b + c
    if n == 0:
        return 1.0
    tail = sum(math.comb(n, i) for i in range(min(b, c) + 1)) / 2**n
    return min(1.0, 2 * tail)


def wilcoxon_pvalue(diffs: Sequence[float]) -> float:
    from scipy.stats import wilcoxon

    if all(d == 0 for d in diffs):
        return 1.0
    return float(wilcoxon(diffs, zero_method="wilcox", alternative="two-sided").pvalue)


def holm(pvalues: Sequence[float]) -> list[float]:
    """Holm step-down adjusted p-values, in the input order."""
    order = sorted(range(len(pvalues)), key=lambda i: pvalues[i])
    adjusted = [0.0] * len(pvalues)
    running = 0.0
    for rank, index in enumerate(order):
        running = max(running, min(1.0, (len(pvalues) - rank) * pvalues[index]))
        adjusted[index] = running
    return adjusted


def compare(means: Mapping[tuple[str, str, str], float], arm: str, a: str, b: str, test: str,
            clusters: Mapping[str, str] | None = None, n_boot: int = 10000, n_perm: int = 20000,
            seed: int = 20261022) -> dict[str, Any]:
    """Paired comparison ``b - a`` within ``arm``."""
    pairs = paired_values(means, arm, a, b)
    if not pairs:
        raise ValueError(f"nenhuma pergunta com {a} e {b} no braço {arm}")
    diffs = [vb - va for _, va, vb in pairs]
    cluster_ids = [(clusters or {}).get(question, question) for question, _, _ in pairs]
    if test == "permutation":
        p_value = sign_flip_pvalue(diffs, n_perm, seed)
    elif test == "wilcoxon":
        p_value = wilcoxon_pvalue(diffs)
    elif test == "mcnemar":
        if any(v not in (0.0, 1.0) for _, va, vb in pairs for v in (va, vb)):
            raise ValueError("McNemar exige desfecho binário por pergunta (use uma repetição ou dicotomize antes)")
        p_value = mcnemar_exact(sum(1 for _, va, vb in pairs if va == 1 and vb == 0),
                                sum(1 for _, va, vb in pairs if va == 0 and vb == 1))
    else:
        raise ValueError(f"teste desconhecido: {test}")
    low, high = bootstrap_ci(diffs, cluster_ids, n_boot, seed)
    return {
        "arm": arm, "a": a, "b": b, "test": test, "n": len(pairs), "n_clusters": len(set(cluster_ids)),
        "mean_a": mean(va for _, va, _ in pairs), "mean_b": mean(vb for _, _, vb in pairs),
        "mean_diff": mean(diffs), "ci95_low": low, "ci95_high": high, "p_value": p_value,
        "wins_b": sum(1 for d in diffs if d > 0), "ties": sum(1 for d in diffs if d == 0),
        "losses_b": sum(1 for d in diffs if d < 0),
    }


def compare_family(rows: Iterable[Mapping[str, Any]], metric: str, comparisons: Sequence[tuple[str, str]],
                   arms: Sequence[str], test: str, family: str, clusters: Mapping[str, str] | None = None,
                   n_boot: int = 10000, n_perm: int = 20000, seed: int = 20261022) -> list[dict[str, Any]]:
    """Run every (arm, comparison) of one pre-declared family and Holm-adjust inside it."""
    means = unit_means(rows, metric)
    results = [
        {"family": family, "metric": metric, **compare(means, arm, a, b, test, clusters, n_boot, n_perm, seed)}
        for arm in arms for a, b in comparisons
    ]
    for result, adjusted in zip(results, holm([r["p_value"] for r in results])):
        result["p_holm"] = adjusted
    return results


def cohen_kappa(first: Sequence[Any], second: Sequence[Any], categories: Sequence[Any] | None = None,
                weights: str | None = None) -> float:
    """Cohen's kappa; ``weights`` = None, "linear" or "quadratic" for ordinal scales."""
    if len(first) != len(second) or not first:
        raise ValueError("as duas listas devem ter o mesmo tamanho e não podem ser vazias")
    labels = list(categories) if categories is not None else sorted(set(first) | set(second))
    index = {label: i for i, label in enumerate(labels)}
    k, n = len(labels), len(first)
    observed = [[0.0] * k for _ in range(k)]
    for x, y in zip(first, second):
        observed[index[x]][index[y]] += 1 / n
    row = [sum(observed[i]) for i in range(k)]
    col = [sum(observed[i][j] for i in range(k)) for j in range(k)]

    def weight(i: int, j: int) -> float:
        if weights is None:
            return 0.0 if i == j else 1.0
        distance = abs(i - j) / (k - 1) if k > 1 else 0.0
        return distance if weights == "linear" else distance**2

    disagreement_observed = sum(weight(i, j) * observed[i][j] for i in range(k) for j in range(k))
    disagreement_expected = sum(weight(i, j) * row[i] * col[j] for i in range(k) for j in range(k))
    return 1.0 if disagreement_expected == 0 else 1 - disagreement_observed / disagreement_expected


def select_strategy(rows: Iterable[Mapping[str, Any]], strategies: Sequence[str] = ("R1", "R2", "R3"),
                    primary: str = "recall_at_k", tiebreak: str = "rr_at_k", margin: float = 0.01) -> dict[str, Any]:
    """Stage-1 rule (pre-specified): pick the strategy with the highest mean
    of ``primary`` over dev questions, averaging repetitions within question and
    then the two arms. Strategies within ``margin`` of the best are tied and
    the tie is broken by ``tiebreak``; a remaining tie keeps the order R1 < R2 < R3
    (simplest transformation first)."""
    rows = list(rows)
    summary = []
    present = {base_condition(str(row.get("condition_base") or row["condition"])) for row in rows}
    reference = ["R0"] if "R0" in present else []
    for strategy in [*strategies, *reference]:
        entry = {"strategy": strategy}
        for metric in (primary, tiebreak):
            means = unit_means(rows, metric)
            per_arm: dict[str, list[float]] = defaultdict(list)
            for (_, arm, condition), value in means.items():
                if condition == strategy:
                    per_arm[arm].append(value)
            if not per_arm:
                raise ValueError(f"sem registros para {strategy}")
            entry[metric] = mean(mean(values) for values in per_arm.values())
            entry[f"{metric}_by_arm"] = {arm: mean(values) for arm, values in sorted(per_arm.items())}
        summary.append(entry)
    candidates = [entry for entry in summary if entry["strategy"] in strategies]
    best = max(entry[primary] for entry in candidates)
    tied = [entry for entry in candidates if best - entry[primary] <= margin]
    chosen = max(tied, key=lambda entry: (entry[tiebreak], -strategies.index(entry["strategy"])))
    return {"chosen": chosen["strategy"], "rule": {"primary": primary, "tiebreak": tiebreak, "margin": margin},
            "tied": [entry["strategy"] for entry in tied], "summary": summary}
