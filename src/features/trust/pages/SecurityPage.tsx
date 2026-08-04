import { Shield, Lock, Database, Key, Eye, AlertTriangle } from 'lucide-react';
import { TrustLayout } from '../components/TrustLayout';

const PILLARS = [
  {
    icon: Lock,
    title: 'Transport Security',
    body: 'All traffic uses TLS 1.2+. HSTS is enforced with a one-year max-age. No unencrypted HTTP in production.',
  },
  {
    icon: Database,
    title: 'Row-Level Security',
    body: "Every database table has PostgreSQL RLS policies. A user's query physically cannot return another user's rows, even if the application code has a bug.",
  },
  {
    icon: Key,
    title: 'API Key Isolation',
    body: 'AI provider keys (Groq, Gemini, OpenRouter) live exclusively in server-side Edge Function secrets — never in client-side code or environment files.',
  },
  {
    icon: Eye,
    title: 'Minimal Permissions',
    body: 'The browser receives only the Supabase anon key, which has no elevated privileges. Admin endpoints require a server-side role check.',
  },
  {
    icon: Shield,
    title: 'CSP & Security Headers',
    body: 'A strict Content Security Policy, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, and Referrer-Policy: no-referrer are applied at the CDN edge.',
  },
  {
    icon: AlertTriangle,
    title: 'Error Telemetry',
    body: 'Unhandled JavaScript errors are captured to an internal bug_reports table (no third-party crash service receives your data). Reports are rate-limited and de-duplicated.',
  },
];

export default function SecurityPage() {
  return (
    <TrustLayout title="Security" lastUpdated="August 2026">
      <p className="text-base text-muted-foreground">
        Security is not a feature — it is part of the architecture. Here is a plain-English
        explanation of the controls in place during the Private Beta.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {PILLARS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border bg-card p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2>Responsible Disclosure</h2>
        <p>
          Found a vulnerability? Please report it to{' '}
          <a href="mailto:security@travelmate.app">security@travelmate.app</a> before disclosing
          publicly. We commit to acknowledging reports within 48 hours and resolving critical issues
          within 7 days during the beta period.
        </p>
        <p>We do not operate a bug bounty programme during the Private Beta.</p>
      </section>

      <section>
        <h2>Authentication</h2>
        <p>
          Authentication is handled by Supabase Auth (built on GoTrue). Passwords are hashed with
          bcrypt. OAuth logins (Google) never expose your OAuth token to our application code.
          Sessions are short-lived JWTs stored in an httpOnly-equivalent storage keyed to the
          domain.
        </p>
      </section>

      <section>
        <h2>Data in Transit &amp; at Rest</h2>
        <p>
          Data is encrypted in transit (TLS) and at rest (AES-256 at the Supabase/PostgreSQL layer).
          Storage buckets for documents and photos are private by default — all access requires a
          valid user session.
        </p>
      </section>
    </TrustLayout>
  );
}
