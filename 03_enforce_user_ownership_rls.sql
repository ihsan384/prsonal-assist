-- ============================================================
-- STAGE 3: Auto-Backfill & Enforce NOT NULL & Strict RLS Policies
-- Safe execution script — automatically backfills orphaned rows
-- to the primary auth user before setting NOT NULL.
-- ============================================================

DO $$
DECLARE
  target_uid UUID;
  tbl text;
  null_count INT;
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
  -- Automatically fetch the first registered user from auth.users as default owner
  SELECT id INTO target_uid FROM auth.users ORDER BY created_at ASC LIMIT 1;

  FOREACH tbl IN ARRAY tables LOOP
    -- Ensure user_id column exists
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;', tbl);

    -- Auto-backfill any unowned NULL records to target_uid if available
    IF target_uid IS NOT NULL THEN
      EXECUTE format('UPDATE public.%I SET user_id = %L WHERE user_id IS NULL;', tbl, target_uid);
    END IF;

    -- Count remaining NULL rows
    EXECUTE format('SELECT count(*) FROM public.%I WHERE user_id IS NULL;', tbl) INTO null_count;

    -- Enforce NOT NULL constraint safely
    IF null_count = 0 THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN user_id SET NOT NULL;', tbl);
    ELSE
      RAISE NOTICE 'Skipped SET NOT NULL on table % because % NULL rows remain. Register a user in auth.users first.', tbl, null_count;
    END IF;

    -- Enable RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);

    -- Drop legacy policies
    EXECUTE format('DROP POLICY IF EXISTS authenticated_access_policy ON public.%I;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS user_isolation_policy ON public.%I;', tbl);

    -- Apply strict RLS policy
    EXECUTE format(
      'CREATE POLICY user_isolation_policy ON public.%I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);',
      tbl
    );
  END LOOP;
END $$;
