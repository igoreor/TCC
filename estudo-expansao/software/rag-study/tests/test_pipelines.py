import json

from rag_study.logging_utils import JsonlRunLogger
from rag_study.models import GenerationResult
from rag_study.pipelines import DirectChatPipeline, RagChatPipeline
from rag_study.prompts import PromptArtifact
from rag_study.providers import FakeProvider
from rag_study.retrieval import ExactCosineRetriever, HashingEmbedder
from rag_study.retry import RetryExhausted

P = {name: PromptArtifact(name, f"{name} {{{{query}}}}", f"hash-{name}")
     for name in ("answer", "system", "rewrite", "keywords")}


class SpyProvider(FakeProvider):
    def __init__(self, expansion_text=None, fail_expansion=False):
        super().__init__("spy", "spy-v1")
        self.calls = []
        self.expansion_text = expansion_text
        self.fail_expansion = fail_expansion

    def generate(self, system_prompt, user_prompt, max_output_tokens, json_schema=None):
        self.calls.append({"user": user_prompt, "max": max_output_tokens, "schema": json_schema})
        if json_schema is not None:
            if self.fail_expansion:
                error = Exception("server")
                error.status_code = 500
                raise error
            if self.expansion_text is not None:
                return GenerationResult(self.expansion_text, self.name, self.model, self.model, 3, 4, 1.0)
        return super().generate(system_prompt, user_prompt, max_output_tokens, json_schema)


def make_rag(tmp_path, tiny_corpus, tiny_index, provider, strategy="rewrite", **kwargs):
    retriever = ExactCosineRetriever.load(tiny_index, tiny_corpus, HashingEmbedder())
    return RagChatPipeline(
        provider, retriever, P["answer"], JsonlRunLogger(tmp_path / "log.jsonl"),
        expansion_provider=provider if strategy != "original" else None,
        expansion_system_prompt=P["system"] if strategy != "original" else None,
        expansion_prompt=P.get(strategy) if strategy != "original" else None,
        expansion_strategy=strategy, k=2, max_output_tokens=300, expansion_max_output_tokens=50,
        sleep=lambda s: None, **kwargs,
    )


def test_generator_always_receives_the_original_question(tmp_path, tiny_corpus, tiny_index):
    provider = SpyProvider(expansion_text=json.dumps({"expanded_query": "baciloscopia negativa"}))
    record = make_rag(tmp_path, tiny_corpus, tiny_index, provider).run("e", "q1", "exame deu negativo?")
    generation_call = provider.calls[-1]
    assert generation_call["user"].endswith("Pergunta original:\nexame deu negativo?")
    assert "baciloscopia negativa" not in generation_call["user"].split("Pergunta original:")[1]
    assert record.retrieval_query == "baciloscopia negativa"
    assert record.expansion_status == "ok"


def test_separate_budgets_and_steps(tmp_path, tiny_corpus, tiny_index):
    provider = SpyProvider(expansion_text=json.dumps({"expanded_query": "x"}))
    record = make_rag(tmp_path, tiny_corpus, tiny_index, provider).run("e", "q1", "pergunta")
    assert [call["max"] for call in provider.calls] == [50, 300]
    assert [step.name for step in record.steps] == ["expansion", "retrieval", "generation"]
    assert record.steps[0].input_tokens == 3
    assert record.expander_model == "spy-v1"
    assert record.condition == "R1-SPY"


def test_invalid_expansion_falls_back_to_original_query(tmp_path, tiny_corpus, tiny_index):
    provider = SpyProvider(expansion_text="não é JSON")
    record = make_rag(tmp_path, tiny_corpus, tiny_index, provider).run("e", "q1", "pergunta original")
    assert record.expansion_status == "fallback_invalid_output"
    assert record.retrieval_query == "pergunta original"
    assert record.status == "success" and record.answer
    assert record.steps[0].status == "invalid_output"


def test_expansion_api_error_falls_back_and_counts_attempts(tmp_path, tiny_corpus, tiny_index):
    provider = SpyProvider(fail_expansion=True)
    record = make_rag(tmp_path, tiny_corpus, tiny_index, provider).run("e", "q1", "pergunta")
    assert record.expansion_status == "fallback_api_error"
    assert record.steps[0].attempts == 3
    assert record.answer is not None


def test_original_condition_makes_no_expansion_call(tmp_path, tiny_corpus, tiny_index):
    provider = SpyProvider()
    record = make_rag(tmp_path, tiny_corpus, tiny_index, provider, strategy="original").run("e", "q1", "pergunta")
    assert len(provider.calls) == 1
    assert record.condition == "R0-SPY"
    assert record.expansion_status == "not_applicable"


def test_logged_record_has_no_chunk_text_but_has_context_hash(tmp_path, tiny_corpus, tiny_index):
    make_rag(tmp_path, tiny_corpus, tiny_index, SpyProvider(), strategy="original").run("e", "q1", "pergunta")
    logged = json.loads((tmp_path / "log.jsonl").read_text(encoding="utf-8"))
    assert "text" not in logged["retrieved_chunks"][0]
    assert len(logged["context_sha256"]) == 64


def test_direct_condition_has_no_expansion_or_retrieval(tmp_path):
    record = DirectChatPipeline(SpyProvider(), P["answer"], JsonlRunLogger(tmp_path / "d.jsonl")).run("e", "q", "p")
    assert record.condition == "D-SPY" and record.mode == "direct"
    assert record.expansion_status == "not_applicable"
    assert [step.name for step in record.steps] == ["generation"]
    assert record.returned_model == "spy-v1"


def test_direct_generation_failure_is_recorded(tmp_path):
    class Failing(FakeProvider):
        def generate(self, *args, **kwargs):
            raise RetryExhausted(1, ValueError("bad request"))

    pipeline = DirectChatPipeline(Failing(), P["answer"], JsonlRunLogger(tmp_path / "d.jsonl"))
    record = pipeline.run("e", "q1", "pergunta")
    assert record.status == "error"
    assert record.steps[0].status == "error"


def test_cost_is_null_without_price_and_summed_with_price(tmp_path, tiny_corpus, tiny_index):
    provider = SpyProvider(expansion_text=json.dumps({"expanded_query": "x"}))
    record = make_rag(tmp_path, tiny_corpus, tiny_index, provider,
                      cost_fn=lambda step: 0.5).run("e", "q1", "pergunta")
    assert record.estimated_cost_usd == 1.0
    record = make_rag(tmp_path, tiny_corpus, tiny_index, provider, cost_fn=lambda step: None).run("e", "q", "p")
    assert record.estimated_cost_usd is None
