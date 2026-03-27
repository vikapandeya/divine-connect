import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Hand,
  Utensils,
  BookOpen,
  ArrowRight,
  Star,
  ShoppingCart,
  IndianRupee,
  Sparkles,
  MessageSquareHeart,
  ShieldCheck,
  Clock3,
  MapPin,
  Newspaper,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import InlineNotice from '../components/InlineNotice';
import { addToCart } from '../lib/cart';
import { formatIndianRupees } from '../lib/utils';
import { createFeedbackDirect, DEMO_DEVOTEE_PROFILE } from '../lib/firestore-data';
import { getProductSpiritualImage, getSpiritualImage } from '../lib/spiritual-images';
import {
  getCurrentDailyPanchang,
  getDailyHoroscope,
  getLocale,
  getLocaleCopy,
  getSpiritualArticles,
  getTempleSpotlights,
  subscribeToLocale,
  type AppLocale,
} from '../lib/platform';

const services = [
  {
    id: 'puja',
    title: 'Sacred Puja Services',
    description: 'Book verified pandit ji for online and offline puja timings that suit your family and festival schedule.',
    meta: 'Online and offline slots daily',
    icon: <Flame className="w-8 h-8 text-orange-500" />,
    color: 'bg-orange-50',
    link: '/services',
  },
  {
    id: 'darshan',
    title: 'Live Darshan Booking',
    description: 'Reserve online live darshan guidance and get temple visit assistance for special occasions and family sankalp.',
    meta: 'Temple support and remote participation',
    icon: <Hand className="w-8 h-8 text-blue-500" />,
    color: 'bg-blue-50',
    link: '/services/darshan',
  },
  {
    id: 'yatra',
    title: 'Yatra Packages',
    description: 'Book full pilgrimage packages for Char Dham, Jyotirlinga circuits, and sacred tirth routes with stay, meals, and transfers.',
    meta: 'Complete dham and tirth circuits',
    icon: <MapPin className="w-8 h-8 text-rose-500" />,
    color: 'bg-rose-50',
    link: '/services/yatra',
  },
  {
    id: 'prasad',
    title: 'Temple Prasad',
    description: 'Order authentic prasad from different mandirs with temple, weight, dispatch, and pack size details. All items are available for delivery.',
    meta: 'Fresh mandir offerings delivered',
    icon: <Utensils className="w-8 h-8 text-emerald-500" />,
    color: 'bg-emerald-50',
    link: '/shop?category=prasad',
  },
  {
    id: 'books',
    title: 'Spiritual Books',
    description: 'Explore sacred texts, guided reading editions, and family-friendly learning material for devotion at home.',
    meta: 'Trusted scriptures and devotional reading',
    icon: <BookOpen className="w-8 h-8 text-violet-500" />,
    color: 'bg-violet-50',
    link: '/shop?category=books',
  },
  {
    id: 'astrology',
    title: 'AI Astrology',
    description: 'Access personalized Vedic guidance instantly in demo mode and move into remedies, puja suggestions, and next steps.',
    meta: 'Instant demo access',
    icon: <Sparkles className="w-8 h-8 text-amber-500" />,
    color: 'bg-amber-50',
    link: '/astrology',
  },
];

const featuredProducts = [
  {
    id: 'prod-kashi-vishwanath-prasad',
    name: 'Kashi Vishwanath Mahaprasad Box',
    price: 699,
    image: getProductSpiritualImage('Prasad', 'Kashi Vishwanath Mahaprasad Box').src,
    rating: 4.9,
    category: 'Prasad',
    templeName: 'Kashi Vishwanath Mandir',
    weight: '500 g',
  },
  {
    id: 'prod-tirupati-laddu',
    name: 'Tirupati Srivari Laddu Prasadam',
    price: 899,
    image: getProductSpiritualImage('Prasad', 'Tirupati Srivari Laddu Prasadam').src,
    rating: 5,
    category: 'Prasad',
    templeName: 'Tirumala Tirupati Devasthanam',
    weight: '750 g',
  },
  {
    id: 'prod-rudraksha-mala',
    name: 'Rudraksha Mala (108 Beads)',
    price: 599,
    image: getProductSpiritualImage('Mala', 'Rudraksha Mala (108 Beads)').src,
    rating: 4.9,
    category: 'Mala',
    templeName: 'Nepal Selection',
    weight: '108 + 1 beads',
  },
  {
    id: 'prod-puja-thali',
    name: 'Handcrafted Puja Thali',
    price: 850,
    image: getProductSpiritualImage('Puja Essentials', 'Handcrafted Puja Thali').src,
    rating: 4.7,
    category: 'Puja Essentials',
    templeName: 'Artisan Offering',
    weight: '12 inch set',
  },
];

