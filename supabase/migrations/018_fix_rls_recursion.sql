-- ============================================================
-- Migration 018: Fix RLS infinite recursion (PostgreSQL 42P17)
--
-- Migration 016 introduced a mutual RLS dependency between
-- `trips` and `trip_members`:
--
--   • "trips: non-owner members read"  (FOR SELECT)
--        USING EXISTS(SELECT 1 FROM trip_members ...)   -- queries trip_members
--   • "trip_members: owners manage"    (FOR ALL, so it ALSO applies to SELECT)
--        USING EXISTS(SELECT 1 FROM trips ...)          -- queries trips
--
--   Evaluating a SELECT on `trips` triggers the trip_members policy,
--   which triggers the trips policy again -> 42P17.
--
--   These two policies run in the *caller* (authenticated) context,
--   which is subject to RLS. The SECURITY DEFINER helper functions
--   (is_trip_member / is_trip_editor) are NOT the cause: they are owned
--   by `postgres` (rolbypassrls = true) and terminate cleanly.
--
-- Secondary bug fixed here:
--   "trips: non-owner members read" was written as
--     EXISTS(SELECT 1 FROM trip_members WHERE trip_id = id AND ...)
--   The unqualified `id` bound to trip_members.id (inner scope) instead
--   of trips.id, so the policy compared trip_members.trip_id = trip_members.id
--   and never actually matched a shared trip. Corrected below.
--
-- Strategy: route every cross-table check through SECURITY DEFINER
-- helper functions owned by `postgres` (which bypasses RLS), so no
-- policy evaluates another table's RLS in the caller context. This
-- makes the policy dependency graph acyclic while preserving the exact
-- collaboration permissions from migration 016.
--
-- Idempotent: safe to re-run (CREATE OR REPLACE / DROP POLICY IF EXISTS).
-- ============================================================

-- ── Helper functions (SECURITY DEFINER, owned by postgres → bypass RLS) ──
-- Non-recursive building blocks. Each queries exactly one table with
-- RLS bypassed, so calling them from a policy cannot re-enter RLS.

-- True if the caller owns the trip (trips.user_id). Queries only `trips`.
CREATE OR REPLACE FUNCTION public.is_trip_owner(p_trip_id UUID)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM trips
    WHERE id = p_trip_id AND user_id = auth.uid()
  );
$$;

-- True if the caller is a NON-owner member of the trip. Queries only
-- `trip_members` (never `trips`), so it cannot participate in the
-- trips <-> trip_members cycle.
CREATE OR REPLACE FUNCTION public.is_member_of_trip(p_trip_id UUID)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM trip_members
    WHERE trip_id = p_trip_id AND user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_trip_owner(UUID)    TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_member_of_trip(UUID) TO authenticated, anon;

-- ── trip_members policies ─────────────────────────────────────
-- Remove the recursive/over-broad policies from migration 016.
--   • "members can read"  -> replaced by explicit, non-recursive SELECT policies
--   • "owners manage" (FOR ALL) -> its USING/CHECK directly queried `trips`,
--     which (via "trips: non-owner members read") re-queried trip_members.
--     Replaced by write-only owner policies that route through is_trip_owner().

DROP POLICY IF EXISTS "trip_members: members can read" ON public.trip_members;
DROP POLICY IF EXISTS "trip_members: owners manage"    ON public.trip_members;

-- SELECT: a user can always read their own membership row (direct equality,
-- no cross-table reference — cannot recurse).
DROP POLICY IF EXISTS "trip_members: read own membership" ON public.trip_members;
CREATE POLICY "trip_members: read own membership"
  ON public.trip_members FOR SELECT
  USING (user_id = auth.uid());

-- SELECT: the trip owner can read every member row of their trips.
-- is_trip_owner() bypasses RLS, so this does not re-enter the trips policy.
DROP POLICY IF EXISTS "trip_members: owner reads members" ON public.trip_members;
CREATE POLICY "trip_members: owner reads members"
  ON public.trip_members FOR SELECT
  USING (public.is_trip_owner(trip_id));

-- SELECT: co-members can read each other's membership rows (preserves the
-- member-list visibility that the old is_trip_member() policy provided).
-- is_member_of_trip() bypasses RLS on trip_members, so no self-recursion.
DROP POLICY IF EXISTS "trip_members: co-members read" ON public.trip_members;
CREATE POLICY "trip_members: co-members read"
  ON public.trip_members FOR SELECT
  USING (public.is_member_of_trip(trip_id));

-- INSERT/UPDATE/DELETE: only the trip owner manages membership.
-- Routed through is_trip_owner() so the write path never directly
-- queries `trips` under RLS.
DROP POLICY IF EXISTS "trip_members: owner inserts" ON public.trip_members;
CREATE POLICY "trip_members: owner inserts"
  ON public.trip_members FOR INSERT
  WITH CHECK (public.is_trip_owner(trip_id));

DROP POLICY IF EXISTS "trip_members: owner updates" ON public.trip_members;
CREATE POLICY "trip_members: owner updates"
  ON public.trip_members FOR UPDATE
  USING (public.is_trip_owner(trip_id))
  WITH CHECK (public.is_trip_owner(trip_id));

DROP POLICY IF EXISTS "trip_members: owner deletes" ON public.trip_members;
CREATE POLICY "trip_members: owner deletes"
  ON public.trip_members FOR DELETE
  USING (public.is_trip_owner(trip_id));

-- NOTE: "trip_members: self remove" (FOR DELETE USING user_id = auth.uid())
-- from migration 016 is intentionally left in place — a member may still
-- remove themselves. It is OR-combined with "owner deletes".

-- ── trips policy ──────────────────────────────────────────────
-- Rewrite "trips: non-owner members read" to (a) break the recursion by
-- routing through is_member_of_trip() (bypasses RLS on trip_members) and
-- (b) fix the id-ambiguity bug (was trip_members.trip_id = trip_members.id).
-- `id` here is unambiguously trips.id (no inner subquery table in scope).

DROP POLICY IF EXISTS "trips: non-owner members read" ON public.trips;
CREATE POLICY "trips: non-owner members read"
  ON public.trips FOR SELECT
  USING (public.is_member_of_trip(id));

-- ============================================================
-- Post-conditions (unchanged, verified acyclic after this migration):
--   • trips SELECT   -> is_member_of_trip() [bypass] .......... terminates
--   • trip_members SELECT -> user_id=auth.uid() | is_trip_owner()
--         | is_member_of_trip()  [all bypass or direct] ....... terminates
--   • expenses / itinerary_days / itinerary_items / packing_items
--     / journal_entries / profiles policies query trip_members
--     and/or trips, both of which now terminate ............... no cycle
-- ============================================================
