"use client";

import { useEffect, useState } from "react";
import type { MetricsState } from "@/lib/types";

type SessionState = {
  sessionId: string;
  activeGameId: string | null;
  activeGame?: {
    id: string;
    difficulty: "easy" | "normal" | "hard";
    current_quarter: number;
    current_sprint: number;
    metrics_state?: MetricsState;
  } | null;
};

type LoadState = "idle" | "loading" | "ready" | "error";

type Ticket = {
  id: string;
  title: string;
  description: string;
  category: string;
  effort: number;
  is_mandatory?: boolean;
};

type SprintState = {
  id?: string;
  effective_capacity: number;
  backlog: Ticket[];
  committed?: Ticket[];
  retro?: {
    narrative: string;
    ticket_outcomes: Array<{ id: string; outcome: string; outcome_narrative: string }>;
  };
};

type QuarterState = {
  ceo_focus?: string;
  product_pulse?: {
    churn: string;
    support_load: string;
    customer_sentiment: string;
    narrative: string;
  } | null;
  quarterly_review?: {
    rating: string;
    raw_score: number;
    narrative: string;
  } | null;
};

type QuarterSummary = {
  quarter: number;
  product_pulse: {
    churn: string;
    support_load: string;
    customer_sentiment: string;
    narrative: string;
  } | null;
  quarterly_review: {
    rating: string;
    raw_score: number;
    narrative: string;
  } | null;
} | null;

