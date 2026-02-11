import type { Difficulty, MetricsState } from "@/lib/types";

export type MetricKey = keyof MetricsState;

export type Outcome =
  | "clear_success"
  | "partial_success"
  | "unexpected_impact"
  | "soft_failure"
  | "catastrophe";

export type TicketTemplate = {
  id: string;
  title: string;
  description: string;
  category: string;
  effort: number;
  primary_metric: MetricKey;
  primary_impact?: { success: [number, number]; partial: [number, number] };
  secondary_metric?: MetricKey | null;
  secondary_impact?: { success: [number, number]; partial: [number, number] } | null;
  tradeoff_metric?: MetricKey | null;
  tradeoff_impact?: { success: [number, number]; partial: [number, number] } | null;
  outcomes: Record<Outcome, string>;
};

export type CeoFocus = "self_serve" | "enterprise" | "tech_debt";

export type ProductPulse = {
  churn: "positive" | "mixed" | "concerning";
  support_load: "positive" | "mixed" | "concerning";
  customer_sentiment: "positive" | "mixed" | "concerning";
  narrative: string;
};

export type QuarterlyReview = {
  quarter: number;
  raw_score: number;
  rating: "strong" | "solid" | "mixed" | "below_expectations";
  calibration_outcome?: "survived" | "promoted" | "pip" | "terminated";
  narrative: string;
  factors: Record<string, number | string>;
};

export type YearEndReview = {
  quarterly_scores: number[];
  raw_composite: number;
  calibration_modifier: number;
  final_score: number;
  final_rating:
    | "exceeds_expectations"
    | "meets_expectations_strong"
    | "meets_expectations"
    | "needs_improvement"
    | "does_not_meet_expectations";
  narrative: string;
};

export type TicketInstance = TicketTemplate & {
  ceo_aligned?: boolean;
  is_mandatory?: boolean;
  outcome?: Outcome;
  outcome_narrative?: string;
  metric_impacts?: Partial<Record<MetricKey, number>>;
};

type Rng = {
  next: () => number;
  int: (min: number, max: number) => number;
  pick: <T>(items: T[]) => T;
  state: () => number;
};

export function createRng(seed: number): Rng {
  // Keep state in signed 32-bit range to fit Postgres int
  let t = seed | 0;
  const next = () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: (items) => items[Math.floor(next() * items.length)],
    state: () => t
  };
}

export function computeEffectiveCapacity(metrics: MetricsState): number {
  const team = metrics.team_sentiment;
  const debt = metrics.tech_debt;
  const cto = metrics.cto_sentiment;
  let capacity = 20;

  if (team > 75) capacity += 4;
  else if (team >= 50) capacity += 1;
  else if (team >= 25) capacity -= 2;
  else capacity -= 5;

  if (debt < 25) capacity += 2;
  else if (debt <= 50) capacity += 0;
  else if (debt <= 75) capacity -= 3;
  else capacity -= 6;

  if (cto > 80) capacity += 4;

  return Math.max(8, capacity);
}

export function selectCeoFocus(metrics: MetricsState, rng: Rng): CeoFocus {
  const weights: Record<CeoFocus, number> = {
    self_serve: 35,
    enterprise: 35,
    tech_debt: 30
  };

  if (metrics.self_serve_growth < 35) weights.self_serve += 20;
  if (metrics.enterprise_growth < 35) weights.enterprise += 20;
  if (metrics.tech_debt > 65) weights.tech_debt += 20;

  const total = weights.self_serve + weights.enterprise + weights.tech_debt;
  let roll = rng.next() * total;
  for (const focus of Object.keys(weights) as CeoFocus[]) {
    roll -= weights[focus];
    if (roll <= 0) return focus;
  }
  return "self_serve";
}

export function focusToCategory(focus: CeoFocus): string {
  if (focus === "enterprise") return "enterprise_feature";
  if (focus === "tech_debt") return "tech_debt_reduction";
  return "self_serve_feature";
}

