# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server on port 5173
npm run build        # tsc + vite build (production)
npm run type-check   # tsc --noEmit (no emit, strict check)
npm run lint         # ESLint, zero warnings tolerance
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier over src/**/*.{ts,tsx,css}
npm run analyze      # build + open bundle visualizer (dist/stats.html)
```

There is no test runner — no vitest, jest, or similar is configured.

Deploy the Edge Function after changes:

```bash
supabase functions deploy ai-chat
```

Apply DB migrations:

```bash
supabase db push
```

## Architecture

### Entry Points

- `src/app/App.tsx` — root component; composes `Providers` + `AppRouter`
- `src/app/Providers.tsx` — QueryClientProvider, TooltipProvider, AuthInitializer, ThemeInitializer, PWAUpdatePrompt, Toaster, ReactQueryDevtools
- `src/app/Router.tsx` — `createBrowserRouter` with all routes; every page is `lazy()`-imported inside `<Suspense>` + `<ErrorBoundary>` via a local `<Wrap>` helper

### Route Guards

Four guards backed by `useAuthStore`: `RequireAuth`, `RequireAdmin`, `RequireSuperAdmin`, `RequireGuest`. Layout groups: `<PublicLayout>` for auth pages, `<AppLayout>` (sidebar + header) for all protected routes. Admin routes live at `/admin/*` behind `RequireAdmin`.

### Auth Flow

`src/store/auth.store.ts` — Zustand store holding `user`, `session`, `role`, `isAdmin`, `isSuperAdmin`, `isLoading`. `AuthInitializer` subscribes to `supabase.auth.onAuthStateChange` _before_ calling `getSession()` to avoid race conditions. `isLoading` stays `true` until `getSession().finally()` settles. Role is read from `profiles.user_role`; three roles: `'user'` | `'admin'` | `'super_admin'`.

### AI Service — Provider Decoupling (Critical Constraint)

**Application code never calls an AI provider SDK directly.** The only AI surface in the frontend is:

- `src/services/ai/ai.service.ts` — exports `chatWithAI` and `streamChatWithAI`, both call the `ai-chat` Supabase Edge Function via `supabase.functions.invoke`
- `VITE_AI_PROVIDER` in `.env.local` is a display label only; it has no effect on actual routing

The Edge Function (`supabase/functions/ai-chat/index.ts`, Deno) reads `AI_PROVIDER` from server-side secrets, verifies the Supabase JWT, dispatches to `GroqProvider` | `GeminiProvider` | `OpenRouterProvider`, and falls back (Groq → Gemini → OpenRouter). Every call is logged to `ai_usage_logs`. **API keys (`GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`) live exclusively in Supabase Edge Function secrets — never in `.env` files.**

### Supabase Client

`src/lib/supabase.ts` — single typed client `createClient<Database>()`. Auth storage key: `'travel-planner-auth'`. All DB types are auto-generated in `src/types/database.types.ts`. RLS enforced via `supabase/migrations/004_rls_policies.sql` — every query is automatically user-scoped. Storage buckets: `avatars`, `covers` (public); `receipts`, `documents`, `journal` (private).

### Data Fetching

`src/lib/queryClient.ts` — TanStack Query v5: `staleTime: 5 min`, `gcTime: 30 min`, `retry: 1`, `networkMode: 'offlineFirst'`, `refetchOnWindowFocus: false`. Every feature has its own `hooks/` folder with `useQuery`/`useMutation` wrappers over `src/features/<feature>/services/<feature>.service.ts`.

### Feature Slice Structure

`src/features/<feature>/` always contains: `components/`, `hooks/`, `pages/`, `services/`, `types.ts`. Import features only through their `pages/` layer from the router, or their `hooks/` layer from sibling features — never reach into another feature's `components/` or `services/` directly.

### Trip Status

`src/utils/tripStatus.ts` exports `getTripStatus(trip)` — the single source of truth for computing `'upcoming' | 'active' | 'completed' | 'cancelled'` from dates. Never compare `trip.status` (the DB column) for display logic; always use `getTripStatus`.

### Date Handling

Date-only strings from the DB (`YYYY-MM-DD`) must be parsed as local midnight, not UTC. Use `parseLocalDate` from `src/utils/formatters.ts` (appends `T00:00:00` before `parseISO`) instead of calling `parseISO` directly on a bare date string.

### Nearby Places

`src/features/nearby/services/nearby.service.ts` — geocodes via Nominatim (no key), then fetches from Geoapify Places API (`VITE_GEOAPIFY_API_KEY`). Category strings must match the Geoapify taxonomy exactly (see comments in file). The `CATEGORY_MAP` maps Geoapify prefix strings to `PlaceCategory` UI values.

### Animations

All animations use framer-motion. Every animated component must respect `useReducedMotion()` — pass `{}` as `initial` when `prefersReducedMotion` is true.

### Styling

Tailwind CSS with shadcn/ui primitives (`src/components/ui/`). Dynamic gradients and colors that can't be expressed as static Tailwind classes use inline `style` props (avoids JIT purge). Class sorting is enforced by `prettier-plugin-tailwindcss`.

## TypeScript Constraints

`strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`. Prefix intentionally unused parameters with `_`. ESLint enforces `import type` for all type-only imports (`consistent-type-imports: error`) and bans `console.log` (use `console.warn` or `console.error`; dev-only logs must be guarded by `if (import.meta.env.DEV)`).

## Environment Variables

| Variable                 | Purpose                                                         |
| ------------------------ | --------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL                                            |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (safe for browser; RLS enforces access)       |
| `VITE_GEOAPIFY_API_KEY`  | Geoapify Places API key (free tier, 3k req/day)                 |
| `VITE_AI_PROVIDER`       | Frontend display label only — does not affect actual AI routing |

Copy `.env.example` to `.env.local` to get started. `VITE_APP_URL` is intentionally omitted from `.env.local` — auth redirects use `window.location.origin` at runtime.

## Key File Locations

| What                           | Where                           |
| ------------------------------ | ------------------------------- |
| DB schema types                | `src/types/database.types.ts`   |
| Domain types (enums, shared)   | `src/types/index.ts`            |
| Supabase client                | `src/lib/supabase.ts`           |
| AI service (frontend only)     | `src/services/ai/ai.service.ts` |
| AI Edge Function               | `supabase/functions/ai-chat/`   |
| DB migrations                  | `supabase/migrations/`          |
| Shared formatters / date utils | `src/utils/formatters.ts`       |
| Trip status utility            | `src/utils/tripStatus.ts`       |
| Auth store                     | `src/store/auth.store.ts`       |
| Theme store                    | `src/store/theme.store.ts`      |
| Route definitions              | `src/app/Router.tsx`            |
| Security headers / CSP         | `vercel.json`                   |
