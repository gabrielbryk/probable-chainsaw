# Siren's Resonance – Microphone Singing Planner

## Snapshot
- **Narrative Anchor**: After exploring emotional depth (Ocean Vuong), Joy must "let her own voice surface" by singing a specific lyric fragment into the Guide—mirroring Ocean Vuong's bilingual vulnerability and Joy's love of performance.
- **Mechanic**: Web app records a short vocal snippet via the device mic. A lightweight pitch contour + lyric keyword check confirms she sang the requested line (e.g., opening bar of "Jupiter" from *The Planets* arrangement she performed, or a Matt Maeson verse). Successful detection unlocks the next clue and triggers a celebratory lighting pulse.
- **Emotional Beat**: Cathartic vulnerability → Act 2 deep-middle.
- **Difficulty Target**: ⭐⭐⭐ (emotional challenge more than logic puzzle).

## Status Tracker
- [ ] Select song/lyric (confirm Joy is comfortable singing it)
- [ ] Draft riddle text that leads to lyric identification
- [ ] Record reference clip for tuning/pitch detection
- [ ] Build mic capture UI + permissions flow
- [ ] Implement pitch/keyword validator + fallback manual approval
- [ ] Prepare privacy note + reassure recordings stay local

## Riddle Structure Notes
1. **Clue Concept**: Riddle references "the boy who asked the moon for a throat" (Ocean Vuong) and "the hymn you hummed while soldering googly eyes"—pointing to a known song. Final line: "Gift the Guide the first eight beats of that confession." 
2. **Expected Answer**: Singing (or speaking) the lyric "..."; fallback typed answer `song_title` accepted if Joy declines singing.
3. **Hint Ladder**: 
   - Gentle: "Think of the piece you perform when you need courage."
   - Directional: "It's the song whose pre-chorus mentions galaxies / the poet's storm."
   - Direct: "Sing the first line of [Song Title] into the mic." 
   - Solution: "Tap 'record', sing or speak '[lyric]'. I'll take it from there."

## Physical Setup Plan
- Place this riddle card inside the poetry book so tone shift feels natural.
- Provide phone stand/tripod near cozy seating so Joy can face mic comfortably.
- Include note reassuring: "Recording never leaves this device." (aligns with psychological safety in `Hint_Philosophy`).
- Optional prop: Crystal-shaped pop filter or cloth to tie to prior riddle.

## Technical Setup Plan
| Component | Details |
| --- | --- |
| Frontend UI | Dedicated "Sing to unlock" screen with record button, waveform preview, retry option. Use Web Audio API to capture 5-second clip. |
| Validation | Simple algorithm: (a) detect relative pitch contour (within ±20%); (b) run keyword spotting on text using on-device speech-to-text or send to backend for Whisper transcription. Accept success if either pitch contour or keyword match passes threshold. |
| Backend | Endpoint `/api/audio-check` receives PCM blob, runs pitch/keyword analysis (can offload to Python script). On success, emit `riddle_solved` + `lighting.vocal_warmth`. |
| Storage | Do not persist raw audio; discard after evaluation. Log metadata only (timestamp, pass/fail). |
| Accessibility | Provide "I'd rather not sing" button leading to typed challenge (short poem translation) to avoid forcing Joy if uncomfortable. |

## Materials & Tools
- Smartphone/tablet with high-quality mic + stand
- Quiet corner (soft furnishings reduce echo)
- Comfort cue (small sign: "You sound incredible already")
- Optional warm tea waiting to encourage vocal comfort

## Testing Checklist
- [ ] Mic permission prompt copy reviewed (warm language)
- [ ] Background noise tolerance tested (AC, hallway noise)
- [ ] Keyword spotting accuracy >90% in quiet room
- [ ] Retry/skip flow tested on both mobile + desktop
- [ ] Lighting/audio cues stay in sync after success

## Risks & Mitigations
- **Performance anxiety** → Provide opt-out path; hints reassure "humming counts".
- **Tech failure** → Manual override button for Gabe + typed answer fallback.
- **Network latency** → Keep analysis local/offline when possible; pre-load models before hunt.

## Open Questions
1. Which lyric best balances emotional resonance and recognizability for Joy?
2. Should we record a harmony reference the Guide can play back before she sings?
3. Do we want the recording to trigger any physical artifact (e.g., light strip that pulses to her voice) for added delight?