export function isCeoAlignedCategory(
  focus: CeoFocus,
  category: string
): boolean {
  if (focus === "enterprise" && category === "sales_request") return true;
  if (focus === "tech_debt" && category === "infrastructure") return true;
  return category === focusToCategory(focus);
}

export function shouldShiftFocus(rng: Rng, difficulty: Difficulty): boolean {
  const chance =
    difficulty === "easy" ? 0.05 : difficulty === "hard" ? 0.15 : 0.1;
  return rng.next() < chance;
}

export function deriveProductPulse(
  metrics: MetricsState,
  hasCatastrophe: boolean,
  hasUxSuccess: boolean
): ProductPulse {
  const churn =
    metrics.nps > 60 && (metrics.self_serve_growth > 50 || metrics.enterprise_growth > 50)
      ? "positive"
      : metrics.nps < 35 ||
        (metrics.self_serve_growth < 30 && metrics.enterprise_growth < 30)
      ? "concerning"
      : "mixed";

  const support_load =
    metrics.tech_debt < 40 && !hasCatastrophe
      ? "positive"
      : metrics.tech_debt > 65 || hasCatastrophe
      ? "concerning"
      : "mixed";

  const customer_sentiment =
    metrics.nps > 60 && hasUxSuccess
      ? "positive"
      : metrics.nps < 35
      ? "concerning"
      : "mixed";

  return {
    churn,
    support_load,
    customer_sentiment,
    narrative: `Churn looks ${churn}. Support load is ${support_load}. Customer sentiment feels ${customer_sentiment}.`
  };
}

