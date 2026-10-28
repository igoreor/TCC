from __future__ import annotations

import time
from collections.abc import Callable
from typing import TypeVar

T = TypeVar("T")

RETRYABLE_STATUS = {408, 409, 429}
FATAL_STATUS = {401, 403, 404}
FATAL_MARKERS = ("insufficient_quota", "credit_balance", "credit balance", "billing",
                 # subscription CLIs: the usage window resets hours later, so the
                 # batch stops and is resumed with `run --continue-from`
                 "usage limit", "hit your limit", "limit reached")


class RetryExhausted(Exception):
    def __init__(self, attempts: int, last_error: Exception):
        super().__init__(f"{type(last_error).__name__}: {last_error}")
        self.attempts = attempts
        self.last_error = last_error


class FatalProviderError(Exception):
    """Account or configuration failure: invalid key, no permission, unknown
    model or exhausted credit. Retrying is useless and recording it as an
    expansion fallback or a missing answer would hide it inside the data, so
    the batch stops (the runner marks it ``aborted``)."""


def is_fatal(exc: Exception) -> bool:
    if getattr(exc, "status_code", None) in FATAL_STATUS:
        return True
    text = f"{getattr(exc, 'code', '') or ''} {exc}".lower()
    return any(marker in text for marker in FATAL_MARKERS)


def is_retryable(exc: Exception) -> bool:
    """Rate limits, timeouts, connection failures and 5xx are transient.

    Checked by attribute and class name so the rule applies equally to the
    OpenAI and Anthropic SDK exception hierarchies. A 429 caused by exhausted
    credit is fatal, not transient.
    """
    if is_fatal(exc):
        return False
    status = getattr(exc, "status_code", None)
    if isinstance(status, int):
        return status in RETRYABLE_STATUS or status >= 500
    name = type(exc).__name__
    return name in {"APITimeoutError", "APIConnectionError", "TimeoutError", "ConnectionError"}


def call_with_retry(
    fn: Callable[[], T],
    max_attempts: int = 3,
    base_delay_s: float = 2.0,
    sleep: Callable[[float], None] = time.sleep,
) -> tuple[T, int]:
    """Run ``fn`` and return ``(result, attempts)``.

    Non-retryable errors propagate immediately; retryable ones are retried with
    exponential backoff and, when exhausted, raised as ``RetryExhausted`` so the
    caller can log the number of attempts.
    """
    for attempt in range(1, max_attempts + 1):
        try:
            return fn(), attempt
        except Exception as exc:
            if is_fatal(exc):
                raise FatalProviderError(f"{type(exc).__name__}: {exc}") from exc
            if not is_retryable(exc):
                raise RetryExhausted(attempt, exc) from exc
            if attempt == max_attempts:
                raise RetryExhausted(attempt, exc) from exc
            sleep(base_delay_s * 2 ** (attempt - 1))
    raise AssertionError("unreachable")
