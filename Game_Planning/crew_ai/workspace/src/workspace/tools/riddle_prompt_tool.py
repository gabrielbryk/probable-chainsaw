from __future__ import annotations

from pathlib import Path
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

REPO_ROOT = Path(__file__).resolve().parents[5]
PROMPT_PATH = (
    REPO_ROOT / "02_Riddle_Content/Prompt_Templates/All_Context_Riddle_Ideation_Prompt.md"
)


class RiddlePromptInput(BaseModel):
    riddle_name: str = Field(..., description="Name of the riddle slot (e.g., Crystal_Collection).")
    slot_description: str = Field(
        ...,
        description="One-paragraph description of what this slot should evoke (themes, physical anchor).",
    )
    next_destination: str = Field(
        ...,
        description="Where the riddle should ultimately point (e.g., Flute case).",
    )


class RiddlePromptTool(BaseTool):
    name: str = "riddle_prompt_tool"
    description: str = (
        "Loads the master ideation prompt template and tailors it with the provided slot description "
        "so the agent can ask an LLM for a new riddle draft."
    )
    args_schema: Type[BaseModel] = RiddlePromptInput

    def _run(self, riddle_name: str, slot_description: str, next_destination: str) -> str:
        if not PROMPT_PATH.exists():
            raise FileNotFoundError(f"Prompt template not found at {PROMPT_PATH}")
        template = PROMPT_PATH.read_text(encoding="utf-8").strip()
        tailored = (
            f"### Target Riddle: {riddle_name}\n"
            f"**Slot Notes:** {slot_description}\n"
            f"**Next Destination Cue:** {next_destination}\n\n"
            f"{template}"
        )
        return tailored
