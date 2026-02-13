# PM Simulator — v2 PRD

**Last Updated:** February 13, 2026
**Status:** Planning
**Version:** 2.0.0

---

## Executive Summary

PM Simulator v2 is a complete UX overhaul focused on **immediate feedback, visual clarity, and progressive complexity**. Drawing inspiration from games like Reigns, v2 transforms the experience from "reading a spreadsheet" to "spinning plates in real-time."

**Core Philosophy:** Players should **feel** the impact of their decisions before committing, understand cause-and-effect through visual feedback, and experience satisfying progression from "easy first sprint" to "chaotic Q4."

---

## What's Changing from V1

### ❌ Removing
- Difficulty selection (everyone starts at the same difficulty)
- Long ticket descriptions (replaced with visual language)
- Upfront metric display in top nav
- Complex confidence interval displays on tickets
- "Metrics Momentum" section in retro

### ✨ Adding
- **Live preview system** with cross-hatched metric bars
- **Compact tile-based tickets** with visual icons
- **Progressive complexity** scaling across quarters
- **Animated sprint retro** with sequential reveals
- **Danger zones** on metric bars showing loss thresholds
- **Active modifiers panel** showing boosts/debuffs

### 🔄 Changing
- Sprint planning from "list view" to "grid view"
- Ticket interaction from "read then decide" to "scan and click"
- Retro from "wall of text" to "choreographed reveal"
- Onboarding from "full complexity Q1S1" to "gradual ramp"

---

## User Experience Flow

### 1. Homepage
**Changes:**
- Remove difficulty selector entirely
- Move "Past Runs" table higher on page
- Keep tagline: "Every decision shapes your destiny. Build the best product or get deactivated on Slack."

**Past Runs Table:**
- Date
- Final Rating
- Hover tooltip shows end-game flavor text

### 2. Sprint Planning

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Top Nav: PM Simulator | Q1 - Sprint 1 of 3 | [S] Settings  │
│ Active Modifiers: ⚡ CEO Focus: Self-Serve Growth           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐ ┌─────────────────────────────┐
│ Backlog                     │ │ Sprint Capacity             │
│ Available work. Choose      │ │ ████████████░░░░░░░░ 12/21  │
│ wisely. Or don't.          │ │                             │
│                             │ │ Committed                   │
│ [Filter] [Sort by: Points]  │ │                             │
│                             │ │ [Ticket] [Ticket] [Ticket]  │
│ 🔥⚪ SELF_SERVE ⚡          │ │                             │
│ 🔥⚪ SELF_SERVE 🐢          │ │ Performance                 │
│ 🔥⚪ ENTERPRISE             │ │                             │
│ 🔥⚪ TECH_DEBT              │ │ Team Sentiment    ████ 99   │
│ 🔥⚪ SELF_SERVE             │ │ CEO Sentiment     ████ 70   │
│ 🔥⚪ ENTERPRISE             │ │ Self-Serve Growth ████ 51   │
│ ...                         │ │ Enterprise Growth ████ 46   │
└─────────────────────────────┘ └─────────────────────────────┘
                                │ [Reset Sprint] [Start Sprint]│
                                └─────────────────────────────┘
