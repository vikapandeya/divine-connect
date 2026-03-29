import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemePrompt() {
  const [show, setShow] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const hasPrompted = localStorage.getItem('theme_prompted');
    if (!hasPrompted) {
      setShow(true);
    }
  }, []);

  const handleSelect = (t: 'light' | 'dark' | 'system') => {
    setTheme(t);
    localStorage.setItem('theme_prompted', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-2">Choose Your Theme</h2>
                <p className="text-stone-500 dark:text-stone-400 text-sm">Select how you'd like to experience DivineConnect.</p>
              </div>
              <button 
                onClick={() => setShow(false)}
                className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => handleSelect('light')}
                className="flex items-center space-x-4 p-4 rounded-2xl border-2 border-stone-100 dark:border-stone-800 hover:border-orange-500 dark:hover:border-orange-500 transition-all group"
              >
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                  <Sun className="w-6 h-6 text-orange-600 dark:text-orange-400 group-hover:text-white" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-stone-900 dark:text-white">Light Mode</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">Classic bright experience</span>
                </div>
              </button>

              <button
                onClick={() => handleSelect('dark')}
                className="flex items-center space-x-4 p-4 rounded-2xl border-2 border-stone-100 dark:border-stone-800 hover:border-orange-500 dark:hover:border-orange-500 transition-all group"
              >
                <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                  <Moon className="w-6 h-6 text-stone-600 dark:text-stone-400 group-hover:text-white" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-stone-900 dark:text-white">Dark Mode</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">Easier on the eyes at night</span>
                </div>
              </button>

              <button
                onClick={() => handleSelect('system')}
                className="flex items-center space-x-4 p-4 rounded-2xl border-2 border-stone-100 dark:border-stone-800 hover:border-orange-500 dark:hover:border-orange-500 transition-all group"
              >
                <div className="w-12 h-12 bg-stone-50 dark:bg-stone-800/50 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                  <Monitor className="w-6 h-6 text-stone-500 dark:text-stone-500 group-hover:text-white" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-stone-900 dark:text-white">System Default</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">Matches your device settings</span>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
