import React from 'react';
import { motion } from 'framer-motion';

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
          <div className="mb-8">
            <img 
              src="/logo/icon-only.png" 
              alt="PunyaSeva" 
              className="h-12 w-auto" 
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-8">Terms of Service</h1>
          
          <div className="prose dark:prose-invert max-w-none space-y-6 text-stone-600 dark:text-stone-400">
            <section>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using PunyaSeva, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">2. Description of Service</h2>
              <p>PunyaSeva provides a platform for spiritual services, including puja bookings, darshan slots, and a spiritual marketplace. We act as an intermediary between devotees and spiritual service providers.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">3. User Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">4. Payments and Refunds</h2>
              <p>All payments for services and products are processed securely. Refund policies vary by service provider and are clearly stated at the time of booking or purchase.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">5. Limitation of Liability</h2>
              <p>PunyaSeva shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">6. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. Your continued use of the service after such changes constitutes your acceptance of the new terms.</p>
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
