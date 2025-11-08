# Workspace Crew

Welcome to the Workspace Crew project, powered by [crewAI](https://crewai.com). This template is designed to help you set up a multi-agent AI system with ease, leveraging the powerful and flexible framework provided by crewAI. Our goal is to enable your agents to collaborate effectively on complex tasks, maximizing their collective intelligence and capabilities.

## Installation

Ensure you have Python >=3.10 <3.14 installed on your system. This project uses [UV](https://docs.astral.sh/uv/) for dependency management and package handling, offering a seamless setup and execution experience.

First, if you haven't already, install uv:

```bash
pip install uv
```

Next, navigate to your project directory and install the dependencies:

(Optional) Lock the dependencies and install them by using the CLI command:
```bash
crewai install
```
### Customizing

**Add your `OPENAI_API_KEY` into the `.env` file**

- Modify `src/workspace/config/agents.yaml` to define your agents
- Modify `src/workspace/config/tasks.yaml` to define your tasks
- Modify `src/workspace/crew.py` to add your own logic, tools and specific args
- Modify `src/workspace/main.py` to add custom inputs for your agents and tasks

## Running the Project

To kickstart your crew of AI agents and begin task execution, run this from the root folder of your project:

```bash
cd crew_ai/workspace
uv run crewai run
```

This command initializes the workspace crew with the scavenger-hunt agents. The default flow now:

1. Assembles a canon context pack for `Crystal_Collection` using the Narrative Bible, Flow Map, Hint Philosophy, and Clue template.
2. Runs the OpenRouter-backed evaluation workflow to score that riddle.
3. Summarizes scores, must-fix items, and optional rewrite ideas.

Override the target riddle or context files by editing `src/workspace/main.py` (CLI flags coming in a later phase).

### Provider & Model Setup

CrewAI expects OpenAI-style env vars even when routing through OpenRouter. Before running:

```bash
export OPENROUTER_API_KEY=sk-or-...   # already available in the root repo env
cd crew_ai/workspace
uv run crewai run
```

`main.py` automatically maps `OPENROUTER_API_KEY` (or `ZEN_OPENROUTER_KEY`) → `OPENAI_API_KEY` and enforces `OPENAI_API_BASE=https://openrouter.ai/api/v1`.

Each agent uses its own OpenRouter model, configurable via `.env`:

```
CONTEXT_LLM_MODEL=openai/gpt-4o-mini
CRITIC_LLM_MODEL=openai/gpt-4o
```

Change those IDs to adjust speed/cost per agent.

### New Riddle Flow (Phase 2)

We now have prototype “Creative Studio” and “Critique Council” crews. Kick off the full pipeline (context → brief → draft → critique) by setting:

```bash
export CREW_MODE=new_riddle
cd crew_ai/workspace
uv run crewai run
```

Outputs land in `crew_outputs/` (brief, draft, critique memo, hint review, connection report). Switch back to the baseline evaluation run by unsetting `CREW_MODE`.

See `crew_ai/docs/CrewAI_Roadmap.md` for the broader rollout plan.

### Revision Flow (Phase 3)

To auto-generate revision plans + integration notes:

```bash
export CREW_MODE=revise_riddle
cd crew_ai/workspace
uv run crewai run
```

This runs:
1. Baseline evaluation crew (refresh context + scores)
2. Revision crew (plan + produce updated markdown in `crew_outputs/revised_riddle.md`)
3. Integration crew (doc patch proposals + roadmap notes in `crew_outputs/doc_patches/` and `crew_outputs/roadmap_notes.md`)

### Hint Audit Flow

To review/repair hint ladders across multiple riddles:

```bash
export CREW_MODE=hint_audit
export HINT_AUDIT_RIDDLES="Crystal Collection, Flute Music"   # optional override
cd crew_ai/workspace
uv run crewai run
```

Outputs: `crew_outputs/hint_audit.md` plus `hint_fixes.md`.

## Understanding Your Crew

The workspace Crew is composed of multiple AI agents, each with unique roles, goals, and tools. These agents collaborate on a series of tasks, defined in `config/tasks.yaml`, leveraging their collective skills to achieve complex objectives. The `config/agents.yaml` file outlines the capabilities and configurations of each agent in your crew.

## Support

For support, questions, or feedback regarding the Workspace Crew or crewAI.
- Visit our [documentation](https://docs.crewai.com)
- Reach out to us through our [GitHub repository](https://github.com/joaomdmoura/crewai)
- [Join our Discord](https://discord.com/invite/X4JWnZnxPb)
- [Chat with our docs](https://chatg.pt/DWjSBZn)

Let's create wonders together with the power and simplicity of crewAI.
