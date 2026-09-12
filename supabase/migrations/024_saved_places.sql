-- ============================================================
-- Migration 024: Saved places (Nearby "Save" / favorites)
-- Depends on: 002_core_tables.sql (auth.users FK pattern),
--             009_reminders.sql (RLS/grant pattern reused verbatim)
--
-- Account-level persistence for the Nearby feature's "Save" action. Replaces
-- the previous localStorage-only implementation
-- (src/features/nearby/hooks/useFavorites.ts), which never survived logout,
-- a browser data clear, or a different device/browser profile.
--
-- Stores a snapshot of the place (name/category/coordinates/locality) so a
-- saved place can be listed without a live Geoapify re-fetch. This snapshot
-- is the user's OWN saved data, not a live source of truth for the place
-- itself — never presented as "verified" beyond what the user chose to save.
-- ============================================================

CREATE TABLE public.saved_places (
  id          uuid             NOT NULL DEFAULT gen_random_uuid(),
  user_id     uuid             NOT NULL,
  place_id    text             NOT NULL, -- NearbyPlace.id (Geoapify place_id, or the service's fallback key)
  name        text             NOT NULL,
  category    text             NOT NULL,
  address     text,
  latitude    double precision NOT NULL,
  longitude   double precision NOT NULL,
  locality    text,
  district    text,
  state       text,
  country     text,
  created_at  timestamptz      NOT NULL DEFAULT now(),

  CONSTRAINT saved_places_pkey PRIMARY KEY (id),
  CONSTRAINT saved_places_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  -- One row per (user, place) — Save/Unsave is an insert-or-delete toggle,
  -- never a duplicate. Also lets the app upsert defensively without a
  -- separate existence check.
  CONSTRAINT saved_places_user_place_unique UNIQUE (user_id, place_id)
);

-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX saved_places_user_id_idx ON public.saved_places USING btree (user_id);

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY saved_places_select ON public.saved_places
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY saved_places_insert ON public.saved_places
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- No UPDATE policy: a saved place has no editable fields — it is either
-- present (insert) or absent (delete), matching the Save/Unsave toggle.

CREATE POLICY saved_places_delete ON public.saved_places
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ── Grants ────────────────────────────────────────────────────

GRANT SELECT, INSERT, DELETE ON public.saved_places TO authenticated;
GRANT ALL                    ON public.saved_places TO service_role;
