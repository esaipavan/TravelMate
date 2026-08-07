-- ============================================================
-- Migration 016: Forward Fix — Missing objects from 010-013
--
-- Migrations 010-013 are tracked as applied in schema_migrations
-- but their content was never executed on this database.
-- This migration idempotently creates all missing objects so
-- the live schema matches what those migrations intended.
--
-- Sections:
--   [010a] profiles.email column + handle_new_user update
--   [010b] Enums: trip_member_role, invitation_status
--   [010c] Tables: trip_members, trip_invitations, trip_activity_logs
--   [010d] Functions: is_trip_member, is_trip_editor, get_trip_member_role,
--                     get_invitation_by_token, accept_invitation,
--                     decline_invitation (HIGH-10 security fix)
--   [010e] RLS on new collaboration tables
--   [010f] Extended RLS on existing tables for shared-trip access
--   [010g] Activity log triggers
--   [011]  push_subscriptions table + RLS
--   [012]  analytics_events table + RLS
--   [013]  ai_conversations, ai_messages tables + RLS + trigger
-- ============================================================

-- ── [007 fix] Add super_admin to user_role_enum ──────────────
-- Migration 007 tracked as applied but ALTER TYPE never ran.
-- NOTE: ADD VALUE cannot use the new value in the same transaction.
--       is_admin() and is_super_admin() are updated in migration 017
--       after this transaction commits.
ALTER TYPE public.user_role_enum ADD VALUE IF NOT EXISTS 'super_admin';

-- ── [010a] profiles.email column ─────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Back-fill email from auth.users for existing accounts
UPDATE public.profiles p
SET    email = u.email
FROM   auth.users u
WHERE  u.id = p.id
  AND  p.email IS NULL;

-- Update handle_new_user to include email so future sign-ups populate it.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

-- ── [010b] Enums ──────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'trip_member_role' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.trip_member_role AS ENUM ('editor', 'viewer');
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'invitation_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
  END IF;
END;
$$;

-- ── [010c] Tables ─────────────────────────────────────────────

