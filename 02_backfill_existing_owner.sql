-- ============================================================
-- STAGE 2: Migration Backfill Template
-- DO NOT ASSUME OWNERSHIP AUTOMATICALLY.
-- Replace 'PASTE_TARGET_USER_UUID_HERE' with the intended user UUID.
-- ============================================================

DO $$
DECLARE
  target_uid UUID := 'PASTE_TARGET_USER_UUID_HERE'::UUID; -- Replace with actual auth.users.id
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
  IF target_uid IS NOT NULL THEN
    FOREACH tbl IN ARRAY tables LOOP
      EXECUTE format('UPDATE public.%I SET user_id = %L WHERE user_id IS NULL;', tbl, target_uid);
    END LOOP;
  END IF;
END $$;
