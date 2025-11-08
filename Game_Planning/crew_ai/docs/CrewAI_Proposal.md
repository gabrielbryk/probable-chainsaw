# CrewAI Deployment Proposal (v2)

This draft widens the design so we can mix Crews, Flows, and hybrids depending on the task. Instead of insisting on a single orchestration pattern, we outline complementary approaches and when to use each—mirroring the “Evaluating Use Cases for CrewAI” guidance to match complexity and precision requirements for every sub-problem.

---

## 1. Decision Framework Recap

- Our overall hunt planning is **high complexity** (many interdependent steps) and **high precision** (canon constraints, structured docs).
- The CrewAI guide suggests **no single silver bullet**: simple tasks can run as a single Flow; collaborative, multi-stage work benefits from Crews; mission-critical strings of both need Flows that orchestrate multiple Crews + validators.
- We therefore propose a **toolbox**:
  - **Micro Flows** for deterministic actions (e.g., “update roadmap checkbox”).
  - **Specialized Crews** for creative or analytical stages (ideation, critique, sequencing).
  - **Hybrid Flow-of-Crews** for missions that traverse several stages (new riddle introduction, arc reshuffle).
  - **Crews invoking Flows** when a group agent needs to offload part of its work to a structured sub-process (e.g., Critic Crew triggering a scoring Flow that hits the evaluation script).

---

## 2. Modular Building Blocks

### 2.1 Core Agents (Reusable Across Crews)

| Agent | Specialty | Example Solo Flow Tasks |
|-------|----------|--------------------------|
| Canon Archivist | RAG + policy enforcement | `flow_check_canon` (single Flow that returns compliance status) |
| Data Runner | Shell/CLI wrapper | `flow_eval_riddle` (invokes `evaluate_riddles.py`) |
| Ideator | Creative riddle drafting | Typically within creative Crew |
| Critic | Structured review & scoring | Crew or invoked Flow |
| Integrator | Doc updates + change logs | Flow or Crew depending on scope |

Each agent can operate:
1. **Individually inside a Flow** (e.g., Canon Archivist Flow).
2. **Collaboratively inside a Crew** (e.g., Creative Crew = Archivist + Architect + Ideator).
3. **As a Crew that *calls* Flows** (e.g., Critic Crew requests a Flow to run the evaluation CLI).

### 2.2 Named Flows

| Flow | Purpose | Typical Trigger |
|------|---------|-----------------|
| `flow_context_pack` | Gather canonical snippets for a slot | Called before ideation |
| `flow_eval_riddle` | Run OpenRouter scoring (deterministic) | Called by Critic or Supervisor Crew |
| `flow_variation` | Generate revision variants | Called after low score |
| `flow_sync_docs` | Apply diffs to Flow Map & Roadmap | Called post-approval |
| `flow_checkpoint` | Human-in-loop decision | Inserted by supervising Flow |

These flows are deterministic, easier to test, and can be reused by different Crews.

### 2.3 Crew Templates

| Crew | Composition | When to Use | Notes |
|------|-------------|-------------|-------|
| **Creative Crew** | Canon Archivist + Experience Architect + Riddle Ideator | New riddle concepts, alternate variants | Crew ensures context + creativity, can call `flow_eval_riddle` to sanity-check difficulty mid-ideation |
| **Critique Crew** | Riddle Critic + Hint QA Specialist + Connection Mapper | Deep review of existing riddles or sequencing adjustments | Calls scoring Flow, hint-check Flow, returns consolidated report |
| **Revision Crew** | Revision Scribe + Data Runner + Canon Archivist | Apply fixes, regenerate combos, confirm canon | Can spawn `flow_variation` or `flow_sync_docs` |
| **Flow Integrator Crew** | Integrator + Production Ops Liaison | Align flow map, placement map, roadmap, crafting plan | Interacts heavily with deterministic flows to update files safely |

### 2.4 Flow-of-Crews Patterns

1. **New Riddle Flow**:
   - Step 1: `flow_context_pack`
   - Step 2: Creative Crew kickoff
   - Step 3: Critique Crew (auto loops until scores pass thresholds)
   - Step 4: Revision Crew (if needed)
   - Step 5: Flow Integrator Crew
   - Step 6: `flow_checkpoint` for Gabe approval

