import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  applyOutcome,
  computeEffectiveCapacity,
  createRng,
  generateBacklog,
  selectCeoFocus,
  focusToCategory,
  isCeoAlignedCategory,
  shouldShiftFocus,
  deriveProductPulse,
  computeQuarterlyReview,
  computeYearEndReview,
  rollOutcome,
  type CeoFocus,
  type ProductPulse,
  type QuarterlyReview,
  type YearEndReview,
  type TicketInstance,
  type TicketTemplate
} from "@/lib/game/simulate";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { MetricsState } from "@/lib/types";

type CommitPayload = {
  ticketIds: string[];
};

type TicketOutcome = TicketInstance & {
  outcome: string;
  outcome_narrative: string;
  metric_impacts: Record<string, number>;
};

const clampMetric = (value: number) => Math.max(0, Math.min(100, value));

type HijackSource = "sales" | "cto" | "ceo";

const successOutcomes = new Set([
  "clear_success",
  "partial_success",
  "unexpected_impact"
]);

const pickHijackTickets = (
  templates: TicketTemplate[],
  metrics: MetricsState,
  ceoFocus: CeoFocus,
  rng: ReturnType<typeof createRng>
) => {
  const candidates: Array<{
    source: HijackSource;
    sentiment: number;
    chance: number;
    category: string;
  }> = [];

  if (metrics.sales_sentiment < 25) {
    candidates.push({
      source: "sales",
      sentiment: metrics.sales_sentiment,
      chance: 0.4,
      category: "sales_request"
    });
  }
  if (metrics.cto_sentiment < 25) {
    candidates.push({
      source: "cto",
      sentiment: metrics.cto_sentiment,
      chance: 0.5,
      category: "tech_debt_reduction"
    });
  }
  if (metrics.ceo_sentiment < 30) {
    candidates.push({
      source: "ceo",
      sentiment: metrics.ceo_sentiment,
      chance: 0.2,
      category: focusToCategory(ceoFocus)
    });
  }

  candidates.sort((a, b) => a.sentiment - b.sentiment);
  const selected = candidates.slice(0, 2);

  const forced: TicketInstance[] = [];
  const events: Array<Record<string, string | number>> = [];

  for (const candidate of selected) {
    if (rng.next() > candidate.chance) continue;
    const pool = templates.filter(
      (ticket) => ticket.category === candidate.category
    );
    if (pool.length === 0) continue;
    const picked = rng.pick(pool);
    forced.push({ ...picked, is_mandatory: true });
    events.push({
      type: "roadmap_hijack",
      source: candidate.source,
      category: candidate.category
    });
  }

  return { forced, events };
};

const mergeBacklog = (
  backlog: TicketInstance[],
  forced: TicketInstance[]
) => {
  const map = new Map(backlog.map((ticket) => [ticket.id, ticket]));
  for (const ticket of forced) {
    if (map.has(ticket.id)) {
      map.set(ticket.id, { ...map.get(ticket.id)!, is_mandatory: true });
    } else {
      backlog.unshift(ticket);
      map.set(ticket.id, ticket);
    }
  }
  return backlog;
};

type RetroTemplate = {
  id: string;
  archetype: string;
  conditions?: Record<string, string | boolean>;
  template: string;
  group?: string;
};

type EventPayload = {
  id: string;
  title?: string;
  description?: string;
  group?: string;
  trigger_chance_per_sprint?: number;
  quarter_restriction?: number[] | null;
  trigger_condition?: string;
  trigger_condition_override?: string;
  metric_effects?: Record<string, number>;
  ceo_focus_shift?: string | null;
  forced_ticket_category?: string | null;
  sprint_duration?: number | null;
  new_focus?: string;
  text?: string;
};

const outcomeSummary = (text?: string) => {
  if (!text) return "a mixed outcome";
  const [first] = text.split(".");
  return first?.trim() ? `${first.trim()}.` : text;
};

const chooseRetroTemplate = (
  templates: RetroTemplate[],
  context: {
    successCount: number;
    total: number;
    hasCatastrophe: boolean;
    isOverbooked: boolean;
  }
) => {
  if (templates.length === 0) return null;
  const ratio = context.total === 0 ? 0 : context.successCount / context.total;
  const successCount =
    context.successCount === context.total
      ? "all"
      : context.successCount === 0
      ? "none"
      : ratio >= 0.7
      ? "most"
      : ratio >= 0.4
      ? "some"
      : "few";

  return (
    templates.find((template) => {
      const conditions = template.conditions ?? {};
      if (
        typeof conditions.success_count === "string" &&
        conditions.success_count !== successCount
      ) {
        return false;
      }
      if (
        typeof conditions.has_catastrophe === "boolean" &&
        conditions.has_catastrophe !== context.hasCatastrophe
      ) {
        return false;
      }
      if (
        typeof conditions.is_overbooked === "boolean" &&
        conditions.is_overbooked !== context.isOverbooked
      ) {
        return false;
      }
      return true;
    }) ?? null
  );
};

