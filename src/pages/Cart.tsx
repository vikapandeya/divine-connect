import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import {
  ShoppingBag,
  Trash2,
  IndianRupee,
  ArrowRight,
  MapPin,
  Minus,
  Plus,
} from 'lucide-react';
import {
  CartItem,
  clearCart,
  getCartItems,
  removeFromCart,
  subscribeToCart,
  updateCartItemQuantity,
} from '../lib/cart';
import { formatIndianRupees } from '../lib/utils';

export default function Cart() {
  const currentUser = auth?.currentUser;
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedAddress, setSavedAddress] = useState('');

  useEffect(() => {
    const syncCart = () => {
      setItems(getCartItems());
    };

    syncCart();
    return subscribeToCart(syncCart);
  }, []);

  useEffect(() => {
    const fetchUserAddress = async () => {
      if (currentUser) {
        try {
          const response = await fetch(`/api/users/${currentUser.uid}`);
          if (response.ok) {
            const userData = await response.json();
            if (userData.address) {
              setAddress(userData.address);
              setSavedAddress(userData.address);
            }
          }
        } catch (error) {
          console.error('Error fetching user address:', error);
        }
      }
    };
    fetchUserAddress();
  }, [currentUser]);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!currentUser) {
      alert('Please sign in to checkout.');
      return;
    }
    if (!address) {
      alert('Please provide a shipping address.');
      return;
    }

    setIsCheckingOut(true);
    try {
      // If address is new or changed, save it to user profile
      if (address !== savedAddress) {
        await fetch(`/api/users/${currentUser.uid}/address`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        });
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            selectedOption: item.selectedOption,
          })),
          totalAmount: total,
          status: 'processing',
          shippingAddress: address,
        }),
      });
      if (response.ok) {
        clearCart();
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
        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">
          Your cart is empty
        </h2>
        <p className="text-stone-500 mb-8">
          Looks like you haven&apos;t added any spiritual essentials yet.
        </p>
        <button
          type="button"
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
      <h1 className="text-4xl font-serif font-bold text-stone-900 mb-12">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 bg-white rounded-3xl border border-stone-100"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-2xl object-cover border border-stone-100"
              />
              <div className="sm:ml-2 flex-grow">
                <h3 className="font-bold text-stone-900">{item.name}</h3>
                {item.selectedOption && (
                  <p className="text-xs text-stone-500 mt-1">Option: {item.selectedOption}</p>
                )}
                <div className="flex items-center text-orange-600 font-bold mt-2">
                  <IndianRupee className="w-3 h-3" />
                  <span>{formatIndianRupees(item.price)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-stone-200 rounded-full px-2 py-1">
                  <button
                    type="button"
                    onClick={() =>
                      updateCartItemQuantity(item.id + (item.selectedOption || ''), item.quantity - 1)
                    }
                    className="p-1 text-stone-500 hover:text-orange-500 transition-colors"
                    aria-label={`Decrease quantity for ${item.name}`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-stone-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateCartItemQuantity(item.id + (item.selectedOption || ''), item.quantity + 1)
                    }
                    className="p-1 text-stone-500 hover:text-orange-500 transition-colors"
                    aria-label={`Increase quantity for ${item.name}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.id + (item.selectedOption || ''))}
                  className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-xl shadow-stone-200/50 sticky top-24">
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-6">
              Order Summary
            </h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-stone-600">
                <span>Subtotal</span>
                <div className="flex items-center font-medium text-stone-900">
                  <IndianRupee className="w-4 h-4" />
                  <span>{formatIndianRupees(total)}</span>
                </div>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                <span className="font-bold text-stone-900">Total</span>
                <div className="flex items-center text-2xl font-serif font-bold text-orange-600">
                  <IndianRupee className="w-5 h-5" />
                  <span>{formatIndianRupees(total)}</span>
                </div>
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
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Enter your full delivery address..."
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none h-24"
                />
              </div>

              <button
                type="button"
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
