import React, { useEffect, useMemo, useState } from 'react';
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
  ShieldCheck,
  Truck,
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
import { createOrderDirect } from '../lib/firestore-data';

export default function Cart() {
  const currentUser = auth?.currentUser;
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerDetails, setCustomerDetails] = useState({
    fullName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    deliveryNotes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('UPI / Wallet');

  useEffect(() => {
    const syncCart = () => {
      setItems(getCartItems());
    };

    syncCart();
    return subscribeToCart(syncCart);
  }, []);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const estimatedDeliveryLabel = useMemo(() => {
    return items.some((item) => item.category === 'Prasad') ? '3 to 5 days' : '2 to 4 days';
  }, [items]);

  const handleCheckout = async () => {
    if (!currentUser) {
      alert('Please sign in to checkout.');
      return;
    }

    const requiredFields = [
      customerDetails.fullName,
      customerDetails.email,
      customerDetails.phoneNumber,
      customerDetails.addressLine1,
      customerDetails.city,
      customerDetails.state,
      customerDetails.pincode,
    ];

    if (requiredFields.some((field) => !field.trim())) {
      alert('Please fill in full name, email, phone number, address, city, state, and pincode.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(customerDetails.email.trim())) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!/^\d{10}$/.test(customerDetails.phoneNumber.trim())) {
      alert('Please enter a valid 10-digit contact number.');
      return;
    }

    if (!/^\d{6}$/.test(customerDetails.pincode.trim())) {
      alert('Please enter a valid 6-digit pincode.');
      return;
    }

    setIsCheckingOut(true);
    try {
      await createOrderDirect({
        userId: currentUser.uid,
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          category: item.category || 'Offerings',
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          templeName: item.templeName,
          weight: item.weight,
          size: item.size,
        })),
        totalAmount: total,
        status: 'processing',
        shippingAddress: [
          customerDetails.addressLine1,
          customerDetails.addressLine2,
          customerDetails.city && customerDetails.state
            ? `${customerDetails.city}, ${customerDetails.state}`
            : customerDetails.city || customerDetails.state,
          customerDetails.pincode,
        ]
          .filter(Boolean)
          .join(', '),
        customerDetails,
        paymentMethod,
        shippingFee: 0,
      });
      clearCart();
      alert('Order placed successfully. Your receipt is available in My Orders.');
      navigate('/profile');
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
                {(item.templeName || item.weight || item.size) && (
                  <p className="text-xs text-stone-500 mt-1">
                    {[item.templeName, item.weight, item.size].filter(Boolean).join(' | ')}
                  </p>
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
                    onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
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
                    onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                    className="p-1 text-stone-500 hover:text-orange-500 transition-colors"
                    aria-label={`Increase quantity for ${item.name}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
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
              <div className="flex justify-between text-stone-600">
                <span>Estimated Delivery</span>
                <span className="font-bold text-stone-900">{estimatedDeliveryLabel}</span>
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
                  Delivery Details
                </label>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={customerDetails.fullName}
                    onChange={(event) =>
                      setCustomerDetails((previous) => ({
                        ...previous,
                        fullName: event.target.value,
                      }))
                    }
                    placeholder="Full name"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="email"
                      value={customerDetails.email}
                      onChange={(event) =>
                        setCustomerDetails((previous) => ({
                          ...previous,
                          email: event.target.value,
                        }))
                      }
                      placeholder="Email ID"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                    <input
                      type="tel"
                      value={customerDetails.phoneNumber}
                      onChange={(event) =>
                        setCustomerDetails((previous) => ({
                          ...previous,
                          phoneNumber: event.target.value,
                        }))
                      }
                      placeholder="Contact number"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <textarea
                    value={customerDetails.addressLine1}
                    onChange={(event) =>
                      setCustomerDetails((previous) => ({
                        ...previous,
                        addressLine1: event.target.value,
                      }))
                    }
                    placeholder="Address line 1"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none h-20"
                  />
                  <input
                    type="text"
                    value={customerDetails.addressLine2}
                    onChange={(event) =>
                      setCustomerDetails((previous) => ({
                        ...previous,
                        addressLine2: event.target.value,
                      }))
                    }
                    placeholder="Address line 2, landmark, apartment"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={customerDetails.city}
                      onChange={(event) =>
                        setCustomerDetails((previous) => ({
                          ...previous,
                          city: event.target.value,
                        }))
                      }
                      placeholder="City"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                    <input
                      type="text"
                      value={customerDetails.state}
                      onChange={(event) =>
                        setCustomerDetails((previous) => ({
                          ...previous,
                          state: event.target.value,
                        }))
                      }
                      placeholder="State"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                    <input
                      type="text"
                      value={customerDetails.pincode}
                      onChange={(event) =>
                        setCustomerDetails((previous) => ({
                          ...previous,
                          pincode: event.target.value,
                        }))
                      }
                      placeholder="Pincode"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <textarea
                    value={customerDetails.deliveryNotes}
                    onChange={(event) =>
                      setCustomerDetails((previous) => ({
                        ...previous,
                        deliveryNotes: event.target.value,
                      }))
                    }
                    placeholder="Delivery notes, preferred timing, or special instructions"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none h-20"
                  />
                  <div className="space-y-3 rounded-2xl border border-stone-100 bg-stone-50 p-4">
                    <p className="text-sm font-bold text-stone-900">Payment Method</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['UPI / Wallet', 'Card', 'Cash on Delivery'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                            paymentMethod === method
                              ? 'border-orange-500 bg-orange-50 text-orange-600'
                              : 'border-stone-200 bg-white text-stone-600'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-500">
                      <div className="flex items-start gap-2 rounded-xl bg-white p-3 border border-stone-200">
                        <ShieldCheck className="w-4 h-4 mt-0.5 text-emerald-500" />
                        <span>Secure checkout and printable receipt are available as soon as the order is placed.</span>
                      </div>
                      <div className="flex items-start gap-2 rounded-xl bg-white p-3 border border-stone-200">
                        <Truck className="w-4 h-4 mt-0.5 text-blue-500" />
                        <span>Your order summary now includes an estimated delivery window for temple offerings.</span>
                      </div>
                    </div>
                  </div>
                </div>
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
