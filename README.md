<div align="center">

<img src="public/icon-512.svg" alt="TravelMate logo" width="110" height="110" />

# ✈️ TravelMate

### Plan trips · Track expenses · Manage documents · Get AI-powered insights

A production-grade, full-stack travel management platform — fast, secure, and offline-capable.

<br />

[![Live Demo](https://img.shields.io/badge/🌐h_Live_Demo-Visit_App-4F46E5?style=for-the-badge&logo=vercel&logoColor=white)](https://travel-planner-saipavans-projects-32f9b141.vercel.app)

<br />

![Version](https://img.shields.io/badge/Version-2.0.0-4F46E5?style=flat-square)
![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
![CI](https://img.shields.io/github/actions/workflow/status/esaipavan/travel-planner/ci.yml?label=CI&style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## 🌐 Live Demo

**[👉 Open the live app](https://travel-planner-saipavans-projects-32f9b141.vercel.app)**

Sign in with Google or an email/password account. All data is fully isolated per user via Supabase Row Level Security.

---

## ✨ Features

|     | Feature                      | Description                                                                                                                                                   |
| :-: | :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 🧳  | **Trip Management**          | Create trips with destination, dates, budget, cover images, and status                                                                                        |
| 🗺️  | **Itinerary Builder**        | Day-by-day planner with drag-and-drop reordering                                                                                                              |
| 💸  | **Expense Tracking**         | Log expenses by category with budget vs. actual insights and analytics                                                                                        |
| 📄  | **Document Vault**           | Store travel documents with expiry tracking and AI health overview                                                                                            |
| ⏰  | **Reminders**                | Card, list, and calendar views with repeat patterns and snooze                                                                                                |
| 📔  | **Travel Journal**           | Trip diary with moods, star ratings, photos, and location tagging                                                                                             |
| 🌦️  | **Weather & Nearby**         | 7-day forecasts and Geoapify-powered nearby place search                                                                                                      |
| 💱  | **Currency Converter**       | Real-time exchange rates (30+ currencies via Frankfurter)                                                                                                     |
| 🤖  | **AI Travel Concierge**      | 8-tab AI assistant: morning briefs, budget coaching, itinerary optimiser, packing, food guide, safety, journal — provider-agnostic via Supabase Edge Function |
| 🌍  | **Destination Intelligence** | Country profiles, attractions, food, transport, safety, cost guides                                                                                           |
| 👥  | **Collaboration**            | Shared trip access with role-based permissions (owner/editor/viewer)                                                                                          |
| 📊  | **Analytics**                | 8 KPI cards and 6 chart types across all trips                                                                                                                |
| 📸  | **Memories**                 | Photo gallery across all journal entries                                                                                                                      |

---

## 🛠️ Tech Stack

- **Frontend:** React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 · Radix UI (shadcn/ui)
- **State:** TanStack Query v5 · Zustand
- **Routing / Forms:** React Router v6 · React Hook Form + Zod
- **Backend:** Supabase (PostgreSQL · Auth · Storage · Edge Functions)
- **PWA:** vite-plugin-pwa + Workbox
- **Hosting:** Vercel

---

## 📸 Screenshots

> _Add screenshots from the live deployment to showcase the app._

|   Dashboard   |  Trip Detail  |   Analytics   |
| :-----------: | :-----------: | :-----------: |
| _coming soon_ | _coming soon_ | _coming soon_ |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- A Supabase account (free tier is sufficient)
- Supabase CLI v2+

### Setup

```bash
# 1. Clone and install
git clone https://github.com/esaipavan/travel-planner.git
cd travel-planner
npm install

# 2. Apply database migrations
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push

# 3. Deploy the AI Edge Function and set secrets
supabase functions deploy ai-chat
supabase secrets set GROQ_API_KEY=gsk_...

# 4. Configure environment and start
cp .env.example .env.local   # add your Supabase URL and anon key
npm run dev                  # http://localhost:5173
```

Create Storage buckets in the Supabase Dashboard: `avatars`, `covers` (public); `receipts`, `documents`, `journal` (private).

---

## 🔑 Environment Variables

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME=TravelMate
VITE_AI_PROVIDER=groq
```

| Variable                 | Required    | Purpose                                                                              |
| ------------------------ | ----------- | ------------------------------------------------------------------------------------ |
| `VITE_SUPABASE_URL`      | ✅          | Supabase project URL                                                                 |
| `VITE_SUPABASE_ANON_KEY` | ✅          | Supabase anon key (safe for browser; RLS enforces access)                            |
| `VITE_GEOAPIFY_API_KEY`  | Recommended | Geoapify Places API key — free tier (3k req/day); Nearby feature disabled without it |
| `VITE_AI_PROVIDER`       | Optional    | Display label only (`groq` / `gemini` / `openrouter`). Defaults to `groq`.           |
| `VITE_APP_NAME`          | Optional    | App display name. Defaults to `TravelMate`.                                          |

AI provider API keys (`GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`) are **never stored in `.env.local`** — they are set exclusively as Supabase Edge Function secrets via `supabase secrets set`.

---

## 📜 Scripts

```bash
npm run dev        # Start dev server (port 5173)
npm run build      # tsc + Vite production build
npm run preview    # Preview production build locally
npm run lint       # ESLint (zero-warning tolerance)
npm run type-check # TypeScript strict check (no emit)
npm run lint:fix   # ESLint with auto-fix
npm run format     # Prettier over src/**/*.{ts,tsx,css}
npm run analyze    # Build + open bundle visualiser
```

### GitHub Actions CI/CD

Three workflows are included in `.github/workflows/`:

| Workflow      | Trigger                        | Steps                                      |
| ------------- | ------------------------------ | ------------------------------------------ |
| `ci.yml`      | Push / PR to `main`, `develop` | lint → type-check → build                  |
| `release.yml` | Push tag `v*.*.*`              | lint → type-check → build → GitHub Release |
| `preview.yml` | Pull Request                   | build → PR comment with chunk sizes        |

Add these repository secrets in **GitHub → Settings → Secrets → Actions**:
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEOAPIFY_API_KEY`, `VITE_APP_URL`

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

<div align="center">

**Built with React, TypeScript & Supabase — by [Sai Pavan Etikala](https://github.com/esaipavan)**

⭐ If you find this project useful, consider giving it a star!

</div>
