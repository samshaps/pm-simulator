import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_MAX_AGE, SESSION_COOKIE_NAME } from "@/lib/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
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

  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();

  const { data: session, error } = await supabase
    .from("sessions")
    .upsert(
      {
        id: sessionId,
        last_active: now
      },
      { onConflict: "id" }
    )
    .select("id, active_game_id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to initialize session." },
      { status: 500 }
    );
  }

  let activeGame = null;
  if (session?.active_game_id) {
    const { data: game } = await supabase
      .from("games")
      .select("id, difficulty, current_quarter, current_sprint")
      .eq("id", session.active_game_id)
      .maybeSingle();
    activeGame = game ?? null;
  }

  return NextResponse.json({
    sessionId,
    activeGameId: session?.active_game_id ?? null,
    activeGame
  });
}
