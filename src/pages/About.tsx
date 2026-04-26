import React from 'react';
import { motion } from 'framer-motion';
import {
  Github,
  Heart,
  Shield,
  Globe,
  Star,
  ArrowRight,
  Sparkles,
  BookOpen,
  HandHelping,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const values = [
  {
    icon: <Heart className="w-8 h-8 text-red-500" />,
    title: 'Devotion First',
    desc: 'Every service we provide is rooted in deep respect for spiritual traditions.',
  },
  {
    icon: <Shield className="w-8 h-8 text-blue-500" />,
    title: 'Authentic & Secure',
    desc: 'We partner only with verified temples and vendors to ensure authenticity.',
  },
  {
    icon: <Globe className="w-8 h-8 text-emerald-500" />,
    title: 'Global Reach',
    desc: 'Bringing the sacred energy of holy sites to devotees across the globe.',
  },
];

const platformPillars = [
  {
    icon: <Sparkles className="w-5 h-5 text-orange-500" />,
    title: 'Spiritual Services',
    desc: 'Book pujas, explore darshan support, and discover trusted rituals for important life moments.',
  },
  {
    icon: <BookOpen className="w-5 h-5 text-orange-500" />,
    title: 'Sacred Commerce',
    desc: 'Shop essentials like malas, incense, books, and yantras in one guided experience.',
  },
  {
    icon: <HandHelping className="w-5 h-5 text-orange-500" />,
    title: 'Guided Support',
    desc: 'Use AI-assisted flows and human support touchpoints to get answers faster and with more clarity.',
  },
];

const developers = [
  {
    name: 'Vikash Pandey',
    role: 'Product Builder & Full-Stack Developer',
    image: 'https://github.com/vikapandeya.png',
    github: 'https://github.com/vikapandeya',
    bio: 'Focused on turning PunyaSeva into a polished, trustworthy spiritual platform with strong UX, scalable backend workflows, and clear product thinking.',
  },
  {
    name: 'Gautam Pince',
    role: 'Developer & Technical Collaborator',
    image: 'https://github.com/gautampince.png',
    github: 'https://github.com/gautampince',
    bio: 'Contributed to shaping the engineering foundation and helping bring the original PunyaSeva experience to life with practical implementation support.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20 transition-colors duration-300">
      <section className="relative h-[50vh] flex items-center overflow-hidden mb-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero/about-hero.png"
            alt="About PunyaSeva"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold uppercase tracking-widest mb-6 border border-orange-500/30">
              <Star className="w-4 h-4" />
              <span>Our Mission</span>
            </div>
            <div className="flex justify-center mb-6">
              <img 
                src="/logo/full-logo.svg" 
                alt="PunyaSeva" 
                className="h-20 w-auto brightness-0 invert" 
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
              Bridging the <span className="text-orange-400 italic">Divine</span> & the{' '}
              <span className="text-orange-400 italic">Digital</span>
            </h1>
            <p className="text-xl text-stone-200 max-w-3xl mx-auto leading-relaxed">
              PunyaSeva is designed to make spiritual services more accessible,
              organized, and trustworthy for devotees everywhere.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 space-y-20">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, idx) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="bg-white dark:bg-stone-900 p-8 rounded-[2rem] shadow-sm border border-stone-100 dark:border-stone-800 text-center"
            >
              <div className="flex justify-center mb-6">{value.icon}</div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
                {value.title}
              </h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
                {value.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <section className="bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-200 dark:border-stone-800 p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500 mb-4">
                What PunyaSeva Is Building
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white mb-6">
                A modern spiritual platform that feels helpful, not complicated.
              </h2>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
                We want PunyaSeva to become a dependable place where devotees
                can book services, discover products, get guided support, and
                stay connected to spiritual practices from anywhere.
              </p>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                The strongest About pages usually answer three questions clearly:
                what the product does, why people should trust it, and who is
                building it. This version now leans into those trust signals.
              </p>
            </div>
            <div className="space-y-4">
              {platformPillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-[2rem] bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {pillar.icon}
                    <h3 className="font-bold text-stone-900 dark:text-white">{pillar.title}</h3>
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-stone-900 rounded-[3rem] p-8 md:p-12 text-white overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-300 mb-3">
                  Meet the Developer Team
                </p>
                <h2 className="text-3xl md:text-4xl font-serif font-bold">
                  The people shaping PunyaSeva
                </h2>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 self-start bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-2xl font-bold transition-all"
              >
                <span>Contact Us</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {developers.map((developer) => (
                <div
                  key={developer.github}
                  className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-sm p-6"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-5">
                    <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden border-2 border-white/10 shrink-0">
                      <img
                        src={developer.image}
                        alt={developer.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-2xl font-serif font-bold mb-1">
                        {developer.name}
                      </h3>
                      <p className="text-orange-200 text-sm font-medium mb-4">
                        {developer.role}
                      </p>
                      <p className="text-stone-300 leading-relaxed mb-5">
                        {developer.bio}
                      </p>
                      <a
                        href={developer.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-3 rounded-2xl transition-all font-bold"
                      >
                        <Github className="w-5 h-5" />
                        <span>GitHub Profile</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-[2rem] p-8">
            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-4">
              What else works well on an About page
            </h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              Over time we can add real trust builders here too: partner temples,
              testimonials, safety standards, verified pandit onboarding, and a
              short roadmap for what is coming next.
            </p>
          </div>
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2rem] p-8">
            <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-4">
              Where this can grow next
            </h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              A stronger next step would be adding real team photos, partnership
              logos, FAQs, and a short “why users trust us” checklist backed by
              actual operational details. Visit us at <a href="https://punyaseva.in" target="_blank" rel="noopener noreferrer" className="text-orange-500 font-bold hover:underline">punyaseva.in</a>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