const parseCondition = (condition: string) => {
  const match = condition
    .trim()
    .match(/^([a-z_]+)\s*(<=|>=|<|>|==|=)\s*(-?\d+(?:\.\d+)?)$/i);
  if (!match) return null;
  const metric = match[1] as keyof MetricsState;
  const op = match[2];
  const value = Number(match[3]);
  if (Number.isNaN(value)) return null;
  return { metric, op, value };
};

const evaluateCondition = (condition: string, metrics: MetricsState) => {
  if (!condition) return false;
  const orParts = condition.split(/\s+OR\s+/i);
  for (const part of orParts) {
    const andParts = part.split(/\s+AND\s+/i);
    let andOk = true;
    for (const segment of andParts) {
      const parsed = parseCondition(segment);
      if (!parsed || typeof metrics[parsed.metric] !== "number") {
        andOk = false;
        break;
      }
      const metricValue = metrics[parsed.metric];
      switch (parsed.op) {
        case "<":
          andOk = metricValue < parsed.value;
          break;
        case "<=":
          andOk = metricValue <= parsed.value;
          break;
        case ">":
          andOk = metricValue > parsed.value;
          break;
        case ">=":
          andOk = metricValue >= parsed.value;
          break;
        case "=":
        case "==":
          andOk = metricValue === parsed.value;
          break;
        default:
          andOk = false;
      }
      if (!andOk) break;
    }
    if (andOk) return true;
  }
  return false;
};

const resolveCeoFocusShift = (
  shift: string | null | undefined,
  metrics: MetricsState,
  rng: ReturnType<typeof createRng>
): CeoFocus | null => {
  if (!shift) return null;
  if (shift === "random") {
    return selectCeoFocus(metrics, rng);
  }
  if (shift === "weakest_growth_metric") {
    if (metrics.self_serve_growth === metrics.enterprise_growth) {
      return rng.next() < 0.5 ? "self_serve" : "enterprise";
    }
    return metrics.self_serve_growth < metrics.enterprise_growth
      ? "self_serve"
      : "enterprise";
  }
  if (shift === "self_serve" || shift === "enterprise" || shift === "tech_debt") {
    return shift;
  }
  return null;
};

const pickCeoShiftNarrative = (
  shifts: EventPayload[],
  focus: CeoFocus,
  rng: ReturnType<typeof createRng>
) => {
  const matching = shifts.filter((shift) => shift.new_focus === focus);
  const anyFocus = shifts.filter((shift) => shift.new_focus === "any");
  const pool = matching.length > 0 ? matching : anyFocus;
  if (pool.length === 0) return null;
  return rng.pick(pool).text ?? null;
};

