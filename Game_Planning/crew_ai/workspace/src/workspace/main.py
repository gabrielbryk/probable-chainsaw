#!/usr/bin/env python
import os
import sys
import warnings

from datetime import datetime

from pathlib import Path

from workspace.crew import Workspace

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

# This main file is intended to be a way for you to run your
# crew locally, so refrain from adding unnecessary logic into this file.
# Replace with inputs you want to test with, it will automatically
# interpolate any tasks and agents information

OPENROUTER_BASE = "https://openrouter.ai/api/v1"
OUTPUT_DIR = Path(__file__).resolve().parents[2] / "crew_outputs"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def ensure_openrouter_env() -> None:
    """Map existing OpenRouter keys to the OPENAI_* variables CrewAI expects."""

    openrouter_key = os.getenv("OPENAI_API_KEY") or os.getenv("OPENROUTER_API_KEY") or os.getenv("ZEN_OPENROUTER_KEY")
    if openrouter_key and not os.getenv("OPENAI_API_KEY"):
        os.environ["OPENAI_API_KEY"] = openrouter_key
    if not os.getenv("OPENAI_API_BASE"):
        os.environ["OPENAI_API_BASE"] = OPENROUTER_BASE


DEFAULT_CONTEXT_FILES = [
    "01_Narrative_Design/Narrative_Bible.md",
    "02_Riddle_Content/Riddle_Flow_Map.md",
    "02_Riddle_Content/Clue_and_Hint_Structure.md",
    "01_Narrative_Design/Hint_Philosophy.md",
]


def default_inputs() -> dict:
    return {
        "riddle_name": "Crystal_Collection",
        "context_files": DEFAULT_CONTEXT_FILES,
        "current_year": str(datetime.now().year),
        "riddle_name_list": os.getenv(
            "HINT_AUDIT_RIDDLES",
            "Junji Ito Spiral, Ocean Vuong Poetry, Crystal Collection",
        ),
    }


def run():
    """Run the crew."""
    ensure_openrouter_env()
    inputs = default_inputs()
    mode = os.getenv("CREW_MODE", "context_eval").lower()

    try:
        if mode == "new_riddle":
            run_new_riddle_flow(inputs)
        elif mode == "revise_riddle":
            run_revision_flow(inputs)
        elif mode == "hint_audit":
            run_hint_audit_flow(inputs)
        else:
            Workspace().crew().kickoff(inputs=inputs)
    except Exception as e:
        raise Exception(f"An error occurred while running the crew: {e}")


def train():
    """
    Train the crew for a given number of iterations.
    """
    ensure_openrouter_env()
    inputs = default_inputs()
    try:
        Workspace().crew().train(n_iterations=int(sys.argv[1]), filename=sys.argv[2], inputs=inputs)

    except Exception as e:
        raise Exception(f"An error occurred while training the crew: {e}")

def replay():
    """
    Replay the crew execution from a specific task.
    """
    try:
        Workspace().crew().replay(task_id=sys.argv[1])

    except Exception as e:
        raise Exception(f"An error occurred while replaying the crew: {e}")

def test():
    """
    Test the crew execution and returns the results.
    """
    ensure_openrouter_env()
    inputs = default_inputs()

    try:
        Workspace().crew().test(n_iterations=int(sys.argv[1]), eval_llm=sys.argv[2], inputs=inputs)

    except Exception as e:
        raise Exception(f"An error occurred while testing the crew: {e}")

def run_with_trigger():
    """
    Run the crew with trigger payload.
    """
    import json

    if len(sys.argv) < 2:
        raise Exception("No trigger payload provided. Please provide JSON payload as argument.")

    try:
        trigger_payload = json.loads(sys.argv[1])
    except json.JSONDecodeError:
        raise Exception("Invalid JSON payload provided as argument")

    ensure_openrouter_env()
    inputs = {
        "crewai_trigger_payload": trigger_payload,
        **default_inputs(),
    }

    try:
        result = Workspace().crew().kickoff(inputs=inputs)
        return result
    except Exception as e:
        raise Exception(f"An error occurred while running the crew with trigger: {e}")


def run_new_riddle_flow(inputs: dict) -> None:
    workspace = Workspace()
    workspace.creative_studio().kickoff(inputs=inputs)
    workspace.critique_council().kickoff(inputs=inputs)


def run_revision_flow(inputs: dict) -> None:
    workspace = Workspace()
    # Refresh evaluation artifacts first
    workspace.crew().kickoff(inputs=inputs)
    workspace.revision_crew().kickoff(inputs=inputs)
    workspace.integration_crew().kickoff(inputs=inputs)


def run_hint_audit_flow(inputs: dict) -> None:
    workspace = Workspace()
    workspace.hint_audit_crew().kickoff(inputs=inputs)
