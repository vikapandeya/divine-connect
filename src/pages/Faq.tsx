import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageSquareHeart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageSeo } from '../lib/seo';
import { cn } from '../lib/utils';

const FAQ_SECTIONS = [
  {
    category: 'Puja Booking',
    emoji: '🙏',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    items: [
      {
        q: 'How do I book a puja on PunyaSeva?',
        a: 'Go to Services → Sacred Pujas, pick the ritual that fits your occasion, select an available slot (online or offline), and complete the booking form. You\'ll receive a confirmation with a booking reference immediately.',
      },
      {
        q: 'What is the difference between online and offline puja?',
        a: 'Online puja is conducted via live video call with the pandit from your home. Offline puja is performed at the temple or at your location with the pandit present in person. Both are fully verified and include samagri.',
      },
      {
        q: 'Can I reschedule or cancel a booking?',
        a: 'Yes. You can manage your bookings from My Profile → Bookings. Cancellations made 24 hours before the scheduled time are eligible for a full refund. Rescheduling is free up to 12 hours before.',
      },
      {
        q: 'Are the pandits verified?',
        a: 'All pandits on PunyaSeva are verified by our team. We check credentials, experience, and conduct a trial puja before onboarding. Ratings and reviews are visible on each puja listing.',
      },
    ],
  },
  {
    category: 'Temple Prasad',
    emoji: '🛕',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    items: [
      {
        q: 'Is the prasad really from the temple?',
        a: 'Yes. We partner directly with temple trusts (like Kashi Vishwanath, Tirupati, Shirdi Sai Baba) and their authorised vendors. Each listing shows the temple name, dispatch window, and packaging details.',
      },
      {
        q: 'How long does prasad delivery take?',
        a: 'Delivery typically takes 3–7 business days depending on your location. Each product page shows the dispatch window clearly. Express delivery options are available for select items.',
      },
      {
        q: 'Can I order prasad as a gift?',
        a: 'Absolutely. Add a custom delivery note during checkout to include a dedication message. We can ship to any address in India.',
      },
    ],
  },
  {
    category: 'Yatra & Darshan',
    emoji: '🗺️',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    items: [
      {
        q: 'What does a Yatra package include?',
        a: 'Packages typically include transport, accommodation, guided temple visits, meals, and a booking certificate. Full details are listed on each package page. Char Dham, Jyotirlinga, and regional circuits are available.',
      },
      {
        q: 'Can I book darshan for a specific festival date?',
        a: 'Yes. Darshan booking allows you to select a date. On high-demand dates like Mahashivratri or Janmashtami, availability is limited — book early. Our platform shows real-time slot availability.',
      },
      {
        q: 'Is a guide provided during the yatra?',
        a: 'Most packages include a spiritual guide and a designated coordinator. The guide provides historical context and assists with rituals at each temple. This is detailed in the package inclusions.',
      },
    ],
  },
  {
    category: 'Shop & Orders',
    emoji: '🛒',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    items: [
      {
        q: 'What payment methods are accepted?',
        a: 'We support UPI, credit/debit cards (via Razorpay and Stripe), net banking, and Cash on Delivery for eligible pin codes. All transactions are encrypted and secure.',
      },
      {
        q: 'How do I track my order?',
        a: 'Go to My Profile → Orders. Each order shows a live status timeline (Processing → Packed → Shipped → Delivered) along with the estimated delivery date and carrier details.',
      },
      {
        q: 'What is the return policy?',
        a: 'Prasad and perishable items are non-returnable for hygiene reasons. Idols, books, and other items can be returned within 7 days of delivery if received in damaged condition. Contact support with photos.',
      },
      {
        q: 'Can I get an invoice for my order?',
        a: 'Yes. A PDF invoice is automatically generated for every order. You can download it from My Profile → Orders by clicking the "Download Invoice" button next to your order.',
      },
    ],
  },
  {
    category: 'Naam Jap Counter',
    emoji: '📿',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    items: [
      {
        q: 'Does the Naam Jap Counter save my count?',
        a: 'Yes. Counts are saved locally on your device using browser storage. They persist between sessions. Each day\'s count is archived automatically at midnight, building your history.',
      },
      {
        q: 'Can I use the counter for any mantra?',
        a: 'Yes. Five popular mantras are pre-loaded (Radhe Radhe, Om Namah Shivaya, etc.) and you can add unlimited custom mantras. Each mantra maintains its own separate count and history.',
      },
      {
        q: 'How does the streak tracking work?',
        a: 'If you chant at least once per day, your streak counter increases by 1 each day. Missing a day resets the current streak (but your longest streak and total days are always preserved).',
      },
    ],
  },
  {
    category: 'Account & Privacy',
    emoji: '🔐',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    items: [
      {
        q: 'Do I need to create an account to use PunyaSeva?',
        a: 'The platform currently operates in demo mode — no login is required. In full production mode, an account will be needed for bookings and orders to securely store your history.',
      },
      {
        q: 'Is my personal data safe?',
        a: 'We collect only the minimum information needed to fulfil your order or booking. Data is not sold to third parties. Checkout details are encrypted in transit and at rest.',
      },
      {
        q: 'How do I delete my data?',
        a: 'You can clear locally stored data (cart, counter history, etc.) from your browser settings at any time. For account deletion requests, contact our support team via the Contact page.',
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-stone-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-stone-900 leading-relaxed">{q}</span>
        <ChevronDown
          className={cn('mt-0.5 h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm leading-relaxed text-stone-600">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  usePageSeo('FAQ', 'Frequently asked questions about puja booking, prasad delivery, yatra packages, and the Naam Jap Counter on PunyaSeva.');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const displayed = activeSection
    ? FAQ_SECTIONS.filter((s) => s.category === activeSection)
    : FAQ_SECTIONS;

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--dc-bg)' }}>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">
            <HelpCircle className="h-7 w-7 text-orange-500" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-stone-900">Frequently Asked Questions</h1>
          <p className="mt-3 text-stone-500 max-w-xl mx-auto">
            Everything you need to know about puja booking, orders, yatra, and your digital mala counter.
          </p>
        </div>

        {/* Category filter pills */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSection(null)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-semibold transition-all',
              activeSection === null
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-200 bg-white text-stone-600 hover:border-orange-300 hover:text-orange-600',
            )}
          >
            All Topics
          </button>
          {FAQ_SECTIONS.map((s) => (
            <button
              key={s.category}
              type="button"
              onClick={() => setActiveSection(activeSection === s.category ? null : s.category)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-semibold transition-all',
                activeSection === s.category
                  ? 'border-orange-400 bg-orange-50 text-orange-700'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-orange-300 hover:text-orange-600',
              )}
            >
              {s.emoji} {s.category}
            </button>
          ))}
        </div>

        {/* FAQ sections */}
        <div className="space-y-6">
          {displayed.map((section) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] border border-stone-200 bg-white shadow-sm overflow-hidden"
            >
              <div className={cn('flex items-center gap-3 border-b px-6 py-4', section.color)}>
                <span className="text-xl">{section.emoji}</span>
                <h2 className="font-bold text-base">{section.category}</h2>
              </div>
              <div className="px-6">
                {section.items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-10 rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-8 text-center shadow-sm">
          <MessageSquareHeart className="mx-auto h-8 w-8 text-orange-500 mb-3" />
          <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">Still have a question?</h3>
          <p className="text-sm text-stone-600 mb-5">
            Our support team is available to help with bookings, orders, and spiritual guidance.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-200"
          >
            Contact Support
          </Link>
        </div>

      </div>
    </div>
  );
}
