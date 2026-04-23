const JAP_TODAY_KEY = 'punyaseva-jap-today';
const JAP_HISTORY_KEY = 'punyaseva-jap-history';
const JAP_STREAK_KEY = 'punyaseva-jap-streak';
const JAP_CUSTOM_MANTRAS_KEY = 'punyaseva-jap-custom-mantras';

export interface JapMantra {
  id: string;
  name: string;
  deity?: string;
  isCustom: boolean;
}

export interface JapSession {
  id: string;
  mantraId: string;
  mantraName: string;
  count: number;
  target: number | null;
  date: string; // YYYY-MM-DD
  startedAt: string;
}

export interface JapTodayState {
  date: string;
  counts: Record<string, number>;
  targets: Record<string, number | null>;
  mantraNames: Record<string, string>;
}

export interface JapStreakData {
  lastActiveDate: string;
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
}

export const PREDEFINED_MANTRAS: JapMantra[] = [
  { id: 'radhe-radhe', name: 'Radhe Radhe', deity: 'Radha', isCustom: false },
  { id: 'radhe-krishna', name: 'Radhe Krishna', deity: 'Krishna', isCustom: false },
  { id: 'om-namah-shivaya', name: 'Om Namah Shivaya', deity: 'Shiva', isCustom: false },
  { id: 'hare-rama-hare-krishna', name: 'Hare Rama Hare Krishna', deity: 'Vishnu', isCustom: false },
  { id: 'mahamrityunjaya', name: 'Mahamrityunjaya Mantra', deity: 'Shiva', isCustom: false },
];

export const TARGET_PRESETS = [108, 1008, 21, 54, 216] as const;

function isBrowser() {
  return typeof window !== 'undefined';
}

function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// ─── Today State ──────────────────────────────────────────────────────────────

export function getTodayState(): JapTodayState {
  const blank: JapTodayState = { date: getTodayDate(), counts: {}, targets: {}, mantraNames: {} };
  if (!isBrowser()) return blank;
  try {
    const stored = window.localStorage.getItem(JAP_TODAY_KEY);
    if (!stored) return blank;
    const state = JSON.parse(stored) as JapTodayState;
    if (state.date !== getTodayDate()) {
      // New day — archive yesterday's counts and return fresh state
      archiveTodayState(state);
      return blank;
    }
    return { ...blank, ...state };
  } catch {
    return blank;
  }
}

function saveTodayState(state: JapTodayState): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(JAP_TODAY_KEY, JSON.stringify(state));
}

function archiveTodayState(state: JapTodayState): void {
  const history = getHistory();
  const newSessions: JapSession[] = Object.entries(state.counts)
    .filter(([, count]) => count > 0)
    .map(([mantraId, count]) => ({
      id: `${mantraId}-${state.date}-${Date.now()}`,
      mantraId,
      mantraName: state.mantraNames?.[mantraId] ?? mantraId,
      count,
      target: state.targets?.[mantraId] ?? null,
      date: state.date,
      startedAt: `${state.date}T00:00:00.000Z`,
    }));
  if (newSessions.length > 0) {
    saveHistory([...history, ...newSessions]);
    updateStreak(state.date);
  }
}

export function getCountForMantra(mantraId: string): number {
  return getTodayState().counts[mantraId] ?? 0;
}

export function getTargetForMantra(mantraId: string): number | null {
  const stored = getTodayState().targets[mantraId];
  return stored !== undefined ? stored : 108;
}

export function incrementCount(mantraId: string, mantraName: string): number {
  const state = getTodayState();
  const newCount = (state.counts[mantraId] ?? 0) + 1;
  state.counts[mantraId] = newCount;
  state.mantraNames[mantraId] = mantraName;
  saveTodayState(state);
  return newCount;
}

export function decrementCount(mantraId: string): number {
  const state = getTodayState();
  const newCount = Math.max(0, (state.counts[mantraId] ?? 0) - 1);
  state.counts[mantraId] = newCount;
  saveTodayState(state);
  return newCount;
}

export function resetCount(mantraId: string): void {
  const state = getTodayState();
  state.counts[mantraId] = 0;
  saveTodayState(state);
}

export function setTarget(mantraId: string, target: number | null): void {
  const state = getTodayState();
  state.targets[mantraId] = target;
  saveTodayState(state);
}

// ─── History ──────────────────────────────────────────────────────────────────

