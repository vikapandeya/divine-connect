import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { auth } from '../firebase';
import {
  ShoppingBag,
  Trash2,
  IndianRupee,
  ArrowRight,
  MapPin,
  Minus,
  Plus,
  CreditCard,
  Smartphone,
  Truck,
  CheckCircle,
} from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';
import {
  CartItem,
  clearCart,
  getCartItems,
  removeFromCart,
  subscribeToCart,
  updateCartItemQuantity,
} from '../lib/cart';
import { formatIndianRupees } from '../lib/utils';
import { useToast } from '../components/Toast';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo');

const CheckoutForm = ({ 
  amount, 
  onSuccess, 
  onError, 
  isLoading, 
  setIsLoading 
}: { 
  amount: number; 
  onSuccess: (paymentIntentId: string) => void; 
  onError: (message: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const { clientSecret, error: backendError } = await response.json();

      if (backendError) {
        onError(backendError);
        setIsLoading(false);
        return;
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement) as any,
        },
      });

      if (stripeError) {
        onError(stripeError.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      onError('An error occurred during payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#9e2146' },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
      >
        {isLoading ? t('cart.processing') : `${t('cart.total')} ${formatIndianRupees(amount)}`}
      </button>
    </form>
  );
};

export default function Cart() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const currentUser = auth?.currentUser;
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedAddress, setSavedAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCode, setAppliedCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

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

  const discountAmount = couponType === 'percentage' 
    ? (total * couponDiscount) / 100 
    : couponDiscount;
  
  const finalTotal = Math.max(0, total - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, cartTotal: total }),
      });
      const data = await response.json();
      if (response.ok) {
        setCouponDiscount(data.discount);
        setCouponType(data.type);
        setAppliedCode(couponCode.toUpperCase());
        setCouponError('');
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        setCouponDiscount(0);
        setAppliedCode('');
      }
    } catch (error) {
      setCouponError('Failed to validate coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCheckout = async (paymentIntentId?: string) => {
    if (!currentUser) {
      toast('Please sign in to checkout.', 'warning');
      return;
    }
    if (!address) {
      toast(t('cart.provideAddress'), 'warning');
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
          totalAmount: finalTotal,
          status: 'processing',
          shippingAddress: address,
          couponUsed: appliedCode || null,
          discountAmount: discountAmount,
          paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
          paymentId: paymentIntentId || null,
        }),
      });
      if (response.ok) {
        clearCart();
        setOrderSuccess(true);
        setShowFeedbackModal(true);
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast(t('cart.failed'), 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-[80vh] bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-4">
          {t('cart.orderPlaced')}
        </h2>
        <p className="text-xl text-stone-600 dark:text-stone-400 mb-12 max-w-md">
          Thank you for choosing VedaVibe. Your spiritual journey continues with us.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="bg-stone-900 dark:bg-stone-800 text-white px-8 py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all"
          >
            View Orders
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
          >
            Continue Shopping
          </button>
        </div>

        {showFeedbackModal && (
          <FeedbackModal
            isOpen={showFeedbackModal}
            onClose={() => {
              setShowFeedbackModal(false);
              navigate('/profile');
            }}
            serviceId="general_order"
            type="general"
            serviceName="Your Shopping Experience"
          />
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center text-center px-4 transition-colors duration-300">
        <div className="w-20 h-20 bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-stone-300 dark:text-stone-700" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-2">
          {t('cart.empty')}
        </h2>
        <p className="text-stone-500 dark:text-stone-400 mb-8">
          {t('cart.emptySubtitle')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors"
        >
          {t('cart.startShopping')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-12">
          {t('cart.title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div
                key={item.id + (item.selectedOption || '')}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-stone-100 dark:border-stone-800"
                />
                <div className="sm:ml-2 flex-grow">
                  <h3 className="font-bold text-stone-900 dark:text-white">{item.name}</h3>
                  {item.selectedOption && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Option: {item.selectedOption}</p>
                  )}
                  <div className="flex items-center text-orange-600 font-bold mt-2">
                    <IndianRupee className="w-3 h-3" />
                    <span>{formatIndianRupees(item.price)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-full px-2 py-1">
                    <button
                      type="button"
                      onClick={() =>
                        updateCartItemQuantity(item.id + (item.selectedOption || ''), item.quantity - 1)
                      }
                      className="p-1 text-stone-500 dark:text-stone-400 hover:text-orange-500 transition-colors"
                      aria-label={`Decrease quantity for ${item.name}`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-stone-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateCartItemQuantity(item.id + (item.selectedOption || ''), item.quantity + 1)
                      }
                      className="p-1 text-stone-500 dark:text-stone-400 hover:text-orange-500 transition-colors"
                      aria-label={`Increase quantity for ${item.name}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id + (item.selectedOption || ''))}
                    className="p-2 text-stone-300 dark:text-stone-600 hover:text-red-500 transition-colors"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-200/50 dark:shadow-none sticky top-24">
              <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-6">
                {t('cart.orderSummary')}
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
                  <span>{t('cart.subtotal')}</span>
                  <div className="flex items-center font-medium text-stone-900 dark:text-white">
                    <IndianRupee className="w-4 h-4" />
                    <span>{formatIndianRupees(total)}</span>
                  </div>
                </div>
                
                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-medium">
                    <span>{t('cart.discount')} ({appliedCode})</span>
                    <div className="flex items-center">
                      <span>- </span>
                      <IndianRupee className="w-4 h-4" />
                      <span>{formatIndianRupees(discountAmount)}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-stone-600 dark:text-stone-400">
                  <span>{t('cart.shipping')}</span>
                  <span className="text-emerald-600 font-bold">{t('cart.free')}</span>
                </div>
                <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
                  <span className="font-bold text-stone-900 dark:text-white">{t('cart.total')}</span>
                  <div className="flex items-center text-2xl font-serif font-bold text-orange-600">
                    <IndianRupee className="w-5 h-5" />
                    <span>{formatIndianRupees(finalTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
                    {t('cart.promoCode')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder={t('cart.enterCode')}
                      className="flex-1 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white px-4 py-2 rounded-xl font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-all disabled:opacity-50"
                    >
                      {isApplyingCoupon ? '...' : t('cart.apply')}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                  {appliedCode && <p className="text-xs text-emerald-600 mt-1">Coupon applied!</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {t('cart.shippingAddress')}
                  </label>
                  <textarea
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Enter your full delivery address..."
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none h-24"
                  />
                </div>

                <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-4">
                    {t('cart.paymentMethod')}
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'border-stone-200 dark:border-stone-700 text-stone-500'}`}
                    >
                      <CreditCard className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold uppercase">{t('cart.card')}</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${paymentMethod === 'upi' ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'border-stone-200 dark:border-stone-700 text-stone-500'}`}
                    >
                      <Smartphone className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold uppercase">{t('cart.upi')}</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'border-stone-200 dark:border-stone-700 text-stone-500'}`}
                    >
                      <Truck className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold uppercase">{t('cart.cod')}</span>
                    </button>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Elements stripe={stripePromise}>
                        <CheckoutForm 
                          amount={finalTotal} 
                          onSuccess={(id) => handleCheckout(id)}
                          onError={(msg) => toast(msg, 'error')}
                          isLoading={isCheckingOut}
                          setIsLoading={setIsCheckingOut}
                        />
                      </Elements>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                      <input 
                        type="text" 
                        placeholder="yourname@upi" 
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500" 
                      />
                      <button
                        type="button"
                        onClick={() => handleCheckout()}
                        disabled={isCheckingOut}
                        className="w-full bg-stone-900 dark:bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-500 dark:hover:bg-orange-600 transition-all flex items-center justify-center disabled:opacity-50"
                      >
                        {isCheckingOut ? t('cart.processing') : t('cart.placeOrder')}
                        {!isCheckingOut && <ArrowRight className="w-5 h-5 ml-2" />}
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="space-y-4">
                      <p className="text-xs text-stone-500 dark:text-stone-400 italic animate-in fade-in duration-300">
                        Pay with cash upon delivery. A small handling fee may apply.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCheckout()}
                        disabled={isCheckingOut}
                        className="w-full bg-stone-900 dark:bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-500 dark:hover:bg-orange-600 transition-all flex items-center justify-center disabled:opacity-50"
                      >
                        {isCheckingOut ? t('cart.processing') : t('cart.placeOrder')}
                        {!isCheckingOut && <ArrowRight className="w-5 h-5 ml-2" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
