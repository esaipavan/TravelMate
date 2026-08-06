-- Migration: Onboarding 2.0 (v3)
-- Adds: trip_briefs table, destination_category/group_type/budget_tier on trips,
--       preferred_group_type/preferred_budget_tier/onboarding_version on profiles.

-- ── profiles alterations ──────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_group_type  TEXT,
  ADD COLUMN IF NOT EXISTS preferred_budget_tier TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_version    INTEGER DEFAULT 2;

-- ── trips alterations ─────────────────────────────────────────────────────────

ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS destination_category TEXT
    CHECK (destination_category IN (
      'hill_station','beach','pilgrimage','heritage','wildlife','international','custom'
    )),
  ADD COLUMN IF NOT EXISTS group_type TEXT
    CHECK (group_type IN (
      'solo','couple','friends','family','family_elders','business'
    )),
  ADD COLUMN IF NOT EXISTS budget_tier TEXT
    CHECK (budget_tier IN (
      'budget','comfort','premium','luxury'
    ));

-- ── trip_briefs table ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS trip_briefs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id         UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  generated_at    TIMESTAMPTZ DEFAULT now(),
  prompt_version  INTEGER DEFAULT 1,
  status          TEXT DEFAULT 'generating'
                    CHECK (status IN ('generating', 'complete', 'failed')),
  trip_summary        TEXT,
  day_one_itinerary   JSONB,
  weather_summary     JSONB,
  packing_checklist   JSONB,
  required_documents  JSONB,
  permits             JSONB,
  darshan_info        JSONB,
  emergency_contacts  JSONB,
  budget_estimate     JSONB,
  local_transport     JSONB,
  hotel_suggestions   JSONB,
  food_recommendations JSONB,
  safety_advice       TEXT,
  error_message       TEXT
);

-- ── RLS for trip_briefs ───────────────────────────────────────────────────────

ALTER TABLE trip_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own trip briefs"
  ON trip_briefs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trip briefs"
  ON trip_briefs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trip briefs"
  ON trip_briefs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trip briefs"
  ON trip_briefs FOR DELETE
  USING (auth.uid() = user_id);

-- ── Index for fast trip_briefs lookup ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS trip_briefs_user_id_idx ON trip_briefs (user_id);
