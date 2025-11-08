# Guide Integration

**Scope**: External adapter that connects Game Master to the OpenAI Responses API (or mock).
- Responsible for sending structured conversation payloads, handling API auth, parsing responses, caching identical requests, extracting usage stats, and returning normalized text/metadata.
- Offers helper utilities (`buildHintRequest`, optional persona/prompt overrides, streaming stub) so upstream services can stay thin.
- Does **not** own prompt templates, persona definition, transcript storage, or hint escalation rules — those belong in higher-level services (e.g., GuideService).
- Does **not** decide when to send hints; Game Master computes context and calls this adapter.

**Testing**: provides `runSelfTest()` to send a lightweight prompt when using the real adapter; mock adapter echoes input for local testing.