```

#### Ticket Design (Compact Tiles)

**Visual Structure:**
```
┌─────────────────────┐
│ 🔥🔥🔥  ⚫ ⚡      │  ← Fire (impact), Oval (effort), Modifier
│ SELF_SERVE          │  ← Category
│ In-App Activation   │  ← Title
│ Tutorial            │
└─────────────────────┘
```

**Icon Language:**
- **Fire emoji (🔥):** Impact level
  - 1/3 filled: Low impact
  - 2/3 filled: Medium impact
  - Fully filled: High impact
- **Oval (⚫⚪):** Effort/Points
  - Small oval: 1-3 points
  - Medium oval: 4-6 points
  - Large oval: 7+ points
- **Modifier icon:**
  - ⚡ Lightning: Active boost (e.g., CEO focus doubles impact)
  - 🐢 Turtle: Active debuff (e.g., hiring freeze reduces impact)
  - ⬜ Blank square: No active modifier

**Layout:**
- 3 tiles per row
- Rounded corners (8px border-radius)
- Hover state: subtle lift + shadow
- Click-to-move is primary interaction
- Drag-and-drop is secondary interaction

#### Backlog Section
- Grid of ticket tiles (3 per row)
- Filter dropdown: "All Categories" | "Self-Serve" | "Enterprise" | "Tech Debt" | "UX/Infra" | etc.
- Sort dropdown: "Points (Low to High)" | "Points (High to Low)" | "Impact (High to Low)"
- Caption: "Available work. Choose wisely. Or don't."

#### Sprint Capacity Bar
- Shows as a progress bar
- Updates live as tickets are added/removed
- States:
  - **Normal:** Purple fill, does not explicitly show point counts
  - **Stretch:** Purple fill past threshold + cross-hatched extension, shows "STRETCH!" text
  - **Overcapacity:** Red fill, warning icon, message: "Your EM looks at you menacingly. We suggest you pull things back a bit." + disabled "Start Sprint" button

#### Committed Section
- Same tile design as Backlog
- Each tile has an "X" button in top-right corner
- Click X to remove and return to Backlog
- Tiles disappear from Backlog when moved here

#### Performance Metrics Panel
- Always visible below Committed section
- Displays 3 metrics to start (Q1): Team Sentiment, Self-Serve Growth, Enterprise Growth
- Adds 3 more metrics in Q2: CTO Sentiment, Tech Debt, CEO Sentiment
- Each metric shows:
  - Bar graph with current value
  - Danger zone (red region) at low end showing loss threshold
  - Cross-hatched preview overlay on hover/add

**Cross-Hatch Preview Logic:**
- **On hover over Backlog ticket:** Show cross-hatched range on affected metrics
- **On add to Committed:** Lock in the cross-hatch preview
- **Width of cross-hatch:** Based on confidence interval (wider = more uncertainty)
- **Color of cross-hatch:**
  - Green tint: Positive impact expected
  - Red tint: Negative impact expected

#### Active Modifiers Panel (Top Nav)
- Shows current boosts/debuffs affecting tickets
- Format: `⚡ CEO Focus: Self-Serve Growth (2x impact)`
- Format: `🐢 Sales Hiring Freeze: Enterprise tickets -50%`
- Collapsed if no modifiers active, expanded if any modifiers are active

#### Interactions
1. **Click ticket in Backlog** → Moves to Committed, updates capacity bar, updates metric previews
2. **Click X on Committed ticket** → Returns to Backlog, updates capacity/metrics
3. **Drag ticket from Backlog to Committed** → Same effect as click
4. **Hover over Backlog ticket** → Shows cross-hatch preview on metrics
5. **Click "Start Sprint"** → Proceeds to Sprint Retro (disabled if overcapacity)
6. **Click "Reset Sprint"** → Clears all Committed tickets back to Backlog

### 3. Sprint Retro

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Sprint Retrospective                                        │
│ What happened, and why it matters                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐ ┌─────────────────────────────┐
│ TICKET OUTCOMES             │ │ Performance                 │
│                             │ │                             │
│ [Green] [Yellow] [Red]      │ │ Team Sentiment    ████ 99   │
│                             │ │ CEO Sentiment     ████ 72   │
│ AFTER-ACTION REPORT         │ │ Self-Serve Growth ███▓ 54   │
│                             │ │ Enterprise Growth ████ 46   │
│ [Sticky note 1]             │ │                             │
│ [Sticky note 2]             │ └─────────────────────────────┘
│ [Sticky note 3]             │
│                             │
│ WORD ON THE STREET          │
│                             │
│ • Product Hunt Launch       │
│   Success — New feature...  │
│ • Product Hunt Launch       │
│   Success — New feature...  │
└─────────────────────────────┘
                                │ [Continue to Next Sprint]   │
                                └─────────────────────────────┘
```

#### Animation Sequence (0.5s per ticket)

**On page load:**
1. Tickets appear in same state as sprint-planning (neutral background)
2. Performance metrics show cross-hatched uncertainty
3. After-Action Report is empty
4. Word on the Street is empty

**Sequential reveal (0.5s intervals):**
1. **First ticket flips** → Green/Yellow/Red background
   - Metrics: Cross-hatch narrows, bar updates to reflect impact
2. **Second ticket flips** → Color updates
   - Metrics: Cross-hatch narrows further, bar updates
3. **Third ticket flips** → Color updates
   - Metrics: Cross-hatch narrows, bar updates
4. **...continue for all committed tickets**

**After all tickets resolve:**
5. **Sticky notes appear** → Rapid sequence (0.2s each) in After-Action Report
6. **Word on the Street populates** → Events appear as bullet points after all sticky notes appeared.

