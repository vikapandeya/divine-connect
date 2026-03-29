import React from 'react';
import { motion } from 'framer-motion';

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
          <h1 className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-8">Privacy Policy</h1>
          
          <div className="prose dark:prose-invert max-w-none space-y-6 text-stone-600 dark:text-stone-400">
            <section>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, make a booking, or purchase a product. This includes your name, email address, and payment information.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you about your account and our offerings.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">3. Information Sharing</h2>
              <p>We share your information with spiritual service providers and vendors only as necessary to fulfill your bookings and orders. We do not sell your personal information to third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">4. Data Security</h2>
              <p>We take reasonable measures to protect your personal information from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">5. Your Choices</h2>
              <p>You can access and update your account information at any time through your profile settings. You can also request the deletion of your account and personal data.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">6. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at support@divineconnect.com.</p>
            </section>
          </div>
          
          <div className="mt-12 pt-8 border-t border-stone-100 dark:border-stone-800 text-sm text-stone-400">
            Last updated: March 22, 2026
          </div>
        </motion.div>
      </div>
    </div>
  );
}
