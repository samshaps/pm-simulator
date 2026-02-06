import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  applyOutcome,
  computeEffectiveCapacity,
  createRng,
  generateBacklog,
  rollOutcome,
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
      "id, difficulty, current_quarter, current_sprint, metrics_state, rng_seed"
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

  const rng = createRng(game.rng_seed);
  let updatedMetrics = { ...(game.metrics_state as MetricsState) };
  const metricDeltas: Record<string, number> = {};
  const ticketOutcomes: TicketOutcome[] = [];
  let hasFailure = false;

  const isOverbooked = totalEffort > effectiveCapacity;

  for (const ticket of selectedTickets) {
    const outcome = rollOutcome(rng, {
      techDebt: updatedMetrics.tech_debt,
      teamSentiment: updatedMetrics.team_sentiment,
      isOverbooked,
      isMoonshot: ticket.category === "moonshot",
      ceoAligned: false,
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

  const nextSprintNumber =
    game.current_sprint < 3 ? game.current_sprint + 1 : game.current_sprint;

  const { data: templates } = await supabase
    .from("ticket_templates")
    .select("payload");

  const ticketTemplates = (templates ?? [])
    .map((row) => row.payload as TicketTemplate)
    .filter((row) => row && row.id);

  let nextSprint = null;
  if (game.current_sprint < 3 && ticketTemplates.length > 0) {
    const { data: existing } = await supabase
      .from("sprints")
      .select("id, effective_capacity, backlog")
      .eq("game_id", game.id)
      .eq("quarter", game.current_quarter)
      .eq("number", nextSprintNumber)
      .maybeSingle();

    if (existing) {
      nextSprint = existing;
    } else {
      const backlog = generateBacklog(
        ticketTemplates,
        updatedMetrics,
        rng,
        rng.int(7, 10)
      );
      const nextCapacity = computeEffectiveCapacity(updatedMetrics);
      const { data: inserted } = await supabase
        .from("sprints")
        .insert({
          game_id: game.id,
          quarter: game.current_quarter,
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

  await supabase
    .from("games")
    .update({
      metrics_state: updatedMetrics,
      current_sprint: nextSprintNumber,
      rng_seed: rng.state(),
      updated_at: new Date().toISOString()
    })
    .eq("id", game.id);

  return NextResponse.json({
    game: {
      id: game.id,
      difficulty: game.difficulty,
      current_quarter: game.current_quarter,
      current_sprint: nextSprintNumber,
      metrics_state: updatedMetrics
    },
    sprint: nextSprint,
    retro
  });
}
