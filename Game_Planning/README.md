# Joy's Birthday Scavenger Hunt

**An Interactive Birthday Experience**

A personalized, multi-layered scavenger hunt combining narrative design, intellectual challenges, and technical systems to create a memorable birthday celebration.

---

## Project Overview

### Vision
Create a scavenger hunt that makes Joy feel deeply seen, celebrated, and loved by weaving together her unique interests into an interactive adventure through familiar spaces.

### Core Experience
- **7 sequential riddles** hidden throughout the apartment
- **30-45 minute journey** from invitation to finale
- **Multi-difficulty levels** adapting to solve speed
- **Technical enhancements** (LLM guide, smart lighting, audio cues)
- **Emotional arc** building from curiosity to celebration

---

## Quick Start Guide

### For Narrative Designers (Adding/Editing Content)

**Start Here**:
1. Read [[01_Narrative_Design/Narrative_Bible]] for thematic framework
2. Review [[02_Riddle_Content/Riddle_Flow_Map]] for current sequence
3. Use [[02_Riddle_Content/Clue_and_Hint_Structure]] as template for new riddles

**Key Files**:
- `01_Narrative_Design/` - Story, voice, emotional arc
- `02_Riddle_Content/` - All riddles, hints, and flow
- `Plot_Arc_and_Guide_Voice.md` - Emotional beats and AI personality

---

### For Developers (Technical Setup)

**Start Here**:
1. Review [[03_Technical_Systems/System_Architecture_Overview]] for the full stack picture
2. Set up LLM Guide integration
3. Configure Smart Home lighting bridge
4. Test web interface

**Technical Stack**:
- **Frontend**: React + Vite + Tailwind (web interface)
- **LLM Guide**: OpenAI API with riddle validation logic
- **Lighting**: Govee API + Google Home webhooks via Node.js bridge
- **Audio**: Tone.js for sound cues

**Note**: Technical documentation lives in `03_Technical_Systems/`; add implementation details there as systems come online.

---

### For Physical Production (Crafting & Setup)

**Start Here**:
1. Read [[04_Physical_Production/Crafting_Plan]] for materials and assembly
2. Review [[04_Physical_Production/Placement_Map]] for hiding spots
3. Follow [[04_Physical_Production/Materials Shopping List]]

**Timeline**:
- **2 weeks before**: Finalize riddles, purchase materials
- **1 week before**: Craft all components
- **2-3 days before**: Run [[05_Testing_and_Execution/Full_Run_Test_Plan]]
- **Day of**: Follow [[05_Testing_and_Execution/Execution_Guide]]

---

## Project Structure

```
Scavenger Hunt/
├── README.md (this file)
│
├── 01_Narrative_Design/
│   ├── Plot_Arc_and_Guide_Voice.md
│   ├── Narrative_Bible.md
│   ├── Hint_Philosophy.md
│   ├── Scavenger Hunt - Core Concept.md
│   ├── Joy's Interests and Themes.md
│   ├── Starting Letter Options.md
│   ├── Final Reveal Message.md
│   ├── Riddle Writing Guide.md
│   └── references/
│
├── 02_Riddle_Content/
│   ├── Clue_and_Hint_Structure.md
│   ├── Riddle_Flow_Map.md
│   ├── Junji_Ito_Spiral/
│   ├── Ocean_Vuong_Poetry/
│   ├── Crystal_Collection/
│   ├── Flute_Music/
│   ├── Pop_Culture/
│   ├── Wavelength_Game/
│   ├── Gaming_Area/
│   ├── Okami_Poster/
│   ├── Answer-Based Riddle Examples.md
│   ├── Final Riddle Template.md
│   └── Archived_Drafts/
│
├── 03_Technical_Systems/
│   ├── System_Architecture_Overview.md
│   ├── GitHub Pages Implementation.md
│   ├── Answer Submission Mechanism.md
│   ├── Escape Room Techniques.md
│   ├── Special Effects Options.md
│   ├── Frontend/
│   ├── Lighting_Bridge/
│   ├── Riddle_Engine/
│   ├── Audio_System/
│   └── references/
│
├── 04_Physical_Production/
│   ├── Crafting_Plan.md
│   ├── Placement_Map.md
│   ├── Safety_and_Backup_Notes.md
│   ├── Materials Shopping List.md
│   ├── Setup and Testing Guide.md
│   ├── Contingency Plans.md
│   └── reference_images/
│
└── 05_Testing_and_Execution/
    ├── Full_Run_Test_Plan.md
    ├── Execution_Guide.md
    ├── Post_Event_Review.md
    ├── Production Timeline.md
    ├── Day-Of Checklist.md
    └── Backup Hints and Help.md
```

---

## The Five Layers Explained

### Layer 1: Narrative Design 📖
**Purpose**: Define the story, emotional arc, and AI guide personality

