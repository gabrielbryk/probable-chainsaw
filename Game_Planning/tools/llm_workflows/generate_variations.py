"""CLI workflow that produces revised riddle variants based on evaluation feedback."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Iterable, Mapping

from .openrouter_client import (
    ALLOWED_MODELS,
    OpenRouterClient,
    ensure_json_object,
)
from .riddle_loader import RiddleFile, load_riddle_files
from .evaluate_riddles import filter_riddles_by_name
from .thinking_presets import (
    DEFAULT_THINKING_MODE,
    THINKING_PRESETS,
    resolve_thinking_mode,
)

VARIATION_SYSTEM_PROMPT = """You are the same planning assistant who co-wrote the riddles.
Use the provided evaluation feedback and original riddle text to draft up to two refreshed
variants that address the recommendations without introducing new prizes, gifts, or personal
anecdotes. Maintain Joy's aesthetic (dark beauty + playful wonder), keep the Level 3-5
ladder, and ensure hints + accepted answers follow the template. Respond with JSON ONLY,
cap output at 500 tokens, and avoid any extra commentary."""


def build_variation_prompt(
    riddle: RiddleFile, evaluation: Mapping[str, object]
) -> str:
    """Combine original markdown with structured feedback for rewriting."""

    improvements = evaluation.get("improvement_recommendations", [])
    must_fix = evaluation.get("must_fix", [])
    return (
        f"RIDDLE FILE: {riddle.path}\n---\n{riddle.content}\n---\n"
        f"EVALUATION DATA: {json.dumps(evaluation, indent=2)}\n"
        "TASK: Produce JSON with fields "
        '{"riddle_name": str, "variants": [ {"summary": str, "updated_markdown": str} ]}. '
        "Each variant should weave in the improvements listed above. "
        "If an item appears under 'must_fix', treat it as mandatory in both variants."
    )


def load_evaluations(path: Path) -> list[Mapping[str, object]]:
    if not path.exists():
        raise FileNotFoundError(
            f"Cannot find evaluation data at {path}. Run evaluate_riddles.py first."
        )
    return json.loads(path.read_text())


def map_evaluations_by_name(
    evaluations: Iterable[Mapping[str, object]],
) -> dict[str, Mapping[str, object]]:
    return {str(item["riddle_name"]): item for item in evaluations}


def generate_variations(
    riddle_files: Iterable[RiddleFile],
    evaluations_by_name: Mapping[str, Mapping[str, object]],
    *,
    model_alias: str | None = None,
    temperature: float = 0.4,
    max_tokens: int = 1500,
    reasoning_effort: str | None = None,
) -> list[Mapping[str, object]]:
    client = OpenRouterClient(model_alias=model_alias)
    outputs: list[Mapping[str, object]] = []
    for riddle in riddle_files:
        evaluation = evaluations_by_name.get(riddle.name)
        if not evaluation:
            print(f"Skipping {riddle.name}: no evaluation data found.")
            continue

        messages = [
            {"role": "system", "content": VARIATION_SYSTEM_PROMPT},
            {"role": "user", "content": build_variation_prompt(riddle, evaluation)},
        ]
        response = client.complete(
            messages,
            temperature=temperature,
            max_tokens=max_tokens,
            reasoning_effort=reasoning_effort,
            response_format={"type": "json_object"},
        )
        assistant_text = response["choices"][0]["message"]["content"]
        parsed = ensure_json_object(assistant_text)
        outputs.append(parsed)
    return outputs


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate revised riddle variants informed by evaluation feedback."
    )
    parser.add_argument(
        "--evaluations",
        type=Path,
        default=Path("tools/llm_workflows/riddle_evaluations.json"),
        help="Path to JSON produced by evaluate_riddles.py",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("tools/llm_workflows/riddle_variations.json"),
        help="Where to store the generated variants JSON.",
    )
    parser.add_argument(
        "--model",
        type=str,
        choices=sorted(ALLOWED_MODELS.keys()),
        help="Select one of the pre-approved model aliases.",
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
        help="Limit generation to specific riddle names.",
    )
    args = parser.parse_args()

    temperature, max_tokens, reasoning_effort = resolve_thinking_mode(
        args.thinking_mode,
        override_temperature=args.temperature,
        override_max_tokens=args.max_tokens,
    )

    evaluations = load_evaluations(args.evaluations)
    evaluations_by_name = map_evaluations_by_name(evaluations)
    riddles = filter_riddles_by_name(load_riddle_files(), args.riddles)
    outputs = generate_variations(
        riddles,
        evaluations_by_name,
        model_alias=args.model,
        temperature=temperature,
        max_tokens=max_tokens,
        reasoning_effort=reasoning_effort,
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(outputs, indent=2))
    print(f"Wrote variations for {len(outputs)} riddles to {args.output}")


if __name__ == "__main__":
    main()