**Ticket Outcome Colors:**
- **Green:** Clear success
- **Light green:** Partial success 
- **Light red:** Partial failure 
- **Red:** Catastrophe or hard failure

#### After-Action Report
- Sticky notes with key takeaways
- Examples:
  - "Team morale is improving!"
  - "Self-serve growth is accelerating!"
  - "The sales team is in revolt :( we'll have to do one of their tickets no matter what next sprint."
- Appears empty on load, populates after all tickets resolve

#### Word on the Street
- List of events that triggered during the sprint
- Format: **Bold Title** — Description text
- Examples:
  - **Product Hunt Launch Success** — New feature launched on Product Hunt and hit #2 for the day. Self-serve signups spiked...
  - **CEO Loses Confidence** — The CEO is questioning your priorities after another sprint with minimal enterprise progress.

### 4. Quarterly Review
**No major changes planned for v2.** Existing design is solid.

---

## Progressive Complexity System

### Quarter 1 (Onboarding)

#### Sprint 1 (Tutorial Sprint)
- **Backlog:** 6 tickets only
- **Capacity:** 12 points (reduced from 21)
- **Visible Metrics:** 4 only (Team, CEO, Self-Serve, Enterprise)
- **Penalties:** Reduced (losing is harder)
- **Goal:** Teach mechanics without overwhelming

#### Sprint 2
- **Backlog:** 9 tickets
- **Capacity:** 15 points
- **Visible Metrics:** 4 (same as S1)
- **Penalties:** Normal

#### Sprint 3
- **Backlog:** 12 tickets
- **Capacity:** 18 points
- **Visible Metrics:** 4 (same as S1-S2)
- **Penalties:** Normal

### Quarter 2
- **Backlog:** 15 tickets per sprint
- **Capacity:** 21 points (full capacity)
- **Visible Metrics:** 6 (add CTO Sentiment, Tech Debt)
- **Penalties:** Normal
- **New mechanic:** More aggressive CEO focus shifts

### Quarter 3
- **Backlog:** 18 tickets per sprint
- **Capacity:** 21 points (same)
- **Visible Metrics:** 6 (same)
- **Penalties:** Harsh
- **New mechanic:** More debuffs triggered by poor performance

### Quarter 4
- **Backlog:** 18 tickets per sprint
- **Capacity:** 21 points (same)
- **Visible Metrics:** 6 (same)
- **Penalties:** Very harsh
- **New mechanic:** Death spiral risk increases

**Key Insight:** Same capacity, more demands = increasing pressure

---

## Win/Loss Conditions

### Loss Conditions (Game Over = Fired)

**Immediate Termination:**
- **Capacity Collapse:** Team capacity drops to ≤5 points
  - Triggered by: Low team sentiment + high tech debt + poor execution
  - Outcome: "Death spiral" quarterly review, game ends immediately

**Gradual Failure (Quarterly Review):**
- **Any single metric reaches 0**
  - Team Sentiment = 0 → "Team exodus, cannot function"
  - CEO Sentiment = 0 → "Lost all confidence in leadership"
  - Self-Serve Growth = 0 → "Product has no momentum"
  - Enterprise Growth = 0 → "Cannot sustain business"
  - CTO Sentiment = 0 → "Engineering has lost faith"
  - Tech Debt = 100 → "System is unmaintainable"

- **Multiple metrics in danger zone (red region) for 2+ consecutive sprints**
  - Danger zone = bottom 20% of bar (0-20 range)
  - Having 3+ metrics in red = Immediate Termination
  - 2+ metrics red for 2 sprints = Termination

### Win Condition
- **Complete Year 1 (4 quarters) without getting fired**
- Final rating determined by aggregate performance:
  - **Exceeds Expectations:** 80%+ metrics healthy, strong growth
  - **Meets Expectations:** 60-79% metrics healthy, steady growth
  - **Needs Improvement:** 40-59% metrics healthy, inconsistent growth
  - **Below Expectations:** <40% metrics healthy, declining

---

## Visual Design Principles

### Aesthetic Target
- **Inspiration:** 2000s Jira, Basecamp, sticky notes
- **Not:** Sleek web3, hyper-modern gradients
- **Vibe:** "Janky corporate software that works"

### Key Elements
- **Texture:** Subtle paper grain, slight shadows on sticky notes
- **Imperfection:** Not everything perfectly aligned
- **Color Palette:**
  - Purple/lavender for primary actions
  - Yellow for sticky notes
  - Green for success, red for failure, yellow for mixed
  - Dark mode background (keep existing dark theme)

