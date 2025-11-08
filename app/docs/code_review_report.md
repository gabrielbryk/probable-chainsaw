# Joy Hunt Game Master – Code Review Report

_Last updated: 2025‑11‑08_

This report captures the major implementation gaps, validation issues, and architectural deviations observed in the current repository (`app/`). Findings are grouped by severity and reference the relevant files/lines.

---

## Critical Findings

1. **Effect events never reach integrations**
   - `createEffectDispatcher` only inserts rows into `EffectEvent` (src/server/services/effectDispatcher.ts:1-19). No lighting/audio/webhook adapters are invoked, and there is no SSE/WS broadcaster. This contradicts the event-driven architecture (docs/System_Architecture_Overview.md:33-42; docs/Game_Master_Design.md:30-36) and means celebratory hardware/audio can never fire.

2. **Effect type vocabularies conflict**
   - Gameplay emits types like `HUNT_STARTED`/`RIDDLE_SOLVED` (src/shared/constants.ts:10-23) while the integration layer expects `'lighting' | 'audio' | 'celebration'` (src/server/integrations/types.ts:1-11). Nothing maps between them, so even if dispatch called adapters the types would not match, preventing bridge execution.

3. **Unprotected finale completion endpoint**
   - `completeHunt` omits `requireAdminKey` (src/server/services/gameEngine.ts:198-215). The Finale UI triggers it directly from the player router (src/client/pages/Finale.tsx:18-110), enabling any guest to mark the hunt complete, emit `HUNT_COMPLETED`, and halt progress. This violates the operator-only control requirement (docs/Game_Master_Design.md:35-38).

4. **Advance/skip jumps back to Riddle 1**
   - `advanceRiddle` calls `Riddle.findFirst` with an empty `where` when `targetOrder` is undefined (src/server/services/gameEngine.ts:156-175), which always returns the first riddle. The documented "skip to next" operator action (docs/DEV_TASKS.md §3) therefore resets the hunt instead of advancing.

5. **Guide transcript truncation/incorrect context**
   - Both `fetchHistory` and `listTranscript` fetch the oldest rows first (ordered asc, limited to 14/60) and then filter in memory (src/server/services/guideConversation.ts:92-116). Once more than ~14 lines exist, recent exchanges are silently dropped from both the UI and the OpenAI prompt context, breaking the “continuous persona” requirement (docs/Game_Master_Design.md:27-33).

6. **Tune.js “real” adapter unimplemented**
   - `TuneJsAudioAdapter.trigger`/`runSelfTest` are placeholders (src/server/integrations/audio/tune.ts:4-15). Audio automation therefore cannot run even after dispatcher fixes. (Google Home bridge is intentionally deferred until Google’s API stabilizes.)

---

## Major Findings

1. **Self-test tooling silently uses mocks**
   - `env.mockMode` defaults to `true` (src/server/config/env.ts:68). The self-test scripts import the singleton `integrations` object (scripts/runGuideSelfTest.ts; scripts/runLightingSelfTest.ts), so unless `MOCK_MODE=false` is explicitly set, the “real hardware” tests only exercise mocks. This undermines the verification process described in docs/Integration_Testing_Strategy.md:40-44.

2. **Timer shows elapsed before hunt begins**
   - `Progress.startedAt` is non-nullable with `@default(now())` (schema.prisma:31-38) and the seed script never overrides it (src/server/db/seeds/dev.ts:65-70). `getPlayerGameState` always surfaces the timestamp (src/server/queries.ts:217-240), so the HUD shows a running timer even when the hunt hasn’t started, contradicting the UX spec (docs/Frontend/User_Journey.md:25-28).

3. **Progress recap cannot display attempts/timestamps**
   - On a correct answer the engine deletes the attempt count (src/server/services/gameEngine.ts:81-88 with stateMachine.resetAttempts). `getPlayerGameState`’s `riddles` array only holds `{id,title,order,status,attempts}` (src/server/queries.ts:201-215) with no completion timestamps. The “progress map” modal therefore shows completed riddles with zero attempts and no timing, missing key insights requested in docs/Frontend/User_Journey.md:25-33.

4. **`.env.example` still missing**
   - Despite being called out in docs/DEV_TASKS.md §4 (lines 70-82), no `.env.example` exists in the repo (verified via `rg --files`). New contributors must guess required variables (`SYSTEM_ADMIN_API_KEY`, `OPENAI_API_KEY`, `GOVEE_*`, etc.), delaying setup and risking leaked secrets.

