import React from 'react';
import { motion } from 'framer-motion';
import { Gift, PackageCheck, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';

const templeHighlights = [
  {
    temple: 'Kashi Vishwanath Mandir',
    city: 'Varanasi',
    detail: 'Mahaprasad boxes with family pack and delivery-ready dispatch notes.',
  },
  {
    temple: 'Tirumala Tirupati Devasthanam',
    city: 'Tirupati',
    detail: 'Temple gift packs with pack size and special prasadam details.',
  },
  {
    temple: 'Jagannath Mandir',
    city: 'Puri',
    detail: 'Fresh travel packs and gifting options from temple-inspired offerings.',
  },
];

export default function PrasadDelivery() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <PageHero
        tone="stone"
        eyebrow="Temple Prasad"
        title="Order curated prasad with better source clarity, delivery context, and devotional presentation."
        description="This section is shaped to make temple-origin offerings feel more trustworthy by surfacing mandir source, packaging details, and dispatch expectations more clearly."
        stats={[
          { label: 'Temple Highlights', value: `${templeHighlights.length}` },
          { label: 'Order Context', value: 'Delivery Ready' },
          { label: 'Best For', value: 'Home Worship & Gifting' },
        ]}
        aside={
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-600">
              Why this page feels better
            </p>
            <div className="mt-5 space-y-3 text-sm text-stone-600">
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                Stronger emphasis on temple source and devotional context.
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                Cleaner card rhythm between benefits, highlights, and CTA.
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                A more premium bridge into the prasad shop flow.
              </div>
            </div>
          </div>
        }
      />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <Gift className="w-6 h-6 text-orange-500 mb-4" />
          <h2 className="text-xl font-bold text-stone-900 mb-2">Temple-Based Selection</h2>
          <p className="text-sm text-stone-600">
            Each prasad offering includes mandir details and devotional context.
          </p>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <PackageCheck className="w-6 h-6 text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold text-stone-900 mb-2">Delivery Ready</h2>
          <p className="text-sm text-stone-600">
            Weight, pack size, dispatch timing, and delivery availability are clearly shown.
          </p>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <ShoppingBag className="w-6 h-6 text-blue-500 mb-4" />
          <h2 className="text-xl font-bold text-stone-900 mb-2">Shop with Confidence</h2>
          <p className="text-sm text-stone-600">
            Browse curated prasad options and complete your order with full receipt support.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {templeHighlights.map((item, index) => (
          <motion.div
            key={item.temple}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="rounded-[2.5rem] bg-stone-900 p-6 text-white shadow-lg shadow-stone-900/10"
          >
            <div className="inline-flex items-center text-xs uppercase tracking-[0.2em] text-orange-300 font-bold mb-4">
              <MapPin className="w-3 h-3 mr-2" />
              {item.city}
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3">{item.temple}</h3>
            <p className="text-stone-300 text-sm leading-relaxed">{item.detail}</p>
          </motion.div>
        ))}
      </section>

      <section className="rounded-[3rem] bg-orange-500 p-10 text-center text-white shadow-xl shadow-orange-500/20 md:p-14">
        <h2 className="text-3xl font-serif font-bold mb-4">
          Continue to the Prasad Shop
        </h2>
        <p className="max-w-2xl mx-auto text-orange-100 mb-8">
          View deliverable prasad from different mandirs and compare temple details,
          size, weight, and dispatch notes.
        </p>
        <Link
          to="/shop?category=prasad"
          className="inline-flex items-center bg-white text-stone-900 px-8 py-4 rounded-full font-bold hover:bg-stone-100 transition-colors"
        >
          Explore Prasad Shop
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </section>
    </div>
  );
}
