-- ============================================================
-- Migration 010: Group Collaboration
-- Enables multi-user trip sharing with invitations, members,
-- activity feed, and role-based permissions.
-- ============================================================

-- ── 0. Add email to profiles (needed for member display) ─────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Back-fill from auth.users for existing accounts
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id AND p.email IS NULL;

-- Keep email in sync when a new user is created
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

-- ── 1. Enums ──────────────────────────────────────────────────────────────────

CREATE TYPE public.trip_member_role AS ENUM ('editor', 'viewer');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- ── 2. New tables ─────────────────────────────────────────────────────────────

-- Non-owner trip members (the owner stays in trips.user_id)
CREATE TABLE public.trip_members (
  id          UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id     UUID NOT NULL REFERENCES public.trips(id)    ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        public.trip_member_role NOT NULL DEFAULT 'viewer',
  invited_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

CREATE INDEX trip_members_trip_id_idx ON public.trip_members(trip_id);
CREATE INDEX trip_members_user_id_idx ON public.trip_members(user_id);

-- Email-based invitations with secure random tokens
CREATE TABLE public.trip_invitations (
  id             UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id        UUID NOT NULL REFERENCES public.trips(id)    ON DELETE CASCADE,
  invited_by     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_email  TEXT NOT NULL,
  role           public.trip_member_role NOT NULL DEFAULT 'viewer',
  status         public.invitation_status NOT NULL DEFAULT 'pending',
  token          TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at     TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at    TIMESTAMPTZ
);

-- Only one pending invite per (trip, email) combination
CREATE UNIQUE INDEX trip_invitations_unique_pending
  ON public.trip_invitations(trip_id, lower(invited_email))
  WHERE (status = 'pending');

CREATE INDEX trip_invitations_token_idx ON public.trip_invitations(token);

-- Immutable append-only activity feed
CREATE TABLE public.trip_activity_logs (
  id           UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id      UUID NOT NULL REFERENCES public.trips(id)    ON DELETE CASCADE,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  entity_type  TEXT,
  entity_id    TEXT,
  description  TEXT NOT NULL,
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX trip_activity_logs_trip_id_created_idx
  ON public.trip_activity_logs(trip_id, created_at DESC);

-- ── 3. Helper functions (SECURITY DEFINER, used in RLS policies) ──────────────

-- True if the current user is the owner OR a non-owner member of the given trip
CREATE OR REPLACE FUNCTION public.is_trip_member(p_trip_id UUID)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT
    EXISTS (SELECT 1 FROM trips WHERE id = p_trip_id AND user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM trip_members WHERE trip_id = p_trip_id AND user_id = auth.uid());
$$;

-- True if the current user can write to the trip (owner or role='editor')
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

-- Returns the current user's effective role string for a trip
-- Returns: 'owner' | 'editor' | 'viewer' | NULL (not a member)
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

-- ── 4. SECURITY DEFINER RPCs (token-based invitation flow) ───────────────────

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

-- Accept an invitation — inserts the caller as a trip member, marks invitation accepted
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_inv   trip_invitations;
  v_name  TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_inv
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
  VALUES (v_inv.trip_id, auth.uid(), v_inv.role, v_inv.invited_by)
  ON CONFLICT (trip_id, user_id) DO NOTHING;

  UPDATE trip_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = v_inv.id;

  SELECT full_name INTO v_name FROM profiles WHERE id = auth.uid();

  INSERT INTO trip_activity_logs
    (trip_id, user_id, action, entity_type, entity_id, description)
  VALUES (
    v_inv.trip_id,
    auth.uid(),
    'member_joined',
    'trip_member',
    auth.uid()::TEXT,
    COALESCE(v_name, 'A new member') || ' joined the trip'
  );

  RETURN v_inv.trip_id;
END;
$$;

-- Decline an invitation
CREATE OR REPLACE FUNCTION public.decline_invitation(p_token TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_inv trip_invitations;
BEGIN
  SELECT * INTO v_inv
  FROM trip_invitations
  WHERE token = p_token AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found or already processed';
  END IF;

  UPDATE trip_invitations SET status = 'declined' WHERE id = v_inv.id;
END;
$$;

-- ── 5. RLS: New tables ────────────────────────────────────────────────────────

ALTER TABLE public.trip_members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_invitations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_activity_logs ENABLE ROW LEVEL SECURITY;

-- trip_members
CREATE POLICY "trip_members: members can read"
  ON public.trip_members FOR SELECT
  USING (public.is_trip_member(trip_id));

CREATE POLICY "trip_members: owners manage"
  ON public.trip_members FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid())
  );

-- Members can leave a trip (delete their own membership)
CREATE POLICY "trip_members: self remove"
  ON public.trip_members FOR DELETE
  USING (user_id = auth.uid());

-- trip_invitations
CREATE POLICY "trip_invitations: members can read"
  ON public.trip_invitations FOR SELECT
  USING (public.is_trip_member(trip_id));

CREATE POLICY "trip_invitations: editors create"
  ON public.trip_invitations FOR INSERT
  WITH CHECK (public.is_trip_editor(trip_id) AND invited_by = auth.uid());

CREATE POLICY "trip_invitations: owner or inviter updates"
  ON public.trip_invitations FOR UPDATE
  USING (
    invited_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid())
  );

