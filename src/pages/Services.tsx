import React, { useState, useEffect } from 'react';
import { Puja } from '../types';
import { motion } from 'framer-motion';
import {
  Flame,
  Clock,
  IndianRupee,
  CheckCircle2,
  Video,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { formatIndianRupees } from '../lib/utils';
import { listPujasDirect } from '../lib/firestore-data';
import { getTempleSpotlights } from '../lib/platform';
import { getPujaSpiritualImage } from '../lib/spiritual-images';
import { translateText, useAppLocale } from '../lib/i18n';

export default function Services() {
  const locale = useAppLocale();
  const [pujas, setPujas] = useState<Puja[]>([]);
  const templeSpotlights = getTempleSpotlights();

  useEffect(() => {
    const fetchPujas = async () => {
      try {
        const data = await listPujasDirect();
        setPujas(data);
      } catch (error) {
        console.error('Error fetching pujas:', error);
      }
    };
    fetchPujas();
  }, []);

  const displayPujas =
    pujas.length > 0
      ? pujas
      : [
          {
            id: 'puja-ganesh',
            vendorId: 'system',
            title: 'Ganesh Puja',
            description: 'Invoke the blessings of Lord Ganesha for new beginnings and removing obstacles.',
            price: 2100,
            duration: '1.5 Hours',
            samagriIncluded: true,
            mode: 'hybrid',
            templeName: 'PunyaSeva Certified Pandit Seva',
            onlineTimings: ['06:30 AM - 08:00 AM', '07:00 PM - 08:30 PM'],
            offlineTimings: ['08:00 AM - 10:00 AM', '05:00 PM - 06:30 PM'],
            liveDarshanAvailable: false,
          },
          {
            id: 'puja-satyanarayan',
            vendorId: 'system',
            title: 'Satyanarayan Katha',
            description: 'A sacred ritual dedicated to Lord Vishnu for peace, prosperity, and happiness.',
            price: 5100,
            duration: '3 Hours',
            samagriIncluded: true,
            mode: 'hybrid',
            templeName: 'Family Home or Temple Mandap Setup',
            onlineTimings: ['09:00 AM - 12:00 PM'],
            offlineTimings: ['08:30 AM - 11:30 AM', '04:00 PM - 07:00 PM'],
            liveDarshanAvailable: true,
          },
          {
            id: 'puja-lakshmi',
            vendorId: 'system',
            title: 'Lakshmi Puja',
            description: 'Attract wealth and prosperity with this special puja dedicated to Goddess Lakshmi.',
            price: 3500,
            duration: '2 Hours',
            samagriIncluded: true,
            mode: 'hybrid',
            templeName: 'Festival and Griha Lakshmi Seva',
            onlineTimings: ['07:30 AM - 09:30 AM', '06:30 PM - 08:30 PM'],
            offlineTimings: ['10:00 AM - 12:00 PM', '07:00 PM - 09:00 PM'],
            liveDarshanAvailable: false,
          },
          {
            id: 'puja-maha-mrityunjaya',
            vendorId: 'system',
            title: 'Maha Mrityunjaya Jaap',
            description: 'Powerful Vedic chanting for health, longevity, and spiritual protection.',
            price: 11000,
            duration: '5 Hours',
            samagriIncluded: true,
            mode: 'hybrid',
            templeName: 'Special Sankalp Seva',
            onlineTimings: ['06:00 AM - 11:00 AM'],
            offlineTimings: ['05:30 AM - 10:30 AM'],
            liveDarshanAvailable: true,
          },
        ];

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <PageHero
        eyebrow={translateText(locale, 'Sacred Services')}
        title={translateText(locale, 'Book puja services with clearer guidance, better timing context, and trusted delivery.')}
        description={translateText(locale, 'Choose from verified rituals, hybrid seva formats, live darshan support, and AI-guided next steps built to feel calm, practical, and dependable.')}
        stats={[
          { label: translateText(locale, 'Service Formats'), value: translateText(locale, 'Online, Offline, Hybrid') },
          { label: translateText(locale, 'Popular Ritual Types'), value: `${displayPujas.length}+` },
          { label: translateText(locale, 'Guidance Layers'), value: translateText(locale, 'Puja, Darshan, Astrology') },
        ]}
        actions={
          <>
            <Link
              to="/services/darshan"
              className="inline-flex items-center rounded-full bg-white px-6 py-3 font-bold text-stone-900 hover:bg-stone-100"
            >
              {translateText(locale, 'Book Darshan')}
            </Link>
            <Link
              to="/services/yatra"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-6 py-3 font-bold text-white hover:bg-white/10"
            >
              {translateText(locale, 'Explore Yatra')}
            </Link>
            <Link
              to="/astrology"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-6 py-3 font-bold text-white hover:bg-white/10"
            >
              {translateText(locale, 'Open AI Astrology')}
            </Link>
          </>
        }
        aside={
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-300">
              {translateText(locale, 'Why this flow feels better')}
            </p>
            <div className="mt-5 space-y-3 text-sm text-stone-200">
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                {translateText(locale, 'Clear duration, schedule, and samagri expectations.')}
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                {translateText(locale, 'Direct paths into darshan support and astrology remedies.')}
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                {translateText(locale, 'Stronger card hierarchy for faster comparison across services.')}
              </div>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/50">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">
            Online & Offline Puja Timing
          </h2>
          <p className="text-sm text-stone-600">
            Choose puja slots for home visits or online sankalp sessions. Pandit ji is available in both online and offline modes.
          </p>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/50">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <Video className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">
            Online Live Darshan Booking
          </h2>
          <p className="text-sm text-stone-600">
            Reserve live darshan coordination for special temple moments, family prayers,
            and remote participation.
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
            Jitsi / Zoom ready demo slots
          </p>
          <Link to="/services/darshan" className="inline-flex items-center mt-4 text-sm font-bold text-orange-500">
            Book Darshan Support
          </Link>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/50">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
            <MapPin className="w-6 h-6 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">
            Yatra Booking Packages
          </h2>
          <p className="text-sm text-stone-600">
            Reserve full packages for Char Dham, Jyotirlinga circuits, and key tirth sthals with stays, meals, and transfers.
          </p>
          <Link to="/services/yatra" className="inline-flex items-center mt-4 text-sm font-bold text-orange-500">
            Open Yatra Packages
          </Link>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm shadow-stone-200/50">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">AI Astrology Access</h2>
          <p className="text-sm text-stone-600">
            Get personalized Vedic guidance and then move directly into remedies, puja
            suggestions, and next steps.
          </p>
          <Link to="/astrology" className="inline-flex items-center mt-4 text-sm font-bold text-orange-500">
            Open AI Astrology
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2.25rem] border border-stone-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-600">
            Live Puja Streaming
          </p>
          <h2 className="mt-4 text-2xl font-serif font-bold text-stone-900">
            Hardcoded livestream readiness for online ritual participation
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              'Auto-generated meeting room code after booking',
              'Join window opens 15 minutes before sankalp',
              'Host panel supports Jitsi or Zoom SDK style integration',
            ].map((item) => (
              <div key={item} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-600">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2.25rem] border border-stone-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
            Famous Temples
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {templeSpotlights.map((temple) => (
              <div key={temple.id} className="rounded-[1.5rem] border border-stone-200 p-4">
                <p className="text-sm font-bold text-stone-900">{temple.name}</p>
                <p className="mt-1 text-xs text-stone-500">{temple.city}, {temple.state}</p>
                <p className="mt-3 text-sm text-stone-600">{temple.services.join(' • ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-stone-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-600">
              Pilgrimage Feature
            </p>
            <h2 className="mt-4 text-3xl font-serif font-bold text-stone-900">
              Full-package yatra booking is now part of the services experience
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-stone-600">
              Devotees can now compare full pilgrimage packages for dham circuits,
              Jyotirlinga routes, and tirth-sthal journeys with structured inclusions and booking-ready totals.
            </p>
          </div>
          <Link
            to="/services/yatra"
            className="inline-flex items-center justify-center rounded-full bg-stone-900 px-7 py-4 text-sm font-bold text-white hover:bg-orange-500"
          >
            Book Yatra Packages
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {displayPujas.map((puja, index) => (
          <motion.div
            key={puja.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10"
          >
            <div className="h-48 bg-orange-100 relative overflow-hidden">
              <img
                src={getPujaSpiritualImage(puja.title).src}
                alt={`${puja.title} puja ritual spiritual image`}
                className="w-full h-full object-cover opacity-80"
                loading="lazy"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-stone-900">Popular</span>
              </div>
            </div>

            <div className="flex flex-grow flex-col p-8">
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-3">{puja.title}</h3>
              <p className="text-stone-600 text-sm mb-5 line-clamp-2">{puja.description}</p>
              {puja.templeName && (
                <div className="inline-flex items-center text-xs font-bold text-stone-500 bg-stone-100 rounded-full px-3 py-1 mb-5">
                  <MapPin className="w-3 h-3 mr-1.5" />
                  {puja.templeName}
                </div>
              )}

              <div className="mb-8 space-y-3">
                <div className="flex items-center text-stone-500 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Duration: {puja.duration}</span>
                </div>
                <div className="flex items-center text-stone-500 text-sm">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                  <span>{puja.samagriIncluded ? 'Samagri Included' : 'Samagri on request'}</span>
                </div>
                {puja.onlineTimings?.length ? (
                  <div className="text-xs text-stone-500">
                    <span className="font-bold text-stone-700">Online:</span>{' '}
                    {puja.onlineTimings.join(', ')}
                  </div>
                ) : null}
                {puja.offlineTimings?.length ? (
                  <div className="text-xs text-stone-500">
                    <span className="font-bold text-stone-700">Offline:</span>{' '}
                    {puja.offlineTimings.join(', ')}
                  </div>
                ) : null}
                {puja.liveDarshanAvailable ? (
                  <div className="flex items-center text-blue-600 text-sm">
                    <Video className="w-4 h-4 mr-2" />
                    <span>Live darshan assistance available</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-6">
                <div className="flex items-center text-2xl font-serif font-bold text-orange-600">
                  <IndianRupee className="w-5 h-5" />
                  <span>{formatIndianRupees(puja.price)}</span>
                </div>
                <Link
                  to={`/services/puja/${puja.id}`}
                  className="bg-stone-900 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-500 transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