export function computeQuarterlyReview(
  quarter: number,
  metrics: MetricsState,
  pulse: ProductPulse,
  catastropheCount: number,
  context: { lowTeamSprints?: number; alignmentRatio?: number } = {}
): QuarterlyReview {
  const lowTeamSprints = context.lowTeamSprints ?? 0;
  const alignmentRatio = context.alignmentRatio ?? 0;

  const ceoAlignment =
    metrics.ceo_sentiment > 70
      ? 38
      : metrics.ceo_sentiment >= 50
      ? 27
      : metrics.ceo_sentiment >= 30
      ? 14
      : 6;

  const growthUp =
    metrics.self_serve_growth > 55 && metrics.enterprise_growth > 55
      ? 18
      : metrics.self_serve_growth > 55 || metrics.enterprise_growth > 55
      ? 13
      : metrics.self_serve_growth < 35 || metrics.enterprise_growth < 35
      ? 3
      : 8;

  const stability =
    catastropheCount === 0 ? 18 : catastropheCount === 1 ? 12 : 5;

  const pulseScore =
    pulse.churn === "positive" &&
    pulse.support_load === "positive" &&
    pulse.customer_sentiment === "positive"
      ? 19
      : pulse.churn === "concerning" ||
        pulse.support_load === "concerning" ||
        pulse.customer_sentiment === "concerning"
      ? 5
      : 10;

  const alignmentBonus =
    alignmentRatio >= 0.6
      ? 5
      : alignmentRatio >= 0.45
      ? 3
      : alignmentRatio >= 0.3
      ? 1
      : 0;

  const moralePenalty = lowTeamSprints >= 2 ? -5 : 0;

  // Tech debt: gradient penalties for concerning levels
  const techDebtBonus =
    metrics.tech_debt < 30 ? 5
    : metrics.tech_debt > 75 ? -8
    : metrics.tech_debt > 65 ? -5
    : metrics.tech_debt > 50 ? -2
    : 0;

  // Team sentiment: gradient bonuses/penalties
  const teamBonus =
    metrics.team_sentiment > 70 ? 5
    : metrics.team_sentiment > 60 ? 3
    : metrics.team_sentiment < 35 ? -5
    : metrics.team_sentiment < 45 ? -3
    : 0;

  // CTO sentiment: critical for tech credibility
  const ctoBonus =
    metrics.cto_sentiment > 70 ? 4
    : metrics.cto_sentiment > 60 ? 2
    : metrics.cto_sentiment < 35 ? -6
    : metrics.cto_sentiment < 45 ? -3
    : 0;

  // Sales sentiment: affects revenue and enterprise deals
  const salesBonus =
    metrics.sales_sentiment > 70 ? 4
    : metrics.sales_sentiment > 60 ? 2
    : metrics.sales_sentiment < 35 ? -6
    : metrics.sales_sentiment < 45 ? -3
    : 0;

  // Critical stakeholder failure: if 2+ stakeholders are unhappy, major penalty
  const criticalStakeholders = [
    metrics.team_sentiment,
    metrics.ceo_sentiment,
    metrics.sales_sentiment,
    metrics.cto_sentiment
  ];
  const unhappyStakeholders = criticalStakeholders.filter(s => s < 40).length;
  const stakeholderCrisisPenalty =
    unhappyStakeholders >= 3 ? -15
    : unhappyStakeholders >= 2 ? -10
    : 0;

  const rawScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ceoAlignment +
          growthUp +
          stability +
          pulseScore +
          alignmentBonus +
          moralePenalty +
          techDebtBonus +
          teamBonus +
          ctoBonus +
          salesBonus +
          stakeholderCrisisPenalty
      )
    )
  );

  // Base rating from score with stricter thresholds
  let rating: "strong" | "solid" | "mixed" | "below_expectations" =
    rawScore >= 80
      ? "strong"
      : rawScore >= 65
      ? "solid"
      : rawScore >= 45
      ? "mixed"
      : "below_expectations";

  // Hard downgrade rules: critical stakeholder failures override score
  // If 3+ stakeholders are very unhappy (<40), automatic "below_expectations"
  if (unhappyStakeholders >= 3) {
    rating = "below_expectations";
  }
  // If 2+ stakeholders are very unhappy, force "below_expectations"
  else if (unhappyStakeholders >= 2) {
    rating = "below_expectations";
  }
  // If tech debt is critical (>75) and team morale is low (<40), force "mixed" at best
  else if (metrics.tech_debt > 75 && metrics.team_sentiment < 40) {
    if (rating === "strong" || rating === "solid") {
      rating = "mixed";
    }
  }

  return {
    quarter,
    raw_score: rawScore,
    rating,
    narrative: `Quarter ${quarter} review: ${rating.replace("_", " ")}. Alignment and growth were ${rawScore >= 60 ? "adequate" : "inconsistent"}.`,
    factors: {
      ceo_alignment_score: ceoAlignment,
      growth_trajectory_score: growthUp,
      stability_score: stability,
      pulse_health_score: pulseScore,
      alignment_bonus: alignmentBonus,
      morale_penalty: moralePenalty,
      alignment_ratio: Number(alignmentRatio.toFixed(2)),
      tech_debt_bonus: techDebtBonus,
      team_bonus: teamBonus,
      cto_bonus: ctoBonus,
      sales_bonus: salesBonus,
      stakeholder_crisis_penalty: stakeholderCrisisPenalty
    }
  };
}

