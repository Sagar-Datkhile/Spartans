-- ============================================================
-- KPI Scores Table Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

create table if not exists public.kpi_scores (
  id            uuid primary key default gen_random_uuid(),
  employee_id   uuid not null references public.users(id) on delete cascade,
  manager_id    uuid not null references public.users(id) on delete cascade,
  metric_name   text not null,
  target_value  numeric not null check (target_value > 0),
  actual_value  numeric,
  score         numeric,           -- (actual / target) * 100, calculated server-side
  status        text check (status in ('Excellent', 'Good', 'Average', 'Needs Improvement')),
  period        text not null,     -- Format: YYYY-MM  e.g. "2026-03"
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Index for fast lookups
create index if not exists kpi_scores_employee_id_idx on public.kpi_scores(employee_id);
create index if not exists kpi_scores_manager_id_idx  on public.kpi_scores(manager_id);

-- Row Level Security
alter table public.kpi_scores enable row level security;

-- Employees can read their own KPIs
create policy "Employees can view their own KPIs"
  on public.kpi_scores for select
  using (employee_id = auth.uid());

-- Managers can read all KPIs they created
create policy "Managers can view KPIs they manage"
  on public.kpi_scores for select
  using (manager_id = auth.uid());

-- Managers can insert KPIs
create policy "Managers can create KPIs"
  on public.kpi_scores for insert
  with check (manager_id = auth.uid());

-- Managers can update KPIs they own
create policy "Managers can update KPIs they manage"
  on public.kpi_scores for update
  using (manager_id = auth.uid());

-- Managers can delete KPIs they created
create policy "Managers can delete KPIs they manage"
  on public.kpi_scores for delete
  using (manager_id = auth.uid());

-- Service role bypass (for API routes using supabaseAdmin)
-- The service role key bypasses RLS by default, no extra policy needed.
