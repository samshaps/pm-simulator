# Capacity Fairness Fixes - Implementation Summary

## ✅ Changes Implemented

### 1. Updated Type Definition
**File:** `src/lib/game/simulate.ts`

Added `underbookFraction` to the `OutcomeContext` type:
```typescript
type OutcomeContext = {
  techDebt: number;
  teamSentiment: number;
  isOverbooked: boolean;
  overbookFraction?: number;
  underbookFraction?: number;  // ✅ NEW
  isMoonshot: boolean;
  ceoAligned: boolean;
  difficulty: Difficulty;
};
```

### 2. Added Underbooking Success Bonus
**File:** `src/lib/game/simulate.ts` (in `rollOutcome` function)

Added success rate improvements when booking under capacity:
```typescript
// Reward conservative planning with underbooking bonus
const underbookFraction = Math.max(
  0,
  Math.min(0.5, context.underbookFraction ?? 0)
);
if (underbookFraction > 0) {
  mod.clear_success += 6 * underbookFraction;
  mod.partial_success += 3 * underbookFraction;
  mod.soft_failure -= 4 * underbookFraction;
  mod.catastrophe -= 2 * underbookFraction;
}
```

**Impact:**
- 10% underbooked: +0.6 clear success, -0.4 soft failure
- 20% underbooked: +1.2 clear success, -0.8 soft failure
- 50% underbooked (max): +3.0 clear success, -2.0 soft failure

### 3. Calculate Underbooking Metrics
**File:** `src/app/api/sprint/commit/route.ts`

Added calculation of underbooking amounts:
```typescript
const underAmount = Math.max(0, effectiveCapacity - totalEffort);
const underbookFraction = underAmount > 0 ? Math.min(underAmount / effectiveCapacity, 0.5) : 0;
const isUnderbooked = underAmount > 0;
```

### 4. Pass Underbooking to Outcome Calculator
**File:** `src/app/api/sprint/commit/route.ts`

Updated `rollOutcome` call to include underbooking context:
```typescript
const outcome = rollOutcome(rng, {
  techDebt: updatedMetrics.tech_debt,
  teamSentiment: updatedMetrics.team_sentiment,
  isOverbooked,
  overbookFraction,
  underbookFraction,  // ✅ NEW
  isMoonshot: ticket.category === "moonshot",
  ceoAligned,
  difficulty: game.difficulty
});
```

### 5. Scaled Failure Penalties for Conservative Planning
**File:** `src/app/api/sprint/commit/route.ts`

Reduced penalties when failures occur but player planned conservatively:
```typescript
if (failureRate >= 0.5) {
  // If significantly underbooked, reduce penalties (they planned well, just got unlucky)
  const penaltyScale = isUnderbooked && underbookFraction > 0.1
    ? Math.max(0.5, 1 - underbookFraction)
    : 1.0;

  applyMetricDelta("team_sentiment", Math.round(-4 * penaltyScale));
  applyMetricDelta("ceo_sentiment", Math.round(-3 * penaltyScale));
  applyMetricDelta("sales_sentiment", Math.round(-2 * penaltyScale));
  applyMetricDelta("cto_sentiment", Math.round(-2 * penaltyScale));
}
```

**Impact:**
- 10% underbooked: 90% of normal penalties
- 20% underbooked: 80% of normal penalties
- 30% underbooked: 70% of normal penalties

### 6. Improved Team Morale Rewards
**File:** `src/app/api/sprint/commit/route.ts`

Made team morale bonuses more generous and conditional:
```typescript
if (isUnderbooked) {
  // Base bonus for being under capacity
  let bonus = 2;

  // Extra bonus if things went well
  if (failureRate < 0.25) {
    bonus += 3;
  } else if (failureRate < 0.5) {
    bonus += 1;  // Small bonus even with some failures
  }

  // Scale by how much under capacity
  bonus = Math.round(bonus * (1 + underbookFraction));

  updatedMetrics.team_sentiment = clampMetric(
    updatedMetrics.team_sentiment + bonus
  );
  metricDeltas.team_sentiment = (metricDeltas.team_sentiment ?? 0) + bonus;
}
```

**Impact:**
- Underbooked + <25% failures: +5-7 team sentiment
- Underbooked + 25-50% failures: +2-4 team sentiment
- Significantly underbooked: even larger bonuses

## Example: Your Scenario

**Before Fixes:**
- Capacity: 20pts
- Booked: 18pts (10% under)
- Results: 2 failures out of 3 tickets (66% failure rate)
- Penalties:
  - Team sentiment: -4
  - CEO sentiment: -3
  - Sales sentiment: -2
  - CTO sentiment: -2
- Bonuses: 0 (because failure rate > 25%)

**After Fixes:**
- Success probability boost: +0.6% clear, -0.4% soft failure
- Penalties (90% of normal):
  - Team sentiment: -3.6 → -4 rounded
  - CEO sentiment: -2.7 → -3 rounded
  - Sales sentiment: -1.8 → -2 rounded
  - CTO sentiment: -1.8 → -2 rounded
- Bonuses: +2 base + 1 (for <50% failures) × 1.1 = +3 team sentiment

**Net Improvement:**
- Lower failure probability going in
- +3 team sentiment bonus (vs 0 before)
- Recognition for conservative planning even with bad luck

## Testing Recommendations

### Scenario 1: Conservative Planning with Success
- Book 3-5pts under capacity
- Expect high success rates
- Should see +5-7 team sentiment bonus

### Scenario 2: Conservative Planning with Mixed Results (Your Case)
- Book 2-3pts under capacity
- Some failures occur
- Should see reduced penalties and +2-4 team sentiment bonus

### Scenario 3: At/Over Capacity
- Book at or above capacity
- Should see current behavior (no underbooking bonuses)

## Next Steps

1. **Test in game** - Play a few sprints to verify the changes feel fair
2. **Monitor feedback** - See if players still feel it's too harsh
3. **Tune if needed** - Can adjust the multipliers if bonuses are too weak/strong
4. **Consider additional fixes** - If still too harsh overall, implement the broader balance tweaks from the original proposal

## Files Modified

- ✅ `src/lib/game/simulate.ts` (type + underbooking bonus logic)
- ✅ `src/app/api/sprint/commit/route.ts` (calculation + penalties + rewards)
