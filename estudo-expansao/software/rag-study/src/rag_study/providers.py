from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Any, Protocol

from .models import GenerationResult


class TextProvider(Protocol):
    name: str
    model: str

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        max_output_tokens: int,
        json_schema: dict | None = None,
    ) -> GenerationResult:
        ...


class OpenAIProvider:
    """OpenAI Responses API adapter.

    Sampling parameters are sent only when configured; otherwise the provider
    default applies and is logged as such. SDK retries are disabled so the
    harness counts attempts itself.
    """

    name = "openai"

    def __init__(
        self,
        model: str,
        temperature: float | None = None,
        reasoning_effort: str | None = None,
        client=None,
    ):
        if client is None:
            from openai import OpenAI

            client = OpenAI(max_retries=0)
        self.client = client
        self.model = model
        self.temperature = temperature
        self.reasoning_effort = reasoning_effort

    def parameters(self) -> dict[str, Any]:
        return {
            "temperature": self.temperature if self.temperature is not None else "provider_default",
            "reasoning_effort": self.reasoning_effort or "provider_default",
            "store": False,
        }

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        max_output_tokens: int,
        json_schema: dict | None = None,
    ) -> GenerationResult:
        kwargs: dict[str, Any] = {
            "model": self.model,
            "instructions": system_prompt,
            "input": user_prompt,
            "max_output_tokens": max_output_tokens,
            "store": False,
        }
        if self.temperature is not None:
            kwargs["temperature"] = self.temperature
        if self.reasoning_effort:
            kwargs["reasoning"] = {"effort": self.reasoning_effort}
        if json_schema is not None:
            kwargs["text"] = {
                "format": {"type": "json_schema", "name": "expansion", "schema": json_schema, "strict": True}
            }
        started = time.perf_counter()
        response = self.client.responses.create(**kwargs)
        latency_ms = (time.perf_counter() - started) * 1000
        usage = getattr(response, "usage", None)
        details = getattr(usage, "output_tokens_details", None)
        incomplete = getattr(response, "incomplete_details", None)
        stop_reason = getattr(incomplete, "reason", None) or getattr(response, "status", None)
        return GenerationResult(
            text=response.output_text,
            provider=self.name,
            requested_model=self.model,
            returned_model=getattr(response, "model", None),
            input_tokens=getattr(usage, "input_tokens", None),
            output_tokens=getattr(usage, "output_tokens", None),
            latency_ms=latency_ms,
            request_id=getattr(response, "_request_id", None),
            stop_reason=stop_reason,
            reasoning_tokens=getattr(details, "reasoning_tokens", None),
            parameters={**self.parameters(), "max_output_tokens": max_output_tokens,
                        "structured_output": json_schema is not None},
        )


class AnthropicProvider:
    """Anthropic Messages API adapter.

    Current Claude models reject temperature/top_p/top_k, so reproducibility
    rests on a pinned model ID, an explicit ``effort`` and logged outputs.
    ``temperature`` is sent through ``extra_body`` only when configured, for
    older models that still accept it. No server-side refusal fallback is
    enabled: it would silently switch models inside an experimental condition.
    """

    name = "anthropic"

    def __init__(
        self,
        model: str,
        effort: str | None = None,
        temperature: float | None = None,
        client=None,
    ):
        if client is None:
            from anthropic import Anthropic

            client = Anthropic(max_retries=0)
        self.client = client
        self.model = model
        self.effort = effort
        self.temperature = temperature

    def parameters(self) -> dict[str, Any]:
        return {
            "effort": self.effort or "provider_default",
            "temperature": self.temperature if self.temperature is not None else "not_sent",
            "thinking": "provider_default",
            "refusal_fallback": False,
        }

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        max_output_tokens: int,
        json_schema: dict | None = None,
    ) -> GenerationResult:
        kwargs: dict[str, Any] = {
            "model": self.model,
            "system": system_prompt,
            "max_tokens": max_output_tokens,
            "messages": [{"role": "user", "content": user_prompt}],
        }
        output_config: dict[str, Any] = {}
        if self.effort:
            output_config["effort"] = self.effort
        if json_schema is not None:
            output_config["format"] = {"type": "json_schema", "schema": json_schema}
        if output_config:
            kwargs["output_config"] = output_config
        if self.temperature is not None:
            kwargs["extra_body"] = {"temperature": self.temperature}
        started = time.perf_counter()
        message = self.client.messages.create(**kwargs)
        latency_ms = (time.perf_counter() - started) * 1000
        text = "".join(block.text for block in message.content if getattr(block, "type", None) == "text")
        usage = getattr(message, "usage", None)
        stop_details = getattr(message, "stop_details", None)
        raw_metadata = {}
        if stop_details is not None:
            dump = getattr(stop_details, "model_dump", None)
            raw_metadata["stop_details"] = dump(mode="json") if dump else str(stop_details)
        return GenerationResult(
            text=text,
            provider=self.name,
            requested_model=self.model,
            returned_model=getattr(message, "model", None),
            input_tokens=getattr(usage, "input_tokens", None),
            output_tokens=getattr(usage, "output_tokens", None),
            latency_ms=latency_ms,
            request_id=getattr(message, "_request_id", None),
            stop_reason=getattr(message, "stop_reason", None),
            parameters={**self.parameters(), "max_output_tokens": max_output_tokens,
                        "structured_output": json_schema is not None},
            raw_metadata=raw_metadata,
        )