-- Non-owner trip members (trip owner stays in trips.user_id)
CREATE TABLE IF NOT EXISTS public.trip_members (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id     UUID        NOT NULL REFERENCES public.trips(id)    ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        public.trip_member_role NOT NULL DEFAULT 'viewer',
  invited_by  UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

CREATE INDEX IF NOT EXISTS trip_members_trip_id_idx ON public.trip_members(trip_id);
CREATE INDEX IF NOT EXISTS trip_members_user_id_idx ON public.trip_members(user_id);

-- Email-based invitations with secure random tokens
CREATE TABLE IF NOT EXISTS public.trip_invitations (
  id             UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id        UUID        NOT NULL REFERENCES public.trips(id)    ON DELETE CASCADE,
  invited_by     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_email  TEXT        NOT NULL,
  role           public.trip_member_role NOT NULL DEFAULT 'viewer',
  status         public.invitation_status NOT NULL DEFAULT 'pending',
  token          TEXT        UNIQUE NOT NULL DEFAULT (replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','')),
  expires_at     TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at    TIMESTAMPTZ
);

-- Unique partial index: one pending invite per (trip, email)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'trip_invitations' AND indexname = 'trip_invitations_unique_pending'
  ) THEN
    CREATE UNIQUE INDEX trip_invitations_unique_pending
      ON public.trip_invitations(trip_id, lower(invited_email))
      WHERE status = 'pending';
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS trip_invitations_token_idx ON public.trip_invitations(token);

-- Immutable append-only activity feed for shared trips
CREATE TABLE IF NOT EXISTS public.trip_activity_logs (
  id           UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id      UUID        NOT NULL REFERENCES public.trips(id)    ON DELETE CASCADE,
  user_id      UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  action       TEXT        NOT NULL,
  entity_type  TEXT,
  entity_id    TEXT,
  description  TEXT        NOT NULL,
  metadata     JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trip_activity_logs_trip_id_created_idx
  ON public.trip_activity_logs(trip_id, created_at DESC);

-- ── [010d] Functions ──────────────────────────────────────────

-- True if caller is the trip owner OR a non-owner member
CREATE OR REPLACE FUNCTION public.is_trip_member(p_trip_id UUID)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT
    EXISTS (SELECT 1 FROM trips WHERE id = p_trip_id AND user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM trip_members WHERE trip_id = p_trip_id AND user_id = auth.uid());
$$;

-- True if caller can write to the trip (owner or role='editor')
CREATE OR REPLACE FUNCTION public.is_trip_editor(p_trip_id UUID)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT
    EXISTS (SELECT 1 FROM trips WHERE id = p_trip_id AND user_id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_id = p_trip_id AND user_id = auth.uid() AND role = 'editor'
    );
$$;

-- Returns caller's effective role: 'owner' | 'editor' | 'viewer' | NULL
CREATE OR REPLACE FUNCTION public.get_trip_member_role(p_trip_id UUID)
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM trips WHERE id = p_trip_id AND user_id = auth.uid())
      THEN 'owner'
    ELSE (
      SELECT role::TEXT FROM trip_members
      WHERE trip_id = p_trip_id AND user_id = auth.uid()
    )
  END;
$$;

-- Public-readable invitation details via token (token is the secret; no auth required)
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(p_token TEXT)
RETURNS TABLE (
  id               UUID,
  trip_id          UUID,
  invited_email    TEXT,
  role             public.trip_member_role,
  status           public.invitation_status,
  expires_at       TIMESTAMPTZ,
  trip_title       TEXT,
  trip_destination TEXT,
  invited_by_name  TEXT
) LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT
    i.id,
    i.trip_id,
    i.invited_email,
    i.role,
    i.status,
    i.expires_at,
    t.title,
    t.destination,
    p.full_name
  FROM trip_invitations i
  JOIN trips t ON t.id = i.trip_id
  LEFT JOIN profiles p ON p.id = i.invited_by
  WHERE i.token = p_token;
$$;

-- Accept an invitation: inserts caller as trip member, marks invitation accepted
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_inv_id   uuid;
  v_inv_trip uuid;
  v_inv_role public.trip_member_role;
  v_inv_by   uuid;
  v_name     TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT id, trip_id, role, invited_by
  INTO v_inv_id, v_inv_trip, v_inv_role, v_inv_by
  FROM trip_invitations
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found, already used, or expired';
  END IF;

  -- Idempotent: if already a member, just update the invitation status
  INSERT INTO trip_members (trip_id, user_id, role, invited_by)
  VALUES (v_inv_trip, auth.uid(), v_inv_role, v_inv_by)
  ON CONFLICT (trip_id, user_id) DO NOTHING;

  UPDATE trip_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = v_inv_id;

  SELECT full_name INTO v_name FROM profiles WHERE id = auth.uid();

  INSERT INTO trip_activity_logs
    (trip_id, user_id, action, entity_type, entity_id, description)
  VALUES (
    v_inv_trip,
    auth.uid(),
    'member_joined',
    'trip_member',
    auth.uid()::TEXT,
    COALESCE(v_name, 'A new member') || ' joined the trip'
  );

  RETURN v_inv_trip;
END;
$$;

-- Decline an invitation — HIGH-10 security fix: verifies caller is the recipient
CREATE OR REPLACE FUNCTION public.decline_invitation(p_token TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_inv_id    uuid;
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
$$;

-- ── [010e] RLS on new collaboration tables ────────────────────

ALTER TABLE public.trip_members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_invitations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_activity_logs ENABLE ROW LEVEL SECURITY;

-- trip_members
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='trip_members' AND policyname='trip_members: members can read') THEN
    CREATE POLICY "trip_members: members can read"
      ON public.trip_members FOR SELECT
      USING (public.is_trip_member(trip_id));
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='trip_members' AND policyname='trip_members: owners manage') THEN
    CREATE POLICY "trip_members: owners manage"
      ON public.trip_members FOR ALL
      USING  (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid()))
      WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid()));
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='trip_members' AND policyname='trip_members: self remove') THEN
    CREATE POLICY "trip_members: self remove"
      ON public.trip_members FOR DELETE
      USING (user_id = auth.uid());
  END IF;
