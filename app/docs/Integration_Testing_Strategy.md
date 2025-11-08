# External Integrations – Design & Testing Strategy

## Goals
1. **Isolation** – Every integration (lighting, OpenAI guide, audio cues, etc.) must be testable on its own without booting the full Game Master.
2. **Simulators** – Provide mock adapters so local dev uses deterministic fake responses/success states.
3. **Self-tests** – Supply CLI/API routines that hit the real integration on demand to verify credentials and hardware before event day.
4. **Pluggable Adapters** – Game Master should depend on an interface (e.g., `EffectAdapter.trigger(event)`) so swapping mock/real implementations is frictionless.

## Architectural Approach
1. **Adapter Interface**
   - Define per-integration interfaces in `src/integrations/` (e.g., `LightingAdapter`, `AudioAdapter`, `GuideAdapter`).
   - Each interface exposes the minimal commands the Game Master needs (e.g., `triggerScene(scene)`, `playCue(cueId)`).
2. **Concrete Implementations**
   - `*-real.ts`: Talks to external API (Govee REST, OpenAI Responses API, etc.).
   - `*-mock.ts`: Logs calls, optionally simulates success/failure, and emits synthetic events for frontend verification.
3. **Factory / Config**
   - Central config (e.g., `src/integrations/index.ts`) picks mock vs real based on `process.env.MOCK_MODE` or per-integration flags.
   - Provide dependency injection into Game Master services, so unit tests can pass mocks explicitly.
4. **Self-Test Commands**
   - CLI (`wasp start-selftest` or script) that:
     1. Loads real adapters.
     2. Executes a small suite: flash lights, fire Tune.js test event (if applicable), ping OpenAI with a test prompt.
     3. Prints pass/fail summary with action items.
   - Each adapter also exports a `runSelfTest()` function for direct invocation via CLI or API endpoint.
5. **Contract Tests**
   - Vitest suites against mock adapters confirm Game Master invokes them correctly (no hardware needed).
   - Optional “integration” tests hitting real services gated behind env flag (skip in CI).

## Integration Inventory & Requirements
| Integration | Purpose | Requirements | Test Plan |
| --- | --- | --- | --- |
| **OpenAI Guide (Responses API)** | Generates in-character chat replies and hint escalations. | `OPENAI_API_KEY`, model (`gpt-4o-mini` default), prompt templates, transcript storage. | Mock adapter returns canned text. Real self-test sends “Hello Joy” prompt and asserts response received. |
| **Govee Lighting** | Trigger celebratory scenes (lights, colors) when riddles solved/finale hits. | `config/govee_devices.json` (preferred) or `GOVEE_DEVICES` env for `device:model[:ip][:name]`, `GOVEE_API_KEY`, optional `GOVEE_API_BASE`. Supports scenes, RGB/brightness, power commands; LAN fallback uses UDP broadcast per Govee guide. | Mock logs scenes; real self-test now does two checks: cloud client hits `/v1/devices` to verify API key and LAN client issues a `devStatus` poll over UDP to an IP-configured device. Use `npx tsx scripts/send_govee_effect.ts` for manual commands and `python scripts/discover_govee_lan.py` for discovery. |
| **Google Home Bridge (deferred)** | Kick off broader smart-home actions when Google exposes a stable API. | Pending – the public Home API is still gated, so we are deferring this integration and relying solely on Govee lights for physical effects. | None for now. |
| **Tune.js / Audio Hooks (frontend)** | Play ambient music + stingers in browser when backend sends events. | Cue definitions, asset URLs, backend → frontend WS channel. | Mock WS emitter dispatches sample events; dev command triggers real WS event and dev console confirms playback. |
| **Effect Log Storage (internal)** | Persist effect events for auditing/replay. | SQLite table schema, event types, payload JSON. | Covered by backend unit tests (no external deps). |
| **Need Help Operator Loop** | Ensure Joy’s “Need Help” CTA pings Gabe + logs events. | `SYSTEM_ADMIN_API_KEY`, `/actions/requestAssistance`, `/actions/adminAcknowledgeHelp`. | Player side: click CTA or `await requestAssistance({})`. Operator side: run `node scripts/admin/acknowledge-help.ts` to confirm API key + effect log wiring. |
| **Future Props (e.g., MIDI piano trigger)** | Fire additional physical props. | TBD hardware/API details. | Follow same adapter pattern; placeholder mock until hardware is finalized. |

## Next Steps
1. Scaffold `src/integrations/` with interfaces + mock implementations (OpenAI, Govee, WS emitter).
2. Build factory/config that selects mock vs real adapters via env vars (`MOCK_MODE`, `LIGHTING_DRIVER`, etc.).
3. Implement `scripts/test-integrations.ts` (or custom Wasp command) invoking each adapter’s `runSelfTest()`.
4. Document how to run mocks vs real hardware in `README.md` and reflect tasks in `docs/DEV_TASKS.md` (Section 4).
