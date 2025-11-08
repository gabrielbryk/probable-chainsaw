# Repo Brief for AI Agents


This project has two knowledge sources:
- **`../Game_Planning/`** – canonical design + production notes (Obsidian vault). Read these for narrative intent, puzzle flow, physical setup, and roadmap context.
- **`docs/` (inside `app/`)** – technical documentation co-located with the codebase (e.g., `docs/...`, `docs/DEV_TASKS.md`).

## Mission & Stakeholders
- Deliver the local-only “Game Master” that guides Joy through her 7‑riddle birthday hunt, validates answers, chats via OpenAI, and triggers lighting/audio effects.
- Gabe is the owner; Joy is the end player. Tone must stay warm, supportive, and magical.

## Current State
- `app/` currently contains the raw scaffold produced by `wasp new:ai`. It must be upgraded per the specs in `docs/` and the task list.
- Detailed implementation checklist: `docs/DEV_TASKS.md`. Keep it updated as tasks complete.

## Working Instructions
1. **Read before coding**
   - `docs/System_Architecture_Overview.md`
   - `docs/Game_Master_Design.md`
   - `docs/Frontend/User_Journey.md`
   - `docs/DEV_TASKS.md`
   - Narrative references from `../Game_Planning/**` as needed.
2. **Setup / Run**
   ```bash
   wasp db migrate-dev   # prepare SQLite
   wasp start            # runs backend + frontend
   ```
   Use `.env.server`/`.env.local` (following the forthcoming `.env.example`) for `OPENAI_API_KEY`, `SYSTEM_ADMIN_API_KEY`, `GOVEE_API_KEY`, `GOOGLE_HOME_WEBHOOK_URL`, `DATABASE_URL`, `MOCK_MODE`, etc. Never commit secrets.
3. **Testing & scripts**
   - `wasp test` (once added)
   - Integration self-tests / seed scripts documented in `docs/` as they appear.
   - When using hardware, note whether you ran in mock mode or real mode.
4. **Reporting**
   - Include command outputs (pass/fail) in PR descriptions or status notes.
   - Document any architectural deviation in `docs/DEV_TASKS.md` and inform Gabe.

## Coding Standards
- Use TypeScript/JS modules under `src/`. Organize backend logic into services/helpers rather than dumping everything in `actions.js`.
- React components belong in `src/pages`/`components`, styled with Tailwind (gradient palette per docs). Keep copy synced with `../Game_Planning` content.
- Build the backend as the “Game” brain: state machine, answer validation, guide service, effect dispatcher, and operator API.
- Integration adapters must ship with both mock and real implementations and expose self-test hooks.

## Reference Docs
- Architecture overview: `docs/System_Architecture_Overview.md`
- Game Master design: `docs/Game_Master_Design.md`
- Frontend journey: `docs/Frontend/User_Journey.md`
- Dev task checklist: `docs/DEV_TASKS.md`
- Narrative/lore: `../Game_Planning/**`
- Prompt for regenerating scaffold: `../new_wasp_prompt.md`

Always align code with the documented narrative + technical plan, keep Joy’s experience magical, and coordinate with Gabe for major changes.