END;
$$;

-- trip_invitations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='trip_invitations' AND policyname='trip_invitations: members can read') THEN
    CREATE POLICY "trip_invitations: members can read"
      ON public.trip_invitations FOR SELECT
      USING (public.is_trip_member(trip_id));
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='trip_invitations' AND policyname='trip_invitations: editors create') THEN
    CREATE POLICY "trip_invitations: editors create"
      ON public.trip_invitations FOR INSERT
      WITH CHECK (public.is_trip_editor(trip_id) AND invited_by = auth.uid());
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='trip_invitations' AND policyname='trip_invitations: owner or inviter updates') THEN
    CREATE POLICY "trip_invitations: owner or inviter updates"
      ON public.trip_invitations FOR UPDATE
      USING (
        invited_by = auth.uid()
        OR EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid())
      );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='trip_invitations' AND policyname='trip_invitations: owner or inviter deletes') THEN
    CREATE POLICY "trip_invitations: owner or inviter deletes"
      ON public.trip_invitations FOR DELETE
      USING (
        invited_by = auth.uid()
        OR EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid())
      );
  END IF;
END;
$$;

-- trip_activity_logs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='trip_activity_logs' AND policyname='trip_activity_logs: members read') THEN
    CREATE POLICY "trip_activity_logs: members read"
      ON public.trip_activity_logs FOR SELECT
      USING (public.is_trip_member(trip_id));
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='trip_activity_logs' AND policyname='trip_activity_logs: members append') THEN
    CREATE POLICY "trip_activity_logs: members append"
      ON public.trip_activity_logs FOR INSERT
      WITH CHECK (public.is_trip_member(trip_id) AND user_id = auth.uid());
  END IF;
END;
$$;

-- ── [010f] Extended RLS on existing tables ────────────────────
-- Allows non-owner trip members to read/write data on shared trips.

-- trips: allow non-owner members to read the trip row
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='trips' AND policyname='trips: non-owner members read') THEN
    CREATE POLICY "trips: non-owner members read"
      ON public.trips FOR SELECT
      USING (
        EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = id AND user_id = auth.uid())
      );
  END IF;
END;
$$;

-- expenses: allow non-owner members to read
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='expenses' AND policyname='expenses: members read shared') THEN
    CREATE POLICY "expenses: members read shared"
      ON public.expenses FOR SELECT
      USING (
        EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = expenses.trip_id AND user_id = auth.uid())
      );
  END IF;
END;
$$;

-- expenses: allow editors to insert
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='expenses' AND policyname='expenses: editors insert shared') THEN
    CREATE POLICY "expenses: editors insert shared"
      ON public.expenses FOR INSERT
      WITH CHECK (public.is_trip_editor(trip_id) AND user_id = auth.uid());
  END IF;
END;
$$;

-- expenses: allow editors to update their own shared expenses
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='expenses' AND policyname='expenses: editors update own shared') THEN
    CREATE POLICY "expenses: editors update own shared"
      ON public.expenses FOR UPDATE
      USING (
        user_id = auth.uid()
        AND EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = expenses.trip_id AND user_id = auth.uid())
      );
  END IF;
END;
$$;

-- itinerary_days: members read
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='itinerary_days' AND policyname='itinerary_days: members read shared') THEN
    CREATE POLICY "itinerary_days: members read shared"
      ON public.itinerary_days FOR SELECT
      USING (
        EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = itinerary_days.trip_id AND user_id = auth.uid())
      );
  END IF;
END;
$$;

