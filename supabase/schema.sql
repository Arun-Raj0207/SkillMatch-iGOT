-- Run this in the Supabase SQL editor for your project.

-- Official's structured competency-intake profile.
-- One row per user, linked to Supabase's built-in auth.users table.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) > 0 and char_length(full_name) <= 120),
  designation text not null check (char_length(trim(designation)) > 0 and char_length(designation) <= 120),
  department text not null check (char_length(trim(department)) > 0 and char_length(department) <= 120),
  job_role text not null check (char_length(trim(job_role)) > 0 and char_length(job_role) <= 1000),
  service_cadre text not null check (char_length(trim(service_cadre)) > 0 and char_length(service_cadre) <= 120),
  group_level text not null check (group_level in ('Group A', 'Group B', 'Group C')),
  posting_location text not null check (char_length(trim(posting_location)) > 0 and char_length(posting_location) <= 200),
  preferred_language text not null check (char_length(trim(preferred_language)) > 0 and char_length(preferred_language) <= 40),
  technical_skills text[] not null default '{}',
  education text not null check (char_length(trim(education)) > 0 and char_length(education) <= 200),
  years_experience integer not null default 0 check (years_experience >= 0 and years_experience <= 70),
  past_trainings text check (past_trainings is null or char_length(past_trainings) <= 2000),
  profile_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security: each official can only see/edit their own profile.
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- Keep updated_at fresh on every edit.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
