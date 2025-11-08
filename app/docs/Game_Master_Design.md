# Game Master (Backend) – High-Level Design

## Purpose
“Game” orchestrates the entire scavenger hunt. Joy only sees the frontend, but every rule, hint, celebration, and physical effect stems from this backend brain. It must:
- Track the canonical hunt state.
- Validate answers and decide when to escalate hints.
- Speak through the AI Guide persona.
- Trigger physical effects (lights, piano, audio) at the right moments.
- Provide Gabe with light admin control (skip, replay, override).

## Guiding Principles
1. **Single source of truth** – Frontend never stores progress; it only renders what Game says.
2. **Deterministic core, playful surface** – Answer checks, state transitions, and logging are deterministic; only the Guide text is AI-driven.
3. **Local-first** – Everything runs on a single device in the apartment; no external dependencies besides OpenAI and smart-home APIs.
4. **Event-driven** – Game emits structured events (`riddle_solved`, `hint_escalated`, `effect_triggered`) that downstream consumers (frontend, lighting bridge) subscribe to.
5. **Graceful operator override & live editing** – Gabe can always step in with a manual skip/replay or edit riddles/hints/order mid-hunt without corrupting the log.
6. **Simple guardrails** – Leverage Wasp’s built-in auth primitives enough to separate the public player UI from privileged endpoints (system admin API key), but keep the flow frictionless for Joy.
7. **Testable integrations** – Every external hookup (Govee, Google Home, Tune.js) must have both a simulator for local dev and a way to be tested independently before event day.

## Conceptual Layers
1. **State & Storage**
   - SQLite (via Prisma) holds riddle metadata, progress snapshots, hint logs, and effect history.
   - Simple state machine: `NotStarted → Active(riddleId) → Celebration → Finale`.
2. **Interaction Orchestration**
   - REST/SSE/WebSocket interface exposes answer submission, guide conversations, and status queries.
   - Progress service enforces pacing, attempt limits, and hint unlock rules.
3. **Guide & Narrative Engine**
   - Prompt templates seeded with Joy-specific lore and riddle context.
   - Maintains transcript per session so the Guide feels continuous.
4. **Effect Dispatch**
   - Event bus inside the backend fans out to:
     - Frontend (for UI animations + Tune.js cues).
     - Lighting bridge (Govee/Google webhooks).
     - Any future physical props (e.g., piano MIDI trigger).
5. **Operator Controls (API-first for now)**
   - Core API endpoints support `skip`, `back`, `replay effect`, `pause/resume`, `mark complete`, and live edits (update riddle text, add hints, change order).
   - No dedicated UI/CLI initially; Gabe can hit the API directly or via lightweight scripts. Every override/edit is logged for post-game review.
   - Auth split: Joy uses an unauthenticated/player route (or a shared "player" identity), while privileged endpoints require the `SYSTEM_ADMIN_API_KEY` header.

6. **Integration Simulation & Testing**
   - Each external adapter ships with a mock implementation so we can run full-stack tests without firing real hardware.
   - Standalone “self-tests” (little scripts) poke each real integration—e.g., flash Govee lights, trigger Google webhook—before plugging them into Game.

## High-Level Flow
1. Gabe starts Game with a clean database → seeds riddles (and can add/edit them on the fly).
2. Joy hits “Begin”; Game transitions to `Active` and serves Riddle #1.
3. For each submission:
   - Normalize + compare answer; update attempts.
   - If wrong: return gentle feedback, optionally unlock next hint.
   - If right: emit `riddle_solved`, update state to next riddle, trigger effect events.
4. Parallel Chat:
   - Joy can message the Guide; Game sends transcripts + context to OpenAI and returns the response.
5. Finale:
   - When final riddle solved, Game moves to `Finale`, triggers lighting/audio finale, records completion time.
6. Post-game:
   - Gabe can export logs (JSON) for keepsakes or iterate on future hunts.
   - All state changes auto-save immediately—there is no manual “save” button.

## Open Questions
- How should we surface/audit uses of the `SYSTEM_ADMIN_API_KEY` so overrides are obvious during/after the hunt?
- Do we need concurrency protections if multiple devices hit the API (e.g., Joy on phone + Gabe on laptop)?
- What dev workflow best balances live editing with version control (e.g., structured JSON vs DB seed files)?

Keeping this high-level map handy ensures every future decision lines up with what Game is supposed to do.
