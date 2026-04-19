import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, IndianRupee, ArrowLeft, ArrowRight, ShieldCheck, Truck, RotateCcw, Share2, Facebook, Twitter, MessageCircle, Send, User, Store, MessageSquare } from 'lucide-react';
import { Feedback } from '../types';
import { addToCart } from '../lib/cart';
import { formatIndianRupees } from '../lib/utils';
import { auth } from '../firebase';
import { VendorProfile } from '../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [mainImage, setMainImage] = useState<string>('');
  const [reviews, setReviews] = useState<Feedback[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', city: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products`);
        if (response.ok) {
          const data = await response.json();
          const found = data.find((p: any) => p.id.toString() === id);
          if (found) {
            const parsed = {
              ...found,
              weightOptions: typeof found.weightOptions === 'string' ? JSON.parse(found.weightOptions) : found.weightOptions
            };
            setProduct(parsed);
            setMainImage(parsed.image || `https://picsum.photos/seed/${parsed.name}/800/800`);
            if (parsed.weightOptions && parsed.weightOptions.length > 0) {
              setSelectedOption(parsed.weightOptions[0]);
            }

            // Fetch vendor details
            if (parsed.vendorId) {
              const vRes = await fetch(`/api/vendors/${parsed.vendorId}`);
              if (vRes.ok) {
                setVendor(await vRes.json());
              }
            }

            // Set recommended products (excluding current)
            const filtered = data
              .filter((p: any) => p.id.toString() !== id)
              .slice(0, 4);
            setRecommendedProducts(filtered);
          }
        }

        // Fetch reviews
        const reviewsRes = await fetch(`/api/feedback?serviceId=${id}&type=product`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData);
        }
      } catch (error) {
        console.error('Error fetching product detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const itemToAdd = {
      id: product.id,
      name: product.name,
      price: selectedOption ? selectedOption.price : product.price,
      image: product.image,
      selectedOption: selectedOption ? selectedOption.label : undefined,
      quantity
    };
    
    for (let i = 0; i < quantity; i++) {
        addToCart(itemToAdd);
    }
    
    // Custom toast/notification would be better than alert
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-stone-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-bounce';
    toast.innerHTML = `<span>Added ${quantity} items to cart</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this divine product: ${product?.name}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
    }
    
    if (shareUrl) window.open(shareUrl, '_blank');
    setShowShareTooltip(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Please sign in to submit a review");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          userName: auth.currentUser.displayName || 'Spiritual Seeker',
          city: newReview.city,
          rating: newReview.rating,
          message: newReview.comment,
          serviceId: id,
          type: 'product'
        })
      });

      if (res.ok) {
        const updatedReviews = await fetch(`/api/feedback?serviceId=${id}&type=product`).then(r => r.json());
        setReviews(updatedReviews);
        setNewReview({ rating: 5, comment: '', city: '' });
        alert("Thank you for your review!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 px-4">
        <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white mb-4">Product Not Found</h2>
        <button 
          onClick={() => navigate('/shop')}
          className="flex items-center space-x-2 text-orange-600 font-bold hover:text-orange-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Shop</span>
        </button>
      </div>
    );
  }

  const galleryImages = [
    product.image || `https://picsum.photos/seed/${product.name}/800/800`,
    `https://picsum.photos/seed/${product.name}-1/800/800`,
    `https://picsum.photos/seed/${product.name}-2/800/800`,
    `https://picsum.photos/seed/${product.name}-3/800/800`,
  ];

  return (
    <div className="bg-stone-50 dark:bg-stone-950 pb-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex justify-center mb-8">
          <img 
            src="/logo/icon-only.png" 
            alt="PunyaSeva" 
            className="h-10 w-auto dark:brightness-0 dark:invert" 
            referrerPolicy="no-referrer"
          />
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="aspect-square rounded-[3rem] overflow-hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-200/50 dark:shadow-black/50">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={mainImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={mainImage} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {galleryImages.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => setMainImage(img)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                    mainImage === img ? 'border-orange-500 scale-105' : 'border-stone-200 dark:border-stone-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={img} 
                    alt="" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Info Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {product.category}
                  </span>
                  {product.templeName && (
                    <span className="px-3 py-1 bg-stone-900 dark:bg-stone-800 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                      {product.templeName}
                    </span>
                  )}
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowShareTooltip(!showShareTooltip)}
                    className="p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full hover:text-orange-500 transition-colors shadow-sm"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <AnimatePresence>
                    {showShareTooltip && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl z-10 flex space-x-2"
                      >
                        <button onClick={() => handleShare('whatsapp')} className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 rounded-xl transition-colors">
                          <MessageCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleShare('facebook')} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-xl transition-colors">
                          <Facebook className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleShare('twitter')} className="p-2 hover:bg-sky-50 dark:hover:bg-sky-900/20 text-sky-500 rounded-xl transition-colors">
                          <Twitter className="w-5 h-5" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-white mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-5 h-5 ${star <= Math.round(product.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-stone-200 dark:text-stone-800'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">{product.rating} Rating</span>
                <span className="text-sm text-stone-400">|</span>
                <span className="text-sm text-stone-500 dark:text-stone-400">{reviews.length} Reviews</span>
              </div>

              <div className="flex items-baseline space-x-3 mb-8">
                <span className="text-4xl font-serif font-bold text-orange-600 flex items-center">
                  <IndianRupee className="w-8 h-8" />
                  {formatIndianRupees((selectedOption ? selectedOption.price : product.price) * quantity)}
                </span>
                {quantity > 1 && (
                  <span className="text-stone-400 text-sm">
                    ({formatIndianRupees(selectedOption ? selectedOption.price : product.price)} each)
                  </span>
                )}
              </div>

              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-8 text-lg">
                {product.description || "Experience the divine essence with this carefully curated spiritual essential. Perfect for your daily rituals and spiritual growth."}
              </p>
            </div>

            {/* Options */}
            {product.weightOptions && product.weightOptions.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-4 uppercase tracking-widest">Select Variant</h3>
                <div className="flex flex-wrap gap-3">
                  {product.weightOptions.map((opt: any) => (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedOption(opt)}
                      className={`px-6 py-3 rounded-2xl text-sm font-bold border transition-all ${
                        selectedOption?.label === opt.label
                          ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900 dark:border-white shadow-lg shadow-stone-900/20'
                          : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-10">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-4 uppercase tracking-widest">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-1">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-stone-900 dark:text-white">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-stone-400 font-medium">
                  {product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-grow bg-orange-500 text-white py-5 rounded-[2rem] font-bold hover:bg-orange-600 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-3 shadow-xl shadow-orange-500/20 active:scale-95"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Vendor Card */}
            {vendor && (
              <div 
                onClick={() => navigate(`/vendor/${vendor.uid}`)}
                className="mb-12 bg-white dark:bg-stone-900 p-6 rounded-[2rem] border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-200/50 dark:shadow-black/50 cursor-pointer group hover:border-orange-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-stone-100 dark:border-stone-800 shadow-sm">
                    <img 
                      src={vendor.photoURL || `https://picsum.photos/seed/${vendor.uid}/200/200`} 
                      alt={vendor.businessName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-stone-900 dark:text-white group-hover:text-orange-600 transition-colors">
                        {vendor.businessName}
                      </h3>
                      {vendor.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {vendor.rating}
                      </div>
                      <div className="flex items-center text-stone-400 text-[10px] font-bold uppercase tracking-wider">
                        <Store className="w-3 h-3 mr-1" />
                        {vendor.type}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-stone-50 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-orange-600">
                  <span>View Full Profile</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-stone-200 dark:border-stone-800">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-stone-100 dark:bg-stone-900 rounded-2xl flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6 text-stone-900 dark:text-stone-100" />
                </div>
                <span className="text-xs font-bold text-stone-900 dark:text-white mb-1">Authentic</span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400">100% Pure & Sacred</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-stone-100 dark:bg-stone-900 rounded-2xl flex items-center justify-center mb-3">
                  <Truck className="w-6 h-6 text-stone-900 dark:text-stone-100" />
                </div>
                <span className="text-xs font-bold text-stone-900 dark:text-white mb-1">Fast Shipping</span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400">Delivered in 3-5 Days</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-stone-100 dark:bg-stone-900 rounded-2xl flex items-center justify-center mb-3">
                  <RotateCcw className="w-6 h-6 text-stone-900 dark:text-stone-100" />
                </div>
                <span className="text-xs font-bold text-stone-900 dark:text-white mb-1">Easy Return</span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400">7-Day Return Policy</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Spiritual Significance Section */}
        <div className="mt-24 p-8 md:p-12 bg-stone-100 dark:bg-stone-900 rounded-[3rem] border border-stone-200 dark:border-stone-800">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white mb-6">Spiritual Significance & Origin</h2>
            <div className="w-16 h-1 bg-orange-500 mx-auto mb-8 rounded-full" />
            {product.spiritualSignificance ? (
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-lg mb-6">
                {product.spiritualSignificance}
              </p>
            ) : (
              <>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-lg mb-6">
                  This {product.name} is sourced directly from the sacred regions of India, where it has been used for centuries in traditional Vedic rituals. Each piece is carefully selected and blessed by temple priests to ensure it carries the highest spiritual vibrations.
                </p>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-lg">
                  In Hindu tradition, such items are believed to purify the environment, enhance concentration during meditation, and attract positive cosmic energies into your home. Its origin can be traced back to the ancient scriptures, where its use was prescribed for attaining peace, prosperity, and spiritual enlightenment.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white mb-2">Customer Reviews</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="ml-1 font-bold text-stone-900 dark:text-white">{product.rating}</span>
                </div>
                <span className="text-stone-400">•</span>
                <span className="text-stone-500 dark:text-stone-400">{reviews.length} total reviews</span>
              </div>
            </div>
            
            {auth.currentUser && (
              <button 
                onClick={() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-6 py-3 rounded-2xl font-bold hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors"
              >
                Write a Review
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-8">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white dark:bg-stone-900 p-6 rounded-[2rem] border border-stone-200 dark:border-stone-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-stone-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-stone-900 dark:text-white">{review.userName}</h4>
                          <span className="text-xs text-stone-400">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Just now'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-yellow-500 fill-current' : 'text-stone-200 dark:text-stone-800'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                      {review.message}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-[2rem] border border-dashed border-stone-200 dark:border-stone-800">
                  <p className="text-stone-500 dark:text-stone-400">No reviews yet. Be the first to share your experience!</p>
                </div>
              )}
            </div>

            {/* Review Form */}
            <div id="review-form" className="lg:col-span-1">
              {auth.currentUser ? (
                <div className="bg-white dark:bg-stone-900 p-8 rounded-[2rem] border border-stone-200 dark:border-stone-800 shadow-xl sticky top-24">
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-6">Share Your Experience</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-stone-900 dark:text-white mb-3 uppercase tracking-widest">Rating</label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewReview({ ...newReview, rating: s })}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star className={`w-8 h-8 ${s <= newReview.rating ? 'text-yellow-500 fill-current' : 'text-stone-200 dark:text-stone-800'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-stone-900 dark:text-white mb-3 uppercase tracking-widest">Your City</label>
                      <input
                        type="text"
                        value={newReview.city}
                        onChange={(e) => setNewReview({ ...newReview, city: e.target.value })}
                        placeholder="e.g. Varanasi"
                        className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-2xl p-4 text-stone-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all mb-4"
                      />
                      <label className="block text-sm font-bold text-stone-900 dark:text-white mb-3 uppercase tracking-widest">Your Review</label>
                      <textarea
                        required
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        placeholder="How was the product? Did it meet your spiritual needs?"
                        rows={4}
                        className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-2xl p-4 text-stone-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center space-x-2 disabled:bg-stone-300"
                    >
                      {isSubmittingReview ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Submit Review</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-stone-400 text-center">
                      Only verified purchasers can submit reviews. Your review will be public.
                    </p>
                  </form>
                </div>
              ) : (
                <div className="bg-stone-100 dark:bg-stone-900 p-8 rounded-[2rem] border border-stone-200 dark:border-stone-800 text-center">
                  <User className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">Want to leave a review?</h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">Please sign in to share your spiritual experience with others.</p>
                  <button 
                    onClick={() => navigate('/profile')}
                    className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-orange-600 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <div className="mt-32">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white mb-2">Recommended for You</h2>
                <p className="text-stone-500 dark:text-stone-400">Other spiritual essentials you might like.</p>
              </div>
              <button 
                onClick={() => navigate('/shop')}
                className="text-orange-600 font-bold hover:text-orange-700 transition-colors flex items-center gap-2"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recommendedProducts.map((p) => (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-200 dark:border-stone-800 overflow-hidden cursor-pointer group"
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img 
                      src={p.image || `https://picsum.photos/seed/${p.name}/400/400`} 
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-bold text-stone-900 dark:text-white">{p.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2 block">
                      {p.category}
                    </span>
                    <h3 className="font-bold text-stone-900 dark:text-white mb-2 line-clamp-1">{p.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                        {formatIndianRupees(p.price)}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
