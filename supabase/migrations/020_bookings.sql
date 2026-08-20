-- ============================================================
-- Migration 020: Bookings table (hotel booking drafts)
-- Depends on: 002_core_tables.sql (profiles, trips),
--             008_grant_privileges.sql
--
-- Stores in-app booking drafts (currently hotels) scoped to the
-- signed-in user. `mode` keeps the table reusable for future
-- transport bookings (train/bus/flight/local) without a schema change.
-- ============================================================

-- ── Table ─────────────────────────────────────────────────────

CREATE TABLE public.bookings (
  id           uuid          NOT NULL DEFAULT gen_random_uuid(),
  user_id      uuid          NOT NULL,
  trip_id      uuid,
  mode         text          NOT NULL DEFAULT 'hotel',
  title        text          NOT NULL,
  subtitle     text,
  destination  text          NOT NULL,
  check_in     date,
  check_out    date,
  guests       integer,
  nights       integer       NOT NULL DEFAULT 1,
  unit_price   numeric(12,2) NOT NULL DEFAULT 0,
  total        numeric(12,2) NOT NULL DEFAULT 0,
  currency     char(3)       NOT NULL DEFAULT 'INR',
  status       text          NOT NULL DEFAULT 'draft',
  created_at   timestamptz   NOT NULL DEFAULT now(),
  updated_at   timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT bookings_trip_id_fkey
    FOREIGN KEY (trip_id) REFERENCES public.trips (id) ON DELETE SET NULL
);

-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX bookings_user_id_idx ON public.bookings USING btree (user_id);
CREATE INDEX bookings_trip_id_idx ON public.bookings USING btree (trip_id);
CREATE INDEX bookings_mode_idx    ON public.bookings USING btree (mode);

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY bookings_select ON public.bookings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY bookings_insert ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY bookings_update ON public.bookings
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY bookings_delete ON public.bookings
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ── Grants ────────────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL                            ON public.bookings TO service_role;
