import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, firebaseInitError, logout } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { UserProfile } from '../types';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';
import { getCartCount, subscribeToCart } from '../lib/cart';
import logoMark from '../assets/divineconnect-mark.svg';
import { apiUrl } from '../lib/api';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const navLinks = [
    { to: '/services', label: 'Services' },
    { to: '/shop', label: 'Shop' },
    { to: '/astrology', label: 'AI Astrology' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  useEffect(() => {
    if (!auth) {
      setUser(null);
      setProfile(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const response = await fetch(apiUrl(`/api/users/${u.uid}`));
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
    });
    return unsubscribe;
  }, []);

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
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img src={logoMark} alt="DivineConnect logo" className="w-8 h-8" />
              <span className="text-xl font-serif font-bold tracking-tight text-stone-900">DivineConnect</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium text-stone-600 hover:text-orange-500 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {firebaseInitError && (
                <div className="hidden lg:block max-w-xs rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
                  Auth is temporarily unavailable.
                </div>
              )}

              <form onSubmit={handleSearch} className="hidden sm:flex items-center bg-stone-100 rounded-full px-3 py-1.5">
                <Search className="w-4 h-4 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm w-32 lg:w-48 ml-2"
                />
              </form>
              
              <Link to="/cart" className="relative p-2 text-stone-600 hover:text-orange-500 transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-stone-100 transition-colors">
                    <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-stone-200" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-stone-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">Profile</Link>
                    {profile?.role === 'vendor' && <Link to="/vendor" className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">Vendor Dashboard</Link>}
                    {profile?.role === 'admin' && <Link to="/admin" className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">Admin Panel</Link>}
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-stone-50">Logout</button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  Sign In
                </button>
              )}

              <button className="md:hidden p-2 text-stone-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
              className="md:hidden bg-white border-t border-stone-100 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                <form onSubmit={handleSearch} className="px-3 py-2">
                  <div className="flex items-center bg-stone-100 rounded-full px-3 py-2">
                    <Search className="w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm ml-2"
                    />
                  </div>
                </form>
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-stone-600 hover:text-orange-500"
                  >
                    {link.label}
                  </Link>
                ))}
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
              <div className="flex items-center space-x-2 mb-4">
                <img src={logoMark} alt="DivineConnect logo" className="w-8 h-8" />
                <span className="text-xl font-serif font-bold tracking-tight text-white">DivineConnect</span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed">
                Connecting devotees with divine services and spiritual essentials. Experience the sacred from the comfort of your home.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services" className="hover:text-orange-500 transition-colors">Puja Booking</Link></li>
                <li><Link to="/services" className="hover:text-orange-500 transition-colors">Darshan Slots</Link></li>
                <li><Link to="/shop" className="hover:text-orange-500 transition-colors">Spiritual Shop</Link></li>
                <li><Link to="/about" className="hover:text-orange-500 transition-colors">Our Mission</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contact" className="hover:text-orange-500 transition-colors">Contact Us</Link></li>
                <li>support@divineconnect.com</li>
                <li>+91 1800-DIVINE-00</li>
                <li>Varanasi, Uttar Pradesh, India</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-stone-800 text-center text-xs">
            <p>&copy; 2026 DivineConnect. All spiritual rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
