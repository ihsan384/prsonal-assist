-- ============================================================
-- Supabase Database Schema for Ihsan OS
-- Version 2 — Complete offline-first schema
-- Run this in Supabase SQL Editor > New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Sync metadata columns are present on every table ────────────────────────
-- created_at, updated_at, last_synced_at, deleted, sync_version

-- ─── 1. SUBJECTS ─────────────────────────────────────────────────────────────
create table if not exists subjects (
  id text primary key,
  name text not null,
  study_hours numeric default 0,
  target_hours numeric default 0,
  completed_chapters integer default 0,
  pending_chapters integer default 0,
  completion_percentage integer default 0,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 2. CHAPTERS ─────────────────────────────────────────────────────────────
create table if not exists chapters (
  id text primary key,
  subject_id text references subjects(id) on delete cascade,
  name text not null,
  priority text default 'medium',
  difficulty text default 'medium',
  status text default 'not_started',
  estimated_hours numeric default 0,
  completed_hours numeric default 0,
  notes text,
  revision_count integer default 0,
  confidence_percentage integer default 0,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 3. TOPICS ───────────────────────────────────────────────────────────────
create table if not exists topics (
  id text primary key,
  chapter_id text references chapters(id) on delete cascade,
  name text not null,
  status text default 'not_started',
  understanding_percentage integer default 0,
  questions_solved integer default 0,
  mistakes integer default 0,
  revision_needed boolean default false,
  notes text,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 4. FOCUS SESSIONS (Study ERP) ───────────────────────────────────────────
create table if not exists sessions (
  id text primary key,
  subject_id text references subjects(id) on delete set null,
  chapter_id text references chapters(id) on delete set null,
  topic_id text references topics(id) on delete set null,
  date text not null,
  start_time text not null,
  end_time text not null,
  duration_minutes integer not null,
  study_method text not null,
  focus_rating integer default 3,
  understanding_percentage integer default 0,
  questions_solved integer default 0,
  correct_answers integer default 0,
  wrong_answers integer default 0,
  notes text,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 5. REVISIONS ────────────────────────────────────────────────────────────
create table if not exists revisions (
  id text primary key,
  topic_id text references topics(id) on delete set null,
  topic_name text not null,
  subject_name text not null,
  revision_number integer default 1,
  scheduled_date text not null,
  completed boolean default false,
  confidence integer default 3,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 6. QUESTIONS ────────────────────────────────────────────────────────────
create table if not exists questions (
  id text primary key,
  subject_id text references subjects(id) on delete set null,
  chapter_id text references chapters(id) on delete set null,
  date text not null,
  questions_solved integer not null,
  correct integer default 0,
  wrong integer default 0,
  skipped integer default 0,
  accuracy_percentage integer default 0,
  time_taken_minutes integer default 0,
  difficulty text default 'medium',
  notes text,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 7. TESTS ────────────────────────────────────────────────────────────────
create table if not exists tests (
  id text primary key,
  subject_id text references subjects(id) on delete set null,
  name text not null,
  date text not null,
  total_questions integer not null,
  solved_questions integer not null,
  correct_answers integer default 0,
  wrong_answers integer default 0,
  score_percentage integer default 0,
  duration_minutes integer default 0,
  notes text,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 8. MISTAKES ─────────────────────────────────────────────────────────────
create table if not exists mistakes (
  id text primary key,
  subject_id text references subjects(id) on delete set null,
  chapter_id text references chapters(id) on delete set null,
  question text not null,
  correct_solution text,
  reason text,
  category text,
  revision_status text default 'review_needed',
  date_added text not null,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 9. FORMULAS ─────────────────────────────────────────────────────────────
create table if not exists formulas (
  id text primary key,
  subject_id text references subjects(id) on delete set null,
  chapter_id text references chapters(id) on delete set null,
  name text not null,
  expression text not null,
  description text,
  example text,
  is_favourite boolean default false,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 10. NOTES ───────────────────────────────────────────────────────────────
create table if not exists notes (
  id text primary key,
  title text not null,
  content text not null,
  is_pinned boolean default false,
  tags text[],
  date_created text not null,
  date_updated text not null,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 11. TASKS ───────────────────────────────────────────────────────────────
create table if not exists tasks (
  id text primary key,
  title text not null,
  description text,
  category text not null,
  priority text default 'medium',
  status text default 'todo',
  due_date text,
  due_time text,
  completed_at text,
  tags text[],
  subtasks jsonb default '[]'::jsonb,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 12. HABITS ──────────────────────────────────────────────────────────────
create table if not exists habits (
  id text primary key,
  name text not null,
  description text,
  icon text not null,
  color text not null,
  frequency text default 'daily',
  target_days int[] default '{}',
  streak integer default 0,
  longest_streak integer default 0,
  completions jsonb default '[]'::jsonb,
  is_active boolean default true,
  category text,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 13. FITNESS (WORKOUTS) ──────────────────────────────────────────────────
create table if not exists workouts (
  id text primary key,
  name text not null,
  type text not null,
  duration_minutes integer not null,
  date text not null,
  exercises jsonb default '[]'::jsonb,
  calories_burned integer,
  notes text,
  rating integer,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 14. NUTRITION (MEALS) ───────────────────────────────────────────────────
create table if not exists meals (
  id text primary key,
  name text not null,
  type text not null,
  date text not null,
  time text not null,
  foods jsonb default '[]'::jsonb,
  total_calories integer not null default 0,
  total_protein integer default 0,
  total_carbs integer default 0,
  total_fat integer default 0,
  notes text,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 15. WATER LOGS ──────────────────────────────────────────────────────────
create table if not exists water_logs (
  id text primary key, -- YYYY-MM-DD date key
  amount_ml integer not null,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 16. NUTRITION GOALS ─────────────────────────────────────────────────────
create table if not exists nutrition_goals (
  id text primary key, -- 'default'
  calories integer not null,
  protein integer not null,
  carbs integer not null,
  fat integer not null,
  water integer not null,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 17. SLEEP LOGS ──────────────────────────────────────────────────────────
create table if not exists sleep_logs (
  id text primary key,
  date text not null,
  bed_time text not null,
  wake_time text not null,
  duration_hours numeric not null,
  quality text not null,
  rating integer default 4,
  notes text,
  factors text[],

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 18. GOALS ───────────────────────────────────────────────────────────────
create table if not exists goals (
  id text primary key,
  title text not null,
  description text,
  category text not null,
  timeframe text not null,
  target_date text,
  current_value numeric not null default 0,
  target_value numeric not null,
  unit text default '%',
  status text default 'active',
  milestones jsonb default '[]'::jsonb,
  color text default '#2563eb',

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 19. KNOWLEDGE LIBRARY ───────────────────────────────────────────────────
create table if not exists knowledge (
  id text primary key,
  title text not null,
  type text not null,
  author text,
  url text,
  tags text[],
  status text not null,
  rating integer default 0,
  notes text,
  progress integer,
  total_pages integer,
  current_page integer,
  color text,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 20. FINANCE (TRANSACTIONS) ──────────────────────────────────────────────
create table if not exists transactions (
  id text primary key,
  title text not null,
  category text not null,
  amount numeric not null,
  type text not null,
  date text not null,
  notes text,
  tags text[],

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 21. BUDGETS ─────────────────────────────────────────────────────────────
create table if not exists budgets (
  id text primary key,
  category text not null,
  monthly_limit numeric not null,
  spent numeric default 0,
  color text not null,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 22. SETTINGS ────────────────────────────────────────────────────────────
create table if not exists settings (
  id text primary key, -- 'app_settings'
  theme text default 'light',
  accent_color text default '#2563eb',
  notifications boolean default true,
  sound_enabled boolean default true,
  haptic_enabled boolean default true,
  compact_mode boolean default false,
  language text default 'en',
  week_starts_on integer default 1,
  time_format text default '12h',
  study_timer_default integer default 25,
  water_goal integer default 3000,
  sleep_goal integer default 8,
  calorie_goal integer default 2200,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 23. USER PROFILE ────────────────────────────────────────────────────────
create table if not exists profile (
  id text primary key, -- 'user_profile'
  name text default 'Ihsan',
  avatar text,
  bio text,
  timezone text default 'Asia/Kolkata',
  theme text default 'light',
  accent_color text default '#2563eb',
  date_of_birth text,
  joined_at text not null,

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 24. GENERAL STUDY SESSIONS ──────────────────────────────────────────────
-- (separate from Study ERP "sessions" above — these are pomodoro/timer sessions)
create table if not exists study_sessions (
  id text primary key,
  subject text not null,
  topic text,
  type text not null,
  duration_minutes integer not null,
  start_time text not null,
  end_time text,
  notes text,
  rating integer,
  tags text[],

  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (Single-user personal app setup)
-- Allows all operations when using the anon or service key
-- ═══════════════════════════════════════════════════════════════════════════════

alter table subjects enable row level security;
alter table chapters enable row level security;
alter table topics enable row level security;
alter table sessions enable row level security;
alter table revisions enable row level security;
alter table questions enable row level security;
alter table tests enable row level security;
alter table mistakes enable row level security;
alter table formulas enable row level security;
alter table notes enable row level security;
alter table tasks enable row level security;
alter table habits enable row level security;
alter table workouts enable row level security;
alter table meals enable row level security;
alter table water_logs enable row level security;
alter table nutrition_goals enable row level security;
alter table sleep_logs enable row level security;
alter table goals enable row level security;
alter table knowledge enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table settings enable row level security;
alter table profile enable row level security;
alter table study_sessions enable row level security;

-- Permissive policies for single-user personal app (using anon key)
-- For multi-user: replace "true" with auth.uid() checks
do $$
declare
  tbl text;
  tables text[] := array[
    'subjects','chapters','topics','sessions','revisions','questions',
    'tests','mistakes','formulas','notes','tasks','habits','workouts',
    'meals','water_logs','nutrition_goals','sleep_logs','goals',
    'knowledge','transactions','budgets','settings','profile','study_sessions'
  ];
begin
  foreach tbl in array tables loop
    -- Drop existing policy if it exists, then recreate
    execute format('drop policy if exists authenticated_access_policy on %I', tbl);
    execute format(
      'create policy authenticated_access_policy on %I for all using (true) with check (true)',
      tbl
    );
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PERFORMANCE INDEXES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Sync indexes: query by updated_at for delta sync + deleted filter
create index if not exists idx_subjects_sync    on subjects(updated_at, deleted);
create index if not exists idx_chapters_sync    on chapters(updated_at, deleted);
create index if not exists idx_chapters_subject on chapters(subject_id);
create index if not exists idx_topics_sync      on topics(updated_at, deleted);
create index if not exists idx_topics_chapter   on topics(chapter_id);
create index if not exists idx_sessions_sync    on sessions(updated_at, deleted);
create index if not exists idx_sessions_date    on sessions(date);
create index if not exists idx_revisions_sync   on revisions(updated_at, deleted);
create index if not exists idx_revisions_date   on revisions(scheduled_date);
create index if not exists idx_questions_sync   on questions(updated_at, deleted);
create index if not exists idx_tests_sync       on tests(updated_at, deleted);
create index if not exists idx_mistakes_sync    on mistakes(updated_at, deleted);
create index if not exists idx_formulas_sync    on formulas(updated_at, deleted);
create index if not exists idx_notes_sync       on notes(updated_at, deleted);
create index if not exists idx_tasks_sync       on tasks(updated_at, deleted);
create index if not exists idx_tasks_status     on tasks(status, deleted);
create index if not exists idx_tasks_date       on tasks(due_date, deleted);
create index if not exists idx_habits_sync      on habits(updated_at, deleted);
create index if not exists idx_workouts_sync    on workouts(updated_at, deleted);
create index if not exists idx_workouts_date    on workouts(date);
create index if not exists idx_meals_sync       on meals(updated_at, deleted);
create index if not exists idx_meals_date       on meals(date);
create index if not exists idx_water_logs_sync  on water_logs(updated_at, deleted);
create index if not exists idx_sleep_logs_sync  on sleep_logs(updated_at, deleted);
create index if not exists idx_sleep_date       on sleep_logs(date);
create index if not exists idx_goals_sync       on goals(updated_at, deleted);
create index if not exists idx_goals_status     on goals(status, deleted);
create index if not exists idx_knowledge_sync   on knowledge(updated_at, deleted);
create index if not exists idx_knowledge_status on knowledge(status, deleted);
create index if not exists idx_transactions_sync on transactions(updated_at, deleted);
create index if not exists idx_transactions_date on transactions(date);
create index if not exists idx_budgets_sync     on budgets(updated_at, deleted);
create index if not exists idx_study_sessions_sync on study_sessions(updated_at, deleted);
create index if not exists idx_study_sessions_time on study_sessions(start_time);

-- ═══════════════════════════════════════════════════════════════════════════════
-- UPDATED_AT AUTO-TRIGGER (optional convenience — not required for sync)
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Apply trigger to all tables
do $$
declare
  tbl text;
  tables text[] := array[
    'subjects','chapters','topics','sessions','revisions','questions',
    'tests','mistakes','formulas','notes','tasks','habits','workouts',
    'meals','water_logs','nutrition_goals','sleep_logs','goals',
    'knowledge','transactions','budgets','settings','profile','study_sessions'
  ];
begin
  foreach tbl in array tables loop
    execute format('drop trigger if exists trg_set_updated_at on %I', tbl);
    execute format(
      'create trigger trg_set_updated_at before update on %I
       for each row execute function set_updated_at()',
      tbl
    );
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERSION 4 ADDITIONS — Reflection (Diary) + Motivation Center
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 25. REFLECTION ENTRIES (Daily Diary) ─────────────────────────────────────
create table if not exists reflection_entries (
  id text primary key,
  date text not null,
  day_of_week text not null,
  start_time text,
  end_time text,
  mood text not null default 'good',
  energy_level integer not null default 7 check (energy_level between 1 and 10),
  focus_level integer not null default 7 check (focus_level between 1 and 10),
  productivity_rating integer not null default 7 check (productivity_rating between 1 and 10),
  stress_level integer not null default 4 check (stress_level between 1 and 10),
  sleep_quality text,
  weather text,
  location text,
  content text not null default '',
  how_was_today text,
  accomplishments text,
  distractions text,
  learnings text,
  happiness text,
  frustrations text,
  mistakes text,
  improvements text,
  iit_progress text,
  time_wasted text,
  gratitude text,
  tomorrow_priorities text,
  free_notes text,
  word_count integer not null default 0,
  is_pinned boolean not null default false,
  is_favourite boolean not null default false,
  tags text[] default '{}',
  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 26. MOTIVATION QUOTES ────────────────────────────────────────────────────
create table if not exists motivation_quotes (
  id text primary key,
  quote text not null,
  author text,
  source text,
  category text not null default 'motivation',
  custom_category text,
  tags text[] default '{}',
  is_favourite boolean not null default false,
  is_pinned boolean not null default false,
  collection_ids text[] default '{}',
  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 27. MOTIVATION NOTES ─────────────────────────────────────────────────────
create table if not exists motivation_notes (
  id text primary key,
  title text not null,
  content text not null default '',
  category text not null default 'motivation',
  custom_category text,
  tags text[] default '{}',
  is_favourite boolean not null default false,
  is_pinned boolean not null default false,
  collection_ids text[] default '{}',
  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 28. MOTIVATION COLLECTIONS ───────────────────────────────────────────────
create table if not exists motivation_collections (
  id text primary key,
  name text not null,
  description text,
  color text not null default '#2563eb',
  icon text not null default '📚',
  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 29. CUSTOM MOTIVATION CATEGORIES ─────────────────────────────────────────
create table if not exists custom_motivation_categories (
  id text primary key,
  name text not null,
  color text not null default '#2563eb',
  icon text not null default '📌',
  -- Sync Metadata
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);

-- RLS for new tables
alter table reflection_entries enable row level security;
alter table motivation_quotes enable row level security;
alter table motivation_notes enable row level security;
alter table motivation_collections enable row level security;
alter table custom_motivation_categories enable row level security;

do $$
declare
  tbl text;
  tables text[] := array[
    'reflection_entries','motivation_quotes','motivation_notes',
    'motivation_collections','custom_motivation_categories'
  ];
begin
  foreach tbl in array tables loop
    execute format('drop policy if exists authenticated_access_policy on %I', tbl);
    execute format(
      'create policy authenticated_access_policy on %I for all using (true) with check (true)',
      tbl
    );
  end loop;
end $$;

-- Indexes for new tables
create index if not exists idx_reflection_entries_sync on reflection_entries(updated_at, deleted);
create index if not exists idx_reflection_entries_date on reflection_entries(date, deleted);
create index if not exists idx_reflection_entries_mood on reflection_entries(mood, deleted);
create index if not exists idx_motivation_quotes_sync  on motivation_quotes(updated_at, deleted);
create index if not exists idx_motivation_quotes_cat   on motivation_quotes(category, deleted);
create index if not exists idx_motivation_quotes_fav   on motivation_quotes(is_favourite, deleted);
create index if not exists idx_motivation_notes_sync   on motivation_notes(updated_at, deleted);
create index if not exists idx_motivation_notes_cat    on motivation_notes(category, deleted);
create index if not exists idx_motivation_collections_sync on motivation_collections(updated_at, deleted);
create index if not exists idx_custom_categories_sync  on custom_motivation_categories(updated_at, deleted);

-- Triggers for new tables
do $$
declare
  tbl text;
  tables text[] := array[
    'reflection_entries','motivation_quotes','motivation_notes',
    'motivation_collections','custom_motivation_categories'
  ];
begin
  foreach tbl in array tables loop
    execute format('drop trigger if exists trg_set_updated_at on %I', tbl);
    execute format(
      'create trigger trg_set_updated_at before update on %I
       for each row execute function set_updated_at()',
      tbl
    );
  end loop;
end $$;

-- ─── 30. INTEGRATION SETTINGS ───────────────────────────────────────────────
create table if not exists integration_settings (
  id text primary key,
  status text not null default 'disconnected',
  last_sync text,
  metadata jsonb default '{}'::jsonb,
  encrypted_tokens text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1,
  sync_status text default 'success',
  retry_count integer default 0,
  last_retry text,
  last_error text
);

alter table integration_settings enable row level security;
drop policy if exists authenticated_access_policy on integration_settings;
create policy authenticated_access_policy on integration_settings for all using (true) with check (true);
create index if not exists idx_integration_settings_sync on integration_settings(updated_at, deleted);

-- ─── 31. NOTEBOOKS ───────────────────────────────────────────────────────────
create table if not exists notebooks (
  id text primary key,
  name text not null,
  description text,
  topic text,
  last_opened text,
  date_added text not null,
  is_favourite boolean default false,
  is_pinned boolean default false,
  tags text[] default '{}',
  categories text[] default '{}',
  resources jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1,
  sync_status text default 'pending',
  retry_count integer default 0,
  last_retry text,
  last_error text,
  is_archived boolean default false,
  url text,
  last_modified text,
  estimated_reading_time text,
  collections text[] default '{}'
);

alter table notebooks enable row level security;
drop policy if exists authenticated_access_policy on notebooks;
create policy authenticated_access_policy on notebooks for all using (true) with check (true);
create index if not exists idx_notebooks_sync on notebooks(updated_at, deleted);
create index if not exists idx_notebooks_pinned on notebooks(is_pinned, deleted);
create index if not exists idx_notebooks_fav on notebooks(is_favourite, deleted);

-- ─── 32. INTEGRATION LOGS ───────────────────────────────────────────────────
create table if not exists integration_logs (
  id text primary key,
  provider text not null,
  action text not null,
  status text not null,
  timestamp text not null,
  duration integer default 0,
  error_message text,
  retry_count integer default 0,
  device text,
  last_retry text,
  last_error text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1,
  sync_status text default 'pending'
);

alter table integration_logs enable row level security;
drop policy if exists authenticated_access_policy on integration_logs;
create policy authenticated_access_policy on integration_logs for all using (true) with check (true);
create index if not exists idx_integration_logs_sync on integration_logs(updated_at, deleted);

-- ─── 33. HEALTH RECORDS ──────────────────────────────────────────────────────
create table if not exists health_records (
  id text primary key,
  type text not null,
  value numeric not null,
  unit text not null,
  source text not null,
  timestamp text not null,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1,
  sync_status text default 'pending',
  retry_count integer default 0,
  last_retry text,
  last_error text
);

alter table health_records enable row level security;
drop policy if exists authenticated_access_policy on health_records;
create policy authenticated_access_policy on health_records for all using (true) with check (true);
create index if not exists idx_health_records_sync on health_records(updated_at, deleted);
create index if not exists idx_health_records_type_time on health_records(type, timestamp);

-- Triggers for new tables
do $$
declare
  tbl text;
  tables text[] := array[
    'integration_settings','notebooks','integration_logs','health_records'
  ];
begin
  foreach tbl in array tables loop
    execute format('drop trigger if exists trg_set_updated_at on %I', tbl);
    execute format(
      'create trigger trg_set_updated_at before update on %I
       for each row execute function set_updated_at()',
      tbl
    );
  end loop;
end $$;

