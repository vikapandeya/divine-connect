import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BellOff,
  Check,
  ChevronDown,
  Flame,
  History,
  Minus,
  Plus,
  RotateCcw,
  Settings,
  Smartphone,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { usePageSeo } from '../lib/seo';
import {
  decrementCount,
  deleteCustomMantra,
  getAllMantras,
  getCountForMantra,
  getHistoryForMantra,
  getStreakData,
  getTargetForMantra,
  getTotalCountForMantra,
  incrementCount,
  JapMantra,
  JapSession,
  JapStreakData,
  playCompletionSound,
  playTapSound,
  PREDEFINED_MANTRAS,
  recordTodayActivity,
  resetCount,
  saveCustomMantra,
  setTarget,
  TARGET_PRESETS,
} from '../lib/jap-counter';

// ─── Mala Ring SVG ────────────────────────────────────────────────────────────

function MalaRing({
  count,
  target,
  accentColor,
}: {
  count: number;
  target: number | null;
  accentColor: string;
}) {
  const cx = 150;
  const cy = 150;
  const ringR = 100;
  const beadR = 124;
  const circumference = 2 * Math.PI * ringR;

  const effectiveTarget = target ?? 108;
  const progress = Math.min(count / effectiveTarget, 1);
  const dashOffset = circumference * (1 - progress);

  const rounds = Math.floor(count / 108);
  const beadsFilled = count % 108 === 0 && count > 0 ? 108 : count % 108;

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto select-none" aria-label={`${count} chants counted`}>
      {/* Subtle glow ring */}
      <circle cx={cx} cy={cy} r={ringR + 6} fill="none" stroke={accentColor} strokeWidth={1} opacity={0.15} />

      {/* Background track */}
      <circle cx={cx} cy={cy} r={ringR} fill="none" stroke="#e7e5e4" strokeWidth={13} />

      {/* Progress arc */}
      <circle
        cx={cx}
        cy={cy}
        r={ringR}
        fill="none"
        stroke={accentColor}
        strokeWidth={13}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.25s ease-out' }}
      />

      {/* Mala beads — 108 dots */}
      {Array.from({ length: 108 }, (_, i) => {
        const angle = (i / 108) * 2 * Math.PI - Math.PI / 2;
        const x = cx + beadR * Math.cos(angle);
        const y = cy + beadR * Math.sin(angle);
        const filled = i < beadsFilled;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={filled ? 3.2 : 2.5}
            fill={filled ? accentColor : '#d6d3d1'}
            style={{ transition: 'fill 0.1s ease' }}
          />
        );
      })}

      {/* Center count */}
      <text
        x={cx}
        y={rounds > 0 ? cy - 20 : cy - 10}
        textAnchor="middle"
        fill="#1c1917"
        style={{ fontSize: count >= 10000 ? 38 : count >= 1000 ? 44 : 52, fontWeight: 700, fontFamily: 'Georgia, serif' }}
      >
        {count.toLocaleString('en-IN')}
      </text>

      <text x={cx} y={rounds > 0 ? cy + 8 : cy + 16} textAnchor="middle" fill="#78716c" style={{ fontSize: 13, fontFamily: 'system-ui, sans-serif' }}>
        chants today
      </text>

      {rounds > 0 && (
        <text x={cx} y={cy + 32} textAnchor="middle" fill={accentColor} style={{ fontSize: 12.5, fontWeight: 600, fontFamily: 'system-ui, sans-serif' }}>
          {rounds} mala {rounds === 1 ? 'round' : 'rounds'} ✓
        </text>
      )}
    </svg>
  );
}

// ─── Mantra Selector Modal ────────────────────────────────────────────────────

