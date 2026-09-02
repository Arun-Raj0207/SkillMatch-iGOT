-- One saved assessment per official. Re-running an assessment overwrites
-- the previous one (see the backend's upsert on user_id) rather than
-- keeping history — that's a deliberate simplification for now.

create table if not exists public.competency_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  overall_readiness integer,
  domains jsonb not null default '{}',
  top_priority_gaps jsonb not null default '[]',
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.competency_assessments enable row level security;

create policy "Users can view their own assessment"
  on public.competency_assessments for select
  using (auth.uid() = user_id);

create policy "Users can insert their own assessment"
  on public.competency_assessments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own assessment"
  on public.competency_assessments for update
  using (auth.uid() = user_id);

-- Reuses the same set_updated_at() function already created for `profiles`.
-- If that function doesn't exist yet in your project for some reason, run
-- the trigger block from supabase/schema.sql first.
create trigger competency_assessments_set_updated_at
  before update on public.competency_assessments
  for each row execute function public.set_updated_at();
