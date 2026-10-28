import json
import subprocess

import pytest

from rag_study.providers import ClaudeCodeCliProvider, CliError, CodexCliProvider
from rag_study.retry import FatalProviderError, call_with_retry, is_retryable

# Shape observed in real Claude Code 2.1.126 print-mode runs (22/10/2026).
OK = {
    "type": "result", "subtype": "success", "is_error": False, "result": "teste ok", "num_turns": 1,
    "stop_reason": "end_turn", "total_cost_usd": 0.00105, "session_id": "s-1", "api_error_status": None,
    "usage": {"input_tokens": 187, "cache_creation_input_tokens": 0, "cache_read_input_tokens": 0,
              "output_tokens": 6, "service_tier": "standard"},
    "modelUsage": {"claude-haiku-4-5-20251001": {"inputTokens": 345, "outputTokens": 11},
                   "claude-sonnet-5-5": {"inputTokens": 187, "outputTokens": 6}},
}


class Runner:
    def __init__(self, payload, returncode=0):
        self.payload, self.returncode, self.calls = payload, returncode, []

    def __call__(self, cmd, **kwargs):
        self.calls.append((cmd, kwargs))
        stdout = self.payload if isinstance(self.payload, str) else json.dumps(self.payload)
        return subprocess.CompletedProcess(cmd, self.returncode, stdout=stdout, stderr="")


def test_command_replaces_system_prompt_and_removes_tools():
    runner = Runner(OK)
    provider = ClaudeCodeCliProvider("claude-sonnet-5-5", "low", executable="claude.exe", runner=runner)
    result = provider.generate("PROMPT DO ESTUDO", "pergunta com \"aspas\"\ne quebra", 800)
    cmd, kwargs = runner.calls[0]
    assert cmd[cmd.index("--system-prompt") + 1] == "PROMPT DO ESTUDO"
    assert cmd[cmd.index("--tools") + 1] == ""
    assert cmd[cmd.index("--model") + 1] == "claude-sonnet-5-5" and cmd[cmd.index("--effort") + 1] == "low"
    assert "--append-system-prompt" not in cmd and "--json-schema" not in cmd
    assert kwargs["input"] == "pergunta com \"aspas\"\ne quebra".encode("utf-8")  # stdin bytes: no CRLF, no shell
    assert result.text == "teste ok" and result.returned_model == "claude-sonnet-5-5"
    assert result.input_tokens == 187 and result.output_tokens == 6 and result.stop_reason == "end_turn"
    assert "claude-haiku-4-5-20251001" in result.raw_metadata["model_usage"]  # background call is logged
    assert result.parameters["max_output_tokens_enforced"] is True
    env = kwargs["env"]
    assert env["CLAUDE_CODE_MAX_OUTPUT_TOKENS"] == "800" and env["CLAUDE_CODE_DISABLE_CLAUDE_MDS"] == "1"
    assert cmd[cmd.index("--disallowedTools") + 1] == "mcp__*"


