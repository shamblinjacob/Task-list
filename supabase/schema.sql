-- Task List schema. Run this once in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'active' check (status in ('active','paused','completed','archived')),
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text,
  due_date date not null,
  completed boolean not null default false,
  completed_at timestamptz,
  goal_id uuid references public.goals(id) on delete set null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists tasks_goal_id_idx on public.tasks(goal_id);

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null unique,
  intention text,
  reflection text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

drop trigger if exists reflections_set_updated_at on public.reflections;
create trigger reflections_set_updated_at
  before update on public.reflections
  for each row execute function public.set_updated_at();

-- Single-user app. Disable RLS so the anon key can read/write.
-- If you ever want multi-user, enable RLS and add auth.
alter table public.goals disable row level security;
alter table public.tasks disable row level security;
alter table public.reflections disable row level security;
