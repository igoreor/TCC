import json

import pytest

from rag_study.prompts import (
    PromptArtifact,
    expansion_json_schema,
    parse_expansion,
    parse_expansion_with_mode,
    render_query_prompt,
)


def test_render_query_prompt():
    prompt = PromptArtifact("p1", "Consulta: {{query}}", "hash")
    assert render_query_prompt(prompt, "O que é hanseníase?") == "Consulta: O que é hanseníase?"


def test_parse_rewrite():
    raw = json.dumps({"expanded_query": "neuropatia periférica na hanseníase"})
    assert parse_expansion("rewrite", raw) == "neuropatia periférica na hanseníase"


def test_keywords_requires_five_terms():
    raw = json.dumps({"search_terms": ["a", "b"]})
    with pytest.raises(ValueError):
        parse_expansion("keywords", raw)


def test_keywords_are_joined():
    raw = json.dumps({"search_terms": ["a", "b", "c", "d", "e"]})
    assert parse_expansion("keywords", raw) == "a ; b ; c ; d ; e"


def test_fenced_json_is_accepted_and_flagged():
    raw = '```json\n{"hypothetical_passage": "texto"}\n```'
    assert parse_expansion_with_mode("pseudo_document", raw) == ("texto", "fenced_json")


def test_prose_around_json_is_rejected():
    with pytest.raises(ValueError):
        parse_expansion("rewrite", 'Claro! {"expanded_query": "x"}')


def test_wrong_key_is_rejected():
    with pytest.raises(ValueError):
        parse_expansion("rewrite", json.dumps({"query": "x"}))


@pytest.mark.parametrize("strategy", ["rewrite", "keywords", "pseudo_document"])
def test_schema_is_closed_and_requires_the_strategy_key(strategy):
    schema = expansion_json_schema(strategy)
    assert schema["additionalProperties"] is False
    assert schema["required"] == list(schema["properties"])
