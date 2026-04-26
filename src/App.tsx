import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

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

// ─── Global page-level loading fallback ───────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
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
    </Router>
  );
}

export default App;
