import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Send, Star, Moon, Sun, Info, Lock, ArrowRight, Users, Calendar, Compass } from 'lucide-react';
import { auth, type User as FirebaseUser } from '../firebase';
import AuthModal from '../components/AuthModal';
import { Link } from 'react-router-dom';

type TabType = 'birth-chart' | 'rashifal' | 'kundli' | 'adv-chart';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const TIMEFRAMES = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

export default function Astrology() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth?.currentUser ?? null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('birth-chart');
  
  // Birth Chart State
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    tob: '',
    pob: '',
    query: ''
  });

  // Rashifal State
  const [rashifalData, setRashifalData] = useState({
    sign: 'Aries',
    timeframe: 'Daily'
  });

  // Kundli State
  const [kundliData, setKundliData] = useState({
    p1Name: '', p1Dob: '', p1Tob: '', p1Pob: '', p1Gender: 'Male',
    p2Name: '', p2Dob: '', p2Tob: '', p2Pob: '', p2Gender: 'Female'
  });

  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth) {
      setCurrentUser(null);
      setIsAuthModalOpen(true);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsAuthModalOpen(!user);
    });

    return unsubscribe;
  }, []);

  const generateReading = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setLoading(true);
    setError('');
    setReading(null);

    // Client-side Rashifal cache (per day)
    const cacheKey = activeTab === 'rashifal'
      ? `rashifal_${rashifalData.sign}_${rashifalData.timeframe}_${new Date().toISOString().split('T')[0]}`
      : null;

    if (cacheKey) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setReading(cached);
        setLoading(false);
        return;
      }
    }

    try {
      // All AI calls go to the backend — API key stays server-side
      const res = await fetch('/api/ai/astrology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tab: activeTab,
          formData,
          rashifalData,
          kundliData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(data.error || 'The stars are currently obscured. Please try again later.');
      }

      const reply = data.reading;
      setReading(reply);
      if (cacheKey && reply) {
        localStorage.setItem(cacheKey, reply);
      }
    } catch (err) {
      console.error('Astrology error:', err);
      if (err instanceof Error && (err.message === 'RATE_LIMIT' || err.message.toLowerCase().includes('rate') || err.message.toLowerCase().includes('limit'))) {
        setError('The cosmic energies are aligning. Please try your consultation again in a few minutes as our AI astrologer is currently assisting many devotees.');
      } else {
        setError(err instanceof Error ? err.message : 'The stars are currently obscured. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-stone-200 py-20 px-4 relative overflow-hidden">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      {/* Immersive Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex justify-center mb-8">
          <img 
            src="/logo/icon-only.svg" 
            alt="PunyaSeva" 
            className="h-12 w-auto brightness-0 invert" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>Divine Guidance</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif font-bold text-white mb-6"
          >
            AI Astrology <span className="text-orange-500 italic">&</span> Insights
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-stone-400 text-lg max-w-2xl mx-auto mb-10"
          >
            Unlock the secrets of your destiny with our AI-powered Vedic Astrologer. Explore birth charts, daily horoscopes, and compatibility.
          </motion.p>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { id: 'birth-chart', label: 'Birth Chart', icon: Star },
              { id: 'rashifal', label: 'Rashifal', icon: Calendar },
              { id: 'kundli', label: 'Kundli Matching', icon: Users },
              { id: 'adv-chart', label: 'Advanced Software', icon: Compass },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setReading(null);
                  setError('');
                }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-white/5 text-stone-400 hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {!currentUser ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500/15 text-orange-400 flex items-center justify-center mb-6">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white mb-4">
                Sign in to unlock AI Astrology
              </h2>
              <p className="text-stone-400 leading-relaxed mb-8">
                Personalized astrological guidance is available only for signed-in users. Please sign in to continue to your reading dashboard.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold transition-all inline-flex items-center justify-center gap-2"
                >
                  <span>Sign In to Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/contact"
                  className="border border-white/15 text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-5"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8">
              <form onSubmit={generateReading} className="space-y-6">
                {activeTab === 'birth-chart' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Full Name</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Date of Birth</label>
                        <input
                          required
                          type="date"
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Time of Birth</label>
                        <input
                          required
                          type="time"
                          value={formData.tob}
                          onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Place of Birth</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                        <input
                          required
                          type="text"
                          value={formData.pob}
                          onChange={(e) => setFormData({ ...formData, pob: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Your Query (Optional)</label>
                      <textarea
                        rows={3}
                        value={formData.query}
                        onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all resize-none"
                        placeholder="e.g. Career growth, marriage timing..."
                      />
                    </div>
                  </>
                )}

                {activeTab === 'rashifal' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Zodiac Sign</label>
                      <select
                        value={rashifalData.sign}
                        onChange={(e) => setRashifalData({ ...rashifalData, sign: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all appearance-none"
                      >
                        {ZODIAC_SIGNS.map(sign => (
                          <option key={sign} value={sign} className="bg-stone-900">{sign}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Timeframe</label>
                      <div className="grid grid-cols-2 gap-2">
                        {TIMEFRAMES.map(tf => (
                          <button
                            key={tf}
                            type="button"
                            onClick={() => setRashifalData({ ...rashifalData, timeframe: tf })}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                              rashifalData.timeframe === tf
                                ? 'bg-orange-500 text-white'
                                : 'bg-white/5 text-stone-400 hover:bg-white/10'
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'kundli' && (
                  <div className="space-y-8">
                    {/* Groom */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <h4 className="text-sm font-bold text-orange-400 uppercase tracking-widest">Groom (Male)</h4>
                      </div>
                      <input
                        required
                        type="text"
                        placeholder="Groom's Name"
                        value={kundliData.p1Name}
                        onChange={(e) => setKundliData({ ...kundliData, p1Name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          required
                          type="date"
                          value={kundliData.p1Dob}
                          onChange={(e) => setKundliData({ ...kundliData, p1Dob: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                        />
                        <input
                          required
                          type="time"
                          value={kundliData.p1Tob}
                          onChange={(e) => setKundliData({ ...kundliData, p1Tob: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                        />
                      </div>
                      <input
                        required
                        type="text"
                        placeholder="Groom's Place of Birth"
                        value={kundliData.p1Pob}
                        onChange={(e) => setKundliData({ ...kundliData, p1Pob: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                      />
                    </div>

                    {/* Bride */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest">Bride (Female)</h4>
                      </div>
                      <input
                        required
                        type="text"
                        placeholder="Bride's Name"
                        value={kundliData.p2Name}
                        onChange={(e) => setKundliData({ ...kundliData, p2Name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          required
                          type="date"
                          value={kundliData.p2Dob}
                          onChange={(e) => setKundliData({ ...kundliData, p2Dob: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                        />
                        <input
                          required
                          type="time"
                          value={kundliData.p2Tob}
                          onChange={(e) => setKundliData({ ...kundliData, p2Tob: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                        />
                      </div>
                      <input
                        required
                        type="text"
                        placeholder="Bride's Place of Birth"
                        value={kundliData.p2Pob}
                        onChange={(e) => setKundliData({ ...kundliData, p2Pob: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{activeTab === 'kundli' ? 'Match Kundli' : activeTab === 'rashifal' ? 'Get Rashifal' : 'Consult the Stars'}</span>
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
                {!process.env.GEMINI_API_KEY && (
                  <div className="flex items-start space-x-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-left">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <p className="text-sm text-amber-200">
                      AI astrology is disabled on this deployment until a `GEMINI_API_KEY` is configured.
                    </p>
                  </div>
                )}
              </form>
            </div>
          </motion.div>

          {/* Result Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-7"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] min-h-[500px] flex flex-col overflow-hidden">
              <div className="p-8 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-xl font-serif font-bold text-white flex items-center">
                  <Star className="w-5 h-5 mr-2 text-orange-500" />
                  Your Reading
                </h3>
                {reading && (
                  <button 
                    onClick={() => window.print()}
                    className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Save Reading
                  </button>
                )}
              </div>

              <div className="p-8 flex-grow overflow-y-auto max-h-[600px] custom-scrollbar">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20"
                    >
                      <div className="relative">
                        <div className="w-20 h-20 border-2 border-orange-500/20 rounded-full animate-ping absolute inset-0" />
                        <div className="w-20 h-20 border-2 border-orange-500 rounded-full flex items-center justify-center">
                          <Moon className="w-10 h-10 text-orange-500 animate-pulse" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xl font-serif text-white mb-2">Aligning the Planets...</p>
                        <p className="text-stone-500 text-sm">Our AI is analyzing your birth chart across the cosmos.</p>
                      </div>
                    </motion.div>
                  ) : reading ? (
                    <motion.div
                      key="reading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="prose prose-invert max-w-none prose-orange"
                    >
                      <div className="whitespace-pre-wrap leading-relaxed text-stone-300">
                        {reading}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20"
                    >
                      <Sun className="w-16 h-16 text-stone-800" />
                      <p className="text-stone-500">Your destiny awaits. Fill in your details to receive a divine reading.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border-t border-red-500/20 text-red-400 text-center text-sm font-bold">
                  {error}
                </div>
              )}
            </div>

            {/* Live Astrologer Promo */}
            <div className="mt-8 p-6 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-3xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold">Want a Live Consultation?</h4>
                  <p className="text-stone-400 text-xs">Connect with our verified expert astrologers for a 1-on-1 session.</p>
                </div>
              </div>
              <button className="bg-white text-stone-900 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-500 hover:text-white transition-all">
                Talk to Expert
              </button>
            </div>
          </motion.div>
        </div>
        )}
      </div>
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
