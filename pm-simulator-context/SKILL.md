---
name: pm-simulator-context
description: Context and architecture guide for the PM Simulator project. Use this skill whenever working with the PM Simulator codebase, especially at the start of new sessions to quickly understand the project structure, key files, game mechanics, and where to make common changes. Trigger when the user mentions PM simulator, sprint planning, quarterly reviews, ticket selection, metrics, or any gameplay mechanics.
---

# PM Simulator Context

The PM Simulator is a Next.js web game that simulates the experience of being a Product Manager over four quarters (12 sprints). Players select tickets each sprint, manage stakeholder relationships, and try to survive until year-end performance review.

## Core Game Loop

1. **Sprint Planning**: User selects tickets from backlog (respecting capacity limits)
2. **Sprint Execution**: Each ticket rolls an outcome (clear_success, partial_success, unexpected_impact, soft_failure, catastrophe)
3. **Metric Updates**: Outcomes affect 8 core metrics (team/ceo/sales/cto sentiment, growth, tech debt, NPS)
4. **Retro Display**: Show outcomes, metric changes, and narrative feedback
5. **Next Sprint**: Generate new backlog, repeat for 3 sprints per quarter
6. **Quarterly Review**: Score based on CEO alignment, growth, stability, pulse
7. **Year End**: After Q4, calculate final performance rating

## Architecture

**Tech Stack**: Next.js 14+ (App Router), Supabase (PostgreSQL), TypeScript, TailwindCSS

**Key Directories**:
- `src/app/` - Next.js pages and API routes
- `src/components/` - React components for each game screen
- `src/lib/game/` - Core game simulation logic (deterministic, seedable RNG)
- `src/lib/` - Types, utilities, Supabase clients

## Critical Files

### Game Simulation (`src/lib/game/simulate.ts`)
The heart of the game - all simulation logic is here:

**Key Functions**:
- `createRng(seed)` - Deterministic random number generator
- `computeEffectiveCapacity(metrics)` - Calculate sprint capacity based on team sentiment, tech debt, CTO sentiment
- `selectCeoFocus(metrics, rng)` - Choose CEO priority (self_serve, enterprise, tech_debt)
- `generateBacklog(templates, metrics, rng, count)` - Create sprint backlog with weighted category selection
- `rollOutcome(rng, context)` - Determine ticket outcome based on context (overbooked, tech debt, team morale, etc.)
- `applyOutcome(rng, metrics, ticket, outcome)` - Apply metric deltas from ticket outcome
- `computeQuarterlyReview(quarter, metrics, pulse, catastropheCount, context)` - Score the quarter
- `computeYearEndReview(difficulty, quarterlyScores, rng)` - Final performance rating

**Outcome Types**: clear_success, partial_success, unexpected_impact, soft_failure, catastrophe

**Outcome Modifiers**: CEO alignment, tech debt, team sentiment, overbooking, underbooking, moonshot tickets

### Sprint Commit API (`src/app/api/sprint/commit/route.ts`)
Processes sprint commitment and advances game state:

**Flow**:
1. Validate ticket selection against capacity
2. Calculate overbooking/underbooking fractions
3. Roll outcomes for each ticket
4. Apply metric deltas
5. Apply sprint-level adjustments (overbook penalty, success bonuses, tech debt drift)
6. **Thematic consistency bonus** (lines 576-605): Rewards focusing on similar ticket categories
7. Check for death spiral (capacity collapse → game over)
8. Generate retro narrative
9. Handle random events and threshold events
10. If quarter end: compute quarterly review, shift CEO focus
11. If year end: compute year-end review, complete game
12. Generate next sprint's backlog

**Important Patterns**:
- Death spiral check (line 1135): If capacity ≤ 5, player is fired immediately
- CEO focus shifts: Between quarters (always) and mid-sprint (rare, difficulty-dependent)
- Roadmap hijacks: Low stakeholder sentiment forces mandatory tickets
- Forced tickets: From events, persist for N sprints

### Types (`src/lib/types.ts`)
Core type definitions:
- `MetricsState`: 8 metrics (team_sentiment, ceo_sentiment, sales_sentiment, cto_sentiment, self_serve_growth, enterprise_growth, tech_debt, nps)
- `Difficulty`: easy, normal, hard
- `GameRecord`: Full game state

### UI Components
- `src/components/SprintPlanning.tsx` - Ticket selection interface
- `src/components/SprintRetro.tsx` - Results and narrative display
- `src/components/QuarterlyReview.tsx` - Quarter summary
- `src/app/page.tsx` - Home screen (start game, difficulty selection)

## Game Mechanics Deep Dive

### Capacity System
**Base capacity**: 20 points
**Modifiers**:
- Team sentiment: >75: +4 | 50-75: +1 | 25-50: -2 | <25: -5
- Tech debt: <25: +2 | 25-50: 0 | 50-75: -3 | >75: -6
- CTO sentiment: >80: +4
- Events: Can temporarily modify capacity

**Max capacity**: 125% of effective capacity (hard limit on overbooking)

### Outcome Probabilities
**Base rates**: clear_success 22%, partial_success 50%, unexpected_impact 9%, soft_failure 15%, catastrophe 4%

**Positive modifiers**: CEO aligned, high team morale, underbooking
**Negative modifiers**: High tech debt, low team morale, overbooking, moonshot tickets

