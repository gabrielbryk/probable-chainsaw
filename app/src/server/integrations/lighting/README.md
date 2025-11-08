# Lighting Integration

**Scope**: Adapter layer for smart lights (Govee, etc.).
- Responsible for translating normalized effect events into concrete API calls (scene IDs, RGB payloads, etc.).
- Handles API auth, device IDs, and any retries/backoff.
- Does **not** decide which scene to run — Game Master passes an `EffectEvent` describing the desired effect.

**Testing**:
- Unit tests validate the Zod schemas + LAN command mapping (`npm run test -- lighting`).
- `GoveeLanClient.runSelfTest()` now issues a `devStatus` poll over UDP which confirms at least one LAN device can respond.
- `GoveeCloudClient.runSelfTest()` still hits Govee's `/devices` endpoint to confirm credentials.
- For manual checks dispatch single effects with the CLI (`scripts/send_govee_effect.ts`) or run animated palettes via `scripts/run_govee_pattern.ts`.

**Example commands**
- `npx tsx scripts/send_govee_effect.ts --deviceName "Bedroom Light Bars" --color=FF00CC --brightness=70 --power=on`
- `npx tsx scripts/run_govee_pattern.ts --deviceName "Project Strip Lights" --pattern aurora --cycles=3 --hold=1200`
- `npx tsx scripts/run_govee_pattern.ts --deviceName "Project Strip Lights" --colors=FF0000,00FF00,0000FF --brightness=90 --startPower=on --endPower=off`
- `npx tsx scripts/run_govee_pattern.ts --listPatterns` (inspect available palettes before choosing one)

**Configuration**:
- `config/govee_devices.json` – preferred place to store device metadata (device ID, model, optional IP, friendly name).
- Env overrides:
  - `GOVEE_DEVICES_FILE` – custom JSON path if you don’t want to use the default file.
  - `GOVEE_DEVICES` – comma-separated `device:model[:ip][:name]` entries (e.g., `01:AA...:H613A:192.168.1.25:Bedroom Light Bars`).
- `GOVEE_API_KEY` – developer API key (used for cloud fallback + device discovery).
- Optional `GOVEE_API_BASE` for custom gateway.
- LAN mapping uses JSON datagrams that match Govee's docs (`msg.cmd` + `msg.data`). Payloads are validated with Zod before sending so malformed effects surface immediately.
- Cloud + LAN clients are attempted per-device; LAN wins when an IP is configured, otherwise the cloud fallback runs.
