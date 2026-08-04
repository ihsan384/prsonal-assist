-- ============================================================
-- FIX: Add user_id to all tables + RLS + Realtime
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- This ensures every user-data table has user_id, proper RLS,
-- and is registered for Realtime WebSocket broadcasting.
-- ============================================================

-- STEP 1: Add user_id column to all user data tables (safe if already exists)

do $$
declare
  tbl text;
  tables text[] := array[
    'subjects','chapters','topics','sessions','revisions','questions',
    'tests','mistakes','formulas','notes',
    'tasks','habits','workouts','meals','water_logs','sleep_logs',
    'goals','knowledge','transactions','budgets','study_sessions',
    'reflection_entries','motivation_quotes','motivation_notes',
    'motivation_collections','custom_motivation_categories',
    'integration_settings','notebooks','health_records','attachments'
  ];
begin
  foreach tbl in array tables loop
    -- Add user_id column if it doesn't exist
    execute format(
      'alter table %I add column if not exists user_id uuid references auth.users(id) on delete cascade',
      tbl
    );

    -- Enable RLS on the table
    execute format('alter table %I enable row level security', tbl);

    -- Drop old policies to avoid conflicts
    execute format('drop policy if exists user_isolation_policy on %I', tbl);
    execute format('drop policy if exists authenticated_access_policy on %I', tbl);

    -- Create strict per-user isolation policy
    execute format(
      'create policy user_isolation_policy on %I for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      tbl
    );

    -- Add index on user_id for fast filtering
    execute format(
      'create index if not exists idx_%s_user_id on %I(user_id)',
      tbl, tbl
    );
  end loop;
end $$;


-- STEP 2: Enable Realtime — safely skip tables already in the publication

do $$
declare
  tbl text;
  tables text[] := array[
    'subjects','chapters','topics','sessions','revisions','questions',
    'tests','mistakes','formulas','notes',
    'tasks','habits','workouts','meals','water_logs','sleep_logs',
    'goals','knowledge','transactions','budgets','study_sessions',
    'reflection_entries','motivation_quotes','motivation_notes',
    'motivation_collections','custom_motivation_categories',
    'integration_settings','notebooks','health_records','attachments',
    'user_subjects'
  ];
  already_member boolean;
begin
  foreach tbl in array tables loop
    -- Check if this table is already in the publication
    select exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and tablename = tbl
        and schemaname = 'public'
    ) into already_member;

    if not already_member then
      execute format(
        'alter publication supabase_realtime add table %I', tbl
      );
      raise notice 'Added % to supabase_realtime', tbl;
    else
      raise notice 'Skipped % — already in publication', tbl;
    end if;
  end loop;
end $$;


-- STEP 3: Verify — check user_id column is present on tasks table
select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'tasks'
order by ordinal_position;


-- STEP 4: Verify — check Realtime is enabled on all tables
select schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
order by tablename;

