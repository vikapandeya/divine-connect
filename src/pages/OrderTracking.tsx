import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, ChevronLeft, MapPin, Calendar, CreditCard, ShieldCheck } from 'lucide-react';
import { formatIndianRupees } from '../lib/utils';
import { Order } from '../types';

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/details/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] shadow-sm border border-stone-200 dark:border-stone-800 text-center max-w-md">
          <Package className="w-16 h-16 text-stone-200 dark:text-stone-800 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-2">Order Not Found</h2>
          <p className="text-stone-500 dark:text-stone-400 mb-6">We couldn't find the order details you're looking for.</p>
          <Link to="/profile" className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing': return <Clock className="w-6 h-6" />;
      case 'shipped': return <Truck className="w-6 h-6" />;
      case 'delivered': return <CheckCircle className="w-6 h-6" />;
      case 'out for delivery': return <Truck className="w-6 h-6" />;
      default: return <Package className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
      case 'shipped': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'delivered': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
      case 'out for delivery': return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20';
      default: return 'text-stone-600 bg-stone-50 dark:bg-stone-800';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-8">
          <img 
            src="/logo/icon-only.png" 
            alt="PunyaSeva" 
            className="h-12 w-auto" 
            referrerPolicy="no-referrer"
          />
        </div>
        <Link to="/profile" className="inline-flex items-center text-sm font-bold text-stone-500 hover:text-orange-600 mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Order History
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tracking Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 p-8 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-8 border-b border-stone-100 dark:border-stone-800 gap-4">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-1">Track Order</h1>
                  <p className="text-stone-500 dark:text-stone-400 text-sm">Order ID: <span className="font-mono font-bold text-stone-900 dark:text-white">{orderId?.toUpperCase()}</span></p>
                </div>
                <div className={`px-4 py-2 rounded-2xl flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="font-bold uppercase text-xs tracking-wider">{order.status}</span>
                </div>
              </div>

              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-stone-100 dark:bg-stone-800 ml-[11px]"></div>

                <div className="space-y-12">
                  {order.trackingHistory?.slice().reverse().map((update, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex items-start space-x-6"
                    >
                      <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-stone-900 ${index === 0 ? 'bg-orange-600' : 'bg-stone-200 dark:bg-stone-700'}`}>
                        {index === 0 && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1">
                          <h3 className={`font-bold text-lg ${index === 0 ? 'text-stone-900 dark:text-white' : 'text-stone-400 dark:text-stone-500'}`}>
                            {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                          </h3>
                          <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                            {new Date(update.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className={`text-sm ${index === 0 ? 'text-stone-600 dark:text-stone-400' : 'text-stone-400 dark:text-stone-600'}`}>
                          {update.message}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 p-8 shadow-sm"
            >
              <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
                        <img 
                          src={item.image || `https://picsum.photos/seed/${item.name}/100/100`} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 dark:text-white">{item.name}</h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold text-stone-900 dark:text-white">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
                <span className="text-stone-500 dark:text-stone-400 font-bold uppercase text-xs tracking-widest">Total Amount Paid</span>
                <span className="text-2xl font-serif font-bold text-orange-600">₹{order.totalAmount}</span>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 p-8 shadow-sm"
            >
              <h3 className="text-sm font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-6">Shipping Details</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase mb-1">Delivery Address</p>
                    <p className="text-sm text-stone-900 dark:text-white font-medium leading-relaxed">
                      {order.shippingAddress}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase mb-1">Order Date</p>
                    <p className="text-sm text-stone-900 dark:text-white font-medium">
                      {new Date(order.createdAt).toLocaleDateString([], { dateStyle: 'long' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CreditCard className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase mb-1">Payment Method</p>
                    <p className="text-sm text-stone-900 dark:text-white font-medium capitalize">
                      {order.paymentMethod || 'Online Payment'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-orange-600 rounded-[2.5rem] p-8 text-white shadow-lg shadow-orange-600/20"
            >
              <ShieldCheck className="w-10 h-10 mb-4 opacity-80" />
              <h3 className="text-xl font-serif font-bold mb-2">Divine Guarantee</h3>
              <p className="text-orange-100 text-sm leading-relaxed">
                Your spiritual items are handled with utmost care and purity. We ensure timely delivery of all your puja essentials.
              </p>
            </motion.div>

            <div className="text-center p-4">
              <p className="text-xs text-stone-400 dark:text-stone-600">
                Need help with your order? <br/>
                <Link to="/contact" className="text-orange-600 font-bold hover:underline">Contact Support</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
