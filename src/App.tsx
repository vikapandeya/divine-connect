import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import CookieConsent from './components/CookieConsent';

// ─── Lazy-loaded pages (code-split per route) ──────────────────────────────
const Home               = lazy(() => import('./pages/Home'));
const Services           = lazy(() => import('./pages/Services'));
const Shop               = lazy(() => import('./pages/Shop'));
const Astrology          = lazy(() => import('./pages/Astrology'));
const About              = lazy(() => import('./pages/About'));
const Contact            = lazy(() => import('./pages/Contact'));
const Cart               = lazy(() => import('./pages/Cart'));
const Profile            = lazy(() => import('./pages/Profile'));
const AdminDashboard     = lazy(() => import('./pages/AdminDashboard'));
const VendorDashboard    = lazy(() => import('./pages/VendorDashboard'));
const PujaDetail         = lazy(() => import('./pages/PujaDetail'));
const ProductDetail      = lazy(() => import('./pages/ProductDetail'));
const Wishlist           = lazy(() => import('./pages/Wishlist'));
const Temples            = lazy(() => import('./pages/Temples'));
const Terms              = lazy(() => import('./pages/Terms'));
const Privacy            = lazy(() => import('./pages/Privacy'));
const TempleKnowledge    = lazy(() => import('./pages/TempleKnowledge'));
const Yatra              = lazy(() => import('./pages/Yatra'));
const YatraDetail        = lazy(() => import('./pages/YatraDetail'));
const VendorProfile      = lazy(() => import('./pages/VendorProfile'));
const OrderTracking      = lazy(() => import('./pages/OrderTracking'));
const SearchResults      = lazy(() => import('./pages/SearchResults'));
const VendorRegistration = lazy(() => import('./pages/VendorRegistration'));
const NaamJapCounter     = lazy(() => import('./pages/NaamJapCounter'));
const NotFound           = lazy(() => import('./pages/NotFound'));

// ─── Sacred diya flame loader ─────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 select-none">
        {/* Diya SVG with flame */}
        <div className="relative flex flex-col items-center" style={{ width: 56, height: 72 }}>
          {/* Ambient glow behind flame */}
          <div
            className="absolute rounded-full animate-diya-glow"
            style={{
              width: 36, height: 36,
              top: -4, left: '50%', transform: 'translateX(-50%)',
              background: 'radial-gradient(circle, rgba(251,191,36,0.55) 0%, transparent 70%)',
              filter: 'blur(6px)',
            }}
          />
          {/* Flame */}
          <div className="relative flex flex-col items-center animate-diya-flame" style={{ marginBottom: -2 }}>
            {/* Outer flame */}
            <svg width="22" height="34" viewBox="0 0 22 34" fill="none" style={{ overflow: 'visible' }}>
              <path
                d="M11 1 C11 1 20 10 20 20 C20 26.627 16.418 33 11 33 C5.582 33 2 26.627 2 20 C2 10 11 1 11 1Z"
                fill="url(#flameOuter)"
              />
              {/* Inner core */}
              <path
                d="M11 10 C11 10 17 16 17 22 C17 25.866 14.314 29 11 29 C7.686 29 5 25.866 5 22 C5 16 11 10 11 10Z"
                fill="url(#flameInner)"
              />
              <defs>
                <linearGradient id="flameOuter" x1="11" y1="1" x2="11" y2="33" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="40%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="flameInner" x1="11" y1="10" x2="11" y2="29" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFBEB" />
                  <stop offset="60%" stopColor="#FCD34D" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {/* Wick */}
          <div style={{ width: 2, height: 7, background: '#92400E', borderRadius: 1, marginBottom: -1 }} />
          {/* Diya bowl */}
          <svg width="56" height="26" viewBox="0 0 56 26" fill="none">
            <ellipse cx="28" cy="7" rx="16" ry="5.5" fill="#B45309" />
            <path d="M12 7 Q9 20 28 24 Q47 20 44 7 Z" fill="url(#diyaBody)" />
            <ellipse cx="28" cy="23" rx="16" ry="4" fill="#92400E" />
            <defs>
              <linearGradient id="diyaBody" x1="28" y1="7" x2="28" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <p className="text-[10px] tracking-[0.35em] text-amber-600 dark:text-amber-500 uppercase font-bold font-devanagari">
          ॐ
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public Routes ── */}
            <Route path="/"                     element={<Home />} />
            <Route path="/services"             element={<Services />} />
            <Route path="/services/yatra"       element={<Yatra />} />
            <Route path="/pujas/:id"            element={<PujaDetail />} />
            <Route path="/shop"                 element={<Shop />} />
            <Route path="/product/:id"          element={<ProductDetail />} />
            <Route path="/astrology"            element={<Astrology />} />
            <Route path="/temples"              element={<Temples />} />
            <Route path="/temple-knowledge"     element={<TempleKnowledge />} />
            <Route path="/about"               element={<About />} />
            <Route path="/contact"             element={<Contact />} />
            <Route path="/cart"                element={<Cart />} />
            <Route path="/terms"               element={<Terms />} />
            <Route path="/privacy"             element={<Privacy />} />
            <Route path="/yatras/:id"          element={<YatraDetail />} />
            <Route path="/vendor/:id"          element={<VendorProfile />} />
            <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
            <Route path="/search"              element={<SearchResults />} />
            <Route path="/vendor-registration" element={<VendorRegistration />} />

            {/* ── Auth-Required Routes ── */}
            <Route path="/naam-jap" element={
              <ProtectedRoute><NaamJapCounter /></ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute><Wishlist /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />

            {/* ── Role-Protected Routes ── */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/vendor" element={
              <ProtectedRoute requiredRole="vendor"><VendorDashboard /></ProtectedRoute>
            } />

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
      <CookieConsent />
    </Router>
  );
}

export default App;
