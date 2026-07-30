# ADR-003: Account deletion via delete_own_account() RPC

**Date:** 2026-07-30
**Status:** Accepted

---

## Context

GDPR Article 17 (right to erasure) and CCPA require that users can permanently delete
their accounts and all associated personal data. The database schema already includes
a `delete_own_account()` PostgreSQL function in migration `005_functions.sql`.
No UI existed to invoke it.

---

## Decision

Wire the existing `delete_own_account()` RPC to a dedicated confirmation dialog
accessible from Settings → Danger Zone.

**UX contract:**

1. The "Delete account" button is visually isolated in a red-bordered "Danger Zone"
   section, below the settings tabs, to prevent accidental discovery
2. Clicking it opens a modal (`DeleteAccountDialog`) — not an inline form
3. The user must type `DELETE` exactly to enable the confirm button — a typed phrase
   requires deliberate intent and cannot be mis-clicked
4. On success: `supabase.rpc('delete_own_account')` → `supabase.auth.signOut()` → navigate to `/`
5. On failure: an error toast is shown; the dialog remains open

**Implementation location:** `src/features/profile/components/DeleteAccountDialog.tsx`

The Radix `AlertDialog` component (already installed) was chosen over a custom modal
because it provides correct focus trapping, `aria-modal`, and keyboard dismissal out
of the box.

---

## Consequences

**Positive:**

- Satisfies GDPR Article 17 / CCPA right-to-erasure requirement
- Zero new dependencies — uses the existing RPC, Supabase client, Radix AlertDialog,
  and Sonner toasts
- The typed-phrase confirmation is industry standard (GitHub, Vercel, AWS all use it)
  and provides meaningful protection against accidental deletion
- The RPC runs with the user's own session, so RLS ensures it can only delete
  the caller's own data — no elevation of privilege

**Negative / trade-offs:**

- **No grace period / soft delete:** Deletion is immediate and permanent. There is
  no "you have 30 days to recover your account" flow. If a grace period is required
  in the future, the RPC must be changed to mark accounts as `pending_deletion`
  with a scheduler for cleanup — a schema change that would also require updating
  the UI here.
- **Storage buckets:** The `delete_own_account()` RPC deletes rows from the `profiles`
  and cascade-deleted tables, but Supabase Storage objects (`avatars/`, `receipts/`,
  `documents/`, `journal/`) are not automatically cleaned up by the RPC. A follow-up
  task is to either: (a) add storage cleanup to the RPC using `storage.objects` delete,
  or (b) run a scheduled Edge Function that deletes orphaned storage objects.

**Open tasks:**

- [ ] Verify `delete_own_account()` cascades correctly to all related tables
- [ ] Add storage object cleanup to the deletion flow
- [ ] Consider sending a confirmation email before or after deletion via Supabase Auth

---

## Alternatives Considered

**Client-side deletion (DELETE queries from the frontend)**
Would require the frontend to know and delete every table in the correct order to
respect foreign key constraints. Fragile as the schema evolves. Rejected in favour
of the server-side RPC which is schema-aware and runs in a single transaction.

**"Contact us to delete" flow**
Manual deletion is common but unacceptable for a product aiming for self-service.
The RPC already exists — there is no reason to add a manual process.

**Soft delete with recovery window**
The RPC currently hard-deletes. Adding a recovery window is a valid enhancement but
was deferred — it requires schema changes (an `is_deleted` flag + `deleted_at`
timestamp on `profiles`, updates to all RLS policies, and a cleanup job). This is
a separate sprint item.