export function computeYearEndReview(
  difficulty: Difficulty,
  quarterlyScores: number[],
  rng: Rng
): YearEndReview {
  const scores = quarterlyScores.slice(0, 4);
  while (scores.length < 4) scores.push(50);

  const avg =
    scores.reduce((sum, value) => sum + value, 0) / scores.length;
  const strictlyImproving =
    scores[0] < scores[1] && scores[1] < scores[2] && scores[2] < scores[3];
  const strictlyDeclining =
    scores[0] > scores[1] && scores[1] > scores[2] && scores[2] > scores[3];
  const range = Math.max(...scores) - Math.min(...scores);

  let trajectoryBonus = 50;
  if (strictlyImproving) trajectoryBonus = 90;
  else if (strictlyDeclining) trajectoryBonus = 10;
  else if (range <= 10) trajectoryBonus = 50;
  else if (scores[3] > scores[0]) trajectoryBonus = 70;
  else if (scores[3] < scores[0]) trajectoryBonus = 30;

  let consistencyBonus = 55;
  if (range <= 15) consistencyBonus = 85;
  else if (range > 25) consistencyBonus = 20;

  const rawComposite =
    avg * 0.5 + trajectoryBonus * 0.25 + consistencyBonus * 0.25;

  const calibrationRange =
    difficulty === "easy"
      ? { min: -5, max: 8 }
      : difficulty === "hard"
      ? { min: -12, max: 8 }
      : { min: -10, max: 10 };
  let calibrationModifier = rng.int(
    calibrationRange.min,
    calibrationRange.max
  );
  if (rawComposite >= 90) {
    calibrationModifier = Math.max(calibrationModifier, -3);
  } else if (rawComposite >= 80) {
    calibrationModifier = Math.max(calibrationModifier, -6);
  }
  const finalScore = Math.max(
    0,
    Math.min(100, Math.round(rawComposite + calibrationModifier))
  );

  const finalRating =
    finalScore >= 85
      ? "exceeds_expectations"
      : finalScore >= 70
      ? "meets_expectations_strong"
      : finalScore >= 45
      ? "meets_expectations"
      : finalScore >= 25
      ? "needs_improvement"
      : "does_not_meet_expectations";

  return {
    quarterly_scores: scores,
    raw_composite: Math.round(rawComposite),
    calibration_modifier: calibrationModifier,
    final_score: finalScore,
    final_rating: finalRating,
    narrative: `Year-end review: ${finalRating.replace(/_/g, " ")}. Calibration applied.`
  };
}

