# Phase 3: Progressive Complexity - Testing Guide

## Overview
Phase 3 implements progressive complexity scaling across quarters and sprints to create a gradual learning curve from "easy first sprint" to "chaotic Q4."

## What to Test

### 1. **Backlog Size Scaling**

Expected backlog sizes by quarter/sprint:

| Quarter | Sprint | Expected Backlog Size |
|---------|--------|----------------------|
| Q1      | S1     | 6 tickets            |
| Q1      | S2     | 9 tickets            |
| Q1      | S3     | 12 tickets           |
| Q2      | S1-S3  | 15 tickets           |
| Q3      | S1-S3  | 18 tickets           |
| Q4      | S1-S3  | 18 tickets           |

**How to test:**
1. Start a new game
2. In Q1S1, count the tickets in the backlog → should be 6
3. Complete the sprint and advance to Q1S2 → should be 9
4. Continue through Q1S3 → should be 12
5. Advance to Q2S1 → should be 15
6. Advance to Q3S1 → should be 18

### 2. **Capacity Scaling**

Expected base capacity by quarter/sprint:

| Quarter | Sprint | Expected Capacity (base) |
|---------|--------|-------------------------|
| Q1      | S1     | 12 points               |
| Q1      | S2     | 15 points               |
| Q1      | S3     | 18 points               |
| Q2-Q4   | S1-S3  | 21 points               |

**Note:** The actual capacity shown will be modified by metrics (team sentiment, tech debt, CTO sentiment). The base capacity is the starting point before these modifiers are applied.

**How to test:**
1. Start a new game with normal difficulty
2. Look at the capacity bar in Q1S1 → should show ~12 points (±modifiers)
3. Advance to Q1S2 → should show ~15 points
4. Advance to Q1S3 → should show ~18 points
5. Advance to Q2S1 → should show ~21 points

### 3. **Metric Visibility Gating**

Expected visible metrics by quarter:

| Quarter | Visible Metrics |
|---------|----------------|
| Q1      | 4 metrics: Team Sentiment, CEO Sentiment, Self-Serve Growth, Enterprise Growth |
| Q2-Q4   | 6 metrics: (Q1 metrics) + CTO Sentiment + Tech Debt |

**How to test:**

**Sprint Planning Page:**
1. Start Q1S1 → Should see exactly 4 metric bars
2. Advance to Q2S1 → Should see 6 metric bars (CTO Sentiment and Tech Debt appear)

**Sprint Retro Page:**
1. Complete Q1S1 sprint → Should see 4 metrics in Performance section
2. Complete Q2S1 sprint → Should see 6 metrics in Performance section

### 4. **Penalty Scaling**

Expected penalty multipliers by quarter/sprint:

| Quarter | Sprint | Penalty Scale | Impact |
|---------|--------|--------------|--------|
| Q1      | S1     | 0.5x         | Reduced penalties (tutorial) |
| Q1      | S2-S3  | 1.0x         | Normal penalties |
| Q2      | S1-S3  | 1.0x         | Normal penalties |
| Q3      | S1-S3  | 1.3x         | Harsh penalties |
| Q4      | S1-S3  | 1.5x         | Very harsh penalties |

**How to test:**
1. **Q1S1 (Tutorial):** Overbook the sprint significantly
   - Expected: Smaller team sentiment penalty than later quarters
   - The game should be more forgiving to help players learn

2. **Q3 (Harsh):** Same overbooking amount as Q1S1
   - Expected: Larger penalty (~30% more) than Q1S2
   - Metrics should drop more significantly

3. **Q4 (Very Harsh):** Same overbooking amount
   - Expected: Even larger penalty (~50% more) than Q1S2
   - Metrics should drop dramatically

### 5. **Danger Zones**

All metric bars should show a red gradient in the 0-20 range.

**How to test:**
1. Look at any metric bar in Sprint Planning or Sprint Retro
2. Verify there's a subtle red gradient on the left side (0-20% range)
3. This danger zone should be visible on all metrics

### 6. **Integrated Experience Test**

Play through a complete quarter to verify the progressive difficulty:

**Q1 Experience (Learning):**
- Sprint 1: Only 6 tickets, 12 point capacity, 4 visible metrics, reduced penalties
  - Should feel manageable and forgiving
- Sprint 2: 9 tickets, 15 point capacity, still 4 metrics, normal penalties
  - Slight increase in complexity
- Sprint 3: 12 tickets, 18 point capacity, still 4 metrics, normal penalties
  - Noticeably more tickets to choose from

**Q2 Experience (Ramping Up):**
- Sprint 1: 15 tickets, 21 point capacity, **6 visible metrics**, normal penalties
  - New metrics appear (CTO Sentiment, Tech Debt)
  - More tickets in backlog creates more decision complexity

**Q3-Q4 Experience (High Pressure):**
- 18 tickets per sprint, 21 point capacity, 6 metrics
- **Harsh/Very harsh penalties** make mistakes more costly
- Same capacity with more demands = increasing pressure

## Expected Progression Curve

```
Complexity
    ↑
100%|                                    ╱─────
    |                                ╱───
 80%|                            ╱───
    |                        ╱───
 60%|                    ╱───
    |                ╱───
 40%|            ╱───
    |        ╱───
 20%|    ╱───
    |╱───
  0%└─────────────────────────────────────→
    Q1S1  Q1S2  Q1S3  Q2S1  Q2S2  Q2S3  Q3  Q4

Complexity factors:
- Backlog size (6 → 18)
- Capacity scaling (12 → 21)
- Metric visibility (4 → 6)
- Penalty severity (0.5x → 1.5x)
```

## Success Criteria

✅ **Phase 3 is successful if:**

1. **Gentle Onboarding**: Q1S1 feels manageable with only 6 tickets and reduced penalties
2. **Gradual Ramp**: Each sprint introduces incremental complexity without overwhelming jumps
3. **Metric Introduction**: Q2 clearly shows new metrics (CTO + Tech Debt) appearing
4. **Pressure Increase**: Q3-Q4 feels noticeably harder due to harsher penalties
5. **Clear Feedback**: Players can understand the increasing difficulty through:
   - More tickets to choose from
   - More metrics to balance
   - Harsher consequences for mistakes

## Known Issues / Future Enhancements

- [ ] Consider adding UI hints when new metrics appear in Q2 ("New metrics unlocked!")
- [ ] Could add quarter-specific flavor text to reinforce escalating pressure
- [ ] May need to tune penalty scales based on playtesting feedback

## Testing Notes

Record observations here:

**Q1S1 Experience:**
- [ ] Backlog size correct (6)?
- [ ] Capacity appropriate (~12)?
- [ ] Only 4 metrics visible?
- [ ] Felt manageable/forgiving?

**Q2S1 Experience:**
- [ ] Backlog size correct (15)?
- [ ] New metrics appeared (CTO + Tech Debt)?
- [ ] Noticeable increase in complexity?

**Q3-Q4 Experience:**
- [ ] Backlog size correct (18)?
- [ ] Penalties feel harsher?
- [ ] Mistakes more costly?
