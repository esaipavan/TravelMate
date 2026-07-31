# Changelog

All notable changes to TravelMate are documented here.

---

## [Unreleased]

- Push notifications via Web Push API
- Offline mutation queue with auto-sync
- E2E Playwright test suite

---

## [2.0.0] — 2026-07-30

### Sprint 4 — AI Travel Concierge

#### Added

- **AI Concierge** — 8-tab tabbed shell (Brief · Budget · Plan · Pack · Eat · Safe · Journal · Chat) replacing the single `CompanionDashboard`
- `useMorningBrief` — weather-fused morning brief with 12-hour AI cache
- `useSmartAlerts` — deterministic trip alerts (no AI call required)
- `useSafetyAdvisor` — deterministic safety data layer
- `useFoodGuide` — meal-time-aware food recommendations with 4-hour AI stale time
- `useBudgetAdvisor` — AI budget coaching with 1-hour stale time
- `usePackingAssistant` — AI packing checklist with 24-hour stale time
- `useItineraryOptimizer` — `useMutation`-based itinerary AI optimiser
- `useAIJournal` — journal entries with AI narrative generation
- All AI hooks use `chatWithAI()` → `supabase.functions.invoke('ai-chat')` exclusively

### Sprint 5 — Premium Polish

#### Design System

- `bg-gradient-premium` CSS utility token (`linear-gradient(135deg, hsl(237 72% 59%), hsl(271 77% 58%))`) replacing 14+ hardcoded `from-indigo-500 to-violet-500` patterns
- `text-gradient-premium` companion utility for gradient text
- All hardcoded `gray-*` / `slate-*` / `white` values replaced with semantic design tokens (`foreground`, `muted-foreground`, `card`, `muted`, `destructive`)
- `ErrorState` migrated from `rose-500` to `destructive` tokens
- `EmptyState` border radius upgraded to `rounded-2xl border-border/60`

#### Shared Components Created

- `src/features/auth/components/GoogleIcon.tsx` — extracted from 3 inline copies
- `src/features/auth/components/EmailSentState.tsx` — extracted from RegisterPage + ForgotPasswordPage
- `src/components/shared/DeleteConfirmDialog.tsx` — shared deletion confirmation dialog
- `src/hooks/useCountUp.ts` — canonical RAF cubic ease-out count-up hook (deleted 3 local duplicates)

#### Auth Pages

- LoginPage, AuthHubPage, RegisterPage — use shared `GoogleIcon`
- RegisterPage, ForgotPasswordPage — use shared `EmailSentState`
- OAuthCallbackPage — replaced inline spinner with `<PageLoader />`
- ResetPasswordPage — fully rewritten to glassmorphism style matching auth system

#### Error States

- `TripDetailPage`, `ExpensesPage`, `JournalPage`, `DestinationIntelPage` — replaced silent `<Navigate>` redirects with `<ErrorState onRetry={refetch}>` for all network errors
- `DestinationIntelPage` — fixed infinite-skeleton when intel data is null after loading

#### Empty States

- Empty-state containers across JournalPage (×2), ExpensesPage, RemindersPage (×2) — `rounded-2xl border-border/60`
- `ExpenseSkeleton` skeleton cards — `rounded-xl` (from `rounded-lg`)

#### Motion

- Page entrance animations (`PAGE_VARIANTS` + `rv()` + `useReducedMotion`) added to JournalPage, ExpensesPage, RemindersPage, DestinationIntelPage

#### CI/CD

- `.github/workflows/ci.yml` — lint + type-check + build on every push/PR with npm cache
- `.github/workflows/release.yml` — production build + GitHub Release on version tags
- `.github/workflows/preview.yml` — PR preview build with chunk-size comment

#### Package

- Version bumped `0.1.0` → `2.0.0`
- `@tanstack/react-query-devtools` moved from `dependencies` → `devDependencies`
- `VITE_GEOAPIFY_API_KEY` added to `vite-env.d.ts` type definitions

---

## [1.0.2] — 2026-07-18

### Fixed

- Nearby Places API integration — corrected Overpass API query and error handling

---

## [1.0.1] — 2026-07-17

### Fixed

- Mobile UX regressions on trip detail and expense log screens
- Production environment issues with Supabase auth redirect URLs

---

## [1.0.0] — 2026-07-17

### Added

- Full trip management with itinerary builder and drag-and-drop reordering (@dnd-kit)
- Expense tracking across 9 categories with budget visualization and over-budget alerts
- Document management with expiry tracking (Expiring Soon / Expired status)
- Travel journal with mood selection, star ratings, and photo uploads
- Reminders with Card, List, and Calendar views and repeat patterns
- Analytics dashboard: 8 KPI cards and 6 chart types (Area, Pie, Bar)
- AI assistant powered by a provider-agnostic Supabase Edge Function proxy (Groq → Gemini → OpenRouter fallback)
- Weather forecast via Open-Meteo (7-day, no API key required)
- Nearby places via OpenStreetMap Overpass API
- Currency converter via Frankfurter (30+ currencies)
- Destination intelligence: country profiles and Wikipedia summaries
- User profile with avatar upload stored in Supabase Storage
- Admin panel (role-gated): user management, feature flags, AI usage logs
- PWA: Workbox service worker pre-caching, offline shell, install prompt, sync indicator
- Google OAuth + email/password authentication via Supabase Auth
- Row Level Security enforced on all PostgreSQL tables
- Content Security Policy via vercel.json
- Lighthouse scores: 98 Performance / 100 Accessibility / 100 Best Practices / 92 SEO

### Performance

- Rollup manual chunking into 15+ named chunks with stable content hashes
- React.memo on KPICards, InsightsPanel, InsightCard, QuickActions
- Shared O(n) expense map replacing triple O(n×m) scans across analytics charts
- All 30+ routes are React.lazy() — zero authenticated code downloaded by unauthenticated users

### Security

- Zero AI provider API keys in client bundle — all keys stored in Supabase Edge Function secrets
- JWT verification on every AI chat request before any provider call
- No source maps in production build

---

## [0.9.0] — 2026-07-16

### Added

- Mobile responsiveness improvements across all feature pages
- Trip-scoped expense and checklist modules
- Reminders migration (migration 009)

### Added (earlier)

- Production security hardening: CSP, security headers, X-Frame-Options
- Bundle optimization and lazy-loading for all authenticated routes
- PWA support with Workbox and vite-plugin-pwa
- User Profile & Settings page with avatar management
- Analytics Dashboard with KPI cards and Recharts visualizations
- Supabase Storage integration for avatars, documents, and journal photos
