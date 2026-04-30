import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3 flex items-center gap-2">
      <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block" />
      {title}
    </h2>
    <div className="text-stone-600 dark:text-stone-400 space-y-3 leading-relaxed pl-4">{children}</div>
  </section>
);

export default function Privacy() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 md:p-12 border border-stone-200 dark:border-stone-800 shadow-sm"
        >
          <div className="mb-8 flex items-center gap-4">
            <img src="/logo/icon-only.svg" alt="PunyaSeva" className="h-12 w-auto" />
            <div className="w-px h-10 bg-stone-200 dark:bg-stone-700" />
            <Shield className="text-amber-500" size={28} />
          </div>

          <h1 className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-2">Privacy Policy</h1>
          <p className="text-stone-500 dark:text-stone-400 mb-10 text-sm">Effective Date: 1 April 2026 · Last Updated: 30 April 2026</p>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 mb-8">
            <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">
              Your privacy matters to us. PunyaSeva is committed to protecting your personal data and being transparent about how we collect and use it. This policy explains your rights and our practices under the Information Technology Act 2000, IT (Reasonable Security Practices) Rules 2011, and applicable data protection standards.
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">

            <Section title="1. Information We Collect">
              <p><strong>Account Information:</strong> Name, email address, phone number, and password (stored as a bcrypt hash — never in plain text) when you register.</p>
              <p><strong>Profile Data:</strong> Profile photo, date of birth, preferred language, and spiritual preferences you optionally provide.</p>
              <p><strong>Transaction Data:</strong> Booking details, order history, payment method type (card/UPI), and billing address. Full card numbers are never stored — all payment processing is handled by Stripe.</p>
              <p><strong>Usage Data:</strong> Pages visited, features used, search queries, device type, browser, IP address, and approximate location (city-level) collected automatically via server logs and analytics.</p>
              <p><strong>Communication Data:</strong> Messages sent to our support team, feedback, and reviews you submit.</p>
              <p><strong>Device Tokens:</strong> Firebase Cloud Messaging (FCM) tokens for push notifications, collected only with your explicit permission.</p>
            </Section>

            <Section title="2. How We Use Your Information">
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>To create and manage your account</li>
                <li>To process puja bookings, orders, and payments</li>
                <li>To send booking confirmations, order updates, and receipts via email or WhatsApp</li>
                <li>To send push notifications about bookings, offers, and festivals (only if you opt in)</li>
                <li>To personalise your experience and recommend relevant services</li>
                <li>To analyse and improve the Platform's features and performance</li>
                <li>To detect, prevent, and address fraud and security incidents</li>
                <li>To comply with legal obligations under Indian law</li>
              </ul>
              <p className="mt-2">We do not sell your personal data to third parties.</p>
            </Section>

            <Section title="3. Cookies and Tracking">
              <p>We use the following types of cookies:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Essential Cookies:</strong> Required for authentication (secure httpOnly session cookie) and basic platform functionality. Cannot be disabled.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use the Platform (e.g., pages viewed, session duration). Used with your consent.</li>
                <li><strong>Preference Cookies:</strong> Store your language and theme preferences. Used with your consent.</li>
              </ul>
              <p className="mt-2">You can manage cookie preferences via the cookie consent banner or your browser settings. Disabling non-essential cookies will not affect core functionality.</p>
            </Section>

            <Section title="4. Data Sharing">
              <p>We share your data only in the following circumstances:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Service Providers:</strong> Stripe (payment processing), Firebase / Google (push notifications, analytics), AWS (cloud hosting). All providers are bound by data processing agreements.</li>
                <li><strong>Temple and Pandit Partners:</strong> Booking details (name, contact, puja requirements) shared with the service provider you book with.</li>
                <li><strong>Legal Compliance:</strong> When required by law, court order, or government authority under Indian law.</li>
                <li><strong>Business Transfer:</strong> In the event of a merger or acquisition, your data may be transferred. You will be notified 30 days in advance.</li>
              </ul>
            </Section>

            <Section title="5. Data Retention">
              <p>We retain your account data for as long as your account is active. Transaction records are retained for 7 years as required by Indian financial regulations.</p>
              <p>You may request deletion of your account and associated data at any time (see Section 7). Note that records required for legal compliance will be retained even after account deletion.</p>
            </Section>

            <Section title="6. Data Security">
              <p>We implement the following security measures to protect your data:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>All data in transit is encrypted via TLS 1.2+ (HTTPS enforced via Cloudflare)</li>
                <li>Passwords are hashed using bcrypt with a cost factor of 12</li>
                <li>Authentication tokens are stored as httpOnly secure cookies (not accessible via JavaScript)</li>
                <li>Database access is restricted to localhost only (no public MySQL port)</li>
                <li>API rate limiting on authentication endpoints to prevent brute-force attacks</li>
                <li>Regular npm dependency audits for known vulnerabilities</li>
              </ul>
              <p className="mt-2">Despite these measures, no system is 100% secure. If you suspect a security breach, contact us at <strong>security@punyaseva.in</strong> immediately.</p>
            </Section>

            <Section title="7. Your Rights">
              <p>Under applicable Indian law and our commitment to user privacy, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your account and personal data</li>
                <li><strong>Portability:</strong> Request your data in a structured, machine-readable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for cookies and notifications at any time</li>
              </ul>
              <p className="mt-2">To exercise any of these rights, email <strong>privacy@punyaseva.in</strong>. We will respond within 30 days.</p>
            </Section>

            <Section title="8. Children's Privacy">
              <p>PunyaSeva is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with their data, please contact us and we will delete it promptly.</p>
            </Section>

            <Section title="9. Third-Party Links">
              <p>The Platform may contain links to third-party websites (e.g., temple official sites, payment gateways). This Privacy Policy does not apply to those sites. We recommend reviewing their privacy policies before providing any personal information.</p>
            </Section>

            <Section title="10. Changes to This Policy">
              <p>We may update this Privacy Policy periodically. The updated policy will be posted on this page with a revised "Last Updated" date. Material changes will be communicated to registered users via email at least 15 days before they take effect.</p>
            </Section>

            <Section title="11. Grievance Redressal">
              <p>In accordance with the Information Technology Act 2000 and IT Rules 2011, a Grievance Officer has been appointed:</p>
              <ul className="list-none space-y-1 mt-2">
                <li><strong>Name:</strong> Grievance Officer, PunyaSeva Technologies</li>
                <li><strong>Email:</strong> grievance@punyaseva.in</li>
                <li><strong>Response Time:</strong> Within 15 business days</li>
              </ul>
            </Section>

            <Section title="12. Contact Us">
              <p>For privacy-related queries:</p>
              <ul className="list-none space-y-1 mt-2">
                <li><strong>Email:</strong> privacy@punyaseva.in</li>
                <li><strong>Security Issues:</strong> security@punyaseva.in</li>
                <li><strong>Website:</strong> https://punyaseva.in</li>
              </ul>
            </Section>
          </div>

          <div className="mt-12 pt-8 border-t border-stone-100 dark:border-stone-800 text-sm text-stone-400 flex flex-wrap gap-4 justify-between">
            <span>© 2026 PunyaSeva Technologies. All rights reserved.</span>
            <div className="flex gap-4">
              <a href="/terms" className="text-amber-600 hover:underline">Terms of Service</a>
              <a href="/contact" className="text-amber-600 hover:underline">Contact Us</a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
