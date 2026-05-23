
-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  class text,
  state text,
  social_category text,
  stream text,
  subjects text[],
  marks_percent numeric,
  career_interests text[],
  skills text[],
  budget_min integer,
  budget_max integer,
  preferred_location text,
  college_type text,
  entrance_exams jsonb default '[]'::jsonb,
  extracurriculars text,
  income_bracket text,
  gender text,
  minority_category text,
  completed_onboarding boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- CAREERS
create table public.careers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  why_fit_template text,
  skills text[],
  degree_paths text[],
  salary_range text,
  difficulty text,
  future_scope text,
  streams text[],
  tags text[],
  created_at timestamptz not null default now()
);
alter table public.careers enable row level security;
create policy "Careers are viewable by authenticated users" on public.careers for select to authenticated using (true);

-- COLLEGES
create table public.colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text,
  city text,
  type text,
  fees_min integer,
  fees_max integer,
  streams text[],
  courses text[],
  cutoff_min numeric,
  notes text,
  tags text[],
  created_at timestamptz not null default now()
);
alter table public.colleges enable row level security;
create policy "Colleges are viewable by authenticated users" on public.colleges for select to authenticated using (true);

-- SCHOLARSHIPS
create table public.scholarships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  amount text,
  eligibility_text text,
  state text,
  stream text,
  min_marks numeric,
  income_bracket text,
  gender text,
  minority_category text,
  deadline text,
  link text,
  tags text[],
  created_at timestamptz not null default now()
);
alter table public.scholarships enable row level security;
create policy "Scholarships are viewable by authenticated users" on public.scholarships for select to authenticated using (true);

-- RECOMMENDATIONS (AI cached output)
create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  careers jsonb not null default '[]'::jsonb,
  colleges jsonb not null default '{}'::jsonb,
  scholarships jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now()
);
alter table public.recommendations enable row level security;
create policy "Users view own recs" on public.recommendations for select using (auth.uid() = user_id);
create policy "Users insert own recs" on public.recommendations for insert with check (auth.uid() = user_id);
create policy "Users update own recs" on public.recommendations for update using (auth.uid() = user_id);
create policy "Users delete own recs" on public.recommendations for delete using (auth.uid() = user_id);

create index on public.recommendations(user_id, generated_at desc);
create index on public.colleges(state);
create index on public.scholarships(state);
