-- ============================================================
-- Migration 015: Security Hardening
-- Fixes:
--   CRIT-01 — profiles UPDATE RLS: block user_role self-escalation;
--              restore admin role management (was silently broken)
--   CRIT-06 — Add trip_briefs to supabase_realtime publication
--   HIGH-01  — Analytics RPCs: restrict to admins only
--   HIGH-10  — decline_invitation: verify caller is invitation recipient
-- ============================================================

-- ── CRIT-01: Profiles RLS ─────────────────────────────────────
-- Drop the existing policy that allowed users to update user_role.
DROP POLICY IF EXISTS "profiles: users update own" ON profiles;

-- Users may update their own profile but cannot change user_role.
-- WITH CHECK subquery reads the pre-update row value via MVCC snapshot.
CREATE POLICY "profiles: users update own" ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND user_role = (
      SELECT p.user_role FROM public.profiles p WHERE p.id = auth.uid()
    )
  );

-- Admins can update any profile (required for role management in admin.service.ts).
DROP POLICY IF EXISTS "profiles: admins update any" ON profiles;
CREATE POLICY "profiles: admins update any" ON profiles
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── CRIT-06: trip_briefs realtime publication ─────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'trip_briefs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_briefs;
  END IF;
END;
$$;

-- ── HIGH-01: Analytics RPCs — admin-only guard ────────────────
-- Converts all 9 functions from LANGUAGE sql → LANGUAGE plpgsql
-- so they can call is_admin() and RAISE EXCEPTION.

