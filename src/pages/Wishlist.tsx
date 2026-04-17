import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Product, WishlistItem } from '../types';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, IndianRupee, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { addToCart } from '../lib/cart';
import { formatIndianRupees } from '../lib/utils';
import { useToast } from '../components/Toast';

export default function Wishlist() {
  const { toast } = useToast();
  const [items, setItems] = useState<(Product & { wishlistId: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const wishlistRef = collection(db, 'wishlist');
        const q = query(wishlistRef, where('userId', '==', auth.currentUser.uid), where('type', '==', 'product'));
        const snapshot = await getDocs(q);
        
        const productPromises = snapshot.docs.map(async (wishDoc) => {
          const data = wishDoc.data() as WishlistItem;
          const productDoc = await getDoc(doc(db, 'products', data.itemId));
          if (productDoc.exists()) {
            return {
              id: productDoc.id,
              ...productDoc.data(),
              wishlistId: wishDoc.id
            } as Product & { wishlistId: string };
          }
          return null;
        });

        const products = (await Promise.all(productPromises)).filter(p => p !== null) as (Product & { wishlistId: string })[];
        setItems(products);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const removeItem = async (wishlistId: string) => {
    try {
      await deleteDoc(doc(db, 'wishlist', wishlistId));
      setItems(prev => prev.filter(item => item.wishlistId !== wishlistId));
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image });
    toast(`${product.name} added to cart!`, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-stone-950">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!auth.currentUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-white dark:bg-stone-950">
        <Heart className="w-16 h-16 text-stone-200 dark:text-stone-800 mb-6" />
        <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-2">Please Login</h2>
        <p className="text-stone-600 dark:text-stone-400 mb-8 text-center max-w-md">
          You need to be logged in to view your wishlist and save your favorite spiritual items.
        </p>
        <Link to="/login" className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-all">
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-white dark:bg-stone-950 transition-colors duration-300 min-h-screen">
      <section className="bg-stone-50 dark:bg-stone-900/50 py-16 mb-12 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-white mb-4">
            My Wishlist
          </h1>
          <p className="text-stone-600 dark:text-stone-400">
            Your collection of sacred items and spiritual essentials.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="text-center py-20 bg-stone-50 dark:bg-stone-900/30 rounded-[3rem] border border-stone-200 dark:border-stone-800">
            <Heart className="w-16 h-16 text-stone-200 dark:text-stone-800 mx-auto mb-6" />
            <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-2">Your wishlist is empty</h2>
            <p className="text-stone-600 dark:text-stone-400 mb-8">
              Start exploring our spiritual marketplace and save items you love.
            </p>
            <Link to="/shop" className="inline-flex items-center space-x-2 bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-all">
              <span>Explore Shop</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((product, index) => (
              <motion.div
                key={product.wishlistId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 group hover:shadow-xl transition-all flex flex-col shadow-sm"
              >
                <div className="aspect-square overflow-hidden relative">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </Link>
                  <button
                    onClick={() => removeItem(product.wishlistId)}
                    className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-bold mb-1">
                    {product.category}
                  </p>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-bold text-stone-900 dark:text-white mb-4 line-clamp-1 hover:text-orange-500 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="mt-auto flex justify-between items-center gap-3">
                    <div className="flex items-center text-xl font-serif font-bold text-orange-600 dark:text-orange-400">
                      <IndianRupee className="w-4 h-4" />
                      <span>{formatIndianRupees(product.price)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="bg-stone-900 dark:bg-stone-700 text-white px-4 py-2 rounded-xl hover:bg-orange-500 transition-colors flex items-center space-x-2 text-sm font-bold"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
