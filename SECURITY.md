# Security Policy

## Supported Versions

| Version         | Supported        |
| --------------- | ---------------- |
| Latest (`main`) | ✅ Active        |
| Older branches  | ❌ Not supported |

Only the latest commit on `main` receives security fixes.

---

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

If you discover a security issue in TravelMate, report it privately by emailing:

**saipavanetikala5@gmail.com**

Include in your report:

- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept (if available)
- Any suggested fix or mitigation you have in mind

You can expect an acknowledgement within **72 hours** and a status update within **7 days**.

---

## Security Architecture

### Key design decisions that protect user data

**No secrets in the client bundle**
All AI provider API keys (`GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`) and the hotel-search provider key (`HOTELS_API_KEY`, `HOTELS_API_HOST`) are stored exclusively in Supabase Edge Function secrets. The browser never communicates with these providers directly — it only calls `supabase.functions.invoke('ai-chat')` / `supabase.functions.invoke('hotels-search')`. There are no API keys in `.env.local`, frontend environment variables, or the browser bundle.

**Row Level Security on every table**
All PostgreSQL tables enforce RLS policies that restrict access to `user_id = auth.uid()`. Application-layer bugs cannot accidentally expose another user's data — the database rejects unauthorized queries before returning results.

**JWT verification on the Edge Functions**
Every request to the `ai-chat` and `hotels-search` Edge Functions is verified against the Supabase JWT before any external provider call is made.

**Content Security Policy**
A strict CSP is enforced via `vercel.json`. Only the exact third-party origins the application uses are allowlisted. AI provider hostnames are deliberately absent from `connect-src` — they are only reachable from the Edge Function, not the browser.

**No source maps in production**
`sourcemap: false` is set in `vite.config.ts`. Minified production bundles expose no source paths or logic.

**Additional HTTP security headers**

| Header                   | Value                                                 |
| ------------------------ | ----------------------------------------------------- |
| `X-Frame-Options`        | `DENY` — clickjacking prevention                      |
| `X-Content-Type-Options` | `nosniff` — MIME sniffing prevention                  |
| `Referrer-Policy`        | `strict-origin-when-cross-origin`                     |
| `Permissions-Policy`     | Camera and microphone disabled; geolocation self-only |

---

## Out of Scope

The following are **not** considered security vulnerabilities for this project:

- Issues in third-party dependencies that are already publicly disclosed and tracked upstream
- Missing `rate-limiting` on the AI Edge Function (a known future improvement)
- Self-XSS or attacks that require physical access to the victim's device
- Social engineering

---

## Disclosure Policy

Once a reported vulnerability is confirmed and a fix is released, a summary will be added to [CHANGELOG.md](CHANGELOG.md) under the relevant version. Credit will be given to the reporter unless they prefer to remain anonymous.
