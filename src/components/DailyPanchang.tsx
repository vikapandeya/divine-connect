import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Calendar, Clock, Star, Sparkles, Loader2, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchLivePanchang, PanchangData } from '../services/geminiService';

const fallbackPanchang: PanchangData = {
  tithi: 'Dwitiya',
  paksha: 'Shukla Paksha',
  nakshatra: 'Pushya',
  yoga: 'Siddha',
  karana: 'Vanija',
  mahina: '17, Vaishakha',
  vikramSamvat: '2083',
  samvatName: 'Siddharthi',
  sunrise: '05:52 AM',
  sunset: '06:49 PM',
  moonrise: '07:38 AM',
  moonset: '08:52 PM',
  rahukaal: '05:12 PM - 06:49 PM',
  gulika: '03:35 PM - 05:12 PM',
  yamaganda: '12:21 PM - 01:58 PM',
  auspicious: 'Abhijit Muhurat: 11:55 AM - 12:47 PM',
  location: 'New Delhi, India'
};

const stripLabel = (val: string, label?: string) => {
  if (!val) return val;
  // If the label is explicitly provided and the value starts with it, strip it
  if (label && val.toLowerCase().startsWith(label.toLowerCase())) {
    const stripped = val.substring(label.length).trim();
    // Remove leading colon if present
    return stripped.startsWith(':') ? stripped.substring(1).trim() : stripped;
  }
  
  const index = val.indexOf(':');
  if (index === -1) return val;
  
  const prefix = val.substring(0, index);
  // If prefix has digits, it's likely part of the time (e.g., "12:46")
  if (/\d/.test(prefix)) return val;
  
  return val.substring(index + 1).trim();
};

