"""Predefined reasoning profiles for OpenRouter workflows."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping


@dataclass(frozen=True, slots=True)
class ThinkingPreset:
    name: str
    temperature: float
    max_tokens: int
    reasoning_effort: str
    description: str


THINKING_PRESETS: Mapping[str, ThinkingPreset] = {
    "quick": ThinkingPreset(
        name="quick",
        temperature=0.05,
        max_tokens=750,
        reasoning_effort="low",
        description="Fast, low-variance reasoning for concise scoring passes.",
    ),
    "balanced": ThinkingPreset(
        name="balanced",
        temperature=0.18,
        max_tokens=1400,
        reasoning_effort="medium",
        description="Default blend of depth and focus for most evaluations.",
    ),
    "deep": ThinkingPreset(
        name="deep",
        temperature=0.35,
        max_tokens=2200,
        reasoning_effort="high",
        description="Higher creativity and allowance for extended reasoning.",
    ),
}

DEFAULT_THINKING_MODE = "balanced"


def resolve_thinking_mode(
    alias: str | None,
    *,
    override_temperature: float | None = None,
    override_max_tokens: int | None = None,
) -> tuple[float, int, str]:
    """Return (temperature, max_tokens, reasoning_effort) honoring overrides."""

    key = (alias or DEFAULT_THINKING_MODE).lower()
    if key not in THINKING_PRESETS:
        allowed = ", ".join(sorted(THINKING_PRESETS))
        raise ValueError(
            f"Unknown thinking mode '{alias}'. Choose from: {allowed}."
        )
    preset = THINKING_PRESETS[key]
    temperature = (
        override_temperature if override_temperature is not None else preset.temperature
    )
    max_tokens = (
        override_max_tokens if override_max_tokens is not None else preset.max_tokens
    )
    return temperature, max_tokens, preset.reasoning_effort
