import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Menu,
  Search,
  ShoppingCart,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { UserProfile } from '../types';
import { getCartCount, subscribeToCart } from '../lib/cart';
import logoMark from '../assets/divineconnect-mark.svg';
import { DEMO_DEVOTEE_PROFILE, getUserProfileDirect } from '../lib/firestore-data';
import { cn } from '../lib/utils';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/shop', label: 'Shop' },
  { to: '/astrology', label: 'AI Astrology' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const quickActions = [
  {
    title: 'Book Puja',
    description: 'Verified rituals, online and offline slots.',
    to: '/services',
  },
  {
    title: 'Temple Prasad',
    description: 'Explore mandir-backed offerings and delivery-ready packs.',
    to: '/shop?category=prasad',
  },
  {
    title: 'My Profile',
    description: 'Track bookings, invoices, certificates, and readings.',
    to: '/profile',
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(DEMO_DEVOTEE_PROFILE);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getUserProfileDirect()
      .then(setProfile)
      .catch((error) => {
        console.error('Error fetching demo profile:', error);
      });
  }, []);

  useEffect(() => {
    const syncCartCount = () => {
      setCartCount(getCartCount());
    };

    syncCartCount();
    return subscribeToCart(syncCartCount);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : '/shop');
  };

  const profileImage = profile?.photoURL || DEMO_DEVOTEE_PROFILE.photoURL || '';

  return (
    <div className="min-h-screen bg-transparent text-stone-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-stone-900 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-50">
        <div className="border-b border-stone-200/70 bg-stone-950 text-stone-200">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-[11px] sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 uppercase tracking-[0.24em] text-orange-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Spiritual platform demo</span>
            </div>
            <p className="hidden text-stone-300 xl:block">
              Puja booking, darshan support, prasad delivery, and astrology in one guided experience.
            </p>
            <Link to="/contact" className="font-bold text-white hover:text-orange-300">
              Need help?
            </Link>
          </div>
        </div>

        <div className="border-b border-stone-200/80 bg-white/88 backdrop-blur-xl shadow-[0_12px_40px_rgba(28,25,23,0.06)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between gap-4 xl:gap-6">
              <Link to="/" className="flex shrink-0 items-center gap-3 pr-2 xl:pr-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 ring-1 ring-orange-100">
                  <img src={logoMark} alt="DivineConnect logo" className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-xl font-serif font-bold tracking-tight text-stone-900">
                    DivineConnect
                  </p>
                  <p className="hidden text-xs text-stone-500 2xl:block">
                    Sacred services with modern clarity
                  </p>
                </div>
              </Link>

              <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      cn(
                        'rounded-full px-4 py-2 text-sm font-semibold transition-all',
                        isActive
                          ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/10'
                          : 'text-stone-600 hover:bg-orange-50 hover:text-orange-600',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <form
                  onSubmit={handleSearch}
                  className="hidden items-center rounded-full border border-stone-200 bg-stone-50 px-3 py-2 shadow-inner shadow-white/80 xl:flex"
                >
                  <Search className="h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search offerings"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="ml-2 w-40 bg-transparent text-sm outline-none 2xl:w-52"
                  />
                </form>

                <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 2xl:block">
                  Demo Mode Active
                </div>

                <Link
                  to="/cart"
                  aria-label="Open cart"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm hover:border-orange-200 hover:text-orange-600"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </Link>

                <div ref={profileMenuRef} className="relative hidden md:block">
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen((current) => !current)}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-2 py-2 shadow-sm hover:border-orange-200"
                    aria-expanded={isProfileMenuOpen}
                    aria-label="Open profile menu"
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={`${profile?.displayName || 'Demo devotee'} profile`}
                        className="h-8 w-8 rounded-full border border-stone-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                        <UserRound className="h-4 w-4" />
                      </div>
                    )}
                    <div className="hidden text-left 2xl:block">
                      <p className="text-sm font-bold text-stone-900">
                        {profile?.displayName || 'Demo Devotee'}
                      </p>
                      <p className="text-[11px] text-stone-500">Account</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-stone-400" />
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        className="absolute right-0 mt-3 w-72 rounded-[1.75rem] border border-stone-200 bg-white p-3 shadow-2xl shadow-stone-900/10"
                      >
                        <div className="rounded-[1.5rem] bg-stone-50 p-4">
                          <p className="text-sm font-bold text-stone-900">
                            {profile?.displayName || 'Demo Devotee'}
                          </p>
                          <p className="mt-1 text-xs text-stone-500">{profile?.email}</p>
                        </div>
                        <div className="mt-3 space-y-1">
                          {[
                            { to: '/profile', label: 'Demo Profile', hint: 'Bookings, invoices, certificates' },
                            { to: '/vendor', label: 'Vendor Dashboard', hint: 'Manage products and pujas' },
                            { to: '/admin', label: 'Admin Panel', hint: 'Platform operations overview' },
                          ].map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              className="block rounded-2xl px-4 py-3 hover:bg-orange-50"
                            >
                              <p className="text-sm font-bold text-stone-900">{item.label}</p>
                              <p className="mt-1 text-xs text-stone-500">{item.hint}</p>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm lg:hidden"
                  onClick={() => setIsMenuOpen((current) => !current)}
                  aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-b border-stone-200 bg-white/96 backdrop-blur-xl shadow-xl shadow-stone-900/5 lg:hidden"
            >
              <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
                <form
                  onSubmit={handleSearch}
                  className="flex items-center rounded-[1.5rem] border border-stone-200 bg-stone-50 px-4 py-3"
                >
                  <Search className="h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search products or offerings"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="ml-2 w-full bg-transparent text-sm outline-none"
                  />
                </form>

                <div className="mt-4 grid gap-2">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      className={({ isActive }) =>
                        cn(
                          'rounded-[1.25rem] px-4 py-3 text-sm font-bold',
                          isActive ? 'bg-stone-900 text-white' : 'bg-stone-50 text-stone-700',
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {quickActions.map((action) => (
                    <Link
                      key={action.to}
                      to={action.to}
                      className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm"
                    >
                      <p className="text-sm font-bold text-stone-900">{action.title}</p>
                      <p className="mt-2 text-xs leading-relaxed text-stone-500">
                        {action.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <main id="main-content" className="flex-grow">
        {children}
      </main>

      <footer className="mt-20 border-t border-stone-200 bg-stone-950 text-stone-300">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr_0.85fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <img src={logoMark} alt="DivineConnect logo" className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-xl font-serif font-bold text-white">DivineConnect</p>
                  <p className="text-sm text-stone-400">Spiritual services with modern clarity</p>
                </div>
              </div>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-stone-400">
                A guided spiritual platform for puja booking, darshan coordination, temple prasad, sacred commerce, and AI-assisted devotional support.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Verified services', 'Temple-linked offerings', 'Printable records'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-stone-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.24em] text-orange-300">
                Explore
              </h4>
              <ul className="mt-5 space-y-3 text-sm">
                <li><Link to="/services" className="hover:text-white">Puja Booking</Link></li>
                <li><Link to="/services/darshan" className="hover:text-white">Darshan Support</Link></li>
                <li><Link to="/services/prasad" className="hover:text-white">Temple Prasad</Link></li>
                <li><Link to="/shop" className="hover:text-white">Spiritual Shop</Link></li>
                <li><Link to="/astrology" className="hover:text-white">AI Astrology</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.24em] text-orange-300">
                Platform
              </h4>
              <ul className="mt-5 space-y-3 text-sm">
                <li><Link to="/about" className="hover:text-white">Our Mission</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact Support</Link></li>
                <li><Link to="/profile" className="hover:text-white">Demo Profile</Link></li>
                <li><Link to="/vendor" className="hover:text-white">Vendor Dashboard</Link></li>
                <li><Link to="/admin" className="hover:text-white">Admin Panel</Link></li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-orange-300">
                Reach Us
              </p>
              <div className="mt-5 space-y-3 text-sm text-stone-300">
                <p>support@divineconnect.com</p>
                <p>+91 1800-DIVINE-00</p>
                <p>Varanasi, Uttar Pradesh, India</p>
                <p>Monday to Saturday, 9:00 AM to 7:00 PM IST</p>
              </div>
              <Link
                to="/contact"
                className="mt-6 inline-flex rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                Open Support
              </Link>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-xs text-stone-500 sm:flex sm:items-center sm:justify-between">
            <p>&copy; 2026 DivineConnect. All spiritual rights reserved.</p>
            <p className="mt-2 sm:mt-0">Designed for a calm, guided, and trustworthy devotional journey.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
