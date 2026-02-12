import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return NextResponse.json({ error: "No session cookie." }, { status: 401 });
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
    .select("id, difficulty, current_quarter, current_sprint, metrics_state, events_log")
    .eq("id", session.active_game_id)
    .maybeSingle();

  if (!game) {
    return NextResponse.json({ error: "Game not found." }, { status: 404 });
  }

  const { data: sprint } = await supabase
    .from("sprints")
    .select("id, effective_capacity, backlog, committed, retro")
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

  const { data: quarter } = await supabase
    .from("quarters")
    .select("ceo_focus, product_pulse, quarterly_review")
    .eq("game_id", game.id)
    .eq("number", game.current_quarter)
    .maybeSingle();

  const eventsLog = Array.isArray(game.events_log) ? game.events_log : [];
  const ceoShiftEvent = [...eventsLog].reverse().find(
    (entry) =>
      entry?.type === "ceo_focus_shift" &&
      entry?.quarter === game.current_quarter &&
      (entry?.shift_kind === "quarter" || entry?.source === "quarterly_pivot") &&
      (entry?.sprint === 1 || entry?.sprint === 0 || entry?.sprint == null)
  );
  const ceoFocusShift = ceoShiftEvent
    ? {
        narrative:
          typeof ceoShiftEvent?.narrative === "string"
            ? ceoShiftEvent.narrative
            : null,
        from: typeof ceoShiftEvent?.old_focus === "string" ? ceoShiftEvent.old_focus : null,
        to: typeof ceoShiftEvent?.new_focus === "string" ? ceoShiftEvent.new_focus : null,
        kind: ceoShiftEvent?.shift_kind ?? null
      }
    : null;

  // Extract active capacity modifiers
  const capacityModifiers = eventsLog.filter(
    (entry) =>
      entry?.type === "capacity_modifier" &&
      typeof entry?.delta === "number" &&
      (entry?.remaining_sprints ?? 0) > 0
  );

  const totalCapacityDelta = capacityModifiers.reduce(
    (sum, entry) => sum + (entry.delta ?? 0),
    0
  );

  const modifierEventIds = capacityModifiers
    .map((entry) => entry.event_id)
    .filter(Boolean);
  let eventDetails: Record<string, { title?: string; description?: string }> = {};

  if (modifierEventIds.length > 0) {
    const { data: events } = await supabase
      .from("event_catalog")
      .select("id, payload")
      .in("id", modifierEventIds);

    if (events) {
      for (const event of events) {
        const eventId = event.id ?? event.payload?.id;
        if (!eventId) continue;
        eventDetails[eventId] = {
          title: event.payload?.title,
          description: event.payload?.description
        };
      }
    }
  }

  const quarterData = quarter
    ? {
        ...quarter,
        ceo_focus_shift_narrative:
          typeof ceoShiftEvent?.narrative === "string"
            ? ceoShiftEvent.narrative
            : null
      }
    : null;

  return NextResponse.json({
    game,
    sprint,
    quarter: quarterData,
    ceo_focus_shift: ceoFocusShift,
    capacity_modifiers: capacityModifiers.map((entry) => ({
      event_id: entry.event_id,
      delta: entry.delta,
      remaining_sprints: entry.remaining_sprints,
      title: entry.event_id ? eventDetails[entry.event_id]?.title : undefined,
      description: entry.event_id
        ? eventDetails[entry.event_id]?.description
        : undefined
    })),
    total_capacity_delta: totalCapacityDelta
  });
}