### Ticket Tiles
- Rounded squares (not rectangles)
- Large, instantly recognizable icons
- Minimal text, maximum scanability
- Subtle texture/gradient on backgrounds

### Performance Bars
- Horizontal bars with clear numerical labels
- Danger zones: Red gradient at 0-20 range
- Stretch zones: Yellow gradient at 80-100 range
- Cross-hatch pattern: Diagonal lines for uncertainty overlay

---

## Technical Implementation Notes

### Data Model Changes
**No breaking changes to existing data model.** All v2 changes are presentation-layer only.

### API Changes
**No changes required.** Existing `/api/sprint/commit` endpoint handles all logic.

### New Components Needed
1. `TicketTile.tsx` — Compact tile component with icons
2. `MetricBarWithPreview.tsx` — Bar graph with cross-hatch overlay
3. `CapacityBar.tsx` — Sprint capacity with stretch/overcapacity states
4. `ActiveModifiers.tsx` — Top nav panel for boosts/debuffs
5. `AnimatedRetro.tsx` — Sequential reveal animation controller

### State Management
- Add `previewedMetrics` state to track cross-hatch overlays
- Add `isOvercapacity` computed state for button disabling
- Add `animationProgress` state for retro sequence

### Animation Timing
- Ticket flip: 0.5s per ticket (CSS transition)
- Sticky note appearance: 0.2s per note (staggered)
- Metric bar updates: 0.3s (ease-out)
- Cross-hatch preview: 0.15s (instant feedback)

---

## Open Questions

1. **Stretch vs Overcapacity threshold:**
   - Stretch = 100-130% of capacity?
   - Overcapacity = 130%+ of capacity?
   - Need to playtest to find right balance

2. **Danger zone thresholds:**
   - Currently thinking 0-20 = red danger zone
   - Should we have yellow warning zone at 20-40?

3. **Tutorial forced path:**
   - Should Q1S1 force players to pick specific tickets?
   - Or just limit options but let them choose freely?

4. **Active modifiers placement:**
   - Top nav as proposed?
   - Or sidebar panel?
   - Or tooltip on hover over lightning/turtle icons?

5. **Skip animation:**
   - Not planning to add for v2, but should we?
   - Or is 0.5s per ticket fast enough?

---

## Success Metrics (Post-Launch)

- **Completion rate:** % of players who finish Q1
- **Replay rate:** % of players who start a second game
- **Time to first sprint:** Measure onboarding friction
- **Average session length:** Should increase with better engagement
- **Retro engagement:** % of players who read sticky notes vs click through immediately

---

## Out of Scope for V2

- Stakeholder Signals panel (may add in v2.1)
- Multiple game modes or scenarios
- Multiplayer or leaderboards
- Sound effects or music
- Mobile-optimized layout
- Accessibility improvements (will tackle in v2.1)

---

## Implementation Phases

### Phase 1: Core Ticket & Layout Changes
- Build TicketTile component
- Refactor SprintPlanning layout to grid
- Implement click-to-move and drag-and-drop
- Add capacity bar states (normal/stretch/overcapacity)

### Phase 2: Preview System
- Build MetricBarWithPreview component
- Implement hover preview logic
- Add cross-hatch visual rendering
- Connect preview state to ticket hover/add

### Phase 3: Progressive Complexity
- Add quarter/sprint-based backlog size scaling
- Implement metric visibility gating (4 → 6)
- Adjust penalty curves for Q1
- Add danger zones to metric bars

### Phase 4: Animated Retro
- Build AnimatedRetro component
- Implement sequential ticket flip
- Add sticky note appearance animation
- Connect metric bar updates to ticket reveals

### Phase 5: Polish & Testing
- Visual design refinement (textures, shadows)
- Active modifiers panel
- Overcapacity messaging
- Playtest and balance tuning

---

## Appendix: Feedback Summary

### What's Working ✅
- Core "sinking ship PM" premise
- Flavor text and world-building
- Prioritization challenge itself

### What's Not Working ❌
- Cognitive overload (too much upfront)
- Lack of real-time feedback
- Feels like gambling without understanding
- Visual style too "web3"
- First play session not fun enough

### Key Recommendations 🎯
- Draw from Reigns: individual decisions with visible forecast
- Start tiny, scale to chaos
- Add live metric preview (cross-hatching)
- Make "plate spinning" satisfying
- Cut ruthlessly (difficulty, long text, etc.)

---

**End of PRD**