2. **Arc Reshuffle Flow**:
   - Step 1: Experience Architect (Solo Flow or small Crew)
   - Step 2: Connection Mapper Flow (analysis script)
   - Step 3: Canon Archivist Flow (sanity check)
   - Step 4: Flow Integrator Crew updates docs
   - Step 5: Notify Production Ops via Flow

3. **Hint Audit Flow**:
   - Step 1: Single Flow to pull all riddle docs
   - Step 2: Critique Crew (Hint QA agent leads)
   - Step 3: Revision Crew for any riddle flagged
   - Step 4: Flow Integrator ensures Crafting Plan + Placement Map add new instructions

This layered approach lets us plug in simpler flows when tasks are small, and escalate to multi-agent collaboration when nuance or negotiation is needed.

---

## 3. Example Use Cases + Suggested Patterns

| Use Case | Complexity | Precision | Suggested Pattern |
|----------|------------|-----------|-------------------|
| Quick “polish this riddle” ask | Low | Moderate | Single Critic Flow → Variation Flow |
| Full new riddle creation | High | High | Flow orchestrating Creative + Critique + Revision Crews |
| Mechanical update (e.g., mark roadmap checkbox) | Low | High | Direct Flow (no crew) |
| Re-sequencing the hunt | High | High | Flow-of-Crews (Architect + Critic + Integrator) |
| Brainstorming optional riddles | Medium | Low/Med | Standalone Creative Crew (no heavy flows) |
| Hint ladder mass audit | High | High | Flow to fetch data → Critique Crew (Hint QA) → Flow sync results |

---

## 4. Tooling Inventory

1. **ContextPack Tool** – shared util for Crews/Flows.
2. **RiddlePrompt Tool** – ensures Ideator stays on template.
3. **Eval Script Tool** – exposes python CLI via Flow.
4. **Variation Script Tool** – same as above for rewrites.
5. **Doc Patch Tool** – ensures edits are apply_patch compliant.
6. **Roadmap Update Flow** – adds checkboxes/tasks.
7. **Placement Map Flow** – injects new placements referencing Crafting Plan.
8. **Checkpoint Hook** – Flow step for HITL approval before writing to repo.

Flows invoking these tools give us precise control; Crews provide the higher-level reasoning to decide when/how to call them.

---

## 5. Governance & Safety

- **Canon-first**: even when running a simple Flow, optionally call Canon Archivist for spot-checks when task touches narrative.
- **Threshold loops**: supervising Flow enforces clarity/hint readiness ≥ threshold via Critique Crew; fails loop back to Revision Crew.
- **Audit trails**: every Flow writes summary + artifacts (scores, diffs) to `crew_ai/workspace/knowledge/` or logs for review.
- **Human checkpoint**: before Flow Integrator writes to canonical docs, `flow_checkpoint` requests Gabe’s approval.

---

## 6. Implementation Stages

| Phase | Focus | Patterns Enabled |
|-------|-------|------------------|
| **P0** | Install workspace (done), define base tools + single Crews | Simple Flow (eval), Single Crew (Creative) |
| **P1** | Encode Critique + Revision Crews, evaluation Flow wrappers | Flow orchestrating multiple Crews for single riddle |
| **P2** | Add Flow Integrator + Production Ops, checkpoint Flow | Full Flow-of-Crews for new riddle + sequencing tasks |
| **P3** | Telemetry + HITL UI, optional auto-deploy | Mature pipeline mixing Crews/Flows/Evals |

---

## 7. Open Decisions

1. Where to store Flow/crew outputs (repo branch vs. workspace knowledge).
2. Which tasks should default to simple Flow vs. collaborative Crew; we can adjust per user comfort.
3. Level of automation: should Flow Integrator apply patches automatically or leave as suggestions?
4. Do we want additional “Creative Jam” Crew for purely exploratory brainstorming without strict outputs?

This flexible architecture lets us start lightweight (single Flow or small Crew) and scale toward full Flow-of-Crews orchestration as we gain confidence—all while respecting the varying complexity/precision profiles across our scavenger-hunt planning tasks.
