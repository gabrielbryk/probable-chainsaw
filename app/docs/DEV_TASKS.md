# DEV TASKS – JOY HUNT GAME MASTER

Last updated: 2025-11-08

Tracks the engineering work required to turn the generated Wasp scaffold into the fully featured “Game Master” + player UI.

## 0. Current Focus
- Untangle the generated auth scaffolding so the player experience is passwordless while preserving an API-key-protected operator surface.
- Land the canonical Prisma schema (riddles, progress, transcripts, effect history) plus a seed script so backend services have real data to work with.
- Scaffold the backend service layers (state machine + answer validation harness) in parallel with the UX redesign, so frontend work can stub against real endpoints instead of placeholders.
- Track every change here as it lands; checkboxes roll up to Gabe’s status dashboards.

## 1. Auth & Access Model
- [x] Remove username/password auth from `main.wasp`.
- [x] Introduce frictionless player session (no login) plus privileged API key for operator routes.
- [x] Implement middleware/util that checks `SYSTEM_ADMIN_API_KEY` for admin endpoints.

### Status & Notes (2025-11-08)
- Login/signup routes and forms are removed; `main.wasp` routes are now public, and the root layout surfaces a `Need Help` affordance instead of auth links.
- Actions and queries were migrated to TypeScript and now operate on the singleton `Progress` row (no `context.user`).
- `requireAdminKey` (TS helper) enforces the `SYSTEM_ADMIN_API_KEY` header on operator actions (e.g., `advanceRiddle`), satisfying the privileged-route requirement.

### Next Steps
- [ ] Wire the `Need Help` button to an operator endpoint once the admin API exists (currently emits a window event only).
- [ ] Add lightweight operator UI or CLI snippets that demonstrate how to pass the admin key header for overrides.
- [ ] Document the player/session assumptions in `README.md` so future devs know progress is singleton-based until multi-session support ships.

## 2. Data Model Redesign
- [x] Update `schema.prisma` to include:
  - `Riddle { title, body, answer, difficulty, hints TEXT, order, mediaUrl?, metadata TEXT }`
  - `Progress { activeRiddleId, attemptsPerRiddle TEXT, startedAt, updatedAt }`
  - `HintLog` with tier/reason
  - `GuideTranscript`
  - `EffectEvent { type string, payload TEXT, source }`
- [x] Add enums/constants for effect types + hint tiers.
- [x] Seed DB with at least Uzumaki + Ocean Vuong riddles.

### Status & Notes (2025-11-08)
- Prisma schema now matches the spec: `Riddle`, `Progress`, `HintLog`, `GuideTranscript`, and `EffectEvent` tables exist with dedicated columns for ordered riddles, attempt maps, guide transcripts, and effect payloads (stored as TEXT).
- Shared enums/constants live in `src/shared/constants.ts` so both client + server reference the same `GAME_STATUS`, `EFFECT_TYPES`, and `HINT_TIERS`.
- `wasp db seed` now runs `seedDev` (Wasp-native) which wipes the tables and inserts the two canonical riddles + initializes the singleton `Progress` row with `NOT_STARTED`.
- Because SQLite lacks native JSON/enum support, JSON-like blobs still live in TEXT columns; validation/parsing happens through the new Zod helpers.
- Local development now runs against PostgreSQL via `docker-compose.dev.yml` (`docker compose -f docker-compose.dev.yml up -d db`), so `DATABASE_URL` should point to `postgresql://joyhunt:joyhunt@localhost:5450/joyhunt_dev`.

### Next Steps
- [ ] Extend `seedDev` (and add additional named seeds if needed) once the remaining riddles + finale copy are locked.
- [ ] Add documentation for the JSON blob shapes (riddle hints, attempts map, effect payload) so integration adapters know what to expect.
- [ ] Consider splitting a `prod` seed (minimal data) and `dev` seed (full narrative) once we approach event day.

## 3. Game Master Services
- [ ] Build state machine (NotStarted → Active → Celebration → Finale) with persistence.
- [ ] Implement answer validation (normalize, optional fuzzy, attempt tracking, hint unlocks).
- [ ] Implement Guide service (OpenAI Responses API + transcript storage).
- [ ] Add event dispatcher that emits structured events (frontend WS, bridges, logs).
- [ ] Expose API-first operator controls (add/edit/delete riddles, reorder, tweak hints, skip/back, replay effect, pause/resume) with logging.

### Status & Notes (2025-11-08)
- `src/server/services/gameEngine.ts` now leans on smaller modules (`stateMachine`, `answerValidation`, `hintSelection`, `hintEscalation`, `effectDispatcher`), so actions are thin wrappers and Need Help flows reuse the same dispatcher as riddle events.
- Guide integration is stubbed via `guideService.ts`—it hits the adapter when scripted tiers run out—but we still need persistence/logging of transcripts.
- Skip/back/replay admin actions exist (`rewindRiddle`, `replayEffect`), though the operator UX + audit logging still need a dedicated CLI/UI.

### Next Steps
- [ ] Move decision logic (hint escalation vs guide, celebration triggers, state transitions) into reusable domain helpers so admin endpoints can orchestrate skip/back/replay without duplicating code.
- [ ] Flesh out `guideService` to store transcripts + metadata, add retries, and expose tests/mocks for Vitest.
- [ ] Add an internal pub/sub/event stream so the frontend + hardware bridges react to `EffectEvent`s immediately (SSE/WebSocket).
- [ ] Build operator tooling (CLI or simple dashboard) around `rewindRiddle`, `replayEffect`, Need Help acknowledgements, and effect self-tests; log each override for post-run review.

