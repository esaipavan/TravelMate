import { TrustLayout } from '../components/TrustLayout';

export default function TermsPage() {
  return (
    <TrustLayout title="Terms of Service" lastUpdated="August 2026">
      <section>
        <h2>1. Beta Program</h2>
        <p>
          You are accessing TravelMate as part of a Private Beta. The service is provided "as is"
          without warranty. Features may change, be removed, or be temporarily unavailable. We may
          limit access or shut down the beta at any time with reasonable notice.
        </p>
      </section>

      <section>
        <h2>2. Your Account</h2>
        <p>
          You are responsible for keeping your credentials secure. You must not share your account.
          You must be at least 16 years old to use TravelMate. One account per person.
        </p>
      </section>

      <section>
        <h2>3. Your Content</h2>
        <p>
          You own all content you create in TravelMate (trips, journals, documents). By uploading
          content you grant us a limited licence to store and display it for the purpose of
          providing the service. We do not claim ownership of your content.
        </p>
        <p>You may not upload content that is illegal, harmful, or infringes third-party rights.</p>
      </section>

      <section>
        <h2>4. AI Features</h2>
        <p>
          AI-generated suggestions are provided for convenience and may be inaccurate. Always verify
          travel information (prices, visa requirements, safety) from official sources. TravelMate
          is not liable for decisions made based on AI output.
        </p>
      </section>

      <section>
        <h2>5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Attempt to access other users' data.</li>
          <li>Reverse-engineer, scrape, or overload the service.</li>
          <li>Use the service for any unlawful purpose.</li>
        </ul>
      </section>

      <section>
        <h2>6. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, TravelMate is not liable for lost data, travel
          disruptions, or any indirect damages arising from use of the service. During the Beta
          period, we recommend exporting your data regularly.
        </p>
      </section>

      <section>
        <h2>7. Changes to These Terms</h2>
        <p>
          We may update these terms. We will notify beta users by email at least 14 days before
          material changes take effect.
        </p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>
          Legal queries: <a href="mailto:legal@travelmate.app">legal@travelmate.app</a>
        </p>
      </section>
    </TrustLayout>
  );
}
