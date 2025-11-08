from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

REPO_ROOT = Path(__file__).resolve().parents[5]
PLACEMENT_SUMMARY = REPO_ROOT / "crew_ai" / "workspace" / "crew_outputs" / "placement_updates.md"
PLACEMENT_SUMMARY.parent.mkdir(parents=True, exist_ok=True)
if not PLACEMENT_SUMMARY.exists():
    PLACEMENT_SUMMARY.write_text("# Placement Updates\n\n", encoding="utf-8")


class PlacementUpdateInput(BaseModel):
    riddle_name: str = Field(..., description="Which riddle placement is being updated.")
    summary: str = Field(..., description="One-line description of the change.")
    details: str = Field("", description="Additional notes (safety, materials, room adjustments).")


class PlacementUpdateTool(BaseTool):
    name: str = "placement_update_tool"
    description: str = "Logs placement-map changes so humans can merge them into Placement_Map.md."
    args_schema: Type[BaseModel] = PlacementUpdateInput

    def _run(self, riddle_name: str, summary: str, details: str = "") -> str:
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        note = f"## {riddle_name} ({timestamp})\n- {summary.strip()}\n"
        if details.strip():
            note += f"  - {details.strip()}\n"
        with PLACEMENT_SUMMARY.open("a", encoding="utf-8") as fh:
            fh.write(note + "\n")
        return "Placement update noted."
