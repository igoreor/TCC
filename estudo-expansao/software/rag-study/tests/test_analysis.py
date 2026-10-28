import pytest

from rag_study.analysis import (
    arm_from_condition,
    bootstrap_ci,
    cohen_kappa,
    compare,
    compare_family,
    holm,
    mcnemar_exact,
    select_strategy,
    sign_flip_pvalue,
    unit_means,
)


def test_condition_parsing():
    assert arm_from_condition("R1-RETRIEVAL-OPENAI") == "openai"
    assert arm_from_condition("R0-RETRIEVAL-NONE") == "none"
    assert arm_from_condition("D-ANTHROPIC") == "anthropic"


def test_holm_matches_hand_computation():
    assert holm([0.01, 0.04, 0.03]) == pytest.approx([0.03, 0.06, 0.06])


def test_mcnemar_exact():
    assert mcnemar_exact(0, 5) == pytest.approx(2 / 32)
    assert mcnemar_exact(3, 3) == 1.0
    assert mcnemar_exact(0, 0) == 1.0


def test_sign_flip_exact_and_null():
    assert sign_flip_pvalue([1, 1, 1, 1, 1], 1000, 1) == pytest.approx(2 / 32)
    assert sign_flip_pvalue([0, 0, 0], 1000, 1) == 1.0
    many = [0.1] * 30
    assert sign_flip_pvalue(many, 2000, 1) < 0.001  # Monte Carlo branch


def test_bootstrap_of_constant_difference_is_degenerate():
    assert bootstrap_ci([0.2] * 10, [str(i) for i in range(10)], 500, 1) == pytest.approx((0.2, 0.2))


def test_repetitions_are_averaged_and_shared_r0_is_reused():
    rows = [
        {"question_id": "q1", "condition": "R0-RETRIEVAL-NONE", "recall_at_k": "0.5"},
        {"question_id": "q1", "condition": "R1-RETRIEVAL-OPENAI", "recall_at_k": "1.0", "repetition": 0},
        {"question_id": "q1", "condition": "R1-RETRIEVAL-OPENAI", "recall_at_k": "0.0", "repetition": 1},
        {"question_id": "q2", "condition": "R0-RETRIEVAL-NONE", "recall_at_k": "0.0"},
        {"question_id": "q2", "condition": "R1-RETRIEVAL-OPENAI", "recall_at_k": "1.0"},
    ]
    means = unit_means(rows, "recall_at_k")
    assert means[("q1", "openai", "R1")] == 0.5
    result = compare(means, "openai", "R0", "R1", "permutation", n_boot=200)
    assert result["n"] == 2 and result["mean_diff"] == pytest.approx(0.5)
    assert result["wins_b"] == 1 and result["ties"] == 1


def test_family_is_holm_adjusted():
    rows = []
    for q in range(8):
        rows.append({"question_id": f"q{q}", "arm": "openai", "condition_base": "D", "critical": 1})
        rows.append({"question_id": f"q{q}", "arm": "openai", "condition_base": "R0", "critical": 0})
        rows.append({"question_id": f"q{q}", "arm": "anthropic", "condition_base": "D", "critical": q % 2})
        rows.append({"question_id": f"q{q}", "arm": "anthropic", "condition_base": "R0", "critical": q % 2})
    results = compare_family(rows, "critical", [("D", "R0")], ["openai", "anthropic"], "mcnemar", "P2", n_boot=100)
    by_arm = {r["arm"]: r for r in results}
    assert by_arm["openai"]["p_value"] == pytest.approx(2 / 256)
    assert by_arm["openai"]["p_holm"] == pytest.approx(4 / 256)
    assert by_arm["anthropic"]["p_value"] == 1.0


def test_mcnemar_rejects_averaged_repetitions():
    means = {("q1", "openai", "D"): 0.5, ("q1", "openai", "R0"): 1.0}
    with pytest.raises(ValueError):
        compare(means, "openai", "D", "R0", "mcnemar", n_boot=10)


def test_cohen_kappa():
    assert cohen_kappa([0, 0, 1, 1], [0, 1, 1, 1]) == pytest.approx(0.5)
    assert cohen_kappa([0, 1, 2], [0, 1, 2], weights="quadratic") == 1.0
    linear = cohen_kappa([0, 1, 2, 2], [0, 2, 2, 1], categories=[0, 1, 2], weights="linear")
    unweighted = cohen_kappa([0, 1, 2, 2], [0, 2, 2, 1], categories=[0, 1, 2])
    assert linear > unweighted


def test_select_strategy_rule():
    rows = []
    for q in ("q1", "q2"):
        rows.append({"question_id": q, "condition": "R0-RETRIEVAL-NONE", "recall_at_k": 0.4, "rr_at_k": 0.5})
        for arm in ("OPENAI", "ANTHROPIC"):
            rows.append({"question_id": q, "condition": f"R1-RETRIEVAL-{arm}", "recall_at_k": 0.60, "rr_at_k": 0.5})
            rows.append({"question_id": q, "condition": f"R2-RETRIEVAL-{arm}", "recall_at_k": 0.605, "rr_at_k": 0.9})
            rows.append({"question_id": q, "condition": f"R3-RETRIEVAL-{arm}", "recall_at_k": 0.3, "rr_at_k": 1.0})
    result = select_strategy(rows)
    assert result["tied"] == ["R1", "R2"] and result["chosen"] == "R2"
    assert [entry["strategy"] for entry in result["summary"]] == ["R1", "R2", "R3", "R0"]
    assert select_strategy(rows, margin=0.0)["chosen"] == "R2"
