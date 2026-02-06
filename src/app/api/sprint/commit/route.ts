import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  applyOutcome,
  computeEffectiveCapacity,
  createRng,
  generateBacklog,
  selectCeoFocus,
  focusToCategory,
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
  let hasFailure = false;

  const isOverbooked = totalEffort > effectiveCapacity;

  for (const ticket of selectedTickets) {
    const ceoAligned = ticket.category === focusToCategory(ceoFocus);
    const outcome = rollOutcome(rng, {
      techDebt: updatedMetrics.tech_debt,
      teamSentiment: updatedMetrics.team_sentiment,
      isOverbooked,
      isMoonshot: ticket.category === "moonshot",
      ceoAligned,
      difficulty: game.difficulty
    });

    const { updated, deltas } = applyOutcome(rng, updatedMetrics, ticket, outcome);
    updatedMetrics = updated;

    if (outcome === "soft_failure" || outcome === "catastrophe") {
      hasFailure = true;
    }

    for (const [metric, delta] of Object.entries(deltas)) {
      metricDeltas[metric] = (metricDeltas[metric] ?? 0) + delta;
    }

    ticketOutcomes.push({
      ...ticket,
      outcome,
      outcome_narrative:
        ticket.outcomes?.[outcome] ?? "Outcome recorded without narrative.",
      metric_impacts: deltas as Record<string, number>
    });
  }

  if (isOverbooked) {
    updatedMetrics.team_sentiment = clampMetric(
      updatedMetrics.team_sentiment - 5
    );
    metricDeltas.team_sentiment = (metricDeltas.team_sentiment ?? 0) - 5;

    if (hasFailure) {
      updatedMetrics.team_sentiment = clampMetric(
        updatedMetrics.team_sentiment - 5
      );
      metricDeltas.team_sentiment = (metricDeltas.team_sentiment ?? 0) - 5;
    }
  }

  const total = ticketOutcomes.length;
  const successes = ticketOutcomes.filter((ticket) =>
    ["clear_success", "partial_success", "unexpected_impact"].includes(
      ticket.outcome
    )
  ).length;
  const failures = total - successes;

  const retro = {
    sprint_number: game.current_sprint,
    ticket_outcomes: ticketOutcomes,
    metric_deltas: metricDeltas,
    narrative: `Sprint resolved. ${successes} of ${total} tickets landed with some impact. ${failures} slipped or failed.`
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

  const eventsLog = Array.isArray(game.events_log) ? [...game.events_log] : [];
  const isQuarterEnd = currentSprint === 3;
  let nextQuarter = game.current_quarter;
  let nextSprintNumber = game.current_sprint;
  let nextCeoFocus = ceoFocus;
  let productPulse: ProductPulse | null = null;
  let quarterlyReview: QuarterlyReview | null = null;
  let yearEndReview: YearEndReview | null = null;
  let quarterSummary: {
    quarter: number;
    product_pulse: ProductPulse | null;
    quarterly_review: QuarterlyReview | null;
  } | null = null;

  if (!isQuarterEnd) {
    if (shouldShiftFocus(rng, game.difficulty)) {
      const shifted = selectCeoFocus(updatedMetrics, rng);
      if (shifted !== ceoFocus) {
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
          new_focus: shifted
        });
      }
    }
    nextSprintNumber = currentSprint + 1;
  } else {
    const { data: quarterSprints } = await supabase
      .from("sprints")
      .select("retro")
      .eq("game_id", game.id)
      .eq("quarter", currentQuarter);

    let catastropheCount = 0;
    let hasUxSuccess = false;
    for (const row of quarterSprints ?? []) {
      const outcomes = row?.retro?.ticket_outcomes ?? [];
      for (const outcome of outcomes) {
        if (outcome?.outcome === "catastrophe") catastropheCount += 1;
        if (
          outcome?.category === "ux_improvement" &&
          successOutcomes.has(outcome?.outcome)
        ) {
          hasUxSuccess = true;
        }
      }
    }

    productPulse = deriveProductPulse(
      updatedMetrics,
      catastropheCount > 0,
      hasUxSuccess
    );
    quarterlyReview = computeQuarterlyReview(
      currentQuarter,
      updatedMetrics,
      productPulse,
      catastropheCount
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
      const nextCapacity = computeEffectiveCapacity(updatedMetrics);
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
    quarter_summary: quarterSummary,
    year_end_review: yearEndReview
  });
}
