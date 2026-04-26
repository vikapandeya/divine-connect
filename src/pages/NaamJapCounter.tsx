import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { RotateCcw, Minus, History, Settings, X, Check } from 'lucide-react';

// ── Mantra definitions ────────────────────────────────────────────────────────
const MANTRAS = [
  { name: 'Radhe Radhe',            script: 'राधे राधे',            grad: ['#ec4899','#f43f5e'] },
  { name: 'Radhe Krishna',          script: 'राधे कृष्ण',           grad: ['#6366f1','#8b5cf6'] },
  { name: 'Om Namah Shivaya',       script: 'ॐ नमः शिवाय',          grad: ['#f97316','#f59e0b'] },
  { name: 'Hare Rama Hare Krishna', script: 'हरे राम हरे कृष्ण',    grad: ['#eab308','#f97316'] },
  { name: 'Mahamrityunjaya Mantra', script: 'ॐ त्र्यम्बकं यजामहे', grad: ['#7c3aed','#6d28d9'] },
  { name: 'Custom',                 script: '',                      grad: ['#0ea5e9','#10b981'] },
];
const TARGETS = [27, 54, 108, 216, 324, 1008];

// ── Types ─────────────────────────────────────────────────────────────────────
interface Session {
  id: string; mantraName: string; count: number;
  target: number; completed: boolean; date: string; duration: number;
}
interface Stats {
  totalCount: number; todayCount: number; lastDate: string;
  streak: number; lastStreakDate: string;
}
interface Store {
  mantra: string; custom: string; count: number; target: number;
  stats: Record<string, Stats>; sessions: Session[];
  sound: boolean; vibration: boolean;
}

// ── Persistence ───────────────────────────────────────────────────────────────
const SKEY = 'naamjap_v2';
const today = () => new Date().toISOString().split('T')[0];
const yesterday = () => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().split('T')[0]; };
function load(): Store {
  try { const r = localStorage.getItem(SKEY); if (r) return JSON.parse(r); } catch {}
  return { mantra:'Om Namah Shivaya', custom:'', count:0, target:108,
           stats:{}, sessions:[], sound:true, vibration:true };
}
function persist(s: Store) { localStorage.setItem(SKEY, JSON.stringify(s)); }

// ── Web Audio soft bell ───────────────────────────────────────────────────────
function ting(ctx: AudioContext) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(880, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
  g.gain.setValueAtTime(0.25, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  o.start(); o.stop(ctx.currentTime + 0.6);
}
function chime(ctx: AudioContext) {
  [523, 659, 784, 1047].forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = f;
    const t = ctx.currentTime + i * 0.18;
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    o.start(t); o.stop(t + 0.5);
  });
}

