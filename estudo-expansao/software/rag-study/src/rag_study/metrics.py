from __future__ import annotations

import math
from collections.abc import Mapping, Sequence


def precision_at_k(ranked_ids: Sequence[str], relevance: Mapping[str, int], k: int) -> float:
    if k <= 0:
        raise ValueError("k must be positive")
    retrieved = list(ranked_ids[:k])
    return sum(1 for doc_id in retrieved if relevance.get(doc_id, 0) > 0) / k


def recall_at_k(ranked_ids: Sequence[str], relevance: Mapping[str, int], k: int) -> float:
    if k <= 0:
        raise ValueError("k must be positive")
    relevant = {doc_id for doc_id, grade in relevance.items() if grade > 0}
    if not relevant:
        return 0.0
    retrieved_relevant = relevant.intersection(ranked_ids[:k])
    return len(retrieved_relevant) / len(relevant)


def reciprocal_rank(ranked_ids: Sequence[str], relevance: Mapping[str, int]) -> float:
    for rank, doc_id in enumerate(ranked_ids, start=1):
        if relevance.get(doc_id, 0) > 0:
            return 1.0 / rank
    return 0.0


def reciprocal_rank_at_k(ranked_ids: Sequence[str], relevance: Mapping[str, int], k: int) -> float:
    if k <= 0:
        raise ValueError("k must be positive")
    return reciprocal_rank(ranked_ids[:k], relevance)


def hit_at_k(ranked_ids: Sequence[str], relevance: Mapping[str, int], k: int) -> float:
    return 1.0 if reciprocal_rank_at_k(ranked_ids, relevance, k) > 0 else 0.0


def judged_fraction_at_k(ranked_ids: Sequence[str], relevance: Mapping[str, int], k: int) -> float:
    """Share of the top-k that has a relevance label. Below 1.0, unjudged items
    are counted as irrelevant and the metrics are a lower bound."""
    if k <= 0:
        raise ValueError("k must be positive")
    retrieved = list(ranked_ids[:k])
    if not retrieved:
        return 0.0
    return sum(1 for doc_id in retrieved if doc_id in relevance) / len(retrieved)


def mrr(rankings: Sequence[Sequence[str]], qrels: Sequence[Mapping[str, int]]) -> float:
    if len(rankings) != len(qrels):
        raise ValueError("rankings and qrels must have equal length")
    if not rankings:
        return 0.0
    return sum(reciprocal_rank(ranking, relevance) for ranking, relevance in zip(rankings, qrels)) / len(rankings)


def ndcg_at_k(ranked_ids: Sequence[str], relevance: Mapping[str, int], k: int) -> float:
    if k <= 0:
        raise ValueError("k must be positive")

    def dcg(grades: Sequence[int]) -> float:
        return sum((2**grade - 1) / math.log2(index + 2) for index, grade in enumerate(grades))

    observed = [relevance.get(doc_id, 0) for doc_id in ranked_ids[:k]]
    ideal = sorted(relevance.values(), reverse=True)[:k]
    ideal_dcg = dcg(ideal)
    return 0.0 if ideal_dcg == 0 else dcg(observed) / ideal_dcg
