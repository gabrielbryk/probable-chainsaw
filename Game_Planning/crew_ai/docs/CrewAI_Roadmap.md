# CrewAI Roadmap & Status

This document tracks the staged rollout of the scavenger-hunt automation stack.

## Phase 1 – Context + Evaluation (✅ complete)
- **Crews**: “Workspace” crew with `context_curator` and `riddle_reviewer`.
- **Tools**: `ContextPackTool`, `EvaluateRiddleTool`, `VariationTool`.
- **Outputs**: Canon bundle + analyst brief for a single riddle.
- **Status**: Running via `uv run crewai run` (requires OpenRouter key).

## Phase 2 – Creative & Critique Expansion (✅ complete)
Goal: ideate and critique new/updated riddles without leaving CrewAI.

- **Crews to add**
  1. **Creative Riddle Studio**: Canon Archivist + Experience Architect + Riddle Ideator.
  2. **Critique Council**: Riddle Critic + Hint QA Specialist + Connection Mapper.
- **Tools**
  - Prompt harness wrapping `02_Riddle_Content/Prompt_Templates/All_Context_Riddle_Ideation_Prompt.md`.
  - Connection mapping script to compare motifs, rooms, emotional beats.
  - Reusable flow to call the scoring CLI mid-ideation (sanity check).
- **Flows**
  - `flow_new_riddle`: Context pack → Creative Crew → Critique Crew → loop until clarity/hint ≥ threshold.
- **Deliverable**
  - Single CLI command (or flow kickoff) that produces a vetted riddle draft + critique log.

## Phase 3 – Revision & Integration (✅ complete)
- **Crews**: Revision Scribe team (✅) and Flow Integrator (✅).
- **Tools**: Doc patch tool (✅), roadmap note tool (✅), placement/testing note loggers (✅).
- **Flows**: `flow_improve_riddle` prototype via `CREW_MODE=revise_riddle`; hint audit flow via `CREW_MODE=hint_audit`.
- **Next**: tie placement/testing notes back into canonical docs automatically (part of Phase 4).

## Phase 4 – Sequencing & Physical Ops (🚧 current)
- **Crews to add**:
  1. Experience Architect sequencing crew for arc reshuffles / optional riddle insertion.
  2. Production Ops crew to sync Crafting Plan, Placement Map, and Full Run Test Plan.
- **Tools/Flows**:
  - Sequencing analyzer + room/beat validator.
  - Placement validator tied to Crafting Plan safety notes.
  - `flow_arc_reschedule` (adjust order, optional riddles).
  - `flow_physical_sync` (update crafting/testing docs + checklists).

## Phase 5 – Flow-of-Crews + HITL (🔜)
- Supervisory flows (“Build-New-Riddle Pipeline”, “Mass Hint Audit”) with human checkpoints before writing canonical docs.
- Telemetry via CrewAI trace links + outputs in `crew_outputs/`.

## Phase 6 – UX & Extensibility (🔜)
- CLI flags / web UI to choose target riddle, difficulty, context.
- Template for cloning workspace to future projects.

---

### Current Action Items (Phase 2)
1. Implement Creative Riddle Studio agents + tasks.
2. Implement Critique Council agents + tools (connection mapper, hint QA).
3. Wire `flow_new_riddle` orchestrating the two crews with auto-loop + thresholds.
4. Provide CLI entrypoint or flow kickoff script for “Create & evaluate riddle”.