**When to Use**:
- Planning the overall experience
- Defining themes and emotional beats
- Writing the LLM guide's voice
- Understanding hint escalation philosophy

**Key Documents**:
- `Narrative_Bible.md` - Thematic framework and design principles
- `Plot_Arc_and_Guide_Voice.md` - Story structure and AI persona
- `Hint_Philosophy.md` - Four-tier hint system

---

### Layer 2: Riddle Content 🎯
**Purpose**: All riddles, their logic, answers, hints, and flow

**When to Use**:
- Creating or editing riddles
- Understanding riddle sequence
- Balancing difficulty
- Writing hints for each riddle

**Key Documents**:
- `Riddle_Flow_Map.md` - Visual sequence and connections
- `Clue_and_Hint_Structure.md` - Template and standards
- Individual riddle folders (Junji_Ito_Spiral through Gaming_Area)

---

### Layer 3: Technical Systems 💻
**Purpose**: LLM guide, lighting, audio, and web interface (to be built)

**When to Use**:
- Building the technical infrastructure
- Integrating smart home systems
- Creating the web interface
- Troubleshooting tech issues

**Status**: Placeholder structure created; documentation to be written when building systems

**Planned Components**:
- Frontend (React + Vite)
- LLM Guide (OpenAI API)
- Lighting Bridge (Node.js + Govee/Google Home)
- Audio Engine (Tone.js)

---

### Layer 4: Physical Production 🎨
**Purpose**: Materials, crafting, and physical setup

**When to Use**:
- Shopping for materials
- Crafting riddle cards
- Planning hiding spots
- Day-of placement

**Key Documents**:
- `Crafting_Plan.md` - Detailed assembly instructions
- `Placement_Map.md` - Where each clue goes
- `Safety_and_Backup_Notes.md` - Contingencies and safety

---

### Layer 5: Testing and Execution ✅
**Purpose**: QA, timing, run-throughs, and day-of orchestration

**When to Use**:
- Running practice tests
- Day-of setup and execution
- Post-event reflection

**Key Documents**:
- `Full_Run_Test_Plan.md` - End-to-end testing checklist
- `Execution_Guide.md` - Day-of step-by-step guide
- `Post_Event_Review.md` - Reflection template

---

## Dependencies & Data Flow

```
┌─────────────────────┐
│  Narrative Design   │
│  (Story & Themes)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Riddle Content     │
│  (Puzzles & Flow)   │
└──────────┬──────────┘
           │
           ├─────────────────────┐
           │                     │
           ▼                     ▼
┌──────────────────┐   ┌─────────────────┐
│ Technical Systems│   │Physical Production│
│ (LLM, Lights)   │   │ (Cards, Setup)   │
└──────────────────┘   └─────────────────┘
           │                     │
           └──────────┬──────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │ Testing & Execution  │
           │ (QA & Day-Of)        │
           └──────────────────────┘
```

**Key Insight**: Narrative → Content → Implementation → Execution
Always finalize "soft content" (narrative & riddles) before technical build.

---

## Workflow Overview
`PROJECT_ROADMAP.md` is the single source of truth for schedules, owners, and detailed checklists. Use the snapshot below for orientation, then defer to the roadmap for action items.

- **Phase 1 · Content Finalization** (current): Finish narrative decisions and lock the riddle set using `01_Narrative_Design/` + `02_Riddle_Content/`.
- **Phase 2 · Technical Build** (optional): When ready, follow `03_Technical_Systems/` docs for LLM guide, frontend, lighting, and audio.
- **Phase 3 · Physical Production**: Craft everything listed in `04_Physical_Production/` (materials, placement, contingencies).
- **Phase 4 · Testing**: Run the rehearsal exactly as described in `05_Testing_and_Execution/Full_Run_Test_Plan.md`.
- **Phase 5 · Execution**: Use `05_Testing_and_Execution/Execution_Guide.md` and the day-of checklist to deliver the experience.
- **Phase 6 · Reflection**: Capture lessons and memories in `05_Testing_and_Execution/Post_Event_Review.md`.

Whenever priorities shift, update `PROJECT_ROADMAP.md` first so every other doc stays aligned.

---

## Key Design Principles

### 1. Joy First
Every decision prioritizes Joy's experience over perfect execution. If something isn't working, adapt or abandon it.

### 2. Layered Difficulty
Riddles offer multiple difficulty levels (⭐⭐⭐ to ⭐⭐⭐⭐⭐) so complexity can be adjusted on the fly.

### 3. Hint Philosophy
The four-tier hint system (Gentle → Directional → Direct → Solution) ensures Joy never gets stuck beyond fun.

### 4. Technical as Enhancement
Smart lights, LLM guide, and audio enhance the experience but are not required. The hunt works without them.

### 5. Emotional Arc
The experience builds: Confidence → Tension → Celebration → Finale. Each riddle serves the emotional journey.

