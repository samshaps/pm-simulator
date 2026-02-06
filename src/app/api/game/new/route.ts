import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createNewGameRecord } from "@/lib/game/initial";
import {
  computeEffectiveCapacity,
  createRng,
  generateBacklog,
  type TicketTemplate
} from "@/lib/game/simulate";
import { SESSION_COOKIE_MAX_AGE, SESSION_COOKIE_NAME } from "@/lib/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Difficulty } from "@/lib/types";

const ALLOWED_DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard"];

export async function POST(request: Request) {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: "/"
    });
  }

  const payload = await request.json().catch(() => ({}));
  const difficulty = ALLOWED_DIFFICULTIES.includes(payload?.difficulty)
    ? payload.difficulty
    : "normal";

  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();
  const newGameRecord = createNewGameRecord(sessionId, difficulty);

  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert(newGameRecord)
    .select("id, difficulty, current_quarter, current_sprint")
    .single();

  if (gameError || !game) {
    return NextResponse.json(
      { error: "Failed to create game." },
      { status: 500 }
    );
  }

  const { error: sessionError } = await supabase
    .from("sessions")
    .upsert(
      {
        id: sessionId,
        active_game_id: game.id,
        last_active: now
      },
      { onConflict: "id" }
    )
    .select("id")
    .single();

  if (sessionError) {
    return NextResponse.json(
      { error: "Failed to attach game to session." },
      { status: 500 }
    );
  }

  const { data: templates } = await supabase
    .from("ticket_templates")
    .select("payload");

  const ticketTemplates = (templates ?? [])
    .map((row) => row.payload as TicketTemplate)
    .filter((row) => row && row.id);

  const rng = createRng(newGameRecord.rng_seed);
  const backlog = generateBacklog(ticketTemplates, newGameRecord.metrics_state, rng, rng.int(7, 10));
  const effectiveCapacity = computeEffectiveCapacity(newGameRecord.metrics_state);

  if (backlog.length > 0) {
    await supabase.from("sprints").insert({
      game_id: game.id,
      quarter: newGameRecord.current_quarter,
      number: newGameRecord.current_sprint,
      effective_capacity: effectiveCapacity,
      backlog,
      committed: []
    });
  }
  await supabase
    .from("games")
    .update({ rng_seed: rng.state() })
    .eq("id", game.id);

  return NextResponse.json({
    sessionId,
    activeGameId: game.id,
    activeGame: game,
    activeSprint: {
      quarter: newGameRecord.current_quarter,
      number: newGameRecord.current_sprint,
      effective_capacity: effectiveCapacity,
      backlog
    }
  });
}