export default function DailyPanchang() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<PanchangData>(fallbackPanchang);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const getPanchang = async () => {
      const dateKey = `panchang_${new Date().toISOString().split('T')[0]}_${i18n.language}`;
      const cached = localStorage.getItem(dateKey);

      if (cached) {
        try {
          setData(JSON.parse(cached));
          setIsLoading(false);
          setIsLive(true);
          return;
        } catch (e) {
          localStorage.removeItem(dateKey);
        }
      }

      try {
        setIsLoading(true);
        const liveData = await fetchLivePanchang(new Date(), i18n.language);
        setData(liveData);
        setIsLive(true);
        localStorage.setItem(dateKey, JSON.stringify(liveData));
      } catch (error) {
        console.error('Failed to fetch live panchang:', error);
        setData(fallbackPanchang);
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    };

    getPanchang();

    return () => clearInterval(timer);
  }, [i18n.language]);

  const formattedDate = currentTime.toLocaleDateString(
    i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'sa' ? 'sa-IN' : 'en-IN',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  );

  const formattedTime = currentTime.toLocaleTimeString(
    i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'sa' ? 'sa-IN' : 'en-IN',
    { hour: '2-digit', minute: '2-digit', second: '2-digit' }
  );

  return (
    <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xl shadow-stone-200/50 dark:shadow-none">
      <div className="bg-orange-500 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6" />
          <div>
            <h2 className="text-xl font-serif font-bold">{t('panchang.title')}</h2>
            {data.location && (
              <p className="text-[10px] font-bold opacity-80 flex items-center">
                <MapPin className="w-3 h-3 mr-1" /> {data.location}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <div className={`px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-2 ${isLive ? 'bg-white/20' : 'bg-white/10'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-white/40'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {isLive ? (t('panchang.live') || 'Live') : 'Standard'}
              </span>
            </div>
            <div className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              {formattedDate}
            </div>
          </div>
          <div className="text-[10px] font-mono font-bold bg-black/10 px-2 py-0.5 rounded flex items-center">
            <Clock className="w-3 h-3 mr-1" /> {formattedTime}
          </div>
        </div>
      </div>

      <div className="p-8 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-orange-50 dark:bg-orange-950/20 rounded-3xl border border-orange-100 dark:border-orange-900/30">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{t('panchang.vikramSamvat')}</p>
            <p className="text-sm font-black text-stone-900 dark:text-white">{data.vikramSamvat} {data.samvatName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{t('panchang.mahina')}</p>
            <p className="text-sm font-bold text-stone-900 dark:text-white">{data.mahina}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{t('panchang.paksha')}</p>
            <p className="text-sm font-bold text-stone-900 dark:text-white">{data.paksha}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{t('panchang.tithi')}</p>
            <div className="flex flex-col">
              <p className="text-sm font-bold text-stone-900 dark:text-white">{data.tithi}</p>
              {data.tithiEnd && <p className="text-[10px] text-orange-600 font-medium">{data.tithiEnd}</p>}
            </div>
          </div>
        </div>

        {data.festivals && data.festivals.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {data.festivals.map(festival => (
              <div key={festival} className="bg-orange-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center shadow-lg shadow-orange-600/20">
                <Sparkles className="w-3 h-3 mr-1.5" />
                {festival}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{t('panchang.nakshatra')}</p>
            <p className="text-sm font-bold text-stone-900 dark:text-white">{data.nakshatra}</p>
            {data.nakshatraEnd && <p className="text-[10px] text-stone-500 font-medium">{data.nakshatraEnd}</p>}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{t('panchang.yoga')}</p>
            <p className="text-sm font-bold text-stone-900 dark:text-white">{data.yoga}</p>
            {data.yogaEnd && <p className="text-[10px] text-stone-500 font-medium">{data.yogaEnd}</p>}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{t('panchang.karana')}</p>
            <p className="text-sm font-bold text-stone-900 dark:text-white">{data.karana}</p>
            {data.karanaEnd && <p className="text-[10px] text-stone-500 font-medium">{data.karanaEnd}</p>}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{t('panchang.signs') || 'Sun/Moon Signs'}</p>
            <div className="flex items-center gap-2">
              {data.sunSign && <span className="text-xs font-bold text-stone-700 dark:text-stone-300">☉ {data.sunSign}</span>}
              {data.moonSign && <span className="text-xs font-bold text-stone-700 dark:text-stone-300">☽ {data.moonSign}</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-2xl border border-stone-100 dark:border-stone-700">
            <p className="text-[10px] font-bold text-stone-400 mb-1">{t('panchang.sunrise')}</p>
            <p className="text-sm font-bold text-stone-900 dark:text-white">{data.sunrise}</p>
          </div>
          <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-2xl border border-stone-100 dark:border-stone-700">
            <p className="text-[10px] font-bold text-stone-400 mb-1">{t('panchang.sunset')}</p>
            <p className="text-sm font-bold text-stone-900 dark:text-white">{data.sunset}</p>
          </div>
          <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-2xl border border-stone-100 dark:border-stone-700">
            <p className="text-[10px] font-bold text-stone-400 mb-1">{t('panchang.moonrise')}</p>
            <p className="text-sm font-bold text-stone-900 dark:text-white">{data.moonrise}</p>
          </div>
          <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-2xl border border-stone-100 dark:border-stone-700">
            <p className="text-[10px] font-bold text-stone-400 mb-1">{t('panchang.moonset')}</p>
            <p className="text-sm font-bold text-stone-900 dark:text-white">{data.moonset}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
            <div>
              <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">{t('panchang.rahukaal')}</p>
              <p className="text-sm font-bold text-stone-900 dark:text-white">{stripLabel(data.rahukaal, t('panchang.rahukaal'))}</p>
            </div>
          </div>
          <div className="flex justify-between items-center p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">{t('panchang.gulika')}</p>
              <p className="text-sm font-bold text-stone-900 dark:text-white">{stripLabel(data.gulika, t('panchang.gulika'))}</p>
            </div>
          </div>
          <div className="flex justify-between items-center p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">{t('panchang.yamaganda')}</p>
              <p className="text-sm font-bold text-stone-900 dark:text-white">{stripLabel(data.yamaganda, t('panchang.yamaganda'))}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/20 flex items-center space-x-6">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">{t('panchang.auspicious')}</p>
            <p className="text-lg font-serif font-bold text-stone-900 dark:text-white">
              {t('panchang.abhijit')}: <span className="text-emerald-600 dark:text-emerald-400">{stripLabel(data.auspicious, 'Abhijit Muhurat')}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