export function generateBacklog(
  templates: TicketTemplate[],
  metrics: MetricsState,
  rng: Rng,
  count: number
): TicketInstance[] {
  const templatesByCategory = new Map<string, TicketTemplate[]>();
  for (const template of templates) {
    const list = templatesByCategory.get(template.category) ?? [];
    list.push(template);
    templatesByCategory.set(template.category, list);
  }

  const categories = Array.from(templatesByCategory.keys());
  if (categories.length === 0) return [];

  const weights = new Map<string, number>();
  for (const category of categories) {
    weights.set(category, 1);
  }

  if (metrics.sales_sentiment < 45) {
    weights.set(
      "sales_request",
      (weights.get("sales_request") ?? 0) + 2
    );
  }
  if (metrics.tech_debt > 55) {
    weights.set(
      "tech_debt_reduction",
      (weights.get("tech_debt_reduction") ?? 0) + 2
    );
  }
  if (metrics.enterprise_growth < 45) {
    weights.set(
      "enterprise_feature",
      (weights.get("enterprise_feature") ?? 0) + 2
    );
  }
  if (metrics.self_serve_growth < 45) {
    weights.set(
      "self_serve_feature",
      (weights.get("self_serve_feature") ?? 0) + 2
    );
  }
  if (metrics.nps < 45) {
    weights.set(
      "ux_improvement",
      (weights.get("ux_improvement") ?? 0) + 1
    );
  }

  const pickCategory = () => {
    const total = Array.from(weights.values()).reduce((sum, w) => sum + w, 0);
    let roll = rng.next() * total;
    for (const [category, weight] of weights.entries()) {
      roll -= weight;
      if (roll <= 0) return category;
    }
    return categories[0];
  };

  const selected: TicketInstance[] = [];
  const usedIds = new Set<string>();

  const guaranteeCategories: string[] = [];
  if (metrics.self_serve_growth < 45) {
    guaranteeCategories.push("self_serve_feature");
  }
  if (metrics.enterprise_growth < 45) {
    guaranteeCategories.push("enterprise_feature");
  }
  if (metrics.tech_debt > 55) {
    guaranteeCategories.push("tech_debt_reduction");
  }
  if (metrics.sales_sentiment < 40) {
    guaranteeCategories.push("sales_request");
  }
  if (metrics.nps < 45) {
    guaranteeCategories.push("ux_improvement");
  }

  const pickUniqueFromCategory = (category: string) => {
    const pool = templatesByCategory.get(category) ?? templates;
    if (pool.length === 0) return null;
    let candidate = rng.pick(pool);
    let guard = 0;
    while (usedIds.has(candidate.id) && guard < 5) {
      candidate = rng.pick(pool);
      guard += 1;
    }
    if (usedIds.has(candidate.id)) {
      const fallback = pool.find((tpl) => !usedIds.has(tpl.id));
      if (!fallback) return null;
      candidate = fallback;
    }
    return candidate;
  };

  for (const category of guaranteeCategories) {
    if (selected.length >= count) break;
    const candidate = pickUniqueFromCategory(category);
    if (!candidate) continue;
    usedIds.add(candidate.id);
    selected.push({ ...candidate });
  }

  // Helper to pick a ticket by size
  const pickBySize = (minEffort: number, maxEffort: number) => {
    const pool = templates.filter(
      (t) => !usedIds.has(t.id) && t.effort >= minEffort && t.effort <= maxEffort
    );
    if (pool.length === 0) return null;
    return rng.pick(pool);
  };

  // Enforce size distribution: aim for ~1 small, ~2 medium, ~1 large with variance
  const targetSmall = rng.int(1, 2); // 1-2 small tickets
  const targetMedium = rng.int(2, 3); // 2-3 medium tickets
  const targetLarge = rng.int(1, 2); // 1-2 large tickets

  let smallCount = selected.filter((t) => t.effort <= 3).length;
  let mediumCount = selected.filter((t) => t.effort >= 4 && t.effort <= 6).length;
  let largeCount = selected.filter((t) => t.effort >= 7).length;

  // Add small tickets if needed
  while (smallCount < targetSmall && selected.length < count) {
    const ticket = pickBySize(1, 3);
    if (!ticket) break;
    usedIds.add(ticket.id);
    selected.push({ ...ticket });
    smallCount++;
  }

  // Add medium tickets if needed
  while (mediumCount < targetMedium && selected.length < count) {
    const ticket = pickBySize(4, 6);
    if (!ticket) break;
    usedIds.add(ticket.id);
    selected.push({ ...ticket });
    mediumCount++;
  }

  // Add large tickets if needed
  while (largeCount < targetLarge && selected.length < count) {
    const ticket = pickBySize(7, 10);
    if (!ticket) break;
    usedIds.add(ticket.id);
    selected.push({ ...ticket });
    largeCount++;
  }

  // Fill remaining slots with weighted random selection
  while (selected.length < count) {
    const category = pickCategory();
    const candidate = pickUniqueFromCategory(category);
    if (!candidate) break;
    usedIds.add(candidate.id);
    selected.push({ ...candidate });
  }

  return selected;
}

type OutcomeContext = {
  techDebt: number;
  teamSentiment: number;
  isOverbooked: boolean;
  overbookFraction?: number;
  underbookFraction?: number;
  isMoonshot: boolean;
  ceoAligned: boolean;
  difficulty: Difficulty;
};

