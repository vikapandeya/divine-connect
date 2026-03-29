import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  Quote,
  Send,
  CheckCircle2,
  Users,
  Eye,
  Calendar,
  User,
  Play,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { addToCart } from '../lib/cart';
import { formatIndianRupees } from '../lib/utils';
import DailyPanchang from '../components/DailyPanchang';
import DailyHoroscope from '../components/DailyHoroscope';
import AuthModal from '../components/AuthModal';
import { auth } from '../firebase';

const services = [
  {
    id: 'puja',
    title: 'Puja Booking',
    description: 'Book pandit and puja online for any occasion.',
    icon: <Flame className="w-8 h-8 text-orange-500" />,
    color: 'bg-orange-50',
    link: '/services/puja',
  },
  {
    id: 'darshan',
    title: 'Darshan',
    description: 'Reserve temple darshan guidance and plan your visit with ease.',
    icon: <Hand className="w-8 h-8 text-blue-500" />,
    color: 'bg-blue-50',
    link: '/contact',
  },
  {
    id: 'prasad',
    title: 'Prasad',
    description: 'Order authentic temple prasad delivered to your door.',
    icon: <Utensils className="w-8 h-8 text-emerald-500" />,
    color: 'bg-emerald-50',
    link: '/shop',
  },
  {
    id: 'books',
    title: 'Spiritual Books',
    description: 'Explore our collection of sacred texts and e-books.',
    icon: <BookOpen className="w-8 h-8 text-purple-500" />,
    color: 'bg-purple-50',
    link: '/shop?category=books',
  },
  {
    id: 'astrology',
    title: 'AI Astrology',
    description: 'Get guided astrological insights after sign-in from our AI assistant.',
    icon: <Sparkles className="w-8 h-8 text-amber-500" />,
    color: 'bg-amber-50',
    link: '/astrology',
  },
  {
    id: 'temples',
    title: 'Temple Knowledge',
    description: 'Learn about sacred temples and tirthplaces across India.',
    icon: <MapPin className="w-8 h-8 text-rose-500" />,
    color: 'bg-rose-50',
    link: '/temple-knowledge',
  },
  {
    id: 'yatra',
    title: 'Yatra',
    description: 'Guided pilgrimage tours to India\'s most sacred sites.',
    icon: <MapPin className="w-8 h-8 text-orange-600" />,
    color: 'bg-orange-50',
    link: '/services/yatra',
  },
];

const featuredProducts = [
  {
    id: '1',
    name: 'Brass Ganesha Idol',
    price: 1299,
    image: 'https://picsum.photos/seed/ganesha/400/400',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Natural Sandalwood Incense',
    price: 250,
    image: 'https://picsum.photos/seed/incense/400/400',
    rating: 4.5,
  },
  {
    id: '3',
    name: 'Rudraksha Mala (108 Beads)',
    price: 599,
    image: 'https://picsum.photos/seed/mala/400/400',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Handcrafted Puja Thali',
    price: 850,
    image: 'https://picsum.photos/seed/thali/400/400',
    rating: 4.7,
  },
];

const feedback = [
  {
    name: 'Anjali Sharma',
    city: 'Mumbai',
    rating: 5,
    message:
      'Booking a Satyanarayan Puja felt smooth and respectful. The experience was simple even for my family elders.',
  },
  {
    name: 'Rohan Iyer',
    city: 'Bengaluru',
    rating: 5,
    message:
      'The product flow is clean, and I liked that I could find essentials quickly without feeling lost in the catalog.',
  },
  {
    name: 'Meera Kapoor',
    city: 'Delhi',
    rating: 4.9,
    message:
      'The platform feels warm and trustworthy. I would especially recommend the guided support and puja discovery flow.',
  },
];

const ratingStats = [
  { label: 'Average Rating', value: '4.9/5' },
  { label: 'Verified Reviews', value: '2,100+' },
  { label: 'Repeat Users', value: '78%' },
];