CREATE POLICY "trip_invitations: owner or inviter deletes"
  ON public.trip_invitations FOR DELETE
  USING (
    invited_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND user_id = auth.uid())
  );

-- trip_activity_logs
CREATE POLICY "trip_activity_logs: members read"
  ON public.trip_activity_logs FOR SELECT
  USING (public.is_trip_member(trip_id));

CREATE POLICY "trip_activity_logs: members append"
  ON public.trip_activity_logs FOR INSERT
  WITH CHECK (public.is_trip_member(trip_id) AND user_id = auth.uid());

-- ── 6. RLS: Extend existing policies for shared-trip access ───────────────────

-- Allow non-owner members to SELECT the trip row
CREATE POLICY "trips: non-owner members read"
  ON public.trips FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.trip_members WHERE trip_id = id AND user_id = auth.uid())
  );

-- Allow non-owner members to SELECT expenses
CREATE POLICY "expenses: members read shared"
  ON public.expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members WHERE trip_id = expenses.trip_id AND user_id = auth.uid()
    )
  );

-- Allow editors to insert expenses on shared trips
CREATE POLICY "expenses: editors insert shared"
  ON public.expenses FOR INSERT
  WITH CHECK (
    public.is_trip_editor(trip_id) AND user_id = auth.uid()
  );

-- Allow editors to update their own expenses on shared trips
CREATE POLICY "expenses: editors update own shared"
  ON public.expenses FOR UPDATE
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.trip_members WHERE trip_id = expenses.trip_id AND user_id = auth.uid()
    )
  );

-- Allow members to read itinerary days
CREATE POLICY "itinerary_days: members read shared"
  ON public.itinerary_days FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members WHERE trip_id = itinerary_days.trip_id AND user_id = auth.uid()
    )
  );

-- Allow editors to create/update itinerary days
CREATE POLICY "itinerary_days: editors write shared"
  ON public.itinerary_days FOR INSERT
  WITH CHECK (public.is_trip_editor(trip_id));

CREATE POLICY "itinerary_days: editors update shared"
  ON public.itinerary_days FOR UPDATE
  USING (public.is_trip_editor(trip_id));

-- Allow members to read itinerary items (via their accessible days)
CREATE POLICY "itinerary_items: members read shared"
  ON public.itinerary_items FOR SELECT
  USING (
    day_id IN (
      SELECT d.id FROM public.itinerary_days d
      JOIN public.trip_members tm ON tm.trip_id = d.trip_id
      WHERE tm.user_id = auth.uid()
    )
  );

-- Allow editors to create itinerary items on shared trips
CREATE POLICY "itinerary_items: editors write shared"
  ON public.itinerary_items FOR INSERT
  WITH CHECK (
    day_id IN (
      SELECT d.id FROM public.itinerary_days d
      WHERE public.is_trip_editor(d.trip_id)
    )
  );

-- Allow members to read packing items
CREATE POLICY "packing_items: members read shared"
  ON public.packing_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members WHERE trip_id = packing_items.trip_id AND user_id = auth.uid()
    )
  );

-- Allow members to read public journal entries on shared trips
CREATE POLICY "journal_entries: members read shared"
  ON public.journal_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_members WHERE trip_id = journal_entries.trip_id AND user_id = auth.uid()
    )
  );

-- Allow trip members to read co-member profiles (for name/avatar display)
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

-- ── 7. Activity log triggers ──────────────────────────────────────────────────

-- Log expense creation (only for trips with members — solo trips don't need a feed)
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

-- Log itinerary item creation (only for trips with members)
CREATE OR REPLACE FUNCTION public.log_itinerary_activity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_trip_id UUID;
  v_actor   UUID;
BEGIN
  SELECT trip_id INTO v_trip_id FROM itinerary_days WHERE id = NEW.day_id;

  IF EXISTS (SELECT 1 FROM trip_members WHERE trip_id = v_trip_id) THEN
    -- itinerary_items has no user_id; attribute to the trip owner
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
