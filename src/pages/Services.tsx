import React, { useState, useEffect, useMemo } from 'react';
import { Puja, VendorProfile, Yatra, Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, IndianRupee, CheckCircle2, Search, Filter, X, MapPin, User, Star, Navigation, Info, Compass, Calendar, Sparkles, ShoppingBag, Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatIndianRupees } from '../lib/utils';
import { addToCart } from '../lib/cart';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../lib/wishlist';
import { auth } from '../firebase';
import AIGroundedSearch from '../components/AIGroundedSearch';

export default function Services() {
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [yatras, setYatras] = useState<Yatra[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  }, []);

  const [activeService, setActiveService] = useState<'all' | 'puja' | 'yatra' | 'product'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [selectedTemple, setSelectedTemple] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (showNearbyOnly && !userLocation) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setLocationError(null);
          },
          (error) => {
            console.error("Error getting location:", error);
            setLocationError("Could not get your location. Please enable location access.");
            setShowNearbyOnly(false);
          }
        );
      } else {
        setLocationError("Geolocation is not supported by your browser.");
        setShowNearbyOnly(false);
      }
    }
  }, [showNearbyOnly, userLocation]);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pujasRes, yatrasRes, vendorsRes, productsRes] = await Promise.all([
          fetch('/api/pujas'),
          fetch('/api/yatras'),
          fetch('/api/admin/vendors-performance'),
          fetch('/api/products')
        ]);
        
        if (pujasRes.ok) {
          const data = await pujasRes.json();
          setPujas(data);
        }
        if (yatrasRes.ok) {
          const data = await yatrasRes.json();
          setYatras(data);
        }
        if (vendorsRes.ok) {
          const data = await vendorsRes.json();
          setVendors(data.filter((v: any) => v.type === 'priest' || v.type === 'temple' || v.type === 'shop'));
        }
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mock data if Firestore is empty
  const displayPujas = useMemo(() => {
    const basePujas = (pujas.length > 0 ? pujas : [
      {
        id: '1',
        title: 'Ganesh Puja',
        description: 'Invoke the blessings of Lord Ganesha for new beginnings and removing obstacles.',
        onlinePrice: 2100,
        offlinePrice: 3100,
        samagriPrice: 500,
        duration: '1.5 Hours',
        samagriList: 'Flowers, Sweets, Incense',
        category: 'Daily',
        templeName: 'Siddhivinayak Temple',
        vendorId: 'v1'
      },
      {
        id: '2',
        title: 'Satyanarayan Katha',
        description: 'A sacred ritual dedicated to Lord Vishnu for peace, prosperity, and happiness.',
        onlinePrice: 5100,
        offlinePrice: 7500,
        samagriPrice: 1500,
        duration: '3 Hours',
        samagriList: 'Fruits, Panchamrit, Flowers',
        category: 'Special',
        templeName: 'ISKCON Temple',
        vendorId: 'v2'
      },
      {
        id: '3',
        title: 'Lakshmi Puja',
        description: 'Attract wealth and prosperity with this special puja dedicated to Goddess Lakshmi.',
        onlinePrice: 3500,
        offlinePrice: 5000,
        samagriPrice: 1000,
        duration: '2 Hours',
        samagriList: 'Lotus, Coins, Sweets',
        category: 'Festive',
        templeName: 'Mahalakshmi Temple',
        vendorId: 'v3'
      },
      {
        id: '4',
        title: 'Maha Mrityunjaya Jaap',
        description: 'Powerful Vedic chanting for health, longevity, and spiritual protection.',
        onlinePrice: 11000,
        offlinePrice: 15000,
        samagriPrice: 3000,
        duration: '5 Hours',
        samagriList: 'Rudraksha Mala, Ghee, Herbs',
        category: 'Special',
        templeName: 'Kashi Vishwanath',
        vendorId: 'v4'
      }
    ]) as Puja[];

    return basePujas.filter(puja => {
      const matchesSearch = puja.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          puja.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (puja.templeName?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || puja.category === selectedCategory;
      const matchesVendor = selectedVendor === 'all' || puja.vendorId === selectedVendor;
      const matchesTemple = selectedTemple === 'all' || puja.templeName === selectedTemple;
      const matchesPrice = puja.onlinePrice >= priceRange.min && puja.onlinePrice <= priceRange.max;

      let matchesNearby = true;
      if (showNearbyOnly && userLocation) {
        const vendor = vendors.find(v => v.uid === puja.vendorId);
        // For demo purposes, we assign mock locations to some vendors if they don't have one
        const mockLocations: Record<string, { lat: number, lng: number }> = {
          'v1': { lat: userLocation.lat + 0.01, lng: userLocation.lng + 0.01 }, // ~1.5km away
          'v2': { lat: userLocation.lat + 0.1, lng: userLocation.lng + 0.1 },   // ~15km away
          'v3': { lat: userLocation.lat - 0.02, lng: userLocation.lng - 0.02 }, // ~3km away
          'v4': { lat: userLocation.lat + 0.5, lng: userLocation.lng + 0.5 }    // ~75km away
        };
        
        const vendorLocation = vendor?.location || mockLocations[puja.vendorId];
        
        if (vendorLocation) {
          const distance = getDistance(userLocation.lat, userLocation.lng, vendorLocation.lat, vendorLocation.lng);
          matchesNearby = distance <= 5; // 5km range
        } else {
          matchesNearby = false;
        }
      }

      return matchesSearch && matchesCategory && matchesVendor && matchesTemple && matchesPrice && matchesNearby;
    });
  }, [pujas, searchQuery, selectedCategory, selectedVendor, selectedTemple, priceRange, showNearbyOnly, userLocation, vendors]);

  const displayYatras = useMemo(() => {
    const baseYatras = (yatras.length > 0 ? yatras : [
      {
        id: 'y1',
        title: 'Chardham Yatra 2026',
        description: 'A complete spiritual journey to Yamunotri, Gangotri, Kedarnath, and Badrinath.',
        price: 45000,
        duration: '12 Days / 11 Nights',
        location: 'Uttarakhand',
        category: 'Pilgrimage',
        vendorId: 'v1',
        rating: 4.9
      },
      {
        id: 'y2',
        title: 'Varanasi Spiritual Tour',
        description: 'Experience the ancient city of Kashi, Ganga Aarti, and holy temples.',
        price: 8500,
        duration: '3 Days / 2 Nights',
        location: 'Varanasi, UP',
        category: 'Spiritual',
        vendorId: 'v2',
        rating: 4.8
      },
      {
        id: 'y3',
        title: 'Tirupati Balaji Darshan',
        description: 'Seamless darshan experience with accommodation and local visits.',
        price: 5500,
        duration: '2 Days / 1 Night',
        location: 'Tirupathi, AP',
        category: 'Darshan',
        vendorId: 'v3',
        rating: 4.7
      }
    ]) as Yatra[];

    return baseYatras.filter(yatra => {
      const matchesSearch = yatra.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          yatra.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          yatra.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = yatra.price >= priceRange.min && yatra.price <= priceRange.max;
      const matchesVendor = selectedVendor === 'all' || yatra.vendorId === selectedVendor;

      return matchesSearch && matchesPrice && matchesVendor;
    });
  }, [yatras, searchQuery, priceRange, selectedVendor]);

  const displayProducts = useMemo(() => {
    const baseProducts = (products.length > 0 ? products : [
      {
        id: 'p1',
        name: 'Brass Ganesh Idol',
        description: 'Handcrafted premium brass idol for your home altar.',
        price: 1299,
        category: 'Idols',
        rating: 4.8,
        image: 'https://picsum.photos/seed/ganesh/400/400',
        vendorId: 'v4'
      },
      {
        id: 'p2',
        name: 'Rudraksha Mala (108 Beads)',
        description: 'Authentic 5-mukhi Rudraksha beads for meditation and peace.',
        price: 599,
        category: 'Mala',
        rating: 4.9,
        image: 'https://picsum.photos/seed/mala/400/400',
        vendorId: 'v5'
      }
    ]) as any[];

    return baseProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchQuery, selectedCategory, priceRange]);

  const categories = ['all', 'Daily', 'Special', 'Festive', 'Havan', 'Katha'];
  const temples = Array.from(new Set(pujas.map(p => p.templeName).filter(Boolean)));

  return (
    <div className="pb-20 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 min-h-screen transition-colors duration-500">
      <section className="relative h-[45vh] flex items-center overflow-hidden mb-8">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero/services-hero.png"
            alt="Sacred Services"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-8">
              <img 
                src="/logo/full-logo.svg" 
                alt="PunyaSeva" 
                className="h-24 w-auto" 
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
              Our Spiritual Services
            </h1>
            <p className="text-xl text-stone-200 max-w-2xl mx-auto leading-relaxed">
              Explore a world of divine connection through our traditional pujas and soul-stirring pilgrimage yatras.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Search Bar */}
        <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-xl shadow-stone-200/50 dark:shadow-stone-950/50 border border-stone-100 dark:border-stone-800 p-6 mb-12 sticky top-24 z-40 backdrop-blur-md bg-white/95 dark:bg-stone-900/95 transition-colors">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl overflow-x-auto no-scrollbar transition-colors">
                {[
                  { id: 'all', label: 'All', icon: <Compass className="w-4 h-4" /> },
                  { id: 'puja', label: 'Pujas', icon: <Flame className="w-4 h-4" /> },
                  { id: 'yatra', label: 'Yatras', icon: <Navigation className="w-4 h-4" /> },
                  { id: 'product', label: 'Products', icon: <ShoppingBag className="w-4 h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveService(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      activeService === tab.id
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-md'
                        : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for pujas, locations, or yatras..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-stone-800 border-stone-100 dark:border-stone-700 border rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all outline-none dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNearbyOnly(!showNearbyOnly)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                    showNearbyOnly ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-100 dark:border-stone-700'
                  }`}
                >
                  <Navigation className="w-4 h-4" />
                  Nearby
                </button>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                    showFilters ? 'bg-orange-500 text-white' : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-100 dark:border-stone-700'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>

          <AnimatePresence>
            {locationError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2"
              >
                <Info className="w-4 h-4" />
                {locationError}
              </motion.div>
            )}
            
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-stone-100 dark:border-stone-800 mt-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">Puja Category</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                            selectedCategory === cat
                              ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                          }`}
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">Price Range (₹)</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm dark:text-white"
                      />
                      <span className="text-stone-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Vendor Filter */}
                  <div>
                    <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">Vendor / Priest</label>
                    <select
                      value={selectedVendor}
                      onChange={(e) => setSelectedVendor(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm dark:text-white"
                    >
                      <option value="all">All Vendors</option>
                      {vendors.map(vendor => (
                        <option key={vendor.uid} value={vendor.uid}>{vendor.businessName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Temple Filter */}
                  <div>
                    <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">Temple</label>
                    <select
                      value={selectedTemple}
                      onChange={(e) => setSelectedTemple(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm dark:text-white"
                    >
                      <option value="all">All Temples</option>
                      {temples.map(temple => (
                        <option key={temple} value={temple}>{temple}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedVendor('all');
                      setSelectedTemple('all');
                      setPriceRange({ min: 0, max: 50000 });
                      setSearchQuery('');
                    }}
                    className="text-sm text-stone-500 hover:text-orange-600 font-medium flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reset Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AIGroundedSearch query={searchQuery} type={activeService === 'product' ? 'product' : 'service'} />
      </div>

      {/* Results Sectioned */}
      {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
          </div>
        ) : (
          <div className="space-y-32">
            {(activeService === 'all' || activeService === 'yatra') && (
              /* Yatra Section */
              <section id="yatras" className="scroll-mt-32">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                  <div className="flex items-center gap-6">
                    <div className="bg-emerald-500 p-5 rounded-[2rem] text-white shadow-xl shadow-emerald-500/20">
                      <Navigation className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-white leading-tight">Divine Yatra Packages</h2>
                      <p className="text-stone-500 dark:text-stone-400 font-medium text-lg">Curated spiritual journeys to the soul of India</p>
                    </div>
                  </div>
                  {activeService === 'all' && (
                    <Link to="/yatras" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center">
                      View all yatras <Navigation className="w-4 h-4 ml-2" />
                    </Link>
                  )}
                </div>

                {displayYatras.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {displayYatras.map((yatra, index) => (
                      <motion.div
                        key={yatra.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-200 dark:border-stone-800 overflow-hidden hover:shadow-2xl hover:shadow-stone-200/50 dark:hover:shadow-none transition-all flex flex-col group h-full"
                      >
                        <div className="aspect-[16/10] bg-emerald-100 dark:bg-emerald-900/20 relative overflow-hidden">
                          <img 
                            src={`https://images.unsplash.com/photo-1545105511-930777907912?auto=format&fit=crop&q=80&w=1200&seed=${yatra.id}`} 
                            alt={yatra.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />
                          <div className="absolute top-8 left-8">
                            <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-5 py-2 rounded-full flex items-center space-x-2 shadow-xl border border-white/50 dark:border-stone-700">
                              <Compass className="w-4 h-4 text-emerald-600" />
                              <span className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-[0.2em]">{yatra.category || 'Pilgrimage'}</span>
                            </div>
                          </div>
                          
                          <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                            <div className="flex items-center text-white font-bold group-hover:translate-x-2 transition-transform">
                              <MapPin className="w-5 h-5 mr-2 text-emerald-400" />
                              <span className="text-lg">{yatra.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 dark:bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white border border-white/20 dark:border-white/10">
                              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                              <span className="text-xs font-bold">{yatra.rating || '4.9'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-10 flex-grow flex flex-col">
                          <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-4 group-hover:text-emerald-600 transition-colors line-clamp-1">{yatra.title}</h3>
                          <p className="text-stone-500 dark:text-stone-400 text-sm mb-8 leading-relaxed line-clamp-2">{yatra.description}</p>
                          
                          <div className="grid grid-cols-2 gap-6 mb-10">
                            <div className="bg-emerald-50/50 dark:bg-emerald-900/20 p-4 rounded-3xl flex items-center gap-4 border border-emerald-100/50 dark:border-emerald-900/30">
                              <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest leading-none mb-1.5">Duration</span>
                                <span className="text-sm font-black text-stone-800 dark:text-stone-200">{yatra.duration.split('/')[0]}</span>
                              </div>
                            </div>
                            <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-3xl flex items-center gap-4 border border-stone-100 dark:border-stone-700">
                              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest leading-none mb-1.5">Comfort</span>
                                <span className="text-sm font-black text-stone-800 dark:text-stone-200">Premium</span>
                              </div>
                            </div>
                          </div>
  
                          <div className="mt-auto flex items-center justify-between pt-8 border-t border-stone-100 dark:border-stone-800">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-black mb-1.5">STARTING AT</span>
                              <div className="flex items-center text-3xl font-serif font-black text-stone-900 dark:text-white">
                                <IndianRupee className="w-6 h-6 text-emerald-600" />
                                <span>{formatIndianRupees(yatra.price)}</span>
                              </div>
                            </div>
                            <Link 
                              to={`/yatras/${yatra.id}`}
                              className="bg-emerald-600 text-white px-8 py-4 rounded-[1.5rem] text-sm font-black hover:bg-stone-900 dark:hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 group/btn"
                            >
                              Explore 
                              <Navigation className="w-4 h-4 inline-block ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-inner">
                    <Compass className="w-16 h-16 text-stone-200 dark:text-stone-800 mx-auto mb-6" />
                    <p className="text-stone-500 dark:text-stone-400 text-lg font-medium">No pilgrimage packages matching your search.</p>
                    <button onClick={() => setSearchQuery('')} className="mt-4 text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Clear search filters</button>
                  </div>
                )}
              </section>
            )}

            {(activeService === 'all' || activeService === 'puja') && (
              /* Puja Section */
              <section id="pujas" className="scroll-mt-32">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                  <div className="flex items-center gap-6">
                    <div className="bg-orange-500 p-5 rounded-[2rem] text-white shadow-xl shadow-orange-500/20">
                      <Flame className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-white leading-tight">Sacred Puja Services</h2>
                      <p className="text-stone-500 dark:text-stone-400 font-medium text-lg">Traditional rituals performed by expert Ved-pathis</p>
                    </div>
                  </div>
                </div>

                {displayPujas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {(displayPujas as any[]).map((puja, index) => (
                      <motion.div
                        key={puja.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-200 dark:border-stone-800 overflow-hidden hover:shadow-2xl hover:shadow-stone-200/50 dark:hover:shadow-none transition-all flex flex-col group h-full"
                      >
                        <div className="aspect-[16/10] bg-orange-100 dark:bg-orange-900/20 relative overflow-hidden">
                          <img 
                            src={`https://images.unsplash.com/photo-1590050752117-23a9d7fc6bbd?auto=format&fit=crop&q=80&w=1200&seed=${puja.id}`} 
                            alt={puja.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />
                          <div className="absolute top-8 left-8">
                            <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-5 py-2 rounded-full flex items-center space-x-2 shadow-xl border border-white/50 dark:border-stone-700">
                              <Sparkles className="w-4 h-4 text-orange-500" />
                              <span className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-[0.2em]">{puja.category || 'Sacred'}</span>
                            </div>
                          </div>
                      
                          <div className="absolute bottom-8 left-8 flex items-center text-white font-bold group-hover:translate-x-2 transition-transform">
                            <MapPin className="w-5 h-5 mr-2 text-orange-400" />
                            <span className="text-lg">{puja.templeName || 'Sacred Location'}</span>
                          </div>
                        </div>
                        
                        <div className="p-10 flex-grow flex flex-col">
                          <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-4 group-hover:text-orange-600 transition-colors line-clamp-1">{puja.title}</h3>
                          <p className="text-stone-500 dark:text-stone-400 text-sm mb-8 leading-relaxed line-clamp-2">{puja.description}</p>
                          
                          <div className="grid grid-cols-2 gap-6 mb-10">
                            <div className="bg-orange-50/50 dark:bg-orange-900/20 p-4 rounded-3xl flex items-center gap-4 border border-orange-100/50 dark:border-orange-900/30">
                              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest leading-none mb-1.5">Duration</span>
                                <span className="text-sm font-black text-stone-800 dark:text-stone-200">{puja.duration}</span>
                              </div>
                            </div>
                            <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-3xl flex items-center gap-4 border border-stone-100 dark:border-stone-700">
                              <CheckCircle2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest leading-none mb-1.5">Samagri</span>
                                <span className="text-sm font-black text-stone-800 dark:text-stone-200">Available</span>
                              </div>
                            </div>
                          </div>
  
                          <div className="mt-auto flex items-center justify-between pt-8 border-t border-stone-100 dark:border-stone-800">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-black mb-1.5">DASHINA FROM</span>
                              <div className="flex items-center text-3xl font-serif font-black text-stone-900 dark:text-white">
                                <IndianRupee className="w-6 h-6 text-orange-600" />
                                <span>{formatIndianRupees(puja.onlinePrice)}</span>
                              </div>
                            </div>
                            <Link 
                              to={`/pujas/${puja.id}`}
                              className="bg-stone-900 dark:bg-stone-800 text-white px-10 py-4 rounded-[1.5rem] text-sm font-black hover:bg-orange-600 dark:hover:bg-orange-700 transition-all shadow-xl hover:shadow-orange-600/20 active:scale-95"
                            >
                              Details
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-inner">
                    <Flame className="w-16 h-16 text-stone-200 dark:text-stone-800 mx-auto mb-6" />
                    <p className="text-stone-500 dark:text-stone-400 text-lg font-medium">No puja services matching your search.</p>
                    <button onClick={() => setSearchQuery('')} className="mt-4 text-orange-600 dark:text-orange-400 font-bold hover:underline">Clear search filters</button>
                  </div>
                )}
              </section>
            )}

            {(activeService === 'all' || activeService === 'product') && (
              /* Product Section */
              <section id="products" className="scroll-mt-32">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                  <div className="flex items-center gap-6">
                    <div className="bg-stone-900 dark:bg-stone-800 p-5 rounded-[2rem] text-white shadow-xl shadow-stone-900/20">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-white leading-tight">Spiritual Essentials</h2>
                      <p className="text-stone-500 dark:text-stone-400 font-medium text-lg">Holy idols, malas, and pure puja essentials</p>
                    </div>
                  </div>
                  {activeService === 'all' && (
                    <Link to="/shop" className="text-stone-900 dark:text-stone-100 font-bold hover:underline flex items-center transition-colors">
                      Browse all products <ShoppingBag className="w-4 h-4 ml-2" />
                    </Link>
                  )}
                </div>

                {displayProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {displayProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 overflow-hidden group hover:shadow-2xl dark:hover:shadow-none transition-all flex flex-col"
                      >
                        <div className="aspect-square relative overflow-hidden">
                          <img 
                            src={product.image || `https://images.unsplash.com/photo-1544731612-de7f96afe55f?auto=format&fit=crop&q=80&w=400&seed=${product.id}`} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-6 left-6">
                            <span className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black tracking-widest text-stone-800 dark:text-white border border-white/50 dark:border-stone-700">{product.category}</span>
                          </div>
                          <div className="absolute top-6 right-6">
                            <button className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-md p-2 rounded-full text-stone-400 hover:text-red-500 transition-colors shadow-lg">
                              <Heart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="p-8 flex flex-col flex-grow">
                          <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2 group-hover:text-orange-500 transition-colors line-clamp-1">{product.name}</h3>
                          <div className="flex items-center gap-1.5 mb-6">
                            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs font-bold text-stone-600 dark:text-stone-400">{product.rating || '4.8'}</span>
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center text-xl font-serif font-black text-stone-900 dark:text-white">
                              <IndianRupee className="w-4 h-4 text-stone-400" />
                              <span>{formatIndianRupees(product.price)}</span>
                            </div>
                            <button 
                              onClick={() => {
                                addToCart({ id: product.id, name: product.name, price: product.price, image: product.image });
                              }}
                              className="bg-stone-950 dark:bg-stone-800 text-white p-3 rounded-2xl hover:bg-orange-500 transition-all active:scale-90"
                            >
                              <ShoppingCart className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-stone-50 dark:bg-stone-900/50 rounded-[3rem] border border-dashed border-stone-200 dark:border-stone-800">
                    <p className="text-stone-400 dark:text-stone-500 font-medium">No products matching your search.</p>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