const spiritualQuotes = [
  { text: "The soul is neither born, nor does it ever die.", author: "Bhagavad Gita" },
  { text: "Truth is one, sages call it by various names.", author: "Rig Veda" },
  { text: "Peace comes from within. Do not seek it without.", author: "Gautama Buddha" },
  { text: "The mind is everything. What you think you become.", author: "Gautama Buddha" },
  { text: "When you find peace within yourself, you become the kind of person who can live at peace with others.", author: "Peace Pilgrim" },
];

export default function Home() {
  const { t } = useTranslation();
  const [feedbackList, setFeedbackList] = useState(feedback);
  const [visitorStats, setVisitorStats] = useState({ newVisitors: 0, totalVisitors: 0 });
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    rating: 5,
    message: '',
    imageURL: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(spiritualQuotes[0]);

  useEffect(() => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setCurrentQuote(spiritualQuotes[dayOfYear % spiritualQuotes.length]);
    fetchFeedback();
    fetchVisitorStats();
    incrementVisitorCount();

    // Pre-fill name if user is logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setFormData(prev => ({ ...prev, name: user.displayName || '' }));
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchVisitorStats = async () => {
    try {
      const response = await fetch('/api/stats/visitors');
      if (response.ok) {
        const data = await response.json();
        setVisitorStats(data);
      }
    } catch (error) {
      console.error('Error fetching visitor stats:', error);
    }
  };

  const incrementVisitorCount = async () => {
    try {
      await fetch('/api/stats/visitors/increment', { method: 'POST' });
    } catch (error) {
      console.error('Error incrementing visitor count:', error);
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/feedback');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched feedback:', data);
        if (data && data.length > 0) {
          setFeedbackList(data);
        }
      } else {
        console.error('Failed to fetch feedback:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    console.log('Submitting feedback:', formData);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSuccess(true);
        setFormData({ name: auth.currentUser?.displayName || '', city: '', rating: 5, message: '', imageURL: '' });
        fetchFeedback();
        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        console.error('Feedback submission failed:', errorData);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-20 pb-20 bg-white dark:bg-stone-950 transition-colors duration-300">
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/temple/1920/1080?blur=2"
            alt="Spiritual Background"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-6">
              {t('home.heroTitle')}
            </h1>
            <p className="text-xl text-stone-100 mb-8 leading-relaxed">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/services/puja"
                className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 text-center"
              >
                {t('home.bookPuja')}
              </Link>
              <Link
                to="/shop"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all text-center"
              >
                {t('home.exploreShop')}
              </Link>
              <Link
                to="/temple-knowledge"
                className="bg-white text-stone-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-stone-100 transition-all text-center flex items-center justify-center gap-2"
              >
                {t('home.dailyInsights')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="bg-stone-50 dark:bg-stone-900/50 rounded-[3rem] p-10 md:p-16 text-center border border-stone-200 dark:border-stone-800 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
          <Quote className="w-12 h-12 text-orange-200 dark:text-orange-900/30 mx-auto mb-8" />
          <h2 className="text-2xl md:text-4xl font-serif italic text-stone-800 dark:text-stone-200 mb-6 leading-relaxed">
            &ldquo;{currentQuote.text}&rdquo;
          </h2>
          <div className="flex items-center justify-center space-x-4">
            <div className="h-px w-8 bg-orange-300" />
            <p className="text-orange-600 dark:text-orange-400 font-bold tracking-widest uppercase text-sm">
              {currentQuote.author}
            </p>
            <div className="h-px w-8 bg-orange-300" />
          </div>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-white mb-6 tracking-tight">
            {t('home.dailyInsights')}
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-lg leading-relaxed max-w-2xl mx-auto font-medium">
            {t('home.dailyInsightsSubtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <DailyPanchang />
          <DailyHoroscope />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-white mb-6 tracking-tight">
            {t('home.sacredServices')}
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-lg leading-relaxed max-w-2xl mx-auto font-medium">
            {t('home.sacredServicesSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-100 dark:border-stone-800 hover:border-orange-200 dark:hover:border-orange-900/50 hover:shadow-xl hover:shadow-orange-500/5 transition-all w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)] xl:w-[calc(20%-1.5rem)] min-w-[280px] max-w-sm"
            >
              <div
                className={`${service.color} dark:bg-stone-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
                {t(service.title)}
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm mb-6 leading-relaxed">
                {t(service.description)}
              </p>
              <Link
                to={service.link}
                className="flex items-center text-orange-500 font-bold text-sm group-hover:translate-x-1 transition-transform"
              >
                {t('home.explore')} <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Yatra Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] overflow-hidden h-[500px] group"
        >
          <img
            src="https://images.unsplash.com/photo-1545105511-930777907912?auto=format&fit=crop&q=80&w=1920"
            alt="Sacred Yatra"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/40 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-center p-12 md:p-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-orange-500" />
                <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-xs">Pilgrimage Services</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                Embark on a Divine Yatra
              </h2>
              <p className="text-stone-200 text-lg mb-10 leading-relaxed">
                Experience spiritual enlightenment with our guided pilgrimage tours to India's most sacred sites. 
                From Char Dham to Amarnath, we ensure a safe and soulful journey.
              </p>
              <Link
                to="/services/yatra"
                className="inline-flex items-center gap-3 bg-orange-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
              >
                Explore Yatra Packages
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Live Darshan Section */}
      <section className="py-24 bg-stone-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(249,115,22,0.1),_transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-red-500 font-bold uppercase tracking-[0.3em] text-xs">{t('home.liveNow')}</span>
              </motion.div>
              <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 tracking-tight">{t('home.liveDarshanTitle')}</h2>
              <p className="text-stone-400 text-lg leading-relaxed">{t('home.liveDarshanSubtitle')}</p>
            </div>
            <Link to="/services" className="group flex items-center gap-3 px-10 py-4 bg-white text-stone-950 rounded-[2rem] font-bold hover:bg-orange-500 hover:text-white transition-all shadow-2xl shadow-orange-500/10">
              {t('home.viewAllLive')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-10">
            {[
              { id: 'l1', title: 'home.gangaAarti', temple: 'home.harKiPauri', viewers: '12.5k', image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&q=80&w=800' },
              { id: 'l2', title: 'home.eveningAarti', temple: 'home.kashiVishwanath', viewers: '8.2k', image: 'https://images.unsplash.com/photo-1590050752117-23a9d7fc6bbd?auto=format&fit=crop&q=80&w=800' },
              { id: 'l3', title: 'home.bhasmaAarti', temple: 'home.mahakaleshwar', viewers: '15.1k', image: 'https://images.unsplash.com/photo-1621360241104-79948730b474?auto=format&fit=crop&q=80&w=800' }
            ].map((live, idx) => (
              <motion.div
                key={live.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="group relative rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl border border-white/5 w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-2.5rem)] min-w-[280px] max-w-sm"
              >
                <img src={live.image} alt={t(live.title)} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
                
                <div className="absolute top-6 left-6 flex gap-3">
                  <div className="bg-red-600 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('home.live')}</span>
                  </div>
                  <div className="bg-black/40 backdrop-blur-xl px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                    <User className="w-3.5 h-3.5 text-stone-300" />
                    <span className="text-[10px] font-bold text-white">{live.viewers}</span>
                  </div>
                </div>

                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-orange-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">{t(live.temple)}</p>
                  <h3 className="text-3xl font-serif font-bold mb-6">{t(live.title)}</h3>
                  <button className="w-full py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl font-bold hover:bg-white hover:text-stone-950 transition-all flex items-center justify-center gap-3 group/btn">
                    <Play className="w-5 h-5 fill-current group-hover/btn:scale-110 transition-transform" />
                    {t('home.watchLive')}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-white mb-6 tracking-tight">
            {t('home.sharedExperience')}
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-lg leading-relaxed max-w-2xl mx-auto font-medium">
            {t('home.sharedExperienceSubtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-stretch">
          <div className="bg-stone-900 dark:bg-stone-900 text-white rounded-[3rem] p-8 md:p-10 relative overflow-hidden border border-white/5 shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.3),_transparent_35%)]" />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-300 mb-4">
                {t('home.feedbackRating')}
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                {t('home.lovedByDevotees')}
              </h2>
              <p className="text-stone-300 leading-relaxed mb-8">
                {t('home.feedbackImportance')}
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
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {feedbackList.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-200 dark:border-stone-800 p-6 shadow-sm"
              >
                <Quote className="w-8 h-8 text-orange-200 dark:text-orange-900/30 mb-5" />
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(item.rating)
                          ? 'text-orange-500 fill-orange-500'
                          : 'text-stone-200 dark:text-stone-800'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-bold text-stone-700 dark:text-stone-300">
                    {item.rating}
                  </span>
                </div>
                {item.imageURL && (
                  <div className="mb-4 rounded-xl overflow-hidden aspect-video">
                    <img src={item.imageURL} alt="Review" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
                <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-6">
                  {item.message}
                </p>
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-stone-500 dark:text-stone-500">{item.city}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-100 dark:bg-stone-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-stone-900 dark:text-white mb-6 tracking-tight">
              {t('home.spiritualEssentials')}
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-lg leading-relaxed max-w-2xl mx-auto">
              {t('home.spiritualEssentialsSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-stone-800 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-700 group shadow-sm"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-stone-900 dark:text-white">
                        {product.rating}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="p-6">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-bold text-stone-900 dark:text-white mb-1 hover:text-orange-500 transition-colors">{product.name}</h3>
                  </Link>
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center text-lg font-serif font-bold text-orange-600 dark:text-orange-400">
                      <IndianRupee className="w-4 h-4" />
                      <span>{formatIndianRupees(product.price)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="bg-stone-900 dark:bg-stone-700 text-white p-2 rounded-xl hover:bg-orange-500 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white px-8 py-3 rounded-full font-bold hover:bg-stone-50 dark:hover:bg-stone-700 transition-all shadow-sm"
            >
              <span>{t('home.viewAllProducts')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-stone-900 dark:text-white mb-6 tracking-tight">
            {t('home.shareExperience')}
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-lg leading-relaxed max-w-2xl mx-auto">
            {t('home.shareExperienceSubtitle')}
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-200 dark:border-stone-800 p-8 md:p-12 shadow-xl shadow-stone-200/50 dark:shadow-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
          
          <form onSubmit={handleSubmit} className="relative z-10 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
                    {t('home.yourName')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-white"
                    placeholder={t('home.yourName')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
                    {t('home.city')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-white"
                    placeholder="e.g. Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
                    Review Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.imageURL}
                    onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-4">
                    {t('home.rating')}
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="focus:outline-none group"
                      >
                        <Star
                          className={`w-8 h-8 transition-all ${
                            star <= formData.rating
                              ? 'text-orange-500 fill-orange-500 scale-110'
                              : 'text-stone-200 dark:text-stone-800 group-hover:text-orange-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-4 text-lg font-bold text-orange-600">
                      {formData.rating}/5
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
                  {t('home.yourMessage')}
                </label>
                <textarea
                  required
                  rows={8}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none dark:text-white"
                  placeholder={t('home.yourMessage')}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-stone-500 dark:text-stone-400 text-sm max-w-md">
                By submitting, you agree to share your feedback publicly on our platform.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center space-x-2 px-10 py-4 rounded-full font-bold text-lg transition-all shadow-lg ${
                  isSuccess
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    <span>{t('home.submitted')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>{t('home.postFeedback')}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-stone-900 dark:text-white mb-2">
                  {t('home.thankYou')}
                </h3>
                <p className="text-stone-600 dark:text-stone-400 max-w-sm">
                  {t('home.feedbackReceived')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-8 rounded-[2.5rem] border border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">{t('home.newVisitors')}</p>
              <h3 className="text-4xl font-serif font-bold text-stone-900 dark:text-white">{visitorStats.newVisitors.toLocaleString()}</h3>
            </div>
            <div className="w-16 h-16 bg-white dark:bg-stone-800 rounded-2xl flex items-center justify-center shadow-sm">
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-stone-50 dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">{t('home.totalVisitors')}</p>
              <h3 className="text-4xl font-serif font-bold text-stone-900 dark:text-white">{visitorStats.totalVisitors.toLocaleString()}</h3>
            </div>
            <div className="w-16 h-16 bg-white dark:bg-stone-800 rounded-2xl flex items-center justify-center shadow-sm">
              <Eye className="w-8 h-8 text-stone-400 dark:text-stone-500" />
            </div>
          </div>
        </div>
      </section>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
