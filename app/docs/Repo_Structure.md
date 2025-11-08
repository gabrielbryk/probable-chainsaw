# Repo Structure Plan (Based on wasp-lang/open-saas template)

## Reference Template Highlights (`wasp-lang/open-saas/template/app`)
- `src/client/`: UI-only code (pages, components, hooks, landing assets). Imports remain client-side safe.
- `src/server/`: Back-end logic (actions, queries, services, integrations, auth helpers).
- `src/shared/`: Cross-cutting utilities/types consumed by both client + server.
- `src/components/`, `src/lib/`, etc. break work into feature folders (auth, payment, analytics, etc.).
- `main.wasp` references client pages via `@src/client/...` and server operations via `@src/server/...` keeping intent explicit.

## Joy Hunt Alignment
- **`src/client/`** now holds `components/AppLayout.tsx` and `pages/*`. Future UI modules (guide chat, celebration overlay, hooks) will live here.
- **`src/server/`** now contains actions, queries, config, integrations, and upcoming services/state-machine logic.
- **`src/shared/`** (to be added as needed) will store data contracts, constants, helpers reused across layers.
- `main.wasp` imports updated accordingly, mirroring the template’s separation of concerns.

This layout keeps parity with the popular Wasp open-saas template, making it easier to apply documentation/tooling from that ecosystem while keeping the Joy Hunt specifics organized.
