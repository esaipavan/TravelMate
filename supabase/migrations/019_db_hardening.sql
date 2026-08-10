-- ============================================================
-- Migration 019: Database Security Hardening  (DRAFT — REVIEW ONLY)
--
-- Closes the remaining OPEN, live-database RLS findings from the
-- production audit:
--   HIGH-05 — ai_messages FOR ALL policy permits message tampering
--   HIGH-06 — packing_items: shared-trip editors cannot write
--   HIGH-07 — trip_budgets: shared-trip members cannot read
--   HIGH-08 — ai_conversations: no UNIQUE on (user_id, trip_id)
--   HIGH-09 — profiles: no INSERT policy (trigger-only creation)
--
-- Design constraints honoured:
--   * Idempotent — safe to re-run. Every policy is DROP ... IF EXISTS
--     before CREATE; the constraint is guarded by a catalog check.
--   * Every cross-table trip check uses the SECURITY DEFINER helpers
--     public.is_trip_member(uuid) / public.is_trip_editor(uuid)
--     (defined in migration 016). These bypass RLS internally, so no
--     policy re-enters trips / trip_members RLS — this avoids the
--     42P17 recursion class that migration 018 fixed. No inline EXISTS
--     against trips / trip_members is used anywhere below.
--   * Does NOT modify application code or any existing migration file.
--
-- HIGH-08 model: Option A — exactly one ai_conversations row per
--     (user_id, trip_id). The application-side dependency is now satisfied:
--     conversation.service.ts has been updated so getOrCreateConversation()
--     is race-safe (re-reads on 23505) and createNewConversation() resets the
--     existing conversation instead of inserting a second row. This migration
--     and that service change must ship together.
-- ============================================================

-- ── HIGH-05: ai_messages — replace FOR ALL with INSERT + SELECT + DELETE ──
-- Drops UPDATE capability (blocks post-hoc editing / tampering of message
-- content) while preserving INSERT (saveMessages) and DELETE
-- (clearConversation) that conversation.service.ts relies on. Ownership is
-- resolved through ai_conversations — a per-user table with no trips /
-- trip_members involvement, so there is no recursion concern here.

DROP POLICY IF EXISTS "Users access messages in their conversations" ON public.ai_messages;
DROP POLICY IF EXISTS "ai_messages: read own"   ON public.ai_messages;
DROP POLICY IF EXISTS "ai_messages: insert own" ON public.ai_messages;
DROP POLICY IF EXISTS "ai_messages: delete own" ON public.ai_messages;

CREATE POLICY "ai_messages: read own"
  ON public.ai_messages FOR SELECT
  USING (
    conversation_id IN (SELECT id FROM public.ai_conversations WHERE user_id = auth.uid())
  );

CREATE POLICY "ai_messages: insert own"
  ON public.ai_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (SELECT id FROM public.ai_conversations WHERE user_id = auth.uid())
  );

CREATE POLICY "ai_messages: delete own"
  ON public.ai_messages FOR DELETE
  USING (
    conversation_id IN (SELECT id FROM public.ai_conversations WHERE user_id = auth.uid())
  );

-- ── HIGH-06: packing_items — write access for shared-trip editors ──
-- Owner access is unchanged (existing "packing_items: owner of trip" [ALL]).
-- Editors (trip_members.role = 'editor') gain insert / update / delete via
-- the SECURITY DEFINER helper is_trip_editor(). Viewers remain read-only
-- through the existing "packing_items: members read shared" [SELECT].

DROP POLICY IF EXISTS "packing_items: editors insert shared" ON public.packing_items;
DROP POLICY IF EXISTS "packing_items: editors update shared" ON public.packing_items;
DROP POLICY IF EXISTS "packing_items: editors delete shared" ON public.packing_items;

CREATE POLICY "packing_items: editors insert shared"
  ON public.packing_items FOR INSERT
  WITH CHECK (public.is_trip_editor(trip_id));

CREATE POLICY "packing_items: editors update shared"
  ON public.packing_items FOR UPDATE
  USING (public.is_trip_editor(trip_id))
  WITH CHECK (public.is_trip_editor(trip_id));

CREATE POLICY "packing_items: editors delete shared"
  ON public.packing_items FOR DELETE
  USING (public.is_trip_editor(trip_id));

-- ── HIGH-07: trip_budgets — shared-trip access ──
-- Members (owner / editor / viewer) can read via is_trip_member(); editors
-- can write via is_trip_editor(). Owner access is unchanged (existing
-- "trip_budgets: owner of trip" [ALL]). The SELECT policy alone resolves the
-- literal finding (empty budget display on shared trips); the editor write
-- policies are added for collaboration parity with expenses / itinerary.

DROP POLICY IF EXISTS "trip_budgets: members read shared"   ON public.trip_budgets;
DROP POLICY IF EXISTS "trip_budgets: editors insert shared" ON public.trip_budgets;
DROP POLICY IF EXISTS "trip_budgets: editors update shared" ON public.trip_budgets;
DROP POLICY IF EXISTS "trip_budgets: editors delete shared" ON public.trip_budgets;

CREATE POLICY "trip_budgets: members read shared"
  ON public.trip_budgets FOR SELECT
  USING (public.is_trip_member(trip_id));

CREATE POLICY "trip_budgets: editors insert shared"
  ON public.trip_budgets FOR INSERT
  WITH CHECK (public.is_trip_editor(trip_id));

CREATE POLICY "trip_budgets: editors update shared"
  ON public.trip_budgets FOR UPDATE
  USING (public.is_trip_editor(trip_id))
  WITH CHECK (public.is_trip_editor(trip_id));

CREATE POLICY "trip_budgets: editors delete shared"
  ON public.trip_budgets FOR DELETE
  USING (public.is_trip_editor(trip_id));

-- ── HIGH-08: ai_conversations — one conversation per (user, trip) ──
-- NULLS NOT DISTINCT (PostgreSQL 15+) so a user's single non-trip
-- conversation (trip_id IS NULL) is also deduplicated. The table currently
-- holds 0 rows, so no back-fill / dedupe step is required.
--
-- APPLICATION: conversation.service.ts is already compatible (Option A) —
--     getOrCreateConversation() re-reads the winner on a 23505 race, and
--     createNewConversation() resets the existing conversation rather than
--     inserting a duplicate. Ship this migration together with that service
--     change.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class     t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'ai_conversations'
      AND c.conname = 'ai_conversations_user_trip_unique'
  ) THEN
    ALTER TABLE public.ai_conversations
      ADD CONSTRAINT ai_conversations_user_trip_unique
      UNIQUE NULLS NOT DISTINCT (user_id, trip_id);
  END IF;
END;
$$;

-- ── HIGH-09: profiles — self-INSERT fallback policy ──
-- Profile rows are normally created by the handle_new_user trigger
-- (SECURITY DEFINER). This adds a client-side fallback so a user can create
-- their own profile if the trigger ever fails to fire. A user can only
-- insert their own row (WITH CHECK id = auth.uid()); no cross-user creation.

DROP POLICY IF EXISTS "profiles: users insert own" ON public.profiles;

CREATE POLICY "profiles: users insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());
