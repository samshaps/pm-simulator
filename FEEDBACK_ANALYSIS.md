# PM Simulator - Feedback Analysis & Proposed Fixes

## Current State Analysis

### 1. Starting Condition (CONFIRMED BUG)
**Current:** Static base metrics for each difficulty level, no randomization
```typescript
// src/lib/game/initial.ts
const BASE_METRICS: Record<Difficulty, MetricsState> = {
  easy: { team_sentiment: 70, ceo_sentiment: 60, ... },
  // ... all static values
}
```
**Issue:** Every game starts exactly the same
**Fix Required:** Randomize all metrics while maintaining overall balance

---

### 2. Team Morale & Sprint Capacity

**Current Logic (src/lib/game/simulate.ts:90-109):**
```typescript
function computeEffectiveCapacity(metrics: MetricsState): number {
  let capacity = 20;
  if (team > 75) capacity += 4;
  else if (team >= 50) capacity += 1;
  else if (team >= 25) capacity -= 2;
  else capacity -= 5;
  // ... more modifiers
  return Math.max(8, capacity); // Minimum is 8 points
}
```

**Issues:**
- User says morale keeps decreasing even when under stretch
- Minimum capacity is 8 points (user suggests 10)
- User got into a "single point" state (should be impossible with min=8, need to investigate)

**Current morale impact logic (src/app/api/sprint/commit/route.ts:466-506):**
- Overbooking: -2 to -8 penalty (lines 467-475)
- High failure rate when overbooked: additional -2 to -5 penalty (lines 476-486)
- Not overbooked + low failure: +4 bonus (lines 489-494)
- High success rate: +1 to +2 bonus (lines 496-506)

**User's feedback:** "Team morale keeps weirdly taking a hit even when I'm well under the stretch amount"
- Need to review the logic to ensure morale only decreases for overbooking OR high failure rates, not other factors

---

### 3. CTO Sentiment vs Tech Debt Relationship

**Current Logic (src/app/api/sprint/commit/route.ts:618-627):**
```typescript
if (hasTechDebtShipped) {
  applyMetricDelta("cto_sentiment", 3);
} else {
  applyMetricDelta("cto_sentiment", -4);
}
if (updatedMetrics.tech_debt > 70) {
  applyMetricDelta("cto_sentiment", -3);
} else if (updatedMetrics.tech_debt < 35) {
  applyMetricDelta("cto_sentiment", 2);
}
```

**Issue:** User experienced CTO sentiment = 80 while tech_debt = 84
- This shouldn't happen with current logic since tech_debt > 70 applies -3 to CTO sentiment
- **Possible explanation:** Other factors boosted CTO sentiment more than tech debt penalized it
- Tech debt can increase independently (lines 611-616: drift +3 or +6 per sprint)

**Fix Required:** Strengthen the inverse relationship
- High tech debt should ALWAYS significantly drag down CTO sentiment
- Consider adding a passive decay: `if (tech_debt > 70) applyMetricDelta("cto_sentiment", -floor(tech_debt/15))`

---

### 4. Emoji/Color Threshold Misalignment

**Current Thresholds:**

**Sentiment Face (src/components/SprintPlanning.tsx:399-404):**
- >=70: 😊 Happy
- >=50: 😐 Neutral
- >=30: 😟 Unhappy
- <30: 😠 Angry

**Sentiment Bar Color (src/components/SprintPlanning.tsx:560-582):**
- >=60: Green (positive)
- <40: Red/Yellow (warning)
- else: Gray (neutral)

**The Mismatch:**
- At value=60: Bar is GREEN, Face is NEUTRAL 😐
- At value=50: Bar is GRAY, Face is NEUTRAL 😐
- At value=40: Bar is GRAY, Face is NEUTRAL 😐

**Fix Required:** Align thresholds
```typescript
// Option 1: Align to 70/50/30
Bar: >=70 green, >=50 gray, >=30 yellow, <30 red
Face: >=70 😊, >=50 😐, >=30 😟, <30 😠

// Option 2: Align to 60/40
Bar: >=60 green, >=40 gray, <40 red
Face: >=60 😊, >=40 😐, <40 😟
```

**Tech Debt (Similar Issue):**
- User says: "Bar was gray but indicator had two arrows pointing up to the right"
- Tech debt arrows show delta direction (lines 436-442)
- Tech debt bar color (lines 674-679): >=60 warning (red), <40 positive (green), else neutral (gray)
- Arrows should match the "goodness" of the change

---

### 5. Mandatory Tickets Not Enforced

