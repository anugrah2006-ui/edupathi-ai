-- ─── EduPath AI Database Schema (Supabase) ──────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Roadmaps Table
create table if not exists public.roadmaps (
  id uuid primary key default uuid_generate_v4(),
  user_identifier text not null default 'guest_user',
  target_role_id text not null,
  target_role_title text not null,
  learner_profile jsonb not null,
  skill_gaps jsonb not null,
  roadmap_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Daily Missions Table
create table if not exists public.missions (
  id uuid primary key default uuid_generate_v4(),
  roadmap_id uuid references public.roadmaps(id) on delete cascade,
  title text not null,
  target_skill text not null,
  current_level integer not null,
  target_level integer not null,
  difficulty text default 'intermediate',
  mission_type text not null,
  estimated_minutes integer not null,
  task_prompt text not null,
  expected_outcome text not null,
  evaluation_criteria jsonb not null,
  status text not null default 'pending', -- 'pending' | 'in_progress' | 'completed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Mission Submissions & AI Evaluations Table
create table if not exists public.submissions (
  id uuid primary key default uuid_generate_v4(),
  mission_id uuid references public.missions(id) on delete cascade,
  user_submission text not null,
  score integer,
  strengths jsonb,
  weaknesses jsonb,
  feedback text,
  next_mission_hints jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) Policies
alter table public.roadmaps enable row level security;
alter table public.missions enable row level security;
alter table public.submissions enable row level security;

-- Allow public read/write for MVP hackathon mode
create policy "Allow public read access for roadmaps" on public.roadmaps for select using (true);
create policy "Allow public insert access for roadmaps" on public.roadmaps for insert with check (true);

create policy "Allow public read access for missions" on public.missions for select using (true);
create policy "Allow public insert access for missions" on public.missions for insert with check (true);
create policy "Allow public update access for missions" on public.missions for update using (true);

create policy "Allow public read access for submissions" on public.submissions for select using (true);
create policy "Allow public insert access for submissions" on public.submissions for insert with check (true);
