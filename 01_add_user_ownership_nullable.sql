-- ============================================================
-- STAGE 1: Safe Migration — Add Nullable user_id Columns
-- Run this FIRST on an existing database with non-empty tables.
-- ============================================================

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'subjects','chapters','topics','sessions','revisions','questions',
    'tests','mistakes','formulas','notes','tasks','habits','workouts',
    'meals','water_logs','nutrition_goals','sleep_logs','goals',
    'knowledge','transactions','budgets','settings','profile','study_sessions',
    'reflection_entries','motivation_quotes','motivation_notes',
    'motivation_collections','custom_motivation_categories',
    'integration_settings','notebooks','integration_logs',
    'health_records','attachments'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;', tbl);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_user_id ON public.%I(user_id);', tbl, tbl);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_user_sync ON public.%I(user_id, updated_at, deleted);', tbl, tbl);
  END LOOP;
END $$;
