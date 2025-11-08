from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

REPO_ROOT = Path(__file__).resolve().parents[5]
TESTING_NOTES = REPO_ROOT / "crew_ai" / "workspace" / "crew_outputs" / "testing_notes.md"
TESTING_NOTES.parent.mkdir(parents=True, exist_ok=True)
if not TESTING_NOTES.exists():
    TESTING_NOTES.write_text("# Testing Notes\n\n", encoding="utf-8")


class TestingNoteInput(BaseModel):
    riddle_name: str = Field(..., description="Which riddle or phase the test note applies to.")
    observation: str = Field(..., description="Observation or issue encountered during testing.")
    action: str = Field("", description="Recommended fix or follow-up action.")


class TestingNoteTool(BaseTool):
    name: str = "testing_note_tool"
    description: str = "Appends structured testing notes for later inclusion in Full_Run_Test_Plan.md."
    args_schema: Type[BaseModel] = TestingNoteInput

    def _run(self, riddle_name: str, observation: str, action: str = "") -> str:
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        line = f"- [{timestamp}] **{riddle_name}**: {observation.strip()}"
        if action.strip():
            line += f"\n  - Action: {action.strip()}"
        with TESTING_NOTES.open("a", encoding="utf-8") as fh:
            fh.write(line + "\n")
        return "Testing note recorded."
