-- ============================================================
-- Migration 021: Add start_time to bookings
-- Depends on: 020_bookings.sql
--
-- Persists the real start time from a transport search (train/bus/
-- flight departure, local pickup) so the trip itinerary can sort
-- within a day by actual time instead of a date-only heuristic.
-- Stored as 'HH:mm' local text — nullable, because date-only
-- bookings (hotels) legitimately have no time. Idempotent so it is
-- safe whether or not 020 has already been applied elsewhere.
-- ============================================================

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS start_time text;
