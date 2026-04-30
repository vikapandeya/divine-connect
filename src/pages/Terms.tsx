import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3 flex items-center gap-2">
      <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block" />
      {title}
    </h2>
    <div className="text-stone-600 dark:text-stone-400 space-y-3 leading-relaxed pl-4">{children}</div>
  </section>
);

export default function Terms() {
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
            <FileText className="text-amber-500" size={28} />
          </div>

          <h1 className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-2">Terms of Service</h1>
          <p className="text-stone-500 dark:text-stone-400 mb-10 text-sm">Effective Date: 1 April 2026 · Last Updated: 30 April 2026</p>

          <div className="prose dark:prose-invert max-w-none">

            <Section title="1. Acceptance of Terms">
              <p>By accessing or using PunyaSeva ("Platform", "we", "us", "our") — available at pre.punyaseva.in and punyaseva.in — you ("User", "you") agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and all applicable Indian laws and regulations including the Information Technology Act 2000 and the Consumer Protection Act 2019.</p>
              <p>If you do not agree to these Terms, please discontinue use of the Platform immediately.</p>
            </Section>

            <Section title="2. About PunyaSeva">
              <p>PunyaSeva is a digital platform offering spiritual services including:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Online and offline puja booking at empanelled temples and with certified pandits</li>
                <li>Darshan slot reservations</li>
                <li>A curated spiritual marketplace for devotional products</li>
                <li>Temple yatra (pilgrimage) booking</li>
                <li>Vedic astrology and kundli services</li>
                <li>Temple knowledge and cultural information resources</li>
              </ul>
              <p className="mt-2">PunyaSeva acts as an intermediary marketplace. We are not a temple, pandit agency, or religious institution. Spiritual outcomes of services performed are the responsibility of the service provider.</p>
            </Section>

            <Section title="3. User Eligibility and Accounts">
              <p>You must be at least 18 years of age to create an account and make purchases. By registering, you confirm that all information provided is accurate and current.</p>
              <p>You are solely responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Notify us immediately at <strong>support@punyaseva.in</strong> if you suspect unauthorised access.</p>
              <p>We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or abuse the Platform.</p>
            </Section>

            <Section title="4. Bookings and Services">
              <p><strong>Puja Bookings:</strong> Bookings are confirmed only upon full payment. Service details (pandit, date, time, samagri list) will be sent via email/WhatsApp after confirmation.</p>
              <p><strong>Cancellations:</strong> Cancellations made more than 48 hours before the service date are eligible for a full refund. Cancellations within 48 hours may attract a 25% cancellation fee. No refund is available for no-shows.</p>
              <p><strong>Rescheduling:</strong> You may reschedule a booking up to 24 hours prior to the scheduled time, subject to availability.</p>
              <p><strong>Service Variation:</strong> Puja procedures may vary slightly based on temple traditions and pandit practices. PunyaSeva does not guarantee outcomes of any religious service.</p>
            </Section>

            <Section title="5. Marketplace and Products">
              <p>Products listed on PunyaSeva are sold either directly by PunyaSeva or by third-party vendors on our platform. Each product listing clearly indicates the seller.</p>
              <p><strong>Product Quality:</strong> We make reasonable efforts to verify vendor quality. However, PunyaSeva is not liable for product defects caused by vendors. Disputes must be raised within 7 days of delivery.</p>
              <p><strong>Shipping:</strong> Estimated delivery times are indicative. PunyaSeva is not liable for delays caused by courier partners, natural events, or government actions.</p>
              <p><strong>Returns:</strong> Products that are defective, damaged in transit, or incorrectly shipped are eligible for return within 7 days. Sacred items (idols, murtis) are non-returnable once consecrated.</p>
            </Section>

            <Section title="6. Payments">
              <p>All transactions are processed in Indian Rupees (INR) through Stripe, a PCI-DSS compliant payment processor. PunyaSeva does not store your card details.</p>
              <p>In the event of a failed transaction where your account has been debited, please contact us at <strong>billing@punyaseva.in</strong> within 48 hours. Refunds for failed transactions are processed within 5–7 business days.</p>
              <p>GST and other applicable taxes are included in the displayed price unless stated otherwise.</p>
            </Section>

            <Section title="7. Intellectual Property">
              <p>All content on this Platform — including text, images, logos, icons, temple articles, and software code — is the intellectual property of PunyaSeva or its licensors and is protected under applicable copyright and trademark laws.</p>
              <p>You may not reproduce, distribute, modify, or create derivative works without prior written permission from PunyaSeva.</p>
            </Section>

            <Section title="8. User Conduct">
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Use the Platform for any unlawful purpose or in violation of Indian law</li>
                <li>Post false, misleading, or offensive reviews or content</li>
                <li>Attempt to gain unauthorised access to any part of the Platform or its servers</li>
                <li>Use automated bots or scrapers to access the Platform</li>
                <li>Impersonate any person, temple, or organisation</li>
                <li>Disrespect or demean any religion, deity, or spiritual tradition</li>
              </ul>
            </Section>

            <Section title="9. Third-Party Services">
              <p>PunyaSeva integrates with third-party services including Stripe (payments), Firebase (notifications), and Google Maps. Your use of these services is also governed by their respective terms and privacy policies. PunyaSeva is not liable for any failures, outages, or data practices of third-party providers.</p>
            </Section>

            <Section title="10. Limitation of Liability">
              <p>To the maximum extent permitted by applicable law, PunyaSeva shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of profits, data, goodwill, or business interruption — arising from your use of the Platform, even if advised of the possibility of such damages.</p>
              <p>Our aggregate liability for any claim arising from use of the Platform shall not exceed the amount paid by you to PunyaSeva in the three months preceding the claim.</p>
            </Section>

            <Section title="11. Governing Law and Disputes">
              <p>These Terms are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Varanasi, Uttar Pradesh.</p>
              <p>Before initiating legal proceedings, you agree to attempt resolution through our grievance redressal mechanism by writing to <strong>grievance@punyaseva.in</strong>. We shall respond within 15 business days.</p>
            </Section>

            <Section title="12. Changes to Terms">
              <p>We may update these Terms from time to time. The revised Terms will be posted on this page with an updated "Last Updated" date. Continued use of the Platform after changes constitutes acceptance of the revised Terms. Material changes will be communicated via email.</p>
            </Section>

            <Section title="13. Contact Us">
              <p>For any questions about these Terms, please contact:</p>
              <ul className="list-none space-y-1 mt-2">
                <li><strong>PunyaSeva Technologies</strong></li>
                <li>Email: legal@punyaseva.in</li>
                <li>Grievance Officer: grievance@punyaseva.in</li>
                <li>Website: https://punyaseva.in</li>
              </ul>
            </Section>
          </div>

          <div className="mt-12 pt-8 border-t border-stone-100 dark:border-stone-800 text-sm text-stone-400 flex flex-wrap gap-4 justify-between">
            <span>© 2026 PunyaSeva Technologies. All rights reserved.</span>
            <div className="flex gap-4">
              <a href="/privacy" className="text-amber-600 hover:underline">Privacy Policy</a>
              <a href="/contact" className="text-amber-600 hover:underline">Contact Us</a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
