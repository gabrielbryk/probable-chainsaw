from __future__ import annotations

import re
from pathlib import Path
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

REPO_ROOT = Path(__file__).resolve().parents[5]
FLOW_MAP = REPO_ROOT / "02_Riddle_Content/Riddle_Flow_Map.md"


class SequencingAnalyzerInput(BaseModel):
    arc_change_notes: str = Field(
        "",
        description="Notes about the desired sequencing change or optional riddle insertion.",
    )


class SequencingAnalyzerTool(BaseTool):
    name: str = "sequencing_analyzer_tool"
    description: str = "Summarizes the current riddle flow (order, rooms, difficulty) to inform sequencing changes."
    args_schema: Type[BaseModel] = SequencingAnalyzerInput

    def _run(self, arc_change_notes: str = "") -> str:
        if not FLOW_MAP.exists():
            raise FileNotFoundError(f"Riddle_Flow_Map.md not found at {FLOW_MAP}")

        text = FLOW_MAP.read_text(encoding="utf-8")
        report_sections: list[str] = []

        report_sections.append("## Sequential Flow Diagram")
        seq = self._extract_section(text, "## Sequential Flow Diagram", "## Alternative")
        report_sections.append(seq.strip())

        report_sections.append("\n## Riddle Summary Table")
        table = self._extract_table(text)
        report_sections.append(table.strip())

        if arc_change_notes.strip():
            report_sections.append("\n## Requested Change")
            report_sections.append(arc_change_notes.strip())

        return "\n".join(report_sections)

    @staticmethod
    def _extract_section(text: str, start_header: str, end_header: str) -> str:
        pattern = re.compile(
            rf"{re.escape(start_header)}([\s\S]*?)(?={re.escape(end_header)})",
            re.IGNORECASE,
        )
        match = pattern.search(text)
        if match:
            return match.group(1)
        return "Section not found."

    @staticmethod
    def _extract_table(text: str) -> str:
        pattern = re.compile(r"\| # \|.*?\n\|(?:-|\s|\|)+\|\n([\s\S]*?)\n\n", re.MULTILINE)
        match = pattern.search(text)
        if match:
            return match.group(0)
        return "Summary table not found."
