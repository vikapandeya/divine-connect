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
  Radio,
  LocateFixed,
  Navigation,
} from 'lucide-react';
import InlineNotice from '../components/InlineNotice';
import { formatIndianRupees } from '../lib/utils';
import { getTodayDateInputValue } from '../lib/utils';
import { createBookingDirect, DEMO_DEVOTEE_PROFILE, getPujaDirect } from '../lib/firestore-data';
import { getLiveSessionInfo } from '../lib/platform';
import { checkPanditAvailability, PanditAvailabilityResult } from '../lib/pandit-availability';
import { getPujaSpiritualImage } from '../lib/spiritual-images';

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
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [offlineLocationInput, setOfflineLocationInput] = useState('');
  const [availabilityResult, setAvailabilityResult] = useState<PanditAvailabilityResult | null>(null);
  const [bookingNotice, setBookingNotice] = useState<{
    tone: 'success' | 'error' | 'info';
    title: string;
    message: string;
  } | null>(null);

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
  const liveSession = getLiveSessionInfo(puja?.title || 'sacred-puja');
  const travelSurcharge = bookingMode === 'offline' ? availabilityResult?.travelSurcharge || 0 : 0;
  const bookingTotal = (puja?.price || 0) + travelSurcharge;
  const isOfflineBookingBlocked =
    bookingMode === 'offline' && (!availabilityResult || availabilityResult.status === 'unavailable');
  const availabilityTone =
    availabilityResult?.status === 'unavailable'
      ? 'error'
      : availabilityResult?.status === 'limited'
        ? 'info'
        : 'success';

  useEffect(() => {
    if (availableSlots.length === 0) {
      setBookingTime('');
      return;
    }

    if (!availableSlots.includes(bookingTime)) {
      setBookingTime(availableSlots[0]);
    }
  }, [availableSlots, bookingTime]);

  useEffect(() => {
    if (bookingMode === 'online') {
      setOfflineLocationInput('');
      setAvailabilityResult(null);
    }
  }, [bookingMode]);

  const handleManualAvailabilityCheck = async () => {
    if (!offlineLocationInput.trim()) {
      setBookingNotice({
        tone: 'error',
        title: 'Enter your area or city',
        message: 'Please share your locality, area, or city so we can check pandit ji availability.',
      });
      return;
    }

    setIsCheckingAvailability(true);
    setBookingNotice(null);

    try {
      const result = checkPanditAvailability({
        locationSource: 'manual',
        locationLabel: offlineLocationInput,
      });

      setAvailabilityResult(result);
      setBookingNotice({
        tone: result.status === 'unavailable' ? 'error' : result.status === 'limited' ? 'info' : 'success',
        title:
          result.status === 'available'
            ? 'Pandit ji available'
            : result.status === 'limited'
              ? 'Limited offline availability'
              : 'Offline visit not available yet',
        message: result.summary,
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleLiveLocationCheck = async () => {
    if (!navigator.geolocation) {
      setBookingNotice({
        tone: 'error',
        title: 'Live location unavailable',
        message: 'Your browser does not support live location. Please enter your area manually.',
      });
      return;
    }

    setIsCheckingAvailability(true);
    setBookingNotice(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const liveLocationLabel = `Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`;
        const result = checkPanditAvailability({
          locationSource: 'live',
          locationLabel: liveLocationLabel,
          latitude,
          longitude,
        });

        setOfflineLocationInput(liveLocationLabel);
        setAvailabilityResult(result);
        setBookingNotice({
          tone: result.status === 'unavailable' ? 'error' : result.status === 'limited' ? 'info' : 'success',
          title:
            result.status === 'available'
              ? 'Live location verified'
              : result.status === 'limited'
                ? 'Location serviceable with coordination'
                : 'Location outside current service zone',
          message: result.summary,
        });
        setIsCheckingAvailability(false);
      },
      (error) => {
        console.error('Live location error:', error);
        setBookingNotice({
          tone: 'error',
          title: 'Location access denied',
          message: 'Please allow live location access or enter your place manually to continue.',
        });
        setIsCheckingAvailability(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleBooking = async () => {
    if (!bookingDate || !bookingTime) {
      setBookingNotice({
        tone: 'error',
        title: 'Choose a date and time',
        message: 'Please select your puja date and preferred slot before continuing.',
      });
      return;
    }

    if (bookingMode === 'offline' && !availabilityResult) {
      setBookingNotice({
        tone: 'error',
        title: 'Check location availability first',
        message: 'Share your live location or enter your place so we can confirm pandit ji coverage before booking.',
      });
      return;
    }

    if (bookingMode === 'offline' && availabilityResult.status === 'unavailable') {
      setBookingNotice({
        tone: 'error',
        title: 'Offline visit unavailable',
        message: 'This location is outside the active service network. Please switch to online puja or try another address.',
      });
      return;
    }

    setIsBooking(true);
    setBookingNotice(null);
    try {
      await createBookingDirect({
        userId: DEMO_DEVOTEE_PROFILE.uid,
        serviceId: id || puja?.id || '',
        serviceTitle: puja?.title || 'Puja Service',
        vendorId: puja?.vendorId || 'system',
        type: 'puja',
        mode: bookingMode,
        date: bookingDate,
        timeSlot: bookingTime,
        status: 'confirmed',
        totalAmount: bookingTotal,
        offlineLocationLabel: bookingMode === 'offline' ? availabilityResult?.locationLabel : undefined,
        offlineLocationSource: bookingMode === 'offline' ? availabilityResult?.locationSource : undefined,
        offlineLocationCity: bookingMode === 'offline' ? availabilityResult?.city : undefined,
        offlineLocationState: bookingMode === 'offline' ? availabilityResult?.state : undefined,
        offlineLocationLatitude: bookingMode === 'offline' ? availabilityResult?.latitude : undefined,
        offlineLocationLongitude: bookingMode === 'offline' ? availabilityResult?.longitude : undefined,
        panditAvailabilityStatus: bookingMode === 'offline' ? availabilityResult?.status : undefined,
        panditAvailabilitySummary: bookingMode === 'offline' ? availabilityResult?.summary : undefined,
        panditAvailabilityNote: bookingMode === 'offline' ? availabilityResult?.note : undefined,
        serviceZoneLabel: bookingMode === 'offline' ? availabilityResult?.zoneLabel : undefined,
        travelSurcharge: bookingMode === 'offline' ? availabilityResult?.travelSurcharge : undefined,
        availabilityCheckedAt: bookingMode === 'offline' ? availabilityResult?.checkedAt : undefined,
      });
      setBookingNotice({
        tone: 'success',
        title: 'Puja booked successfully',
        message:
          bookingMode === 'offline'
            ? 'Pandit ji coverage has been saved with your booking, and the visit details will appear in your profile history.'
            : 'Pandit ji will be available in your selected slot, and your certificate plus invitation card are ready in your profile.',
      });
      window.setTimeout(() => navigate('/profile?tab=bookings'), 700);
    } catch (error) {
      console.error('Booking error:', error);
      setBookingNotice({
        tone: 'error',
        title: 'Booking failed',
        message: error instanceof Error ? error.message : 'Failed to book puja. Please try again.',
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
          <p className="text-sm font-medium text-stone-500">Loading puja details...</p>
        </div>
      </div>
    );
  }

  if (!puja) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center rounded-[2rem] border border-stone-200 bg-white px-8 py-10">
          <p className="text-xl font-serif font-bold text-stone-900 mb-2">Puja not found</p>
          <p className="text-sm text-stone-500">Please return to the services page and choose another ritual.</p>
        </div>
      </div>
    );
  }

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
              src={getPujaSpiritualImage(puja.title).src}
              alt={`${puja.title} Hindu puja spiritual image`}
              className="w-full h-full object-cover"
              loading="eager"
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
            {bookingMode === 'online' ? (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
                  <Radio className="w-4 h-4" />
                  Live Puja Streaming
                </div>
                <div className="mt-3 space-y-2 text-sm text-stone-600">
                  <p>Provider: <span className="font-bold text-stone-900">{liveSession.provider}</span></p>
                  <p>Room Code: <span className="font-bold text-stone-900">{liveSession.roomCode}</span></p>
                  <p>{liveSession.joinWindow}</p>
                </div>
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
          className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-stone-200 shadow-xl shadow-stone-200/50 h-fit lg:sticky lg:top-24"
        >
          <div className="mb-8 rounded-[2rem] border border-orange-100 bg-orange-50/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 font-medium">Service Price</span>
              <div className="flex items-center text-3xl font-serif font-bold text-orange-600">
                <IndianRupee className="w-6 h-6" />
                <span>{formatIndianRupees(puja.price)}</span>
              </div>
            </div>
            {bookingMode === 'offline' ? (
              <div className="mt-4 space-y-2 border-t border-orange-100 pt-4">
                <div className="flex items-center justify-between text-sm text-stone-600">
                  <span>Travel coordination</span>
                  <span className="font-bold text-stone-900">
                    {travelSurcharge > 0 ? formatIndianRupees(travelSurcharge) : 'Included'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-stone-900">
                  <span>Offline total</span>
                  <span>{formatIndianRupees(bookingTotal)}</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            {bookingNotice ? (
              <InlineNotice
                tone={bookingNotice.tone}
                title={bookingNotice.title}
                message={bookingNotice.message}
                onClose={() => setBookingNotice(null)}
              />
            ) : null}
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

            {bookingMode === 'offline' ? (
              <div className="rounded-[2rem] border border-stone-200 bg-stone-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-stone-900">Check pandit ji availability</p>
                    <p className="mt-1 text-sm text-stone-600">
                      Share live location or enter your area so we can verify whether offline puja service is available there.
                    </p>
                  </div>
                  <div className="rounded-full bg-orange-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700">
                    Offline only
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <button
                    type="button"
                    onClick={handleLiveLocationCheck}
                    disabled={isCheckingAvailability}
                    className="inline-flex items-center justify-center rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-bold text-orange-600 transition-colors hover:bg-orange-50 disabled:opacity-60"
                  >
                    <LocateFixed className="mr-2 h-4 w-4" />
                    {isCheckingAvailability ? 'Checking location...' : 'Use Live Location'}
                  </button>
                  <button
                    type="button"
                    onClick={handleManualAvailabilityCheck}
                    disabled={isCheckingAvailability}
                    className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-stone-800 disabled:opacity-60"
                  >
                    Check Availability
                  </button>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    Area, locality, or city
                  </label>
                  <input
                    type="text"
                    value={offlineLocationInput}
                    onChange={(event) => {
                      setOfflineLocationInput(event.target.value);
                      if (availabilityResult?.locationSource === 'manual') {
                        setAvailabilityResult(null);
                      }
                    }}
                    placeholder="Example: Sigra, Varanasi"
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {availabilityResult ? (
                  <div className="mt-4">
                    <InlineNotice
                      tone={availabilityTone}
                      title={
                        availabilityResult.status === 'available'
                          ? 'Pandit ji is available for this address'
                          : availabilityResult.status === 'limited'
                            ? 'Pandit ji can visit with route coordination'
                            : 'This address is outside the active offline network'
                      }
                      message={availabilityResult.summary}
                    />
                    <div className="mt-3 rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
                      <div className="flex items-center gap-2 font-bold text-stone-900">
                        <Navigation className="h-4 w-4 text-orange-500" />
                        {availabilityResult.zoneLabel}
                      </div>
                      <p className="mt-3">
                        Location source: <span className="font-bold text-stone-900">{availabilityResult.locationSource === 'live' ? 'Live location' : 'Manual place entry'}</span>
                      </p>
                      <p className="mt-2">
                        Checked location: <span className="font-bold text-stone-900">{availabilityResult.locationLabel}</span>
                      </p>
                      {availabilityResult.city ? (
                        <p className="mt-2">
                          Dispatch city: <span className="font-bold text-stone-900">{availabilityResult.city}{availabilityResult.state ? `, ${availabilityResult.state}` : ''}</span>
                        </p>
                      ) : null}
                      {typeof availabilityResult.distanceKm === 'number' ? (
                        <p className="mt-2">
                          Distance from nearest seva zone: <span className="font-bold text-stone-900">{availabilityResult.distanceKm} km</span>
                        </p>
                      ) : null}
                      <p className="mt-2">
                        Travel coordination: <span className="font-bold text-stone-900">
                          {availabilityResult.travelSurcharge > 0
                            ? formatIndianRupees(availabilityResult.travelSurcharge)
                            : 'Included in service price'}
                        </span>
                      </p>
                      <p className="mt-2">
                        Next availability: <span className="font-bold text-stone-900">{availabilityResult.nextAvailableWindow}</span>
                      </p>
                      <p className="mt-2">{availabilityResult.note}</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-stone-500">
                    Offline bookings need a location check so we can confirm the nearest pandit ji service zone before assigning the slot.
                  </p>
                )}
              </div>
            ) : null}

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Select Date
              </label>
              <input 
                type="date" 
                min={getTodayDateInputValue()}
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
                disabled={isBooking || isCheckingAvailability || isOfflineBookingBlocked}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {isBooking ? 'Processing...' : 'Confirm Booking'}
              </button>
              {bookingMode === 'online' ? (
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                    Live participation
                  </p>
                  <p className="mt-2 text-sm text-stone-600">
                    After booking, the demo profile shows a join-ready streaming room with host, room code,
                    and notification updates for your puja slot.
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-left">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-700">
                    Offline verification
                  </p>
                  <p className="mt-2 text-sm text-stone-600">
                    We confirm the serviceable area, travel coordination, and nearest pandit ji network before placing an offline booking.
                  </p>
                </div>
              )}
              <p className="text-center text-xs text-stone-400 mt-4">
                Secure booking powered by DivineConnect. Offline bookings may include a location-based travel coordination charge after availability is checked.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