export function rollOutcome(rng: Rng, context: OutcomeContext): Outcome {
  const base: Record<Outcome, number> = {
    clear_success: 22,
    partial_success: 50,
    unexpected_impact: 9,
    soft_failure: 15,
    catastrophe: 4
  };

  const mod = { ...base };

  if (context.ceoAligned) {
    mod.clear_success += 10;
    mod.partial_success += 6;
    mod.soft_failure -= 8;
    mod.catastrophe -= 2;
  }

  if (context.techDebt > 80) {
    mod.soft_failure += 4;
    mod.catastrophe += 3;
  } else if (context.techDebt > 65) {
    mod.soft_failure += 3;
    mod.catastrophe += 2;
  }

  if (context.teamSentiment < 30) {
    mod.soft_failure += 3;
    mod.catastrophe += 1;
  } else if (context.teamSentiment > 75) {
    mod.clear_success += 5;
    mod.partial_success += 3;
    mod.soft_failure -= 5;
    mod.catastrophe -= 3;
  }

  const overbookFraction = Math.max(
    0,
    Math.min(1, context.overbookFraction ?? (context.isOverbooked ? 1 : 0))
  );
  if (overbookFraction > 0) {
    mod.clear_success -= 4 * overbookFraction;
    mod.partial_success -= 2 * overbookFraction;
    mod.soft_failure += 5 * overbookFraction;
    mod.catastrophe += 2 * overbookFraction;
  }

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

  if (context.isMoonshot) {
    mod.clear_success -= 8;
    mod.partial_success += 3;
    mod.soft_failure += 3;
    mod.catastrophe += 2;
  }

  if (context.difficulty === "easy") {
    mod.clear_success += 5;
    mod.partial_success += 3;
    mod.soft_failure -= 5;
    mod.catastrophe -= 3;
  }
  if (context.difficulty === "hard") {
    mod.clear_success -= 5;
    mod.soft_failure += 3;
    mod.catastrophe += 2;
  }

  const baseSoft = base.soft_failure;
  const baseCat = base.catastrophe;
  const softDelta = mod.soft_failure - baseSoft;
  const catDelta = mod.catastrophe - baseCat;
  const softPos = Math.max(0, softDelta);
  const catPos = Math.max(0, catDelta);
  const totalPos = softPos + catPos;
  if (totalPos > 6) {
    const scale = 6 / totalPos;
    mod.soft_failure = baseSoft + Math.min(0, softDelta) + softPos * scale;
    mod.catastrophe = baseCat + Math.min(0, catDelta) + catPos * scale;
  }

  const outcomes: Outcome[] = [
    "clear_success",
    "partial_success",
    "unexpected_impact",
    "soft_failure",
    "catastrophe"
  ];

  const clamped = outcomes.map((key) => Math.max(2, mod[key]));
  const total = clamped.reduce((sum, value) => sum + value, 0);
  const roll = rng.next() * total;

  let acc = 0;
  for (let i = 0; i < outcomes.length; i += 1) {
    acc += clamped[i];
    if (roll <= acc) return outcomes[i];
  }
  return "partial_success";
}

const stakeholderByCategory: Record<string, MetricKey> = {
  self_serve_feature: "ceo_sentiment",
  enterprise_feature: "sales_sentiment",
  tech_debt_reduction: "cto_sentiment",
  ux_improvement: "team_sentiment",
  infrastructure: "cto_sentiment",
  monetization: "ceo_sentiment",
  sales_request: "sales_sentiment",
  moonshot: "ceo_sentiment"
};

const clampMetric = (value: number) => Math.max(0, Math.min(100, value));

const applyRange = (rng: Rng, range?: [number, number] | null) => {
  if (!range) return 0;
  const [min, max] = range;
  if (min === max) return min;
  return rng.int(min, max);
};

