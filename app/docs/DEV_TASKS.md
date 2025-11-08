# DEV TASKS – JOY HUNT GAME MASTER

Last updated: 2025-02-14

Tracks the engineering work required to turn the generated Wasp scaffold into the fully featured “Game Master” + player UI.

## 1. Auth & Access Model
- [ ] Remove username/password auth from `main.wasp`.
- [ ] Introduce frictionless player session (no login) plus privileged API key for operator routes.
- [ ] Implement middleware/util that checks `SYSTEM_ADMIN_API_KEY` for admin endpoints.

## 2. Data Model Redesign
- [ ] Update `schema.prisma` to include:
  - `Riddle { title, body, answer, difficulty, hints JSON, order, mediaUrl?, metadata JSON }`
  - `Progress { activeRiddleId, attemptsPerRiddle JSON, startedAt, updatedAt }`
  - `HintLog` with tier/reason
  - `GuideTranscript`
  - `EffectEvent { type enum, payload JSON, source }`
- [ ] Add enums/constants for effect types + hint tiers.
- [ ] Seed DB with at least Uzumaki + Ocean Vuong riddles.

## 3. Game Master Services
- [ ] Build state machine (NotStarted → Active → Celebration → Finale) with persistence.
- [ ] Implement answer validation (normalize, optional fuzzy, attempt tracking, hint unlocks).
- [ ] Implement Guide service (OpenAI Responses API + transcript storage).
- [ ] Add event dispatcher that emits structured events (frontend WS, bridges, logs).
- [ ] Expose API-first operator controls (add/edit/delete riddles, reorder, tweak hints, skip/back, replay effect, pause/resume) with logging.

## 4. Integration Layer & Testing Hooks
- [ ] Create adapters (real + mock) for Govee lighting, Google Home/IFTTT webhook, Tune.js cues.
- [ ] Provide dev-mode mocks + standalone “self-test” endpoints for each integration.
- [ ] Add `.env.example` listing `OPENAI_API_KEY`, `SYSTEM_ADMIN_API_KEY`, `GOVEE_API_KEY`, `GOOGLE_HOME_WEBHOOK_URL`, `DATABASE_URL`, `MOCK_MODE`.

## 5. Frontend Experience
- [ ] Landing page with proper invitation copy + Begin CTA (no login).
- [ ] Riddle screen: sticky header (stage, timer, Need Help), riddle content, answer input, hint drawer, Guide chat, celebration overlay, WS-driven effects.
- [ ] Progress mini-map modal, Need Help button hooking admin endpoint.
- [ ] Finale screen with celebration message/media and actions (Replay, Save Transcript, End Hunt).
- [ ] Integrate Tune.js cues + confetti animations triggered via backend events.

## 6. Dev Experience & Docs
- [ ] Document run instructions, mock mode, env setup (`README.md`, `app/docs`).
- [ ] Provide scripts for seeding DB and running integration self-tests.
- [ ] Add unit/integration tests for state machine, validation, adapters.
- [ ] Ensure mock mode is default in development configs.

We’ll work through sections 1 → 6 in order, updating this checklist as tasks land.
