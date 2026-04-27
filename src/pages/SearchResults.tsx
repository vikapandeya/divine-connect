import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Flame, MapPin, Star, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Puja, Yatra } from '../types';
import AIGroundedSearch from '../components/AIGroundedSearch';
import { formatIndianRupees } from '../lib/utils';
import { addToCart } from '../lib/cart';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<{
    products: Product[];
    pujas: Puja[];
    yatras: Yatra[];
  }>({
    products: [],
    pujas: [],
    yatras: []
  });

  useEffect(() => {
    const fetchResults = async () => {
      if (!q) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [productsSnap, pujasSnap, yatrasSnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'pujas')),
          getDocs(collection(db, 'yatras'))
        ]);

        const products = productsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Product))
          .filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase()));

        const pujas = pujasSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Puja))
          .filter(p => p.title.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase()));

        const yatras = yatrasSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Yatra))
          .filter(y => y.title.toLowerCase().includes(q.toLowerCase()) || y.location.toLowerCase().includes(q.toLowerCase()));

        setResults({ products, pujas, yatras });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [q]);

  const totalResults = results.products.length + results.pujas.length + results.yatras.length;

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 dark:text-white mb-4">
            Search Results for <span className="text-orange-500 italic">"{q}"</span>
          </h1>
          <p className="text-stone-500 dark:text-stone-400">
            {loading ? 'Searching the cosmos...' : `Found ${totalResults} local matches across our spiritual platform.`}
          </p>
        </div>

        {/* AI Grounded Insights */}
        {q && (
          <div className="mb-16">
            <AIGroundedSearch query={q} type="general" />
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <p className="text-stone-500 animate-pulse">Consulting the divine archives...</p>
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-20 bg-stone-50 dark:bg-stone-900/50 rounded-[3rem] border border-dashed border-stone-200 dark:border-stone-800">
            <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-stone-400" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-2">No local results found</h2>
            <p className="text-stone-500 max-w-md mx-auto">
              We couldn't find any direct matches in our database, but our AI Insights above might still give you the spiritual guidance you seek.
            </p>
          </div>
        ) : (
          <div className="space-y-20">
            {/* Products Section */}
            {results.products.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">Spiritual Products</h2>
                  <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-3 py-1 rounded-full uppercase tracking-wider ml-auto">
                    {results.products.length} Items
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.products.map(product => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 group"
                    >
                      <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden relative">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-bold text-stone-900 dark:text-white">{product.rating}</span>
                        </div>
                      </Link>
                      <div className="p-6">
                        <h3 className="font-bold text-stone-900 dark:text-white mb-2">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-serif font-bold text-orange-600">{formatIndianRupees(product.price)}</span>
                          <button onClick={() => addToCart(product)} className="p-2 bg-stone-100 dark:bg-stone-800 rounded-xl hover:bg-orange-500 hover:text-white transition-colors">
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Pujas Section */}
            {results.pujas.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600">
                    <Flame className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">Puja Services</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.pujas.map(puja => (
                    <motion.div
                      key={puja.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-stone-900 rounded-[2.5rem] overflow-hidden border border-stone-200 dark:border-stone-800 flex flex-col"
                    >
                      <div className="p-8">
                        <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-4">{puja.title}</h3>
                        <p className="text-stone-500 dark:text-stone-400 text-sm mb-6 line-clamp-2">{puja.description}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-lg font-bold text-orange-600">From {formatIndianRupees(puja.onlinePrice)}</span>
                          <Link to={`/pujas/${puja.id}`} className="bg-stone-900 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-orange-500 transition-colors flex items-center">
                            Book Now <ArrowRight className="w-3 h-3 ml-2" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Yatras Section */}
            {results.yatras.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">Divine Yatras</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {results.yatras.map(yatra => (
                    <motion.div
                      key={yatra.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-stone-900 rounded-[3rem] overflow-hidden border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row"
                    >
                      <div className="md:w-2/5 h-48 md:h-auto overflow-hidden">
                        <img src={yatra.images[0]} alt={yatra.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-8 md:w-3/5">
                        <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-2">{yatra.title}</h3>
                        <p className="text-stone-500 text-sm mb-4">{yatra.location}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-orange-600">{formatIndianRupees(yatra.price)}</span>
                          <Link to={`/yatras/${yatra.id}`} className="text-orange-500 font-bold text-sm flex items-center">
                            View Details <ArrowRight className="w-4 h-4 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
