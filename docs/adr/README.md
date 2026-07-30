# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for TravelMate.

An ADR documents a significant architectural decision: the context that drove it,
what was decided, and the consequences — including trade-offs and alternatives that
were considered and rejected.

## Index

| ADR                                                   | Title                                             | Status   | Date       |
| ----------------------------------------------------- | ------------------------------------------------- | -------- | ---------- |
| [001](001-feature-flags-database-driven.md)           | Database-driven feature flags with TanStack Query | Accepted | 2026-07-30 |
| [002](002-error-telemetry-existing-infrastructure.md) | Error telemetry using existing bug_reports table  | Accepted | 2026-07-30 |
| [003](003-delete-account-rpc.md)                      | Account deletion via delete_own_account() RPC     | Accepted | 2026-07-30 |

## Format

Each ADR follows this structure:

- **Context** — why this decision was needed
- **Decision** — what was decided and how it was implemented
- **Consequences** — positive outcomes, negative trade-offs, and open questions
- **Alternatives Considered** — options evaluated and reasons for rejection

## Principles

Before creating a new ADR, verify whether existing infrastructure already satisfies
the requirement. Prefer extending the current architecture over introducing parallel
systems. When a new dependency is introduced, the ADR must explicitly justify why
existing infrastructure is insufficient.
