# Event Clarity Fixes

## Problem Statement

Two events had ambiguous outcomes that confused players:

### 1. "Surprise All-Hands" (evt_r_009)
**Original:** "team sentiment has either improved or deteriorated significantly"
**Issue:** Players couldn't predict or understand what happened

### 2. "CEO Attended a Conference" (evt_r_001)
**Original:** "ideas that were novel in 2019" with vague sentiment reset
**Issue:** No clear outcome - what tech trend? What actually changes?

## Solutions

### Fix 1: Split All-Hands into Two Clear Events

**evt_r_009a: CEO Praise at All-Hands** (Positive)
- **Triggers when:** CEO sentiment > 60 (CEO is happy)
- **What happens:** CEO publicly recognizes team's work
- **Effects:**
  - Team sentiment +8
  - CEO sentiment +3
- **Player experience:** "My team is doing well, CEO notices, morale improves - makes sense!"

**evt_r_009b: Awkward Fireside Chat** (Negative)
- **Triggers when:** CEO sentiment < 40 (CEO is stressed)
- **What happens:** CEO brings college friend for irrelevant growth hacking talk
- **Effects:**
  - Team sentiment -6
  - CEO sentiment +2 (CEO thinks it was great)
- **Player experience:** "CEO is stressed and making bad decisions - relatable!"

### Fix 2: Split Conference into Four Specific Variants

Instead of one vague event, players now get specific tech trends:

**evt_r_001a: Blockchain/Web3 Phase**
- CEO becomes obsessed with distributed ledgers
- Random focus shift (unpredictable pivot)
- Team sentiment -4 (eye rolling at buzzwords)

**evt_r_001b: Architecture Confusion Phase**
- CEO uncertain if we have microservices or monolith, but certain we need the other one
- Shifts to tech_debt focus, forces tech_debt_reduction ticket
- Tech debt +10 (architectural churn)
- CEO sentiment +3 (thinks they're being strategic)
- Team sentiment -4 (pointless refactoring)
- CTO sentiment unchanged (not the PM's fault)

**evt_r_001c: AI Everything Phase**
- CEO wants "AI" in every feature title
- Shifts to self_serve focus
- Forces self_serve_feature ticket
- Team sentiment -3 (marketing over substance)

**evt_r_001d: Serverless Phase**
- CEO obsessed with cloud-native architecture
- Shifts to tech_debt focus
- Forces infrastructure ticket
- CTO sentiment +2 (actually somewhat useful)

## Key Improvements

### Before
- ❌ Ambiguous outcomes
- ❌ "Either/or" effects
- ❌ No way to predict
- ❌ Confusing player feedback

### After
- ✅ Clear, specific outcomes
- ✅ Predictable based on game state
- ✅ Explicit metric changes
- ✅ Relatable tech industry humor

## Implementation

### Files Created
1. **UPDATED_EVENTS.json** - JSON definitions of new events
2. **update_events.sql** - SQL script to update database
3. **EVENT_FIXES_SUMMARY.md** - This document

### Database Update Steps

```bash
# Option 1: Run SQL script directly
psql your_database < update_events.sql

# Option 2: Manual update via your DB tool
# - Delete evt_r_009
# - Delete evt_r_001
# - Insert 6 new events from UPDATED_EVENTS.json
```

### Changes Summary
- **Removed:** 2 ambiguous events
- **Added:** 6 clear events
- **Net:** +4 events total

## Testing

After updating, test that:

1. ✅ All-hands events trigger at appropriate CEO sentiment levels
2. ✅ Conference events show specific tech trends (not vague language)
3. ✅ Each event has clear, understandable effects
4. ✅ No more "either/or" language in event descriptions

## Future Event Design Principles

Based on these fixes, follow these principles for new events:

1. **Be Specific:** "CEO wants blockchain" not "CEO has ideas"
2. **Clear Effects:** List exact metric changes
3. **No Ambiguity:** Avoid "either/or" or "depending on"
4. **Predictable:** Tie to game state when possible (sentiment thresholds)
5. **Relatable:** Use real industry patterns players recognize

## Player Feedback Addressed

> "It's hard to interpret what this event means…it should either be positive or negative"

✅ **Fixed:** Events now have clear positive or negative outcomes

> "Let's be explicit about the changes that happen"

✅ **Fixed:** Each variant specifies exactly what tech trend and what changes occur

> "Maybe if the CEO goes to the conference...he decides we're now a [legacy tech] company"

✅ **Fixed:** Conference events now specify the exact tech trend (blockchain, microservices, AI, serverless) and shift focus accordingly
