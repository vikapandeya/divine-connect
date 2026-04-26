import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  ShieldCheck, 
  MapPin, 
  ShoppingBag, 
  Calendar, 
  ArrowLeft, 
  Clock, 
  IndianRupee, 
  Info,
  Package,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { Puja, Product } from '../types';

interface VendorProfileData {
  uid: string;
  businessName: string;
  description: string;
  displayName: string;
  photoURL?: string;
  bannerURL?: string;
  bio?: string;
  rating: number;
  isVerified?: boolean;
  type: 'priest' | 'temple' | 'shop';
}

interface ReviewStats {
  total: number;
  average: number;
  breakdown: Record<number, number>;
}

export default function VendorProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<VendorProfileData | null>(null);
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pujas' | 'products' | 'reviews'>('pujas');

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Fetch vendor details
        const vendorRes = await fetch(`/api/vendors/${id}`);
        if (vendorRes.ok) {
          const data = await vendorRes.json();
          setVendor(data);
        } else {
          // Fallback mock for demo if not found
          setVendor({
            uid: id,
            businessName: "Sacred Traditions",
            description: "Providing authentic spiritual services and high-quality puja essentials for over 15 years. Our mission is to connect devotees with divine traditions.",
            displayName: "Pandit Rajesh Kumar",
            photoURL: `https://picsum.photos/seed/${id}/400/400`,
            bannerURL: `https://picsum.photos/seed/banner-${id}/1200/400`,
            rating: 4.9,
            isVerified: true,
            type: 'priest'
          });
        }

        // Fetch review stats
        const reviewRes = await fetch(`/api/vendors/${id}/reviews`);
        if (reviewRes.ok) {
          const reviewData = await reviewRes.json();
          setReviews(reviewData.reviews);
          setStats(reviewData.stats);
        }

        // Fetch pujas
        const pujasRes = await fetch(`/api/pujas?vendorId=${id}`);
        if (pujasRes.ok) {
          const pujasData = await pujasRes.json();
          setPujas(pujasData);
          if (pujasData.length === 0) setActiveTab('products');
        }

        // Fetch products
        const productsRes = await fetch(`/api/products?vendorId=${id}`);
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
          if (pujas.length === 0 && productsData.length > 0) setActiveTab('products');
        }
      } catch (error) {
        console.error("Error fetching vendor profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-stone-500 font-medium animate-pulse">Loading sacred profile...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center px-4">
          <Info className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Vendor Not Found</h2>
          <p className="text-stone-500 mb-6">The vendor you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header / Banner */}
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        <img 
          src={vendor.bannerURL || `https://picsum.photos/seed/banner-${vendor.uid}/1920/600`}
          alt="Banner"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all z-10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-stone-200/50 overflow-hidden border border-stone-100">
          {/* Profile Section */}
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl">
                  <img 
                    src={vendor.photoURL || `https://picsum.photos/seed/${vendor.uid}/400/400`}
                    alt={vendor.displayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {vendor.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-lg border-4 border-white">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-grow space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">
                    {vendor.businessName}
                  </h1>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-bold border border-amber-100">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      {vendor.rating}
                    </div>
                    {stats && (
                      <span className="text-stone-400 text-xs font-medium">
                        ({stats.total} reviews)
                      </span>
                    )}
                  </div>
                  <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {vendor.type}
                  </span>
                </div>

                <p className="text-stone-600 leading-relaxed max-w-3xl text-lg">
                  {vendor.description}
                </p>

                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center text-stone-500 text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                    Varanasi, Uttar Pradesh
                  </div>
                  <div className="flex items-center text-stone-500 text-sm">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                    {pujas.length + products.length} Sacred Offerings
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-8 md:px-12 border-t border-stone-100 bg-stone-50/50">
            <div className="flex gap-8">
              {pujas.length > 0 && (
                <button 
                  onClick={() => setActiveTab('pujas')}
                  className={`py-6 text-sm font-bold uppercase tracking-widest relative transition-colors ${activeTab === 'pujas' ? 'text-orange-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  Sacred Pujas ({pujas.length})
                  {activeTab === 'pujas' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-full" />
                  )}
                </button>
              )}
              {products.length > 0 && (
                <button 
                  onClick={() => setActiveTab('products')}
                  className={`py-6 text-sm font-bold uppercase tracking-widest relative transition-colors ${activeTab === 'products' ? 'text-orange-600' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  Divine Products ({products.length})
                  {activeTab === 'products' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-full" />
                  )}
                </button>
              )}
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`py-6 text-sm font-bold uppercase tracking-widest relative transition-colors ${activeTab === 'reviews' ? 'text-orange-600' : 'text-stone-400 hover:text-stone-600'}`}
              >
                Devotee Reviews ({stats?.total || 0})
                {activeTab === 'reviews' && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {activeTab === 'pujas' ? (
                <motion.div 
                  key="pujas"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {pujas.map((puja) => (
                    <div 
                      key={puja.id}
                      onClick={() => navigate(`/pujas/${puja.id}`)}
                      className="group bg-white rounded-3xl border border-stone-100 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-stone-200/50 transition-all flex flex-col"
                    >
                      <div className="aspect-video overflow-hidden relative">
                        <img 
                          src={`https://picsum.photos/seed/${puja.id}/800/600`} 
                          alt={puja.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4">
                          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <Clock className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-xs font-bold text-stone-900">{puja.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 flex-grow flex flex-col">
                        <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {puja.title}
                        </h3>
                        <p className="text-stone-500 text-sm line-clamp-2 mb-6 flex-grow">
                          {puja.description}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Starting from</span>
                            <span className="text-xl font-serif font-bold text-stone-900">₹{puja.onlinePrice}</span>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                            <Calendar className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : activeTab === 'products' ? (
                <motion.div 
                  key="products"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {products.map((product) => (
                    <div 
                      key={product.id}
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="group bg-white rounded-3xl border border-stone-100 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-stone-200/50 transition-all flex flex-col"
                    >
                      <div className="aspect-square overflow-hidden relative">
                        <img 
                          src={product.image || `https://picsum.photos/seed/${product.id}/600/600`} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4">
                          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                            <span className="text-xs font-bold text-stone-900">{product.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 flex-grow flex flex-col">
                        <div className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mb-1">
                          {product.category}
                        </div>
                        <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-stone-500 text-sm line-clamp-2 mb-6 flex-grow">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                          <div className="flex items-center text-2xl font-serif font-bold text-stone-900">
                            <IndianRupee className="w-4 h-4" />
                            <span>{product.price}</span>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-stone-50 text-stone-400 flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white transition-all">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  {/* Rating Breakdown */}
                  {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-stone-50/50 p-8 rounded-[2rem] border border-stone-100">
                      <div className="flex flex-col items-center justify-center text-center">
                        <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Average Rating</h4>
                        <div className="text-7xl font-serif font-bold text-stone-900 mb-4">{stats.average.toFixed(1)}</div>
                        <div className="flex items-center gap-1 text-amber-500 mb-4">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-5 h-5 ${s <= Math.round(stats.average) ? 'fill-current' : 'text-stone-200'}`} />
                          ))}
                        </div>
                        <p className="text-stone-500 font-medium">Based on {stats.total} sacred experiences</p>
                      </div>

                      <div className="flex flex-col justify-center space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = stats.breakdown[rating] || 0;
                          const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                          return (
                            <div key={rating} className="flex items-center gap-4">
                              <div className="w-12 text-sm font-bold text-stone-600 flex items-center justify-end">
                                {rating} <Star className="w-3 h-3 ml-1 fill-current text-amber-500" />
                              </div>
                              <div className="flex-grow h-2.5 bg-stone-200 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  className="h-full bg-orange-500 rounded-full"
                                />
                              </div>
                              <div className="w-12 text-xs font-medium text-stone-400">{count}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 font-bold text-lg">
                              {review.userName?.[0] || 'A'}
                            </div>
                            <div>
                              <h4 className="font-bold text-stone-900">{review.userName || 'Anonymous'}</h4>
                              <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">{review.city || review.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 pt-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-500 fill-current' : 'text-stone-200'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-stone-600 leading-relaxed italic">"{review.message}"</p>
                        <div className="mt-6 pt-4 border-t border-stone-50 flex items-center justify-between text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                          <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recent'}</span>
                          {review.serviceId && <span className="text-orange-500">Service Review</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {reviews.length === 0 && (
                    <div className="py-20 text-center">
                      <MessageSquare className="w-16 h-16 text-stone-200 mx-auto mb-4" />
                      <p className="text-stone-500 font-medium">No reviews yet for this vendor.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {pujas.length === 0 && products.length === 0 && (
              <div className="py-20 text-center">
                <Package className="w-16 h-16 text-stone-200 mx-auto mb-4" />
                <p className="text-stone-500 font-medium">This vendor hasn't listed any offerings yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
