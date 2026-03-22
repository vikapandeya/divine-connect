import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

type HeroStat = {
  label: string;
  value: string;
};

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  stats?: HeroStat[];
  aside?: React.ReactNode;
  tone?: 'saffron' | 'ocean' | 'stone';
};

const toneClasses: Record<NonNullable<PageHeroProps['tone']>, string> = {
  saffron:
    'bg-stone-900 text-white before:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.38),transparent_34%)] after:bg-[radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.18),transparent_30%)]',
  ocean:
    'bg-slate-950 text-white before:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.32),transparent_34%)] after:bg-[radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.16),transparent_30%)]',
  stone:
    'bg-white text-stone-900 border border-stone-200 before:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_36%)] after:bg-[radial-gradient(circle_at_bottom_right,rgba(120,113,108,0.1),transparent_28%)]',
};

export default function PageHero({
  eyebrow,
  title,
  description,
  actions,
  stats,
  aside,
  tone = 'saffron',
}: PageHeroProps) {
  const isLight = tone === 'stone';
  const eyebrowClass = isLight ? 'text-orange-600' : 'text-orange-300';
  const descriptionClass = isLight ? 'text-stone-600' : 'text-stone-300';
  const statCardClass = isLight
    ? 'bg-stone-50 border border-stone-200 text-stone-900'
    : 'bg-white/5 border border-white/10 text-white';
  const statLabelClass = isLight ? 'text-stone-500' : 'text-stone-300';

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[2.75rem] px-6 py-10 sm:px-8 md:px-12 md:py-14',
        'before:absolute before:inset-0 before:content-[""] after:absolute after:inset-0 after:content-[""]',
        toneClasses[tone],
      )}
    >
      <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:items-end">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-3xl"
        >
          <p className={cn('mb-4 text-xs font-bold uppercase tracking-[0.32em]', eyebrowClass)}>
            {eyebrow}
          </p>
          <h1 className="max-w-4xl text-4xl font-serif font-bold leading-tight md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className={cn('mt-5 max-w-2xl text-base leading-relaxed md:text-lg', descriptionClass)}>
            {description}
          </p>
          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
        </motion.div>

        {aside ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="lg:justify-self-end lg:w-full lg:max-w-md"
          >
            {aside}
          </motion.div>
        ) : null}
      </div>

      {stats?.length ? (
        <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.12 + index * 0.05 }}
              className={cn('rounded-[1.75rem] px-5 py-5 backdrop-blur-sm', statCardClass)}
            >
              <p className="text-2xl font-serif font-bold">{stat.value}</p>
              <p className={cn('mt-2 text-sm', statLabelClass)}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
