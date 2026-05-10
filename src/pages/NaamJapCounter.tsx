import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Settings,
  History as HistoryIcon,
  Flame,
  Undo2,
  Volume2,
  VolumeX,
  Upload,
  Plus,
  Bell,
  Check,
  Play,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { saveNaamJap, getDailyJaps } from '../services/naamJapService';
import { NaamJap } from '../types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

const TARGET_OPTIONS = [27, 54, 108, 216, 324, 1008];
const LS_HISTORY_KEY = 'naamjap_history';

const readLocalHistory = (): NaamJap[] => {
  try {
    const saved = localStorage.getItem(LS_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const upsertLocalRecord = (record: Pick<NaamJap, 'date' | 'mantraName' | 'count' | 'target'>): void => {
  const records = readLocalHistory();
  const idx = records.findIndex(r => r.date === record.date && r.mantraName === record.mantraName);
  const entry: NaamJap = {
    id: `local-${record.date}-${record.mantraName.replace(/\s+/g, '-')}`,
    userId: 'local',
    mantraId: record.mantraName.toLowerCase().replace(/\s+/g, '-'),
    updatedAt: new Date().toISOString(),
    ...record,
  };
  if (idx >= 0) records[idx] = entry;
  else records.push(entry);
  localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(records));
};
const DEFAULT_MANTRAS = [
  {
    name: 'Radhe Radhe',
    hindi: 'राधे राधे',
    meaning: 'Devotion to the Divine Mother Radha',
    description: 'A sacred greeting and prayer to Radha, the embodiment of unconditional love and devotion.'
  },
  {
    name: 'Radhe Krishna',
    hindi: 'राधे कृष्ण',
    meaning: 'Union of Divine Feminine and Masculine',
    description: 'Celebrating the eternal bond of Radha and Krishna, representing the soul\'s longing for the divine.'
  },
  {
    name: 'Om Namah Shivaya',
    hindi: 'ॐ नमः शिवाय',
    meaning: 'Adoration to the Infinite Consciousness',
    description: 'A powerful mantra that purifies the mind and connects the soul with Lord Shiva, the source of transformation.'
  },
  {
    name: 'Hare Rama Hare Krishna',
    hindi: 'हरे राम हरे कृष्ण',
    meaning: 'The Great Mantra for Peace',
    description: 'The Mahamantra of the current age, believed to bring liberation and joy.'
  },
  {
    name: 'Mahamrityunjaya Mantra',
    hindi: 'महामृत्युंजय मंत्र',
    meaning: 'Victory Over Death',
    description: 'A call for enlightenment and liberation from the cycle of birth and death.'
  }
];

interface CustomMantra {
  name: string;
  description: string;
  hindi?: string;
}

interface MantraDef {
  name: string;
  hindi?: string;
  meaning: string;
  description: string;
  isCustom: boolean;
}

export default function NaamJapCounter() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const dk = resolvedTheme === 'dark';

  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(108);
  const [todayTotal, setTodayTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lifetimeTotal, setLifetimeTotal] = useState(0);
  const [isVibrationOn, setIsVibrationOn] = useState(true);
  const [history, setHistory] = useState<NaamJap[]>([]);
  const [mantra, setMantra] = useState(DEFAULT_MANTRAS[0].name);
  const [customMantras, setCustomMantras] = useState<CustomMantra[]>([]);
  const [newMantra, setNewMantra] = useState('');
  const [newMantraDesc, setNewMantraDesc] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [mantraTargets, setMantraTargets] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('mantra_targets');
    return saved ? JSON.parse(saved) : {};
  });

  const [isMuted, setIsMuted] = useState(false);
  const [audioMode, setAudioMode] = useState<'bell' | 'custom'>('bell');
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bellRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (customAudioUrl && audioMode === 'custom') {
      if (!audioRef.current) {
        audioRef.current = new Audio(customAudioUrl);
      } else if (audioRef.current.src !== customAudioUrl) {
        audioRef.current.src = customAudioUrl;
        audioRef.current.load();
      }
    }
  }, [customAudioUrl, audioMode]);

  useEffect(() => {
    if (todayTotal >= target && target > 0 && !isCelebrating) {
      setIsCelebrating(true);
      const timer = setTimeout(() => setIsCelebrating(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [todayTotal, target]);

  const CelebrationEffects = () => (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.4, 1.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
        className="absolute w-80 h-80 rounded-full bg-amber-500/15 blur-3xl"
      />
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.4, 0], scale: [0.5, 2.8] }}
          transition={{ duration: 5, repeat: Infinity, delay: i * 1.5, ease: "easeOut" }}
          className="absolute w-64 h-64 border border-amber-400/25 rounded-full"
        />
      ))}
    </div>
  );

  useEffect(() => {
    bellRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    const savedMantras = localStorage.getItem('custom_mantras');
    if (savedMantras) setCustomMantras(JSON.parse(savedMantras));
    const savedAudioUrl = localStorage.getItem('custom_audio_url');
    if (savedAudioUrl) { setCustomAudioUrl(savedAudioUrl); setAudioMode('custom'); }
    const savedMuted = localStorage.getItem('audio_muted');
    if (savedMuted) setIsMuted(JSON.parse(savedMuted));
    const savedVib = localStorage.getItem('vibration_on');
    if (savedVib) setIsVibrationOn(JSON.parse(savedVib));
  }, []);

  useEffect(() => { localStorage.setItem('vibration_on', JSON.stringify(isVibrationOn)); }, [isVibrationOn]);
  useEffect(() => { localStorage.setItem('mantra_targets', JSON.stringify(mantraTargets)); }, [mantraTargets]);

  const playFeedback = useCallback(() => {
    if (isMuted) return;
    if (audioMode === 'bell' && bellRef.current) {
      bellRef.current.currentTime = 0;
      bellRef.current.play().catch(() => {});
    } else if (audioMode === 'custom' && customAudioUrl) {
      if (!audioRef.current || audioRef.current.src !== customAudioUrl) {
        audioRef.current = new Audio(customAudioUrl);
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [isMuted, audioMode, customAudioUrl]);

  const triggerFeedback = useCallback(() => {
    if (isVibrationOn && "vibrate" in navigator) navigator.vibrate(50);
    playFeedback();
  }, [isVibrationOn, playFeedback]);

  const handleIncrement = useCallback(() => {
    setCount(prev => prev + 1);
    setTodayTotal(prev => prev + 1);
    setLifetimeTotal(prev => prev + 1);
    triggerFeedback();
  }, [triggerFeedback]);

  const handleUndo = useCallback(() => {
    if (count > 0) {
      setCount(prev => prev - 1);
      setTodayTotal(prev => prev - 1);
      setLifetimeTotal(prev => prev - 1);
      triggerFeedback();
    }
  }, [count, triggerFeedback]);

  const handleReset = useCallback(() => {
    if (window.confirm(t("Reset current counter?"))) { setCount(0); triggerFeedback(); }
  }, [t, triggerFeedback]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        const tgt = e.target as HTMLElement;
        if (tgt.tagName !== 'BUTTON' && tgt.tagName !== 'INPUT' && tgt.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleIncrement();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleIncrement]);

  const addCustomMantra = () => {
    if (newMantra.trim() && !DEFAULT_MANTRAS.find(m => m.name === newMantra) && !customMantras.find(m => m.name === newMantra)) {
      const updated = [...customMantras, { name: newMantra.trim(), description: newMantraDesc.trim() || 'My personal mantra.' }];
      setCustomMantras(updated);
      localStorage.setItem('custom_mantras', JSON.stringify(updated));
      setMantra(newMantra.trim());
      setNewMantra('');
      setNewMantraDesc('');
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const tempAudio = new Audio();
      tempAudio.onerror = () => { alert(t("Failed to load audio file.")); URL.revokeObjectURL(url); };
      tempAudio.onloadedmetadata = () => {
        if (tempAudio.duration > 15) { alert(t("Audio must be shorter than 15 seconds")); URL.revokeObjectURL(url); }
        else { setCustomAudioUrl(url); setAudioMode('custom'); }
      };
      tempAudio.src = url;
    }
  };

  const toggleMute = () => {
    const newVal = !isMuted;
    setIsMuted(newVal);
    localStorage.setItem('audio_muted', JSON.stringify(newVal));
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (count > 0 || todayTotal > 0) {
      // Always persist locally (works for guests too)
      upsertLocalRecord({ date: today, mantraName: mantra, count: todayTotal, target });
      // Debounced sync to server when logged in
      if (user) {
        const timer = setTimeout(() => {
          saveNaamJap({ userId: user.uid, mantraId: mantra.toLowerCase().replace(/\s+/g, '-'), mantraName: mantra, count: todayTotal, target, date: today })
            .catch(() => {});
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [todayTotal, target, user, mantra, count]);

  const calculateStreak = useCallback((allLogs: NaamJap[]) => {
    if (allLogs.length === 0) return 0;
    const dates = Array.from(new Set(allLogs.map(l => l.date))).sort((a, b) => b.localeCompare(a));
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dates[0] !== today && dates[0] !== yesterday) return 0;
    let currentStreak = 0;
    let checkDate = new Date();
    for (const dateStr of dates) {
      if (dateStr === checkDate.toISOString().split('T')[0]) { currentStreak++; checkDate.setDate(checkDate.getDate() - 1); }
      else break;
    }
    return currentStreak;
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    // Load local history first — works for guests and logged-in users alike
    const localRecords = readLocalHistory();
    const todayLocal = localRecords.find(r => r.date === today && r.mantraName === mantra);
    if (todayLocal) { setCount(todayLocal.count); setTodayTotal(todayLocal.count); setTarget(todayLocal.target); }
    setLifetimeTotal(localRecords.reduce((sum, r) => sum + r.count, 0));
    setStreak(calculateStreak(localRecords));

    if (user) {
      // Server is the source of truth when logged in — override local values
      getDailyJaps(user.uid, today).then(serverToday => {
        const serverJap = serverToday.find(j => j.mantraName === mantra);
        if (serverJap) { setCount(serverJap.count); setTodayTotal(serverJap.count); setTarget(serverJap.target); }
        fetch(`/api/naam-jap/logs?userId=${user.uid}`)
          .then(res => res.json())
          .then((allLogs: NaamJap[]) => {
            setStreak(calculateStreak(allLogs));
            setLifetimeTotal(allLogs.reduce((sum, l) => sum + l.count, 0));
            const targets: Record<string, number> = {};
            allLogs.forEach(l => { if (!targets[l.mantraName]) targets[l.mantraName] = l.target; });
            setMantraTargets(prev => ({ ...prev, ...targets }));
          }).catch(() => {});
      }).catch(() => {});
    }
  }, [user, mantra, calculateStreak]);

  // Lazy-load history panel data when opened
  useEffect(() => {
    if (!showHistory) return;
    const localRecords = readLocalHistory().sort((a, b) => b.date.localeCompare(a.date));
    if (user) {
      fetch(`/api/naam-jap/logs?userId=${user.uid}`)
        .then(r => r.json())
        .then((allLogs: NaamJap[]) => {
          const serverKeys = new Set(allLogs.map(l => `${l.date}|${l.mantraName}`));
          const merged = [
            ...allLogs,
            ...localRecords.filter(l => !serverKeys.has(`${l.date}|${l.mantraName}`)),
          ].sort((a, b) => b.date.localeCompare(a.date));
          setHistory(merged);
        }).catch(() => setHistory(localRecords));
    } else {
      setHistory(localRecords);
    }
  }, [showHistory, user]);

  const progressPercentage = Math.min((count / target) * 100, 100);
  const dotsCount = 108;

  const allMantras: MantraDef[] = [
    ...DEFAULT_MANTRAS.map(m => ({ ...m, isCustom: false })),
    ...customMantras.map(m => ({ ...m, isCustom: true, meaning: 'Personal Mantra' }))
  ] as MantraDef[];

  const currentMantraDef = allMantras.find(m => m.name === mantra);

  const handleSetTarget = (newTarget: number) => {
    setTarget(newTarget);
    setMantraTargets(prev => ({ ...prev, [mantra]: newTarget }));
    triggerFeedback();
  };

  const th = {
    pageBg:        dk ? 'linear-gradient(160deg,#07050F 0%,#0D0A1A 40%,#0A080F 100%)' : 'linear-gradient(160deg,#FFFBF0 0%,#FFF8E7 40%,#FFFDF5 100%)',
    glowCenter:    dk ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.10)',
    glowTR:        dk ? 'rgba(139,92,246,0.04)' : 'rgba(245,158,11,0.06)',
    glowBL:        dk ? 'rgba(236,72,153,0.03)' : 'rgba(180,120,0,0.04)',
    labelColor:    dk ? 'rgba(245,158,11,0.40)' : 'rgba(160,90,0,0.65)',
    titleColor:    dk ? 'rgba(255,255,255,0.85)' : 'rgba(30,20,5,0.9)',
    iconBtnBg:     dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    iconBtnBorder: dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)',
    mantraName:    dk ? '#ffffff' : 'rgba(30,20,5,0.95)',
    hindiColor:    dk ? 'rgba(251,191,36,0.75)' : 'rgba(160,90,0,0.85)',
    meaningColor:  dk ? 'rgba(245,158,11,0.55)' : 'rgba(160,90,0,0.65)',
    descColor:     dk ? 'rgba(161,161,170,0.7)' : 'rgba(80,55,20,0.65)',
    cardBg:        dk ? 'rgba(18,13,32,0.75)' : 'rgba(255,255,255,0.88)',
    cardBorder:    dk ? 'rgba(120,80,200,0.12)' : 'rgba(245,158,11,0.15)',
    sectionLabel:  dk ? 'rgba(245,158,11,0.5)' : 'rgba(160,90,0,0.6)',
    dividerColor:  dk ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)',
    pillBg:        dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    pillBorder:    dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
    pillText:      dk ? 'rgba(161,161,170,0.8)' : 'rgba(60,40,10,0.7)',
    tgtBg:         dk ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
    tgtBorder:     dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)',
    tgtText:       dk ? 'rgba(113,113,122,0.9)' : 'rgba(80,55,20,0.65)',
    statCardBg:    dk ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)',
    statCardBorder:dk ? 'rgba(255,255,255,0.06)' : 'rgba(245,158,11,0.15)',
    statValue:     dk ? 'white' : 'rgba(30,20,5,0.9)',
    statLabel:     dk ? 'rgba(113,113,122,0.9)' : 'rgba(120,80,20,0.7)',
    ringBg:        dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)',
    malaString:    dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.09)',
    beadInactive:  dk ? '#1C1628' : '#D8C9A8',
    counterBg:     dk ? 'rgba(10,7,20,0.85)' : 'rgba(255,253,245,0.93)',
    counterBorder: dk ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.22)',
    sessionLabel:  dk ? 'rgba(245,158,11,0.6)' : 'rgba(160,90,0,0.65)',
    countColor:    dk ? 'white' : 'rgba(30,20,5,0.95)',
    targetLabel:   dk ? 'rgba(113,113,122,0.7)' : 'rgba(120,80,20,0.55)',
    malaCountColor:dk ? 'rgba(245,158,11,0.5)' : 'rgba(160,90,0,0.5)',
    tapBg:         dk ? 'radial-gradient(circle at 40% 35%,rgba(245,158,11,0.12) 0%,rgba(10,7,20,0.95) 65%)' : 'radial-gradient(circle at 40% 35%,rgba(245,158,11,0.18) 0%,rgba(255,250,240,0.97) 65%)',
    tapBorder:     dk ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.35)',
    tapShadow:     dk ? '0 20px 60px rgba(0,0,0,0.7),0 0 40px rgba(245,158,11,0.08),inset 0 1px 1px rgba(255,255,255,0.06)' : '0 12px 40px rgba(0,0,0,0.08),0 0 30px rgba(245,158,11,0.12),inset 0 1px 1px rgba(255,255,255,0.9)',
    footerBtnBg:   dk ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
    footerBtnBorder:dk? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.10)',
    footerBtnText: dk ? 'rgba(113,113,122,0.9)' : 'rgba(80,55,20,0.65)',
    inputBg:       dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    inputBorder:   dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)',
    inputText:     dk ? 'white' : 'rgba(30,20,5,0.9)',
    settingsBtnBg: dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    settingsBorder:dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)',
    historyRowBg:  dk ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    historyRowBorder:dk? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 pb-24 px-5 font-sans selection:bg-amber-500/30 relative overflow-hidden"
      style={{ background: th.pageBg }}
    >
      {/* Atmospheric background glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: `radial-gradient(circle, ${th.glowCenter} 0%, transparent 70%)` }} />
        <div className="absolute top-0 right-[-100px] w-[350px] h-[350px] rounded-full"
          style={{ background: `radial-gradient(circle, ${th.glowTR} 0%, transparent 70%)` }} />
        <div className="absolute bottom-0 left-[-80px] w-[300px] h-[300px] rounded-full"
          style={{ background: `radial-gradient(circle, ${th.glowBL} 0%, transparent 70%)` }} />
      </div>

      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between mb-6 relative z-10">
        <div>
          <p className="text-[9px] tracking-[0.35em] text-amber-500/40 uppercase font-bold mb-0.5">{t('naamjap.sacredPractice')}</p>
          <h1 className="text-base font-black tracking-tight" style={{ color: th.titleColor }}>{t('naamjap.title')}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowHistory(!showHistory); setShowSettings(false); }}
            className={`p-2.5 rounded-2xl transition-all border backdrop-blur-sm ${
              showHistory
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                : 'bg-white/[0.04] text-zinc-500 border-white/[0.07] hover:text-amber-400 hover:border-amber-500/20'
            }`}
          >
            <HistoryIcon size={17} />
          </button>
          <button
            onClick={() => { setShowSettings(!showSettings); setShowHistory(false); }}
            className={`p-2.5 rounded-2xl transition-all border backdrop-blur-sm ${
              showSettings
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                : 'bg-white/[0.04] text-zinc-500 border-white/[0.07] hover:text-amber-400 hover:border-amber-500/20'
            }`}
          >
            <Settings size={17} />
          </button>
        </div>
      </div>

      {/* Mantra display — shown when no panel open */}
      {currentMantraDef && !showSettings && !showHistory && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mb-5 text-center"
        >
          {/* Sanskrit text — primary */}
          {currentMantraDef.hindi && (
            <motion.p
              key={`hindi-${count}`}
              initial={count > 0 ? { scale: 1.06, color: '#FCD34D', textShadow: '0 0 24px rgba(252,211,77,0.9)' } : { scale: 1 }}
              animate={{ scale: 1, color: dk ? 'rgba(251,191,36,0.88)' : 'rgba(140,75,0,0.9)', textShadow: '0 0 0px transparent' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="font-devanagari font-bold leading-tight mb-1"
              style={{ fontSize: '1.65rem' }}
            >
              {currentMantraDef.hindi}
            </motion.p>
          )}
          {/* English name */}
          <motion.p
            key={`name-${count}`}
            initial={count > 0 ? { scale: 1.04, color: '#FCD34D' } : { scale: 1 }}
            animate={{ scale: 1, color: th.mantraName }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-base font-bold tracking-wide mb-2"
            style={{ color: th.mantraName, opacity: 0.7 }}
          >
            {mantra}
          </motion.p>
          {/* Lotus divider */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px flex-1 max-w-[40px]" style={{ background: `linear-gradient(to right, transparent, rgba(245,158,11,0.3))` }} />
            <span className="text-xs" style={{ color: 'rgba(245,158,11,0.45)' }}>🪷</span>
            <div className="h-px flex-1 max-w-[40px]" style={{ background: `linear-gradient(to left, transparent, rgba(245,158,11,0.3))` }} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: th.meaningColor }}>
            {currentMantraDef.meaning}
          </p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">

        {/* ── Settings Panel ── */}
        {showSettings ? (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="w-full max-w-sm rounded-[2rem] p-6 mb-8 border"
            style={{ background: th.cardBg, borderColor: th.cardBorder, backdropFilter: 'blur(20px)' }}
          >
            {/* Audio Options */}
            <div className="mb-7">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-5" style={{ color: th.sectionLabel }}>
                Audio Options
              </p>
              <div className="flex flex-col gap-4 mb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleMute}
                      className="p-2.5 rounded-xl border transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                      {isMuted ? <VolumeX size={17} className="text-zinc-500" /> : <Volume2 size={17} className="text-amber-400" />}
                    </button>
                    <span className="text-sm font-semibold text-zinc-300">{isMuted ? t("Audio Muted") : t("Audio Active")}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsVibrationOn(!isVibrationOn)}
                      className={`p-2.5 rounded-xl transition-all border ${isVibrationOn ? 'border-amber-500/30' : 'border-white/[0.08]'}`}
                      style={{ background: isVibrationOn ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)' }}
                    >
                      <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center text-[7px] font-black ${isVibrationOn ? 'border-amber-400 text-amber-400' : 'border-zinc-600 text-zinc-600'}`}>
                        VIB
                      </div>
                    </button>
                    <span className="text-sm font-semibold text-zinc-300">{isVibrationOn ? t("Vibration On") : t("Vibration Off")}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAudioMode('bell')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${
                    audioMode === 'bell'
                      ? 'border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'border-white/[0.07] text-zinc-500 hover:text-zinc-300'
                  }`}
                  style={{ background: audioMode === 'bell' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)' }}
                >
                  <Bell size={15} />
                  <span className="text-xs font-bold">{t('naamjap.bell')}</span>
                </button>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="file"
                      accept="audio/*,.mp3,.wav,.ogg,.m4a"
                      onChange={handleAudioUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all h-full ${
                        audioMode === 'custom' ? 'border-amber-500/40 text-amber-400' : 'border-white/[0.07] text-zinc-500 hover:text-zinc-300'
                      }`}
                      style={{ background: audioMode === 'custom' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)' }}
                    >
                      <Upload size={15} />
                      <span className="text-xs font-bold">{customAudioUrl ? 'Custom' : 'Upload'}</span>
                    </div>
                  </div>
                  {customAudioUrl && (
                    <button
                      onClick={() => new Audio(customAudioUrl).play().catch(() => {})}
                      className="px-3 rounded-2xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all"
                      style={{ background: 'rgba(245,158,11,0.08)' }}
                    >
                      <Play size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Mantra */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: th.sectionLabel }}>
                Add Custom Mantra
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={newMantra}
                  onChange={e => setNewMantra(e.target.value)}
                  placeholder={t("Mantra name...")}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
                  style={{ background: th.settingsBtnBg, border: `1px solid ${th.settingsBorder}` }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
                <textarea
                  value={newMantraDesc}
                  onChange={e => setNewMantraDesc(e.target.value)}
                  placeholder={t("Meaning or description...")}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all h-20 resize-none"
                  style={{ background: th.settingsBtnBg, border: `1px solid ${th.settingsBorder}` }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
                <button
                  onClick={addCustomMantra}
                  className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)', color: '#000', boxShadow: '0 0 20px rgba(245,158,11,0.25)' }}
                >
                  <Plus size={17} />
                  Add Mantra
                </button>
              </div>
            </div>
          </motion.div>

        ) : showHistory ? (

          /* ── History Panel ── */
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="w-full max-w-sm rounded-[2rem] p-6 mb-8 border"
            style={{ background: th.cardBg, borderColor: th.cardBorder, backdropFilter: 'blur(20px)' }}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-5" style={{ color: th.sectionLabel }}>
              Session History
            </p>
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {history.length > 0 ? history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-2xl border"
                  style={{ background: th.statCardBg, borderColor: th.statCardBorder }}
                >
                  <span className="text-sm font-semibold text-zinc-200">{h.mantraName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-zinc-600">{h.date}</span>
                    <span className="text-sm font-black text-amber-400">{h.count}</span>
                  </div>
                </div>
              )) : (
                <p className="text-center py-8 text-zinc-600 text-sm italic">{t('naamjap.noHistory')}</p>
              )}
            </div>
          </motion.div>

        ) : (

          /* ── Main Counter ── */
          <motion.div
            key="counter"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="flex flex-col items-center w-full"
          >
            {/* Stats row */}
            <div className="flex gap-3 mb-7 w-full max-w-sm">
              {[
                { value: todayTotal, label: t('naamjap.today'), glow: isCelebrating },
                { value: `${streak}d`, label: t('naamjap.streak'), icon: true },
                { value: lifetimeTotal || todayTotal, label: t('naamjap.total') },
              ].map(({ value, label, glow, icon }) => (
                <div
                  key={label}
                  className="flex-1 rounded-2xl p-3.5 flex flex-col items-center border transition-all"
                  style={glow
                    ? { background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.25)', boxShadow: '0 0 20px rgba(34,197,94,0.12)' }
                    : { background: th.statCardBg, borderColor: th.statCardBorder }
                  }
                >
                  <span className="text-xl font-black leading-tight" style={{ color: glow ? '#4ADE80' : th.statValue }}>{value}</span>
                  <span className="text-[9px] uppercase font-bold tracking-widest mt-0.5 flex items-center gap-1"
                    style={{ color: glow ? 'rgba(74,222,128,0.7)' : th.statLabel }}>
                    {icon && <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />}
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Circular mala + counter */}
            <div className="relative w-80 h-80 flex flex-col items-center justify-center mb-4">
              <AnimatePresence>{isCelebrating && <CelebrationEffects />}</AnimatePresence>

              {/* Outer ambient glow */}
              <div className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 65%)' }} />

              {/* Progress SVG ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 320 320">
                <circle cx="160" cy="160" r="140" fill="none" stroke={th.ringBg} strokeWidth="1" />
                <motion.circle
                  cx="160" cy="160" r="140" fill="none"
                  stroke="url(#goldenGrad)" strokeWidth="3.5" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 140}
                  animate={{ strokeDashoffset: (2 * Math.PI * 140) * (1 - progressPercentage / 100) }}
                  transition={{ type: 'spring', damping: 20, stiffness: 60 }}
                />
                <defs>
                  <linearGradient id="goldenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#FCD34D" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Mala string guide */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 320 320">
                <circle cx="160" cy="160" r="120" fill="none" stroke={th.malaString} strokeWidth="0.5" strokeDasharray="2,5" />
              </svg>

              {/* Mala beads */}
              <div className="absolute inset-0">
                {Array.from({ length: dotsCount }).map((_, i) => {
                  const angle = (i * 360) / dotsCount;
                  const radius = 120;
                  const currentMalaCount = count % dotsCount;
                  const isExactlyFull = count > 0 && currentMalaCount === 0;
                  const beadsToFill = isExactlyFull ? dotsCount : currentMalaCount;
                  const active = i < beadsToFill;
                  const isCurrent = count > 0 && i === (beadsToFill - 1 + dotsCount) % dotsCount;
                  return (
                    <motion.div
                      key={i}
                      initial={false}
                      animate={{
                        scale: isCurrent ? 1.7 : active ? 1.15 : 1,
                        backgroundColor: isCurrent ? '#FCD34D' : active ? '#F59E0B' : th.beadInactive,
                        boxShadow: isCurrent
                          ? '0 0 18px rgba(252,211,77,0.9), 0 0 6px rgba(252,211,77,0.6)'
                          : active ? '0 0 8px rgba(245,158,11,0.5)' : 'none'
                      }}
                      className="absolute w-2.5 h-2.5 rounded-full"
                      style={{
                        top: `calc(50% - 0.5rem + ${Math.sin((angle - 90) * (Math.PI / 180)) * radius}px)`,
                        left: `calc(50% - 0.5rem + ${Math.cos((angle - 90) * (Math.PI / 180)) * radius}px)`,
                        zIndex: isCurrent ? 20 : 10
                      }}
                    />
                  );
                })}
              </div>

              {/* Center display — Divine Yantra */}
              <div
                className="text-center z-20 flex flex-col items-center justify-center w-44 h-44 rounded-full relative"
                style={{
                  background: dk
                    ? 'radial-gradient(circle at 42% 32%, rgba(30,18,52,0.97) 0%, rgba(8,5,18,0.98) 100%)'
                    : 'radial-gradient(circle at 42% 32%, rgba(255,254,248,0.99) 0%, rgba(255,248,228,0.98) 100%)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: isCelebrating
                    ? '0 0 0 1.5px rgba(74,222,128,0.35), 0 0 50px rgba(74,222,128,0.2), inset 0 1px 2px rgba(255,255,255,0.12)'
                    : dk
                      ? '0 0 0 1.5px rgba(245,158,11,0.2), 0 0 50px rgba(245,158,11,0.1), inset 0 1px 1px rgba(255,255,255,0.06)'
                      : '0 0 0 1.5px rgba(245,158,11,0.25), 0 0 40px rgba(245,158,11,0.14), inset 0 2px 4px rgba(255,255,255,0.85)',
                }}
              >
                {/* SVG Mandala — decorative rings, ticks, lotus petals, inner arc */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 176 176">
                  <defs>
                    <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#D97706" />
                      <stop offset="100%" stopColor="#FCD34D" />
                    </linearGradient>
                  </defs>

                  {/* 8 subtle lotus petals behind count */}
                  {[0,45,90,135,180,225,270,315].map((deg) => {
                    const rad = deg * Math.PI / 180;
                    const cx = 88 + Math.cos(rad) * 26;
                    const cy = 88 + Math.sin(rad) * 26;
                    return (
                      <ellipse key={deg}
                        cx={cx} cy={cy} rx="10" ry="17"
                        fill={isCelebrating ? 'rgba(74,222,128,0.06)' : 'rgba(245,158,11,0.055)'}
                        stroke={isCelebrating ? 'rgba(74,222,128,0.14)' : 'rgba(245,158,11,0.12)'}
                        strokeWidth="0.5"
                        transform={`rotate(${deg}, ${cx}, ${cy})`}
                      />
                    );
                  })}

                  {/* Outer decorative dashed ring */}
                  <circle cx="88" cy="88" r="83"
                    fill="none"
                    stroke={isCelebrating ? 'rgba(74,222,128,0.22)' : 'rgba(245,158,11,0.18)'}
                    strokeWidth="0.75" strokeDasharray="3,7"
                  />

                  {/* Compass tick marks N/S/E/W */}
                  {[0,90,180,270].map(deg => {
                    const rad = (deg - 90) * Math.PI / 180;
                    return (
                      <line key={deg}
                        x1={88 + Math.cos(rad) * 79} y1={88 + Math.sin(rad) * 79}
                        x2={88 + Math.cos(rad) * 71} y2={88 + Math.sin(rad) * 71}
                        stroke={isCelebrating ? 'rgba(74,222,128,0.5)' : 'rgba(245,158,11,0.45)'}
                        strokeWidth="1.5" strokeLinecap="round"
                      />
                    );
                  })}

                  {/* Diagonal small dots */}
                  {[45,135,225,315].map(deg => {
                    const rad = (deg - 90) * Math.PI / 180;
                    return (
                      <circle key={deg}
                        cx={88 + Math.cos(rad) * 79} cy={88 + Math.sin(rad) * 79}
                        r="1.8"
                        fill={isCelebrating ? 'rgba(74,222,128,0.4)' : 'rgba(245,158,11,0.35)'}
                      />
                    );
                  })}

                  {/* Session progress arc track */}
                  <circle cx="88" cy="88" r="64"
                    fill="none"
                    stroke={isCelebrating ? 'rgba(74,222,128,0.07)' : 'rgba(245,158,11,0.07)'}
                    strokeWidth="5"
                  />
                  {/* Session progress arc fill */}
                  {progressPercentage > 0 && (
                    <motion.circle cx="88" cy="88" r="64"
                      fill="none"
                      stroke={isCelebrating ? 'rgba(74,222,128,0.6)' : 'url(#arcGrad)'}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 64}
                      animate={{ strokeDashoffset: (2 * Math.PI * 64) * (1 - progressPercentage / 100) }}
                      transition={{ type: 'spring', damping: 22, stiffness: 55 }}
                      transform="rotate(-90, 88, 88)"
                    />
                  )}

                  {/* Center origin dot */}
                  <circle cx="88" cy="88" r="2"
                    fill={isCelebrating ? 'rgba(74,222,128,0.5)' : 'rgba(245,158,11,0.35)'}
                  />
                </svg>

                {/* ॐ — breathing glow animation */}
                <motion.span
                  animate={{
                    textShadow: isCelebrating
                      ? ['0 0 18px rgba(74,222,128,0.9)', '0 0 38px rgba(74,222,128,0.4)', '0 0 18px rgba(74,222,128,0.9)']
                      : ['0 0 14px rgba(245,158,11,0.55)', '0 0 30px rgba(245,158,11,0.22)', '0 0 14px rgba(245,158,11,0.55)'],
                  }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="font-devanagari leading-none relative z-10 select-none"
                  style={{
                    fontSize: '1.75rem',
                    color: isCelebrating ? 'rgba(74,222,128,0.92)' : dk ? 'rgba(251,191,36,0.75)' : 'rgba(150,80,0,0.82)',
                    marginBottom: '-2px',
                    marginTop: '-4px',
                  }}
                >
                  ॐ
                </motion.span>

                {/* Count number */}
                <div className="flex items-center relative z-10">
                  <motion.span
                    key={count}
                    initial={{ y: -10, opacity: 0, scale: 1.18 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 13, stiffness: 230 }}
                    className="font-black tabular-nums leading-none"
                    style={{
                      fontSize: count >= 1000 ? '2.1rem' : count >= 100 ? '2.75rem' : '3.4rem',
                      letterSpacing: '-0.02em',
                      color: isCelebrating ? '#4ADE80' : th.countColor,
                      textShadow: isCelebrating
                        ? '0 0 28px rgba(74,222,128,0.6)'
                        : count > 0
                          ? dk ? '0 0 22px rgba(245,158,11,0.38)' : '0 0 18px rgba(200,110,0,0.22)'
                          : 'none',
                    }}
                  >
                    {count}
                  </motion.span>
                  {isCelebrating && (
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', delay: 0.08 }}
                      className="ml-1"
                    >
                      <Check size={18} strokeWidth={3.5} className="text-green-400" />
                    </motion.div>
                  )}
                </div>

                {/* Golden divider + target */}
                <div className="flex items-center gap-1.5 relative z-10 mt-0.5">
                  <div className="h-px w-4 rounded-full"
                    style={{ background: isCelebrating ? 'rgba(74,222,128,0.5)' : 'rgba(245,158,11,0.4)' }}
                  />
                  <span className="font-bold"
                    style={{
                      fontSize: '0.58rem',
                      letterSpacing: '0.07em',
                      color: isCelebrating ? 'rgba(74,222,128,0.85)' : th.targetLabel,
                    }}
                  >
                    {isCelebrating ? '🙏 पूर्ण' : `/ ${target === 99999 ? '∞' : target}`}
                  </span>
                  <div className="h-px w-4 rounded-full"
                    style={{ background: isCelebrating ? 'rgba(74,222,128,0.5)' : 'rgba(245,158,11,0.4)' }}
                  />
                </div>

                {/* Mala count badge */}
                {count >= dotsCount && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 mt-1 px-2 py-0.5 rounded-full"
                    style={{
                      background: isCelebrating ? 'rgba(74,222,128,0.12)' : 'rgba(245,158,11,0.1)',
                      border: `1px solid ${isCelebrating ? 'rgba(74,222,128,0.25)' : 'rgba(245,158,11,0.22)'}`,
                    }}
                  >
                    <span className="text-[8.5px] font-black font-devanagari"
                      style={{ color: isCelebrating ? 'rgba(74,222,128,0.92)' : th.sectionLabel }}>
                      {Math.floor(count / dotsCount)} माला
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Main TAP button — Sacred Divine Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.86, y: 4 }}
              onClick={handleIncrement}
              className="w-52 h-52 shrink-0 rounded-full flex flex-col items-center justify-center mb-8 relative overflow-hidden"
              style={{
                background: dk
                  ? 'radial-gradient(circle at 38% 32%, rgba(45,28,8,0.96) 0%, rgba(12,8,2,0.97) 70%)'
                  : 'radial-gradient(circle at 38% 32%, rgba(255,248,225,0.99) 0%, rgba(254,240,195,0.98) 70%)',
                border: `2px solid ${th.tapBorder}`,
                boxShadow: dk
                  ? '0 0 0 4px rgba(245,158,11,0.06), 0 24px 70px rgba(0,0,0,0.75), 0 0 50px rgba(245,158,11,0.1), inset 0 1px 1px rgba(255,255,255,0.07)'
                  : '0 0 0 4px rgba(245,158,11,0.08), 0 16px 50px rgba(0,0,0,0.1), 0 0 40px rgba(245,158,11,0.18), inset 0 2px 6px rgba(255,255,255,0.95)',
              }}
            >
              {/* SVG lotus interior */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60" viewBox="0 0 208 208">
                {[0,45,90,135,180,225,270,315].map((deg) => {
                  const rad = deg * Math.PI / 180;
                  const cx = 104 + Math.cos(rad) * 36;
                  const cy = 104 + Math.sin(rad) * 36;
                  return (
                    <ellipse key={deg} cx={cx} cy={cy} rx="14" ry="24"
                      fill="rgba(245,158,11,0.04)"
                      stroke="rgba(245,158,11,0.1)" strokeWidth="0.5"
                      transform={`rotate(${deg}, ${cx}, ${cy})`}
                    />
                  );
                })}
                <circle cx="104" cy="104" r="98" fill="none" stroke="rgba(245,158,11,0.06)" strokeWidth="1" />
                <circle cx="104" cy="104" r="82" fill="none" stroke="rgba(245,158,11,0.05)" strokeWidth="0.75" strokeDasharray="2,8" />
                <circle cx="104" cy="104" r="66" fill="none" stroke="rgba(245,158,11,0.04)" strokeWidth="0.5" />
              </svg>

              {/* Concentric sacred rings */}
              <div className="absolute inset-3 rounded-full pointer-events-none" style={{ border: '1px solid rgba(245,158,11,0.1)' }} />
              <div className="absolute inset-7 rounded-full pointer-events-none" style={{ border: '1px solid rgba(245,158,11,0.07)' }} />
              <div className="absolute inset-11 rounded-full pointer-events-none" style={{ border: '1px solid rgba(245,158,11,0.05)' }} />

              {/* Top ॐ label */}
              <span
                className="font-devanagari font-bold select-none relative z-10 mb-0.5"
                style={{
                  fontSize: '1rem',
                  color: dk ? 'rgba(251,191,36,0.45)' : 'rgba(160,90,0,0.4)',
                  letterSpacing: '0.05em',
                }}
              >
                ॐ
              </span>

              {/* 🙏 hands */}
              <div className="relative flex items-center justify-center h-14 relative z-10">
                <motion.div
                  key={`hand-${count}`}
                  animate={{
                    rotate: count > 0 ? [-18, 0] : 0,
                    x: count > 0 ? [-8, 0] : 0,
                    scale: count > 0 ? [1.14, 1] : 1,
                  }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="text-5xl select-none"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(245,158,11,0.3))' }}
                >
                  🙏
                </motion.div>
                <AnimatePresence>
                  {count > 0 && (
                    <motion.div
                      key={`spark-${count}`}
                      initial={{ opacity: 1, scale: 0.3, y: 0 }}
                      animate={{ opacity: 0, scale: 2, y: -20 }}
                      exit={{ opacity: 0 }}
                      className="absolute select-none pointer-events-none font-bold"
                      style={{ color: '#FCD34D', fontSize: '1.1rem' }}
                    >
                      ✦
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* JAP label */}
              <span
                className="font-black tracking-[0.2em] relative z-10 select-none"
                style={{
                  fontSize: '1.3rem',
                  color: dk ? 'rgba(255,255,255,0.9)' : 'rgba(30,18,0,0.85)',
                  textShadow: dk ? '0 1px 8px rgba(245,158,11,0.2)' : 'none',
                }}
              >
                {t('naamjap.jap')}
              </span>
              <span
                className="font-devanagari font-bold relative z-10 select-none mt-0.5"
                style={{
                  fontSize: '0.95rem',
                  letterSpacing: '0.18em',
                  color: dk ? 'rgba(245,158,11,0.6)' : 'rgba(150,85,0,0.65)',
                }}
              >
                जाप
              </span>

              {/* Bottom golden line */}
              <div className="h-px w-10 mt-2 rounded-full relative z-10"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)' }}
              />

              {/* Tap ripple */}
              <AnimatePresence>
                <motion.div
                  key={`rip-${count}`}
                  initial={{ opacity: 0.3, scale: 0 }}
                  animate={{ opacity: 0, scale: 2.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)' }}
                />
              </AnimatePresence>
            </motion.button>

            {/* Mantra & Target selector card — bottom */}
            <div
              className="w-full max-w-sm rounded-[2rem] p-5 mb-6 border"
              style={{ background: th.cardBg, borderColor: th.cardBorder, backdropFilter: 'blur(16px)', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}
            >
              <div className="flex justify-between items-center mb-4 px-1">
                <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: th.sectionLabel }}>{t('naamjap.selectMantra')}</p>
                <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full" style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  Active
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {allMantras.map(m => (
                  <button
                    key={m.name}
                    onClick={() => { setMantra(m.name); setCount(0); setTarget(mantraTargets[m.name] || 108); }}
                    className="px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all border"
                    style={mantra === m.name
                      ? { background: 'linear-gradient(135deg, #D97706, #F59E0B)', color: '#000', borderColor: 'transparent', boxShadow: '0 0 18px rgba(245,158,11,0.3)' }
                      : { background: th.pillBg, borderColor: th.pillBorder, color: th.pillText }
                    }
                  >
                    {m.name}
                  </button>
                ))}
              </div>

              <div className="border-t pt-4 mb-3" style={{ borderColor: th.dividerColor }}>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-3 text-center" style={{ color: th.sectionLabel }}>
                  {t('naamjap.sessionTarget')}
                </p>
                <div className="grid grid-cols-6 gap-1.5 mb-2">
                  {TARGET_OPTIONS.map(val => (
                    <button
                      key={val}
                      onClick={() => handleSetTarget(val)}
                      className="py-2 rounded-xl text-xs font-bold transition-all border"
                      style={target === val
                        ? { background: 'rgba(245,158,11,0.15)', color: '#FBBF24', borderColor: 'rgba(245,158,11,0.35)', boxShadow: '0 0 10px rgba(245,158,11,0.15)' }
                        : { background: th.tgtBg, borderColor: th.tgtBorder, color: th.tgtText }
                      }
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleSetTarget(99999)}
                  className="w-full py-1.5 rounded-xl text-lg font-bold border transition-all"
                  style={target === 99999
                    ? { background: 'rgba(245,158,11,0.15)', color: '#FBBF24', borderColor: 'rgba(245,158,11,0.35)' }
                    : { background: th.tgtBg, borderColor: th.tgtBorder, color: th.tgtText }
                  }
                >
                  ∞
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer: Undo / Reset */}
      <div className="flex gap-3">
        <button
          onClick={handleUndo}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold border transition-all hover:text-white"
          style={{ background: th.tgtBg, borderColor: th.tgtBorder, color: th.tgtText }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
        >
          <Undo2 size={13} className="-translate-y-px" />
          {t('naamjap.undo')}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold border transition-all hover:text-white"
          style={{ background: th.tgtBg, borderColor: th.tgtBorder, color: th.tgtText }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
        >
          <RotateCcw size={13} className="-translate-y-px" />
          {t('naamjap.reset')}
        </button>
      </div>
    </div>
  );
}
