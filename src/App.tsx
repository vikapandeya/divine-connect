import React, { Suspense, lazy } from 'react';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import { Compass, Sparkles } from 'lucide-react';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Shop = lazy(() => import('./pages/Shop'));
const SpiritualKnowledge = lazy(() => import('./pages/SpiritualKnowledge'));
const PujaDetail = lazy(() => import('./pages/PujaDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Cart = lazy(() => import('./pages/Cart'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));
const Astrology = lazy(() => import('./pages/Astrology'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const DarshanBooking = lazy(() => import('./pages/DarshanBooking'));
const PrasadDelivery = lazy(() => import('./pages/PrasadDelivery'));
const YatraBooking = lazy(() => import('./pages/YatraBooking'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex min-h-[65vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-xl shadow-stone-200/40">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          <Compass className="h-6 w-6" />
        </div>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-orange-700">
          <Sparkles className="h-3.5 w-3.5" />
          Loading Experience
        </div>
        <h2 className="mt-5 text-2xl font-serif font-bold text-stone-900">
          Preparing your PunyaSeva page
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          We are arranging the next view, services, and devotional details for a smooth transition.
        </p>
        <div className="mx-auto mt-6 h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const Router = import.meta.env.MODE === 'pages' ? HashRouter : BrowserRouter;

  return (
    <ErrorBoundary>
      <Router basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/puja" element={<Services />} />
              <Route path="/services/puja/:id" element={<PujaDetail />} />
              <Route path="/services/darshan" element={<DarshanBooking />} />
              <Route path="/services/yatra" element={<YatraBooking />} />
              <Route path="/services/prasad" element={<PrasadDelivery />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/knowledge" element={<SpiritualKnowledge />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/vendor" element={<VendorDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/astrology" element={<Astrology />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

