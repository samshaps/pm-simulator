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
    team_sentiment: 55,
    ceo_sentiment: 45,
    sales_sentiment: 45,
    cto_sentiment: 48,
    self_serve_growth: 32,
    enterprise_growth: 32,
    tech_debt: 45,
    nps: 48,
    velocity: 20
  }
};

export function createInitialMetrics(difficulty: Difficulty): MetricsState {
  const base = BASE_METRICS[difficulty];

  // Randomize each metric by ±25%, but maintain overall balance
  const randomize = (value: number) => {
    const variance = 0.25;
    const min = Math.floor(value * (1 - variance));
    const max = Math.ceil(value * (1 + variance));
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Calculate target total (treating tech_debt as inverse for balance)
  const calculateScore = (metrics: MetricsState) => {
    return (
      metrics.team_sentiment +
      metrics.ceo_sentiment +
      metrics.sales_sentiment +
      metrics.cto_sentiment +
      metrics.self_serve_growth +
      metrics.enterprise_growth +
      (100 - metrics.tech_debt) + // Inverse tech debt
      metrics.nps +
      metrics.velocity
    );
  };

  const targetScore = calculateScore(base);
  const tolerance = targetScore * 0.25; // ±25% tolerance on total

  let attempts = 0;
  let randomized: MetricsState;

  do {
    randomized = {
      team_sentiment: randomize(base.team_sentiment),
      ceo_sentiment: randomize(base.ceo_sentiment),
      sales_sentiment: randomize(base.sales_sentiment),
      cto_sentiment: randomize(base.cto_sentiment),
      self_serve_growth: randomize(base.self_serve_growth),
      enterprise_growth: randomize(base.enterprise_growth),
      tech_debt: randomize(base.tech_debt),
      nps: randomize(base.nps),
      velocity: base.velocity // Keep velocity constant
    };

    const score = calculateScore(randomized);
    const withinTolerance = Math.abs(score - targetScore) <= tolerance;

    if (withinTolerance) {
      break;
    }

    attempts++;
  } while (attempts < 100);

  // Clamp all values to valid range [0, 100]
  return {
    team_sentiment: Math.max(0, Math.min(100, randomized.team_sentiment)),
    ceo_sentiment: Math.max(0, Math.min(100, randomized.ceo_sentiment)),
    sales_sentiment: Math.max(0, Math.min(100, randomized.sales_sentiment)),
    cto_sentiment: Math.max(0, Math.min(100, randomized.cto_sentiment)),
    self_serve_growth: Math.max(0, Math.min(100, randomized.self_serve_growth)),
    enterprise_growth: Math.max(0, Math.min(100, randomized.enterprise_growth)),
    tech_debt: Math.max(0, Math.min(100, randomized.tech_debt)),
    nps: Math.max(0, Math.min(100, randomized.nps)),
    velocity: randomized.velocity
  };
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
