# Authenticated E2E Verification

How to run the authenticated Playwright suite that covers Explore/Nearby,
Save/Favorites, the Shirdi/Tirupathi geocoding-safety fixes, the Warangal
Fort image fix, Place Detail (Panel/Sheet) consistency, image attribution,
galleries, mobile viewports, and Add to Trip.

## Required environment variables

| Variable       | Required | Purpose                                                            |
| -------------- | -------- | ------------------------------------------------------------------ |
| `E2E_EMAIL`    | Yes      | Login email for a **dedicated, non-admin** Supabase test user      |
| `E2E_PASSWORD` | Yes      | Password for that same test user                                   |
| `E2E_BASE_URL` | No       | Point the suite at a deployed URL instead of a local build+preview |

Set these in your shell or CI secrets — **never** commit them, and never put
real values in `.env.example` or `.env.local` (see the commented block at the
bottom of `.env.example`).

The suite already fully supports `E2E_EMAIL`/`E2E_PASSWORD` — this is
pre-existing (`e2e/auth.setup.ts`), not something added in this pass. If
either is unset, `auth.setup.ts` throws immediately with that same message
instead of silently continuing unauthenticated.

## Provisioning the test user (must be done by a human, not Claude)

1. Supabase Dashboard → your project → Authentication → **Add user**.
2. Check **Auto Confirm User** (public self-signup requires clicking an email
   confirmation link first, which an automated script cannot do; auto-confirm
   skips that).
3. Leave it as a normal `user` role — never `admin`/`super_admin`.
4. Export the credentials as `E2E_EMAIL` / `E2E_PASSWORD` in your shell or CI
   secrets.

This is a hard policy boundary, not just a convenience: Claude is prohibited
from creating accounts, and the technical path to a pre-confirmed account
requires the Supabase **service-role key**, which is intentionally never
present in local env (it lives only in Edge Function secrets per
`CLAUDE.md`). See the `project_e2e_account` memory for the full history.

### Does the test account need seed data?

| Flow                                                        | Needs seed data beyond the bare account?                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Save/Favorites                                              | No — starts from whatever is already saved; tests clean up after themselves                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Shirdi / Tirupathi / Dwaraka Tirumala / Central Park search | No — pure geocoding, no account state                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Warangal Fort image + attribution                           | No                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Place Detail Panel/Sheet consistency                        | No                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Gallery                                                     | No (gracefully skips if a given run's result happens to have 0–1 verified photos)                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Mobile viewports (360/390/430px)                            | No                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Add to Trip — dialog opens correctly**                    | No — the test asserts the correct state either way (empty-state or trip list)                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Add to Trip — duplicate-in-day warning**                  | **Yes.** Exercising `AddToTripDialog`'s "Adding again will create a duplicate" banner needs the account to already have a trip with itinerary days, with this same place already added to one of them. This suite does **not** create that seed data automatically — doing so from an E2E script would mean fabricating production trip data outside the UI's own flows, which is out of scope here. If you want this specific banner covered, create one trip through the UI with the test account first. |

## Exact command

```bash
E2E_EMAIL=your-test-user@example.com E2E_PASSWORD=your-test-password npm run test:e2e
```

This builds the production bundle and serves it locally on port 4173
(`vite preview`), runs the `setup` project (logs in once, saves
`.auth/user.json`, gitignored), then runs the `chromium` and `mobile`
(Pixel 5) projects against that build. To target an already-deployed URL
instead of building locally:

```bash
E2E_BASE_URL=https://your-preview-or-prod-url E2E_EMAIL=... E2E_PASSWORD=... npm run test:e2e
```

To run a single new spec file only:

```bash
E2E_EMAIL=... E2E_PASSWORD=... npx playwright test e2e/save-favorites.spec.ts
```

## Spec files and what each verifies

| File                                   | Verifies                                                                                                                                                                                                                                                                                            |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `e2e/auth.setup.ts`                    | Real UI login as the test user; saves the authenticated session                                                                                                                                                                                                                                     |
| `e2e/helpers.ts`                       | Shared `search()`/`resultCards()`/`DENSE` helpers — not a test file itself                                                                                                                                                                                                                          |
| `e2e/explore.spec.ts`                  | Pre-existing: authenticated route access, map/clustering/selection/category filter, mobile smoke, stale-marker clearing, Near Me                                                                                                                                                                    |
| `e2e/save-favorites.spec.ts`           | **New.** Save survives a full page reload (proves account-level persistence, not just in-memory state); Unsave; rapid-double-click sends exactly one mutation (network-request-count assertion); a forced 500 on save shows an error toast instead of a silent no-op                                |
| `e2e/geocoding-safety.spec.ts`         | **New.** "Shirdi" resolves (not "Location not found"); "Tirupathi" shows the ambiguity picker and never silently lands on a single wrong place; "Dwaraka Tirumala" resolves directly; "Central Park" stays genuinely ambiguous                                                                      |
| `e2e/place-detail-consistency.spec.ts` | **New.** Warangal Fort's result card has a real, Wikipedia-attributed photo; Panel and Sheet show the same hierarchy/source-label/Save state and neither shows the stale "kept on this device" wording; gallery thumbnail switching (self-skips if a run's result has fewer than 2 verified photos) |
| `e2e/mobile-viewports.spec.ts`         | **New.** At exactly 360px/390px/430px: no horizontal document overflow, the favorite button is tappable, selecting a result opens the detail panel without the map disappearing underneath it                                                                                                       |
| `e2e/add-to-trip.spec.ts`              | **New.** The dialog always opens to a valid state (trip list or the correct empty state), never blank — see the seed-data note above for what's _not_ covered                                                                                                                                       |

## What remains impossible to verify without credentials (`AUTHENTICATED E2E REQUIRED`)

None of the above has ever actually been run against a live authenticated
session in this environment — Claude cannot create or use Supabase
credentials. Every one of these specs is currently **written and
type-checked, but unexecuted**. Until a human runs
`npm run test:e2e` with real `E2E_EMAIL`/`E2E_PASSWORD`:

- Save/Favorites persistence, error toast, and the race-guard fix
- Shirdi resolving correctly and Tirupathi staying safely ambiguous, in the
  real search UI (only unit-tested and live-API-tested outside the UI so far)
- The Warangal Fort image and its attribution link, rendered
- Place Detail Panel/Sheet consistency, rendered
- Gallery thumbnail switching, rendered
- Mobile layout at 360/390/430px, rendered
- Add to Trip's duplicate-warning banner specifically (also needs the seed
  data described above)

Do not treat this document, or the existence of these spec files, as proof
that these flows work — it only makes the eventual real run reproducible
with a single command.
