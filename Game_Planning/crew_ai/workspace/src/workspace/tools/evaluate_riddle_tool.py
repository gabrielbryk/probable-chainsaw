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
from tools.llm_workflows.riddle_loader import load_riddle_files


class EvaluateRiddleInput(BaseModel):
    riddle_name: str = Field(
        ...,
        description="Folder/file stem of the riddle to evaluate (e.g., 'Crystal_Collection').",
    )
    thinking_mode: str = Field(
        "balanced",
        description="Thinking preset to use (quick, balanced, or deep).",
    )
    model_alias: str | None = Field(
        default=None,
        description="Optional OpenRouter model alias to override (defaults to repo config).",
    )


class EvaluateRiddleTool(BaseTool):
    name: str = "evaluate_riddle_tool"
    description: str = (
        "Runs the OpenRouter-based evaluation workflow for a specific riddle "
        "and returns the structured JSON feedback (scores, recommendations, must-fix list)."
    )
    args_schema: Type[BaseModel] = EvaluateRiddleInput

    def _run(
        self,
        riddle_name: str,
        thinking_mode: str = "balanced",
        model_alias: str | None = None,
    ) -> str:
        """Evaluate a single riddle and return JSON feedback."""

        riddle_dir = REPO_ROOT / "02_Riddle_Content"
        riddle_files = filter_riddles_by_name(
            load_riddle_files(riddle_dir), [riddle_name]
        )
        from tools.llm_workflows.thinking_presets import resolve_thinking_mode

        temperature, max_tokens, reasoning_effort = resolve_thinking_mode(thinking_mode)
        results = evaluate_riddles(
            riddle_files,
            model_alias=model_alias,
            temperature=temperature,
            max_tokens=max_tokens,
            reasoning_effort=reasoning_effort,
        )
        if not results:
            raise ValueError(f"No evaluation result produced for {riddle_name}.")
        return json.dumps(results[0], indent=2)
