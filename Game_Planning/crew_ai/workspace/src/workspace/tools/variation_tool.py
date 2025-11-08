from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

REPO_ROOT = Path(__file__).resolve().parents[5]
if str(REPO_ROOT) not in sys.path:
    sys.path.append(str(REPO_ROOT))

from tools.llm_workflows.evaluate_riddles import evaluate_riddles, filter_riddles_by_name
from tools.llm_workflows.generate_variations import generate_variations
from tools.llm_workflows.riddle_loader import load_riddle_files
from tools.llm_workflows.thinking_presets import resolve_thinking_mode


class VariationToolInput(BaseModel):
    riddle_name: str = Field(
        ...,
        description="Folder/file stem of the riddle to rewrite.",
    )
    thinking_mode: str = Field(
        "balanced",
        description="Thinking preset to use when generating variants.",
    )
    model_alias: str | None = Field(
        default=None,
        description="Optional OpenRouter model alias override.",
    )


class VariationTool(BaseTool):
    name: str = "variation_generation_tool"
    description: str = (
        "Evaluates a riddle and produces up to two refreshed markdown variants that "
        "address the evaluation feedback."
    )
    args_schema: Type[BaseModel] = VariationToolInput

    def _run(
        self,
        riddle_name: str,
        thinking_mode: str = "balanced",
        model_alias: str | None = None,
    ) -> str:
        riddle_dir = REPO_ROOT / "02_Riddle_Content"
        riddle_files = filter_riddles_by_name(
            load_riddle_files(riddle_dir), [riddle_name]
        )
        temperature, max_tokens, reasoning_effort = resolve_thinking_mode(thinking_mode)

        evaluations = evaluate_riddles(
            riddle_files,
            model_alias=model_alias,
            temperature=temperature,
            max_tokens=max_tokens,
            reasoning_effort=reasoning_effort,
        )
        evaluations_by_name = {riddle_name: evaluations[0]}

        variations = generate_variations(
            riddle_files,
            evaluations_by_name,
            model_alias=model_alias,
            temperature=temperature,
            max_tokens=max_tokens,
            reasoning_effort=reasoning_effort,
        )
        if not variations:
            raise ValueError(f"No variants generated for {riddle_name}.")
        return json.dumps(variations[0], indent=2)