**Current Implementation (src/app/api/sprint/commit/route.ts:1058-1084):**
- Mandatory tickets added to backlog with `is_mandatory: true`
- Frontend displays them with MANDATORY tag (src/components/SprintPlanning.tsx:729)

**Missing:** No enforcement logic preventing sprint start without mandatory tickets

**Fix Required:** Add validation in `handleStartSprint()`:
```typescript
// Check for mandatory tickets
const mandatoryTickets = backlogTickets.filter(t => t.isMandatory);
const committedMandatoryIds = new Set(committedTickets.map(t => t.id));
const missingMandatory = mandatoryTickets.filter(t => !committedMandatoryIds.has(t.id));

if (missingMandatory.length > 0) {
  alert(`You must commit all mandatory tickets: ${missingMandatory.map(t => t.title).join(', ')}`);
  return;
}
```

---

### 6. Loading Messages Variety

**Current:** 16 loading messages (src/components/SprintPlanning.tsx:82-98)
**User says:** Only seen ~5

**Current randomization (lines 112-120):**
```typescript
const pickRandomMessages = (messages: string[], count: number) => {
  // Picks 4 random messages, cycles through them
}
```

**Fix Required:** Add more loading messages (target: 30-40)

---

### 7. CEO Focus Shift Bug

**User reports:** "Retro said 'CEO wants self-serve' but next sprint showed 'tech debt reduction' as CEO focus, though tickets were correctly marked as CEO aligned"

**Possible causes:**
1. Display bug where wrong focus shown in UI
2. Race condition in CEO focus update
3. CEO focus shift happening twice (once at retro, once at sprint planning)

**Need to investigate:**
- src/app/api/sprint/commit/route.ts:834-854 (mid-sprint focus shift)
- src/app/api/sprint/commit/route.ts:935-970 (quarter-end focus shift)
- src/components/SprintPlanning.tsx:461-464 (CEO focus display logic)

---

### 8. Ticket Size Mix

**Current Logic (src/lib/game/simulate.ts:360-476):**
- `generateBacklog()` randomly picks tickets based on weighted categories
- No forced distribution of ticket sizes (small/medium/large)

**User wants:** Better forced mix, close to "1 small, 2 medium, 1 large" with some variance

**Fix Required:** Add size distribution logic:
```typescript
// Define effort ranges
const SMALL = [1, 3]; // 1-3 points
const MEDIUM = [4, 6]; // 4-6 points
const LARGE = [7, 10]; // 7-10 points

// Force at least 1 small, 2 medium, 1 large
// Then fill remaining slots randomly
```

---

### 9. Hidden Impact Score

**Current:** `primary_impact`, `secondary_impact`, `tradeoff_impact` are defined in ticket templates
**User wants:** Hidden impact score with ~70% correlation to description

**Fix Required:**
1. Add `hidden_impact` field to ticket templates (1-10 scale)
2. Remove or hide impact ranges from frontend display
3. Ensure ticket descriptions correlate ~70% with hidden impact

---

### 10. Random Mid-Sprint Events

**Current:** Events exist but need more variety and visibility on tickets

**User wants:**
- 0-3 random events per sprint
- Both positive and negative
- Events affect tickets in the following sprint
- Visual indicators on affected tickets
- Examples: "Positive press mentions", "Unexpected BI resources", "Competitor launches", "Tech incidents"

**Fix Required:**
1. Expand event catalog (need to check database)
2. Add event impact tracking to tickets
3. Add visual indicators to tickets when affected by events
4. Increase event variety

---

### 11. Tech Debt Increase Display Bug

**User reports:** "Sprint retro says 'tech debt is a strong increase' marked in green but is actually bad"

**Issue:** Color coding is confusing for "bad" metrics
- For good metrics (sentiment, growth): increase = green, decrease = red
- For bad metrics (tech debt): increase = red, decrease = green

**Fix Required:** Ensure tech debt deltas use inverse color scheme

---

## Summary of Fixes Needed

### High Priority
1. ✅ Randomize starting conditions with balanced totals
2. ✅ Fix mandatory ticket enforcement
3. ✅ Align emoji/color thresholds
4. ✅ Strengthen CTO sentiment vs tech debt relationship
5. ✅ Fix tech debt color inversion
6. ✅ Add ticket size distribution

### Medium Priority
7. ✅ Add more loading messages (30-40 total)
8. ✅ Investigate CEO focus shift bug
9. ✅ Implement hidden impact scores
10. ✅ Expand random events system

### Low Priority
11. ✅ Review team morale decrease logic
12. ✅ Add minimum capacity safeguard (10 pts) with PIP at quarterly review