### Ticket Categories
- `self_serve_feature` - Affects self-serve growth, CEO sentiment
- `enterprise_feature` - Affects enterprise growth, sales sentiment
- `tech_debt_reduction` - Reduces tech debt, improves CTO sentiment
- `infrastructure` - Similar to tech debt, CTO-focused
- `ux_improvement` - Affects NPS, team sentiment
- `sales_request` - Urgent sales asks, affects sales sentiment
- `monetization` - Revenue features, CEO-focused
- `moonshot` - High risk/reward, CEO-aligned

### Thematic Consistency Bonus (NEW)
When you select 2+ tickets of the same category in a sprint with 3+ total tickets AND achieve 50%+ success rate:
- Universal +2 team sentiment
- Category-specific bonuses (+1-2 to relevant metrics)
- Retro narrative mentions team appreciation for focused theme

### CEO Focus System
Each quarter, CEO prioritizes one area:
- `self_serve` - Self-serve features valued
- `enterprise` - Enterprise features valued
- `tech_debt` - Tech debt work valued

**Alignment bonus**: Tickets matching CEO focus get better outcome odds and stakeholder bonuses

**Focus shifts**:
- Between quarters: Always (with 3 retry attempts to avoid same focus)
- Mid-sprint: Rare, based on difficulty (easy: 5%, normal: 10%, hard: 15%)
- Event-triggered: Some events force focus changes

### Quarterly Scoring
**Components** (from `computeQuarterlyReview`):
- CEO alignment (6-38 points based on ceo_sentiment)
- Growth trajectory (3-18 points based on growth metrics)
- Stability (5-18 points, penalized by catastrophes)
- Product pulse (5-19 points: churn, support load, customer sentiment)
- Alignment bonus (0-5 points based on CEO-aligned ticket ratio)
- Morale penalty (-5 if team_sentiment < 30 for 2+ sprints)
- Tech debt bonus/penalty (-8 to +5)
- Stakeholder bonuses/penalties (team, CTO, sales)
- Critical stakeholder failure penalty (up to -15 if multiple stakeholders < 40)

**Rating thresholds**: strong (80+), solid (65+), mixed (45+), below_expectations (<45)

**Override rules**: Multiple unhappy stakeholders (<40) force "below_expectations" regardless of score

### Year-End Review
Considers:
- Average quarterly score (50% weight)
- Trajectory bonus (25% weight) - Rewards improvement over time
- Consistency bonus (25% weight) - Rewards stable performance
- Calibration modifier (random variance based on difficulty)

**Ratings**: exceeds_expectations, meets_expectations_strong, meets_expectations, needs_improvement, does_not_meet_expectations

## Common Changes & Where to Make Them

### Adding New Ticket Categories
1. Add category to ticket templates (database: `ticket_templates` table)
2. Update `stakeholderByCategory` map in `simulate.ts` (line 711)
3. Add category handling in backlog generation weights (line 441+)
4. Add to category display names if using thematic consistency (line 824)

### Adjusting Difficulty
**Outcome probabilities**: `rollOutcome()` function (line 600), lines 666-676
**Capacity calculation**: `computeEffectiveCapacity()` (line 91)
**CEO focus shift frequency**: `shouldShiftFocus()` (line 147)

### Adding New Metrics
1. Add to `MetricsState` type in `types.ts`
2. Update metric clamping in all outcome applications
3. Add to quarterly review scoring if relevant
4. Consider adding to product pulse calculation

### Modifying Sprint Penalties/Bonuses
**Overbooking penalty**: Line 471-492 in `route.ts`
**Underbooking bonus**: Line 494-512
**Success rate bonuses**: Line 514-539
**Category composition effects**: Line 541-575
**Thematic consistency**: Line 576-605

### Adjusting Quarterly Scoring
Edit `computeQuarterlyReview()` in `simulate.ts` (line 188):
- Component weights (ceoAlignment, growthUp, stability, etc.)
- Threshold overrides (hard downgrade rules)
- Stakeholder crisis detection

### Adding Events
Events are in database (`event_catalog` table):
- **Random events**: Trigger by chance each sprint
- **Threshold events**: Trigger when metrics cross thresholds
- **CEO shift narratives**: Flavor text for focus changes

Event effects can modify metrics, force tickets, change capacity, or shift CEO focus.

## Database Schema

**Key Tables**:
- `games` - Game state (metrics, quarter, sprint, RNG seed, events log)
- `sprints` - Backlog, committed tickets, retro results
- `quarters` - CEO focus, product pulse, quarterly review
- `ticket_templates` - Available ticket definitions
- `event_catalog` - Random and threshold events
- `narrative_templates` - Retro narrative templates
- `year_end_review` - Final performance review

## Development Patterns

**Deterministic RNG**: All randomness uses seeded RNG for reproducibility
**Metric clamping**: All metrics stay in [0, 100] range
**Capacity calculations**: Always check for death spiral (capacity ≤ 5)
**Event persistence**: Events can span multiple sprints (tracked in events_log)
**Retro narratives**: Use template system with variable substitution

## Testing Strategy

When making changes:
1. Consider impact on game balance (too easy/hard?)
2. Check metric bounds (can anything overflow/underflow?)
3. Test edge cases (all failures, all successes, capacity collapse)
4. Verify RNG determinism (same seed = same results)
5. Check quarterly scoring thresholds

## Recent Changes

**Thematic consistency bonus** (added recently): Rewards selecting multiple tickets of the same category. Provides light metric bonuses and team morale boost when sprint succeeds. Adds flavor text to retro narrative.