5. **GoveeCloudClient signature mismatch**
   - `GoveeCloudClient.canHandle()` takes no arguments (src/server/integrations/lighting/clients/cloud.ts:9-16), but the `GoveeClient` interface requires `canHandle(device: GoveeDeviceConfig)` (src/server/integrations/lighting/clients/types.ts:5-11). This breaks TypeScript once strict checking runs and prevents per-device capability checks.

6. **Answer validation is still exact match**
   - `answersMatch` only trims and lowercases (src/server/services/answerValidation.ts:1-6) despite the spec calling for optional fuzzy matching and broader normalization (docs/DEV_TASKS.md §3). Slight punctuation or pluralization differences (e.g., “Spirals!”, “Larímar”) are incorrectly rejected.

---

## Moderate / Follow-up Items

1. **Event polling on the client**
   - `useCelebrationEffects` polls `getEffectEvents` every 2.5 s (src/client/hooks/useCelebrationEffects.ts:79-118). Without SSE/WS this causes laggy celebrations and needless load. The architecture doc expects push delivery.

2. **Progress modal duplicates data client-side**
   - AppLayout computes `progressList` by re-sorting the `gameState.riddles` array (src/client/components/AppLayout.tsx:69-75) rather than relying on server ordering. Not a bug today, but once multi-session support arrives this becomes error-prone.

3. **Guide transcript query lacks pagination**
   - `getGuideTranscript` always returns the full (currently filtered) history (src/server/queries.ts:243-245). When transcripts grow, this will become slow; consider server-side limits with cursors.

4. **`runAllIntegrationTests` cannot mix mock/real adapters**
   - Because adapter instances are created once at module load (src/server/integrations/index.ts:1-26), there’s no way to run self-tests in real mode while the rest of the app uses mocks. Consider factory methods based on per-request env flags.

5. **Lack of README/setup guidance**
   - No README exists in `app/`, so everything relies on AGENTS.md. Docs/DEV_TASKS.md §6 explicitly requests install/run instructions, mock-mode explanation, etc.

6. **Seeds only cover two riddles**
   - `seedDev` inserts two riddles (src/server/db/seeds/dev.ts:5-35) even though the narrative flow requires seven. Until the remaining content lands, QA can’t simulate full-game pacing.

---

## Suggested Remediation Plan

1. **Wire the effect bus**
   - Extend `createEffectDispatcher` so it both logs the event and forwards it to `integrations.*.trigger`. Add an internal pub/sub (SSE/WebSocket) so the frontend receives events immediately.

2. **Normalize effect type taxonomy**
   - Define a single `EffectType` enum (e.g., from src/shared/constants.ts) and expose mapping helpers for each adapter (`EFFECT_TYPES.RIDDLE_SOLVED → lighting celebration scene`, etc.).

3. **Enforce admin key for privileged actions**
   - Apply `requireAdminKey` to `completeHunt` (and any future operator actions), update AppLayout/Finale to call them only from operator paths, and provide CLI examples for Gabe.

4. **Fix skip/rewind semantics**
   - Add `advanceRiddle({ targetOrder?: number })` logic that defaults to `current.order + 1`. Consider a dedicated `skipActiveRiddle` helper so operator UI doesn’t need to know orders.

5. **Rework guide transcript storage**
   - Store a monotonically increasing transcript ID per conversation, fetch the latest N rows ordered desc, and drop the lossy client-side filtering.

6. **Complete real adapters and docs**
   - Finish the Tune.js adapter, add `.env.example`, provide README instructions, and adjust self-test scripts to opt into real mode explicitly (e.g., `INTEGRATION_MODE=real`). Revisit Google Home only once the official API is ready.

7. **Improve validation & state tracking**
   - Implement fuzzy answer matching (e.g., Damerau-Levenshtein within a threshold), keep attempt counts/timestamps even after solve, and capture celebration metadata for the recap modal.

---

## Test Status

- `npm run test` (Vitest) – **PASS** on 2025‑11‑08. Note: current suite covers only validators, state machine helpers, and integration schemas; it does not exercise the higher-level engine or adapters discussed above.

---

Please coordinate updates with `docs/DEV_TASKS.md` and keep Gabe informed of any architectural deviations.
