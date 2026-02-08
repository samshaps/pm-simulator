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
      entry?.shift_kind === "quarter" &&
      entry?.quarter === game.current_quarter &&
      entry?.sprint === 1
  );
  const ceoFocusShiftNarrative =
    typeof ceoShiftEvent?.narrative === "string" ? ceoShiftEvent.narrative : null;

  return NextResponse.json({
    game,
    sprint,
    quarter: quarter ?? null,
    ceo_focus_shift_narrative: ceoFocusShiftNarrative
  });
}
