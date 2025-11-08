# Project Roadmap - Outstanding Tasks

**Last Updated**: 2025-10-27
**Current Phase**: Content Finalization
**Target Event Date**: [TBD]

---

## 🎯 Quick Status

**✅ COMPLETED**:
- Project restructuring
- All documentation frameworks created
- File organization complete
- Canonical-doc cleanup (`Riddle_Flow_Map`, Physical Setup Guide, System Architecture Overview)

**🔄 IN PROGRESS**:
- Content finalization (riddles, narrative decisions)

**⏸️ NOT STARTED**:
- Technical systems build
- Physical crafting
- Testing
- Execution

---

## 📋 All Outstanding Tasks

### PHASE 1: Content Finalization (CURRENT)
**Goal**: Lock down all creative decisions before building anything

**Estimated Time**: 3-5 hours
**Can Start**: NOW
**Blocks**: Everything else

#### 1.1 Narrative Decisions ⏱️ 1-2 hours

**Can Do in Parallel**:
- [ ] Review `Narrative_Bible.md` - confirm themes resonate
- [ ] Review `Plot_Arc_and_Guide_Voice.md` - approve emotional arc
- [ ] Review `Hint_Philosophy.md` - confirm 4-tier approach feels right
- [ ] Decide: Do you want LLM guide or will you deliver hints manually?
- [ ] Decide: Do you want smart lighting effects or skip them?
- [ ] Decide: Do you want audio cues or silent hunt?

**Must Do Sequentially**:
1. Make tech decisions above (LLM, lights, audio)
2. Record decisions in this roadmap’s Quick Status block (update ✅/🔄 lists) and adjust `README.md` only if the public overview changes

**Deliverable**: Clear "yes/no" on each technical component

---

#### 1.2 Riddle Finalization ⏱️ 2-3 hours

**For Each Riddle (Review independently; ordering decided later)**:
- [ ] **Junji Ito Spiral**: Choose difficulty level (⭐⭐⭐, ⭐⭐⭐⭐, or ⭐⭐⭐⭐⭐)
- [ ] **Ocean Vuong Poetry**: Choose difficulty level
- [ ] **Crystal Collection**: Choose difficulty level + which crystal (Larimar/Opal/Smoky Quartz)
- [ ] **Flute Music**: Choose difficulty level
- [ ] **Pop Culture**: Choose theme (EEAAO/Swiss Army Man/Arcane) + difficulty
- [ ] **Wavelength Game**: Choose difficulty level
- [ ] **Gaming Area**: Decide if including or skipping
- [ ] **Okami Poster (optional)**: Decide if including or skipping

**For Each Riddle Chosen**:
- [ ] Confirm accepted answers list is complete
- [ ] Verify hints are strong enough (read all 4 tiers)
- [ ] Confirm physical hiding spot is viable in your apartment
- [ ] Note any special materials needed (waterproofing, etc.)

**Sequentially After All Riddles Reviewed**:
1. [ ] Update `Riddle_Flow_Map.md` with the final sequence, difficulty picks, and timing (this is the canonical flow doc)
2. [ ] Confirm total expected time (30-45 min) and adjust the Duration & Timing block in `Riddle_Flow_Map.md` if it changes
3. [ ] Capture any material impacts (special paper, props) in `04_Physical_Production/Crafting_Plan.md`

**Deliverable**: Finalized riddle text for each, confirmed sequence, materials list

---

#### 1.3 Opening & Finale Content ⏱️ 30 min