-- itinerary_days: editors insert
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='itinerary_days' AND policyname='itinerary_days: editors write shared') THEN
    CREATE POLICY "itinerary_days: editors write shared"
      ON public.itinerary_days FOR INSERT
      WITH CHECK (public.is_trip_editor(trip_id));
  END IF;
END;
$$;

-- itinerary_days: editors update
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='itinerary_days' AND policyname='itinerary_days: editors update shared') THEN
    CREATE POLICY "itinerary_days: editors update shared"
      ON public.itinerary_days FOR UPDATE
      USING (public.is_trip_editor(trip_id));
  END IF;
END;
$$;

-- itinerary_items: members read
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='itinerary_items' AND policyname='itinerary_items: members read shared') THEN
    CREATE POLICY "itinerary_items: members read shared"
      ON public.itinerary_items FOR SELECT
      USING (
        day_id IN (
          SELECT d.id FROM public.itinerary_days d
          JOIN public.trip_members tm ON tm.trip_id = d.trip_id
          WHERE tm.user_id = auth.uid()
        )
      );
  END IF;
END;
$$;

-- itinerary_items: editors insert
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='itinerary_items' AND policyname='itinerary_items: editors write shared') THEN
    CREATE POLICY "itinerary_items: editors write shared"
      ON public.itinerary_items FOR INSERT
      WITH CHECK (
        day_id IN (
          SELECT d.id FROM public.itinerary_days d
          WHERE public.is_trip_editor(d.trip_id)
        )
      );
  END IF;
END;
$$;

-- packing_items: members read
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='packing_items' AND policyname='packing_items: members read shared') THEN
    CREATE POLICY "packing_items: members read shared"
      ON public.packing_items FOR SELECT
      USING (
        EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = packing_items.trip_id AND user_id = auth.uid())
      );
  END IF;
END;
$$;

-- journal_entries: members read public entries on shared trips
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='journal_entries' AND policyname='journal_entries: members read shared') THEN
    CREATE POLICY "journal_entries: members read shared"
      ON public.journal_entries FOR SELECT
      USING (
        EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = journal_entries.trip_id AND user_id = auth.uid())
      );
  END IF;
END;
$$;

-- profiles: co-members can read each other's profiles (for name/avatar display)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles: co-members can read') THEN
    CREATE POLICY "profiles: co-members can read"
      ON public.profiles FOR SELECT
      USING (
        -- Fellow members of the same trip
        EXISTS (
          SELECT 1 FROM public.trip_members tm1
          JOIN public.trip_members tm2 ON tm1.trip_id = tm2.trip_id
          WHERE tm1.user_id = auth.uid() AND tm2.user_id = profiles.id
        )
        -- Members reading the trip owner's profile
        OR EXISTS (
          SELECT 1 FROM public.trips t
          JOIN public.trip_members tm ON tm.trip_id = t.id
          WHERE tm.user_id = auth.uid() AND t.user_id = profiles.id
        )
        -- Owners reading their members' profiles
        OR EXISTS (
          SELECT 1 FROM public.trips t
          JOIN public.trip_members tm ON tm.trip_id = t.id
          WHERE t.user_id = auth.uid() AND tm.user_id = profiles.id
        )
      );
  END IF;
END;
$$;

-- ── [010g] Activity log trigger functions and triggers ─────────

