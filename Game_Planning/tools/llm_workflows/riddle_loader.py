"""Helpers for reading the current riddle markdown files."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List

EXCLUDE_DIR_NAMES = {
    "Archived_Drafts",
    "Interactive_Riddles",
    "Prompt_Templates",
}

EXCLUDE_FILE_SUFFIXES = {"Template", "Examples"}


@dataclass(slots=True)
class RiddleFile:
    """Lightweight representation of a riddle markdown file."""

    name: str
    path: Path
    content: str


def load_riddle_files(root: str | Path | None = None) -> List[RiddleFile]:
    """Return all riddle markdown files that should be evaluated."""

    root_path = Path(root or Path("02_Riddle_Content")).resolve()
    if not root_path.exists():
        raise FileNotFoundError(f"Could not find riddle directory at {root_path}")

    riddle_files: list[RiddleFile] = []
    for md_path in sorted(root_path.rglob("*.md")):
        if any(part in EXCLUDE_DIR_NAMES for part in md_path.parts):
            continue
        if any(md_path.stem.endswith(suffix) for suffix in EXCLUDE_FILE_SUFFIXES):
            continue

        # only include primary clue files (folder name matches filename) and ignore root docs
        if md_path.parent == root_path:
            continue
        if md_path.parent.name != md_path.stem:
            continue

        riddle_files.append(
            RiddleFile(name=md_path.stem, path=md_path, content=md_path.read_text())
        )
    return riddle_files
