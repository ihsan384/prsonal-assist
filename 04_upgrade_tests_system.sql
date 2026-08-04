-- ============================================================
-- SQL Migration 04: Upgrade Tests & Exams System
-- Safe execution script to generalize tests table and add subject/chapter breakdowns
-- ============================================================

-- 1. Upgrade existing `tests` table
CREATE TABLE IF NOT EXISTS public.tests (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  academic_profile_id TEXT,
  test_type TEXT NOT NULL DEFAULT 'MOCK_EXAM',
  test_name TEXT NOT NULL,
  test_date TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  exam_source TEXT,
  exam_name TEXT,
  score NUMERIC NOT NULL DEFAULT 0,
  max_score NUMERIC NOT NULL DEFAULT 100,
  percentage NUMERIC DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  attempted INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  wrong INTEGER DEFAULT 0,
  unattempted INTEGER DEFAULT 0,
  positive_marks NUMERIC DEFAULT 4,
  negative_marks NUMERIC DEFAULT 1,
  rank TEXT,
  total_candidates INTEGER,
  percentile NUMERIC,
  notes TEXT,

  -- Sync Metadata
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  last_synced_at TIMESTAMPTZ,
  deleted BOOLEAN DEFAULT false,
  sync_version INTEGER DEFAULT 1
);

-- Ensure newly added columns exist if table was already created
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS academic_profile_id TEXT;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS test_type TEXT NOT NULL DEFAULT 'MOCK_EXAM';
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS test_name TEXT;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS test_date TEXT;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS exam_source TEXT;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS exam_name TEXT;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS score NUMERIC DEFAULT 0;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS max_score NUMERIC DEFAULT 100;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS percentage NUMERIC DEFAULT 0;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS attempted INTEGER DEFAULT 0;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS correct INTEGER DEFAULT 0;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS wrong INTEGER DEFAULT 0;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS unattempted INTEGER DEFAULT 0;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS positive_marks NUMERIC DEFAULT 4;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS negative_marks NUMERIC DEFAULT 1;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS rank TEXT;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS total_candidates INTEGER;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS percentile NUMERIC;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS notes TEXT;

-- Migration/backfill for existing columns if legacy format exists:
DO $$
BEGIN
  -- Backfill test_name from legacy column 'name' if name exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tests' AND column_name = 'name') THEN
    UPDATE public.tests SET test_name = name WHERE test_name IS NULL AND name IS NOT NULL;
  END IF;
  
  -- Backfill score from legacy column 'solved_questions' or similar if score is 0
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tests' AND column_name = 'score_percentage') THEN
    UPDATE public.tests SET percentage = score_percentage WHERE percentage = 0 AND score_percentage IS NOT NULL;
  END IF;
END $$;

-- 2. Create `test_subject_results` table
CREATE TABLE IF NOT EXISTS public.test_subject_results (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
  score NUMERIC DEFAULT 0,
  max_score NUMERIC DEFAULT 100,
  total_questions INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  wrong INTEGER DEFAULT 0,
  unattempted INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Sync Metadata
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  last_synced_at TIMESTAMPTZ,
  deleted BOOLEAN DEFAULT false,
  sync_version INTEGER DEFAULT 1
);

-- 3. Create `test_chapter_results` table
CREATE TABLE IF NOT EXISTS public.test_chapter_results (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
  chapter_id TEXT REFERENCES public.chapters(id) ON DELETE SET NULL,
  score NUMERIC DEFAULT 0,
  max_score NUMERIC DEFAULT 100,
  total_questions INTEGER DEFAULT 0,
  attempted INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  wrong INTEGER DEFAULT 0,
  unattempted INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Sync Metadata
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  last_synced_at TIMESTAMPTZ,
  deleted BOOLEAN DEFAULT false,
  sync_version INTEGER DEFAULT 1
);

-- 4. Enable RLS on all test tables
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_subject_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_chapter_results ENABLE ROW LEVEL SECURITY;

-- Apply strict RLS policies
DROP POLICY IF EXISTS user_isolation_policy ON public.tests;
CREATE POLICY user_isolation_policy ON public.tests FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_isolation_policy ON public.test_subject_results;
CREATE POLICY user_isolation_policy ON public.test_subject_results FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_isolation_policy ON public.test_chapter_results;
CREATE POLICY user_isolation_policy ON public.test_chapter_results FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes for performant query filtering
CREATE INDEX IF NOT EXISTS idx_tests_user_id ON public.tests(user_id);
CREATE INDEX IF NOT EXISTS idx_tests_test_date ON public.tests(test_date);
CREATE INDEX IF NOT EXISTS idx_tests_test_type ON public.tests(test_type);
CREATE INDEX IF NOT EXISTS idx_test_subject_results_test_id ON public.test_subject_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_subject_results_subject_id ON public.test_subject_results(subject_id);
CREATE INDEX IF NOT EXISTS idx_test_chapter_results_test_id ON public.test_chapter_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_chapter_results_chapter_id ON public.test_chapter_results(chapter_id);
