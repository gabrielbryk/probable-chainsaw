from __future__ import annotations

from pathlib import Path
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

REPO_ROOT = Path(__file__).resolve().parents[5]
PLACEMENT_FILE = REPO_ROOT / "04_Physical_Production/Placement_Map.md"
CRAFTING_FILE = REPO_ROOT / "04_Physical_Production/Crafting_Plan.md"


class PhysicalPlanInput(BaseModel):
    riddle_name: str = Field(..., description="Name of the riddle to inspect (e.g., Crystal Collection).")


class PhysicalPlanTool(BaseTool):
    name: str = "physical_plan_tool"
    description: str = (
        "Extracts placement and crafting guidance for a riddle from Placement_Map.md and Crafting_Plan.md."
    )
    args_schema: Type[BaseModel] = PhysicalPlanInput

    def _run(self, riddle_name: str) -> str:
        placement = self._extract_section(PLACEMENT_FILE, riddle_name)
        crafting = self._extract_section(CRAFTING_FILE, riddle_name)
        return (
            f"## Placement Map Notes ({riddle_name})\n{placement}\n\n"
            f"## Crafting Plan Notes ({riddle_name})\n{crafting}"
        )

    @staticmethod
    def _extract_section(path: Path, riddle_name: str) -> str:
        if not path.exists():
            return f"[Missing file: {path}]"

        lines = path.read_text(encoding="utf-8").splitlines()
        output_lines: list[str] = []
        capture = False
        for line in lines:
            if line.startswith("###") and riddle_name.lower() in line.lower():
                capture = True
                output_lines.append(line)
                continue
            if capture and line.startswith("### ") and riddle_name.lower() not in line.lower():
                break
            if capture:
                output_lines.append(line)
        if not output_lines:
            return f"[No specific section found for {riddle_name}]"
        return "\n".join(output_lines).strip()
