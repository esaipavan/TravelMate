import { TrustLayout } from '../components/TrustLayout';

export default function PrivacyPage() {
  return (
    <TrustLayout title="Privacy Policy" lastUpdated="August 2026">
      <section>
        <h2>1. What We Collect</h2>
        <p>TravelMate collects the minimum information needed to provide its service:</p>
        <ul>
          <li>
            <strong>Account data</strong> — name, email address, and avatar (optional) when you sign
            up.
          </li>
          <li>
            <strong>Trip data</strong> — destinations, dates, budgets, itineraries, expenses, and
            journal entries you create.
          </li>
          <li>
            <strong>Usage data</strong> — pages visited, features used, and anonymous performance
            metrics to improve the product.
          </li>
          <li>
            <strong>Device data</strong> — browser type and screen size to fix layout issues
            (collected only in bug reports you submit).
          </li>
        </ul>
        <p>We do not collect payment card data, government IDs, or financial account details.</p>
      </section>

      <section>
        <h2>2. How We Use Your Data</h2>
        <ul>
          <li>To provide and improve TravelMate features.</li>
          <li>To send transactional emails (password reset, invitation links).</li>
          <li>To respond to support requests and bug reports you submit.</li>
          <li>To understand which features are most useful and which need improvement.</li>
        </ul>
        <p>We never sell your personal data. We do not share it with advertisers.</p>
      </section>

      <section>
        <h2>3. Data Storage &amp; Security</h2>
        <p>
          Your data is stored in Supabase (PostgreSQL) with row-level security — each user can only
          access their own records. Data is encrypted at rest and in transit (TLS 1.2+). AI features
          route through server-side Edge Functions; your trip data is never sent directly to an AI
          provider without server-side mediation.
        </p>
      </section>

      <section>
        <h2>4. Cookies &amp; Tracking</h2>
        <p>
          TravelMate uses a single authentication cookie (<code>travel-planner-auth</code>) to
          maintain your session. Optional analytics (Google Analytics, Microsoft Clarity) are
          initialised only when the corresponding environment variables are set by the operator. No
          cross-site tracking cookies are set.
        </p>
      </section>

      <section>
        <h2>5. Data Retention</h2>
        <p>
          Your data is retained for as long as your account is active. You can export all your data
          from the Export page at any time. You can delete your account from Settings → Account →
          Delete Account, which permanently removes all your personal data within 30 days.
        </p>
      </section>

      <section>
        <h2>6. Your Rights</h2>
        <p>
          You have the right to access, correct, export, or delete your personal data. Contact us at
          the email below. For users in the EEA/UK, GDPR rights apply.
        </p>
      </section>

      <section>
        <h2>7. Contact</h2>
        <p>
          Privacy questions: <a href="mailto:privacy@travelmate.app">privacy@travelmate.app</a>
        </p>
      </section>
    </TrustLayout>
  );
}
