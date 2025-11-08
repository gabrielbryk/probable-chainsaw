from __future__ import annotations

import sys
from pathlib import Path
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field, model_validator


REPO_ROOT = Path(__file__).resolve().parents[5]
if str(REPO_ROOT) not in sys.path:
    sys.path.append(str(REPO_ROOT))


class ContextPackInput(BaseModel):
    """Input schema for the context pack tool."""

    files: list[str] = Field(
        ...,
        description="List of repository-relative file paths to include in the context bundle.",
    )
    max_chars_per_file: int = Field(
        4000,
        description="Maximum number of characters to include from each file.",
        ge=500,
        le=20000,
    )

    @model_validator(mode="after")
    def _dedupe_files(self) -> "ContextPackInput":
        self.files = list(dict.fromkeys(self.files))
        return self


class ContextPackTool(BaseTool):
    name: str = "context_pack_tool"
    description: str = (
        "Reads the specified documentation files from the repository and returns a "
        "concise context bundle (trimmed to max_chars_per_file) for agents to reference."
    )
    args_schema: Type[BaseModel] = ContextPackInput

    def _run(self, files: list[str], max_chars_per_file: int = 4000) -> str:
        snippets: list[str] = []
        for rel_path in files:
            path = (REPO_ROOT / rel_path).resolve()
            if not path.is_file():
                snippets.append(f"[Missing file] {rel_path}")
                continue
            try:
                text = path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                snippets.append(f"[Unreadable file encoding] {rel_path}")
                continue
            trimmed = text.strip()
            if len(trimmed) > max_chars_per_file:
                trimmed = trimmed[: max_chars_per_file].rsplit("\n", 1)[0]
                trimmed += "\n...[truncated]..."
            snippets.append(f"### {rel_path}\n{trimmed}")
        return "\n\n".join(snippets)