### 6. Safety and Backup
Every component has a backup plan. Contingencies are built in so nothing can truly "fail."

---

## Current Status

**Project Phase**: Narrative & Content Finalization

**Completed**:
- ✅ Full project reorganization
- ✅ Narrative design documentation
- ✅ All riddles drafted (7 core + 1 optional)
- ✅ Hint system designed
- ✅ Physical production planning
- ✅ Testing and execution plans

**In Progress**:
- 🔄 Finalizing riddle difficulty levels
- 🔄 Deciding on technical implementation approach

**Not Started**:
- ⏸️ Technical systems build (03_Technical_Systems)
- ⏸️ Physical crafting (04_Physical_Production)
- ⏸️ LLM guide development
- ⏸️ Smart home integration

---

## Common Tasks

### "I want to add a new riddle"
1. Use `02_Riddle_Content/Clue_and_Hint_Structure.md` as template
2. Follow format from existing riddles
3. Add to `Riddle_Flow_Map.md` in appropriate sequence
4. Ensure difficulty rating matches placement in arc

### "I want to change a riddle's difficulty"
1. Edit the riddle file directly
2. Adjust which level (⭐⭐⭐ to ⭐⭐⭐⭐⭐) you'll use
3. Update hints if needed
4. Note change in testing plan

### "I want to test the full experience"
1. Follow `05_Testing_and_Execution/Full_Run_Test_Plan.md`
2. Time yourself solving each riddle
3. Document issues and fixes
4. Repeat until confident

### "It's the day of the hunt - what do I do?"
1. Follow `05_Testing_and_Execution/Execution_Guide.md` exactly
2. Have `Day-Of Checklist.md` printed
3. Keep `Safety_and_Backup_Notes.md` accessible
4. Stay calm, be flexible, enjoy

### "The hunt is over - now what?"
1. Complete `05_Testing_and_Execution/Post_Event_Review.md`
2. Save photos and keepsakes
3. Reflect on lessons learned
4. Update documentation with improvements for future

---

## Technical Requirements (When Building)

### LLM Guide
- OpenAI API access (GPT-4 recommended)
- Prompt engineering for riddle validation
- Answer parsing (fuzzy matching)
- Hint escalation logic
- Warm, adaptive tone

### Smart Lighting
- Govee Developer API token
- Google Home integration (IFTTT/Nabu Casa)
- Node.js lighting bridge server
- Event routing (riddle solved → lighting effect)

### Frontend
- React + Vite + Tailwind
- Mobile-responsive interface
- WebSocket or polling for real-time updates
- Audio playback (Tone.js)
- Confetti/celebration animations

### Hosting
- GitHub Pages or Vercel (frontend)
- Local server or cloud hosting (lighting bridge)
- Environment variables for API keys

---

## Budget Estimate

### Physical Components
- Materials (paper, envelopes, decorations): $25-35
- Optional enhancements (special effects): $20-30
- Finale gift: $30-50
- **Total Physical**: $75-115

### Technical Components
- OpenAI API costs: ~$5-10 (testing + event)
- Govee lights (if not owned): $30-50
- Domain/hosting (if needed): $0-15
- **Total Technical**: $35-75

### Grand Total: $110-190

---

## Credits & Inspiration

**Created by**: Gabe Bryk
**For**: Joy's Birthday
**Inspired by**:
- Escape room design principles
- Interactive fiction / choose-your-own-adventure
- Everything Everywhere All at Once (multiverse themes)
- Obsidian personal knowledge management
- Domain-driven design (modular architecture)

---

## Links to Key Documents

### Start Here
- [[01_Narrative_Design/Narrative_Bible]] - Read this first for vision
- [[02_Riddle_Content/Riddle_Flow_Map]] - See the full sequence

### For Creators
- [[01_Narrative_Design/Plot_Arc_and_Guide_Voice]] - Story structure
- [[02_Riddle_Content/Clue_and_Hint_Structure]] - Riddle template

### For Builders
- [[03_Technical_Systems/]] - (To be created)
- [[04_Physical_Production/Crafting_Plan]] - Materials & assembly

### For Execution
- [[05_Testing_and_Execution/Execution_Guide]] - Day-of guide
- [[05_Testing_and_Execution/Full_Run_Test_Plan]] - Testing checklist

---

## Version History

**v1.0** (2025-10-26): Full project reorganization
- Created six-layer structure
- Completed all narrative and content documentation
- Prepared physical production and execution plans
- Ready for technical build phase

---

## Contact & Questions

**Project Owner**: Gabe Bryk
**Purpose**: Personal birthday gift
**Status**: Active development
**Next Milestone**: Finalize riddles, begin technical build

---

*This project is a love letter made interactive. Every layer, every system, every riddle exists to tell Joy: you are seen, you are known, and you are celebrated.*
