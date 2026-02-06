export type Difficulty = "easy" | "normal" | "hard";

export type MetricsState = {
  team_sentiment: number;
  ceo_sentiment: number;
  sales_sentiment: number;
  cto_sentiment: number;
  self_serve_growth: number;
  enterprise_growth: number;
  tech_debt: number;
  nps: number;
  velocity: number;
};

export type GameRecord = {
  id: string;
  session_id: string;
  difficulty: Difficulty;
  current_quarter: number;
  current_sprint: number;
  state: "in_progress" | "completed";
  metrics_state: MetricsState;
  events_log: unknown[];
  rng_seed: number;
};
