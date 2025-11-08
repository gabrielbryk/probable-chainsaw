# Audio Integration

**Scope**: Bridge between backend effect events and frontend Tune.js playback.
- Responsible for emitting events over WebSocket/SSE (or future transport) so the browser soundboard reacts.
- Does **not** render audio itself; frontend handles actual Tune.js logic.
- No business logic about which cue to play – Game Master encodes that in the `EffectEvent`.

**Testing**: mock logs events; real adapter's `runSelfTest()` will emit a sample WS event (TODO).