**Can Do in Parallel**:
- [ ] Choose starting letter variant from `Starting Letter Options.md`
- [ ] Review/edit finale message in `Final Reveal Message.md`
- [ ] Decide on finale gift/experience (what's the actual present?)

**Deliverable**: Opening letter text, finale message, gift decision

---

#### 1.4 Content Sign-Off ⏱️ 15 min

**Must Do Sequentially** (after all above):
- [ ] Read through entire flow start-to-finish one time
- [ ] Confirm emotional arc feels right
- [ ] Ensure all transitions between riddles make sense
- [ ] Sign off: "Content is LOCKED - ready to build"

**Deliverable**: Content freeze - no more changes to riddles/narrative

---

## DECISION POINT: Technical vs. Analog

**After Phase 1, choose ONE path**:

### PATH A: Full Technical Build
Includes LLM guide, smart lighting, audio, web interface
→ Continue to Phase 2A (Technical Build)

### PATH B: Analog/Manual
No LLM (you deliver hints), no lights, no audio
→ Skip to Phase 3 (Physical Production)

### PATH C: Hybrid
Pick and choose (e.g., lights yes, LLM no)
→ Do only chosen parts of Phase 2A

---

## PHASE 2A: Technical Build (OPTIONAL)
**Goal**: Build the digital infrastructure

**Estimated Time**: 10-20 hours (depending on scope)
**Can Start**: After Phase 1 complete
**Blocks**: Nothing (Physical production can happen in parallel)

### 2A.1 System Architecture ⏱️ 1 hour

**Must Do Sequentially**:
1. [ ] Review and update `03_Technical_Systems/System_Architecture_Overview.md` (single source for architecture decisions)
2. [ ] Document hosting choices + deployment targets inside that file
3. [ ] List required env vars/secret storage plan in each subsystem README
4. [ ] Collect API keys/tokens (OpenAI, Govee, Google Home webhooks, etc.)

---

### 2A.2 LLM Guide (if chosen) ⏱️ 4-6 hours

**Can Do in Parallel After Architecture**:
- [ ] Create riddle validation prompts (one per riddle)
- [ ] Build answer parsing logic (fuzzy matching)
- [ ] Implement hint escalation system
- [ ] Test with example inputs

**Must Do Sequentially**:
1. [ ] Integrate all prompts
2. [ ] Test full flow with all 7 riddles
3. [ ] Document in `03_Technical_Systems/Riddle_Engine/`

---

### 2A.3 Frontend Interface (if chosen) ⏱️ 4-6 hours

**Can Do in Parallel** (separate from LLM):
- [ ] Set up React + Vite project
- [ ] Create chat interface component
- [ ] Add riddle input/submission
- [ ] Implement progress tracker
- [ ] Add celebration animations (confetti)

**Must Do Sequentially**:
1. [ ] Integrate with LLM backend
2. [ ] Test on mobile (Joy's device)
3. [ ] Deploy to hosting

---

### 2A.4 Smart Lighting (if chosen) ⏱️ 3-5 hours

**Can Do in Parallel** (separate from LLM/Frontend):
- [ ] Set up Govee Developer API access
- [ ] Create lighting bridge Node.js server
- [ ] Map riddle events to light effects
- [ ] Test each effect manually

**Must Do Sequentially**:
1. [ ] Integrate with LLM (or manual triggers)
2. [ ] Test full sequence in apartment
3. [ ] Create manual backup (if automated fails)

---

### 2A.5 Audio System (if chosen) ⏱️ 2-3 hours

**Can Do in Parallel** (separate from all other systems):
- [ ] Choose/create sound files for each riddle
- [ ] Set up Tone.js or simple audio playback
- [ ] Map events to sounds

**Must Do Sequentially**:
1. [ ] Integrate with frontend or manual triggers
2. [ ] Test volume levels in apartment

---

### 2A.6 Technical Integration Testing ⏱️ 2-3 hours

**Must Do Sequentially** (after all chosen systems built):
1. [ ] Test full flow: riddle → LLM → answer → lights → audio
2. [ ] Verify mobile experience
3. [ ] Test backup/fallback modes
4. [ ] Document troubleshooting in `03_Technical_Systems/`

---

## PHASE 3: Physical Production
**Goal**: Craft all physical components

**Estimated Time**: 6-10 hours (spread over several days)
**Can Start**: After Phase 1 complete (doesn't need Phase 2)
**Blocks**: Phase 4 (Testing)

**Reference Docs**: `04_Physical_Production/Crafting_Plan.md`, `04_Physical_Production/Placement_Map.md`, and the updated `04_Physical_Production/Setup and Testing Guide.md` (physical setup best practices).

### 3.1 Shopping ⏱️ 1-2 hours

**Can Do in One Trip**:
- [ ] Purchase all materials from `Materials Shopping List.md`
- [ ] Get finale gift/components
- [ ] Buy any decorative elements

**Deliverable**: All materials acquired

---

### 3.2 Design & Templates ⏱️ 1-2 hours

**Can Do in Parallel**:
- [ ] Design riddle card template (borders, colors, fonts)
- [ ] Create decorative elements (spirals, stars, etc.)
- [ ] Design opening letter layout
- [ ] Design finale message layout

**Deliverable**: Printable templates ready

---

### 3.3 Printing & Writing ⏱️ 2-3 hours

**Can Do in Parallel** (or batch):
- [ ] Print all riddle backgrounds/borders
- [ ] Print or handwrite opening letter
- [ ] Print or handwrite finale message
- [ ] Handwrite riddle text on cards (or print)

**Quality Check After Each**:
- [ ] Legible and error-free
- [ ] Matches chosen difficulty level
- [ ] Fits in envelope/container

**Deliverable**: All cards printed/written

---

### 3.4 Assembly ⏱️ 2-3 hours

**Must Do Sequentially** (after printing):
1. [ ] Cut all cards to size
2. [ ] Add decorative elements (ribbon, googly eyes, etc.)
3. [ ] Place cards in envelopes/sleeves
4. [ ] Label sequence on back (for yourself)
5. [ ] Waterproof crystal riddle
6. [ ] Assemble finale box/package

**Quality Check**:
- [ ] All envelopes close securely
- [ ] Cards protected from damage
- [ ] Sequence is clear

**Deliverable**: All physical components ready to hide

---

## PHASE 4: Testing
**Goal**: Validate end-to-end experience

**Estimated Time**: 2-3 hours
**Can Start**: After Phase 3 (and Phase 2 if doing tech)
**Blocks**: Phase 5 (Execution)

### 4.1 Placement Test ⏱️ 30 min

**Must Do Sequentially**:
1. [ ] Place all clues in hiding spots (reverse order)
2. [ ] Verify each is secure and discoverable
3. [ ] Check apartment lighting
4. [ ] Test walking path between locations
5. [ ] Follow the checklist in `04_Physical_Production/Setup and Testing Guide.md` for any location-specific notes

**Deliverable**: Confidence in physical placement

---

### 4.2 Full Walkthrough ⏱️ 45-60 min

**Must Do Sequentially** (follow `Full_Run_Test_Plan.md`):
1. [ ] Read opening letter
2. [ ] Solve all riddles (or identify answers)
3. [ ] Time each riddle
4. [ ] Test hint system (LLM or manual)
5. [ ] Test lighting/audio if using
6. [ ] Experience finale

**Track**:
- Total time: _________
- Hardest riddle: _________
- Issues found: _________

**Deliverable**: Timed test with issues documented

---

### 4.3 Technical System Test ⏱️ 30-45 min (if using tech)

**Can Do in Parallel** with walkthrough or separate:
- [ ] Test LLM with all riddles
- [ ] Test lighting effects in sequence
- [ ] Test audio cues
- [ ] Test manual fallback modes

**Deliverable**: All systems functional or backup plan ready

---

### 4.4 Adjustments ⏱️ 30-60 min

**Must Do Sequentially** (after walkthrough):
1. [ ] Fix any issues found
2. [ ] Reprint any cards if needed
3. [ ] Adjust hiding spots if problematic
4. [ ] Update timing expectations
5. [ ] Prepare backup hints if riddles too hard

**Deliverable**: Hunt is tested and refined

---

## PHASE 5: Execution
**Goal**: Deliver the experience to Joy

**Estimated Time**: 3-4 hours total (setup + hunt + celebration)
**Can Start**: Event day (after all previous phases)

### 5.1 Morning Setup ⏱️ 40-60 min

**Follow `Execution_Guide.md` exactly**:

**Can Do in Parallel** (first 10 min):
- [ ] Tidy apartment
- [ ] Set comfortable temperature
- [ ] Gather all materials

**Must Do Sequentially** (next 30 min):
1. [ ] Place finale first
2. [ ] Place riddles in reverse order (7→6→5→4→3→2→1)
3. [ ] Test one lighting effect
4. [ ] Have backup materials ready
5. [ ] Place opening letter LAST

**Final Checks** (10 min):
- [ ] Quick walkthrough
- [ ] Verify all clues in place
- [ ] Tech systems ready (if using)
- [ ] YOU are calm and ready

---

### 5.2 The Hunt ⏱️ 30-45 min (Joy's time)

**Your Role**:
- [ ] Give Joy the opening letter
- [ ] Stay nearby but not hovering
- [ ] Watch for frustration/joy
- [ ] Deliver hints per `Hint_Philosophy.md`
- [ ] Celebrate each success
- [ ] Take photos/videos
- [ ] Stay flexible (skip riddles if needed)

**Track**:
- Start time: _________
- Hints given: _________
- Riddles skipped: _________
- End time: _________

---

### 5.3 Finale & Celebration ⏱️ 30+ min

**Must Do Sequentially**:
1. [ ] Guide Joy to finale location
2. [ ] Give space for emotional reaction
3. [ ] Present gift/experience
4. [ ] Celebrate together
5. [ ] Discuss favorite parts

---

### 5.4 Post-Event ⏱️ 30 min (later)

**Can Do Anytime After**:
- [ ] Complete `Post_Event_Review.md`
- [ ] Save photos/videos
- [ ] Document lessons learned
- [ ] Save riddle cards as keepsakes

---

## PARALLELIZATION MAP

### What Can Happen Simultaneously?

**PHASE 1** (Content Finalization):
- ✅ Review all narrative docs at once
- ✅ Review all riddles at once
- ✅ Opening letter + finale decisions parallel
- ❌ Can't do final sign-off until all reviews done

**PHASE 2A** (Technical Build) - **HIGHLY PARALLEL**:
- ✅ LLM Guide can be built separately from Frontend
- ✅ Lighting Bridge can be built separately from LLM
- ✅ Audio System can be built separately from everything
- ✅ Frontend + LLM + Lighting + Audio = 4 parallel tracks
- ❌ Integration testing must wait for all to finish

**PHASE 3** (Physical Production):
- ✅ Design templates while materials are being shipped
- ✅ Print multiple cards at once (batch)
- ❌ Assembly must wait for printing to finish

**PHASE 2A + PHASE 3 CAN HAPPEN IN PARALLEL**:
- ✅ You can build tech while crafting physical components
- ✅ Completely independent workflows
- ❌ Both must finish before testing

**PHASE 4** (Testing):
- ✅ Tech tests can happen separately from physical tests
- ❌ Full walkthrough must test everything integrated

**PHASE 5** (Execution):
- ❌ Entirely sequential (setup → hunt → celebration)

---

## CRITICAL PATH

**Minimum Required Path** (no optional elements):

```
Phase 1: Content Finalization (3-5 hours)
   ↓
Phase 3: Physical Production (6-10 hours, can spread over days)
   ↓
Phase 4: Testing (2-3 hours)
   ↓
Phase 5: Execution (3-4 hours on event day)

TOTAL: 14-22 hours of work
```

**With Full Technical Build**:

```
Phase 1: Content Finalization (3-5 hours)
   ↓
   ├─→ Phase 2A: Technical (10-20 hours)
   └─→ Phase 3: Physical (6-10 hours)  ← PARALLEL
   ↓
Phase 4: Testing (3-4 hours, longer with tech)
   ↓
Phase 5: Execution (3-4 hours)

TOTAL: 25-43 hours of work
```

---

## DECISION TREE

**START**: Do you want technical systems?

→ **YES**:
  - Timeline: ~4-6 weeks (for proper build + test)
  - Work: 25-43 hours
  - Path: Phase 1 → 2A + 3 → 4 → 5

→ **NO**:
  - Timeline: ~2 weeks (crafting + test)
  - Work: 14-22 hours
  - Path: Phase 1 → 3 → 4 → 5

→ **PARTIAL** (e.g., lights yes, LLM no):
  - Timeline: ~3-4 weeks
  - Work: 18-30 hours
  - Path: Phase 1 → 2A (partial) + 3 → 4 → 5

---

## RECOMMENDED TIMELINE

### If Event is 4+ Weeks Away:
**Week 1**: Phase 1 (Content Finalization)
**Week 2-3**: Phase 2A (Tech Build) + Phase 3 (Physical) in parallel
**Week 4**: Phase 4 (Testing) + buffer time
**Event Day**: Phase 5 (Execution)

### If Event is 2-3 Weeks Away:
**Skip Phase 2A** (no tech build)
**Week 1**: Phase 1 (Content Finalization)
**Week 2**: Phase 3 (Physical Production)
**Week 3**: Phase 4 (Testing) + buffer
**Event Day**: Phase 5 (Execution)

### If Event is 1 Week Away:
**Days 1-2**: Phase 1 (Content - rush)
**Days 3-5**: Phase 3 (Physical - rush)
**Day 6**: Phase 4 (Testing)
**Day 7**: Phase 5 (Execution)
**Skip**: All technical systems

---

## NEXT IMMEDIATE ACTIONS

**RIGHT NOW** (this week):

1. [ ] **Decide**: What's your event date? (determines timeline)
2. [ ] **Decide**: Tech build yes/no/partial?
3. [ ] **Decide**: How much time can you dedicate per week?
4. [ ] Update the Quick Status block at the top of this file with those decisions (this roadmap is the planning source of truth)

**THEN** (next session):

5. [ ] Start Phase 1.1: Review all narrative docs (1 hour)
6. [ ] Start Phase 1.2: Review all riddles, choose difficulty (2 hours)
7. [ ] Complete Phase 1.3: Finalize opening/finale (30 min)
8. [ ] Complete Phase 1.4: Content sign-off (15 min)

**TOTAL FOR PHASE 1: One focused 3-5 hour session could complete it all**

---

## TRACKING TEMPLATE

**Use this to track progress**:

```
PHASE 1: Content Finalization
  [ ] 1.1 Narrative Decisions
  [ ] 1.2 Riddle Finalization
  [ ] 1.3 Opening & Finale
  [ ] 1.4 Content Sign-Off
  Status: ___% complete

PHASE 2A: Technical Build (if doing)
  [ ] 2A.1 System Architecture
  [ ] 2A.2 LLM Guide
  [ ] 2A.3 Frontend
  [ ] 2A.4 Smart Lighting
  [ ] 2A.5 Audio
  [ ] 2A.6 Integration Testing
  Status: ___% complete

PHASE 3: Physical Production
  [ ] 3.1 Shopping
  [ ] 3.2 Design & Templates
  [ ] 3.3 Printing & Writing
  [ ] 3.4 Assembly
  Status: ___% complete

PHASE 4: Testing
  [ ] 4.1 Placement Test
  [ ] 4.2 Full Walkthrough
  [ ] 4.3 Technical Test (if applicable)
  [ ] 4.4 Adjustments
  Status: ___% complete

PHASE 5: Execution
  [ ] 5.1 Morning Setup
  [ ] 5.2 The Hunt
  [ ] 5.3 Finale & Celebration
  [ ] 5.4 Post-Event Review
  Status: ___% complete
```

---

**BOTTOM LINE**:

**Phase 1 is your immediate focus** - finalize all creative content.
**Everything else waits** until you've made key decisions about tech vs. analog.
**Most work can be parallelized** once you get past Phase 1.

What's your timeline and tech preference? That determines your next moves.
