import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, ChevronRight, ChevronLeft, Clock, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const zodiacSigns = [
  { name: 'Aries', symbol: '♈', date: 'Mar 21-2026 - Apr 19-2026' },
  { name: 'Taurus', symbol: '♉', date: 'Apr 20-2026 - May 20-2026' },
  { name: 'Gemini', symbol: '♊', date: 'May 21-2026 - Jun 20-2026' },
  { name: 'Cancer', symbol: '♋', date: 'Jun 21-2026 - Jul 22-2026' },
  { name: 'Leo', symbol: '♌', date: 'Jul 23-2026 - Aug 22-2026' },
  { name: 'Virgo', symbol: '♍', date: 'Aug 23-2026 - Sep 22-2026' },
  { name: 'Libra', symbol: '♎', date: 'Sep 23-2026 - Oct 22-2026' },
  { name: 'Scorpio', symbol: '♏', date: 'Oct 23-2026 - Nov 21-2026' },
  { name: 'Sagittarius', symbol: '♐', date: 'Nov 22-2026 - Dec 21-2026' },
  { name: 'Capricorn', symbol: '♑', date: 'Dec 22-2026 - Jan 19-2027' },
  { name: 'Aquarius', symbol: '♒', date: 'Jan 20-2026 - Feb 18-2026' },
  { name: 'Pisces', symbol: '♓', date: 'Feb 19-2026 - Mar 20-2026' },
];

export default function DailyHoroscope() {
  const { t, i18n } = useTranslation();
  const [selectedSign, setSelectedSign] = useState(zodiacSigns[0]);
  const [horoscope, setHoroscope] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setHoroscope(t(`horoscope.predictions.${selectedSign.name}`));
  }, [selectedSign, t]);

  const formattedDate = currentTime.toLocaleDateString(
    i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'sa' ? 'sa-IN' : 'en-IN',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  );

  const formattedTime = currentTime.toLocaleTimeString(
    i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'sa' ? 'sa-IN' : 'en-IN',
    { hour: '2-digit', minute: '2-digit', second: '2-digit' }
  );

  return (
    <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xl shadow-stone-200/50 dark:shadow-none h-full flex flex-col">
      <div className="bg-amber-500 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-6 h-6" />
          <h2 className="text-xl font-serif font-bold">{t('horoscope.title')}</h2>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm mb-1">
            {formattedDate}
          </div>
          <div className="text-[10px] font-mono font-bold bg-black/10 px-2 py-0.5 rounded flex items-center">
            <Clock className="w-3 h-3 mr-1" /> {formattedTime}
          </div>
        </div>
      </div>

      <div className="p-8 flex-grow flex flex-col">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            {t('horoscope.liveDay')}
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => {
              const idx = zodiacSigns.findIndex(s => s.name === selectedSign.name);
              setSelectedSign(zodiacSigns[(idx - 1 + zodiacSigns.length) % zodiacSigns.length]);
            }}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-stone-400" />
          </button>
          <div className="text-center">
            <div className="text-4xl mb-2">{selectedSign.symbol}</div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-white">{t(`horoscope.signs.${selectedSign.name}`)}</h3>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{selectedSign.date}</p>
          </div>
          <button 
            onClick={() => {
              const idx = zodiacSigns.findIndex(s => s.name === selectedSign.name);
              setSelectedSign(zodiacSigns[(idx + 1) % zodiacSigns.length]);
            }}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        <div className="relative p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/20 flex-grow flex items-center justify-center">
          <Star className="absolute top-4 right-4 w-4 h-4 text-amber-300 dark:text-amber-900/30" />
          <p className="text-stone-700 dark:text-stone-300 text-center leading-relaxed italic">
            &ldquo;{horoscope}&rdquo;
          </p>
        </div>

        <div className="mt-8 grid grid-cols-6 gap-2">
          {zodiacSigns.map((sign) => (
            <button
              key={sign.name}
              onClick={() => setSelectedSign(sign)}
              className={`text-xl p-2 rounded-xl transition-all ${selectedSign.name === sign.name ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-stone-50 dark:bg-stone-800 text-stone-400 hover:text-amber-500'}`}
              title={t(`horoscope.signs.${sign.name}`)}
            >
              {sign.symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