const ratingStats = [
  { label: 'Average Rating', value: '4.9/5' },
  { label: 'Devotee Reviews', value: '2,100+' },
  { label: 'Repeat Orders', value: '78%' },
];

export default function Home() {
  const [locale, setLocale] = useState<AppLocale>(getLocale());
  const [formState, setFormState] = useState({
    name: DEMO_DEVOTEE_PROFILE.displayName || '',
    email: DEMO_DEVOTEE_PROFILE.email || '',
    subject: '',
    rating: '5',
    message: '',
  });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{
    tone: 'success' | 'error' | 'info';
    title: string;
    message: string;
  } | null>(null);

  const feedbackHint = useMemo(
    () =>
      'Tell us what felt trustworthy, where the flow can improve, or what sacred offering you want us to add next.',
    [],
  );
  const copy = getLocaleCopy(locale);
  const panchang = getCurrentDailyPanchang(locale);
  const horoscopes = getDailyHoroscope(locale);
  const temples = getTempleSpotlights();
  const articles = getSpiritualArticles();

  useEffect(() => subscribeToLocale(() => setLocale(getLocale())), []);

  const handleFeedbackSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingFeedback(true);
    setFeedbackNotice(null);

    try {
      await createFeedbackDirect({
        name: formState.name,
        email: formState.email,
        subject: formState.subject,
        rating: Number(formState.rating),
        message: formState.message,
      });

      setFeedbackNotice({
        tone: 'success',
        title: 'Feedback shared',
        message: 'Thank you. Your feedback has been shared with the DivineConnect team.',
      });
      setFormState((previous) => ({
        ...previous,
        subject: '',
        rating: '5',
        message: '',
      }));
    } catch (error) {
      console.error('Feedback error:', error);
      setFeedbackNotice({
        tone: 'error',
        title: 'Feedback not submitted',
        message: 'Unable to submit feedback right now. Please try again in a moment.',
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-20 pb-20">
      <section className="relative flex min-h-[72svh] items-center overflow-hidden py-14 sm:min-h-[80vh] sm:py-0">
        <div className="absolute inset-0 z-0">
          <img
            src={getSpiritualImage('mandir').src}
            alt="Hindu temple mandir spiritual hero image"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="mb-6 text-4xl font-serif font-bold leading-tight text-white sm:text-5xl md:text-7xl">
              Connect with the <span className="text-orange-400">Divine</span> from
              Anywhere
            </h1>
            <p className="mb-8 text-base leading-relaxed text-stone-100 sm:text-xl">
              Experience sacred rituals, online live darshan, and temple offerings on
              a platform built for trust, clarity, devotional ease, and reliable delivery.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link
                to="/services/puja"
                className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 text-center"
              >
                {copy.bookPuja}
              </Link>
              <Link
                to="/shop?category=prasad"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all text-center"
              >
                {copy.templePrasad}
              </Link>
              <Link
                to="/knowledge"
                className="bg-white text-stone-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-all text-center shadow-lg shadow-stone-950/10"
              >
                Spiritual Knowledge
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2.75rem] border border-orange-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_55%,#f8fafc_100%)] p-8 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-600">
              {copy.panchangTitle}
            </p>
            <h2 className="mt-4 text-3xl font-serif font-bold text-stone-900">
              {panchang.dateLabel}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
              {copy.panchangDescription}
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { label: 'Tithi', value: panchang.tithi },
                { label: 'Nakshatra', value: panchang.nakshatra },
                { label: 'Muhurat', value: panchang.muhurat },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.75rem] border border-orange-100 bg-white p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
                    {item.label}
                  </p>
                  <p className="mt-3 text-base font-bold text-stone-900">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[1.75rem] border border-orange-100 bg-white px-5 py-4">
              <p className="text-sm font-bold text-stone-900">Devotional Focus</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{panchang.focus}</p>
            </div>
          </div>

          <div className="rounded-[2.75rem] border border-stone-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
              Daily Horoscope
            </p>
            <h2 className="mt-4 text-3xl font-serif font-bold text-stone-900">
              Return every day for auspicious guidance
            </h2>
            <div className="mt-8 space-y-4">
              {horoscopes.map((item) => (
                <div key={item.sign} className="rounded-[1.75rem] border border-stone-200 bg-stone-50 px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-lg font-bold text-stone-900">{item.sign}</p>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-700">
                      Remedy Ready
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">{item.guidance}</p>
                  <p className="mt-2 text-sm font-medium text-stone-900">{item.remedy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 rounded-[3rem] border border-stone-200 bg-[linear-gradient(135deg,#1c1917_0%,#292524_48%,#4c1d95_100%)] px-8 py-10 text-white shadow-xl shadow-stone-900/10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-300">
                New Feature
              </p>
              <h2 className="mt-4 text-3xl font-serif font-bold">
                Full yatra booking for Char Dham, Jyotirlinga, and major tirth circuits
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-stone-200">
                DivineConnect now includes package-based pilgrimage planning with route overview,
                temple-city stays, transport support, and certificate-ready booking history.
              </p>
            </div>
            <Link
              to="/services/yatra"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-bold text-stone-900 hover:bg-orange-50"
            >
              Explore Yatra Packages
            </Link>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">
            Sacred Services
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Choose from puja, darshan, prasad, and AI-led guidance designed for
            families, temple devotees, and spiritual seekers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              viewport={{ once: true }}
              className="group bg-white p-8 rounded-3xl border border-stone-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all"
            >
              <div
                className={`${service.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                {service.icon}
              </div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-stone-400 font-bold mb-3">
                {service.meta}
              </p>
              <h3 className="text-xl font-bold text-stone-900 mb-2">
                {service.title}
              </h3>
              <p className="text-stone-600 text-sm mb-6 leading-relaxed">
                {service.description}
              </p>
              <Link
                to={service.link}
                className="flex items-center text-orange-500 font-bold text-sm group-hover:translate-x-1 transition-transform"
              >
                Explore <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-600">
              Temple Integration
            </p>
            <h2 className="mt-3 text-3xl font-serif font-bold text-stone-900">
              Famous temples with direct spiritual service context
            </h2>
            <p className="mt-3 max-w-2xl text-stone-600">
              These hardcoded temple cards show how the marketplace can connect darshan,
              live puja, and prasad journeys around historical spiritual destinations.
            </p>
          </div>
          <Link to="/services/darshan" className="hidden sm:inline-flex rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-stone-900 hover:border-orange-200 hover:text-orange-600">
            Explore Temple Support
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {temples.map((temple) => (
            <div key={temple.id} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-bold text-orange-600">{temple.city}, {temple.state}</p>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                  Temple Linked
                </span>
              </div>
              <h3 className="mt-3 text-2xl font-serif font-bold text-stone-900">{temple.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{temple.specialty}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {temple.services.map((service) => (
                  <span key={service} className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-bold text-stone-600">
                    {service}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between text-sm text-stone-500">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  {temple.annualVisitors}
                </span>
                <Link to="/services" className="font-bold text-orange-600 hover:text-orange-500">
                  View Services
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8">
          <div className="bg-stone-900 text-white rounded-[3rem] p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.28),_transparent_35%)]" />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-300 mb-4">
                Feedback & Rating
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                Built for trust in every sacred step.
              </h2>
              <p className="text-stone-300 leading-relaxed mb-8 max-w-2xl">
                Share how your puja booking, darshan assistance, prasad ordering,
                or account journey felt. Your feedback helps us improve service
                quality and devotee confidence.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ratingStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[2rem] bg-white/5 border border-white/10 px-5 py-6"
                  >
                    <p className="text-3xl font-serif font-bold text-white mb-2">
                      {stat.value}
                    </p>
                    <p className="text-sm text-stone-300">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-[2rem] bg-white/5 border border-white/10 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="w-5 h-5 text-orange-300" />
                    <p className="font-bold">Verified rituals and temple-backed offerings</p>
                  </div>
                  <p className="text-sm text-stone-300">
                    Puja scheduling, prasad dispatch, and darshan support are framed to
                    feel dependable for families and first-time users.
                  </p>
                </div>
                <div className="rounded-[2rem] bg-white/5 border border-white/10 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock3 className="w-5 h-5 text-orange-300" />
                    <p className="font-bold">Quick response on service issues</p>
                  </div>
                  <p className="text-sm text-stone-300">
                    Use the feedback form to report delays, request new mandirs, or tell us
                    which timings and offerings matter most to your family.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-stone-200 p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                <MessageSquareHeart className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-stone-900">
                  Share Your Feedback
                </h3>
                <p className="text-sm text-stone-500">Tell us how we can serve devotees better.</p>
              </div>
            </div>
            <form className="space-y-5" onSubmit={handleFeedbackSubmit}>
              {feedbackNotice ? (
                <InlineNotice
                  tone={feedbackNotice.tone}
                  title={feedbackNotice.title}
                  message={feedbackNotice.message}
                  onClose={() => setFeedbackNotice(null)}
                />
              ) : null}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((previous) => ({ ...previous, name: event.target.value }))
                  }
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
                <input
                  required
                  type="email"
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((previous) => ({ ...previous, email: event.target.value }))
                  }
                  placeholder="Your email address"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr] gap-4">
                <input
                  type="text"
                  value={formState.subject}
                  onChange={(event) =>
                    setFormState((previous) => ({ ...previous, subject: event.target.value }))
                  }
                  placeholder="Subject, for example puja booking or prasad delivery"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
                <select
                  value={formState.rating}
                  onChange={(event) =>
                    setFormState((previous) => ({ ...previous, rating: event.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                >
                  <option value="5">5 Star</option>
                  <option value="4">4 Star</option>
                  <option value="3">3 Star</option>
                  <option value="2">2 Star</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <textarea
                required
                rows={6}
                value={formState.message}
                onChange={(event) =>
                  setFormState((previous) => ({ ...previous, message: event.target.value }))
                }
                placeholder={feedbackHint}
                className="w-full px-4 py-4 rounded-[1.75rem] border border-stone-200 bg-stone-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
              />
              <button
                type="submit"
                disabled={isSubmittingFeedback}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {isSubmittingFeedback ? 'Submitting Feedback...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-stone-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">
                Spiritual Offerings
              </h2>
              <p className="text-stone-600">
                Temple prasad, devotional essentials, and trusted items for your home altar.
              </p>
            </div>
            <Link
              to="/shop"
              className="hidden sm:flex items-center text-orange-500 font-bold hover:underline"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200 group"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={`${product.name} devotional spiritual product image`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-stone-900">
                      {product.rating}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-2">
                    {product.category}
                  </p>
                  <h3 className="font-bold text-stone-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-stone-500 mb-4">
                    {product.templeName} | {product.weight}
                  </p>
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center text-lg font-serif font-bold text-orange-600">
                      <IndianRupee className="w-4 h-4" />
                      <span>{formatIndianRupees(product.price)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      aria-label={`Add ${product.name} to cart`}
                      className="bg-stone-900 text-white p-2 rounded-xl hover:bg-orange-500 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-600">
              {copy.blogTitle}
            </p>
            <h2 className="mt-3 text-3xl font-serif font-bold text-stone-900">
              Spiritual knowledge content that keeps devotees returning daily
            </h2>
            <p className="mt-3 max-w-2xl text-stone-600">
              {copy.blogDescription}
            </p>
          </div>
          <Link
            to="/knowledge"
            className="hidden sm:inline-flex rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-stone-900 hover:border-orange-200 hover:text-orange-600"
          >
            Open Knowledge Hub
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {articles.map((article) => (
            <article key={article.id} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-bold text-orange-700">
                  {article.category}
                </span>
                <Newspaper className="h-4 w-4 text-stone-400" />
              </div>
              <h3 className="mt-5 text-2xl font-serif font-bold text-stone-900">
                {article.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                {article.excerpt}
              </p>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="font-bold text-stone-900">{article.readTime}</span>
                <Link
                  to={`/knowledge#${article.id}`}
                  className="font-bold text-orange-600 hover:text-orange-500"
                >
                  Read article
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