const eventDuration = (event: EventPayload) => {
  if (typeof event.sprint_duration === "number" && event.sprint_duration > 0) {
    return Math.max(1, Math.round(event.sprint_duration));
  }
  return 1;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return NextResponse.json({ error: "No session cookie." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as CommitPayload | null;
  if (!payload?.ticketIds || !Array.isArray(payload.ticketIds)) {
    return NextResponse.json(
      { error: "ticketIds must be provided." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("active_game_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session?.active_game_id) {
    return NextResponse.json({ error: "No active game." }, { status: 404 });
  }

  const { data: game } = await supabase
    .from("games")
    .select(
      "id, difficulty, current_quarter, current_sprint, metrics_state, rng_seed, events_log"
    )
    .eq("id", session.active_game_id)
    .maybeSingle();

  if (!game) {
    return NextResponse.json({ error: "Game not found." }, { status: 404 });
  }

  const { data: sprint } = await supabase
    .from("sprints")
    .select("id, effective_capacity, backlog")
    .eq("game_id", game.id)
    .eq("quarter", game.current_quarter)
    .eq("number", game.current_sprint)
    .maybeSingle();

  if (!sprint) {
    return NextResponse.json(
      { error: "Sprint not initialized." },
      { status: 404 }
    );
  }

  const currentSprint = Number(game.current_sprint);
  const currentQuarter = Number(game.current_quarter);
  const rng = createRng(game.rng_seed);
  const { data: quarterRow } = await supabase
    .from("quarters")
    .select("id, ceo_focus")
    .eq("game_id", game.id)
    .eq("number", game.current_quarter)
    .maybeSingle();

  let ceoFocus: CeoFocus =
    (quarterRow?.ceo_focus as CeoFocus | undefined) ??
    selectCeoFocus(game.metrics_state as MetricsState, rng);

  if (!quarterRow) {
    await supabase.from("quarters").insert({
      game_id: game.id,
      number: game.current_quarter,
      ceo_focus: ceoFocus
    });
  }

  const backlog = (sprint.backlog ?? []) as TicketTemplate[];
  const backlogMap = new Map(backlog.map((ticket) => [ticket.id, ticket]));
  const selectedTickets: TicketTemplate[] = payload.ticketIds
    .map((id) => backlogMap.get(id))
    .filter((ticket): ticket is TicketTemplate => Boolean(ticket));

  if (selectedTickets.length === 0) {
    return NextResponse.json(
      { error: "No valid tickets selected." },
      { status: 400 }
    );
  }

  const totalEffort = selectedTickets.reduce(
    (sum, ticket) => sum + ticket.effort,
    0
  );
  const effectiveCapacity =
    sprint.effective_capacity ??
    computeEffectiveCapacity(game.metrics_state as MetricsState);
  const maxCapacity = Math.floor(effectiveCapacity * 1.25);

  if (totalEffort > maxCapacity) {
    return NextResponse.json(
      { error: "Selected tickets exceed max capacity." },
      { status: 400 }
    );
  }

  let updatedMetrics = { ...(game.metrics_state as MetricsState) };
  const metricDeltas: Record<string, number> = {};
  const ticketOutcomes: TicketOutcome[] = [];

  const applyMetricDelta = (metric: keyof MetricsState, delta: number) => {
    if (!delta) return;
    updatedMetrics[metric] = clampMetric(updatedMetrics[metric] + delta);
    metricDeltas[metric] = (metricDeltas[metric] ?? 0) + delta;
  };

  const overAmount = Math.max(0, totalEffort - effectiveCapacity);
  const maxOverbook = Math.max(1, Math.floor(effectiveCapacity * 0.25));
  const overbookFraction = overAmount > 0 ? Math.min(overAmount / maxOverbook, 1) : 0;
  const isOverbooked = overAmount > 0;

  const underAmount = Math.max(0, effectiveCapacity - totalEffort);
  const underbookFraction = underAmount > 0 ? Math.min(underAmount / effectiveCapacity, 0.5) : 0;
  const isUnderbooked = underAmount > 0;

  for (const ticket of selectedTickets) {
    const ceoAligned = isCeoAlignedCategory(ceoFocus, ticket.category);
    const outcome = rollOutcome(rng, {
      techDebt: updatedMetrics.tech_debt,
      teamSentiment: updatedMetrics.team_sentiment,
      isOverbooked,
      overbookFraction,
      underbookFraction,
      isMoonshot: ticket.category === "moonshot",
      ceoAligned,
      difficulty: game.difficulty
    });

    const { updated, deltas } = applyOutcome(rng, updatedMetrics, ticket, outcome);
    updatedMetrics = updated;

    for (const [metric, delta] of Object.entries(deltas)) {
      metricDeltas[metric] = (metricDeltas[metric] ?? 0) + delta;
    }

    ticketOutcomes.push({
      ...ticket,
      ceo_aligned: ceoAligned,
      outcome,
      outcome_narrative:
        ticket.outcomes?.[outcome] ?? "Outcome recorded without narrative.",
      metric_impacts: deltas as Record<string, number>
    });
  }

  const total = ticketOutcomes.length;
  const successes = ticketOutcomes.filter((ticket) =>
    ["clear_success", "partial_success", "unexpected_impact"].includes(
      ticket.outcome
    )
  ).length;
  const clearPartialSuccesses = ticketOutcomes.filter((ticket) =>
    ["clear_success", "partial_success"].includes(ticket.outcome)
  ).length;
  const failCount = ticketOutcomes.filter((ticket) =>
    ["soft_failure", "catastrophe"].includes(ticket.outcome)
  ).length;
  const failureRate = total > 0 ? failCount / total : 0;
  const clearPartialRate = total > 0 ? clearPartialSuccesses / total : 0;
  const failures = total - successes;
  const hasCatastrophe = ticketOutcomes.some(
    (ticket) => ticket.outcome === "catastrophe"
  );

  if (isOverbooked) {
    const penalty = Math.min(
      8,
      Math.max(2, Math.round(2 + 6 * overbookFraction * overbookFraction))
    );
    updatedMetrics.team_sentiment = clampMetric(
      updatedMetrics.team_sentiment - penalty
    );
    metricDeltas.team_sentiment = (metricDeltas.team_sentiment ?? 0) - penalty;

    if (failureRate > 0.5) {
      const extraPenalty = Math.min(
        5,
        Math.max(2, Math.round(2 + 3 * overbookFraction))
      );
      updatedMetrics.team_sentiment = clampMetric(
        updatedMetrics.team_sentiment - extraPenalty
      );
      metricDeltas.team_sentiment =
        (metricDeltas.team_sentiment ?? 0) - extraPenalty;
    }
  }

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

  if (clearPartialRate > 0.75) {
    updatedMetrics.team_sentiment = clampMetric(
      updatedMetrics.team_sentiment + 2
    );
    metricDeltas.team_sentiment = (metricDeltas.team_sentiment ?? 0) + 2;
  } else if (clearPartialRate > 0.5) {
    updatedMetrics.team_sentiment = clampMetric(
      updatedMetrics.team_sentiment + 1
    );
    metricDeltas.team_sentiment = (metricDeltas.team_sentiment ?? 0) + 1;
  }

  if (failureRate >= 0.5) {
    // If significantly underbooked, reduce penalties (they planned well, just got unlucky)
    const penaltyScale = isUnderbooked && underbookFraction > 0.1
      ? Math.max(0.5, 1 - underbookFraction)
      : 1.0;

    applyMetricDelta("team_sentiment", Math.round(-4 * penaltyScale));
    applyMetricDelta("ceo_sentiment", Math.round(-3 * penaltyScale));
    applyMetricDelta("sales_sentiment", Math.round(-2 * penaltyScale));
    applyMetricDelta("cto_sentiment", Math.round(-2 * penaltyScale));
  } else if (clearPartialRate >= 0.75 && failureRate < 0.25) {
    applyMetricDelta("team_sentiment", 2);
    applyMetricDelta("ceo_sentiment", 2);
  }

  const totalSelected = selectedTickets.length;
  if (totalSelected > 0) {
    const counts = selectedTickets.reduce<Record<string, number>>((acc, ticket) => {
      acc[ticket.category] = (acc[ticket.category] ?? 0) + 1;
      return acc;
    }, {});
    const growthCount =
      (counts["self_serve_feature"] ?? 0) +
      (counts["enterprise_feature"] ?? 0) +
      (counts["monetization"] ?? 0) +
      (counts["sales_request"] ?? 0) +
      (counts["moonshot"] ?? 0);
    const enterpriseCount =
      (counts["enterprise_feature"] ?? 0) +
      (counts["sales_request"] ?? 0);

    const growthRatio = growthCount / totalSelected;
    const enterpriseRatio = enterpriseCount / totalSelected;

    if (growthRatio > 0.5) {
      applyMetricDelta("tech_debt", 2);
      applyMetricDelta("team_sentiment", -1);
    }
    if (growthRatio > 0.7) {
      applyMetricDelta("tech_debt", 1);
      applyMetricDelta("team_sentiment", -1);
    }

    if (enterpriseRatio > 0.5) {
      applyMetricDelta("self_serve_growth", -3);
    }
    if (enterpriseRatio > 0.7) {
      applyMetricDelta("self_serve_growth", -2);
    }
  }

  const prevSprintRef =
    currentSprint > 1
      ? { quarter: currentQuarter, number: currentSprint - 1 }
      : currentQuarter > 1
      ? { quarter: currentQuarter - 1, number: 3 }
      : null;

  let prevOutcomes: TicketOutcome[] = [];
  if (prevSprintRef) {
    const { data: prevSprint } = await supabase
      .from("sprints")
      .select("retro")
      .eq("game_id", game.id)
      .eq("quarter", prevSprintRef.quarter)
      .eq("number", prevSprintRef.number)
      .maybeSingle();
    prevOutcomes = (prevSprint?.retro?.ticket_outcomes ?? []) as TicketOutcome[];
  }

  const failureOutcomes = new Set(["soft_failure", "catastrophe"]);
  const enterpriseCategories = new Set(["enterprise_feature", "sales_request"]);
  const techDebtCategories = new Set(["tech_debt_reduction", "infrastructure"]);
  const uxOrSelfServeCategories = new Set([
    "ux_improvement",
    "self_serve_feature"
  ]);
  const selfServeCategories = new Set(["self_serve_feature"]);

  const hasShipped = (outcomes: TicketOutcome[], categories: Set<string>) =>
    outcomes.some(
      (outcome) =>
        categories.has(outcome.category) &&
        !failureOutcomes.has(outcome.outcome)
    );

  const hasEnterpriseShipped = hasShipped(ticketOutcomes, enterpriseCategories);
  const prevEnterpriseShipped = hasShipped(prevOutcomes, enterpriseCategories);
  const hasTechDebtShipped = hasShipped(ticketOutcomes, techDebtCategories);
  const prevTechDebtShipped = hasShipped(prevOutcomes, techDebtCategories);
  const hasUxOrSelfServeShipped = hasShipped(
    ticketOutcomes,
    uxOrSelfServeCategories
  );
  const prevUxOrSelfServeShipped = hasShipped(
    prevOutcomes,
    uxOrSelfServeCategories
  );
  const hasSelfServeShipped = hasShipped(ticketOutcomes, selfServeCategories);
  const prevSelfServeShipped = hasShipped(prevOutcomes, selfServeCategories);

  if (!hasEnterpriseShipped && !prevEnterpriseShipped) {
    applyMetricDelta("sales_sentiment", -8);
  }

  const techDebtDrift =
    !hasTechDebtShipped && !prevTechDebtShipped ? 5 : 2;
  applyMetricDelta("tech_debt", techDebtDrift);
  if (updatedMetrics.tech_debt > 75) {
    applyMetricDelta("tech_debt", 1);
  }

  if (hasTechDebtShipped) {
    applyMetricDelta("cto_sentiment", 3);
  } else {
    applyMetricDelta("cto_sentiment", -3);
  }
  if (updatedMetrics.tech_debt > 70) {
    applyMetricDelta("cto_sentiment", -3);
  } else if (updatedMetrics.tech_debt < 35) {
    applyMetricDelta("cto_sentiment", 2);
  }

  // Apply tech debt cap on CTO sentiment
  if (updatedMetrics.tech_debt > 75) {
    updatedMetrics.cto_sentiment = Math.min(updatedMetrics.cto_sentiment, 60);
  } else if (updatedMetrics.tech_debt > 60) {
    updatedMetrics.cto_sentiment = Math.min(updatedMetrics.cto_sentiment, 75);
  }

  if (!hasUxOrSelfServeShipped && !prevUxOrSelfServeShipped) {
    applyMetricDelta("nps", -3);
  }

  if (!hasSelfServeShipped && !prevSelfServeShipped) {
    applyMetricDelta("self_serve_growth", -2);
  }

  const eventsLog = Array.isArray(game.events_log) ? [...game.events_log] : [];
  const { data: eventRows } = await supabase
    .from("event_catalog")
    .select("payload");

  const eventCatalog = (eventRows ?? [])
    .map((row) => row.payload as EventPayload)
    .filter((row) => row && row.id && row.group);

  const randomEvents = eventCatalog.filter(
    (event) => event.group === "random_events"
  );
  const thresholdEvents = eventCatalog.filter(
    (event) => event.group === "threshold_events"
  );
  const ceoShiftNarratives = eventCatalog.filter(
    (event) => event.group === "ceo_focus_shifts"
  );

  const triggeredEvents: Array<{
    title: string;
    description: string;
    metric_effects: Record<string, number>;
  }> = [];

  const applyEventEffects = async (
    event: EventPayload,
    type: "random_event" | "threshold_event"
  ) => {
    triggeredEvents.push({
      title: event.title ?? "Event Triggered",
      description: event.description ?? "",
      metric_effects: event.metric_effects ?? {}
    });
    eventsLog.push({
      type,
      event_id: event.id,
      quarter: currentQuarter,
      sprint: currentSprint
    });

    const effects = event.metric_effects ?? {};
    for (const [metric, delta] of Object.entries(effects)) {
      if (metric === "sprint_capacity") {
        eventsLog.push({
          type: "capacity_modifier",
          event_id: event.id,
          delta,
          remaining_sprints: eventDuration(event),
          quarter: currentQuarter,
          sprint: currentSprint
        });
        continue;
      }
      if (metric in updatedMetrics) {
        applyMetricDelta(metric as keyof MetricsState, delta);
      }
    }

    if (event.forced_ticket_category) {
      eventsLog.push({
        type: "forced_ticket",
        event_id: event.id,
        category: event.forced_ticket_category,
        remaining_sprints: eventDuration(event),
        quarter: currentQuarter,
        sprint: currentSprint
      });
    }

    const shifted = resolveCeoFocusShift(event.ceo_focus_shift, updatedMetrics, rng);
    if (shifted && shifted !== ceoFocus) {
      const previousFocus = ceoFocus;
      ceoFocus = shifted;
      await supabase
        .from("quarters")
        .update({ ceo_focus: shifted })
        .eq("game_id", game.id)
        .eq("number", game.current_quarter);
      eventsLog.push({
        type: "ceo_focus_shift",
        quarter: currentQuarter,
        sprint: currentSprint,
        new_focus: shifted,
        old_focus: previousFocus,
        shift_kind: "event",
        source: "event"
      });
    }
  };

  let firedRandomEvent: EventPayload | null = null;
  for (const event of randomEvents) {
    const quarters = event.quarter_restriction;
    if (Array.isArray(quarters) && !quarters.includes(currentQuarter)) {
      continue;
    }
    if (
      event.trigger_condition_override &&
      !evaluateCondition(event.trigger_condition_override, updatedMetrics)
    ) {
      continue;
    }
    const chance =
      typeof event.trigger_chance_per_sprint === "number"
        ? event.trigger_chance_per_sprint
        : 0;
    if (rng.next() <= chance) {
      firedRandomEvent = event;
      break;
    }
  }

  if (firedRandomEvent) {
    await applyEventEffects(firedRandomEvent, "random_event");
  }

  const firedThresholdIds = new Set(
    eventsLog
      .filter((entry) => entry?.type === "threshold_event")
      .map((entry) => entry?.event_id)
  );
  for (const event of thresholdEvents) {
    if (firedThresholdIds.has(event.id)) continue;
    if (!event.trigger_condition) continue;
    if (!evaluateCondition(event.trigger_condition, updatedMetrics)) continue;
    await applyEventEffects(event, "threshold_event");
    break;
  }

  const { data: narrativeRows } = await supabase
    .from("narrative_templates")
    .select("payload");

  const retroTemplates = (narrativeRows ?? [])
    .map((row) => row.payload as RetroTemplate)
    .filter((row) => row?.group === "sprint_retro_templates");

  const template = chooseRetroTemplate(retroTemplates, {
    successCount: successes,
    total,
    hasCatastrophe,
    isOverbooked
  });

  const bestTicket =
    ticketOutcomes.find((ticket) => ticket.outcome === "clear_success") ??
    ticketOutcomes[0];

  const retro = {
    sprint_number: game.current_sprint,
    ceo_focus: ceoFocus,
    ticket_outcomes: ticketOutcomes,
    metric_deltas: metricDeltas,
    events: triggeredEvents,
    is_overbooked: isOverbooked,
    failure_rate: failureRate,
    narrative:
      template?.template
        ?.replace("{tickets_shipped}", String(successes))
        ?.replace("{tickets_committed}", String(total))
        ?.replace("{best_ticket_title}", bestTicket?.title ?? "a key ticket")
        ?.replace(
          "{best_ticket_outcome_summary}",
          outcomeSummary(bestTicket?.outcome_narrative)
        ) ??
      `Sprint resolved. ${successes} of ${total} tickets landed with some impact. ${failures} slipped or failed.`
  };

  await supabase
    .from("sprints")
    .update({
      committed: ticketOutcomes,
      retro
    })
    .eq("id", sprint.id);

  const { data: templates } = await supabase
    .from("ticket_templates")
    .select("payload");

  const ticketTemplates = (templates ?? [])
    .map((row) => row.payload as TicketTemplate)
    .filter((row) => row && row.id);

  const isQuarterEnd = currentSprint === 3;
  let nextQuarter = game.current_quarter;
  let nextSprintNumber = game.current_sprint;
  let nextCeoFocus = ceoFocus;
  let productPulse: ProductPulse | null = null;
  let quarterlyReview: QuarterlyReview | null = null;
  let yearEndReview: YearEndReview | null = null;
  let ceoFocusShiftNarrative: string | null = null;
  let quarterSummary: {
    quarter: number;
    product_pulse: ProductPulse | null;
    quarterly_review: QuarterlyReview | null;
  } | null = null;

  if (!isQuarterEnd) {
    if (shouldShiftFocus(rng, game.difficulty)) {
      const shifted = selectCeoFocus(updatedMetrics, rng);
      if (shifted !== ceoFocus) {
        const previousFocus = ceoFocus;
        nextCeoFocus = shifted;
        await supabase
          .from("quarters")
          .update({ ceo_focus: shifted })
          .eq("game_id", game.id)
          .eq("number", game.current_quarter);
        eventsLog.push({
          type: "ceo_focus_shift",
          quarter: currentQuarter,
          sprint: currentSprint,
          new_focus: shifted,
          old_focus: previousFocus,
          shift_kind: "mid_sprint"
        });
      }
    }
    nextSprintNumber = currentSprint + 1;
  } else {
    const { data: quarterSprints } = await supabase
      .from("sprints")
      .select("number, retro")
      .eq("game_id", game.id)
      .eq("quarter", currentQuarter);

    let catastropheCount = 0;
    let hasUxSuccess = false;
    let alignedTickets = 0;
    let totalTickets = 0;
    let lowTeamSprints = 0;
    const orderedSprints = [...(quarterSprints ?? [])].sort(
      (a, b) => Number(a?.number ?? 0) - Number(b?.number ?? 0)
    );
    for (const row of quarterSprints ?? []) {
      const outcomes = row?.retro?.ticket_outcomes ?? [];
      const sprintFocus = row?.retro?.ceo_focus ?? ceoFocus;
      for (const outcome of outcomes) {
        if (outcome?.outcome === "catastrophe") catastropheCount += 1;
        if (
          outcome?.category === "ux_improvement" &&
          successOutcomes.has(outcome?.outcome)
        ) {
          hasUxSuccess = true;
        }
        totalTickets += 1;
        const aligned =
          typeof outcome?.ceo_aligned === "boolean"
            ? outcome.ceo_aligned
            : outcome?.category
            ? outcome.category === focusToCategory(sprintFocus)
            : false;
        if (aligned) alignedTickets += 1;
      }
    }

    let teamAtEnd = updatedMetrics.team_sentiment;
    const reversed = [...orderedSprints].sort(
      (a, b) => Number(b?.number ?? 0) - Number(a?.number ?? 0)
    );
    for (const row of reversed) {
      if (teamAtEnd < 30) lowTeamSprints += 1;
      const delta = row?.retro?.metric_deltas?.team_sentiment;
      if (typeof delta === "number") {
        teamAtEnd -= delta;
      }
    }

    const alignmentRatio = totalTickets > 0 ? alignedTickets / totalTickets : 0;

    productPulse = deriveProductPulse(
      updatedMetrics,
      catastropheCount > 0,
      hasUxSuccess
    );
    quarterlyReview = computeQuarterlyReview(
      currentQuarter,
      updatedMetrics,
      productPulse,
      catastropheCount,
      { lowTeamSprints, alignmentRatio }
    );
    quarterSummary = {
      quarter: currentQuarter,
      product_pulse: productPulse,
      quarterly_review: quarterlyReview
    };

    await supabase
      .from("quarters")
      .update({
        product_pulse: productPulse,
        quarterly_review: quarterlyReview,
        ceo_focus: ceoFocus
      })
      .eq("game_id", game.id)
      .eq("number", currentQuarter);

    if (currentQuarter < 4) {
      nextQuarter = currentQuarter + 1;
      nextSprintNumber = 1;
      nextCeoFocus = selectCeoFocus(updatedMetrics, rng);
      for (let attempt = 0; attempt < 3 && nextCeoFocus === ceoFocus; attempt += 1) {
        nextCeoFocus = selectCeoFocus(updatedMetrics, rng);
      }
      ceoFocusShiftNarrative = pickCeoShiftNarrative(
        ceoShiftNarratives,
        nextCeoFocus,
        rng
      );

      const { data: nextQuarterRow } = await supabase
        .from("quarters")
        .select("id")
        .eq("game_id", game.id)
        .eq("number", nextQuarter)
        .maybeSingle();

      if (!nextQuarterRow) {
        await supabase.from("quarters").insert({
          game_id: game.id,
          number: nextQuarter,
          ceo_focus: nextCeoFocus
        });
      }
      eventsLog.push({
        type: "ceo_focus_shift",
        quarter: nextQuarter,
        sprint: 1,
        new_focus: nextCeoFocus,
        old_focus: ceoFocus,
        shift_kind: "quarter",
        narrative: ceoFocusShiftNarrative
      });
    } else {
      const { data: quarterRows } = await supabase
        .from("quarters")
        .select("number, quarterly_review")
        .eq("game_id", game.id)
        .order("number", { ascending: true });

      const scores: number[] = [];
      for (const row of quarterRows ?? []) {
        const score = row?.quarterly_review?.raw_score;
        if (typeof score === "number") {
          scores.push(score);
        }
      }
      if (scores.length < 4) {
        scores.push(quarterlyReview.raw_score);
      }

      yearEndReview = computeYearEndReview(game.difficulty, scores, rng);

      await supabase.from("year_end_review").upsert({
        game_id: game.id,
        review: yearEndReview
      });

      const { data: sessionRow } = await supabase
        .from("sessions")
        .select("completed_games")
        .eq("id", sessionId)
        .maybeSingle();

      const completed = Array.isArray(sessionRow?.completed_games)
        ? [...sessionRow.completed_games]
        : [];
      completed.push({
        game_id: game.id,
        difficulty: game.difficulty,
        final_rating: yearEndReview.final_rating,
        completed_at: new Date().toISOString()
      });

      await supabase
        .from("sessions")
        .update({
          active_game_id: null,
          completed_games: completed,
          last_active: new Date().toISOString()
        })
        .eq("id", sessionId);
    }
  }

  let nextSprint = null;
  const canGenerateNext =
    ticketTemplates.length > 0 &&
    (!isQuarterEnd || currentQuarter < 4);

  if (canGenerateNext) {
    const { data: existing } = await supabase
      .from("sprints")
      .select("id, effective_capacity, backlog")
      .eq("game_id", game.id)
      .eq("quarter", nextQuarter)
      .eq("number", nextSprintNumber)
      .maybeSingle();

    if (existing) {
      nextSprint = existing;
    } else {
      let backlog = generateBacklog(
        ticketTemplates,
        updatedMetrics,
        rng,
        rng.int(7, 10)
      );
      const forcedTicketEntries = eventsLog.filter(
        (entry) =>
          entry?.type === "forced_ticket" &&
          typeof entry?.category === "string" &&
          (entry?.remaining_sprints ?? 0) > 0
      );
      const forcedTickets: TicketInstance[] = [];
      for (const entry of forcedTicketEntries) {
        const pool = ticketTemplates.filter(
          (ticket) => ticket.category === entry.category
        );
        if (pool.length > 0) {
          forcedTickets.push({
            ...rng.pick(pool),
            is_mandatory: true
          });
        }
        entry.remaining_sprints =
          typeof entry.remaining_sprints === "number"
            ? Math.max(0, entry.remaining_sprints - 1)
            : 0;
      }
      const hijacks = pickHijackTickets(
        ticketTemplates,
        updatedMetrics,
        nextCeoFocus,
        rng
      );
      if (hijacks.events.length) {
        eventsLog.push(
          ...hijacks.events.map((event) => ({
            ...event,
            quarter: nextQuarter,
            sprint: nextSprintNumber
          }))
        );
      }
      backlog = mergeBacklog(backlog, hijacks.forced);
      backlog = mergeBacklog(backlog, forcedTickets);

      const capacityModifiers = eventsLog.filter(
        (entry) =>
          entry?.type === "capacity_modifier" &&
          typeof entry?.delta === "number" &&
          (entry?.remaining_sprints ?? 0) > 0
      );
      let capacityDelta = 0;
      for (const entry of capacityModifiers) {
        capacityDelta += entry.delta;
        entry.remaining_sprints =
          typeof entry.remaining_sprints === "number"
            ? Math.max(0, entry.remaining_sprints - 1)
            : 0;
      }

      const rawCapacity =
        computeEffectiveCapacity(updatedMetrics) + capacityDelta;
      const nextCapacity = Math.max(5, rawCapacity);

      // Death spiral check: if capacity is critically low, fire the PM immediately
      if (rawCapacity <= 5) {
        // Create a "you're fired" quarterly review
        const deathSpiralReview: QuarterlyReview = {
          quarter: currentQuarter,
          raw_score: 0,
          rating: "below_expectations",
          calibration_outcome: "terminated",
          narrative: "Team capacity has collapsed to unsustainable levels. With morale at rock bottom, tech debt out of control, and the team unable to deliver even basic work, the organization has lost confidence in leadership. This is a failure of planning, execution, and stakeholder management. Your tenure as PM has ended.",
          factors: {
            capacity_collapse: rawCapacity,
            team_sentiment: updatedMetrics.team_sentiment,
            tech_debt: updatedMetrics.tech_debt,
            ceo_sentiment: updatedMetrics.ceo_sentiment,
            death_spiral: true
          }
        };

        // Save the death spiral review to the current quarter
        await supabase
          .from("quarters")
          .update({
            quarterly_review: deathSpiralReview
          })
          .eq("game_id", game.id)
          .eq("number", currentQuarter);

        // Mark game as completed (fired)
        await supabase
          .from("games")
          .update({
            metrics_state: updatedMetrics,
            state: "completed",
            updated_at: new Date().toISOString()
          })
          .eq("id", game.id);

        // Return with special "fired" indicator
        return NextResponse.json({
          game: {
            id: game.id,
            difficulty: game.difficulty,
            current_quarter: currentQuarter,
            current_sprint: currentSprint,
            metrics_state: updatedMetrics
          },
          sprint: null,
          retro,
          quarter: {
            ceo_focus: ceoFocus,
            product_pulse: null,
            quarterly_review: deathSpiralReview
          },
          death_spiral: true,
          capacity_collapse: rawCapacity,
          ceo_focus_shift: null,
          quarter_summary: {
            quarter: currentQuarter,
            product_pulse: null,
            quarterly_review: deathSpiralReview
          },
          year_end_review: null
        });
      }

      const { data: inserted } = await supabase
        .from("sprints")
        .insert({
          game_id: game.id,
          quarter: nextQuarter,
          number: nextSprintNumber,
          effective_capacity: nextCapacity,
          backlog,
          committed: []
        })
        .select("id, effective_capacity, backlog")
        .single();
      nextSprint = inserted ?? null;
    }
  }

  const { data: updatedGame, error: updateError } = await supabase
    .from("games")
    .update({
      metrics_state: updatedMetrics,
      current_quarter: nextQuarter,
      current_sprint: nextSprintNumber,
      events_log: eventsLog,
      rng_seed: rng.state(),
      updated_at: new Date().toISOString(),
      state: currentQuarter >= 4 && isQuarterEnd ? "completed" : "in_progress"
    })
    .eq("id", game.id)
    .select("current_quarter, current_sprint, metrics_state, difficulty, id")
    .single();

  if (updateError || !updatedGame) {
    console.error("Failed to advance game state", updateError);
    return NextResponse.json(
      {
        error: "Failed to advance game state.",
        details: updateError?.message ?? "Unknown error"
      },
      { status: 500 }
    );
  }

  const ceoFocusShift =
    ceoFocusShiftNarrative
      ? {
          narrative: ceoFocusShiftNarrative,
          from: ceoFocus,
          to: nextCeoFocus,
          kind: "quarter"
        }
      : null;

  return NextResponse.json({
    game: {
      id: updatedGame.id,
      difficulty: updatedGame.difficulty,
      current_quarter: updatedGame.current_quarter,
      current_sprint: updatedGame.current_sprint,
      metrics_state: updatedGame.metrics_state
    },
    sprint: nextSprint,
    retro,
    quarter: {
      ceo_focus: nextCeoFocus,
      product_pulse: productPulse,
      quarterly_review: quarterlyReview
    },
    ceo_focus_shift: ceoFocusShift,
    quarter_summary: quarterSummary,
    year_end_review: yearEndReview
  });
}
