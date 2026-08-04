-- ============================================================
-- Migration 012: Founder Analytics
-- analytics_events table + 9 SQL helper functions for the
-- Founder Dashboard. All aggregation functions are
-- SECURITY DEFINER so the admin client never needs direct
-- table SELECT rights on sensitive tables.
-- ============================================================

-- ── analytics_events ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS analytics_events (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  session_id   text        NOT NULL,
  event        text        NOT NULL,
  properties   jsonb       NOT NULL DEFAULT '{}',
  page_path    text,
  device_type  text,
  browser      text,
  os           text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_user_created
  ON analytics_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_event_created
  ON analytics_events (event, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_session
  ON analytics_events (session_id);
CREATE INDEX IF NOT EXISTS analytics_events_created
  ON analytics_events (created_at DESC);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can only insert their own authenticated events
DROP POLICY IF EXISTS "users_insert_own_events" ON analytics_events;
CREATE POLICY "users_insert_own_events" ON analytics_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all events directly (RPCs also bypass RLS)
DROP POLICY IF EXISTS "admins_read_events" ON analytics_events;
CREATE POLICY "admins_read_events" ON analytics_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND user_role IN ('admin', 'super_admin')
    )
  );

-- ── RPC: DAU / WAU / MAU ────────────────────────────────────

