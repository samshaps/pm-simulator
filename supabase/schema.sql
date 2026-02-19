create extension if not exists pgcrypto;

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  last_active timestamptz not null default now(),
  active_game_id uuid null,
  completed_games jsonb not null default '[]'::jsonb
);

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  difficulty text not null check (difficulty in ('easy', 'normal', 'hard')),
  current_quarter int not null default 1,
  current_sprint int not null default 1,
  state text not null default 'in_progress' check (state in ('in_progress', 'completed')),
  metrics_state jsonb not null,
  events_log jsonb not null default '[]'::jsonb,
  rng_seed int not null,
  metric_targets jsonb default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sprints (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  quarter int not null,
  number int not null,
  effective_capacity int not null,
  backlog jsonb not null default '[]'::jsonb,
  committed jsonb not null default '[]'::jsonb,
  retro jsonb
);

create table if not exists quarters (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  number int not null,
  ceo_focus text not null,
  product_pulse jsonb,
  quarterly_review jsonb
);

create table if not exists year_end_review (
  game_id uuid primary key references games(id) on delete cascade,
  review jsonb not null
);

create table if not exists ticket_templates (
  id text primary key,
  category text not null,
  payload jsonb not null
);

create table if not exists event_catalog (
  id text primary key,
  payload jsonb not null
);

create table if not exists narrative_templates (
  id text primary key,
  payload jsonb not null
);

create index if not exists idx_sessions_active_game_id on sessions(active_game_id);
create index if not exists idx_games_session_id on games(session_id);

-- Migration: feature-onboarding-and-target-lines
-- Run this against existing Supabase instances before deploying.
-- Existing games will have metric_targets = NULL (target lines gracefully hidden).
-- ALTER TABLE games ADD COLUMN IF NOT EXISTS metric_targets jsonb DEFAULT NULL;
