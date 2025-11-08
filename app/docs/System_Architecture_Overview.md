# System Architecture Overview

## Purpose
Provide a single reference for how the planned technical components fit together so the detailed docs in this folder stay aligned.

## Internal Infrastructure (we build/own these)
- **Frontend (React + Vite + Tailwind)**: Presents the invitation, riddle submissions, and celebration UI. Lives in `Frontend/`.
- **Backend “Game Master” (Node + Wasp/Fastify)**: Owns the riddle engine logic, OpenAI calls, progress tracking, and effect dispatch. Lives in `Riddle_Engine/` until the codebase is finalized.
- **Lighting Bridge (Node.js service)**: Listens for backend effect events and triggers smart-home automations. Lives in `Lighting_Bridge/`.
- **Audio System (Tone.js / Tune.js hooks)**: Plays success cues locally in the browser. Lives in `Audio_System/`.

### What each internal piece owns
| Layer | Responsibilities | Tech Stack |
| --- | --- | --- |
| Frontend | Player experience: intro → riddles → hints → celebration overlay. Hosts the Tune.js soundboard and renders Guide chat UI. | React, Vite, Tailwind, Tune.js |
| Backend | Validates answers, manages hint tiers, persists progress, talks to OpenAI, emits effect events, exposes admin controls. | Node, Wasp/Fastify, SQLite/Prisma, OpenAI SDK |
| Bridges | Translate backend events into smart-home/device actions the browser cannot perform. | Node bridge for Govee (Google Home planned later), webhook clients |

Think of the backend as the **single source of truth** (game master brain) and the frontend as the **narrator/visualizer** that simply reflects whatever the backend says, while the bridges let us act on the physical world.

## Supporting Integrations & External Systems
| System | Why We Need It | How We Talk To It | Secrets / Config |
| --- | --- | --- | --- |
| **OpenAI API** | Powers the AI Guide persona so hints stay warm, adaptive, and context-aware. | Backend server action calls `gpt-4o-mini` (Responses API) with transcript + hunt metadata per request. | `OPENAI_API_KEY`, optional `OPENAI_MODEL`. Stored in backend env only. |
| **Govee Developer API** | Controls LED strips / lamps for celebratory lighting cues. | Lighting Bridge sends HTTPS (cloud) or LAN requests when backend emits `lighting` events. | `GOVEE_API_KEY`, `GOVEE_DEVICE_ID` per light. |
| **Google Home Automation Bridge (future)** | Would kick off broader smart-home scenes once Google exposes a stable API. | Deferred — stick to Govee + local audio effects for this hunt. | _(n/a)_ |
| **Tune.js (frontend lib)** | Plays ambient music + stingers without needing backend audio hardware. | React hook subscribes to `/ws`, maps events to Tune.js sequences locally. | None (ships with frontend bundle). |
| **PostgreSQL via Prisma** | Persists riddles, attempts, hint logs, and effect history. | Backend uses Prisma client generated from `schema.prisma`. | `DATABASE_URL` (point it to the Docker Compose Postgres instance for dev). |
| **GitHub Pages / Local Hosting** | Optional deployment target for the frontend bundle if we ever go beyond local-only mode. | `wasp build` → upload to Pages/Vercel. For event-day we can run locally. | Git/Vercel tokens only if we deploy. |

Whenever a new technology is proposed, decide first whether it belongs in **internal infrastructure** (we build/own it) or **supporting integration** (external service). Update this table so ownership and secrets stay obvious.

## Data Flow
```
User ↔ Frontend → Riddle Engine → Event Bus → {Lighting Bridge, Audio System}
                                 ↘ Log Store (optional)
```
- The **Frontend** captures Joy's answers and sends them to the **Riddle Engine** via HTTPS or WebSocket.
- The **Riddle Engine** checks the answer (OpenAI API), decides which hint tier or success state applies, and returns UI copy + structured events.
- Events include `riddle_solved`, `hint_requested`, `wrong_answer`, and flow-control markers (e.g., `skip_to_finale`).
- The **Lighting Bridge** subscribes to events and calls the Govee API (Google Home automation can be added later once supported).
- The **Audio System** reacts to the same events on the frontend to keep audio cues in sync.

## Environments & Secrets
- **Local Dev**: Run everything on a laptop; mock lighting/audio to avoid noise.
- **Event Day**: Frontend hosted on GitHub Pages/Vercel, Riddle Engine + Lighting Bridge on a small Node server (local or cloud).
- Required secrets: `OPENAI_API_KEY`, `GOVEE_API_KEY`, optional `SENTRY_DSN`.
- Keep `.env.local` files out of the repo; document expected variables in each submodule README.

## Integration Points
- **Frontend ↔ Riddle Engine**: JSON contract with `status`, `message`, `events`, and `next_prompt`. Draft schema lives in `Answer Submission Mechanism.md`.
- **Riddle Engine ↔ Lighting Bridges**: Webhook or lightweight message queue (e.g., SSE) that passes `{event, riddleId, payload}`.
- **Frontend ↔ Audio System**: Shared hook inside the React app that maps events to sound files in `src/assets/sounds/`.

## Implementation Order
1. Finalize answer formats per riddle (`02_Riddle_Content/`).
2. Build the Riddle Engine prompt/validation logic.
3. Stand up the frontend with mocked responses.
4. Add lighting/audio integrations and test event timing.
5. Run `05_Testing_and_Execution/Full_Run_Test_Plan.md` with the full stack turned on.

## Related Docs
- [[03_Technical_Systems/Answer Submission Mechanism]] – API contract details.
- [[03_Technical_Systems/GitHub Pages Implementation]] – hosting instructions.
- [[03_Technical_Systems/Special Effects Options]] – ideas for mapping events to lights/audio.
