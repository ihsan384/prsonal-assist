-- ============================================================
-- Enable Supabase Realtime on all user data tables
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- This adds all user-data tables to the Supabase Realtime
-- publication so that postgres_changes WebSocket events are
-- broadcast to all connected devices logged in as the same user.

ALTER PUBLICATION supabase_realtime ADD TABLE
  -- Study ERP
  subjects,
  chapters,
  topics,
  sessions,
  revisions,
  questions,
  tests,
  test_subject_results,
  test_chapter_results,
  mistakes,
  formulas,
  notes,

  -- Daily Life
  tasks,
  habits,
  goals,
  workouts,
  meals,
  sleep_logs,
  water_logs,
  study_sessions,
  knowledge,
  transactions,
  budgets,

  -- Reflection & Motivation
  reflection_entries,
  motivation_quotes,
  motivation_notes,
  motivation_collections,
  custom_motivation_categories,

  -- Integrations & Misc
  integration_settings,
  notebooks,
  health_records,
  attachments,

  -- Curriculum (user-specific binding)
  user_subjects;

-- ============================================================
-- Verify which tables are now in the Realtime publication
-- Run this query after the above to confirm:
-- ============================================================

SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
