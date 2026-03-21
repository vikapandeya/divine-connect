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
import { formatIndianRupees } from '../lib/utils';
import { listPujasDirect } from '../lib/firestore-data';

export default function Services() {
  const [pujas, setPujas] = useState<Puja[]>([]);

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
            templeName: 'DivineConnect Certified Pandit Seva',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4">
          Sacred Puja Services
        </h1>
        <p className="text-stone-600 max-w-2xl">
          Connect with experienced pandit ji for authentic Vedic rituals, online and
          offline puja timings, and guided live darshan support.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-[2rem] border border-stone-200 p-6">
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
        <div className="bg-white rounded-[2rem] border border-stone-200 p-6">
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
          <Link to="/services/darshan" className="inline-flex items-center mt-4 text-sm font-bold text-orange-500">
            Book Darshan Support
          </Link>
        </div>
        <div className="bg-white rounded-[2rem] border border-stone-200 p-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayPujas.map((puja, index) => (
          <motion.div
            key={puja.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-3xl border border-stone-200 overflow-hidden hover:shadow-xl transition-all flex flex-col"
          >
            <div className="h-48 bg-orange-100 relative overflow-hidden">
              <img
                src={`https://picsum.photos/seed/${puja.id}/800/400`}
                alt={puja.title}
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-stone-900">Popular</span>
              </div>
            </div>

            <div className="p-8 flex-grow">
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-3">{puja.title}</h3>
              <p className="text-stone-600 text-sm mb-5 line-clamp-2">{puja.description}</p>
              {puja.templeName && (
                <div className="inline-flex items-center text-xs font-bold text-stone-500 bg-stone-100 rounded-full px-3 py-1 mb-5">
                  <MapPin className="w-3 h-3 mr-1.5" />
                  {puja.templeName}
                </div>
              )}

              <div className="space-y-3 mb-8">
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

              <div className="flex items-center justify-between pt-6 border-t border-stone-100">
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
