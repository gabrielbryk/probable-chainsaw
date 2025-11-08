from __future__ import annotations

import re
from pathlib import Path
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

REPO_ROOT = Path(__file__).resolve().parents[5]
FLOW_MAP = REPO_ROOT / "02_Riddle_Content/Riddle_Flow_Map.md"


class ConnectionMapInput(BaseModel):
    riddle_name: str = Field(..., description="Name of the riddle to analyze (e.g., Crystal Collection).")


class ConnectionMapTool(BaseTool):
    name: str = "connection_map_tool"
    description: str = (
        "Reads the Riddle_Flow_Map and summarizes where the given riddle sits in the arc "
        "along with its theme, difficulty, and neighboring beats."
    )
    args_schema: Type[BaseModel] = ConnectionMapInput

    def _run(self, riddle_name: str) -> str:
        if not FLOW_MAP.exists():
            raise FileNotFoundError(f"Flow map file missing at {FLOW_MAP}")

        text = FLOW_MAP.read_text(encoding="utf-8")
        summary_lines: list[str] = []

        # Search the summary table
        table_match = re.search(
            rf"\|\s*\d+\s*\|\s*{re.escape(riddle_name)}.*",
            text,
            re.IGNORECASE,
        )
        if table_match:
            summary_lines.append("**Summary Table Entry**")
            summary_lines.append(table_match.group(0))

        # Search sequential diagram block
        seq_match = re.search(
            rf"\[\d\].*{re.escape(riddle_name)}[\s\S]+?(?=\n\n|\Z)",
            text,
            re.IGNORECASE,
        )
        if seq_match:
            summary_lines.append("\n**Sequential Diagram Snippet**")
            summary_lines.append(seq_match.group(0).strip())

        # Search thematic mapping section
        thematic_match = re.search(
            rf"### Riddle.*{re.escape(riddle_name)}[\s\S]+?(?:\n---|\Z)",
            text,
            re.IGNORECASE,
        )
        if thematic_match:
            summary_lines.append("\n**Thematic Notes**")
            summary_lines.append(thematic_match.group(0).strip())

        if not summary_lines:
            return f"No explicit mention of '{riddle_name}' found in Riddle_Flow_Map.md."

        return "\n".join(summary_lines)
