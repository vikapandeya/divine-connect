import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Search } from 'lucide-react';
import PageHero from '../components/PageHero';
import { translateText, useAppLocale } from '../lib/i18n';

export default function NotFound() {
  const locale = useAppLocale();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <PageHero
        tone="stone"
        eyebrow={translateText(locale, 'Page Not Found')}
        title={translateText(locale, 'This path is not part of the current PunyaSeva journey.')}
        description={translateText(locale, 'The page may have moved, the URL may be incomplete, or the requested path is outside the current demo routes.')}
        actions={
          <>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-3 font-bold text-white hover:bg-orange-500"
            >
              {translateText(locale, 'Return Home')}
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center rounded-full border border-stone-300 px-6 py-3 font-bold text-stone-700 hover:border-orange-300 hover:text-orange-600"
            >
              {translateText(locale, 'Explore Shop')}
            </Link>
          </>
        }
        aside={
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-orange-600">
              <Compass className="h-5 w-5" />
              <p className="text-sm font-bold uppercase tracking-[0.2em]">{translateText(locale, 'Quick Recovery')}</p>
            </div>
            <div className="mt-5 space-y-3 text-sm text-stone-600">
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                {translateText(locale, 'Try the main navigation to reach services, shop, astrology, or support.')}
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                {translateText(locale, 'Search from the header if you were looking for a product or offering.')}
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                {translateText(locale, 'Visit your profile to access bookings, invoices, certificates, and readings.')}
              </div>
            </div>
          </div>
        }
      />

      <section className="grid gap-6 md:grid-cols-3">
        <Link
          to="/services"
          className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/10"
        >
          <Compass className="mb-4 h-6 w-6 text-orange-500" />
          <h2 className="text-xl font-bold text-stone-900">{translateText(locale, 'Sacred Services')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            {translateText(locale, 'Browse puja booking, darshan support, and guided service flows.')}
          </p>
        </Link>
        <Link
          to="/shop"
          className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/10"
        >
          <Search className="mb-4 h-6 w-6 text-orange-500" />
          <h2 className="text-xl font-bold text-stone-900">{translateText(locale, 'Spiritual Shop')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            {translateText(locale, 'Explore prasad, idols, books, malas, and puja essentials.')}
          </p>
        </Link>
        <Link
          to="/"
          className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/10"
        >
          <ArrowLeft className="mb-4 h-6 w-6 text-orange-500" />
          <h2 className="text-xl font-bold text-stone-900">{translateText(locale, 'Back to Home')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            {translateText(locale, 'Return to the homepage and restart from the main PunyaSeva experience.')}
          </p>
        </Link>
      </section>
    </div>
  );
}

