"use client";

export default function TermsPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of terms</h2>
            <p>By accessing or using SwiftCity (www.swiftcity.xyz), you agree to be bound by these Terms of Service. If you do not agree, please do not use the site.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. What SwiftCity provides</h2>
            <p>SwiftCity is a travel discovery platform that publishes local recommendations submitted by verified contributors. We do not guarantee the accuracy, completeness, or current availability of any recommended place. Recommendations reflect the personal opinions of local contributors and not SwiftCity itself.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Reviewer accounts</h2>
            <p>To become a reviewer you must submit a valid government ID for verification. By submitting an ID you confirm it is genuine and belongs to you. Submitting false identification is grounds for immediate account termination and may be reported to relevant authorities.</p>
            <p className="mt-3">Approved reviewers must only submit recommendations for cities they currently reside in. Content must be accurate, original, and not copied from other sources.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Content you submit</h2>
            <p>By submitting recommendations, photos, or videos, you grant SwiftCity a non-exclusive, royalty-free, worldwide licence to display and distribute that content on the platform. You retain ownership of your content. You confirm you own or have the right to submit all content you upload.</p>
            <p className="mt-3">You must not submit content that is false, defamatory, offensive, infringing on third-party intellectual property, or in violation of any applicable law.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Purchases and payments</h2>
            <p>City plans are available as one-time purchases ($4.99 per city). All-access subscriptions are billed monthly ($9.99/month) and may be cancelled at any time — cancellation takes effect at the end of the current billing period.</p>
            <p className="mt-3">All payments are processed by Stripe. By purchasing, you agree to Stripe's Terms of Service. SwiftCity does not store payment card information.</p>
            <p className="mt-3"><strong>Refunds:</strong> Digital content (city plans) is non-refundable once accessed. If you have not accessed the plan content, contact us within 7 days of purchase for a refund.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Intellectual property</h2>
            <p>All site design, branding, curated itinerary content, and code is the intellectual property of SwiftCity. You may not reproduce, distribute, or create derivative works without written permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Limitation of liability</h2>
            <p>SwiftCity is provided "as is" without warranties of any kind. We are not liable for any losses arising from your use of the site, reliance on recommendations, or transactions with third parties discovered through the platform. Our total liability shall not exceed the amount you paid to SwiftCity in the 12 months preceding any claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Termination</h2>
            <p>We reserve the right to suspend or terminate any reviewer account that violates these terms, submits false information, or engages in behaviour that damages the platform or its users.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Governing law</h2>
            <p>These terms are governed by the laws of Kosovo / the Republic of Kosovo. Any disputes shall be resolved in the courts of Kosovo.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact</h2>
            <p>For questions about these terms: <strong>legal@swiftcity.xyz</strong></p>
          </section>

        </div>
      </div>
    </div>
  );
}