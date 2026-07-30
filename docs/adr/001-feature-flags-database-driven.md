# ADR-001: Database-driven feature flags with TanStack Query

**Date:** 2026-07-30
**Status:** Accepted

---

## Context

The product requires a mechanism to enable, disable, and gradually roll out features
without deploying new code. The existing database schema already includes a
`feature_flags` table with `is_enabled` (boolean) and `rollout_percentage` (0–100
integer) columns, administered by the existing admin UI at `/admin/flags`.

The requirement was to expose this data to React components through a stable,
cached, and fail-safe API.

---

## Decision

Implement a lightweight, query-only feature flag hook using the existing infrastructure:

- **Storage:** existing `feature_flags` Supabase table — no new table
- **Fetching:** TanStack Query (`useQuery`) — same client used by every other data fetch
- **Public API:** two hooks exported from `src/features/feature-flags/hooks/useFeatureFlags.ts`

```typescript
// Primary consumer API
useFeatureFlag(name: string): boolean

// Admin / debug listing
useFeatureFlags(): FeatureFlag[]
```

**Fail-closed contract:** if flags cannot be fetched (network error, auth failure,
or during the initial load), `useFeatureFlag` returns `false`. Features are off by
default — the safe state for a flag system.

**Cache configuration** deviates from the global queryClient defaults because flags
have different access patterns than user data:

| Setting   | Global default | Feature flags               |
| --------- | -------------- | --------------------------- |
| staleTime | 5 minutes      | 10 minutes                  |
| gcTime    | 30 minutes     | 60 minutes                  |
| retry     | 1              | 0 (fail closed immediately) |

**Partial rollouts** use FNV-1a (32-bit) hashing of `userId:flagName` to assign
each user to a deterministic bucket 0–99. The same user always lands in the same
bucket for the same flag, giving a consistent experience across sessions, devices,
and page reloads without requiring any server-side session state.

---

## Consequences

**Positive:**

- Zero new dependencies — leverages the existing DB table, Supabase client, and TanStack Query
- Admins can toggle and roll out features in real time without a deployment
- Fail-closed is the correct default for a feature flag system
- The FNV-1a bucket assignment is deterministic, stable, and cheap to compute
- Component code reads as `if (useFeatureFlag('my-feature'))` — readable and testable

**Negative / trade-offs:**

- Flag changes reach users after up to 10 minutes (stale time), not instantly.
  This is acceptable for operational flag changes; emergency kill-switches should
  use `rollout_percentage = 0` which is respected immediately on the next fetch.
- Anonymous users are excluded from partial rollouts (rollout_percentage 1–99)
  because they have no stable user ID for bucket assignment. They are included for
  100% rollouts.
- There is no client-side push mechanism — real-time flag changes require a page
  reload or waiting for the stale window to expire. This is sufficient for current
  scale; Supabase Realtime subscriptions on the flags table can be added later if
  sub-minute propagation becomes necessary.

**Open questions:**

- A TypeScript union type for known flag names (e.g., `type KnownFlag = 'group-travel' | 'ai-streaming'`)
  would enable compile-time checks. This is not implemented yet to avoid churn as
  flags are still being defined. Teams should register flag names here when stable.

---

## Alternatives Considered

**Hardcoded constants per deploy**
Simple but inflexible. Enabling a flag would require a code change and a full
deployment. Rejected because it defeats the purpose of a flag system.

**Environment variables (VITE_FEATURE\_*)**
Also hardcoded at build time. Variables would need to be set in CI/CD per
environment. Cannot be toggled without a redeploy. Rejected for the same reason.

**LaunchDarkly / Unleash / GrowthBook**
Third-party flag services with SDKs, dashboards, and real-time push. Powerful but
introduce: (1) a new external dependency, (2) another billing relationship, (3) data
leaving the product's infrastructure. The existing `feature_flags` table satisfies
current requirements with no additional cost or complexity. Revisit if real-time
propagation or multi-environment targeting becomes necessary at scale.
