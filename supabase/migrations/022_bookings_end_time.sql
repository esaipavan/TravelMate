-- ============================================================
-- Migration 022: Add end_time to bookings
-- Depends on: 021_bookings_start_time.sql
--
-- Persists the arrival/end time from a transport search (train/bus/
-- flight arrival, local estimated ride end) so the itinerary can show
-- real spans, conflict detection can reason about connection windows,
-- and calendar export can emit timed durations instead of point events.
-- Stored as 'HH:mm' local text; when <= start_time the leg ends the
-- next day. Nullable — date-only bookings (hotels) have no end time.
-- Idempotent so it is safe whether or not prior migrations were applied.
-- ============================================================

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS end_time text;
