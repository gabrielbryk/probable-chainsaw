# Wasp AI Prompt – JOY HUNT (Frontend + Game Master)

## Context
- This is Joy's 7-riddle birthday scavenger hunt, unfolding entirely inside Gabe & Joy's apartment with physical props, lights, and piano cues; the only cloud calls are OpenAI + smart-home APIs.
- Joy, the birthday recipient, plays on a single device; Gabe can live-edit riddles/hints/order mid-hunt via privileged endpoints.
- The backend (codename "Game") acts as the Game Master (single source of truth). Frontend is the narrator UI; lighting/audio bridges react to backend events.
- The system must provide mocks for external integrations so we can test without firing real hardware.

## Frontend Requirements (Player Journey)
1. **Entry & Framing**
   - Landing page with invitation copy, single `Begin the Hunt` CTA. Gabe hands Joy the device already open.
2. **Riddle Flow**
   - For each riddle show title, difficulty, narrative block, answer input, attempts count, and a collapsible hint drawer.
   - Live Guide sidebar (chat-style) that displays OpenAI responses; Joy can ask for help anytime.
   - Answer submission shows “checking” state, then either playful error or success.
3. **Celebrations & Effects**
   - On solve: confetti layer, Tune.js cue, and textual instruction for next physical action (e.g., “Check the flute case”).
   - No lighting status indicator—the magic just happens when backend fires events.
4. **Progress Awareness**
   - Sticky header with stage counter (1/7) + elapsed timer + `Need Help` button (pings Gabe/admin endpoint).
   - Optional modal mini-map summarizing completed riddles + timestamps.
5. **Finale Screen**
   - Full-screen celebratory message, optional photo/video, buttons to replay celebration, save transcript, end hunt.
6. **Styling**
   - Tailwind gradient (#764ba2 → #0b0b0f) with gold accent (#f5a623) for CTAs.
   - Phone-first layout, still usable on tablet/laptop.

## Backend (Game Master) Requirements
1. **State & Storage**
   - SQLite (Prisma) for `Riddle`, `Progress`, `HintLog`, `EffectEvent`.
   - State machine: `NotStarted → Active(riddleId) → Celebration → Finale`.
   - Auto-save on every mutation; no manual “save” button.
2. **Answer Validation & Progression**
   - Normalize answers (case, whitespace) + optional fuzzy match.
   - Track attempts per riddle; after thresholds, mark hints as unlocked.
   - Emit structured events (`riddle_solved`, `hint_escalated`, `effect_triggered`).
3. **Guide Service**
   - Prompt seeded with Joy’s context; uses `gpt-4o-mini` via OpenAI Responses API.
   - Stores transcript per hunt.
4. **Effect Dispatch**
   - Internal event bus fans out to:
     - WebSocket/SSE for frontend animations + Tune.js cues.
     - Lighting bridge (Govee API, Google Home webhook).
     - Future props (e.g., piano trigger) via adapter interface.
   - Provide mock adapters for dev + standalone self-test scripts for each real integration.
5. **Live Editing & Operator Controls**
   - API-first controls to add/edit/delete riddles, change order, tweak hints, skip/back, replay effects, pause/resume.
   - Joy/player endpoints stay unauthenticated/simple; privileged routes require `SYSTEM_ADMIN_API_KEY` header.
   - Log every override/edit with timestamp and reason.
6. **Testing Hooks**
   - Seed script with at least 2 riddles (Uzumaki spiral, Ocean Vuong poem).
   - CLI or API route to run integration self-tests (flash lights, ping webhook) before event day.

## Non-Functional
- Run via `wasp start`; include `.env.example` listing `OPENAI_API_KEY`, `SYSTEM_ADMIN_API_KEY`, `GOVEE_API_KEY`, `GOOGLE_HOME_WEBHOOK_URL`, `DATABASE_URL`.
- Provide mock mode flag to disable external calls during development.
- Keep code structure friendly to future operator UI (but not required now).

## Stretch / Nice-to-Haves
- Exportable JSON log (attempts, hints, effects) after hunt.
- Shared spectator view so Gabe can monitor on laptop while Joy plays.
- Timer-based events (e.g., auto-trigger hint if idle for X minutes).

Deliver a Wasp project that respects this split: polished player UI + authoritative backend with live-edit-friendly APIs and effect dispatch.