class CliError(Exception):
    """Failure reported by a subscription CLI. ``status_code`` mirrors the
    API status when the CLI exposes it, so the retry rules apply unchanged."""

    def __init__(self, message: str, status_code: int | None = None):
        super().__init__(message)
        self.status_code = status_code


def _run_cli(runner, cmd: list[str], user_prompt: str, cwd: Path, env: dict[str, str],
             timeout_s: float) -> tuple[int, str, str]:
    """Run a CLI with the prompt on stdin as UTF-8 bytes. Text-mode pipes on
    Windows turn "\\n" into "\\r\\n", which would make the prompt differ byte-wise
    from the API path."""
    try:
        completed = runner(cmd, input=user_prompt.encode("utf-8"), capture_output=True, cwd=cwd, env=env,
                           timeout=timeout_s)
    except subprocess.TimeoutExpired as exc:
        raise TimeoutError(f"{Path(cmd[0]).name} excedeu {timeout_s}s") from exc

    def decode(value) -> str:
        return value.decode("utf-8", "replace") if isinstance(value, bytes) else (value or "")

    return completed.returncode, decode(completed.stdout), decode(completed.stderr)


def _empty_workdir(name: str) -> Path:
    """Dedicated empty directory: the CLIs discover instruction files
    (CLAUDE.md, AGENTS.md) from the working directory and its parents."""
    path = Path(tempfile.gettempdir()) / f"rag-study-{name}-workdir"
    path.mkdir(exist_ok=True)
    if any(path.iterdir()):
        raise RuntimeError(f"{path} deveria estar vazio")
    return path


