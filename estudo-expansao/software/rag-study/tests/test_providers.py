"""Provider adapters with fake SDK clients: verifies the exact request
parameters without any network call."""

from types import SimpleNamespace

import pytest

from rag_study.providers import AnthropicProvider, OpenAIProvider
from rag_study.retry import RetryExhausted, call_with_retry


class FakeOpenAIClient:
    def __init__(self):
        self.calls = []
        self.responses = SimpleNamespace(create=self._create)

    def _create(self, **kwargs):
        self.calls.append(kwargs)
        return SimpleNamespace(
            output_text='{"expanded_query": "x"}', model="gpt-returned", status="completed",
            incomplete_details=None, _request_id="req_1",
            usage=SimpleNamespace(input_tokens=10, output_tokens=5,
                                  output_tokens_details=SimpleNamespace(reasoning_tokens=2)),
        )


class FakeAnthropicClient:
    def __init__(self):
        self.calls = []
        self.messages = SimpleNamespace(create=self._create)

    def _create(self, **kwargs):
        self.calls.append(kwargs)
        return SimpleNamespace(
            content=[SimpleNamespace(type="thinking", thinking=""), SimpleNamespace(type="text", text="ok")],
            model="claude-returned", stop_reason="end_turn", stop_details=None, _request_id="req_2",
            usage=SimpleNamespace(input_tokens=7, output_tokens=3),
        )


def test_openai_sends_only_configured_sampling_and_schema():
    client = FakeOpenAIClient()
    provider = OpenAIProvider("gpt-x", client=client)
    result = provider.generate("sys", "user", 100, json_schema={"type": "object"})
    call = client.calls[0]
    assert "temperature" not in call and "reasoning" not in call
    assert call["store"] is False
    assert call["text"]["format"]["type"] == "json_schema"
    assert result.returned_model == "gpt-returned"
    assert result.reasoning_tokens == 2
    assert result.parameters["temperature"] == "provider_default"


def test_openai_temperature_and_effort_when_configured():
    client = FakeOpenAIClient()
    OpenAIProvider("gpt-x", temperature=0.0, reasoning_effort="low", client=client).generate("s", "u", 50)
    assert client.calls[0]["temperature"] == 0.0
    assert client.calls[0]["reasoning"] == {"effort": "low"}


def test_anthropic_uses_output_config_and_no_sampling_params():
    client = FakeAnthropicClient()
    provider = AnthropicProvider("claude-x", effort="low", client=client)
    result = provider.generate("sys", "user", 100, json_schema={"type": "object"})
    call = client.calls[0]
    assert call["output_config"] == {"effort": "low", "format": {"type": "json_schema", "schema": {"type": "object"}}}
    assert "temperature" not in call and "extra_body" not in call
    assert result.text == "ok"  # thinking blocks are not part of the answer
    assert result.stop_reason == "end_turn"
    assert result.parameters["refusal_fallback"] is False


def test_anthropic_temperature_only_through_extra_body():
    client = FakeAnthropicClient()
    AnthropicProvider("claude-old", temperature=0.0, client=client).generate("s", "u", 10)
    assert client.calls[0]["extra_body"] == {"temperature": 0.0}


class Status(Exception):
    def __init__(self, status_code):
        super().__init__(f"status {status_code}")
        self.status_code = status_code


def test_retry_counts_attempts_on_transient_errors():
    outcomes = [Status(429), Status(503), "ok"]

    def fn():
        value = outcomes.pop(0)
        if isinstance(value, Exception):
            raise value
        return value

    assert call_with_retry(fn, max_attempts=3, sleep=lambda s: None) == ("ok", 3)


def test_retry_stops_on_client_error():
    def fn():
        raise Status(400)

    with pytest.raises(RetryExhausted) as info:
        call_with_retry(fn, max_attempts=3, sleep=lambda s: None)
    assert info.value.attempts == 1
