import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Puja } from '../types';
import { motion } from 'framer-motion';
import {
  Clock,
  IndianRupee,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  Video,
  MapPin,
} from 'lucide-react';
import { formatIndianRupees } from '../lib/utils';
import { createBookingDirect, DEMO_DEVOTEE_PROFILE, getPujaDirect } from '../lib/firestore-data';

const fallbackPujas: Record<string, Puja> = {
  'puja-ganesh': {
    id: 'puja-ganesh',
    vendorId: 'system',
    title: 'Ganesh Puja',
    price: 2100,
    duration: '1.5 Hours',
    description:
      'Invoke the blessings of Lord Ganesha for new beginnings and removing obstacles. This puja is ideal for starting new ventures, housewarming, or seeking general prosperity.',
    samagriIncluded: true,
    mode: 'hybrid',
    onlineTimings: ['06:30 AM - 08:00 AM', '07:00 PM - 08:30 PM'],
    offlineTimings: ['08:00 AM - 10:00 AM', '05:00 PM - 06:30 PM'],
    templeName: 'DivineConnect Certified Pandit Seva',
    liveDarshanAvailable: false,
  },
  'puja-satyanarayan': {
    id: 'puja-satyanarayan',
    vendorId: 'system',
    title: 'Satyanarayan Katha',
    price: 5100,
    duration: '3 Hours',
    description:
      'A sacred ritual dedicated to Lord Vishnu for peace, prosperity, and happiness. It is traditionally performed on full moon days or special occasions.',
    samagriIncluded: true,
    mode: 'hybrid',
    onlineTimings: ['09:00 AM - 12:00 PM'],
    offlineTimings: ['08:30 AM - 11:30 AM', '04:00 PM - 07:00 PM'],
    templeName: 'Family Home or Temple Mandap Setup',
    liveDarshanAvailable: true,
  },
  'puja-lakshmi': {
    id: 'puja-lakshmi',
    vendorId: 'system',
    title: 'Lakshmi Puja',
    price: 3500,
    duration: '2 Hours',
    description:
      'Attract wealth and prosperity with this special puja dedicated to Goddess Lakshmi. Perfect for business growth and financial stability.',
    samagriIncluded: true,
    mode: 'hybrid',
    onlineTimings: ['07:30 AM - 09:30 AM', '06:30 PM - 08:30 PM'],
    offlineTimings: ['10:00 AM - 12:00 PM', '07:00 PM - 09:00 PM'],
    templeName: 'Festival and Griha Lakshmi Seva',
    liveDarshanAvailable: false,
  },
  'puja-maha-mrityunjaya': {
    id: 'puja-maha-mrityunjaya',
    vendorId: 'system',
    title: 'Maha Mrityunjaya Jaap',
    price: 11000,
    duration: '5 Hours',
    description:
      'Powerful Vedic chanting for health, longevity, and spiritual protection with guided sankalp and ceremony support.',
    samagriIncluded: true,
    mode: 'hybrid',
    onlineTimings: ['06:00 AM - 11:00 AM'],
    offlineTimings: ['05:30 AM - 10:30 AM'],
    templeName: 'Special Sankalp Seva',
    liveDarshanAvailable: true,
  },
};

const pujaAliases: Record<string, string> = {
  '1': 'puja-ganesh',
  '2': 'puja-satyanarayan',
  '3': 'puja-lakshmi',
  '4': 'puja-maha-mrityunjaya',
  ganesh: 'puja-ganesh',
  satyanarayan: 'puja-satyanarayan',
  lakshmi: 'puja-lakshmi',
  mrityunjaya: 'puja-maha-mrityunjaya',
};

function resolveFallbackPuja(requestedId: string) {
  const canonicalId = pujaAliases[requestedId] || requestedId;
  return fallbackPujas[canonicalId] || null;
}

