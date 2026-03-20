import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Clock, MapPin, Send, Star, Moon, Sun, Info } from 'lucide-react';

export default function Astrology() {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    tob: '',
    pob: '',
    query: ''
  });
  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReading = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setReading(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('AI astrology is not configured yet. Add GEMINI_API_KEY before using this feature.');
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        You are an expert Vedic Astrologer. Provide a detailed, spiritual, and insightful reading based on the following birth details:
        Name: ${formData.name}
        Date of Birth: ${formData.dob}
        Time of Birth: ${formData.tob}
        Place of Birth: ${formData.pob}
        User's Query: ${formData.query || 'General life reading and spiritual guidance'}

        Please include:
        1. A brief analysis of their planetary positions.
        2. Insights into their personality and spiritual path.
        3. Guidance for the current period (Dasha/Transit).
        4. A specific remedy (Mantra or Puja) related to their query.

        Format the response in clear, beautiful Markdown. Keep the tone compassionate and divine.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are a divine Vedic Astrologer named 'Jyotish AI'. You provide accurate and spiritual guidance based on birth details.",
          temperature: 0.7,
        },
      });

      setReading(response.text);
    } catch (err) {
      console.error('Astrology error:', err);
      setError(err instanceof Error ? err.message : 'The stars are currently obscured. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-stone-200 py-20 px-4 relative overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
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
            className="text-stone-400 text-lg max-w-2xl mx-auto"
          >
            Unlock the secrets of your destiny with our AI-powered Vedic Astrologer. Enter your birth details for a personalized spiritual reading.
          </motion.p>
        </div>

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
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Consult the Stars</span>
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
                  <User className="w-6 h-6 text-white" />
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
      </div>
    </div>
  );
}

function User({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
