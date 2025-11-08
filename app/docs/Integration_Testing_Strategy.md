# External Integrations – Design & Testing Strategy

## Goals
1. **Isolation** – Every integration (lighting, Google Home, OpenAI guide, audio cues, etc.) must be testable on its own without booting the full Game Master.
2. **Simulators** – Provide mock adapters so local dev uses deterministic fake responses/success states.
3. **Self-tests** – Supply CLI/API routines that hit the real integration on demand to verify credentials and hardware before event day.
4. **Pluggable Adapters** – Game Master should depend on an interface (e.g., `EffectAdapter.trigger(event)`) so swapping mock/real implementations is frictionless.

## Architectural Approach
1. **Adapter Interface**
   - Define per-integration interfaces in `src/integrations/` (e.g., `LightingAdapter`, `AudioAdapter`, `GuideAdapter`).
   - Each interface exposes the minimal commands the Game Master needs (e.g., `triggerScene(scene)`, `playCue(cueId)`).
2. **Concrete Implementations**
   - `*-real.ts`: Talks to external API (Govee REST, Google webhook, OpenAI Responses API, etc.).
   - `*-mock.ts`: Logs calls, optionally simulates success/failure, and emits synthetic events for frontend verification.
3. **Factory / Config**
   - Central config (e.g., `src/integrations/index.ts`) picks mock vs real based on `process.env.MOCK_MODE` or per-integration flags.
   - Provide dependency injection into Game Master services, so unit tests can pass mocks explicitly.
4. **Self-Test Commands**
   - CLI (`wasp start-selftest` or script) that:
     1. Loads real adapters.
     2. Executes a small suite: flash lights, call Google webhook, fire Tune.js test event (if applicable), ping OpenAI with a test prompt.
     3. Prints pass/fail summary with action items.
   - Each adapter also exports a `runSelfTest()` function for direct invocation via CLI or API endpoint.
5. **Contract Tests**
   - Vitest suites against mock adapters confirm Game Master invokes them correctly (no hardware needed).
   - Optional “integration” tests hitting real services gated behind env flag (skip in CI).

## Integration Inventory & Requirements
| Integration | Purpose | Requirements | Test Plan |
| --- | --- | --- | --- |
| **OpenAI Guide (Responses API)** | Generates in-character chat replies and hint escalations. | `OPENAI_API_KEY`, model (`gpt-4o-mini` default), prompt templates, transcript storage. | Mock adapter returns canned text. Real self-test sends “Hello Joy” prompt and asserts response received. |
| **Govee Lighting** | Trigger celebratory scenes (lights, colors) when riddles solved/finale hits. | `GOVEE_API_KEY`, device IDs, scene presets or RGB payloads, LAN/cloud endpoint toggle. | Mock logs scenes; real self-test flashes quick pattern and logs success/error. |
| **Google Home / IFTTT / Nabu Casa Webhook** | Kick off broader smart-home actions (“celebration mode”, “play piano cue”). | `GOOGLE_HOME_WEBHOOK_URL` or equivalent token, payload schema. | Mock logs payload; real self-test POSTs sample event and requires 200 OK (manual confirmation optional). |
| **Tune.js / Audio Hooks (frontend)** | Play ambient music + stingers in browser when backend sends events. | Cue definitions, asset URLs, backend → frontend WS channel. | Mock WS emitter dispatches sample events; dev command triggers real WS event and dev console confirms playback. |
| **Effect Log Storage (internal)** | Persist effect events for auditing/replay. | SQLite table schema, event types, payload JSON. | Covered by backend unit tests (no external deps). |
| **Future Props (e.g., MIDI piano trigger)** | Fire additional physical props. | TBD hardware/API details. | Follow same adapter pattern; placeholder mock until hardware is finalized. |

## Next Steps
1. Scaffold `src/integrations/` with interfaces + mock implementations (OpenAI, Govee, Google webhook, WS emitter).
2. Build factory/config that selects mock vs real adapters via env vars (`MOCK_MODE`, `LIGHTING_DRIVER`, etc.).
3. Implement `scripts/test-integrations.ts` (or custom Wasp command) invoking each adapter’s `runSelfTest()`.
4. Document how to run mocks vs real hardware in `README.md` and reflect tasks in `docs/DEV_TASKS.md` (Section 4).
