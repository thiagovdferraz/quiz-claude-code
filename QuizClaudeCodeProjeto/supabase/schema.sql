-- Claude Code Quiz — Schema Supabase
-- Execute no SQL Editor do painel Supabase

create table if not exists public.rankings (
  id            uuid primary key default gen_random_uuid(),
  nickname      text not null check (char_length(nickname) between 2 and 20),
  score         integer not null check (score >= 0 and score <= 10000),
  correct_count integer not null check (correct_count between 0 and 15),
  session_id    uuid not null unique,
  ip_hash       text,
  created_at    timestamptz not null default now()
);

create index if not exists rankings_score_idx on public.rankings (score desc);
create index if not exists rankings_ip_created_idx on public.rankings (ip_hash, created_at desc);

-- RLS: leitura pública, escrita apenas via service_role (server-side)
alter table public.rankings enable row level security;

create policy "public read" on public.rankings
  for select using (true);

-- Sem policy de INSERT: apenas service_role consegue inserir
