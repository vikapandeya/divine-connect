import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, firebaseInitError, logout, requestNotificationPermission, onMessageListener } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from '../types';
import { Search, ShoppingCart, Heart, Bell, Menu, X, Sun, Moon, Monitor, Languages, User, ChevronRight, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';
import NotificationCenter from './NotificationCenter';
import { getCartCount, subscribeToCart } from '../lib/cart';
import { useTheme } from '../contexts/ThemeContext';
import ThemePrompt from './ThemePrompt';
import { useTranslation } from 'react-i18next';
import VedaAI from './VedaAI';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { pathname } = useLocation(); // Correctly use useLocation
  const [notification, setNotification] = useState<{title: string, body: string} | null>(null);

  // Request notification permission
  useEffect(() => {
    if (user) {
      requestNotificationPermission();
    }
  }, [user]);

  // Listen for foreground messages
  useEffect(() => {
    onMessageListener().then((payload: any) => {
      if (payload?.notification) {
        setNotification({
          title: payload.notification.title,
          body: payload.notification.body
        });
        // Auto hide after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      }
    }).catch(err => console.log('failed: ', err));
  }, []);

  // Close menus on scroll or click outside
  useEffect(() => {
    const handleClose = () => {
      setIsProfileOpen(false);
      setIsMenuOpen(false);
    };

    if (isProfileOpen || isMenuOpen) {
      window.addEventListener('scroll', handleClose, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleClose);
    };
  }, [isProfileOpen, isMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  }, [pathname]); // Close on pathname change

  const navLinks = [
    { to: '/', label: t('Home') },
    { to: '/services', label: t('Services') },
    { to: '/shop', label: t('Shop') },
    { to: '/temples', label: t('Temples') },
    { to: '/astrology', label: t('AI Astrology') },
    { to: '/naam-jap', label: '🕉️ Jap Counter' },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/users/${user.uid}`);
          if (response.ok) {
            const data = await response.json();
            setProfile(data);
          }
        } catch (error) {
          console.error('Error fetching layout profile:', error);
        }
      } else {
        setProfile(null);
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const syncCartCount = () => {
      setCartCount(getCartCount());
    };

    syncCartCount();
    return subscribeToCart(syncCartCount);
  }, []);

  const handleLogin = () => {
    setIsAuthModalOpen(true);
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchTerm.trim();
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : '/shop');
    setIsMenuOpen(false);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 overflow-x-hidden ${resolvedTheme === 'dark' ? 'dark bg-stone-950 text-stone-100' : 'bg-stone-50 text-stone-900'}`}>
      <ThemePrompt />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      {/* Foreground Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-md px-4"
          >
            <div className="bg-white dark:bg-stone-900 border border-orange-200 dark:border-orange-900/30 rounded-2xl shadow-2xl p-4 flex items-start gap-4">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                <Bell className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-stone-900 dark:text-white">{notification.title}</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{notification.body}</p>
              </div>
              <button onClick={() => setNotification(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src={resolvedTheme === 'dark' ? '/logo/dark-logo.png' : '/logo/full-logo.png'} 
                alt="PunyaSeva" 
                className="h-10 w-auto hidden md:block" 
                referrerPolicy="no-referrer"
              />
              <img 
                src="/logo/icon-only.png" 
                alt="PunyaSeva" 
                className="h-8 w-auto md:hidden" 
                referrerPolicy="no-referrer"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) => 
                    `text-sm font-medium transition-colors ${
                      isActive ? 'text-orange-500' : 'text-stone-600 dark:text-stone-400 hover:text-orange-500 dark:hover:text-orange-500'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {firebaseInitError && (
                <div className="hidden lg:block max-w-xs rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
                  Auth is temporarily unavailable.
                </div>
              )}

              <form onSubmit={handleSearch} className="hidden sm:flex items-center bg-stone-100 dark:bg-stone-800 rounded-full px-3 py-1.5">
                <Search className="w-4 h-4 text-stone-400" />
                <input 
                  type="text" 
                  placeholder={t('Search...')} 
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm w-32 lg:w-48 ml-2 dark:text-stone-100"
                />
              </form>
              
              <Link to="/cart" className="relative p-2 text-stone-600 dark:text-stone-400 hover:text-orange-500 dark:hover:text-orange-500 transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center border-2 border-white dark:border-stone-900">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user && <NotificationCenter />}

              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileOpen(!isProfileOpen);
                  }}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  {user ? (
                    <img src={user.photoURL || undefined} alt="" className="w-8 h-8 rounded-full border border-stone-200 dark:border-stone-700" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 cursor-default" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsProfileOpen(false);
                        }} 
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-2 w-72 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-100 dark:border-stone-800 py-3 z-50 overflow-hidden"
                      >
                        {user ? (
                          <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 mb-2">
                            <p className="text-sm font-semibold text-stone-900 dark:text-white truncate">{user.displayName || user.email}</p>
                            <p className="text-xs text-stone-500 truncate">{user.email}</p>
                          </div>
                        ) : (
                          <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 mb-2">
                            <button 
                              onClick={() => { setIsAuthModalOpen(true); setIsProfileOpen(false); }}
                              className="w-full bg-orange-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
                            >
                              {t('Sign In')}
                            </button>
                          </div>
                        )}

                        <div className="space-y-1">
                          {user && (
                            <>
                              <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center justify-between px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800">
                                <div className="flex items-center gap-3">
                                  <User className="w-4 h-4" />
                                  <span>{t('Profile')}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-stone-400" />
                              </Link>
                              <Link to="/wishlist" onClick={() => setIsProfileOpen(false)} className="flex items-center justify-between px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800">
                                <div className="flex items-center gap-3">
                                  <Heart className="w-4 h-4" />
                                  <span>{t('Wishlist')}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-stone-400" />
                              </Link>
                              {profile?.role === 'vendor' && (
                                <Link to="/vendor" onClick={() => setIsProfileOpen(false)} className="flex items-center justify-between px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800">
                                  <div className="flex items-center gap-3 text-orange-600">
                                    <Monitor className="w-4 h-4" />
                                    <span>{t('Vendor Dashboard')}</span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-stone-400" />
                                </Link>
                              )}
                              {profile?.role === 'admin' && (
                                <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center justify-between px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800">
                                  <div className="flex items-center gap-3 text-purple-600">
                                    <Monitor className="w-4 h-4" />
                                    <span>{t('Admin Panel')}</span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-stone-400" />
                                </Link>
                              )}
                            </>
                          )}

                          <div className="px-4 py-2">
                            <div className="flex items-center gap-3 mb-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                              <Languages className="w-3 h-3" />
                              <span>{t('Language')}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg">
                              <button 
                                onClick={() => i18n.changeLanguage('en')}
                                className={`text-[10px] py-1 rounded-md transition-all ${i18n.language === 'en' ? 'bg-white dark:bg-stone-700 text-orange-500 shadow-sm' : 'text-stone-500'}`}
                              >
                                EN
                              </button>
                              <button 
                                onClick={() => i18n.changeLanguage('hi')}
                                className={`text-[10px] py-1 rounded-md transition-all ${i18n.language === 'hi' ? 'bg-white dark:bg-stone-700 text-orange-500 shadow-sm' : 'text-stone-500'}`}
                              >
                                हिंदी
                              </button>
                              <button 
                                onClick={() => i18n.changeLanguage('sa')}
                                className={`text-[10px] py-1 rounded-md transition-all ${i18n.language === 'sa' ? 'bg-white dark:bg-stone-700 text-orange-500 shadow-sm' : 'text-stone-500'}`}
                              >
                                गृहम्
                              </button>
                            </div>
                          </div>

                          <div className="px-4 py-2">
                            <div className="flex items-center gap-3 mb-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                              {resolvedTheme === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                              <span>{t('Theme')}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg">
                              <button 
                                onClick={() => setTheme('light')}
                                className={`text-[10px] py-1 rounded-md transition-all ${theme === 'light' ? 'bg-white dark:bg-stone-700 text-orange-500 shadow-sm' : 'text-stone-500'}`}
                              >
                                Light
                              </button>
                              <button 
                                onClick={() => setTheme('dark')}
                                className={`text-[10px] py-1 rounded-md transition-all ${theme === 'dark' ? 'bg-white dark:bg-stone-700 text-orange-500 shadow-sm' : 'text-stone-500'}`}
                              >
                                Dark
                              </button>
                              <button 
                                onClick={() => setTheme('system')}
                                className={`text-[10px] py-1 rounded-md transition-all ${theme === 'system' ? 'bg-white dark:bg-stone-700 text-orange-500 shadow-sm' : 'text-stone-500'}`}
                              >
                                System
                              </button>
                            </div>
                          </div>

                          {user && (
                            <button 
                              onClick={() => { logout(); setIsProfileOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-2 border-t border-stone-100 dark:border-stone-800 pt-3"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>{t('Logout')}</span>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button className="md:hidden p-2 text-stone-600 dark:text-stone-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                <div className="px-3 py-4 border-b border-stone-100 dark:border-stone-800 mb-2">
                  <img 
                    src="/logo/icon-only.png" 
                    alt="PunyaSeva" 
                    className="h-10 w-auto" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <form onSubmit={handleSearch} className="px-3 py-2">
                  <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-full px-3 py-2">
                    <Search className="w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder={t('Search...')}
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm ml-2 text-stone-900 dark:text-white"
                    />
                  </div>
                </form>
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) => 
                      `block px-3 py-2 text-base font-medium transition-colors ${
                        isActive ? 'text-orange-500' : 'text-stone-600 dark:text-stone-400 hover:text-orange-500'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <div className="pt-4 border-t border-stone-100 dark:border-stone-800 mt-4 space-y-2">
                  <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm text-stone-500">{t('About')}</Link>
                  <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm text-stone-500">{t('Contact')}</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="mb-6">
                <img 
                  src="/logo/full-logo.png" 
                  alt="PunyaSeva" 
                  className="h-16 w-auto brightness-0 invert" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="max-w-xs text-sm leading-relaxed">
                {t('Connecting devotees with divine services and spiritual essentials.')} {t('Experience the sacred from the comfort of your home.')}
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">{t('Quick Links')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services" className="hover:text-orange-500 transition-colors">{t('Services')}</Link></li>
                <li><Link to="/shop" className="hover:text-orange-500 transition-colors">{t('Shop')}</Link></li>
                <li><Link to="/wishlist" className="hover:text-orange-500 transition-colors">{t('Wishlist')}</Link></li>
                <li><Link to="/about" className="hover:text-orange-500 transition-colors">{t('About')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">{t('Connect')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contact" className="hover:text-orange-500 transition-colors">{t('Contact Us')}</Link></li>
                <li><a href="https://punyaseva.in" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">www.punyaseva.in</a></li>
                <li>support@punyaseva.in</li>
                <li>+91 1800-DIVINE-00</li>
                <li>Varanasi, Uttar Pradesh, India</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>&copy; 2026 PunyaSeva. {t('All spiritual rights reserved.')}</p>
            <div className="flex space-x-6">
              <Link to="/terms" className="hover:text-orange-500 transition-colors">{t('Terms of Service')}</Link>
              <Link to="/privacy" className="hover:text-orange-500 transition-colors">{t('Privacy Policy')}</Link>
            </div>
          </div>
        </div>
      </footer>
      <VedaAI />
    </div>
  );
}
