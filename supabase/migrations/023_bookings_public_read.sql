-- ============================================================
-- Migration 023: Public read access for bookings on shared trips
-- Depends on: 020_bookings.sql, 004_rls_policies.sql
--
-- Mirrors the existing "public read shared trips" pattern (trips,
-- itinerary_days): when a trip is marked is_public, anyone — including
-- unauthenticated viewers — may READ its attached bookings so the
-- public read-only itinerary page can render. Owners keep full access
-- via the existing owner policies; write access is unchanged (no
-- public INSERT/UPDATE/DELETE). Idempotent.
-- ============================================================

DROP POLICY IF EXISTS bookings_public_select ON public.bookings;

CREATE POLICY bookings_public_select ON public.bookings
  FOR SELECT
  USING (
    trip_id IN (SELECT id FROM public.trips WHERE is_public = true)
  );

GRANT SELECT ON public.bookings TO anon;