export default function PujaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [puja, setPuja] = useState<Puja | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingMode, setBookingMode] = useState<'online' | 'offline'>('online');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchPuja = async () => {
      if (!id) return;
      const fallbackPuja = resolveFallbackPuja(id);
      try {
        const data = await getPujaDirect(id);
        setPuja(data || fallbackPuja);
      } catch (error) {
        console.error(error);
        setPuja(fallbackPuja);
      } finally {
        setLoading(false);
      }
    };
    fetchPuja();
  }, [id]);

  const availableSlots =
    bookingMode === 'online'
      ? puja?.onlineTimings?.length
        ? puja.onlineTimings
        : puja?.offlineTimings || []
      : puja?.offlineTimings?.length
        ? puja.offlineTimings
        : puja?.onlineTimings || [];

  useEffect(() => {
    if (availableSlots.length === 0) {
      setBookingTime('');
      return;
    }

    if (!availableSlots.includes(bookingTime)) {
      setBookingTime(availableSlots[0]);
    }
  }, [availableSlots, bookingTime]);

  const handleBooking = async () => {
    if (!bookingDate || !bookingTime) {
      alert('Please select a date and time.');
      return;
    }

    setIsBooking(true);
    try {
      await createBookingDirect({
        userId: DEMO_DEVOTEE_PROFILE.uid,
        serviceId: id || puja?.id || '',
        vendorId: puja?.vendorId || 'system',
        type: 'puja',
        mode: bookingMode,
        date: bookingDate,
        timeSlot: bookingTime,
        status: 'confirmed',
        totalAmount: puja?.price || 0,
      });
      alert('Puja booked successfully. Pandit ji will be available in your selected online or offline slot, and you can view the booking in your profile.');
      navigate('/profile');
    } catch (error) {
      console.error('Booking error:', error);
      alert(error instanceof Error ? error.message : 'Failed to book puja. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!puja) return <div className="min-h-screen flex items-center justify-center">Puja not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-stone-500 hover:text-stone-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Services
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="aspect-video rounded-[2rem] overflow-hidden border border-stone-200 shadow-sm">
            <img 
              src={`https://picsum.photos/seed/${id}/1200/800`} 
              alt={puja.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div>
            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4">{puja.title}</h1>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                <Clock className="w-4 h-4 mr-2" />
                {puja.duration}
              </div>
              <div className="flex items-center bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Verified Pandit Ji
              </div>
            </div>
            <p className="text-stone-600 leading-relaxed text-lg">
              {puja.description}
            </p>
            {puja.templeName && (
              <div className="inline-flex items-center mt-5 bg-stone-100 text-stone-700 px-4 py-2 rounded-full text-sm font-bold">
                <MapPin className="w-4 h-4 mr-2" />
                {puja.templeName}
              </div>
            )}
          </div>

          <div className="bg-stone-100 p-8 rounded-3xl space-y-4">
            <h3 className="font-bold text-stone-900">What's Included:</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['Vedic Mantras', 'Puja Samagri', 'Pandit Dakshina', 'Prasad Distribution', 'Online Consultation', 'Digital Certificate'].map((item) => (
                <li key={item} className="flex items-center text-stone-600 text-sm">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
            {puja.onlineTimings?.length ? (
              <div className="pt-4 border-t border-stone-200">
                <p className="text-sm font-bold text-stone-900 mb-2">Online Timings</p>
                <p className="text-sm text-stone-600">{puja.onlineTimings.join(', ')}</p>
              </div>
            ) : null}
            {puja.offlineTimings?.length ? (
              <div className="pt-4 border-t border-stone-200">
                <p className="text-sm font-bold text-stone-900 mb-2">Offline Timings</p>
                <p className="text-sm text-stone-600">{puja.offlineTimings.join(', ')}</p>
              </div>
            ) : null}
            {puja.liveDarshanAvailable ? (
              <div className="flex items-center text-sm font-bold text-blue-600 pt-2">
                <Video className="w-4 h-4 mr-2" />
                Online live darshan coordination available with this service
              </div>
            ) : null}
            <div className="flex items-center text-sm font-bold text-emerald-700 pt-2">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Pandit ji is available both online and offline and will be there as per your booked slot.
            </div>
          </div>
        </motion.div>

        {/* Right: Booking Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-stone-200 shadow-xl shadow-stone-200/50 h-fit sticky top-24"
        >
            <div className="flex items-center justify-between mb-8">
              <span className="text-stone-500 font-medium">Service Price</span>
              <div className="flex items-center text-3xl font-serif font-bold text-orange-600">
                <IndianRupee className="w-6 h-6" />
                <span>{formatIndianRupees(puja.price)}</span>
              </div>
            </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">
                Choose Puja Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBookingMode('online')}
                  className={`px-4 py-3 rounded-xl border text-sm font-bold transition-colors ${
                    bookingMode === 'online'
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  Online Pandit Ji
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode('offline')}
                  className={`px-4 py-3 rounded-xl border text-sm font-bold transition-colors ${
                    bookingMode === 'offline'
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  Offline Visit
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Select Date
              </label>
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Select Time Slot
              </label>
              <select 
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              >
                {availableSlots.length === 0 ? (
                  <option value="">No slots available</option>
                ) : (
                  availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="pt-4">
              <button 
                onClick={handleBooking}
                disabled={isBooking}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {isBooking ? 'Processing...' : 'Confirm Booking'}
              </button>
              <p className="text-center text-xs text-stone-400 mt-4">
                Secure booking powered by DivineConnect. Pandit ji is available online and offline. No hidden charges.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