export function getHistory(): JapSession[] {
  if (!isBrowser()) return [];
  try {
    const stored = window.localStorage.getItem(JAP_HISTORY_KEY);
    return stored ? (JSON.parse(stored) as JapSession[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(sessions: JapSession[]): void {
  if (!isBrowser()) return;
  // Keep at most 500 sessions to avoid excessive storage
  const trimmed = sessions.slice(-500);
  window.localStorage.setItem(JAP_HISTORY_KEY, JSON.stringify(trimmed));
}

export function getHistoryForMantra(mantraId: string): JapSession[] {
  return getHistory()
    .filter((s) => s.mantraId === mantraId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);
}

export function getTotalCountForMantra(mantraId: string): number {
  const historical = getHistory()
    .filter((s) => s.mantraId === mantraId)
    .reduce((sum, s) => sum + s.count, 0);
  const today = getCountForMantra(mantraId);
  return historical + today;
}

// ─── Streaks ──────────────────────────────────────────────────────────────────

export function getStreakData(): JapStreakData {
  const blank: JapStreakData = { lastActiveDate: '', currentStreak: 0, longestStreak: 0, totalDays: 0 };
  if (!isBrowser()) return blank;
  try {
    const stored = window.localStorage.getItem(JAP_STREAK_KEY);
    return stored ? (JSON.parse(stored) as JapStreakData) : blank;
  } catch {
    return blank;
  }
}

function updateStreak(activeDate: string): void {
  if (!isBrowser()) return;
  const streak = getStreakData();

  // Calculate yesterday relative to activeDate
  const activeDateObj = new Date(activeDate + 'T12:00:00Z');
  const prevDay = new Date(activeDateObj);
  prevDay.setUTCDate(prevDay.getUTCDate() - 1);
  const prevDayStr = prevDay.toISOString().split('T')[0];

  let newCurrent = 1;
  if (streak.lastActiveDate === prevDayStr) {
    newCurrent = streak.currentStreak + 1;
  } else if (streak.lastActiveDate === activeDate) {
    newCurrent = streak.currentStreak; // same day, no change
  }

  const updated: JapStreakData = {
    lastActiveDate: activeDate,
    currentStreak: newCurrent,
    longestStreak: Math.max(streak.longestStreak, newCurrent),
    totalDays: streak.lastActiveDate === activeDate ? streak.totalDays : streak.totalDays + 1,
  };
  window.localStorage.setItem(JAP_STREAK_KEY, JSON.stringify(updated));
}

export function recordTodayActivity(): void {
  const today = getTodayDate();
  const streak = getStreakData();
  if (streak.lastActiveDate === today) return; // already recorded today
  updateStreak(today);
}

// ─── Custom Mantras ───────────────────────────────────────────────────────────

export function getCustomMantras(): JapMantra[] {
  if (!isBrowser()) return [];
  try {
    const stored = window.localStorage.getItem(JAP_CUSTOM_MANTRAS_KEY);
    return stored ? (JSON.parse(stored) as JapMantra[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomMantra(name: string): JapMantra {
  const customs = getCustomMantras();
  const mantra: JapMantra = { id: `custom-${Date.now()}`, name: name.trim(), isCustom: true };
  window.localStorage.setItem(JAP_CUSTOM_MANTRAS_KEY, JSON.stringify([...customs, mantra]));
  return mantra;
}

export function deleteCustomMantra(id: string): void {
  if (!isBrowser()) return;
  const customs = getCustomMantras().filter((m) => m.id !== id);
  window.localStorage.setItem(JAP_CUSTOM_MANTRAS_KEY, JSON.stringify(customs));
}

export function getAllMantras(): JapMantra[] {
  return [...PREDEFINED_MANTRAS, ...getCustomMantras()];
}

// ─── Audio ────────────────────────────────────────────────────────────────────

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!isBrowser()) return null;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new Ctor();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => undefined);
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

function playTone(frequency: number, startTime: number, duration: number, gain: number): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, startTime);
  gainNode.gain.setValueAtTime(gain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function playTapSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  playTone(528, ctx.currentTime, 0.55, 0.22);
}

export function playCompletionSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  // Three ascending tones: C5 → E5 → G5
  playTone(523, t, 0.4, 0.28);
  playTone(659, t + 0.22, 0.4, 0.28);
  playTone(784, t + 0.44, 0.65, 0.28);
}
