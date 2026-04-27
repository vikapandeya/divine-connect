import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  Settings, 
  Minus, 
  History as HistoryIcon,
  Flame,
  Globe,
  Undo2,
  Volume2,
  VolumeX,
  Upload,
  Plus,
  Bell,
  Check,
  Play,
  Music
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { saveNaamJap, getDailyJaps } from '../services/naamJapService';
import { NaamJap } from '../types';
import { useTranslation } from 'react-i18next';

const TARGET_OPTIONS = [27, 54, 108, 216, 324, 1008];
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
  
  // Mantra specific targets
  const [mantraTargets, setMantraTargets] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('mantra_targets');
    return saved ? JSON.parse(saved) : {};
  });
  
  // Audio state
  const [isMuted, setIsMuted] = useState(false);
  const [audioMode, setAudioMode] = useState<'bell' | 'custom'>('bell');
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bellRef = useRef<HTMLAudioElement | null>(null);

  // Sync custom audio when URL changes for better playback reliability
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

  // Trigger celebration when target reached
  useEffect(() => {
    if (todayTotal >= target && target > 0 && !isCelebrating) {
      setIsCelebrating(true);
      // Optional: hide after some time or keep as a "completed" state
      const timer = setTimeout(() => setIsCelebrating(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [todayTotal, target]);

  // Aura/Ripple component for celebration
  const CelebrationEffects = () => (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {/* Outer Glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.2, 1.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
        className="absolute w-80 h-80 rounded-full bg-orange-500/20 blur-3xl"
      />
      {/* Expansion Ripples */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.3, 0], scale: [0.5, 2.5] }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            delay: i * 1.5,
            ease: "easeOut" 
          }}
          className="absolute w-64 h-64 border border-orange-500/30 rounded-full"
        />
      ))}
    </div>
  );

  // Initialize audio
  useEffect(() => {
    // Default bell sound
    bellRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    
    // Load custom mantra list and audio settings from local storage
    const savedMantras = localStorage.getItem('custom_mantras');
    if (savedMantras) setCustomMantras(JSON.parse(savedMantras));

    const savedAudioUrl = localStorage.getItem('custom_audio_url');
    if (savedAudioUrl) {
      setCustomAudioUrl(savedAudioUrl);
      setAudioMode('custom');
    }

    const savedMuted = localStorage.getItem('audio_muted');
    if (savedMuted) setIsMuted(JSON.parse(savedMuted));

    const savedVib = localStorage.getItem('vibration_on');
    if (savedVib) setIsVibrationOn(JSON.parse(savedVib));
  }, []);

  useEffect(() => {
    localStorage.setItem('vibration_on', JSON.stringify(isVibrationOn));
  }, [isVibrationOn]);

  useEffect(() => {
    localStorage.setItem('mantra_targets', JSON.stringify(mantraTargets));
  }, [mantraTargets]);

  const playFeedback = useCallback(() => {
    if (isMuted) return;

    if (audioMode === 'bell' && bellRef.current) {
      bellRef.current.currentTime = 0;
      bellRef.current.play().catch((e) => console.error("Bell play failed:", e));
    } else if (audioMode === 'custom' && customAudioUrl) {
      // Re-create or update audio element if URL changed
      if (!audioRef.current || audioRef.current.src !== customAudioUrl) {
        audioRef.current = new Audio(customAudioUrl);
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => console.error("Custom audio play failed:", e));
    }
  }, [isMuted, audioMode, customAudioUrl]);

  // Combined feedback
  const triggerFeedback = useCallback(() => {
    if (isVibrationOn && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
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
    if (window.confirm(t("Reset current counter?"))) {
      setCount(0);
      triggerFeedback();
    }
  }, [t, triggerFeedback]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on space
      if (e.code === 'Space' || e.code === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'BUTTON' && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
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

    // Handle Audio Upload
    const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        console.log("File uploaded:", file.name, file.type);
        const url = URL.createObjectURL(file);
        const tempAudio = new Audio();
        
        tempAudio.onerror = (e) => {
          console.error("Audio Load Error:", e);
          alert(t("Failed to load audio file. Please try a standard MP3 or WAV format."));
          URL.revokeObjectURL(url);
        };

        tempAudio.onloadedmetadata = () => {
          if (tempAudio.duration > 15) {
            alert(t("Audio must be shorter than 15 seconds"));
            URL.revokeObjectURL(url);
          } else {
            console.log("Audio loaded successfully, duration:", tempAudio.duration);
            setCustomAudioUrl(url);
            setAudioMode('custom');
            localStorage.setItem('cached_custom_audio', 'true'); // Hint for next load (though Blob URLs are transient)
          }
        };
        
        tempAudio.src = url;
      }
    };

  const toggleMute = () => {
    const newVal = !isMuted;
    setIsMuted(newVal);
    localStorage.setItem('audio_muted', JSON.stringify(newVal));
  };

  // Persistence
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (user && (count > 0 || todayTotal > 0)) {
      const timer = setTimeout(() => {
        saveNaamJap({
          userId: user.uid,
          mantraId: mantra.toLowerCase().replace(/\s+/g, '-'),
          mantraName: mantra,
          count: todayTotal,
          target,
          date: today
        }).catch(err => console.error("Auto-save failed:", err));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [todayTotal, target, user, mantra, count]);

  // Streak Calculation
  const calculateStreak = useCallback((allLogs: NaamJap[]) => {
    if (allLogs.length === 0) return 0;
    
    // Group by date and sort descending
    const dates = Array.from(new Set(allLogs.map(l => l.date))).sort((a, b) => b.localeCompare(a));
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (dates[0] !== today && dates[0] !== yesterday) return 0;
    
    let currentStreak = 0;
    let checkDate = new Date();
    
    for (const dateStr of dates) {
      if (dateStr === checkDate.toISOString().split('T')[0]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (user) {
      getDailyJaps(user.uid, today).then(japs => {
        setHistory(japs);
        const relevantJap = japs.find(j => j.mantraName === mantra);
        if (relevantJap) {
          setTodayTotal(relevantJap.count);
          setTarget(relevantJap.target);
        }
        
        // Fetch all-time logs for streak
        fetch(`/api/naam-jap/logs?userId=${user.uid}`)
          .then(res => res.json())
          .then(allLogs => {
            setStreak(calculateStreak(allLogs));
            
            // Extract all targets
            const targets: Record<string, number> = {};
            allLogs.forEach((l: NaamJap) => {
              if (!targets[l.mantraName] || new Date(l.updatedAt) > new Date()) {
                 targets[l.mantraName] = l.target;
              }
            });
            setMantraTargets(targets);
          });
      }).catch(err => console.error("Initial load failed:", err));
    }
  }, [user, mantra, calculateStreak]);

  const progressPercentage = Math.min((count / target) * 100, 100);
  const dotsCount = 108; // Typical mala beads

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

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-start pt-12 pb-20 px-6 font-sans selection:bg-orange-500/30 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50vh] bg-[radial-gradient(circle_at_center,_rgba(249,115,22,0.03)_0%,_transparent_70%)] pointer-events-none" />
      
      {/* 0. Header with Settings/History Toggles */}
      <div className="w-full max-w-sm flex items-center justify-end gap-2 mb-4 relative z-10">
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className={`p-3 rounded-2xl transition-all border ${showHistory ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-[#1a1a1a] text-stone-400 border-stone-800 hover:text-white hover:border-stone-700'}`}
        >
          <HistoryIcon size={20} />
        </button>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-3 rounded-2xl transition-all border ${showSettings ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-[#1a1a1a] text-stone-400 border-stone-800 hover:text-white hover:border-stone-700'}`}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Mantra Meaning/Description */}
      {currentMantraDef && !showSettings && !showHistory && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-sm mb-6 text-center"
        >
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">{mantra}</h1>
          {currentMantraDef?.hindi && (
            <p className="text-orange-500/80 font-bold mb-2 font-hindi text-lg">{currentMantraDef.hindi}</p>
          )}
          <p className="text-xs font-bold text-orange-400/90 uppercase tracking-[0.2em] mb-2">
            {currentMantraDef.meaning}
          </p>
          <p className="text-xs text-stone-400 leading-relaxed px-6 font-medium">
            {currentMantraDef.description}
          </p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {showSettings ? (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-sm bg-[#161616] rounded-[2rem] p-6 border border-stone-800/40 mb-8"
          >
            {/* Audio Settings */}
            <div className="mb-6">
              <h3 className="text-stone-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Audio Options</h3>
                    {/* Feedback Settings */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={toggleMute}
                            className="p-3 bg-[#222] rounded-2xl text-white hover:bg-stone-800 transition-all font-mono"
                          >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                          </button>
                          <span className="text-sm font-medium">{isMuted ? t("Audio Muted") : t("Audio Active")}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setIsVibrationOn(!isVibrationOn)}
                            className={`p-3 rounded-2xl transition-all ${isVibrationOn ? 'bg-orange-500/10 text-orange-500 border border-orange-500/30' : 'bg-[#222] text-stone-500 hover:text-white'}`}
                          >
                            <div className={isVibrationOn ? 'animate-pulse' : ''}>
                              <div className="w-4.5 h-4.5 border-2 border-current rounded-sm flex items-center justify-center text-[8px] font-bold">VIB</div>
                            </div>
                          </button>
                          <span className="text-sm font-medium">{isVibrationOn ? t("Vibration On") : t("Vibration Off")}</span>
                        </div>
                      </div>
                    </div>

              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAudioMode('bell')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${
                    audioMode === 'bell' 
                    ? 'border-orange-500/50 bg-orange-500/10 text-orange-500' 
                    : 'border-stone-800 bg-[#1a1a1a] text-stone-500 hover:text-white'
                  }`}
                >
                  <Bell size={16} />
                  <span className="text-xs font-bold">Bell</span>
                </button>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="file" 
                      accept="audio/*,video/mpeg,video/mp4,video/quicktime,audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac,audio/m4a,audio/x-m4a,.mpeg,.mpg,.mp4,.m4a,.mp3,.wav,.ogg" 
                      onChange={handleAudioUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className={`flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all h-full ${
                      audioMode === 'custom' 
                      ? 'border-orange-500/50 bg-orange-500/10 text-orange-500' 
                      : 'border-stone-800 bg-[#1a1a1a] text-stone-500 hover:text-white'
                    }`}>
                      <Upload size={16} />
                      <span className="text-xs font-bold text-center">{customAudioUrl ? 'Custom' : 'Upload'}</span>
                    </div>
                  </div>
                  {customAudioUrl && (
                    <button 
                      onClick={() => {
                        const a = new Audio(customAudioUrl);
                        a.play().catch(e => console.error("Test play failed:", e));
                      }}
                      className="px-3 bg-orange-500/10 text-orange-500 rounded-2xl border border-orange-500/30 hover:bg-orange-500/20"
                    >
                      <Play size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Mantra Input */}
            <div>
              <h3 className="text-stone-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Add Custom Mantra</h3>
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  value={newMantra}
                  onChange={(e) => setNewMantra(e.target.value)}
                  placeholder={t("Mantra name...")}
                  className="w-full bg-[#1a1a1a] border border-stone-800 rounded-xl px-4 py-2 text-sm text-white focus:border-orange-500 outline-none transition-all"
                />
                <textarea
                  value={newMantraDesc}
                  onChange={(e) => setNewMantraDesc(e.target.value)}
                  placeholder={t("Meaning or description...")}
                  className="w-full bg-[#1a1a1a] border border-stone-800 rounded-xl px-4 py-2 text-sm text-white focus:border-orange-500 outline-none transition-all h-20 resize-none"
                />
                <button 
                  onClick={addCustomMantra}
                  className="w-full py-2.5 bg-orange-600 rounded-xl text-white font-bold hover:bg-orange-700 transition-all shadow-[0_0_15px_rgba(234,88,12,0.3)] flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Mantra
                </button>
              </div>
            </div>
          </motion.div>
        ) : showHistory ? (
          <motion.div 
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-sm bg-[#161616] rounded-[2rem] p-6 border border-stone-800/40 mb-8"
          >
            <h3 className="text-stone-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Recent Session History</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {history.length > 0 ? history.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-xl border border-stone-800/30">
                  <span className="text-sm font-medium">{h.mantraName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-500">{h.date}</span>
                    <span className="text-sm font-bold text-orange-500">{h.count}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-stone-600 text-sm italic">No history found for today</div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="counter"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center w-full"
          >
            {/* 1. Mantra Selection & Target (Grouped at top for visibility) */}
            <div className="bg-[#161616] p-5 rounded-[2rem] border border-stone-800/40 w-full max-w-sm mb-6 shadow-xl">
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-stone-500 text-[10px] font-black uppercase tracking-[0.2em]">Select Mantra</h3>
                <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full uppercase">Active</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {allMantras.map(m => (
                  <button
                    key={m.name}
                    onClick={() => {
                      setMantra(m.name);
                      setCount(0);
                      setTarget(mantraTargets[m.name] || 108);
                    }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                      mantra === m.name 
                        ? 'bg-orange-600 text-white border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.3)]' 
                        : 'bg-[#1a1a1a] border-stone-800 text-stone-400 hover:text-white hover:border-stone-700'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>

              <h3 className="text-stone-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-center border-t border-stone-800/50 pt-4">Set Session Target</h3>
              <div className="grid grid-cols-6 gap-2 mb-3">
                {TARGET_OPTIONS.map(val => (
                  <button
                    key={val}
                    onClick={() => handleSetTarget(val)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      target === val 
                        ? 'bg-stone-100 text-stone-900 border-white' 
                        : 'bg-[#1a1a1a] text-stone-500 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleSetTarget(99999)}
                className={`w-full py-1.5 rounded-xl text-lg font-bold flex justify-center transition-all border ${
                   target === 99999
                    ? 'bg-stone-100 text-stone-900 border-white'
                    : 'bg-[#1a1a1a] text-stone-500 border-stone-800 hover:border-stone-700'
                }`}
              >
                ∞
              </button>
            </div>

            {/* 2. Stats Section */}
            <div className="flex gap-4 mb-6">
              <div className={`px-6 py-3 rounded-2xl border transition-all flex flex-col items-center min-w-[90px] ${
                isCelebrating 
                  ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]' 
                  : 'bg-[#1a1a1a] border-stone-800/50'
              }`}>
                <span className={`text-xl font-bold leading-tight transition-colors ${isCelebrating ? 'text-green-400' : 'text-white'}`}>
                  {todayTotal}
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors ${isCelebrating ? 'text-green-500' : 'text-stone-500'}`}>
                  Today
                </span>
              </div>
              <div className="bg-[#1a1a1a] px-6 py-3 rounded-2xl border border-stone-800/50 flex flex-col items-center min-w-[90px] relative">
                <span className="text-xl font-bold text-white leading-tight">{streak}d</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1`}>
                  <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                  Streak
                </span>
              </div>
              <div className="bg-[#1a1a1a] px-6 py-3 rounded-2xl border border-stone-800/50 flex flex-col items-center min-w-[90px]">
                <span className="text-xl font-bold text-white leading-tight">{lifetimeTotal || todayTotal}</span>
                <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Total</span>
              </div>
            </div>

            {/* 3. Circular Progress Section */}
            <div className="relative w-80 h-80 flex flex-col items-center justify-center mb-2">
              <AnimatePresence>
                {isCelebrating && <CelebrationEffects />}
              </AnimatePresence>
              
              {/* Background Glow */}
              <div className="absolute inset-0 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />

              {/* Progress SVG Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 320 320">
                {/* Background Ring */}
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  fill="none"
                  stroke="#1c1917"
                  strokeWidth="1"
                  className="opacity-50"
                />
                {/* Progress Ring */}
                <motion.circle
                  cx="160"
                  cy="160"
                  r="140"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 140}
                  animate={{
                    strokeDashoffset: (2 * Math.PI * 140) * (1 - progressPercentage / 100)
                  }}
                  transition={{ type: 'spring', damping: 20, stiffness: 60 }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Mala Beads String */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 320 320">
                <circle
                  cx="160"
                  cy="160"
                  r="120"
                  fill="none"
                  stroke="#444"
                  strokeWidth="0.5"
                  strokeDasharray="2,4"
                  className="opacity-30"
                />
              </svg>

              <div className="absolute inset-0">
                {Array.from({ length: dotsCount }).map((_, i) => {
                  const angle = (i * 360) / dotsCount;
                  const radius = 120;
                  
                  // Logic to show beads filled for current cycle
                  // If we just finished a full mala (e.g. 108), show all beads filled
                  const currentMalaCount = count % dotsCount;
                  const isExactlyFull = count > 0 && currentMalaCount === 0;
                  const beadsToFill = isExactlyFull ? dotsCount : currentMalaCount;
                  
                  const active = i < beadsToFill;
                  const isCurrent = (count > 0 && i === (beadsToFill - 1 + dotsCount) % dotsCount);
                  
                  return (
                    <motion.div
                      key={i}
                      initial={false}
                      animate={{
                        scale: isCurrent ? 1.6 : active ? 1.1 : 1,
                        backgroundColor: isCurrent ? '#fbbf24' : active ? '#f97316' : '#292524',
                        boxShadow: isCurrent 
                          ? '0 0 20px rgba(251,191,36,0.9), inset -1px -1px 3px rgba(0,0,0,0.6)' 
                          : active ? '0 0 8px rgba(249,115,22,0.4), inset -1px -1px 2px rgba(0,0,0,0.5)' : 'inset -1px -1px 2px rgba(0,0,0,0.5)'
                      }}
                      className="absolute w-2.5 h-2.5 rounded-full border border-black/20"
                      style={{
                        top: `calc(50% - 0.5rem + ${Math.sin((angle - 90) * (Math.PI / 180)) * radius}px)`,
                        left: `calc(50% - 0.5rem + ${Math.cos((angle - 90) * (Math.PI / 180)) * radius}px)`,
                        zIndex: isCurrent ? 20 : 10
                      }}
                    >
                      {/* Rudraksha Texture (internal detail) */}
                      <div className="absolute inset-0.5 rounded-full bg-black/10 opacity-40 mix-blend-overlay" />
                    </motion.div>
                  );
                })}
              </div>

              <div className="text-center z-20 flex flex-col items-center bg-black/40 backdrop-blur-sm p-8 rounded-full w-40 h-40 border border-stone-800/30 justify-center">
                <div className={`h-0.5 w-6 mb-2 rounded-full transition-colors ${isCelebrating ? 'bg-green-400' : 'bg-orange-500'}`} />
                <span className="text-stone-500 text-[10px] font-black tracking-widest uppercase mb-1">
                  {isCelebrating ? 'Goal Reached' : 'Session'}
                </span>
                <div className="flex items-center gap-1">
                  <motion.span 
                    key={count}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`text-5xl font-black tabular-nums transition-colors ${isCelebrating ? 'text-green-400' : 'text-white'}`}
                  >
                    {count}
                  </motion.span>
                  {isCelebrating && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-green-400"
                    >
                      <Check size={24} strokeWidth={4} />
                    </motion.div>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-stone-600 text-[10px] font-bold tracking-widest mt-1">/ {target}</span>
                  {count >= dotsCount && (
                    <span className="text-orange-500/50 text-[8px] font-black uppercase mt-1">
                      {Math.floor(count / dotsCount)} Mala{Math.floor(count / dotsCount) > 1 ? 's' : ''} Complete
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Large Tap Button with Clapping Hands */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.88, y: 4 }}
              onClick={handleIncrement}
              className="w-56 h-56 shrink-0 rounded-full bg-gradient-to-br from-stone-800 via-stone-900 to-black shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center border-[10px] border-[#1a1a1a] mb-12 group transition-all relative overflow-hidden active:brightness-125"
            >
              {/* Hands Animation */}
              <div className="relative flex items-center justify-center mb-2 h-20">
                <motion.div
                  animate={{
                    rotate: count > 0 ? [-25, 0, -25] : 0,
                    x: count > 0 ? [-12, 0, -12] : 0,
                    scale: count > 0 ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  key={`hand-${count}`}
                  className="text-5xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                >
                  🙏
                </motion.div>
                
                {/* Clapping visual impact */}
                <AnimatePresence>
                  {count > 0 && (
                    <motion.div
                      key={`impact-${count}`}
                      initial={{ opacity: 1, scale: 0.5 }}
                      animate={{ opacity: 0, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      className="absolute text-orange-500 font-bold text-lg select-none pointer-events-none"
                    >
                      ✸
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <span className="text-white text-3xl font-black tracking-tighter drop-shadow-lg">TAP JAP</span>
              <div className="h-0.5 w-8 bg-orange-600 mt-1 mb-2 rounded-full group-active:w-16 transition-all" />
              
              {/* Ripple on tap */}
              <AnimatePresence>
                <motion.div
                  key={`ripple-${count}`}
                  initial={{ opacity: 0.3, scale: 0 }}
                  animate={{ opacity: 0, scale: 2.5 }}
                  className="absolute inset-0 bg-white/10 rounded-full pointer-events-none"
                />
              </AnimatePresence>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Footer Undo/Reset */}
      <div className="flex gap-4">
        <button 
          onClick={handleUndo}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1a1a1a] text-stone-400 text-xs font-bold border border-stone-800/60 hover:text-white hover:bg-stone-800/40 transition-all"
        >
          <Undo2 size={14} className="-translate-y-0.5" />
          Undo
        </button>
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1a1a1a] text-stone-400 text-xs font-bold border border-stone-800/60 hover:text-white hover:bg-stone-800/40 transition-all"
        >
          <RotateCcw size={14} className="-translate-y-0.5" />
          Reset
        </button>
      </div>

    </div>
  );
}