CREATE OR REPLACE FUNCTION get_active_user_counts()
RETURNS TABLE(dau bigint, wau bigint, mau bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN QUERY
  SELECT
    COUNT(DISTINCT CASE WHEN created_at >= now() - INTERVAL '1 day'   THEN user_id END)::bigint,
    COUNT(DISTINCT CASE WHEN created_at >= now() - INTERVAL '7 days'  THEN user_id END)::bigint,
    COUNT(DISTINCT CASE WHEN created_at >= now() - INTERVAL '30 days' THEN user_id END)::bigint
  FROM analytics_events
  WHERE user_id IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION get_dau_trend(days_back int DEFAULT 30)
RETURNS TABLE(trend_date date, dau bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN QUERY
  SELECT
    ae.created_at::date AS trend_date,
    COUNT(DISTINCT ae.user_id)::bigint AS dau
  FROM analytics_events ae
  WHERE ae.created_at >= now() - (days_back || ' days')::interval
    AND ae.user_id IS NOT NULL
  GROUP BY ae.created_at::date
  ORDER BY ae.created_at::date;
END;
$$;

CREATE OR REPLACE FUNCTION get_activation_rate()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result numeric;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = 'insufficient_privilege';
  END IF;
  SELECT ROUND(
    COUNT(DISTINCT t.user_id)::numeric
      / NULLIF(COUNT(DISTINCT p.id)::numeric, 0) * 100,
    1
  ) INTO result
  FROM profiles p
  LEFT JOIN trips t
    ON t.user_id = p.id
   AND t.created_at <= p.created_at + INTERVAL '7 days'
  WHERE p.created_at >= now() - INTERVAL '90 days';
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION get_retention()
RETURNS TABLE(day7_pct numeric, day30_pct numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN QUERY
  WITH cohort AS (
    SELECT id, created_at
    FROM profiles
    WHERE created_at <= now() - INTERVAL '30 days'
  ),
  active_d7 AS (
    SELECT DISTINCT ae.user_id
    FROM analytics_events ae
    JOIN cohort c ON ae.user_id = c.id
    WHERE ae.created_at BETWEEN c.created_at + INTERVAL '6 days'
                             AND c.created_at + INTERVAL '8 days'
  ),
  active_d30 AS (
    SELECT DISTINCT ae.user_id
    FROM analytics_events ae
    JOIN cohort c ON ae.user_id = c.id
    WHERE ae.created_at BETWEEN c.created_at + INTERVAL '29 days'
                              AND c.created_at + INTERVAL '31 days'
  )
  SELECT
    ROUND(COUNT(DISTINCT d7.user_id)::numeric  / NULLIF(COUNT(DISTINCT c.id)::numeric, 0) * 100, 1),
    ROUND(COUNT(DISTINCT d30.user_id)::numeric / NULLIF(COUNT(DISTINCT c.id)::numeric, 0) * 100, 1)
  FROM cohort c
  LEFT JOIN active_d7  d7  ON d7.user_id  = c.id
  LEFT JOIN active_d30 d30 ON d30.user_id = c.id;
END;
$$;

CREATE OR REPLACE FUNCTION get_funnel_counts()
RETURNS TABLE(step text, user_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN QUERY
  SELECT t.s, t.cnt FROM (VALUES
    ('registered'::text,
      (SELECT COUNT(*) FROM profiles)::bigint),
    ('onboarding_completed',
      (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE event = 'onboarding_completed')::bigint),
    ('trip_created',
      (SELECT COUNT(DISTINCT user_id) FROM trips)::bigint),
    ('feature_engaged',
      (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE event = 'feature_used')::bigint),
    ('active_last_7d',
      (SELECT COUNT(DISTINCT user_id) FROM analytics_events
       WHERE created_at >= now() - INTERVAL '7 days' AND user_id IS NOT NULL)::bigint)
  ) AS t(s, cnt);
END;
$$;

CREATE OR REPLACE FUNCTION get_ai_summary()
RETURNS TABLE(
  total_calls             bigint,
  calls_today             bigint,
  total_prompt_tokens     bigint,
  total_completion_tokens bigint,
  avg_latency_ms          numeric,
  success_rate            numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN QUERY
  SELECT
    COUNT(*)::bigint                                                                       AS total_calls,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)::bigint                            AS calls_today,
    COALESCE(SUM(prompt_tokens), 0)::bigint                                               AS total_prompt_tokens,
    COALESCE(SUM(completion_tokens), 0)::bigint                                           AS total_completion_tokens,
    ROUND(AVG(latency_ms), 0)                                                             AS avg_latency_ms,
    ROUND(COUNT(*) FILTER (WHERE success)::numeric / NULLIF(COUNT(*), 0) * 100, 1)       AS success_rate
  FROM ai_usage_logs;
END;
$$;

CREATE OR REPLACE FUNCTION get_top_destinations(lim int DEFAULT 10)
RETURNS TABLE(destination text, country_code text, trip_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN QUERY
  SELECT
    t.destination,
    t.country_code,
    COUNT(*)::bigint AS trip_count
  FROM trips t
  WHERE t.destination IS NOT NULL
    AND t.destination <> ''
  GROUP BY t.destination, t.country_code
  ORDER BY COUNT(*) DESC
  LIMIT lim;
END;
$$;

CREATE OR REPLACE FUNCTION get_device_breakdown()
RETURNS TABLE(device_type text, browser text, user_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN QUERY
  SELECT
    COALESCE(ae.device_type, 'unknown')  AS device_type,
    COALESCE(ae.browser, 'unknown')      AS browser,
    COUNT(DISTINCT ae.user_id)::bigint   AS user_count
  FROM analytics_events ae
  WHERE ae.user_id IS NOT NULL
    AND ae.created_at >= now() - INTERVAL '30 days'
  GROUP BY ae.device_type, ae.browser
  ORDER BY COUNT(DISTINCT ae.user_id) DESC;
END;
$$;

CREATE OR REPLACE FUNCTION get_feature_adoption_v2()
RETURNS TABLE(feature text, adopters bigint, total_users bigint, pct numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN QUERY
  WITH total AS (SELECT COUNT(*) AS n FROM profiles)
  SELECT
    f.feature,
    f.adopters,
    total.n::bigint AS total_users,
    ROUND(f.adopters::numeric / NULLIF(total.n, 0) * 100, 1) AS pct
  FROM (
    SELECT 'Trips'::text            AS feature, COUNT(DISTINCT user_id)::bigint AS adopters FROM trips
    UNION ALL
    SELECT 'AI Assistant',                COUNT(DISTINCT user_id) FROM ai_usage_logs
    UNION ALL
    SELECT 'Budget & Expenses',           COUNT(DISTINCT user_id) FROM expenses
    UNION ALL
    SELECT 'Journal',                     COUNT(DISTINCT user_id) FROM journal_entries
    UNION ALL
    SELECT 'Reminders',                   COUNT(DISTINCT user_id) FROM reminders
    UNION ALL
    SELECT 'Documents',                   COUNT(DISTINCT user_id) FROM travel_documents
    UNION ALL
    SELECT 'Collaboration',               COUNT(DISTINCT user_id) FROM trip_members
    UNION ALL
    SELECT 'Packing Lists',               COUNT(DISTINCT user_id) FROM packing_items
    UNION ALL
    SELECT 'Export',                      COUNT(DISTINCT user_id) FROM analytics_events
                                          WHERE event = 'export_downloaded'
  ) f
  CROSS JOIN total
  ORDER BY f.adopters DESC;
END;
$$;

-- ── Grant execute on analytics RPCs to authenticated ─────────
-- Re-applied here because migration 012's GRANT statements were
-- never executed (the SQL-language functions failed to create).

GRANT EXECUTE ON FUNCTION get_active_user_counts()             TO authenticated;
GRANT EXECUTE ON FUNCTION get_dau_trend(int)                   TO authenticated;
GRANT EXECUTE ON FUNCTION get_activation_rate()                TO authenticated;
GRANT EXECUTE ON FUNCTION get_retention()                      TO authenticated;
GRANT EXECUTE ON FUNCTION get_funnel_counts()                  TO authenticated;
GRANT EXECUTE ON FUNCTION get_ai_summary()                     TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_destinations(int)            TO authenticated;
GRANT EXECUTE ON FUNCTION get_device_breakdown()               TO authenticated;
GRANT EXECUTE ON FUNCTION get_feature_adoption_v2()            TO authenticated;

-- ── HIGH-10: decline_invitation — verify caller is recipient ──
-- Only applied if trip_invitations table exists. The table is created
-- by migration 010_group_collaboration.sql; if that migration had a
-- partial failure on this DB the table may be absent — skip safely.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'trip_invitations'
  ) THEN
    -- Can't use DECLARE with row type in dynamic SQL, so use EXECUTE
    -- to compile the function only when the table exists.
    EXECUTE $fn$
      CREATE OR REPLACE FUNCTION public.decline_invitation(p_token TEXT)
      RETURNS VOID
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $body$
      DECLARE
        v_inv_id   uuid;
        v_inv_email text;
      BEGIN
        SELECT id, invited_email INTO v_inv_id, v_inv_email
        FROM trip_invitations
        WHERE token = p_token AND status = 'pending'
        FOR UPDATE;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Invitation not found or already processed';
        END IF;

        IF v_inv_email IS DISTINCT FROM (
          SELECT email FROM auth.users WHERE id = auth.uid()
        ) THEN
          RAISE EXCEPTION 'Unauthorized: you are not the recipient of this invitation';
        END IF;

        UPDATE trip_invitations SET status = 'declined' WHERE id = v_inv_id;
      END;
      $body$
    $fn$;

    RAISE NOTICE 'decline_invitation function updated with recipient check.';
  ELSE
    RAISE NOTICE 'Skipping decline_invitation fix: trip_invitations table not found in this DB.';
  END IF;
END;
$$;