def test_api_keys_never_reach_the_cli(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-test")
    runner = Runner(OK)
    ClaudeCodeCliProvider("claude-sonnet-5-5", "low", executable="claude.exe", runner=runner).generate("s", "u", 10)
    assert "ANTHROPIC_API_KEY" not in runner.calls[0][1]["env"]


def test_answer_over_the_output_limit_is_a_truncation():
    over = dict(OK, is_error=True, stop_reason="stop_sequence",
                result="API Error: Claude's response exceeded the 60 output token maximum. To configure this behavior, "
                       "set the CLAUDE_CODE_MAX_OUTPUT_TOKENS environment variable.")
    provider = ClaudeCodeCliProvider("claude-sonnet-5-5", "low", executable="claude.exe", runner=Runner(over, 1))
    result = provider.generate("s", "u", 60)
    assert result.text == "" and result.stop_reason == "max_tokens" and result.raw_metadata["over_output_limit"]


def test_structured_output_is_returned_as_json_text():
    payload = dict(OK, result="", structured_output={"expanded_query": "hanseníase multibacilar"})
    runner = Runner(payload)
    provider = ClaudeCodeCliProvider("claude-sonnet-5-5", "low", executable="claude.exe", runner=runner)
    schema = {"type": "object", "properties": {"expanded_query": {"type": "string"}},
              "required": ["expanded_query"], "additionalProperties": False}
    result = provider.generate("s", "u", 400, schema)
    assert json.loads(result.text) == {"expanded_query": "hanseníase multibacilar"}
    cmd = runner.calls[0][0]
    assert json.loads(cmd[cmd.index("--json-schema") + 1]) == schema


def test_cli_errors_follow_the_retry_rules():
    overloaded = dict(OK, is_error=True, subtype="error_during_execution", result="Overloaded", api_error_status=529)
    provider = ClaudeCodeCliProvider("claude-sonnet-5-5", "low", executable="claude.exe", runner=Runner(overloaded, 1))
    with pytest.raises(CliError) as info:
        provider.generate("s", "u", 10)
    assert is_retryable(info.value)

    garbage = ClaudeCodeCliProvider("m", None, executable="claude.exe", runner=Runner("not json", 1))
    with pytest.raises(CliError):
        garbage.generate("s", "u", 10)


def test_usage_limit_is_fatal_so_the_batch_can_be_continued_later():
    limited = dict(OK, is_error=True, subtype="error_during_execution", result="Claude AI usage limit reached")
    provider = ClaudeCodeCliProvider("claude-sonnet-5-5", "low", executable="claude.exe", runner=Runner(limited, 1))
    with pytest.raises(FatalProviderError):
        call_with_retry(lambda: provider.generate("s", "u", 10), max_attempts=3, sleep=lambda s: None)


def _codex(tmp_path, events, returncode=0):
    catalog = tmp_path / "catalog.json"
    catalog.write_text('{"models": []}', encoding="utf-8")
    stdout = "\n".join(json.dumps(event) for event in events)
    runner = Runner(stdout, returncode)
    return CodexCliProvider("gpt-6.1-sol", "low", str(catalog), executable="codex.exe", runner=runner), runner


CODEX_OK = [
    {"type": "thread.started", "thread_id": "t-1"},
    {"type": "turn.started"},
    {"type": "item.completed", "item": {"id": "r", "type": "reasoning", "text": ""}},
    {"type": "item.completed", "item": {"id": "m", "type": "agent_message", "text": "Doze doses."}},
    {"type": "turn.completed", "usage": {"input_tokens": 900, "cached_input_tokens": 0, "output_tokens": 120,
                                         "reasoning_output_tokens": 40}},
]


def test_codex_command_replaces_instructions_and_disables_everything(tmp_path):
    provider, runner = _codex(tmp_path, CODEX_OK)
    result = provider.generate("PROMPT DO ESTUDO", "pergunta\nmultilinha", 2000)
    cmd, kwargs = runner.calls[0]
    joined = " ".join(cmd)
    assert cmd[1] == "exec" and cmd[-1] == "-" and kwargs["input"] == "pergunta\nmultilinha".encode("utf-8")
    for flag in ("--ephemeral", "--ignore-user-config", "--strict-config", "--json"):
        assert flag in cmd
    for entry in ("agents.enabled=false", 'web_search="disabled"', "include_environment_context=false",
                  "project_doc_max_bytes=0", 'service_tier="default"', 'model_reasoning_effort="low"'):
        assert entry in cmd
    assert "model_catalog_json=" in joined and "model_instructions_file=" in joined
    assert all(feature in cmd for feature in ("shell_tool", "unified_exec", "memories", "plugins"))
    instructions = next(c for c in cmd if c.startswith("model_instructions_file=")).split("=", 1)[1].strip("'")
    assert open(instructions, "rb").read() == b"PROMPT DO ESTUDO"
    assert result.text == "Doze doses." and result.input_tokens == 900 and result.reasoning_tokens == 40
    assert result.returned_model == "gpt-6.1-sol" and result.request_id == "t-1"


def test_codex_rejects_any_tool_item(tmp_path):
    events = CODEX_OK[:2] + [{"type": "item.completed", "item": {"type": "command_execution", "command": "ls"}}]
    provider, _ = _codex(tmp_path, events + CODEX_OK[3:])
    with pytest.raises(CliError):
        provider.generate("s", "u", 10)


def test_codex_usage_limit_is_fatal_and_reroute_is_recorded(tmp_path):
    limited = [{"type": "thread.started", "thread_id": "t"}, {"type": "turn.started"},
               {"type": "error", "message": "You've hit your usage limit. Upgrade to Pro or try again later."},
               {"type": "turn.failed", "error": {"message": "You've hit your usage limit."}}]
    provider, _ = _codex(tmp_path, limited, returncode=1)
    with pytest.raises(FatalProviderError):
        call_with_retry(lambda: provider.generate("s", "u", 10), max_attempts=3, sleep=lambda s: None)

    rerouted = CODEX_OK[:2] + [{"type": "item.completed", "item": {
        "type": "error", "message": "model rerouted: gpt-6.1-sol -> gpt-6-sol (capacity)"}}] + CODEX_OK[3:]
    provider, _ = _codex(tmp_path, rerouted)
    assert provider.generate("s", "u", 10).returned_model == "gpt-6-sol"
