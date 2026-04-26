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
import YatraDetail from './pages/YatraDetail';
import VendorProfile from './pages/VendorProfile';
import OrderTracking from './pages/OrderTracking';
import NotFound from './pages/NotFound';
import NaamJapCounter from './pages/NaamJapCounter';


class RootErrorBoundary extends React.Component<{children: React.ReactNode}, {error: Error|null}> {
  constructor(props: any) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:'2rem',fontFamily:'monospace',background:'#fff1f2',minHeight:'100vh'}}>
          <h2 style={{color:'#dc2626'}}>App Error (check browser console)</h2>
          <pre style={{whiteSpace:'pre-wrap',fontSize:'13px',color:'#7f1d1d'}}>{this.state.error.message}</pre>
          <pre style={{whiteSpace:'pre-wrap',fontSize:'11px',color:'#9ca3af'}}>{this.state.error.stack}</pre>
          <button onClick={()=>this.setState({error:null})} style={{marginTop:'1rem',padding:'0.5rem 1rem',background:'#dc2626',color:'white',border:'none',borderRadius:'4px',cursor:'pointer'}}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <RootErrorBoundary><Router>
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
          <Route path="/yatras/:id" element={<YatraDetail />} />
          <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
          <Route path="/naam-jap" element={<NaamJapCounter />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router></RootErrorBoundary>
  );
}

export default App;