export function applyOutcome(
  rng: Rng,
  metrics: MetricsState,
  ticket: TicketTemplate,
  outcome: Outcome
): { updated: MetricsState; deltas: Partial<Record<MetricKey, number>> } {
  const updated = { ...metrics };
  const deltas: Partial<Record<MetricKey, number>> = {};

  const applyDelta = (metric: MetricKey, delta: number) => {
    if (!delta) return;
    updated[metric] = clampMetric(updated[metric] + delta);
    deltas[metric] = (deltas[metric] ?? 0) + delta;
  };

  // Hidden impact: 70% correlation with description/expectations, 30% surprise
  // Remove direct effort correlation - impact is independent of effort
  const baseImpact = 1.0;
  const randomVariance = rng.next() * 0.6 - 0.3; // -0.3 to +0.3
  const impactScale = Math.max(0.7, Math.min(1.5, baseImpact + randomVariance));
  const wildScale = impactScale + 0.1;
  const failureScale = impactScale + 0.2;
  const scaleDelta = (delta: number, scale: number) =>
    Math.round(delta * scale);

  const stakeholder = stakeholderByCategory[ticket.category] ?? "ceo_sentiment";

  if (outcome === "clear_success" || outcome === "partial_success") {
    const isSuccess = outcome === "clear_success";
    const primaryRange = isSuccess
      ? ticket.primary_impact?.success
      : ticket.primary_impact?.partial;
    const secondaryRange = isSuccess
      ? ticket.secondary_impact?.success
      : ticket.secondary_impact?.partial;
    const tradeoffRange = isSuccess
      ? ticket.tradeoff_impact?.success
      : ticket.tradeoff_impact?.partial;

    applyDelta(
      ticket.primary_metric,
      scaleDelta(applyRange(rng, primaryRange), impactScale)
    );

    if (ticket.secondary_metric) {
      applyDelta(
        ticket.secondary_metric,
        scaleDelta(applyRange(rng, secondaryRange), impactScale)
      );
    }

    if (ticket.tradeoff_metric) {
      const tradeoffDelta = applyRange(rng, tradeoffRange);
      const tradeoffScale = 1 + ticket.effort / 10;
      const scaledTradeoff = Math.round(
        tradeoffDelta * tradeoffScale * impactScale
      );
      applyDelta(ticket.tradeoff_metric, scaledTradeoff);
    }

    const stakeholderDelta = isSuccess ? rng.int(4, 8) : rng.int(2, 4);
    applyDelta(
      stakeholder,
      scaleDelta(stakeholderDelta, Math.max(1, impactScale - 0.05))
    );
  }

  if (outcome === "unexpected_impact") {
    applyDelta(
      ticket.primary_metric,
      scaleDelta(rng.int(-4, 6), wildScale)
    );
    const metricsList: MetricKey[] = [
      "team_sentiment",
      "ceo_sentiment",
      "sales_sentiment",
      "cto_sentiment",
      "self_serve_growth",
      "enterprise_growth",
      "tech_debt",
      "nps"
    ];
    const other = rng.pick(metricsList.filter((m) => m !== ticket.primary_metric));
    const swing = rng.next() < 0.5 ? rng.int(6, 14) : rng.int(-14, -6);
    applyDelta(other, scaleDelta(swing, wildScale));
    if (ticket.tradeoff_metric) {
      applyDelta(
        ticket.tradeoff_metric,
        scaleDelta(rng.int(-5, -2), wildScale)
      );
    }
  }

  if (outcome === "soft_failure") {
    applyDelta(
      ticket.primary_metric,
      scaleDelta(rng.int(-6, -2), failureScale)
    );
    applyDelta(
      "team_sentiment",
      scaleDelta(rng.int(-9, -5), failureScale)
    );
    applyDelta("tech_debt", scaleDelta(rng.int(2, 5), failureScale));
    if (stakeholder !== "team_sentiment") {
      applyDelta(
        stakeholder,
        scaleDelta(rng.int(-4, -2), failureScale)
      );
    }
  }

  if (outcome === "catastrophe") {
    applyDelta(
      ticket.primary_metric,
      scaleDelta(rng.int(-18, -10), failureScale)
    );
    applyDelta(
      "team_sentiment",
      scaleDelta(rng.int(-16, -8), failureScale)
    );
    applyDelta(
      "ceo_sentiment",
      scaleDelta(rng.int(-12, -6), failureScale)
    );
    applyDelta("tech_debt", scaleDelta(rng.int(5, 10), failureScale));
    const metricsList: MetricKey[] = [
      "sales_sentiment",
      "cto_sentiment",
      "self_serve_growth",
      "enterprise_growth",
      "nps"
    ];
    const other = rng.pick(metricsList);
    applyDelta(other, scaleDelta(rng.int(-10, -5), failureScale));
    if (stakeholder !== "team_sentiment" && stakeholder !== "ceo_sentiment") {
      applyDelta(
        stakeholder,
        scaleDelta(rng.int(-8, -4), failureScale)
      );
    }
  }

  return { updated, deltas };
}