## 4. Integration Layer & Testing Hooks
- [ ] Create adapters (real + mock) for Govee lighting and Tune.js cues. (Google Home automation bridge is deferred until the public API stabilizes.)
- [ ] Provide dev-mode mocks + standalone “self-test” endpoints for each integration.
- [ ] Add `.env.example` listing `OPENAI_API_KEY`, `SYSTEM_ADMIN_API_KEY`, `GOVEE_API_KEY`, `DATABASE_URL`, `MOCK_MODE`.

### Status & Notes (2025-11-08)
- Adapter files do not exist yet; server code never triggers lighting/audio actions, and Tune.js is not referenced on the frontend. Google Home control is intentionally paused until the Home API leaves preview.
- `.env.example` is missing, so there is no canonical list of secrets/environment knobs.
- No self-test hooks or scripts exist; Gabe cannot verify integrations without editing code.

### Next Steps
- [ ] Scaffold `src/server/integrations/{govee,effects}` (real + mock) exposing `triggerEffect` + `selfTest` helpers, toggled via `MOCK_MODE`.
- [ ] Stand up an SSE/WebSocket stream or reuse Wasp subscriptions so the frontend/audio layer can hear `EffectEvent`s in real time.
- [ ] Add `/api/admin/self-test/:adapter` endpoints (admin-key protected) to run the adapter self-tests on demand.
- [ ] Write `.env.example` documenting every variable, defaulting `MOCK_MODE=true` for dev safety; update docs with sourcing instructions.

## 5. Frontend Experience
- [x] Landing page with proper invitation copy + Begin CTA (no login).
- [x] Riddle screen: sticky header (stage, timer, Need Help), riddle content, answer input, hint drawer, Guide chat, celebration overlay, WS-driven effects.
- [x] Progress mini-map modal + Need Help button surfaces operator acknowledgement status.
- [x] Finale screen with celebration message/media and actions (Replay, Save Transcript, End Hunt).
- [x] Metadata-driven “Guide Vision” card that renders per-riddle Three.js animations for aesthetic/hint cues.
- [x] Guide Vision energy now reacts to attempts + hint tiers, pulsing harder as Joy escalates support.
- [ ] Integrate Tune.js cues + confetti animations triggered via backend events.

### Status & Notes (2025-11-08)
- Landing page now mirrors the documented journey: gradient hero, lore-friendly copy, status-aware CTA, and the CTA calls the new `startHunt` action/resumes in-progress runs.
- App layout shows the sticky HUD (stage, elapsed timer, status, Need Help button) backed by the new `getPlayerGameState` query, plus a progress mini-map modal drawing from the shared riddle list (Need Help → operator acknowledgement plumbing still pending).
- Riddle screen runs on real data (answer form, attempt counter, hint drawer, Guide chat) and now listens for the live SSE celebration stream (with a polling fallback only for initial paint) to fire confetti/audio overlays.
- Finale screen replaced the placeholder view with the real celebration copy, replay button (local confetti), transcript export, End Hunt button wired to the `completeHunt` action, and now shows the animated finale background + media viewer (image/video) that mirrors the physical reveal deck.
- The new `Guide Vision` canvas reads each riddle’s metadata and renders a Three.js scene (spiral, wave, piano, or fallback orbs) so Joy gets a magical, potentially hint-bearing visualization tied to the active clue.
- Each canonical riddle/finale now has a catalogued visual preset (colors, glyphs, hints), and the animation energy ramps up automatically when attempts accumulate or hints are consumed so the scene itself doubles as a soft-progress meter.
- Celebrations now stream over the `/api/effects/stream` SSE endpoint, so confetti + audio fire as soon as the backend dispatcher logs an effect (polling fallback remains only for first paint).

### Next Steps
- [ ] Tap into the new SSE stream from the Tune.js/audio layers so browser cues stay in sync with the lighting bridge.
- [ ] Expose a tiny operator surface (CLI/UI) that calls `adminAcknowledgeHelp` so the HUD status flips without editing code.
- [ ] Add a celebratory background animation + finale media viewer per `Game_Master_Design.md`, ensuring the finale message references the physical reveal.

## 6. Dev Experience & Docs
- [ ] Document run instructions, mock mode, env setup (`README.md`, `app/docs`).
- [ ] Provide scripts for seeding DB and running integration self-tests.
- [ ] Add unit/integration tests for state machine, validation, adapters.
- [ ] Ensure mock mode is default in development configs.

We’ll work through sections 1 → 6 in order, updating this checklist as tasks land.

### Status & Notes (2025-11-08)
- README + docs do not yet mention env vars, mock mode, or scripts; new contributors must read AGENTS.md to piece together setup steps.
- No tests exist (no Vitest/Jest config, no CI or scripts in `package.json`).
- Mock mode env var is undefined, so hardware integrations cannot be safely simulated.
- Source files are now TypeScript (client/server), which means we should lock in linting/tsc scripts soon to prevent regressions.

### Next Steps
- [ ] Draft `README.md` updates covering env files, `wasp db migrate-dev`, `wasp start`, mock bridges, and testing.
- [ ] Add testing infrastructure (likely Vitest) with initial coverage on the state machine + validators; wire into `package.json test`.
- [ ] Provide `npm run db:seed` + `npm run integrations:self-test` scripts that wrap Prisma seed + adapter self-tests.
- [ ] Introduce `MOCK_MODE` defaults + documentation, ensuring any destructive adapter code checks the flag.