// ── Mala beads ring (SVG) ─────────────────────────────────────────────────────
function MalaRing({ filled, color }: { filled: number; color: string }) {
  const total = 108, R = 108, cx = 140, cy = 140;
  return (
    <>
      {Array.from({ length: total }).map((_, i) => {
        const a = (i / total) * 2 * Math.PI - Math.PI / 2;
        return (
          <motion.circle key={i}
            cx={cx + R * Math.cos(a)} cy={cy + R * Math.sin(a)}
            r={i % 9 === 0 ? 4.5 : 2.8}
            fill={i < filled ? color : '#d6d3d1'}
            animate={{ fill: i < filled ? color : '#d6d3d1' }}
            transition={{ duration: 0.12 }}
          />
        );
      })}
    </>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`w-12 h-6 rounded-full relative transition-colors duration-200 flex items-center px-0.5
        ${on ? 'bg-orange-500' : 'bg-stone-300 dark:bg-stone-600'}`}
    >
      <motion.div layout className={`w-5 h-5 rounded-full bg-white shadow-sm ${on ? 'ml-auto' : ''}`} />
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function NaamJapCounter() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';

  const [store, setStore]           = useState<Store>(load);
  const [blink, setBlink]           = useState(false);
  const [showDone, setShowDone]     = useState(false);
  const [done, setDone]             = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const startRef  = useRef(Date.now());
  const audioRef  = useRef<AudioContext | null>(null);
  const getAudio  = () => {
    if (!audioRef.current)
      audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return audioRef.current;
  };

  // Persist on every change
  useEffect(() => { persist(store); }, [store]);

  // Keyboard shortcut – Space / Enter
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'Enter') &&
          !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault(); tap();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  // Derived
  const mantraObj  = MANTRAS.find(m => m.name === store.mantra) ?? MANTRAS[2];
  const displayName = store.mantra === 'Custom' ? (store.custom || 'Custom Mantra') : store.mantra;
  const [c1, c2]   = mantraObj.grad;
  const progress   = store.target > 0 ? Math.min(store.count / store.target, 1) : 0;
  const R = 125, circ = 2 * Math.PI * R, offset = circ * (1 - progress);
  const beadsFilled = Math.min(store.count % 108 || (done ? 108 : 0), 108);
  const statKey    = store.mantra === 'Custom' ? (store.custom || 'Custom') : store.mantra;
  const st         = store.stats[statKey];
  const todayCount = st?.lastDate === today() ? st.todayCount : 0;

  // ── Tap ───────────────────────────────────────────────────────────────────
  const tap = useCallback(() => {
    if (done) return;
    setBlink(true);
    setTimeout(() => setBlink(false), 380);
    if (store.sound) try { ting(getAudio()); } catch {}
    if (store.vibration && navigator.vibrate) navigator.vibrate(35);

    setStore(prev => {
      const newCount = prev.count + 1;
      const td = today(), yd = yesterday();
      const ps = prev.stats[statKey] ?? { totalCount:0, todayCount:0, lastDate:'', streak:0, lastStreakDate:'' };
      const newDay = ps.lastDate !== td;
      const newStreak = newDay ? (ps.lastStreakDate === yd ? ps.streak + 1 : 1) : ps.streak;
      return {
        ...prev,
        count: newCount,
        stats: {
          ...prev.stats,
          [statKey]: {
            totalCount: ps.totalCount + 1,
            todayCount: newDay ? 1 : ps.todayCount + 1,
            lastDate: td,
            streak: newStreak,
            lastStreakDate: td,
          },
        },
      };
    });
  }, [done, store.sound, store.vibration, statKey]);

  // Watch for completion
  useEffect(() => {
    if (store.target > 0 && store.count >= store.target && !done && store.count > 0) {
      setDone(true);
      setShowDone(true);
      if (store.sound) try { chime(getAudio()); } catch {}
      if (store.vibration && navigator.vibrate) navigator.vibrate([80, 40, 80, 40, 160]);
      const sess: Session = {
        id: Date.now().toString(), mantraName: displayName,
        count: store.count, target: store.target, completed: true,
        date: new Date().toISOString(),
        duration: Math.floor((Date.now() - startRef.current) / 1000),
      };
      setStore(p => ({ ...p, sessions: [sess, ...p.sessions].slice(0, 100) }));
      setTimeout(() => setShowDone(false), 5000);
    }
  }, [store.count, store.target, done]);

  const reset        = () => { setDone(false); setStore(p => ({ ...p, count: 0 })); startRef.current = Date.now(); };
  const undo         = () => setStore(p => ({ ...p, count: Math.max(0, p.count - 1) }));
  const pickMantra   = (name: string) => { setDone(false); setStore(p => ({ ...p, mantra: name, count: 0 })); startRef.current = Date.now(); };
  const pickTarget   = (t: number) => { setDone(false); setStore(p => ({ ...p, target: t, count: 0 })); };

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen pb-24 ${dark ? 'bg-stone-950' : 'bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50'}`}>

      {/* Completion overlay */}
      <AnimatePresence>
        {showDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDone(false)}
          >
            <motion.div initial={{ scale: 0.6, y: 60 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.6, opacity: 0 }}
              className={`${dark ? 'bg-stone-900' : 'bg-white'} rounded-3xl p-10 text-center mx-6 shadow-2xl max-w-xs w-full`}
            >
              <motion.div animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.25, 1] }}
                transition={{ duration: 0.7, repeat: 4 }} className="text-7xl mb-4">🙏</motion.div>
              <h2 className="text-2xl font-extrabold text-orange-500 mb-1">जय हो! 🎉</h2>
              <p className={`text-base mb-1 ${dark ? 'text-stone-300' : 'text-stone-700'}`}>
                <strong>{store.target}</strong> × {displayName} complete!
              </p>
              <p className="text-stone-400 text-sm mb-5">Hari Om Tat Sat 🕉️</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {['🌺','🪷','🌸','✨','🙏','🕉️','🌼','💛'].map((e, i) => (
                  <motion.span key={i}
                    animate={{ y: [-8, 8, -8], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
                    className="text-xl">{e}</motion.span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 py-3 flex justify-between items-center
        ${dark ? 'bg-stone-950/90 border-stone-800' : 'bg-amber-50/90 border-orange-100'}`}>
        <div>
          <h1 className={`text-base font-extrabold ${dark ? 'text-orange-400' : 'text-orange-600'}`}>🕉️ Naam Jap Counter</h1>
          <p className={`text-xs ${dark ? 'text-stone-500' : 'text-stone-400'}`}>Space / Enter to count on desktop</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setShowHistory(true)}
            className={`p-2 rounded-full ${dark ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-orange-100 text-stone-500'}`}>
            <History className="w-5 h-5" />
          </button>
          <button onClick={() => setShowSettings(true)}
            className={`p-2 rounded-full ${dark ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-orange-100 text-stone-500'}`}>
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5 space-y-5">

        {/* Mantra selector */}
        <div className={`rounded-2xl p-4 shadow-md ${dark ? 'bg-stone-900' : 'bg-white'}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Select Mantra</p>
          <div className="flex flex-wrap gap-2">
            {MANTRAS.map(m => {
              const active = store.mantra === m.name;
              return (
                <button key={m.name} onClick={() => pickMantra(m.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all select-none
                    ${active ? 'text-white shadow-lg scale-105' : dark ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                  style={active ? { background: `linear-gradient(135deg,${m.grad[0]},${m.grad[1]})` } : {}}
                >{m.name}</button>
              );
            })}
          </div>
          {store.mantra === 'Custom' && (
            <input type="text" placeholder="Type your mantra…" value={store.custom}
              onChange={e => setStore(p => ({ ...p, custom: e.target.value }))}
              className={`mt-3 w-full px-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-400
                ${dark ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-500' : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400'}`}
            />
          )}
        </div>

        {/* Mantra text — blinks on tap */}
        <div className="text-center px-2">
          <motion.p
            animate={blink ? {
              scale: [1, 1.18, 1],
              opacity: [1, 0.2, 1],
              textShadow: ['0 0 0px transparent', '0 0 28px rgba(251,146,60,0.95)', '0 0 0px transparent'],
            } : {}}
            transition={{ duration: 0.38 }}
            className={`text-2xl font-extrabold tracking-wide leading-snug ${dark ? 'text-orange-400' : 'text-orange-600'}`}
          >{displayName}</motion.p>
          {mantraObj.script && (
            <motion.p
              animate={blink ? { opacity: [1, 0.15, 1], scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.38 }}
              className={`text-base mt-1 font-medium ${dark ? 'text-stone-400' : 'text-stone-500'}`}
            >{mantraObj.script}</motion.p>
          )}
        </div>

        {/* Circular mala + count */}
        <div className="flex flex-col items-center">
          <div className="relative w-72 h-72">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 280">
              <defs>
                <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
                </linearGradient>
              </defs>
              {/* Track ring */}
              <circle cx="140" cy="140" r={R} fill="none"
                stroke={dark ? '#292524' : '#fed7aa'} strokeWidth="10" />
              {/* Progress arc */}
              <circle cx="140" cy="140" r={R} fill="none"
                stroke="url(#pg)" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '140px 140px', transition: 'stroke-dashoffset 0.3s ease' }}
              />
              {/* 108 mala beads */}
              <MalaRing filled={beadsFilled} color={c1} />
            </svg>

            {/* Centre count */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <motion.span
                key={store.count}
                initial={{ scale: 1.4, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2, type: 'spring', stiffness: 320 }}
                className={`text-6xl font-black tabular-nums ${dark ? 'text-white' : 'text-stone-900'}`}
              >{store.count}</motion.span>
              <span className={`text-xs mt-0.5 ${dark ? 'text-stone-400' : 'text-stone-500'}`}>
                {store.target > 0 ? `of ${store.target}` : 'chants'}
              </span>
              {store.target > 0 && (
                <span className="text-xs text-orange-500 font-bold mt-0.5">{Math.round(progress * 100)}%</span>
              )}
            </div>
          </div>

          {/* Stats strip */}
          <div className={`flex gap-8 mt-3 py-3 px-7 rounded-2xl shadow ${dark ? 'bg-stone-900' : 'bg-white'}`}>
            {[
              { label: 'Today',     val: todayCount },
              { label: '🔥 Streak', val: `${st?.streak ?? 0}d` },
              { label: 'Total',     val: st?.totalCount ?? 0 },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={`text-lg font-bold ${dark ? 'text-orange-400' : 'text-orange-500'}`}>{s.val}</div>
                <div className={`text-xs ${dark ? 'text-stone-500' : 'text-stone-400'}`}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Target selector */}
        <div className={`rounded-2xl p-4 shadow-md ${dark ? 'bg-stone-900' : 'bg-white'}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Target</p>
          <div className="flex flex-wrap gap-2">
            {TARGETS.map(t => (
              <button key={t} onClick={() => pickTarget(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all
                  ${store.target === t ? 'bg-orange-500 text-white shadow-md' : dark ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
              >{t}</button>
            ))}
            <button onClick={() => pickTarget(0)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all
                ${store.target === 0 ? 'bg-orange-500 text-white shadow-md' : dark ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >∞</button>
          </div>
        </div>

        {/* Large tap button */}
        <div className="flex flex-col items-center gap-5 pt-2">
          <motion.button
            onClick={tap}
            whileTap={{ scale: 0.88 }}
            disabled={done}
            className="relative w-52 h-52 rounded-full select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-400"
            style={{
              background: `linear-gradient(135deg,${c1},${c2})`,
              boxShadow: blink
                ? `0 0 55px ${c1}99, 0 20px 55px ${c1}60`
                : `0 20px 42px ${c1}55, 0 8px 20px rgba(0,0,0,0.18)`,
            }}
          >
            {/* Ripple */}
            <AnimatePresence>
              {blink && (
                <motion.div
                  initial={{ scale: 0.7, opacity: 0.8 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  exit={{}}
                  transition={{ duration: 0.42 }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: `radial-gradient(circle, ${c1}55, transparent 70%)` }}
                />
              )}
            </AnimatePresence>
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <motion.span
                animate={blink ? { scale: [1, 1.35, 1], rotate: [0, 18, -18, 0] } : {}}
                transition={{ duration: 0.35 }}
                className="text-5xl"
              >🙏</motion.span>
              <span className="text-white font-black text-xl tracking-widest">JAP</span>
              <span className="text-white/70 text-xs font-medium">
                {done ? '✓ Completed' : 'Tap · Space · Enter'}
              </span>
            </div>
          </motion.button>

          {/* Undo + Reset */}
          <div className="flex gap-3">
            <button onClick={undo} disabled={store.count === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all
                ${dark ? 'bg-stone-800 text-stone-300 hover:bg-stone-700 disabled:opacity-30' : 'bg-white text-stone-600 hover:bg-stone-50 shadow-md disabled:opacity-30'}`}>
              <Minus className="w-4 h-4" /> Undo
            </button>
            <button onClick={reset}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all
                ${dark ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-white text-stone-600 hover:bg-stone-50 shadow-md'}`}>
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* History drawer */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowHistory(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={`fixed bottom-0 inset-x-0 z-50 rounded-t-3xl max-h-[78vh] flex flex-col
                ${dark ? 'bg-stone-900' : 'bg-white'} shadow-2xl`}
            >
              <div className={`flex justify-between items-center px-6 py-4 border-b ${dark ? 'border-stone-800' : 'border-stone-100'}`}>
                <h3 className={`font-bold text-lg ${dark ? 'text-white' : 'text-stone-900'}`}>Session History</h3>
                <button onClick={() => setShowHistory(false)} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-4 space-y-3">
                {store.sessions.length === 0
                  ? <p className="text-center text-stone-400 py-12 text-sm">No sessions yet. Start your first jap! 🙏</p>
                  : store.sessions.map(s => (
                    <div key={s.id} className={`rounded-xl p-4 flex justify-between items-center ${dark ? 'bg-stone-800' : 'bg-stone-50'}`}>
                      <div>
                        <p className={`font-semibold text-sm ${dark ? 'text-white' : 'text-stone-800'}`}>{s.mantraName}</p>
                        <p className="text-xs text-stone-400">
                          {new Date(s.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                        </p>
                        {s.duration > 0 && (
                          <p className="text-xs text-stone-400">{Math.floor(s.duration / 60)}m {s.duration % 60}s</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black ${dark ? 'text-orange-400' : 'text-orange-500'}`}>{s.count}</p>
                        {s.completed && (
                          <span className="text-xs text-green-500 flex items-center gap-1 justify-end">
                            <Check className="w-3 h-3" /> Done
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings drawer */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowSettings(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={`fixed bottom-0 inset-x-0 z-50 rounded-t-3xl ${dark ? 'bg-stone-900' : 'bg-white'} shadow-2xl`}
            >
              <div className={`flex justify-between items-center px-6 py-4 border-b ${dark ? 'border-stone-800' : 'border-stone-100'}`}>
                <h3 className={`font-bold text-lg ${dark ? 'text-white' : 'text-stone-900'}`}>Settings</h3>
                <button onClick={() => setShowSettings(false)} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {([
                  { label: 'Sound Feedback',    sub: 'Soft bell tone on each count', key: 'sound' as const },
                  { label: 'Vibration Haptics', sub: 'Buzz on each tap (mobile)',    key: 'vibration' as const },
                ] as const).map(row => (
                  <div key={row.key} className="flex justify-between items-center">
                    <div>
                      <p className={`font-semibold ${dark ? 'text-white' : 'text-stone-900'}`}>{row.label}</p>
                      <p className="text-xs text-stone-400">{row.sub}</p>
                    </div>
                    <Toggle on={store[row.key]} onChange={() => setStore(p => ({ ...p, [row.key]: !p[row.key] }))} />
                  </div>
                ))}
                <div className={`rounded-xl p-3 ${dark ? 'bg-stone-800' : 'bg-stone-50'}`}>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">Keyboard Shortcuts</p>
                  <p className={`text-sm ${dark ? 'text-stone-300' : 'text-stone-600'}`}>
                    <kbd className={`px-2 py-0.5 rounded text-xs font-mono mr-1 ${dark ? 'bg-stone-700 text-white' : 'bg-white border border-stone-200'}`}>Space</kbd>
                    or
                    <kbd className={`px-2 py-0.5 rounded text-xs font-mono ml-1 ${dark ? 'bg-stone-700 text-white' : 'bg-white border border-stone-200'}`}>Enter</kbd>
                    {' '}→ count
                  </p>
                </div>
                <button
                  onClick={() => { if (confirm('Clear all session history? Counts will be preserved.')) setStore(p => ({ ...p, sessions: [] })); }}
                  className="w-full py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 text-sm font-semibold"
                >
                  Clear Session History
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
