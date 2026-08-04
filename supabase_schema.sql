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
-- ROW LEVEL SECURITY (Commercial Multi-User SaaS Setup)
-- Strictly isolates all user data by auth.uid() = user_id
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

-- Enforce strict user_id ownership policy across all domain tables
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
    -- Ensure user_id column exists
    execute format('alter table %I add column if not exists user_id uuid references auth.users(id) on delete cascade', tbl);
    
    -- Drop old permissive policies if existing
    execute format('drop policy if exists authenticated_access_policy on %I', tbl);
    execute format('drop policy if exists user_isolation_policy on %I', tbl);
    
    -- Create strict per-user ownership policy
    execute format(
      'create policy user_isolation_policy on %I for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)',
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
    'motivation_collections','custom_motivation_categories',
    'integration_settings','notebooks','integration_logs',
    'health_records','attachments'
  ];
begin
  foreach tbl in array tables loop
    execute format('alter table %I add column if not exists user_id uuid references auth.users(id) on delete cascade', tbl);
    execute format('drop policy if exists authenticated_access_policy on %I', tbl);
    execute format('drop policy if exists user_isolation_policy on %I', tbl);
    execute format(
      'create policy user_isolation_policy on %I for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)',
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
  category text,
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

-- ─── 34. ATTACHMENTS ─────────────────────────────────────────────────────────
create table if not exists attachments (
  id text primary key,
  name text not null,
  size integer not null,
  mime_type text not null,
  local_path text,
  remote_url text,
  parent_type text not null,
  parent_id text not null,
  sha256_hash text not null,
  checksum text not null,
  upload_status text default 'pending',
  upload_progress numeric default 0,
  paused boolean default false,
  resumed boolean default false,
  uploaded_at text,
  downloaded_at text,
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

alter table attachments enable row level security;
drop policy if exists authenticated_access_policy on attachments;
create policy authenticated_access_policy on attachments for all using (true) with check (true);
create index if not exists idx_attachments_sync on attachments(updated_at, deleted);
create index if not exists idx_attachments_parent on attachments(parent_id);

-- Drop trigger if exists and recreate
drop trigger if exists trg_set_updated_at on attachments;
create trigger trg_set_updated_at before update on attachments
  for each row execute function set_updated_at();

-- Register storage bucket attachments
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

-- Enable objects policy for bucket
drop policy if exists "Allow all operations for anyone on attachments bucket" on storage.objects;
create policy "Allow all operations for anyone on attachments bucket" on storage.objects
  for all using (bucket_id = 'attachments') with check (bucket_id = 'attachments');

-- ─── 34. ACADEMIC CURRICULUM & ONBOARDING TABLES ─────────────────────────────

-- Profile Academic Columns
alter table profile add column if not exists board_id text;
alter table profile add column if not exists class_level text;
alter table profile add column if not exists stream_id text;
alter table profile add column if not exists subject_combination_id text;
alter table profile add column if not exists academic_goal text;
alter table profile add column if not exists onboarding_completed boolean default false;

-- Boards (Global Master Data)
create table if not exists boards (
  id text primary key,
  name text not null,
  code text not null unique,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);
alter table boards enable row level security;
drop policy if exists authenticated_read_boards on boards;
create policy authenticated_read_boards on boards for select to authenticated using (true);

-- Streams (Global Master Data)
create table if not exists streams (
  id text primary key,
  board_id text references boards(id) on delete cascade,
  class_level text not null,
  name text not null,
  code text not null,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);
alter table streams enable row level security;
drop policy if exists authenticated_read_streams on streams;
create policy authenticated_read_streams on streams for select to authenticated using (true);

-- Subject Combinations (Global Master Data)
create table if not exists subject_combinations (
  id text primary key,
  stream_id text references streams(id) on delete cascade,
  name text not null,
  code text not null,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);
alter table subject_combinations enable row level security;
drop policy if exists authenticated_read_combinations on subject_combinations;
create policy authenticated_read_combinations on subject_combinations for select to authenticated using (true);

-- Curriculum Subjects (Global Master Data)
create table if not exists curriculum_subjects (
  id text primary key,
  name text not null,
  code text not null,
  icon text,
  color text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);
alter table curriculum_subjects enable row level security;
drop policy if exists authenticated_read_curriculum_subjects on curriculum_subjects;
create policy authenticated_read_curriculum_subjects on curriculum_subjects for select to authenticated using (true);

-- Combination Subjects (Global Master Data)
create table if not exists combination_subjects (
  combination_id text references subject_combinations(id) on delete cascade,
  subject_id text references curriculum_subjects(id) on delete cascade,
  is_optional boolean default false,
  primary key (combination_id, subject_id)
);
alter table combination_subjects enable row level security;
drop policy if exists authenticated_read_comb_subjects on combination_subjects;
create policy authenticated_read_comb_subjects on combination_subjects for select to authenticated using (true);

-- Master Chapters (Global Master Data)
create table if not exists master_chapters (
  id text primary key,
  subject_id text references curriculum_subjects(id) on delete cascade,
  board_id text references boards(id) on delete cascade,
  class_level text not null,
  chapter_number integer not null,
  chapter_name text not null,
  section_name text,
  book_part text,
  sort_order integer default 0,
  estimated_hours numeric default 5,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);
alter table master_chapters enable row level security;
drop policy if exists authenticated_read_master_chapters on master_chapters;
create policy authenticated_read_master_chapters on master_chapters for select to authenticated using (true);

-- User Subjects (User-specific Progress Binding)
create table if not exists user_subjects (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  subject_id text references curriculum_subjects(id) on delete cascade,
  class_level text,
  enabled boolean default true,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now()),
  last_synced_at timestamptz,
  deleted boolean default false,
  sync_version integer default 1
);
alter table user_subjects enable row level security;
drop policy if exists user_isolation_user_subjects on user_subjects;
create policy user_isolation_user_subjects on user_subjects for all to authenticated 
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_user_subjects_user on user_subjects(user_id, enabled);
alter table user_subjects add column if not exists class_level text;

-- ─── Idempotent Curriculum Seed Statements ──────────────────────────────────

-- 1. Seed Boards
insert into boards (id, name, code) values
  ('board-plus-one', 'Kerala HSE / State Board', 'KERALA_HSE'),
  ('board-cbse', 'CBSE (Central Board)', 'CBSE'),
  ('board-isc', 'ISC / ICSE Board', 'ISC')
on conflict (id) do nothing;

-- 2. Seed Master Curriculum Subjects
insert into curriculum_subjects (id, name, code, icon, color) values
  ('sub-phy', 'Physics', 'PHY', 'Atom', '#3b82f6'),
  ('sub-chem', 'Chemistry', 'CHEM', 'FlaskConical', '#ec4899'),
  ('sub-math', 'Mathematics', 'MATH', 'Calculator', '#8b5cf6'),
  ('sub-bio', 'Biology', 'BIO', 'Dna', '#84cc16'),
  ('sub-acc', 'Accountancy', 'ACC', 'Receipt', '#06b6d4'),
  ('sub-bst', 'Business Studies', 'BST', 'Briefcase', '#6366f1'),
  ('sub-eco', 'Economics', 'ECO', 'TrendingUp', '#14b8a6')
on conflict (id) do nothing;

-- 3. Seed Plus One & Plus Two Streams
insert into streams (id, board_id, class_level, name, code) values
  ('str-p1-sci', 'board-plus-one', 'Plus One', 'Science', 'SCIENCE_P1'),
  ('str-p1-com', 'board-plus-one', 'Plus One', 'Commerce', 'COMMERCE_P1'),
  ('str-p2-sci', 'board-plus-one', 'Plus Two', 'Science', 'SCIENCE_P2'),
  ('str-p2-com', 'board-plus-one', 'Plus Two', 'Commerce', 'COMMERCE_P2')
on conflict (id) do nothing;

-- 4. Seed Subject Combinations
insert into subject_combinations (id, stream_id, name, code) values
  ('comb-p1-pcm', 'str-p1-sci', 'PCM (Physics, Chemistry, Mathematics)', 'PCM'),
  ('comb-p1-pcmb', 'str-p1-sci', 'PCMB (Physics, Chemistry, Mathematics, Biology)', 'PCMB'),
  ('comb-p1-commerce-core', 'str-p1-com', 'Commerce Core (Accountancy, Business Studies, Economics)', 'COMMERCE_CORE'),
  ('comb-p2-pcm', 'str-p2-sci', 'PCM (Physics, Chemistry, Mathematics)', 'PCM_P2'),
  ('comb-p2-pcmb', 'str-p2-sci', 'PCMB (Physics, Chemistry, Mathematics, Biology)', 'PCMB_P2'),
  ('comb-p2-commerce-core', 'str-p2-com', 'Commerce Core (Accountancy, Business Studies, Economics)', 'COMMERCE_CORE_P2')
on conflict (id) do nothing;

-- 5. Seed Combination Subject Mappings
insert into combination_subjects (combination_id, subject_id) values
  ('comb-p1-pcm', 'sub-phy'), ('comb-p1-pcm', 'sub-chem'), ('comb-p1-pcm', 'sub-math'),
  ('comb-p1-pcmb', 'sub-phy'), ('comb-p1-pcmb', 'sub-chem'), ('comb-p1-pcmb', 'sub-math'), ('comb-p1-pcmb', 'sub-bio'),
  ('comb-p1-commerce-core', 'sub-acc'), ('comb-p1-commerce-core', 'sub-bst'), ('comb-p1-commerce-core', 'sub-eco'),
  ('comb-p2-pcm', 'sub-phy'), ('comb-p2-pcm', 'sub-chem'), ('comb-p2-pcm', 'sub-math'),
  ('comb-p2-pcmb', 'sub-phy'), ('comb-p2-pcmb', 'sub-chem'), ('comb-p2-pcmb', 'sub-math'), ('comb-p2-pcmb', 'sub-bio'),
  ('comb-p2-commerce-core', 'sub-acc'), ('comb-p2-commerce-core', 'sub-bst'), ('comb-p2-commerce-core', 'sub-eco')
on conflict (combination_id, subject_id) do nothing;


