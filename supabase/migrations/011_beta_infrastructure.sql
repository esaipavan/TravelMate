-- ============================================================
-- Migration 011: Private Beta infrastructure
-- Depends on: 003_admin_tables.sql, 004_rls_policies.sql
-- ============================================================

-- ── Extend feedback table ────────────────────────────────────────────────────
ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS rating   smallint CHECK (rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS page_url text;

-- ── Push notification subscriptions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint    text        NOT NULL,
  p256dh      text        NOT NULL,
  auth        text        NOT NULL,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON public.push_subscriptions (user_id);

-- RLS: users can only manage their own subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subscriptions"
  ON public.push_subscriptions
  FOR ALL
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow service role (Edge Functions) to read all subscriptions for push delivery
CREATE POLICY "Service role reads all push subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (auth.role() = 'service_role');

-- ── Beta feedback RLS (was missing from 004) ─────────────────────────────────
-- Allow authenticated users to insert their own feedback
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'feedback' AND policyname = 'Users can submit feedback'
  ) THEN
    ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can submit feedback"
      ON public.feedback
      FOR INSERT
      WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

    CREATE POLICY "Users can view own feedback"
      ON public.feedback
      FOR SELECT
      USING (user_id = auth.uid());

    CREATE POLICY "Admins manage all feedback"
      ON public.feedback
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
            AND user_role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;

-- Same for bug_reports
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'bug_reports' AND policyname = 'Users can submit bug reports'
  ) THEN
    ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can submit bug reports"
      ON public.bug_reports
      FOR INSERT
      WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

    CREATE POLICY "Admins manage all bug reports"
      ON public.bug_reports
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
            AND user_role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;
