import type { Difficulty, GameRecord, MetricsState } from "@/lib/types";

const BASE_METRICS: Record<Difficulty, MetricsState> = {
  easy: {
    team_sentiment: 70,
    ceo_sentiment: 60,
    sales_sentiment: 60,
    cto_sentiment: 60,
    self_serve_growth: 50,
    enterprise_growth: 50,
    tech_debt: 25,
    nps: 60,
    velocity: 20
  },
  normal: {
    team_sentiment: 60,
    ceo_sentiment: 50,
    sales_sentiment: 50,
    cto_sentiment: 50,
    self_serve_growth: 40,
    enterprise_growth: 40,
    tech_debt: 35,
    nps: 55,
    velocity: 20
  },
  hard: {
    team_sentiment: 50,
    ceo_sentiment: 40,
    sales_sentiment: 40,
    cto_sentiment: 45,
    self_serve_growth: 30,
    enterprise_growth: 30,
    tech_debt: 50,
    nps: 45,
    velocity: 20
  }
};

export function createInitialMetrics(difficulty: Difficulty): MetricsState {
  return { ...BASE_METRICS[difficulty] };
}

export function createNewGameRecord(
  sessionId: string,
  difficulty: Difficulty
): Omit<GameRecord, "id"> {
  return {
    session_id: sessionId,
    difficulty,
    current_quarter: 1,
    current_sprint: 1,
    state: "in_progress",
    metrics_state: createInitialMetrics(difficulty),
    events_log: [],
    rng_seed: Math.floor(Math.random() * 1_000_000)
  };
}
