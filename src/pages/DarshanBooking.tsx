import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Video, ShieldCheck, ArrowRight, Radio } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { createBookingDirect, DEMO_DEVOTEE_PROFILE } from '../lib/firestore-data';
import { getLiveSessionInfo } from '../lib/platform';

const temples = [
  {
    id: 'kashi-vishwanath',
    name: 'Kashi Vishwanath Mandir',
    city: 'Varanasi',
    description: 'Online live darshan support, sankalp assistance, and festival day coordination.',
  },
  {
    id: 'tirupati-balaji',
    name: 'Tirupati Balaji Temple',
    city: 'Tirupati',
    description: 'Guided darshan slot support for family groups and online devotional participation.',
  },
  {
    id: 'jagannath-puri',
    name: 'Jagannath Mandir',
    city: 'Puri',
    description: 'Seasonal darshan requests, special puja planning, and remote seva coordination.',
  },
];

const onlineSlots = ['06:30 AM - 07:00 AM', '08:00 AM - 08:30 AM', '07:00 PM - 07:30 PM'];
const offlineSlots = ['07:30 AM - 09:00 AM', '10:00 AM - 11:30 AM', '05:00 PM - 06:30 PM'];

export default function DarshanBooking() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    templeId: temples[0].id,
    date: '',
    timeSlot: onlineSlots[0],
    mode: 'online' as 'online' | 'offline',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTemple = useMemo(
    () => temples.find((temple) => temple.id === formData.templeId) || temples[0],
    [formData.templeId],
  );
  const liveSession = getLiveSessionInfo(`${selectedTemple.name} darshan`);

  const availableSlots = formData.mode === 'online' ? onlineSlots : offlineSlots;

  useEffect(() => {
    if (!availableSlots.includes(formData.timeSlot)) {
      setFormData((current) => ({
        ...current,
        timeSlot: availableSlots[0],
      }));
    }
  }, [availableSlots, formData.timeSlot]);

  const handleBookDarshan = async () => {
    if (!formData.date || !formData.timeSlot) {
      alert('Please choose your darshan date and time slot.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createBookingDirect({
        userId: DEMO_DEVOTEE_PROFILE.uid,
        serviceId: formData.templeId,
        serviceTitle: `${selectedTemple.name} Darshan`,
        vendorId: 'system',
        type: 'darshan',
        mode: formData.mode,
        date: formData.date,
        timeSlot: formData.timeSlot,
        status: 'confirmed',
        totalAmount: 0,
      });

      alert('Darshan booked successfully. You can see it in your profile bookings.');
      navigate('/profile?tab=bookings');
    } catch (error) {
      console.error('Darshan booking error:', error);
      alert(error instanceof Error ? error.message : 'Unable to reserve darshan right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <PageHero
        eyebrow="Live Darshan"
        title="Reserve temple darshan with a clearer choice between online participation and on-site visit support."
        description="This flow is designed to reduce uncertainty around temple selection, mode, date, and available slots so devotees can confirm darshan with more confidence."
        stats={[
          { label: 'Temple Options', value: `${temples.length}` },
          { label: 'Support Modes', value: 'Online & Offline' },
          { label: 'Booking Outcome', value: 'Profile Synced' },
        ]}
        actions={
          <Link
            to="/profile?tab=bookings"
            className="inline-flex items-center rounded-full bg-white px-6 py-3 font-bold text-stone-900 hover:bg-stone-100"
          >
            View My Bookings
          </Link>
        }
        aside={
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-300">
              Booking improvements
            </p>
            <div className="mt-5 space-y-3 text-sm text-stone-200">
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                Stronger hierarchy between temple discovery and reservation form.
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                Cleaner mode selection and more balanced information cards.
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                Sticky booking card keeps the action clear while comparing options.
              </div>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
              <Video className="w-6 h-6 text-blue-500 mb-3" />
              <h2 className="font-bold text-stone-900 mb-2">Online Live Darshan</h2>
              <p className="text-sm text-stone-600">
                Join remotely with guided support for live devotional participation.
              </p>
            </div>
            <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
              <MapPin className="w-6 h-6 text-orange-500 mb-3" />
              <h2 className="font-bold text-stone-900 mb-2">Offline Visit Support</h2>
              <p className="text-sm text-stone-600">
                Plan family darshan with timing windows and visit assistance.
              </p>
            </div>
            <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-emerald-500 mb-3" />
              <h2 className="font-bold text-stone-900 mb-2">Trusted Coordination</h2>
              <p className="text-sm text-stone-600">
                Clear slots, timely updates, and support for devotional occasions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {temples.map((temple) => (
              <motion.button
                key={temple.id}
                type="button"
                whileHover={{ y: -2 }}
                onClick={() => setFormData((current) => ({ ...current, templeId: temple.id }))}
                className={`text-left rounded-[2rem] border p-6 transition-colors ${
                  formData.templeId === temple.id
                    ? 'border-orange-200 bg-orange-50 shadow-sm'
                    : 'border-stone-200 bg-white shadow-sm'
                }`}
              >
                <p className="text-sm font-bold text-orange-600 mb-2">{temple.city}</p>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{temple.name}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{temple.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="sticky top-28 h-fit rounded-[2.5rem] border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/40">
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">
            Reserve Darshan
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Temple</label>
              <div className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-medium">
                {selectedTemple.name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((current) => ({ ...current, mode: 'online' }))}
                  className={`px-4 py-3 rounded-xl border text-sm font-bold transition-colors ${
                    formData.mode === 'online'
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((current) => ({ ...current, mode: 'offline' }))}
                  className={`px-4 py-3 rounded-xl border text-sm font-bold transition-colors ${
                    formData.mode === 'offline'
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  Offline
                </button>
              </div>
            </div>

            {formData.mode === 'online' ? (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
                  <Radio className="w-4 h-4" />
                  Live darshan room
                </div>
                <div className="mt-3 space-y-2 text-sm text-stone-600">
                  <p>Provider: <span className="font-bold text-stone-900">{liveSession.provider}</span></p>
                  <p>Room Code: <span className="font-bold text-stone-900">{liveSession.roomCode}</span></p>
                  <p>{liveSession.joinWindow}</p>
                </div>
              </div>
            ) : null}

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Select Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, date: event.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Available Slot
              </label>
              <select
                value={formData.timeSlot}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, timeSlot: event.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              >
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleBookDarshan}
              disabled={isSubmitting}
              className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-500 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {isSubmitting ? 'Booking...' : 'Confirm Darshan'}
              {!isSubmitting && <ArrowRight className="w-5 h-5 ml-2" />}
            </button>
            <p className="text-xs text-stone-500 leading-relaxed">
              Darshan support is confirmed for both online live viewing and offline visit planning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
