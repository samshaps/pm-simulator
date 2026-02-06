"use client";

import { useEffect, useState } from "react";

type SessionState = {
  sessionId: string;
  activeGameId: string | null;
  activeGame?: {
    id: string;
    difficulty: "easy" | "normal" | "hard";
    current_quarter: number;
    current_sprint: number;
  } | null;
};

type LoadState = "idle" | "loading" | "ready" | "error";

export default function Home() {
  const [state, setState] = useState<SessionState | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [difficulty, setDifficulty] = useState<
    "easy" | "normal" | "hard"
  >("normal");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoadState("loading");
      setMessage(null);
      try {
        const res = await fetch("/api/session/init", { method: "POST" });
        const data = (await res.json()) as SessionState;
        setState(data);
        setLoadState("ready");
      } catch (err) {
        setLoadState("error");
        setMessage("Unable to initialize session. Check Supabase setup.");
      }
    };

    void init();
  }, []);

  const startNewGame = async () => {
    setLoadState("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/game/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty })
      });
      const data = (await res.json()) as SessionState;
      setState(data);
      setLoadState("ready");
    } catch (err) {
      setLoadState("error");
      setMessage("Failed to start a new game.");
    }
  };

  const activeLabel = state?.activeGameId
    ? `Active game: ${state.activeGameId.slice(0, 8)}…`
    : "No active game";

  return (
    <main>
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h1>PM Simulator</h1>
          <span className="badge">M1 scaffold</span>
        </div>
        <p>
          You are a PM. The year is long. The outcomes are irrational. The review
          is inevitable.
        </p>
        <div className="row" style={{ marginBottom: 16 }}>
          <span className="badge">{activeLabel}</span>
          {state?.activeGame && (
            <span className="badge">
              Q{state.activeGame.current_quarter} · Sprint {state.activeGame.current_sprint}
            </span>
          )}
        </div>
        <div className="row" style={{ marginBottom: 16 }}>
          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value as "easy" | "normal" | "hard")
            }
          >
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="row" style={{ marginBottom: 12 }}>
          <button onClick={startNewGame} disabled={loadState === "loading"}>
            Start New Game
          </button>
        </div>
        {message && <p>{message}</p>}
        {loadState === "loading" && <p>Loading…</p>}
      </div>
    </main>
  );
}
