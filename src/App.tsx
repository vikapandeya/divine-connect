import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import Shop from './pages/Shop';
import Astrology from './pages/Astrology';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import PujaDetail from './pages/PujaDetail';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import Temples from './pages/Temples';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import TempleKnowledge from './pages/TempleKnowledge';
import Yatra from './pages/Yatra';
import VendorProfile from './pages/VendorProfile';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/pujas/:id" element={<PujaDetail />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/astrology" element={<Astrology />} />
          <Route path="/temples" element={<Temples />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/vendor/:id" element={<VendorProfile />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/temple-knowledge" element={<TempleKnowledge />} />
          <Route path="/services/yatra" element={<Yatra />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