function MantraSelectorModal({
  mantras,
  selected,
  onSelect,
  onClose,
  onAddCustom,
  onDeleteCustom,
}: {
  mantras: JapMantra[];
  selected: JapMantra;
  onSelect: (m: JapMantra) => void;
  onClose: () => void;
  onAddCustom: (name: string) => void;
  onDeleteCustom: (id: string) => void;
}) {
  const [customInput, setCustomInput] = useState('');

  const handleAdd = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    onAddCustom(trimmed);
    setCustomInput('');
  };

  const deityColors: Record<string, string> = {
    Radha: 'bg-pink-50 text-pink-700 border-pink-200',
    Krishna: 'bg-blue-50 text-blue-700 border-blue-200',
    Shiva: 'bg-purple-50 text-purple-700 border-purple-200',
    Vishnu: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-0 sm:pb-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" />
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="relative w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] bg-white shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <h2 className="text-lg font-serif font-bold text-stone-900">Choose Mantra</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
          {mantras.map((m) => {
            const isActive = m.id === selected.id;
            const colorClass = m.deity ? deityColors[m.deity] : 'bg-stone-50 text-stone-700 border-stone-200';
            return (
              <div
                key={m.id}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border px-4 py-3.5 cursor-pointer transition-all',
                  isActive ? 'border-orange-400 bg-orange-50 shadow-sm' : `${colorClass} hover:shadow-sm`,
                )}
                onClick={() => { onSelect(m); onClose(); }}
              >
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold', isActive ? 'bg-orange-400 text-white' : 'bg-white/70 text-stone-600')}>
                  {isActive ? <Check className="h-4 w-4" /> : (m.deity ? m.deity[0] : 'C')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-stone-900 truncate">{m.name}</p>
                  {m.deity && <p className="text-xs text-stone-500 mt-0.5">{m.deity}</p>}
                  {m.isCustom && <p className="text-xs text-stone-400 mt-0.5">Custom mantra</p>}
                </div>
                {m.isCustom && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteCustom(m.id); }}
                    className="rounded-full p-1 text-stone-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add custom mantra */}
        <div className="border-t border-stone-100 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">Add Custom Mantra</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="e.g. Jai Mata Di"
              className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
            />
            <button
              onClick={handleAdd}
              disabled={!customInput.trim()}
              className="rounded-xl bg-orange-500 px-3 py-2 text-white disabled:opacity-40 hover:bg-orange-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Target Modal ─────────────────────────────────────────────────────────────

function TargetModal({
  currentTarget,
  onSave,
  onClose,
}: {
  currentTarget: number | null;
  onSave: (target: number | null) => void;
  onClose: () => void;
}) {
  const [inputVal, setInputVal] = useState(currentTarget ? String(currentTarget) : '');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 360 }}
        className="relative w-full max-w-sm rounded-[2rem] bg-white shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-serif font-bold text-stone-900">Set Target</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-stone-500 mb-4">Choose a preset or enter a custom target count.</p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {TARGET_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => { onSave(preset); onClose(); }}
              className={cn(
                'rounded-xl border py-2.5 text-sm font-bold transition-all',
                currentTarget === preset
                  ? 'border-orange-400 bg-orange-50 text-orange-700'
                  : 'border-stone-200 text-stone-700 hover:border-orange-300 hover:bg-orange-50',
              )}
            >
              {preset.toLocaleString('en-IN')}
            </button>
          ))}
          <button
            onClick={() => { onSave(null); onClose(); }}
            className={cn(
              'rounded-xl border py-2.5 text-sm font-bold transition-all col-span-1',
              currentTarget === null
                ? 'border-orange-400 bg-orange-50 text-orange-700'
                : 'border-stone-200 text-stone-700 hover:border-orange-300 hover:bg-orange-50',
            )}
          >
            No limit
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Custom number"
            className="flex-1 rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
          />
          <button
            onClick={() => {
              const n = parseInt(inputVal, 10);
              if (n > 0) { onSave(n); onClose(); }
            }}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-40"
            disabled={!inputVal || parseInt(inputVal, 10) <= 0}
          >
            Set
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Completion Overlay ───────────────────────────────────────────────────────

