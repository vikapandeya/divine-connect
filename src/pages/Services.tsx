import React, { useState, useEffect, useMemo } from 'react';
import { Puja, VendorProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, IndianRupee, CheckCircle2, Search, Filter, X, MapPin, User, Star, Navigation, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Services() {
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
        const [pujasRes, vendorsRes] = await Promise.all([
          fetch('/api/pujas'),
          fetch('/api/admin/vendors-performance') // Reusing this to get vendor list
        ]);
        
        if (pujasRes.ok) {
          const data = await pujasRes.json();
          setPujas(data);
        }
        if (vendorsRes.ok) {
          const data = await vendorsRes.json();
          setVendors(data.filter((v: any) => v.type === 'priest' || v.type === 'temple'));
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
    const basePujas = pujas.length > 0 ? pujas : [
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
    ];

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

  const categories = ['all', 'Daily', 'Special', 'Festive', 'Havan', 'Katha'];
  const temples = Array.from(new Set(pujas.map(p => p.templeName).filter(Boolean)));

  return (
    <div className="pb-20 bg-stone-50 min-h-screen">
      <section className="relative h-[40vh] flex items-center overflow-hidden mb-8">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/puja-hero/1920/1080?blur=2"
            alt="Sacred Services"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">
              Sacred Puja Services
            </h1>
            <p className="text-lg text-stone-200 max-w-2xl mx-auto">
              Connect with experienced pandits for authentic Vedic rituals performed with devotion and precision.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for pujas, temples, or rituals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>
            
            <button
              onClick={() => setShowNearbyOnly(!showNearbyOnly)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                showNearbyOnly ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Navigation className={`w-5 h-5 ${showNearbyOnly ? 'animate-pulse' : ''}`} />
              <span>Nearby (5km)</span>
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                showFilters ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          <AnimatePresence>
            {locationError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2"
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
                <div className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-stone-100 mt-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                            selectedCategory === cat
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Price Range (₹)</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                      />
                      <span className="text-stone-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  {/* Vendor Filter */}
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Vendor / Priest</label>
                    <select
                      value={selectedVendor}
                      onChange={(e) => setSelectedVendor(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                    >
                      <option value="all">All Vendors</option>
                      {vendors.map(vendor => (
                        <option key={vendor.uid} value={vendor.uid}>{vendor.businessName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Temple Filter */}
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Temple</label>
                    <select
                      value={selectedTemple}
                      onChange={(e) => setSelectedTemple(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
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

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
          </div>
        ) : displayPujas.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8">
            {displayPujas.map((puja, index) => (
              <motion.div
                key={puja.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden hover:shadow-xl transition-all flex flex-col group w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)] min-w-[300px] max-w-sm"
              >
                <div className="h-48 bg-orange-100 relative overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/${puja.id}/800/400`} 
                    alt={puja.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-bold text-stone-900">{puja.category || 'Sacred'}</span>
                    </div>
                    {puja.isLive && (
                      <div className="bg-red-600 text-white px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
                      </div>
                    )}
                  </div>
                  {puja.templeName && (
                    <div className="absolute bottom-4 left-4 flex items-center text-white text-xs font-medium">
                      <MapPin className="w-3 h-3 mr-1" />
                      {puja.templeName}
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex-grow">
                  <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">{puja.title}</h3>
                  <p className="text-stone-600 text-sm mb-4 line-clamp-2">{puja.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-stone-500 text-xs">
                      <Clock className="w-3.5 h-3.5 mr-2" />
                      <span>Duration: {puja.duration}</span>
                    </div>
                    <div className="flex items-center text-stone-500 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                      <span>Samagri Included</span>
                    </div>
                    <div className="flex items-center text-stone-500 text-xs">
                      <User className="w-3.5 h-3.5 mr-2" />
                      {puja.vendorId && (puja.vendor || vendors.find(v => v.uid === puja.vendorId)) ? (
                        <div className="flex items-center gap-2">
                          <Link 
                            to={`/vendor/${puja.vendorId}`}
                            className="hover:text-orange-600 font-bold transition-colors underline decoration-stone-200 underline-offset-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {puja.vendor?.businessName || vendors.find(v => v.uid === puja.vendorId)?.businessName}
                          </Link>
                          <div className="flex items-center text-amber-500 ml-2">
                            <Star className="w-3 h-3 fill-current mr-0.5" />
                            <span className="font-bold">{puja.vendor?.rating || vendors.find(v => v.uid === puja.vendorId)?.rating || '4.5'}</span>
                          </div>
                        </div>
                      ) : (
                        <span>Verified Pandit</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Starts from</span>
                      <div className="flex items-center text-xl font-serif font-bold text-orange-600">
                        <IndianRupee className="w-4 h-4" />
                        <span>{puja.onlinePrice}</span>
                      </div>
                    </div>
                    <Link 
                      to={`/pujas/${puja.id}`}
                      className="bg-stone-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-orange-500 transition-colors shadow-sm"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
            <div className="bg-stone-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">No services found</h3>
            <p className="text-stone-500 mb-6">Try adjusting your filters or search query to find what you're looking for.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedVendor('all');
                setSelectedTemple('all');
                setPriceRange({ min: 0, max: 50000 });
                setSearchQuery('');
              }}
              className="bg-stone-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-500 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

