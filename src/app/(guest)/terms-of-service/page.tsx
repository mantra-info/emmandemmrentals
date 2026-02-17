export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: February 17, 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Agreement</h2>
            <p>
              This is a sample Terms of Service document for demonstration purposes. By using this website, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Booking and Payment</h2>
            <p>
              Reservations are subject to availability and confirmation. Payment is required to complete booking, and pricing may include fees and taxes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Cancellations and Refunds</h2>
            <p>
              Refunds and cancellation outcomes depend on the cancellation policy shown at checkout and in listing details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Guest Responsibilities</h2>
            <p>
              Guests must follow house rules, occupancy limits, and all applicable laws during their stay.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Prohibited Conduct</h2>
            <p>
              Unauthorized parties, property damage, illegal activity, and misuse of services are prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Liability</h2>
            <p>
              To the maximum extent permitted by law, the platform disclaims indirect and consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Changes to Terms</h2>
            <p>
              Terms may be updated from time to time. Continued use after updates means acceptance of revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Contact</h2>
            <p>
              For legal or terms-related questions, contact: legal@example.com.
            </p>
          </section>

          <p className="text-sm text-gray-500 pt-4 border-t border-gray-200">
            Disclaimer: This page contains dummy content and is not legal advice.
          </p>
        </div>
      </div>
    </main>
  );
}

