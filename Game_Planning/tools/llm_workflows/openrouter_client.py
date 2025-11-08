"""Thin wrapper around the OpenRouter chat-completions endpoint."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Mapping, MutableMapping, Sequence

import requests


ALLOWED_MODELS: dict[str, str] = {
    "gemini-pro": "google/gemini-2.5-pro",
    "claude-sonnet": "anthropic/claude-3.5-sonnet",
    "claude-haiku": "anthropic/claude-3.5-haiku",
    "gpt-4o-mini": "openai/gpt-4o-mini",
    "mistral-large": "mistralai/mistral-large-latest",
}
DEFAULT_MODEL_ALIAS = "gemini-pro"


def resolve_model_choice(model_alias: str | None) -> str:
    """Resolve an allowed alias (or pre-approved ID) to OpenRouter's model string."""

    candidates = [
        model_alias,
        os.getenv("OPENROUTER_MODEL_ALIAS"),
        os.getenv("OPENROUTER_MODEL"),
        DEFAULT_MODEL_ALIAS,
    ]
    for candidate in candidates:
        if not candidate:
            continue
        normalized = candidate.strip()
        alias_key = normalized.lower()
        if alias_key in ALLOWED_MODELS:
            return ALLOWED_MODELS[alias_key]
        if normalized in ALLOWED_MODELS.values():
            return normalized

    allowed = ", ".join(sorted(ALLOWED_MODELS))
    raise ValueError(
        f"Unsupported model '{model_alias}'. Allowed aliases: {allowed}. "
        "Set OPENROUTER_MODEL_ALIAS to one of these values or pass --model with an alias."
    )


class OpenRouterClient:
    """Simple helper for sending chat-completion requests to OpenRouter."""

    def __init__(
        self,
        api_key: str | None = None,
        *,
        model_alias: str | None = None,
        base_url: str | None = None,
        default_headers: Mapping[str, str] | None = None,
    ) -> None:
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        if not self.api_key:
            raise RuntimeError(
                "Missing OPENROUTER_API_KEY. Export it before running these workflows."
            )

        self.model = resolve_model_choice(model_alias)
        self.base_url = base_url or os.getenv(
            "OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1/chat/completions"
        )
        self.headers: MutableMapping[str, str] = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        if default_headers:
            self.headers.update(default_headers)

    def complete(
        self,
        messages: Sequence[Mapping[str, str]],
        *,
        model_alias: str | None = None,
        temperature: float = 0.2,
        max_tokens: int = 1200,
        response_format: Mapping[str, str] | None = None,
        reasoning_effort: str | None = None,
    ) -> Mapping[str, object]:
        """Send a chat-completion request and return parsed JSON."""

        resolved_model = (
            resolve_model_choice(model_alias) if model_alias else self.model
        )
        payload: dict[str, object] = {
            "model": resolved_model,
            "messages": list(messages),
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if response_format:
            payload["response_format"] = response_format
        chosen_effort = reasoning_effort
        if not chosen_effort and resolved_model.startswith("google/gemini"):
            chosen_effort = "low"
        if chosen_effort:
            payload["reasoning"] = {"effort": chosen_effort}

        response = requests.post(
            self.base_url, headers=self.headers, data=json.dumps(payload), timeout=60
        )
        response.raise_for_status()
        return response.json()


def ensure_json_object(content: str) -> Mapping[str, object]:
    """Parse assistant output as JSON, raising a helpful error on failure."""

    text = content.strip()
    if text.startswith("```"):
        # remove leading ```json fences and trailing ```
        lines = text.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:  # pragma: no cover - defensive log helper
        debug_path = Path("tools/llm_workflows/_last_llm_response.txt")
        debug_path.write_text(text)
        raise ValueError(
            "Assistant response was not valid JSON. "
            f"Raw response saved to {debug_path} for inspection."
        ) from exc