-- Logs expense creation for trips that have members
CREATE OR REPLACE FUNCTION public.log_expense_activity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM trip_members WHERE trip_id = NEW.trip_id) THEN
    INSERT INTO trip_activity_logs
      (trip_id, user_id, action, entity_type, entity_id, description, metadata)
    VALUES (
      NEW.trip_id,
      NEW.user_id,
      'expense_added',
      'expense',
      NEW.id::TEXT,
      'Added expense: ' || NEW.title
        || ' (' || NEW.currency || ' '
        || ROUND(NEW.amount::numeric, 2)::TEXT || ')',
      jsonb_build_object('amount', NEW.amount, 'category', NEW.category, 'currency', NEW.currency)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_log_expense_activity
  AFTER INSERT ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.log_expense_activity();

-- Logs itinerary item creation for trips that have members
CREATE OR REPLACE FUNCTION public.log_itinerary_activity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_trip_id UUID;
  v_actor   UUID;
BEGIN
  SELECT trip_id INTO v_trip_id FROM itinerary_days WHERE id = NEW.day_id;

  IF EXISTS (SELECT 1 FROM trip_members WHERE trip_id = v_trip_id) THEN
    SELECT user_id INTO v_actor FROM trips WHERE id = v_trip_id;

    INSERT INTO trip_activity_logs
      (trip_id, user_id, action, entity_type, entity_id, description)
    VALUES (
      v_trip_id,
      v_actor,
      'itinerary_item_added',
      'itinerary_item',
      NEW.id::TEXT,
      'Added to itinerary: ' || NEW.title
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_log_itinerary_activity
  AFTER INSERT ON public.itinerary_items
  FOR EACH ROW
  EXECUTE FUNCTION public.log_itinerary_activity();

-- ── [011] push_subscriptions ──────────────────────────────────

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint    TEXT        NOT NULL,
  p256dh      TEXT        NOT NULL,
  auth        TEXT        NOT NULL,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON public.push_subscriptions(user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='push_subscriptions' AND policyname='Users manage own push subscriptions') THEN
    CREATE POLICY "Users manage own push subscriptions"
      ON public.push_subscriptions FOR ALL
      USING  (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='push_subscriptions' AND policyname='Service role reads all push subscriptions') THEN
    CREATE POLICY "Service role reads all push subscriptions"
      ON public.push_subscriptions FOR SELECT
      USING (auth.role() = 'service_role');
  END IF;
END;
$$;

-- ── [012] analytics_events ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id  TEXT        NOT NULL,
  event       TEXT        NOT NULL,
  properties  JSONB       NOT NULL DEFAULT '{}',
  page_path   TEXT,
  device_type TEXT,
  browser     TEXT,
  os          TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_user_created
  ON public.analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_event_created
  ON public.analytics_events(event, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_session
  ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS analytics_events_created
  ON public.analytics_events(created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='analytics_events' AND policyname='users_insert_own_events') THEN
    CREATE POLICY "users_insert_own_events" ON public.analytics_events
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END;
$$;

-- Admins (and super_admins via is_admin()) can read all events.
-- Uses is_admin() so super_admin support is gained automatically when
-- migration 017 updates is_admin() to include 'super_admin'.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='analytics_events' AND policyname='admins_read_events') THEN
    CREATE POLICY "admins_read_events" ON public.analytics_events
      FOR SELECT
      USING (public.is_admin());
  END IF;
END;
$$;

-- ── [013] ai_conversations + ai_messages ──────────────────────

CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trip_id    UUID        REFERENCES public.trips(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role            TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages      ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ai_conversations' AND policyname='Users manage their own AI conversations') THEN
    CREATE POLICY "Users manage their own AI conversations"
      ON public.ai_conversations FOR ALL
      USING  (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ai_messages' AND policyname='Users access messages in their conversations') THEN
    CREATE POLICY "Users access messages in their conversations"
      ON public.ai_messages FOR ALL
      USING (
        conversation_id IN (SELECT id FROM public.ai_conversations WHERE user_id = auth.uid())
      )
      WITH CHECK (
        conversation_id IN (SELECT id FROM public.ai_conversations WHERE user_id = auth.uid())
      );
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS ai_conversations_user_trip
  ON public.ai_conversations(user_id, trip_id);

CREATE INDEX IF NOT EXISTS ai_messages_conv_created
  ON public.ai_messages(conversation_id, created_at);

-- Keeps ai_conversations.updated_at current when new messages are added
CREATE OR REPLACE FUNCTION public._touch_ai_conversation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.ai_conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_ai_message_touches_conversation
  AFTER INSERT ON public.ai_messages
  FOR EACH ROW EXECUTE FUNCTION public._touch_ai_conversation();