class ClaudeCodeCliProvider:
    """Claude through the Claude Code CLI in print mode, authenticated with
    the user's Claude subscription (no API key, no per-token billing).

    The study's system prompt replaces Claude Code's (``--system-prompt``),
    every built-in and MCP tool is removed, skills, CLAUDE.md, auto memory and
    session files are off, and the process runs in an empty directory.
    Verified on v2.1.126 (init event: ``tools=[]``, ``mcp_servers=[]``,
    ``apiKeySource=none``): Claude Code still adds a fixed identity block of
    about 180 input tokens and a background call to a Haiku model, both logged.
    API keys are removed from the child environment so the subscription, never
    the API, is used.
    """

    name = "claude_cli"
    ISOLATION_ENV = {
        "CLAUDE_CODE_DISABLE_CLAUDE_MDS": "1",
        "CLAUDE_CODE_DISABLE_AUTO_MEMORY": "1",
        "CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS": "1",
    }
    API_CREDENTIALS = ("ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN")
    OVER_LIMIT = "output token maximum"

    def __init__(self, model: str, effort: str | None = None, executable: str | None = None,
                 timeout_s: float = 600.0, extra_env: dict[str, str] | None = None, runner=None):
        self.model = model
        self.effort = effort
        self.executable = executable or self._find_executable()
        self.timeout_s = timeout_s
        self.extra_env = extra_env or {}
        self.runner = runner or subprocess.run
        self.workdir = _empty_workdir("claude") if runner is None else Path(tempfile.gettempdir())
        self.cli_version = self._version() if runner is None else "test"

    def _version(self) -> str:
        completed = subprocess.run([self.executable, "--version"], capture_output=True, text=True, timeout=60)
        return completed.stdout.strip()

    @staticmethod
    def _find_executable() -> str:
        # The npm shims (.cmd/.ps1) route arguments through a shell, which
        # mangles quotes and line breaks; call the real binary instead.
        appdata = os.environ.get("APPDATA")
        if appdata:
            native = Path(appdata) / "npm" / "node_modules" / "@anthropic-ai" / "claude-code" / "bin" / "claude.exe"
            if native.exists():
                return str(native)
        found = shutil.which("claude")
        if not found:
            raise FileNotFoundError("Claude Code CLI não encontrado")
        return found

    def parameters(self) -> dict[str, Any]:
        return {"access": "claude-code-cli-subscription", "cli_version": self.cli_version,
                "effort": self.effort or "provider_default", "system_prompt": "replaced", "tools": "none",
                "temperature": "not_sent", "refusal_fallback": False,
                **{f"env:{k}": v for k, v in sorted({**self.ISOLATION_ENV, **self.extra_env}.items())}}

    def command(self, system_prompt: str, json_schema: dict | None) -> list[str]:
        cmd = [self.executable, "-p", "--system-prompt", system_prompt, "--tools", "", "--disallowedTools",
               "mcp__*", "--model", self.model, "--output-format", "json", "--no-session-persistence",
               "--strict-mcp-config", "--disable-slash-commands"]
        if self.effort:
            cmd += ["--effort", self.effort]
        if json_schema is not None:
            cmd += ["--json-schema", json.dumps(json_schema, ensure_ascii=False)]
        return cmd

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        max_output_tokens: int,
        json_schema: dict | None = None,
    ) -> GenerationResult:
        env = {key: value for key, value in os.environ.items() if key not in self.API_CREDENTIALS}
        env.update({**self.ISOLATION_ENV, **self.extra_env,
                    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": str(max_output_tokens)})
        started = time.perf_counter()
        returncode, stdout, stderr = _run_cli(self.runner, self.command(system_prompt, json_schema), user_prompt,
                                              self.workdir, env, self.timeout_s)
        latency_ms = (time.perf_counter() - started) * 1000
        try:
            data = json.loads(stdout)
        except json.JSONDecodeError as exc:
            raise CliError(f"saída não-JSON (código {returncode}): {(stderr or stdout)[:500]}") from exc
        over_limit = self.OVER_LIMIT in str(data.get("result"))
        if (returncode != 0 or data.get("is_error")) and not over_limit:
            raise CliError(f"{data.get('subtype')}: {str(data.get('result'))[:500]}", data.get("api_error_status"))

        usage = data.get("usage") or {}
        model_usage = data.get("modelUsage") or {}
        returned = self.model if self.model in model_usage else next(
            (name for name in model_usage if "haiku" not in name), None)
        if over_limit:
            # Claude Code discards an answer that exceeds CLAUDE_CODE_MAX_OUTPUT_TOKENS
            # instead of truncating it: logged as a truncation with no text.
            text = ""
        elif json_schema is not None and data.get("structured_output") is not None:
            text = json.dumps(data["structured_output"], ensure_ascii=False)
        else:
            text = data.get("result") or ""
        input_tokens = sum(usage.get(key) or 0 for key in
                           ("input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens"))
        return GenerationResult(
            text=text,
            provider=self.name,
            requested_model=self.model,
            returned_model=returned,
            input_tokens=input_tokens if usage else None,
            output_tokens=usage.get("output_tokens"),
            latency_ms=latency_ms,
            request_id=data.get("session_id"),
            stop_reason="max_tokens" if over_limit else data.get("stop_reason"),
            parameters={**self.parameters(), "max_output_tokens": max_output_tokens,
                        "max_output_tokens_enforced": True, "structured_output": json_schema is not None},
            raw_metadata={"model_usage": model_usage, "api_equivalent_cost_usd": data.get("total_cost_usd"),
                          "over_output_limit": over_limit,
                          "num_turns": data.get("num_turns"), "service_tier": usage.get("service_tier")},
        )


class CodexCliProvider:
    """GPT through ``codex exec``, authenticated with the user's ChatGPT plan.

    The study's system prompt replaces Codex's built-in instructions
    (``model_instructions_file``; sent as the only developer message), and
    every injected context block, feature and tool is switched off. The
    stock catalog advertises a code-mode ``exec`` tool for gpt-6.1-sol even
    with all features disabled, so a catalog entry with ``tool_mode=direct``
    and no tools is passed (``config/codex/``). Request bodies captured with a
    local mock provider contained no tools and only [developer: prompt,
    user: question] (22/10/2026, codex-cli 0.162.0-alpha.17.2).
    """

    name = "codex_cli"
    DISABLED_FEATURES = ("shell_tool", "unified_exec", "view_image", "goals", "apps", "plugins", "image_generation",
                         "multi_agent", "multi_agent_v2", "browser_use", "computer_use", "memories", "sleep_tool",
                         "tool_suggest", "skill_search", "hooks")
    ISOLATION_CONFIG = ('tools.experimental_request_user_input={enabled=false}', "agents.enabled=false",
                        'web_search="disabled"', "include_permissions_instructions=false",
                        "include_apps_instructions=false", "include_collaboration_mode_instructions=false",
                        "include_environment_context=false", "skills.include_instructions=false",
                        "skills.bundled.enabled=false", "project_doc_max_bytes=0", 'service_tier="default"')
    ALLOWED_ITEMS = {"agent_message", "reasoning", "error"}
    API_CREDENTIALS = ("OPENAI_API_KEY", "CODEX_API_KEY")

    def __init__(self, model: str, reasoning_effort: str | None, catalog: str, executable: str | None = None,
                 verbosity: str = "medium", timeout_s: float = 600.0, extra_config: list[str] | None = None,
                 runner=None):
        self.model = model
        self.reasoning_effort = reasoning_effort
        self.catalog = str(Path(catalog).resolve())
        self.catalog_sha256 = hashlib.sha256(Path(self.catalog).read_bytes()).hexdigest()
        self.executable = executable or self._find_executable()
        self.verbosity = verbosity
        self.timeout_s = timeout_s
        self.extra_config = list(extra_config or [])
        self.runner = runner or subprocess.run
        self.workdir = _empty_workdir("codex") if runner is None else Path(tempfile.gettempdir())
        self.instructions_dir = Path(tempfile.gettempdir()) / "rag-study-codex-instructions"
        self.instructions_dir.mkdir(exist_ok=True)
        self.cli_version = self._version() if runner is None else "test"

    @staticmethod
    def _find_executable() -> str:
        found = shutil.which("codex")
        if found:
            return found
        extensions = Path.home() / ".vscode" / "extensions"
        candidates = sorted(extensions.glob("openai.chatgpt-*/bin/windows-x86_64/codex.exe"))
        if not candidates:
            raise FileNotFoundError("Codex CLI não encontrado")
        return str(candidates[-1])

    def _version(self) -> str:
        completed = subprocess.run([self.executable, "--version"], capture_output=True, text=True, timeout=60)
        return completed.stdout.strip()

    def parameters(self) -> dict[str, Any]:
        return {"access": "codex-cli-chatgpt-plan", "cli_version": self.cli_version,
                "reasoning_effort": self.reasoning_effort or "provider_default", "verbosity": self.verbosity,
                "system_prompt": "replaced (model_instructions_file, developer message)", "tools": "none",
                "temperature": "not_sent", "service_tier": "default", "catalog_sha256": self.catalog_sha256}

    def _instructions_file(self, system_prompt: str) -> Path:
        digest = hashlib.sha256(system_prompt.encode("utf-8")).hexdigest()[:16]
        path = self.instructions_dir / f"{digest}.md"
        if not path.exists():
            path.write_bytes(system_prompt.encode("utf-8"))  # bytes: no CRLF translation on Windows
        return path

    def command(self, system_prompt: str, schema_path: Path | None) -> list[str]:
        cmd = [self.executable, "exec", "--ephemeral", "--skip-git-repo-check", "--ignore-user-config",
               "--strict-config", "--json", "-C", str(self.workdir), "-m", self.model,
               "-c", f"model_catalog_json='{self.catalog}'",
               "-c", f"model_instructions_file='{self._instructions_file(system_prompt)}'",
               "-c", f'model_verbosity="{self.verbosity}"']
        if self.reasoning_effort:
            cmd += ["-c", f'model_reasoning_effort="{self.reasoning_effort}"']
        for entry in (*self.ISOLATION_CONFIG, *self.extra_config):
            cmd += ["-c", entry]
        for feature in self.DISABLED_FEATURES:
            cmd += ["--disable", feature]
        if schema_path is not None:
            cmd += ["--output-schema", str(schema_path)]
        return cmd + ["-"]  # the question goes through stdin

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        max_output_tokens: int,
        json_schema: dict | None = None,
    ) -> GenerationResult:
        schema_path = None
        if json_schema is not None:
            text = json.dumps(json_schema, ensure_ascii=False, sort_keys=True)
            schema_path = self.instructions_dir / f"schema-{hashlib.sha256(text.encode()).hexdigest()[:16]}.json"
            schema_path.write_text(text, encoding="utf-8")
        env = {key: value for key, value in os.environ.items() if key not in self.API_CREDENTIALS}
        started = time.perf_counter()
        returncode, stdout, stderr = _run_cli(self.runner, self.command(system_prompt, schema_path), user_prompt,
                                              self.workdir, env, self.timeout_s)
        latency_ms = (time.perf_counter() - started) * 1000

        messages, warnings, failures, usage, thread_id = [], [], [], None, None
        for line in stdout.splitlines():
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            kind = event.get("type")
            if kind == "thread.started":
                thread_id = event.get("thread_id")
            elif kind == "item.completed":
                item = event.get("item") or {}
                if item.get("type") not in self.ALLOWED_ITEMS:
                    raise CliError(f"o modelo recebeu ou usou uma ferramenta ({item.get('type')}); execução inválida")
                if item.get("type") == "agent_message":
                    messages.append(item.get("text") or "")
                elif item.get("type") == "error":
                    warnings.append(item.get("message") or "")
            elif kind == "turn.completed":
                usage = event.get("usage") or {}
            elif kind in {"turn.failed", "error"}:
                error = event.get("error") or {}
                failures.append(error.get("message") or event.get("message") or str(event))
        if failures or returncode != 0 or usage is None:
            detail = " | ".join(failures) or stderr[-500:] or "sem evento turn.completed"
            raise CliError(f"codex exec (código {returncode}): {detail[:800]}")

        returned = self.model
        for warning in warnings:
            if "model rerouted" in warning:
                returned = warning.split("->", 1)[-1].strip().split()[0]
        return GenerationResult(
            text=messages[-1] if messages else "",
            provider=self.name,
            requested_model=self.model,
            returned_model=returned,
            input_tokens=usage.get("input_tokens"),
            output_tokens=usage.get("output_tokens"),
            latency_ms=latency_ms,
            request_id=thread_id,
            stop_reason="completed",
            reasoning_tokens=usage.get("reasoning_output_tokens"),
            parameters={**self.parameters(), "max_output_tokens": max_output_tokens,
                        "max_output_tokens_enforced": False, "structured_output": json_schema is not None},
            raw_metadata={"usage": usage, "warnings": warnings, "n_agent_messages": len(messages)},
        )


class FakeProvider:
    """Deterministic offline provider for dry runs and tests. Never calls a network."""

    def __init__(self, name: str = "fake", model: str = "fake-model-v1"):
        self.name = name
        self.model = model

    def parameters(self) -> dict[str, Any]:
        return {"fake": True}

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        max_output_tokens: int,
        json_schema: dict | None = None,
    ) -> GenerationResult:
        if json_schema is not None:
            key = json_schema["required"][0]
            query = user_prompt.split("Pergunta original:", 1)[-1].strip().splitlines()[0]
            if json_schema["properties"][key]["type"] == "array":
                value: Any = [f"{query} termo {i}" for i in range(1, 6)]
            else:
                value = f"{query} hanseníase"
            text = json.dumps({key: value}, ensure_ascii=False)
        else:
            text = f"[resposta simulada] {user_prompt[-200:]}"
        return GenerationResult(
            text=text,
            provider=self.name,
            requested_model=self.model,
            returned_model=self.model,
            input_tokens=len(user_prompt.split()),
            output_tokens=len(text.split()),
            latency_ms=0.0,
            request_id=None,
            stop_reason="end_turn",
            parameters={**self.parameters(), "max_output_tokens": max_output_tokens,
                        "structured_output": json_schema is not None},
        )


def build_provider(spec: dict[str, Any]) -> TextProvider:
    """Instantiate a provider from a config block such as
    ``{"provider": "anthropic", "model": "...", "effort": "low"}``."""
    provider = spec["provider"]
    if provider == "openai":
        return OpenAIProvider(spec["model"], spec.get("temperature"), spec.get("reasoning_effort"))
    if provider == "anthropic":
        return AnthropicProvider(spec["model"], spec.get("effort"), spec.get("temperature"))
    if provider == "claude_cli":
        return ClaudeCodeCliProvider(spec["model"], spec.get("effort"), spec.get("executable"),
                                     spec.get("timeout_s", 600.0), spec.get("env"))
    if provider == "codex_cli":
        return CodexCliProvider(spec["model"], spec.get("reasoning_effort"), spec["catalog"], spec.get("executable"),
                                spec.get("verbosity", "medium"), spec.get("timeout_s", 600.0), spec.get("config"))
    if provider == "fake":
        return FakeProvider(spec.get("name", "fake"), spec.get("model", "fake-model-v1"))
    raise ValueError(f"unknown provider: {provider}")