CREATE OR REPLACE FUNCTION get_active_user_counts()
RETURNS TABLE(dau bigint, wau bigint, mau bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(DISTINCT CASE WHEN created_at >= now() - INTERVAL '1 day'  THEN user_id END) AS dau,
    COUNT(DISTINCT CASE WHEN created_at >= now() - INTERVAL '7 days' THEN user_id END) AS wau,
    COUNT(DISTINCT CASE WHEN created_at >= now() - INTERVAL '30 days' THEN user_id END) AS mau
  FROM analytics_events
  WHERE user_id IS NOT NULL;
$$;

-- ── RPC: 30-day DAU trend ────────────────────────────────────

CREATE OR REPLACE FUNCTION get_dau_trend(days_back int DEFAULT 30)
RETURNS TABLE(trend_date date, dau bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    created_at::date AS trend_date,
    COUNT(DISTINCT user_id) AS dau
  FROM analytics_events
  WHERE created_at >= now() - (days_back || ' days')::interval
    AND user_id IS NOT NULL
  GROUP BY created_at::date
  ORDER BY trend_date;
$$;

-- ── RPC: Activation rate ─────────────────────────────────────
-- % of users (signed up in last 90 days) who created a trip
-- within 7 days of signing up.

CREATE OR REPLACE FUNCTION get_activation_rate()
RETURNS numeric
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ROUND(
    COUNT(DISTINCT t.user_id)::numeric
      / NULLIF(COUNT(DISTINCT p.id)::numeric, 0) * 100,
    1
  )
  FROM profiles p
  LEFT JOIN trips t
    ON t.user_id = p.id
   AND t.created_at <= p.created_at + INTERVAL '7 days'
  WHERE p.created_at >= now() - INTERVAL '90 days';
$$;

-- ── RPC: Retention (Day-7 and Day-30) ───────────────────────
-- Cohort = users who signed up at least 30 days ago.
-- Day-7  = had an event between days 6-8 after signup.
-- Day-30 = had an event between days 29-31 after signup.

CREATE OR REPLACE FUNCTION get_retention()
RETURNS TABLE(day7_pct numeric, day30_pct numeric)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
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
    ROUND(COUNT(DISTINCT d7.user_id)::numeric  / NULLIF(COUNT(DISTINCT c.id)::numeric, 0) * 100, 1) AS day7_pct,
    ROUND(COUNT(DISTINCT d30.user_id)::numeric / NULLIF(COUNT(DISTINCT c.id)::numeric, 0) * 100, 1) AS day30_pct
  FROM cohort c
  LEFT JOIN active_d7  d7  ON d7.user_id  = c.id
  LEFT JOIN active_d30 d30 ON d30.user_id = c.id;
$$;

-- ── RPC: User funnel ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_funnel_counts()
RETURNS TABLE(step text, user_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT step, user_count FROM (VALUES
    ('registered',
      (SELECT COUNT(*) FROM profiles)),
    ('onboarding_completed',
      (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE event = 'onboarding_completed')),
    ('trip_created',
      (SELECT COUNT(DISTINCT user_id) FROM trips)),
    ('feature_engaged',
      (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE event = 'feature_used')),
    ('active_last_7d',
      (SELECT COUNT(DISTINCT user_id) FROM analytics_events
       WHERE created_at >= now() - INTERVAL '7 days' AND user_id IS NOT NULL))
  ) AS t(step, user_count);
$$;

-- ── RPC: AI usage summary ─────────────────────────────────────

CREATE OR REPLACE FUNCTION get_ai_summary()
RETURNS TABLE(
  total_calls           bigint,
  calls_today           bigint,
  total_prompt_tokens   bigint,
  total_completion_tokens bigint,
  avg_latency_ms        numeric,
  success_rate          numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*)                                                                         AS total_calls,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)                               AS calls_today,
    COALESCE(SUM(prompt_tokens), 0)                                                  AS total_prompt_tokens,
    COALESCE(SUM(completion_tokens), 0)                                              AS total_completion_tokens,
    ROUND(AVG(latency_ms), 0)                                                        AS avg_latency_ms,
    ROUND(COUNT(*) FILTER (WHERE success)::numeric / NULLIF(COUNT(*), 0) * 100, 1)  AS success_rate
  FROM ai_usage_logs;
$$;

-- ── RPC: Top destinations ─────────────────────────────────────

CREATE OR REPLACE FUNCTION get_top_destinations(lim int DEFAULT 10)
RETURNS TABLE(destination text, country_code text, trip_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    destination,
    country_code,
    COUNT(*) AS trip_count
  FROM trips
  WHERE destination IS NOT NULL
    AND destination <> ''
  GROUP BY destination, country_code
  ORDER BY trip_count DESC
  LIMIT lim;
$$;

-- ── RPC: Device & browser breakdown ──────────────────────────

CREATE OR REPLACE FUNCTION get_device_breakdown()
RETURNS TABLE(device_type text, browser text, user_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(device_type, 'unknown') AS device_type,
    COALESCE(browser, 'unknown')     AS browser,
    COUNT(DISTINCT user_id)          AS user_count
  FROM analytics_events
  WHERE user_id IS NOT NULL
    AND created_at >= now() - INTERVAL '30 days'
  GROUP BY device_type, browser
  ORDER BY user_count DESC;
$$;

-- ── RPC: Feature adoption v2 (fixes travel_documents) ────────

CREATE OR REPLACE FUNCTION get_feature_adoption_v2()
RETURNS TABLE(feature text, adopters bigint, total_users bigint, pct numeric)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH total AS (SELECT COUNT(*) AS n FROM profiles)
  SELECT feature, adopters, total.n AS total_users,
         ROUND(adopters::numeric / NULLIF(total.n, 0) * 100, 1) AS pct
  FROM (
    SELECT 'Trips'            AS feature, COUNT(DISTINCT user_id) AS adopters FROM trips
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
  ) features
  CROSS JOIN total
  ORDER BY adopters DESC;
$$;

-- ── Grant execute to authenticated role ───────────────────────

GRANT EXECUTE ON FUNCTION get_active_user_counts()             TO authenticated;
GRANT EXECUTE ON FUNCTION get_dau_trend(int)                   TO authenticated;
GRANT EXECUTE ON FUNCTION get_activation_rate()                TO authenticated;
GRANT EXECUTE ON FUNCTION get_retention()                      TO authenticated;
GRANT EXECUTE ON FUNCTION get_funnel_counts()                  TO authenticated;
GRANT EXECUTE ON FUNCTION get_ai_summary()                     TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_destinations(int)            TO authenticated;
GRANT EXECUTE ON FUNCTION get_device_breakdown()               TO authenticated;
GRANT EXECUTE ON FUNCTION get_feature_adoption_v2()            TO authenticated;
