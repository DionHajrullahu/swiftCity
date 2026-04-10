"use client";

export default function PrivacyPolicyPage() {
  return (
    <div
      className="min-h-screen bg-[#f2f0eb] py-16 px-4"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      <div className="max-w-3xl mx-auto">
        <a
          href="/"
          className="text-sm text-[#3bbfb3] hover:underline mb-8 inline-block"
        >
          ← Back to SwiftCity
        </a>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Who we are</h2>
            <p>SwiftCity ("we", "us", "our") operates the website at www.swiftcity.xyz. We help travelers discover authentic local recommendations from verified residents in cities around the world.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. What data we collect</h2>
            <p className="mb-3"><strong>Information you provide directly:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address and password when you apply to become a reviewer</li>
              <li>Your full name, city of residence, and a government-issued ID photo (for identity verification purposes only)</li>
              <li>Recommendations, photos, and videos you submit as a reviewer</li>
              <li>Email address when purchasing a city plan (processed by Stripe)</li>
            </ul>
            <p className="mt-3 mb-3"><strong>Information collected automatically:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usage data including pages visited, time spent, and interactions (via Google Analytics)</li>
              <li>Device type, browser, and approximate location (country/city level)</li>
              <li>IP address and session identifiers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How we use your data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To verify your identity as a local reviewer and manage your account</li>
              <li>To process payments for city plans and subscriptions via Stripe</li>
              <li>To display your approved recommendations to site visitors</li>
              <li>To improve the site using aggregated, anonymised analytics</li>
              <li>To communicate with you about your account or submissions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Third-party services</h2>
            <p>We use the following third-party services that may process your data under their own privacy policies:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Supabase</strong> — database and authentication hosting (EU and US servers)</li>
              <li><strong>Stripe</strong> — payment processing. SwiftCity never stores card details.</li>
              <li><strong>Amazon Web Services (S3)</strong> — secure storage of reviewer-uploaded media</li>
              <li><strong>Google Analytics / Google Tag Manager</strong> — anonymised usage analytics</li>
              <li><strong>Vercel</strong> — website hosting and deployment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. ID document storage</h2>
            <p>Government ID photos submitted during reviewer signup are stored securely in a private Supabase Storage bucket accessible only to SwiftCity administrators. They are used solely for identity verification, are never shared publicly or with third parties, and are deleted once verification is complete.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies</h2>
            <p>We use cookies and similar tracking technologies for analytics (Google Analytics) and to maintain your login session. You can control cookie settings in your browser. Disabling cookies may affect site functionality.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Your rights (GDPR/CCPA)</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Access the personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability — receive your data in a structured format</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at <strong>privacy@swiftcity.xyz</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Data retention</h2>
            <p>We retain account data for as long as your reviewer account is active. Payment records are retained for 7 years for legal and tax compliance. Analytics data is retained for 26 months. You may request deletion at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Changes to this policy</h2>
            <p>We may update this policy periodically. We will notify active reviewers of material changes by email. Continued use of the site after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact</h2>
            <p>For privacy-related questions: <strong>privacy@swiftcity.xyz</strong></p>
          </section>

        </div>
      </div>
    </div>
  );
}