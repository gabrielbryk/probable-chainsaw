# Celestial Étude – Piano Mechanic Planner

## Snapshot
- **Narrative Anchor**: Joy decodes a cosmic poem referencing constellations/flute repertoire that map to specific piano keys. Playing the right triad unlocks the next clue, embodying the "spiral of harmony" motif from the Narrative Bible.
- **Mechanic**: Joy must play a three-chord sequence (e.g., Dm → G → C) on the electric piano/keyboard. The web app listens via Web MIDI (preferred) or Web Audio pitch detection and emits a `riddle_solved` event when the pattern is recognized.
- **Emotional Beat**: Technical mastery + wonder (Act 2 celebration) while foreshadowing the finale's musical reveal.
- **Difficulty Target**: ⭐⭐⭐⭐ (multi-step decoding + physical action).

## Status Tracker
- [ ] Narrative text drafted (riddle + hint ladder)
- [ ] Chord/interval mapping locked
- [ ] Physical card designed + printed
- [ ] Keyboard position + laptop stand staged
- [ ] MIDI/pitch detection prototype tested
- [ ] Backup "manual validate" path documented

## Riddle Structure Notes
1. **Clue Text**: Poetry references Fibonacci numbers (1, 1, 2, 3, 5) mapped to solfege syllables. Each number pair points to a constellation whose first letter equals a chord tone (e.g., *Lyra* → L → corresponds to note A because of tuning reference). The final stanza instructs: "Let the lunar spiral fall in minor thirds—play them, and the light will answer." 
2. **Hint Ladder** (to be written in `Riddle_Text.md` later):
   - Gentle: "Consider the instrument that lets harmonics become constellations."
   - Directional: "Map the Fibonacci pairs to intervals you play when warming up on keys."
   - Direct: "Play D minor, G major, C major in sequence on the keyboard in the living room."
   - Solution: "Press D-F-A, then G-B-D, then C-E-G—wait for the Guide to confirm."
3. **Answer Validation**: Accept either MIDI note-on pattern (preferred) or typed answer `"D G C"` if manual fallback triggered.

## Physical Setup Plan
- Position keyboard so Joy can sit/stand comfortably; ensure sustain pedal is taped down if needed.
- Place riddle card in flute case (ties to music theme) so she walks to piano next.
- Add subtle spiral decal on keyboard to mark starting key (optional).
- Stage laptop/tablet with frontend already open to the "Enter the harmony" screen and headphones unplugged for ambient audio.
- Provide small stand for riddle card so she can read while playing.

## Technical Setup Plan
| Task | Owner | Notes |
| --- | --- | --- |
| Enable Web MIDI in frontend | Game backend dev | Browser must support Web MIDI (Chrome). Prompt Joy to allow device access. |
| Map expected sequence | Game backend dev | Listen for three consecutive chord matches within 30 seconds; tolerances ±25 cents, allow inversions. |
| Event wiring | Backend | On success emit `lighting.piano_success` + audio cue `silver-flow` (see `Special Effects Options`). |
| Manual override UI | Frontend | Hidden admin button for Gabe to mark success if MIDI fails; logs reason. |

## Materials & Tools
- Electric piano or MIDI keyboard + power + sustain pedal
- USB-B→USB-C cable (or Bluetooth MIDI adapter)
- Laptop/tablet running hunt frontend with microphone permission as backup
- Tripod/phone mount to record moment (optional)
- Riddle card (5x7) + envelope referencing constellations

## Testing Checklist
- [ ] MIDI device recognized after reboot
- [ ] Latency under 200ms; no stuck notes
- [ ] Incorrect chords do not trigger success
- [ ] Manual override tested (button + log entry)
- [ ] Lighting/A/V cues fire once (no repeats)

## Risks & Mitigations
- **MIDI unsupported** → Use Web Audio pitch detection; reduce requirement to single-notes (melody) to improve accuracy.
- **Room noise interferes** → Plug keyboard directly instead of mic; if forced to use mic, schedule test when space is quiet.
- **Joy feels rusty on piano** → Provide optional staff notation on card showing interval leaps; hints emphasize "it doesn't need to be perfect".

## Open Questions
1. Which exact melody/chord progression ties best to Joy's repertoire (Debussy, Matt Maeson, etc.)?
2. Do we want the Guide to count down (“Ready when you are—three chords to open the next door”) or stay silent until she plays?
3. Should the success effect trigger a nearby smart bulb (icy silver) or the full-room lighting preset?
