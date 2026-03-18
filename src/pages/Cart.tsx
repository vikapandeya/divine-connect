import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, IndianRupee, ArrowRight, MapPin } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Mock cart items for demo
  const [items, setItems] = useState([
    { id: '1', name: 'Brass Ganesha Idol', price: 1299, quantity: 1, image: 'https://picsum.photos/seed/ganesha/100/100' },
    { id: '2', name: 'Sandalwood Incense', price: 250, quantity: 2, image: 'https://picsum.photos/seed/incense/100/100' }
  ]);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!auth.currentUser) {
      alert('Please sign in to checkout.');
      return;
    }
    if (!address) {
      alert('Please provide a shipping address.');
      return;
    }

    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          items: items.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price })),
          totalAmount: total,
          status: 'processing',
          shippingAddress: address
        })
      });
      if (response.ok) {
        alert('Order placed successfully!');
        navigate('/profile');
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-stone-300" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Your cart is empty</h2>
        <p className="text-stone-500 mb-8">Looks like you haven't added any spiritual essentials yet.</p>
        <button 
          onClick={() => navigate('/shop')}
          className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-stone-900 mb-12">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex items-center p-6 bg-white rounded-3xl border border-stone-100">
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-2xl object-cover border border-stone-100" />
              <div className="ml-6 flex-grow">
                <h3 className="font-bold text-stone-900">{item.name}</h3>
                <p className="text-sm text-stone-500">Quantity: {item.quantity}</p>
                <div className="flex items-center text-orange-600 font-bold mt-1">
                  <IndianRupee className="w-3 h-3" />
                  <span>{item.price}</span>
                </div>
              </div>
              <button 
                onClick={() => setItems(items.filter(i => i.id !== item.id))}
                className="p-2 text-stone-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-xl shadow-stone-200/50 sticky top-24">
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                <span className="font-bold text-stone-900">Total</span>
                <span className="text-2xl font-serif font-bold text-orange-600">₹{total}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Shipping Address
                </label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full delivery address..."
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none h-24"
                />
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-500 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isCheckingOut ? 'Processing...' : 'Place Order'}
                {!isCheckingOut && <ArrowRight className="w-5 h-5 ml-2" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
