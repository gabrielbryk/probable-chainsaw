# Luminous Glyph – Glow-In-The-Dark Message Planner

## Snapshot
- **Narrative Anchor**: Connects to Joy's crystal fascination—"minerals that absorb light and release secrets." The riddle directs her to a darkened cabinet where a glow-painted sigil appears only after charging it with light.
- **Mechanic**: Joy must expose the clue card (painted with phosphorescent ink) to a UV flashlight, then enter the dark space to read the hidden text that reveals the next location/password.
- **Emotional Beat**: Wonder + tactile exploration, placed between geological and musical segments.
- **Difficulty Target**: ⭐⭐⭐ (sensory novelty, simple deciphering).

## Status Tracker
- [ ] Decide placement (bookshelf cabinet vs. crystal shelf)
- [ ] Draft riddle text referencing phosphorescence
- [ ] Design sigil/message (glyph + cipher overlay)
- [ ] Source glow ink + UV flashlight + storage box
- [ ] Test charging/visibility timing
- [ ] Document safety note (avoid direct UV to eyes)

## Riddle Structure Notes
1. **Clue Text**: "Some stones drink starlight. Bathe them for thirteen breaths, then carry the afterglow into the dark to read what the earth wrote." Hidden glyph spells password (e.g., `LARIMAR13`).
2. **Hint Ladder**:
   - Gentle: "Think about crystals that change after living in light."
   - Directional: "Use the UV torch tucked beside your opal." 
   - Direct: "Charge the painted sigil for 20 seconds, then step into the hallway closet to read the glowing message." 
   - Solution: "The message reads 'TUNE THE SILVER PIPE' → go to your flute case."
3. **Answer Validation**: Could require typing discovered word into frontend or simply directs to next physical clue.

## Physical Setup Plan
- Paint message on black cardstock using phosphorescent ink + fine brush; overlay decorative spiral outlines visible even when unlit. 
- Store card inside small wooden box with UV flashlight + instruction slip (no spoilers) hidden under crystal display.
- Attach glow tape arrows subtly guiding the direction once lights are off.
- Ensure there is a dark nook (closet/bathroom) Joy can step into; tape note reminding to turn off lights for effect.

## Technical Setup Plan (Optional)
If integrating with digital flow:
- Generate QR code printed in glow ink that, once visible, can be scanned with phone light to open `hunt.local/glow` page for the next puzzle.
- Frontend page dims screen, plays ambient “crystal resonance” audio (Tune.js). When Joy confirms she read the word, backend logs event and triggers `lighting.crystal_shimmer` (aligned with Riddle Flow Map row).

## Materials & Tools
- Phosphorescent paint/ink (green-blue for readability)
- Fine paintbrush + stencil for glyph
- Black cardstock or acrylic panel
- Small UV flashlight (AAA batteries) + spare batteries
- Container/box padded with velvet or felt
- Gloves/paper towels to avoid smudges

## Testing Checklist
- [ ] Glow legible after 15s charge + 30s read window
- [ ] Instructions survive handling (laminate to prevent smears)
- [ ] Flashlight battery life >30 minutes continuous
- [ ] Card fits snugly; no accidental light exposure before reveal
- [ ] Safety note present (no shining UV into eyes/skin)

## Risks & Mitigations
- **Ink flakes/smudges** → Spray light sealant (fixative) after drying.
- **Ambient light ruins effect** → Stage in area with door; place "close door for magic" tag.
- **Joy forgets to charge card** → Add subtle line in clue: "Only after feeding it light will the message wake."

## Open Questions
1. Should the hidden text be direct instructions or a cipher (e.g., glowing runes map to letters)?
2. Do we integrate crystals physically (card tucked under opal water dish) to reinforce theme?
3. Would a timed lighting cue (smart bulb off) enhance the darkness automatically when she opens the box?
