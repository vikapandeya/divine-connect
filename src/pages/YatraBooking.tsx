import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BedDouble,
  Bus,
  CalendarDays,
  Compass,
  IndianRupee,
  MapPinned,
  ShieldCheck,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHero from '../components/PageHero';
import InlineNotice from '../components/InlineNotice';
import { createBookingDirect, DEMO_DEVOTEE_PROFILE, listYatraPackagesDirect } from '../lib/firestore-data';
import { formatIndianRupees, getTodayDateInputValue, getYatraPlaceholderImage } from '../lib/utils';
import { YatraPackage } from '../types';
import { translateText, useAppLocale } from '../lib/i18n';

const packageTypes: Array<{ value: 'all' | YatraPackage['packageType']; label: string }> = [
  { value: 'all', label: 'All Routes' },
  { value: 'char-dham', label: 'Char Dham' },
  { value: 'jyotirlinga', label: 'Jyotirlinga' },
  { value: 'tirth-sthal', label: 'Tirth Sthal' },
  { value: 'dham-circuit', label: 'Dham Circuits' },
];

export default function YatraBooking() {
  const locale = useAppLocale();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [packages, setPackages] = useState<YatraPackage[]>([]);
  const [activeType, setActiveType] = useState<'all' | YatraPackage['packageType']>('all');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [departureCity, setDepartureCity] = useState('');
  const [travellers, setTravellers] = useState('2');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingNotice, setBookingNotice] = useState<{
    tone: 'success' | 'error' | 'info';
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    const packageType = searchParams.get('type') as YatraPackage['packageType'] | null;
    const packageId = searchParams.get('package');

    if (packageType && packageTypes.some((item) => item.value === packageType)) {
      setActiveType(packageType);
    }

    if (packageId) {
      setSelectedPackageId(packageId);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        const data = await listYatraPackagesDirect(
          activeType === 'all' ? {} : { packageType: activeType },
        );
        setPackages(data);
      } catch (error) {
        console.error('Error loading yatra packages:', error);
      }
    };

    loadPackages();
  }, [activeType]);

  useEffect(() => {
    if (!packages.length) {
      return;
    }

    const selectedFromQuery = packages.find((item) => item.id === selectedPackageId);
    const nextPackage = selectedFromQuery || packages[0];

    if (nextPackage.id !== selectedPackageId) {
      setSelectedPackageId(nextPackage.id);
    }

    if (!departureCity || !nextPackage.departureCities.includes(departureCity)) {
      setDepartureCity(nextPackage.departureCities[0]);
    }
  }, [packages, selectedPackageId, departureCity]);

  const selectedPackage = useMemo(
    () => packages.find((item) => item.id === selectedPackageId) || packages[0] || null,
    [packages, selectedPackageId],
  );

  const totalPrice = useMemo(() => {
    const travellersCount = Number(travellers) || 1;
    return (selectedPackage?.startingPrice || 0) * travellersCount;
  }, [selectedPackage, travellers]);

  const updateSearch = (type: 'all' | YatraPackage['packageType'], packageId?: string) => {
    const nextParams = new URLSearchParams();
    if (type !== 'all') {
      nextParams.set('type', type);
    }
    if (packageId) {
      nextParams.set('package', packageId);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handlePackageTypeChange = (type: 'all' | YatraPackage['packageType']) => {
    setActiveType(type);
    updateSearch(type);
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackageId(packageId);
    updateSearch(activeType, packageId);
  };

  const handleBooking = async () => {
    if (!selectedPackage || !departureDate || !departureCity || !travellers) {
      setBookingNotice({
        tone: 'error',
        title: translateText(locale, 'Complete your yatra details'),
        message: translateText(locale, 'Please choose your package, departure date, city, and traveller count.'),
      });
      return;
    }

    setIsSubmitting(true);
    setBookingNotice(null);
    try {
      await createBookingDirect({
        userId: DEMO_DEVOTEE_PROFILE.uid,
        serviceId: selectedPackage.id,
        serviceTitle: selectedPackage.title,
        vendorId: 'system',
        type: 'yatra',
        mode: 'offline',
        date: departureDate,
        timeSlot: `${selectedPackage.duration} | ${travellers} yatri`,
        status: 'confirmed',
        totalAmount: totalPrice,
      });

      setBookingNotice({
        tone: 'success',
        title: translateText(locale, 'Yatra package booked successfully'),
        message: translateText(locale, 'Your pilgrimage booking is now visible in Profile with certificate-ready records.'),
      });
      window.setTimeout(() => navigate('/profile?tab=bookings'), 700);
    } catch (error) {
      console.error('Yatra booking error:', error);
      setBookingNotice({
        tone: 'error',
        title: translateText(locale, 'Yatra package could not be reserved'),
        message: error instanceof Error ? error.message : translateText(locale, 'Unable to reserve this yatra package right now.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <PageHero
        eyebrow={translateText(locale, 'Pilgrimage Packages')}
        title={translateText(locale, 'Book full yatra packages for Char Dham, Jyotirlinga circuits, and major tirth sthals.')}
        description={translateText(locale, 'This new feature brings complete pilgrimage planning into DivineConnect with curated routes, temple-city stays, meal coverage, transfers, and a simpler booking flow for devotees and families.')}
        stats={[
          { label: 'Package Types', value: 'Char Dham, Jyotirlinga, Tirth' },
          { label: 'Booking Model', value: 'Full Package' },
          { label: 'Records', value: 'Profile & Certificate Ready' },
        ]}
        aside={
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-300">
              What is included
            </p>
            <div className="mt-5 space-y-3 text-sm text-stone-200">
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                Transport, stay, meals, and route guidance in one package.
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                Pilgrimage routes across dham circuits, tirth sthals, and Jyotirlinga destinations.
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                Certificate-ready booking records inside the profile history.
              </div>
            </div>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {packageTypes.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => handlePackageTypeChange(item.value)}
            className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
              activeType === item.value
                ? 'bg-stone-900 text-white'
                : 'border border-stone-200 bg-white text-stone-600 hover:border-orange-200 hover:text-orange-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1.08fr)_24rem] 2xl:grid-cols-[minmax(0,1.1fr)_25rem]">
        <div className="space-y-6">
          {packages.map((yatraPackage, index) => (
            <motion.button
              key={yatraPackage.id}
              type="button"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handlePackageSelect(yatraPackage.id)}
              className={`w-full overflow-hidden rounded-[2.75rem] border text-left transition-all ${
                selectedPackage?.id === yatraPackage.id
                  ? 'border-orange-300 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)] shadow-xl shadow-orange-500/10'
                  : 'border-stone-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-200/40'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
                <div className="relative min-h-[250px] overflow-hidden lg:min-h-full">
                  <img
                    src={yatraPackage.image}
                    alt={`${yatraPackage.title} pilgrimage yatra image`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(event) => {
                      if (event.currentTarget.dataset.fallbackApplied === 'true') {
                        return;
                      }

                      event.currentTarget.dataset.fallbackApplied = 'true';
                      event.currentTarget.src = getYatraPlaceholderImage(
                        yatraPackage.title,
                        yatraPackage.packageType.replace('-', ' '),
                        yatraPackage.destinations.slice(0, 3).join(' | '),
                      );
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/10 to-transparent" />
                  {yatraPackage.badge ? (
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-stone-900">
                      {yatraPackage.badge}
                    </span>
                  ) : null}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-sm">
                      <Compass className="h-3.5 w-3.5" />
                      {yatraPackage.destinations.length} sacred stops
                    </div>
                  </div>
                </div>

                <div className="p-7">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-orange-600">
                        {yatraPackage.packageType.replace('-', ' ')}
                      </p>
                      <h2 className="mt-3 text-2xl font-serif font-bold text-stone-900">
                        {yatraPackage.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-stone-600">
                        {yatraPackage.description}
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] border border-orange-100 bg-orange-50 px-4 py-4 text-left lg:min-w-[180px] lg:text-right">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">
                        Starting from
                      </p>
                      <div className="mt-3 flex items-center text-2xl font-serif font-bold text-orange-600 lg:justify-end">
                        <IndianRupee className="h-5 w-5" />
                        <span>{formatIndianRupees(yatraPackage.startingPrice)}</span>
                      </div>
                      <p className="mt-1 text-xs text-stone-500">per yatri</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                    {[
                      { label: 'Duration', value: yatraPackage.duration, icon: CalendarDays },
                      { label: 'Transport', value: yatraPackage.transport, icon: Bus },
                      { label: 'Stay', value: yatraPackage.stay, icon: BedDouble },
                      { label: 'Meals', value: yatraPackage.meals, icon: UtensilsCrossed },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="rounded-[1.5rem] border border-stone-200 bg-white px-4 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-stone-400">
                            <Icon className="h-4 w-4 text-orange-500" />
                            {item.label}
                          </div>
                          <p className="mt-3 text-sm leading-relaxed font-bold text-stone-900">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-5 2xl:grid-cols-[1fr_0.95fr]">
                    <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">
                        Destinations and route
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {yatraPackage.destinations.map((destination) => (
                          <span
                            key={destination}
                            className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600"
                          >
                            {destination}
                          </span>
                        ))}
                      </div>
                      <div className="mt-5 space-y-2 text-sm text-stone-600">
                        {yatraPackage.routePlan.map((step) => (
                          <p key={step} className="flex items-start gap-2">
                            <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                            <span>{step}</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">
                        Package inclusions
                      </p>
                      <div className="mt-4 space-y-2 text-sm text-stone-600">
                        {yatraPackage.inclusions.map((item) => (
                          <p key={item} className="flex items-start gap-2">
                            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <span>{item}</span>
                          </p>
                        ))}
                      </div>
                      <div className="mt-5 rounded-[1.25rem] bg-stone-50 px-4 py-3 text-sm text-stone-600">
                        <span className="font-bold text-stone-900">Best season:</span> {yatraPackage.bestSeason}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="h-fit rounded-[2.75rem] border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50 xl:sticky xl:top-24">
          {selectedPackage ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-600">
                Yatra Reservation
              </p>
              <h2 className="mt-4 text-3xl font-serif font-bold text-stone-900">
                {selectedPackage.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                Reserve this full pilgrimage package and keep the booking record ready inside your profile.
              </p>

              {bookingNotice ? (
                <InlineNotice
                  tone={bookingNotice.tone}
                  title={bookingNotice.title}
                  message={bookingNotice.message}
                  onClose={() => setBookingNotice(null)}
                  className="mt-6"
                />
              ) : null}

              <div className="mt-6 rounded-[2rem] border border-orange-100 bg-[linear-gradient(135deg,#fff7ed_0%,#ffedd5_100%)] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">
                      Package base fare
                    </p>
                    <p className="mt-2 text-sm text-stone-600">{selectedPackage.duration}</p>
                  </div>
                  <div className="flex items-center text-3xl font-serif font-bold text-orange-600">
                    <IndianRupee className="h-6 w-6" />
                    <span>{formatIndianRupees(selectedPackage.startingPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-stone-700">Departure City</label>
                  <select
                    value={departureCity}
                    onChange={(event) => setDepartureCity(event.target.value)}
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-orange-500"
                  >
                    {selectedPackage.departureCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-stone-700">Departure Date</label>
                  <input
                    type="date"
                    min={getTodayDateInputValue()}
                    value={departureDate}
                    onChange={(event) => setDepartureDate(event.target.value)}
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-stone-700">Travellers</label>
                  <select
                    value={travellers}
                    onChange={(event) => setTravellers(event.target.value)}
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-transparent focus:ring-2 focus:ring-orange-500"
                  >
                    {['1', '2', '3', '4', '5', '6+'].map((option) => (
                      <option key={option} value={option === '6+' ? '6' : option}>
                        {option} yatri
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 rounded-[2rem] border border-stone-200 bg-stone-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-stone-600">Departure city</span>
                  <span className="text-sm font-bold text-stone-900">{departureCity}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-sm text-stone-600">Travellers</span>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-stone-900">
                    <Users className="h-4 w-4 text-orange-500" />
                    {travellers}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-sm text-stone-600">Package type</span>
                  <span className="text-sm font-bold capitalize text-stone-900">{selectedPackage.packageType.replace('-', ' ')}</span>
                </div>
                <div className="mt-4 border-t border-stone-200 pt-4 flex items-center justify-between gap-4">
                  <span className="text-base font-bold text-stone-900">Estimated Total</span>
                  <div className="flex items-center text-2xl font-serif font-bold text-orange-600">
                    <IndianRupee className="h-5 w-5" />
                    <span>{formatIndianRupees(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBooking}
                disabled={isSubmitting}
                className="mt-6 w-full rounded-2xl bg-stone-900 py-4 text-lg font-bold text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Booking Package...' : 'Confirm Yatra Package'}
              </button>

              <div className="mt-5 rounded-[1.75rem] border border-stone-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">
                  After booking
                </p>
                <div className="mt-4 space-y-2 text-sm text-stone-600">
                  <p className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Certificate-ready pilgrimage record in your profile.
                  </p>
                  <p className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Hardcoded support flow for departure updates and itinerary reminders.
                  </p>
                  <p className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Designed to expand later into full travel operations and vendor management.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-[2rem] border border-stone-200 bg-stone-50 px-6 py-10 text-center">
              <p className="text-lg font-bold text-stone-900">No yatra package found</p>
              <p className="mt-3 text-sm text-stone-600">Choose another route filter to continue.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