function CompletionOverlay({
  count,
  mantraName,
  onContinue,
  onClose,
}: {
  count: number;
  mantraName: string;
  onContinue: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" />
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: 'spring', damping: 18, stiffness: 260 }}
        className="relative w-full max-w-sm rounded-[2.5rem] bg-white shadow-2xl p-8 text-center overflow-hidden"
      >
        {/* Decorative ring */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-orange-100/60" />
        </div>

        <motion.div
          initial={{ scale: 0.3, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.1, damping: 14 }}
          className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 shadow-lg shadow-orange-200"
        >
          <Trophy className="h-9 w-9 text-white" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-600 mb-3">
            🎉 Target Reached!
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-1">{count.toLocaleString('en-IN')} Chants</h2>
          <p className="text-sm text-stone-500 mb-1">{mantraName}</p>
          <p className="text-xs text-stone-400 mb-6">Jai Shri Ram! Your devotion is complete.</p>

          <div className="flex gap-3">
            <button
              onClick={onContinue}
              className="flex-1 rounded-2xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-200"
            >
              Continue Chanting
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl border border-stone-200 py-3 text-sm font-bold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── History Panel ────────────────────────────────────────────────────────────

function HistoryPanel({ mantraId, mantraName, totalCount }: { mantraId: string; mantraName: string; totalCount: number }) {
  const sessions = getHistoryForMantra(mantraId);

  if (sessions.length === 0) {
    return (
      <div className="mt-4 rounded-[1.5rem] border border-stone-200 bg-white p-6 text-center shadow-sm">
        <History className="mx-auto h-8 w-8 text-stone-300 mb-2" />
        <p className="text-sm text-stone-500">No past sessions yet for {mantraName}.</p>
        <p className="text-xs text-stone-400 mt-1">Start counting and come back tomorrow!</p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-[1.5rem] border border-stone-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
        <div>
          <h3 className="font-semibold text-stone-900 text-sm">Past Sessions</h3>
          <p className="text-xs text-stone-500 mt-0.5">All-time: {totalCount.toLocaleString('en-IN')} chants</p>
        </div>
        <History className="h-4 w-4 text-stone-400" />
      </div>
      <div className="divide-y divide-stone-50">
        {sessions.slice(0, 10).map((session: JapSession) => (
          <div key={session.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-sm font-medium text-stone-800">{session.count.toLocaleString('en-IN')} chants</p>
              <p className="text-xs text-stone-400 mt-0.5">
                {new Date(session.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              {session.target && (
                <div className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', session.count >= session.target ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500')}>
                  {session.count >= (session.target ?? 0) ? '✓ Goal met' : `${Math.round((session.count / session.target) * 100)}%`}
                </div>
              )}
              <p className="text-xs text-stone-400 mt-1">{Math.floor(session.count / 108)} mala rounds</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Daily Quotes ─────────────────────────────────────────────────────────────

const DAILY_QUOTES = [
  { sanskrit: 'हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे।', translation: 'Chanting the holy name purifies the heart and uplifts the soul.' },
  { sanskrit: 'ॐ नमः शिवाय — पञ्चाक्षरी मन्त्र', translation: 'The five-syllable mantra of Shiva destroys all sins and grants liberation.' },
  { sanskrit: 'राम नाम सत्य है, सत्य बोलो गत है।', translation: 'The name of Ram is the ultimate truth — speak it and find the way.' },
  { sanskrit: 'जपो जपो फिर जपो — नाम में शक्ति है।', translation: 'Chant, chant, and chant again — boundless power lives in the name.' },
  { sanskrit: 'नाम जपत मन होत पवित्र।', translation: 'The mind becomes pure through continuous repetition of the divine name.' },
  { sanskrit: 'एक माला, एक सांस, एक परमात्मा।', translation: 'One mala, one breath, one Supreme — all is united in sincere devotion.' },
  { sanskrit: 'मृत्युञ्जय महादेव त्राहि माम् शरणागतम्।', translation: 'O Mahadeva, conqueror of death, protect me who takes refuge in you.' },
];

function getDailyQuote() {
  const dayIndex = new Date().getDate() % DAILY_QUOTES.length;
  return DAILY_QUOTES[dayIndex];
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const MANTRA_ACCENT: Record<string, string> = {
  'radhe-radhe': '#ec4899',
  'radhe-krishna': '#3b82f6',
  'om-namah-shivaya': '#8b5cf6',
  'hare-rama-hare-krishna': '#f59e0b',
  'mahamrityunjaya': '#6366f1',
};

function getAccentColor(mantraId: string): string {
  return MANTRA_ACCENT[mantraId] ?? '#f97316';
}

export default function NaamJapCounter() {
  usePageSeo('Naam Jap Counter', 'A digital mala counter for daily chanting — track 108-bead rounds, set targets, and build a devotional streak.');
  const [mantras, setMantras] = useState<JapMantra[]>(getAllMantras());
  const [selectedMantra, setSelectedMantra] = useState<JapMantra>(PREDEFINED_MANTRAS[0]);
  const [count, setCount] = useState(0);
  const [target, setTargetState] = useState<number | null>(108);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(false);
  const [showMantraModal, setShowMantraModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [streak, setStreak] = useState<JapStreakData>({ lastActiveDate: '', currentStreak: 0, longestStreak: 0, totalDays: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [isRippling, setIsRippling] = useState(false);
  const prevTargetHitRef = useRef(false);

  // Load state for the selected mantra
  useEffect(() => {
    const savedCount = getCountForMantra(selectedMantra.id);
    const savedTarget = getTargetForMantra(selectedMantra.id);
    setCount(savedCount);
    setTargetState(savedTarget);
    setTotalCount(getTotalCountForMantra(selectedMantra.id));
    setStreak(getStreakData());
    // Reset the "target already shown" flag when switching mantras
    prevTargetHitRef.current = target !== null && savedCount >= (target ?? 0) && savedCount > 0;
  }, [selectedMantra.id]);

  const accentColor = getAccentColor(selectedMantra.id);

  const handleTap = useCallback(() => {
    const newCount = incrementCount(selectedMantra.id, selectedMantra.name);
    setCount(newCount);
    setTotalCount((prev) => prev + 1);

    if (soundEnabled) playTapSound();
    if (vibrationEnabled && 'vibrate' in navigator) navigator.vibrate(15);

    recordTodayActivity();
    setStreak(getStreakData());

    // Ripple animation
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 350);

    // Check for target completion (only trigger once per crossing)
    if (target !== null && newCount >= target && !prevTargetHitRef.current) {
      prevTargetHitRef.current = true;
      setShowCompletion(true);
      if (soundEnabled) playCompletionSound();
      if (vibrationEnabled && 'vibrate' in navigator) navigator.vibrate([50, 30, 80, 30, 120]);
    }
  }, [selectedMantra, soundEnabled, vibrationEnabled, target]);

  const handleDecrement = useCallback(() => {
    const newCount = decrementCount(selectedMantra.id);
    setCount(newCount);
    setTotalCount((prev) => Math.max(0, prev - 1));
    if (newCount < (target ?? 0)) prevTargetHitRef.current = false;
  }, [selectedMantra.id, target]);

  const handleReset = useCallback(() => {
    resetCount(selectedMantra.id);
    setCount(0);
    prevTargetHitRef.current = false;
  }, [selectedMantra.id]);

  const handleMantraSelect = useCallback((m: JapMantra) => {
    setSelectedMantra(m);
  }, []);

  const handleAddCustom = useCallback((name: string) => {
    const newMantra = saveCustomMantra(name);
    setMantras(getAllMantras());
    setSelectedMantra(newMantra);
  }, []);

  const handleDeleteCustom = useCallback((id: string) => {
    deleteCustomMantra(id);
    setMantras(getAllMantras());
    if (selectedMantra.id === id) setSelectedMantra(PREDEFINED_MANTRAS[0]);
  }, [selectedMantra.id]);

  const handleTargetSave = useCallback((newTarget: number | null) => {
    setTarget(selectedMantra.id, newTarget);
    setTargetState(newTarget);
    prevTargetHitRef.current = newTarget !== null && count >= newTarget && count > 0;
  }, [selectedMantra.id, count]);

  const handleCompletionContinue = useCallback(() => {
    setShowCompletion(false);
    prevTargetHitRef.current = true; // prevent re-triggering on same session
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--dc-bg)' }}>
      <div className="mx-auto max-w-md px-4 py-6 pb-16">

        {/* ── Header ── */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">Naam Jap</h1>
            <p className="text-xs text-stone-500 mt-0.5">Digital Mala Counter</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Streak badge */}
            {streak.currentStreak > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-bold text-orange-600">
                <Flame className="h-3.5 w-3.5" />
                {streak.currentStreak}d
              </div>
            )}
            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled((v) => !v)}
              title={soundEnabled ? 'Mute sound' : 'Enable sound'}
              className={cn('rounded-full p-2 transition-colors', soundEnabled ? 'bg-orange-100 text-orange-600' : 'bg-stone-100 text-stone-400 hover:bg-stone-200')}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            {/* Vibration toggle */}
            <button
              onClick={() => setVibrationEnabled((v) => !v)}
              title={vibrationEnabled ? 'Disable vibration' : 'Enable vibration'}
              className={cn('rounded-full p-2 transition-colors', vibrationEnabled ? 'bg-orange-100 text-orange-600' : 'bg-stone-100 text-stone-400 hover:bg-stone-200')}
            >
              {vibrationEnabled ? <Smartphone className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* ── Main Card ── */}
        <div className="rounded-[2rem] border border-stone-200 bg-white shadow-xl shadow-stone-200/40 overflow-hidden">

          {/* Mantra selector button */}
          <button
            onClick={() => setShowMantraModal(true)}
            className="w-full flex items-center justify-between px-6 pt-6 pb-4 group"
          >
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400 mb-0.5">Selected Mantra</p>
              <h2 className="text-xl font-serif font-bold text-stone-900 group-hover:text-orange-600 transition-colors">
                {selectedMantra.name}
              </h2>
              {selectedMantra.deity && (
                <p className="text-xs text-stone-500 mt-0.5">{selectedMantra.deity}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-500 group-hover:border-orange-300 group-hover:text-orange-600 transition-colors">
              Change <ChevronDown className="h-3.5 w-3.5" />
            </div>
          </button>

          {/* Mala ring */}
          <div className="px-4 pb-2">
            <MalaRing count={count} target={target} accentColor={accentColor} />
          </div>

          {/* ── TAP BUTTON ── */}
          <div className="flex justify-center pb-6 px-6">
            <div className="relative">
              {/* Ripple effect */}
              {isRippling && (
                <motion.div
                  initial={{ scale: 0.85, opacity: 0.6 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ backgroundColor: accentColor }}
                />
              )}
              <motion.button
                whileTap={{ scale: 0.91 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                onClick={handleTap}
                className="relative h-36 w-36 rounded-full text-white font-bold shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 select-none"
                style={{
                  background: `radial-gradient(circle at 38% 35%, ${accentColor}cc, ${accentColor})`,
                  boxShadow: `0 12px 40px ${accentColor}55, 0 4px 12px ${accentColor}33`,
                }}
                aria-label="Count chant"
              >
                <span className="block text-4xl leading-none select-none" style={{ fontFamily: 'Georgia, serif' }}>ॐ</span>
                <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.2em] opacity-90">Tap to Chant</span>
              </motion.button>
            </div>
          </div>

          {/* ── Controls row ── */}
          <div className="border-t border-stone-100 flex items-center divide-x divide-stone-100">
            {/* Decrement */}
            <button
              onClick={handleDecrement}
              disabled={count === 0}
              className="flex-1 flex flex-col items-center gap-1 py-4 text-stone-500 hover:text-stone-800 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="h-4 w-4" />
              <span className="text-xs font-medium">Undo</span>
            </button>

            {/* Target */}
            <button
              onClick={() => setShowTargetModal(true)}
              className="flex-1 flex flex-col items-center gap-1 py-4 text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span className="text-xs font-medium">
                {target !== null ? `Goal: ${target.toLocaleString('en-IN')}` : 'No Goal'}
              </span>
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              disabled={count === 0}
              className="flex-1 flex flex-col items-center gap-1 py-4 text-stone-500 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="text-xs font-medium">Reset</span>
            </button>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-[1.25rem] border border-stone-200 bg-white p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-stone-900">{count.toLocaleString('en-IN')}</p>
            <p className="text-xs text-stone-500 mt-0.5">Today</p>
          </div>
          <div className="rounded-[1.25rem] border border-stone-200 bg-white p-3 text-center shadow-sm">
            <p className="text-lg font-bold" style={{ color: accentColor }}>{totalCount.toLocaleString('en-IN')}</p>
            <p className="text-xs text-stone-500 mt-0.5">All-time</p>
          </div>
          <div className="rounded-[1.25rem] border border-stone-200 bg-white p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-orange-500">{streak.currentStreak}</p>
            <p className="text-xs text-stone-500 mt-0.5">Day streak</p>
          </div>
        </div>

        {/* Target progress bar (shown only when target is set) */}
        {target !== null && target > 0 && (
          <div className="mt-3 rounded-[1.25rem] border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-600">Today's Progress</span>
              <span className="text-xs font-bold text-stone-800">{Math.min(count, target).toLocaleString('en-IN')} / {target.toLocaleString('en-IN')}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: accentColor }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((count / target) * 100, 100)}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-stone-400 mt-1.5 text-right">
              {Math.max(0, target - count).toLocaleString('en-IN')} chants remaining
            </p>
          </div>
        )}

        {/* ── History toggle ── */}
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="mt-4 w-full flex items-center justify-between rounded-[1.25rem] border border-stone-200 bg-white px-5 py-3.5 shadow-sm hover:border-orange-300 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <History className="h-4 w-4 text-stone-400" />
            <span className="text-sm font-semibold text-stone-700">Session History</span>
          </div>
          <ChevronDown className={cn('h-4 w-4 text-stone-400 transition-transform', showHistory && 'rotate-180')} />
        </button>

        {/* History panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <HistoryPanel mantraId={selectedMantra.id} mantraName={selectedMantra.name} totalCount={totalCount} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Spiritual quote ── */}
        <div className="mt-6 rounded-[1.5rem] bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 px-5 py-4">
          <p className="text-center text-xs text-orange-700 font-medium italic leading-relaxed">
            "{getDailyQuote().sanskrit}"
          </p>
          <p className="text-center text-xs text-orange-500 mt-1.5">
            {getDailyQuote().translation}
          </p>
        </div>
      </div>

      {/* ── Modals & Overlays ── */}
      <AnimatePresence>
        {showMantraModal && (
          <MantraSelectorModal
            mantras={mantras}
            selected={selectedMantra}
            onSelect={handleMantraSelect}
            onClose={() => setShowMantraModal(false)}
            onAddCustom={handleAddCustom}
            onDeleteCustom={handleDeleteCustom}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTargetModal && (
          <TargetModal
            currentTarget={target}
            onSave={handleTargetSave}
            onClose={() => setShowTargetModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompletion && (
          <CompletionOverlay
            count={count}
            mantraName={selectedMantra.name}
            onContinue={handleCompletionContinue}
            onClose={() => setShowCompletion(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