export default function Home() {
  const [state, setState] = useState<SessionState | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [difficulty, setDifficulty] = useState<
    "easy" | "normal" | "hard"
  >("normal");
  const [message, setMessage] = useState<string | null>(null);
  const [sprint, setSprint] = useState<SprintState | null>(null);
  const [metrics, setMetrics] = useState<MetricsState | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [retro, setRetro] = useState<SprintState["retro"] | null>(null);
  const [quarter, setQuarter] = useState<QuarterState | null>(null);
  const [quarterSummary, setQuarterSummary] = useState<QuarterSummary>(null);
  const [gameMeta, setGameMeta] = useState<{
    difficulty: "easy" | "normal" | "hard";
    current_quarter: number;
    current_sprint: number;
  } | null>(null);

  const loadSprint = async () => {
    try {
      const res = await fetch("/api/sprint/active");
      if (!res.ok) {
        setSprint(null);
        setMetrics(null);
        return;
      }
      const data = await res.json();
      setSprint(data.sprint);
      setMetrics(data.game.metrics_state);
      setQuarter(data.quarter ?? null);
      setGameMeta({
        difficulty: data.game.difficulty,
        current_quarter: data.game.current_quarter,
        current_sprint: data.game.current_sprint
      });
    } catch {
      setSprint(null);
      setMetrics(null);
      setQuarter(null);
      setGameMeta(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoadState("loading");
      setMessage(null);
      try {
        const res = await fetch("/api/session/init", { method: "POST" });
        const data = (await res.json()) as SessionState;
        setState(data);
        await loadSprint();
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
      const data = (await res.json()) as SessionState & {
        activeSprint?: SprintState;
        ceoFocus?: string;
      };
      setState(data);
      if (data.activeSprint) {
        setSprint(data.activeSprint);
      }
      setQuarterSummary(null);
      if (data.activeGame) {
        setGameMeta({
          difficulty: data.activeGame.difficulty,
          current_quarter: data.activeGame.current_quarter,
          current_sprint: data.activeGame.current_sprint
        });
      }
      await loadSprint();
      setLoadState("ready");
    } catch (err) {
      setLoadState("error");
      setMessage("Failed to start a new game.");
    }
  };

  const commitSprint = async () => {
    setLoadState("loading");
    setMessage(null);
    try {
      const ticketIds = Object.keys(selected).filter((id) => selected[id]);
      const res = await fetch("/api/sprint/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketIds })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error ?? "Failed to commit sprint.");
        setLoadState("error");
        return;
      }
      setRetro(data.retro);
      setMetrics(data.game.metrics_state);
      setQuarter(data.quarter ?? null);
      setQuarterSummary(data.quarter_summary ?? null);
      setGameMeta({
        difficulty: data.game.difficulty,
        current_quarter: data.game.current_quarter,
        current_sprint: data.game.current_sprint
      });
      setSelected({});
      await loadSprint();
      setLoadState("ready");
    } catch (err) {
      setLoadState("error");
      setMessage("Failed to commit sprint.");
    }
  };

  const activeLabel = state?.activeGameId
    ? `Active game: ${state.activeGameId.slice(0, 8)}…`
    : "No active game";

  const selectedEffort =
    sprint?.backlog
      ?.filter((ticket) => selected[ticket.id])
      .reduce((sum, ticket) => sum + ticket.effort, 0) ?? 0;
  const capacity = sprint?.effective_capacity ?? 0;
  const maxCapacity = Math.floor(capacity * 1.25);

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
          {(gameMeta ?? state?.activeGame) && (
            <span className="badge">
              Q{(gameMeta ?? state?.activeGame)?.current_quarter} · Sprint{" "}
              {(gameMeta ?? state?.activeGame)?.current_sprint}
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
          {state?.activeGameId && sprint?.backlog?.length ? (
            <button
              onClick={commitSprint}
              disabled={loadState === "loading" || selectedEffort === 0}
            >
              Commit Sprint
            </button>
          ) : null}
        </div>
        {message && <p>{message}</p>}
        {loadState === "loading" && <p>Loading…</p>}

        {metrics && (
          <div className="list">
            <div className="item">
              <h3>Metrics Snapshot</h3>
              <div className="row">
                <span className="badge">Team {metrics.team_sentiment}</span>
                <span className="badge">CEO {metrics.ceo_sentiment}</span>
                <span className="badge">Sales {metrics.sales_sentiment}</span>
                <span className="badge">CTO {metrics.cto_sentiment}</span>
                <span className="badge">Self-Serve {metrics.self_serve_growth}</span>
                <span className="badge">Enterprise {metrics.enterprise_growth}</span>
                <span className="badge">Tech Debt {metrics.tech_debt}</span>
              </div>
            </div>
          </div>
        )}

        {quarterSummary && (
          <div className="item">
            <h3>Quarter {quarterSummary.quarter} Summary</h3>
            {quarterSummary.product_pulse && (
              <p className="retro">{quarterSummary.product_pulse.narrative}</p>
            )}
            {quarterSummary.quarterly_review && (
              <p className="retro">{quarterSummary.quarterly_review.narrative}</p>
            )}
            <div className="row" style={{ marginTop: 12 }}>
              <button onClick={() => setQuarterSummary(null)}>
                Continue to Q{gameMeta?.current_quarter ?? quarterSummary.quarter + 1} · Sprint{" "}
                {gameMeta?.current_sprint ?? 1}
              </button>
            </div>
          </div>
        )}

        {!quarterSummary && sprint?.backlog?.length ? (
          <div>
            <div className="row">
              <span className="badge">Capacity {capacity}</span>
              <span className="badge">
                Selected {selectedEffort}/{capacity} (max {maxCapacity})
              </span>
          {quarter?.ceo_focus && (
            <span className="badge">CEO focus: {quarter.ceo_focus}</span>
          )}
        </div>
        <div className="list">
          {sprint.backlog.map((ticket) => (
            <label key={ticket.id} className="item">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <h3>{ticket.title}</h3>
                  <p>{ticket.description}</p>
                </div>
                <div className="row">
                  <span className="badge">{ticket.category}</span>
                  <span className="badge">{ticket.effort} pts</span>
                  {ticket.is_mandatory && <span className="badge">Mandatory</span>}
                  <input
                    type="checkbox"
                    checked={Boolean(selected[ticket.id])}
                    onChange={(event) =>
                      setSelected((prev) => ({
                            ...prev,
                            [ticket.id]: event.target.checked
                          }))
                        }
                      />
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {retro && (
          <div className="item">
            <h3>Retro</h3>
            <p className="retro">{retro.narrative}</p>
          </div>
        )}
      </div>
    </main>
  );
}
