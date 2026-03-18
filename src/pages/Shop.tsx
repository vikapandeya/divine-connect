import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Filter, Search, IndianRupee } from 'lucide-react';

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = category === 'all' ? '/api/products' : `/api/products?category=${category}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  const categories = ['all', 'Idols', 'Incense', 'Mala', 'Books', 'Yantras'];

  // Mock data if database is empty
  const displayProducts = products.length > 0 ? products : [
    { id: '1', name: 'Brass Ganesha Idol', price: 1299, category: 'Idols', rating: 4.8, image: 'https://picsum.photos/seed/ganesha/400/400' },
    { id: '2', name: 'Sandalwood Incense', price: 250, category: 'Incense', rating: 4.5, image: 'https://picsum.photos/seed/incense/400/400' },
    { id: '3', name: 'Rudraksha Mala', price: 599, category: 'Mala', rating: 4.9, image: 'https://picsum.photos/seed/mala/400/400' },
    { id: '4', name: 'Bhagavad Gita', price: 450, category: 'Books', rating: 5.0, image: 'https://picsum.photos/seed/gita/400/400' },
    { id: '5', name: 'Shree Yantra', price: 899, category: 'Yantras', rating: 4.7, image: 'https://picsum.photos/seed/yantra/400/400' },
    { id: '6', name: 'Silver Diya', price: 1500, category: 'Puja Essentials', rating: 4.6, image: 'https://picsum.photos/seed/diya/400/400' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">Spiritual Marketplace</h1>
          <p className="text-stone-600">Find everything you need for your spiritual journey.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-full text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none w-64"
            />
          </div>
          <button className="p-2 bg-white border border-stone-200 rounded-full hover:bg-stone-50 transition-colors">
            <Filter className="w-5 h-5 text-stone-600" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              category === cat 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                : 'bg-white text-stone-600 border border-stone-200 hover:border-orange-200'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {displayProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-3xl overflow-hidden border border-stone-200 group hover:shadow-xl transition-all"
          >
            <div className="aspect-square overflow-hidden relative">
              <img 
                src={product.image || 'https://picsum.photos/400/400'} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold text-stone-900">{product.rating}</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">{product.category}</p>
              <h3 className="font-bold text-stone-900 mb-4 line-clamp-1">{product.name}</h3>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-xl font-serif font-bold text-orange-600">
                  <IndianRupee className="w-4 h-4" />
                  <span>{product.price}</span>
                </div>
                <button className="bg-stone-900 text-white p-2.5 rounded-xl hover:bg-orange-500 transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
