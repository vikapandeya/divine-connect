import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import Home from './pages/Home';
import Services from './pages/Services';
import Shop from './pages/Shop';
import PujaDetail from './pages/PujaDetail';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import Astrology from './pages/Astrology';
import About from './pages/About';
import Contact from './pages/Contact';
import DarshanBooking from './pages/DarshanBooking';
import PrasadDelivery from './pages/PrasadDelivery';

export default function App() {
  return (
    <ErrorBoundary>
      <Router basename={import.meta.env.BASE_URL}>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/puja" element={<Services />} />
            <Route path="/services/puja/:id" element={<PujaDetail />} />
            <Route path="/services/darshan" element={<DarshanBooking />} />
            <Route path="/services/prasad" element={<PrasadDelivery />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/vendor" element={<VendorDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/astrology" element={<Astrology />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}
