import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check, Settings } from 'lucide-react';

interface CookiePreferences {
  essential: true;
  analytics: boolean;
  preferences: boolean;
}

const STORAGE_KEY = 'ps_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    preferences: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // Delay slightly so page renders first
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const save = (accepted: CookiePreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...accepted, timestamp: Date.now() }));
    setVisible(false);
  };

  const acceptAll = () => save({ essential: true, analytics: true, preferences: true });
  const acceptSelected = () => save(prefs);
  const rejectAll = () => save({ essential: true, analytics: false, preferences: false });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50"
        >
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Cookie size={20} className="text-amber-500" />
                <span className="font-semibold text-stone-900 dark:text-white text-sm">Cookie Preferences</span>
              </div>
              <button
                onClick={rejectAll}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                We use cookies to enhance your experience, analyse site usage, and remember your preferences.
                Essential cookies are always active.{' '}
                <a href="/privacy#cookies" className="text-amber-600 hover:underline">Learn more</a>
              </p>

              {/* Detailed toggles */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 space-y-3 overflow-hidden"
                  >
                    {/* Essential — always on */}
                    <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800">
                      <div>
                        <p className="text-sm font-medium text-stone-900 dark:text-white">Essential</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Authentication, security, basic functionality</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                        <Check size={14} /> Always On
                      </div>
                    </div>

                    {/* Analytics */}
                    <div className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800">
                      <div>
                        <p className="text-sm font-medium text-stone-900 dark:text-white">Analytics</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Helps us understand how you use the app</p>
                      </div>
                      <button
                        onClick={() => setPrefs(p => ({ ...p, analytics: !p.analytics }))}
                        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 focus:outline-none ${
                          prefs.analytics ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-600'
                        }`}
                        style={{ height: '22px', width: '40px' }}
                        aria-checked={prefs.analytics}
                        role="switch"
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${prefs.analytics ? 'translate-x-[18px]' : ''}`} />
                      </button>
                    </div>

                    {/* Preferences */}
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-stone-900 dark:text-white">Preferences</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Saves your language and theme settings</p>
                      </div>
                      <button
                        onClick={() => setPrefs(p => ({ ...p, preferences: !p.preferences }))}
                        className={`relative rounded-full transition-colors duration-200 focus:outline-none ${
                          prefs.preferences ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-600'
                        }`}
                        style={{ height: '22px', width: '40px' }}
                        aria-checked={prefs.preferences}
                        role="switch"
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${prefs.preferences ? 'translate-x-[18px]' : ''}`} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setShowDetails(v => !v)}
                className="mt-3 flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 hover:text-amber-600 transition-colors"
              >
                <Settings size={12} />
                {showDetails ? 'Hide details' : 'Manage preferences'}
              </button>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex gap-2">
              {showDetails ? (
                <>
                  <button
                    onClick={rejectAll}
                    className="flex-1 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={acceptSelected}
                    className="flex-1 py-2 text-sm rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
                  >
                    Save Preferences
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={rejectAll}
                    className="flex-1 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={acceptAll}
                    className="flex-1 py-2 text-sm rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
                  >
                    Accept All
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
