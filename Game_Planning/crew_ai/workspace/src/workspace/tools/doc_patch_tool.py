from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

REPO_ROOT = Path(__file__).resolve().parents[5]
PATCH_DIR = REPO_ROOT / "crew_ai" / "workspace" / "crew_outputs" / "doc_patches"
PATCH_DIR.mkdir(parents=True, exist_ok=True)


class DocPatchInput(BaseModel):
    target_file: str = Field(..., description="Repository-relative path of the file to update.")
    rationale: str = Field(..., description="Why this change is needed.")
    patch_text: str = Field(..., description="Proposed patch or replacement text.")


class DocPatchTool(BaseTool):
    name: str = "doc_patch_tool"
    description: str = (
        "Records a proposed documentation patch (with rationale) into crew_outputs/doc_patches "
        "so humans can review/apply it later."
    )
    args_schema: Type[BaseModel] = DocPatchInput

    def _run(self, target_file: str, rationale: str, patch_text: str) -> str:
        timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
        safe_name = Path(target_file).as_posix().replace("/", "__")
        out_path = PATCH_DIR / f"{timestamp}__{safe_name}.md"
        out_path.write_text(
            f"# Patch Proposal for {target_file}\n\n"
            f"**Rationale:** {rationale}\n\n"
            f"```\n{patch_text.strip()}\n```\n",
            encoding="utf-8",
        )
        return f"Recorded patch proposal at {out_path}"
