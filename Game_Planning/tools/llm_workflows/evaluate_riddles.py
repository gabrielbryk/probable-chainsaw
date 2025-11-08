"""CLI workflow that sends each riddle through an OpenRouter evaluation pass."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable, List, Mapping

from .openrouter_client import (
    ALLOWED_MODELS,
    OpenRouterClient,
    ensure_json_object,
)
from .thinking_presets import (
    DEFAULT_THINKING_MODE,
    THINKING_PRESETS,
    resolve_thinking_mode,
)
from .riddle_loader import RiddleFile, load_riddle_files

SYSTEM_PROMPT = """You are an award-winning scavenger-hunt narrative lead.
Evaluate the provided riddle for: (1) clarity & poetic tone, (2) thematic resonance with Joy's
real interests, (3) difficulty laddering between Level 3-5 text, (4) hint and answer coverage,
and (5) production-specific risks (placement, materials). Respond with JSON ONLY (no commentary),
keep the response under 400 tokens, and adhere strictly to this shape:
{
  "riddle_name": str,
  "scores": {
     "clarity": 0-5,
     "theme_alignment": 0-5,
     "difficulty_balance": 0-5,
     "hint_readiness": 0-5,
     "physical_feasibility": 0-5
  },
  "overall_feedback": str,
  "improvement_recommendations": [str, ...],
  "must_fix": [str, ...]   # blockers required before playtest
}
Keep feedback specific and action-oriented."""


def build_user_prompt(riddle: RiddleFile) -> str:
    """Embed file metadata and contents in a single string prompt."""

    return (
        f"RIDDLE_ID (use exactly in your JSON): {riddle.name}\n"
        f"RIDDLE FILE: {riddle.path}\n"
        f"---\n"
        f"{riddle.content}\n"
        f"---\n"
        "Use the matrix described above to critique this riddle. "
        "Assume the hunt lasts 30-45 minutes and Joy is the solver."
    )


def filter_riddles_by_name(
    riddle_files: Iterable[RiddleFile], names: Iterable[str] | None
) -> list[RiddleFile]:
    if not names:
        return list(riddle_files)
    normalized = {name.strip().lower() for name in names if name}
    if not normalized:
        return list(riddle_files)
    filtered = [rf for rf in riddle_files if rf.name.lower() in normalized]
    if not filtered:
        raise ValueError(
            f"No riddles matched the provided names: {', '.join(sorted(normalized))}"
        )
    return filtered


def evaluate_riddles(
    riddle_files: Iterable[RiddleFile],
    *,
    model_alias: str | None = None,
    temperature: float = 0.15,
    max_tokens: int = 900,
    reasoning_effort: str | None = None,
) -> list[Mapping[str, object]]:
    """Send each riddle through the evaluator LLM."""

    client = OpenRouterClient(model_alias=model_alias)
    results: list[Mapping[str, object]] = []
    for riddle in riddle_files:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(riddle)},
        ]
        raw_response = client.complete(
            messages,
            temperature=temperature,
            max_tokens=max_tokens,
            reasoning_effort=reasoning_effort,
            response_format={"type": "json_object"},
        )
        assistant_text = raw_response["choices"][0]["message"]["content"]
        parsed = ensure_json_object(assistant_text)
        results.append(parsed)
    return results


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Evaluate all riddles via OpenRouter and store structured feedback."
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("tools/llm_workflows/riddle_evaluations.json"),
        help="Path to write the aggregated evaluation JSON.",
    )
    parser.add_argument(
        "--model",
        type=str,
        choices=sorted(ALLOWED_MODELS.keys()),
        help="Select one of the pre-approved OpenRouter models (alias).",
    )
    parser.add_argument(
        "--temperature",
        type=float,
        default=None,
        help="Override the preset temperature (set automatically by thinking mode).",
    )
    parser.add_argument(
        "--max-tokens",
        type=int,
        default=None,
        help="Override the preset max token budget.",
    )
    parser.add_argument(
        "--thinking-mode",
        type=str,
        choices=sorted(THINKING_PRESETS.keys()),
        default=DEFAULT_THINKING_MODE,
        help="Select the reasoning depth preset.",
    )
    parser.add_argument(
        "--riddle",
        action="append",
        dest="riddles",
        help="Limit evaluation to specific riddle names (folder names).",
    )
    args = parser.parse_args()

    temperature, max_tokens, reasoning_effort = resolve_thinking_mode(
        args.thinking_mode,
        override_temperature=args.temperature,
        override_max_tokens=args.max_tokens,
    )

    riddle_files = filter_riddles_by_name(load_riddle_files(), args.riddles)
    results = evaluate_riddles(
        riddle_files,
        model_alias=args.model,
        temperature=temperature,
        max_tokens=max_tokens,
        reasoning_effort=reasoning_effort,
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(results, indent=2))
    print(f"Wrote evaluations for {len(results)} riddles to {args.output}")


if __name__ == "__main__":
    main()
