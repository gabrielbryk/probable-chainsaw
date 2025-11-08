from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

REPO_ROOT = Path(__file__).resolve().parents[5]
ROADMAP_NOTES = REPO_ROOT / "crew_ai" / "workspace" / "crew_outputs" / "roadmap_notes.md"
ROADMAP_NOTES.parent.mkdir(parents=True, exist_ok=True)
if not ROADMAP_NOTES.exists():
    ROADMAP_NOTES.write_text("# Roadmap Notes\n\n", encoding="utf-8")


class RoadmapNoteInput(BaseModel):
    summary: str = Field(..., description="One sentence summary of the change or TODO.")
    details: str = Field("", description="Any additional context or checklist items.")


class RoadmapNoteTool(BaseTool):
    name: str = "roadmap_note_tool"
    description: str = (
        "Appends a note to crew_outputs/roadmap_notes.md for later transcription into PROJECT_ROADMAP."
    )
    args_schema: Type[BaseModel] = RoadmapNoteInput

    def _run(self, summary: str, details: str = "") -> str:
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        note = f"- [{timestamp}] {summary}"
        if details.strip():
            note += f"\n  - {details.strip()}"
        with ROADMAP_NOTES.open("a", encoding="utf-8") as fh:
            fh.write(note + "\n")
        return "Roadmap note recorded."
