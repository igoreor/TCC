import pytest

from rag_study.metrics import mrr, ndcg_at_k, precision_at_k, recall_at_k, reciprocal_rank


QRELS = {"d1": 2, "d2": 1, "d3": 0}
RANKING = ["d3", "d1", "d4", "d2"]


def test_precision_at_k():
    assert precision_at_k(RANKING, QRELS, 2) == pytest.approx(0.5)


def test_recall_at_k():
    assert recall_at_k(RANKING, QRELS, 2) == pytest.approx(0.5)


def test_reciprocal_rank():
    assert reciprocal_rank(RANKING, QRELS) == pytest.approx(0.5)


def test_mrr():
    assert mrr([RANKING, ["d2"]], [QRELS, QRELS]) == pytest.approx(0.75)


def test_ndcg_is_bounded():
    assert 0.0 <= ndcg_at_k(RANKING, QRELS, 4) <= 1.0
