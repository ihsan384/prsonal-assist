-- Supabase Database Schema for Ihsan OS
-- Clean offline-first data model with synchronization metadata

-- Enable UUID extension
create extension if not exists "uuid-ossp";

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
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
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
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
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
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 4. FOCUS SESSIONS ───────────────────────────────────────────────────────
create table if not exists sessions (
  id text primary key,
  subject_id text references subjects(id) on delete cascade,
  chapter_id text references chapters(id) on delete cascade,
  topic_id text references topics(id) on delete cascade,
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
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 5. REVISIONS ────────────────────────────────────────────────────────────
create table if not exists revisions (
  id text primary key,
  topic_id text references topics(id) on delete cascade,
  topic_name text not null,
  subject_name text not null,
  revision_number integer default 1,
  scheduled_date text not null,
  completed boolean default false,
  confidence integer default 3,
  
  -- Sync Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 6. QUESTIONS ────────────────────────────────────────────────────────────
create table if not exists questions (
  id text primary key,
  subject_id text references subjects(id) on delete cascade,
  chapter_id text references chapters(id) on delete cascade,
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
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 7. TESTS ────────────────────────────────────────────────────────────────
create table if not exists tests (
  id text primary key,
  subject_id text references subjects(id) on delete cascade,
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
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 8. MISTAKES ─────────────────────────────────────────────────────────────
create table if not exists mistakes (
  id text primary key,
  subject_id text references subjects(id) on delete cascade,
  chapter_id text references chapters(id) on delete cascade,
  question text not null,
  correct_solution text,
  reason text,
  category text,
  revision_status text default 'review_needed',
  date_added text not null,
  
  -- Sync Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 9. FORMULAS ─────────────────────────────────────────────────────────────
create table if not exists formulas (
  id text primary key,
  subject_id text references subjects(id) on delete cascade,
  chapter_id text references chapters(id) on delete cascade,
  name text not null,
  expression text not null,
  description text,
  example text,
  is_favourite boolean default false,
  
  -- Sync Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
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
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 11. TASKS ───────────────────────────────────────────────────────────────
create table if not exists tasks (
  id text primary key,
  title text not null,
  category text not null,
  priority text default 'medium',
  status text default 'todo',
  due_time text,
  tags text[],
  
  -- Sync Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 12. HABITS ──────────────────────────────────────────────────────────────
create table if not exists habits (
  id text primary key,
  name text not null,
  icon text not null,
  color text not null,
  streak integer default 0,
  completed_today boolean default false,
  week_days boolean[] not null,
  category text not null,
  
  -- Sync Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 13. FITNESS (WORKOUTS) ──────────────────────────────────────────────────
create table if not exists workouts (
  id text primary key,
  name text not null,
  type text not null,
  duration integer not null,
  calories integer not null,
  date text not null,
  exercises integer default 1,
  rating integer default 4,
  
  -- Sync Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 14. NUTRITION (MEALS) ───────────────────────────────────────────────────
create table if not exists meals (
  id text primary key,
  type text not null,
  time text not null,
  name text not null,
  calories integer not null,
  protein integer default 0,
  carbs integer default 0,
  fat integer default 0,
  
  -- Sync Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 15. WATER LOGS ──────────────────────────────────────────────────────────
create table if not exists water_logs (
  id text primary key, -- key formatted as YYYY-MM-DD
  amount_ml integer not null,
  
  -- Sync Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
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
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 17. SLEEP LOGS ──────────────────────────────────────────────────────────
create table if not exists sleep_logs (
  id text primary key,
  date text not null,
  bed text not null,
  wake text not null,
  hours numeric not null,
  quality text not null,
  rating integer default 4,
  factors text[],
  
  -- Sync Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
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
  current numeric not null,
  target numeric not null,
  unit text default '%',
  
  -- Sync Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 19. KNOWLEDGE LIBRARY ───────────────────────────────────────────────────
create table if not exists knowledge (
  id text primary key,
  title text not null,
  author text not null,
  type text not null,
  status text not null,
  rating integer default 0,
  tags text[],
  progress integer,
  total_pages integer,
  current_page integer,
  color text not null,
  
  -- Sync Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
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
  
  -- Sync Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 21. BUDGETS ─────────────────────────────────────────────────────────────
create table if not exists budgets (
  id text primary key,
  category text not null,
  spent numeric default 0,
  limit_amount numeric not null,
  color text not null,
  
  -- Sync Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
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
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── 23. USER PROFILE ────────────────────────────────────────────────────────
create table if not exists profile (
  id text primary key, -- 'user_profile'
  name text default 'Ihsan',
  timezone text default 'Asia/Kolkata',
  theme text default 'light',
  accent_color text default '#2563eb',
  joined_at text not null,
  
  -- Sync Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deleted boolean default false,
  sync_version integer default 1
);

-- ─── RLS Policies (Single-user lock) ─────────────────────────────────────────
-- Since it's a personal life OS, we can secure it using auth.role() = 'authenticated'

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

-- Setup simple global policy for authenticated user
create policy authenticated_access_policy on subjects for all using (true) with check (true);
create policy authenticated_access_policy on chapters for all using (true) with check (true);
create policy authenticated_access_policy on topics for all using (true) with check (true);
create policy authenticated_access_policy on sessions for all using (true) with check (true);
create policy authenticated_access_policy on revisions for all using (true) with check (true);
create policy authenticated_access_policy on questions for all using (true) with check (true);
create policy authenticated_access_policy on tests for all using (true) with check (true);
create policy authenticated_access_policy on mistakes for all using (true) with check (true);
create policy authenticated_access_policy on formulas for all using (true) with check (true);
create policy authenticated_access_policy on notes for all using (true) with check (true);
create policy authenticated_access_policy on tasks for all using (true) with check (true);
create policy authenticated_access_policy on habits for all using (true) with check (true);
create policy authenticated_access_policy on workouts for all using (true) with check (true);
create policy authenticated_access_policy on meals for all using (true) with check (true);
create policy authenticated_access_policy on water_logs for all using (true) with check (true);
create policy authenticated_access_policy on nutrition_goals for all using (true) with check (true);
create policy authenticated_access_policy on sleep_logs for all using (true) with check (true);
create policy authenticated_access_policy on goals for all using (true) with check (true);
create policy authenticated_access_policy on knowledge for all using (true) with check (true);
create policy authenticated_access_policy on transactions for all using (true) with check (true);
create policy authenticated_access_policy on budgets for all using (true) with check (true);
create policy authenticated_access_policy on settings for all using (true) with check (true);
create policy authenticated_access_policy on profile for all using (true) with check (true);

-- ─── Performance Indexes ─────────────────────────────────────────────────────
create index if not exists idx_subjects_sync on subjects(updated_at, deleted);
create index if not exists idx_chapters_sync on chapters(updated_at, deleted);
create index if not exists idx_topics_sync on topics(updated_at, deleted);
create index if not exists idx_sessions_sync on sessions(updated_at, deleted);
create index if not exists idx_revisions_sync on revisions(updated_at, deleted);
create index if not exists idx_questions_sync on questions(updated_at, deleted);
create index if not exists idx_tests_sync on tests(updated_at, deleted);
create index if not exists idx_mistakes_sync on mistakes(updated_at, deleted);
create index if not exists idx_formulas_sync on formulas(updated_at, deleted);
create index if not exists idx_notes_sync on notes(updated_at, deleted);
create index if not exists idx_tasks_sync on tasks(updated_at, deleted);
create index if not exists idx_habits_sync on habits(updated_at, deleted);
create index if not exists idx_workouts_sync on workouts(updated_at, deleted);
create index if not exists idx_meals_sync on meals(updated_at, deleted);
create index if not exists idx_water_logs_sync on water_logs(updated_at, deleted);
create index if not exists idx_sleep_logs_sync on sleep_logs(updated_at, deleted);
create index if not exists idx_goals_sync on goals(updated_at, deleted);
create index if not exists idx_knowledge_sync on knowledge(updated_at, deleted);
create index if not exists idx_transactions_sync on transactions(updated_at, deleted);
create index if not exists idx_budgets_sync on budgets(updated_at, deleted);
