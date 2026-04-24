import React from 'react';
import { usePageSeo } from '../lib/seo';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Landmark,
  MapPin,
  ScrollText,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import {
  devoteeQuestions,
  knowledgeHighlights,
  learningPaths,
  pujaGuides,
  scriptureGuides,
  templeGuides,
} from '../lib/knowledge';

const sectionLinks = [
  { href: '#featured-knowledge', label: 'Featured' },
  { href: '#puja-guides', label: 'Puja Guides' },
  { href: '#scripture-library', label: 'Scripture Library' },
  { href: '#temple-guides', label: 'Temple Guides' },
  { href: '#learning-paths', label: 'Reading Paths' },
];

export default function SpiritualKnowledge() {
  usePageSeo('Spiritual Knowledge', 'Puja guides, scripture summaries, temple travel tips, and devotional reading paths for Hindu families.');
  return (
    <div className="space-y-16 pb-20">
      <section className="max-w-7xl mx-auto px-4 pt-10 sm:px-6 lg:px-8">
        <PageHero
          eyebrow="Spiritual Knowledge"
          title="A guided knowledge hub for puja, scriptures, temples, and devotional clarity"
          description="Explore why rituals are performed, how sacred books can be read in a practical way, and what makes India's most beloved temple journeys spiritually meaningful. This section is designed to help devotees learn before they book, buy, or travel."
          actions={(
            <>
              <Link
                to="/services/puja"
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                Book a Puja
              </Link>
              <Link
                to="/shop?category=books"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/15"
              >
                Explore Spiritual Books
              </Link>
            </>
          )}
          stats={[
            { label: 'Puja Guides', value: `${pujaGuides.length}+` },
            { label: 'Scripture Primers', value: `${scriptureGuides.length}+` },
            { label: 'Temple Dossiers', value: `${templeGuides.length}+` },
            { label: 'Learning Paths', value: `${learningPaths.length}` },
          ]}
          aside={(
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-300">
                Inside This Hub
              </p>
              <div className="mt-5 space-y-4">
                {[
                  'Clear explanations of major pujas and what they are best for',
                  'Simple starting points for Bhagavad Gita, Ramayana, Vedas, and Puranas',
                  'Temple significance with yatra context and devotional highlights',
                  'Reading plans for families, first-time seekers, and festival preparation',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" />
                    <p className="text-sm leading-relaxed text-stone-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-3 rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm">
          {sectionLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-bold text-stone-700 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
            >
              {link.label}
            </a>
          ))}
        </div>
      </section>

      <section id="featured-knowledge" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-600">
              Featured Editorial
            </p>
            <h2 className="mt-3 text-3xl font-serif font-bold text-stone-900">
              Knowledge entry points for daily devotees
            </h2>
          </div>
          <Link
            to="/services/yatra"
            className="inline-flex items-center text-sm font-bold text-orange-600 hover:text-orange-500"
          >
            Plan a yatra with context <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {knowledgeHighlights.map((article, index) => (
            <article
              key={article.id}
              id={article.id}
              className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-bold text-orange-700">
                  {article.category}
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-serif font-bold text-stone-900">
                {article.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                {article.excerpt}
              </p>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="font-bold text-stone-900">{article.readTime}</span>
                <span className="inline-flex items-center gap-1 font-bold text-orange-600">
                  Knowledge hub
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="puja-guides" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] border border-orange-100 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] p-8 md:p-10">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-600">
              Puja Guides
            </p>
            <h2 className="mt-3 text-3xl font-serif font-bold text-stone-900">
              Understand the purpose, timing, and devotional mood of major pujas
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-stone-600">
              These guides are written to help devotees choose the right ritual with confidence.
              Each card explains when the puja is typically performed, what it is best for, and
              what makes the sankalp feel meaningful.
            </p>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            {pujaGuides.map((guide) => (
              <article
                key={guide.id}
                className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_18px_40px_rgba(249,115,22,0.08)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-orange-500">
                      Sacred Ritual
                    </p>
                    <h3 className="mt-3 text-2xl font-serif font-bold text-stone-900">
                      {guide.title}
                    </h3>
                  </div>
                  <div className="rounded-[1.5rem] bg-stone-50 px-4 py-3 text-right">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
                      Duration
                    </p>
                    <p className="mt-2 text-sm font-bold text-stone-900">{guide.duration}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-stone-600">{guide.purpose}</p>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
                      Ideal For
                    </p>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-stone-700">
                      {guide.idealFor}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
                      Best Timing
                    </p>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-stone-700">
                      {guide.bestTiming}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
                      Samagri Focus
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {guide.samagriFocus.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-stone-600"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.75rem] border border-emerald-100 bg-emerald-50 px-5 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                    Practical Takeaway
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-emerald-900">
                    {guide.keyTakeaway}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="scripture-library" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
              Scripture Library
            </p>
            <h2 className="mt-3 text-3xl font-serif font-bold text-stone-900">
              Start reading sacred books with a clear path instead of confusion
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-stone-600">
              This section covers Bhagavad Gita, Ramayana, Bhagavatam, Vedas, Puranas,
              and Upanishads with practical framing so a devotee knows what each text
              offers before buying, reading, or gifting it.
            </p>
          </div>
          <Link
            to="/shop?category=books"
            className="inline-flex items-center text-sm font-bold text-orange-600 hover:text-orange-500"
          >
            Browse scripture books <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          {scriptureGuides.map((book) => (
            <article
              key={book.id}
              className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-stone-400">
                    {book.tradition}
                  </p>
                  <h3 className="mt-2 text-2xl font-serif font-bold text-stone-900">
                    {book.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">{book.focus}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] bg-stone-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
                    Ideal For
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-stone-700">{book.idealFor}</p>
                </div>
                <div className="rounded-[1.5rem] bg-stone-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
                    Structure
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-stone-700">{book.structure}</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-stone-400">
                  What You Learn
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {book.whatYouLearn.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-bold text-stone-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[1.75rem] border border-blue-100 bg-blue-50 px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-700">
                  Suggested Reading Approach
                </p>
                <p className="mt-3 text-sm leading-relaxed text-blue-950">
                  {book.readingApproach}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="temple-guides" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2.75rem] border border-stone-200 bg-stone-950 px-6 py-10 text-white sm:px-8 md:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-300">
              Temple Guides
            </p>
            <h2 className="mt-3 text-3xl font-serif font-bold">
              Temple significance with travel, tradition, and devotional context
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-stone-300">
              These temple cards help devotees understand why a location matters, what season
              fits best, and which journeys are better as direct darshan, product-linked temple
              service, or full yatra packages.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {templeGuides.map((temple) => (
              <article
                key={temple.id}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-orange-200">
                    {temple.tradition}
                  </span>
                  <Landmark className="h-5 w-5 text-orange-300" />
                </div>
                <h3 className="mt-5 text-2xl font-serif font-bold">{temple.name}</h3>
                <div className="mt-3 inline-flex items-center gap-2 text-sm text-stone-300">
                  <MapPin className="h-4 w-4 text-orange-300" />
                  {temple.location}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-stone-300">
                  {temple.significance}
                </p>

                <div className="mt-6 grid gap-4">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
                      Best Season
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-white">{temple.bestSeason}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
                      Ideal For
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-white">{temple.idealFor}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {temple.highlights.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold text-stone-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="learning-paths" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2.5rem] border border-stone-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <ScrollText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-600">
                  Guided Learning Paths
                </p>
                <h2 className="mt-2 text-3xl font-serif font-bold text-stone-900">
                  Practical ways to begin, not just topics to browse
                </h2>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              {learningPaths.map((path) => (
                <article
                  key={path.id}
                  className="rounded-[2rem] border border-stone-200 bg-stone-50 p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-stone-900">{path.title}</h3>
                      <p className="mt-2 text-sm text-stone-600">{path.audience}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-stone-700">
                      <Clock3 className="h-4 w-4 text-orange-500" />
                      {path.duration}
                    </div>
                  </div>

                  <p className="mt-4 rounded-[1.5rem] border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-stone-700">
                    {path.outcome}
                  </p>

                  <div className="mt-4 space-y-3">
                    {path.steps.map((step, index) => (
                      <div key={step} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed text-stone-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[2.5rem] border border-stone-200 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-white">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-600">
                    Devotee Questions
                  </p>
                  <h2 className="mt-2 text-3xl font-serif font-bold text-stone-900">
                    Clear answers before booking or buying
                  </h2>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {devoteeQuestions.map((item) => (
                  <article key={item.id} className="rounded-[1.75rem] border border-orange-100 bg-white p-5">
                    <h3 className="text-base font-bold text-stone-900">{item.question}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.answer}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-stone-200 bg-stone-900 p-8 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-300">
                Next Step
              </p>
              <h2 className="mt-3 text-3xl font-serif font-bold">
                Turn learning into a guided devotional journey
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-stone-300">
                Use this knowledge hub with the rest of PunyaSeva. Read first, then move into
                puja booking, temple products, darshan support, or yatra planning with better
                confidence and context.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
                >
                  Explore Services
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/15"
                >
                  Visit Shop
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

