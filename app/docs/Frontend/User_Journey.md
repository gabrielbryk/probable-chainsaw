# Joy's Frontend Journey

## 1. Invitation & Framing
- Gabe preps the apartment, opens the UI on Joy's iPad/phone, and hands it to her.
- Landing page greets her with custom copy, gives brief instructions, and a single primary button: `Begin the Hunt`.
- Optional: short ambient audio cue + subtle animation to signal “the guide is awake” while Gabe watches nearby.

## 2. Riddle Intake Loop
Each riddle follows a predictable flow so Joy always knows what to do next:
1. **Riddle Header** – shows title, icon, and difficulty.
2. **Narrative Block** – descriptive text or multimedia clue.
3. **Answer Field** – single input, with immediate validation states (idle, checking, solved).
4. **Hint Drawer** – collapsed by default; expands to show tiered hints from the AI Guide.
5. **Guide Sidebar** – conversational log where Joy can ask the Guide questions.

Interactions:
- Typing an answer and hitting `Enter` sends it to the backend; UI shows loading pulse until response.
- Wrong answer returns warm feedback + updates attempt counter.
- After three misses the hint button pulses, inviting Joy to open it (Gabe can always step in physically, but the UI keeps the fiction alive).

## 3. Celebration Moments
- When a riddle is solved the UI triggers confetti, plays the matching Tune.js cue, and displays the next action (e.g., “Check the flute case”).
- Smart lights/piano cues fire based on backend game state—no status indicator is shown to Joy so the effect feels like pure magic.

## 4. Progress & Time Awareness
- Sticky top bar shows current stage (1/7), elapsed time since start, and a `Need Help` button that pings Gabe/Admin.
- A mini-map modal (optional) can show completed riddles with timestamps for post-game recap.

## 5. Finale & Wrap-Up
- Final solve transitions to a full-screen celebration with custom message, photo, or video.
- Offers buttons: `Replay Celebration`, `Save Transcript`, `End Hunt`.
- Backend logs completion time + effect history for debrief.

## Design Notes
- Keep controls giant and obvious so adrenaline doesn’t cause misclicks.
- Dark gradient background (#764ba2 → #0b0b0f) with gold accent (#f5a623) for buttons.
- Responsiveness: optimized for phone-in-hand play, but should also look good on tablet/laptop (host may monitor).

## Future Enhancements
- “Skip” affordance that requires confirmation code (host uses when puzzle fails IRL).
- Inline media viewer for audio/image clues per riddle.
- Shared view mode so Gabe can watch progress remotely.
