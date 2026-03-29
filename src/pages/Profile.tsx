import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { UserProfile, Booking, Order } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, Calendar, Settings, Phone, Mail, Download, Printer, X, FileText, Moon, Sun, Monitor, Store, Briefcase, ChevronRight, XCircle, ShoppingBag } from 'lucide-react';
import { formatIndianRupees } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';

interface ReceiptData {
  receiptId: string;
  date: string;
  customer: string;
  email: string;
  item?: string;
  items?: { name: string; qty: number; price: number }[];
  type?: string;
  amount?: number;
  total?: number;
  samagriStatus?: string;
  samagriList?: string;
  status: string;
  address?: string;
}

export default function Profile() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'orders' | 'profile'>('bookings');
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vendorForm, setVendorForm] = useState({
    businessName: '',
    businessType: 'Pandit' as 'Pandit' | 'Shop',
    description: ''
  });
  const [vendorLoading, setVendorLoading] = useState(false);

  useEffect(() => {
    if (!currentUser || authLoading) return;

    // Fetch Profile
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/${currentUser.uid}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();

    // Fetch Bookings
    const fetchBookings = async () => {
      try {
        const response = await fetch(`/api/bookings/${currentUser.uid}`);
        if (response.ok) {
          const data = await response.json();
          setBookings(data);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };
    fetchBookings();

    // Fetch Orders
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/orders/${currentUser.uid}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchOrders();
  }, [currentUser]);

  const handleFetchReceipt = async (type: 'booking' | 'order', id: string) => {
    setLoadingReceipt(true);
    try {
      const response = await fetch(`/api/receipt/${type}/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedReceipt(data);
      } else {
        alert('Failed to fetch receipt data.');
      }
    } catch (error) {
      console.error('Receipt error:', error);
      alert('Error fetching receipt.');
    } finally {
      setLoadingReceipt(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleVendorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setVendorLoading(true);
    try {
      const response = await fetch('/api/vendor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          ...vendorForm
        })
      });
      if (response.ok) {
        setIsVendorModalOpen(false);
        alert('Vendor registration submitted successfully! Your account will be reviewed.');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error registering as vendor:', error);
    } finally {
      setVendorLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setIsResetting(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentUser?.uid, newPassword })
      });
      if (response.ok) {
        alert('Password reset successfully!');
        setNewPassword('');
      }
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setIsResetting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <p className="text-stone-500 dark:text-stone-400">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors duration-300 py-12">
      {/* Banner Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="relative h-48 md:h-64 w-full rounded-[2.5rem] overflow-hidden bg-stone-200 dark:bg-stone-800 border border-stone-200 dark:border-stone-800 shadow-sm">
          {profile?.bannerURL ? (
            <img 
              src={profile.bannerURL} 
              alt="Profile Banner" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 flex items-center justify-center">
              <p className="text-stone-400 dark:text-stone-600 font-serif italic">No banner image set</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-stone-900 p-8 rounded-[2rem] border border-stone-200 dark:border-stone-800 text-center shadow-sm">
              <img 
                src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=random`} 
                alt="" 
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-orange-100 dark:border-orange-900/30"
              />
              <h2 className="text-xl font-bold text-stone-900 dark:text-white">{currentUser.displayName}</h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm mb-4 capitalize">{profile?.role || 'Devotee'}</p>
              
              {profile?.bio && (
                <p className="text-stone-600 dark:text-stone-400 text-sm mb-6 italic line-clamp-3">
                  "{profile.bio}"
                </p>
              )}
              
              <div className="space-y-3 text-left">
                <div className="flex items-center text-sm text-stone-600 dark:text-stone-400">
                  <Mail className="w-4 h-4 mr-2 text-stone-400" />
                  <span className="truncate">{currentUser.email}</span>
                </div>
                {profile?.phoneNumber && (
                  <div className="flex items-center text-sm text-stone-600 dark:text-stone-400">
                    <Phone className="w-4 h-4 mr-2 text-stone-400" />
                    <span>{profile.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <nav className="bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${activeTab === 'profile' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
              >
                <User className="w-5 h-5 mr-3" />
                My Profile
              </button>
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${activeTab === 'bookings' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
              >
                <Calendar className="w-5 h-5 mr-3" />
                My Bookings
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${activeTab === 'orders' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
              >
                <Package className="w-5 h-5 mr-3" />
                My Orders
              </button>
              {profile?.role === 'vendor' && (
                <button 
                  onClick={() => window.location.href = '/vendor'}
                  className="w-full flex items-center px-6 py-4 text-sm font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Vendor Dashboard
                </button>
              )}
              {profile?.role === 'admin' && (
                <button 
                  onClick={() => window.location.href = '/admin'}
                  className="w-full flex items-center px-6 py-4 text-sm font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Admin Dashboard
                </button>
              )}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 min-h-[600px] overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
                <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
                  {activeTab === 'bookings' ? 'Service Bookings' : activeTab === 'orders' ? 'Order History' : 'Account Settings'}
                </h3>
                <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-3 py-1 rounded-full text-xs font-bold">
                  {activeTab === 'bookings' ? bookings.length : activeTab === 'orders' ? orders.length : 'Security'}
                </span>
              </div>

              <div className="p-8">
                {activeTab === 'profile' ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Full Name</label>
                        <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700 font-bold text-stone-900 dark:text-white">
                          {currentUser.displayName}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Email Address</label>
                        <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700 font-bold text-stone-900 dark:text-white">
                          {currentUser.email}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Banner URL</label>
                        <input 
                          type="text"
                          value={profile?.bannerURL || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, bannerURL: e.target.value } : null)}
                          placeholder="https://example.com/banner.jpg"
                          className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Short Bio</label>
                        <input 
                          type="text"
                          value={profile?.bio || ''}
                          onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                          placeholder="A short bio about yourself"
                          className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Default Shipping Address</label>
                      <textarea 
                        value={profile?.address || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, address: e.target.value } : null)}
                        placeholder="No address saved yet."
                        className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none h-24 font-medium text-stone-900 dark:text-white"
                      />
                      <button 
                        onClick={async () => {
                          if (profile) {
                            try {
                              const response = await fetch(`/api/users/${currentUser.uid}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  address: profile.address,
                                  bio: profile.bio,
                                  bannerURL: profile.bannerURL
                                }),
                              });
                              if (response.ok) {
                                alert('Profile updated successfully!');
                              }
                            } catch (error) {
                              console.error('Error updating profile:', error);
                              alert('Failed to update profile.');
                            }
                          }
                        }}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        Save Profile Changes
                      </button>
                    </div>

                    <div className="pt-8 border-t border-stone-100 dark:border-stone-800">
                      <h4 className="text-sm font-bold text-stone-900 dark:text-white mb-4">Vendor Account</h4>
                      {profile?.role === 'vendor' || profile?.vendorStatus === 'rejected' ? (
                        <div className={`p-4 border rounded-2xl flex items-center justify-between ${
                          profile.vendorStatus === 'pending' 
                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30' 
                            : profile.vendorStatus === 'rejected'
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30'
                            : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white dark:bg-stone-800 rounded-xl shadow-sm">
                              <Store className={`w-5 h-5 ${
                                profile.vendorStatus === 'pending' ? 'text-amber-600' : 
                                profile.vendorStatus === 'rejected' ? 'text-red-600' : 'text-green-600'
                              }`} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-stone-900 dark:text-white">
                                {profile.vendorStatus === 'pending' ? 'Registration Pending' : 
                                 profile.vendorStatus === 'rejected' ? 'Registration Rejected' : 'You are a Vendor'}
                              </p>
                              <p className="text-xs text-stone-500 dark:text-stone-400">
                                {profile.vendorStatus === 'pending' 
                                  ? 'Your application is being reviewed by our team' 
                                  : profile.vendorStatus === 'rejected'
                                  ? 'Your application was rejected. You can try re-applying.'
                                  : 'Access your dashboard to manage products and services'}
                              </p>
                            </div>
                          </div>
                          {profile.vendorStatus === 'approved' && (
                            <button 
                              onClick={() => window.location.href = '/vendor'}
                              className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors"
                            >
                              Go to Dashboard
                            </button>
                          )}
                          {profile.vendorStatus === 'rejected' && (
                            <button 
                              onClick={() => setIsVendorModalOpen(true)}
                              className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-colors"
                            >
                              Re-apply
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white dark:bg-stone-800 rounded-xl shadow-sm">
                              <Briefcase className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-stone-900 dark:text-white">Become a Vendor</p>
                              <p className="text-xs text-stone-500 dark:text-stone-400">Start selling your spiritual products or services</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setIsVendorModalOpen(true)}
                            className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition-colors"
                          >
                            Register Now
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-8 border-t border-stone-100 dark:border-stone-800">
                      <h4 className="text-lg font-bold text-stone-900 dark:text-white mb-6">Appearance</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'light', label: 'Light', icon: Sun },
                          { id: 'dark', label: 'Dark', icon: Moon },
                          { id: 'system', label: 'System', icon: Monitor },
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setTheme(t.id as any)}
                            className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                              theme === t.id 
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600' 
                                : 'border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:border-stone-200 dark:hover:border-stone-700'
                            }`}
                          >
                            <t.icon className="w-6 h-6 mb-2" />
                            <span className="text-xs font-bold">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-stone-100 dark:border-stone-800">
                      <h4 className="text-lg font-bold text-stone-900 dark:text-white mb-6">Reset Password</h4>
                      <form onSubmit={handleResetPassword} className="max-w-md space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">New Password</label>
                          <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all dark:text-white"
                          />
                        </div>
                        <button 
                          type="submit"
                          disabled={isResetting}
                          className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-8 py-3 rounded-2xl font-bold hover:bg-orange-500 dark:hover:bg-orange-500 transition-colors disabled:opacity-50"
                        >
                          {isResetting ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    </div>
                  </div>
                ) : activeTab === 'bookings' ? (
                  <div className="space-y-4">
                    {bookings.length === 0 ? (
                      <div className="text-center py-20">
                        <Calendar className="w-12 h-12 text-stone-200 dark:text-stone-800 mx-auto mb-4" />
                        <p className="text-stone-400 dark:text-stone-500">No bookings found.</p>
                      </div>
                    ) : (
                      bookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-6 rounded-2xl border border-stone-100 dark:border-stone-800 hover:border-orange-100 dark:hover:border-orange-900/30 transition-colors bg-white dark:bg-stone-900">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <h4 className="font-bold text-stone-900 dark:text-white capitalize">{booking.type} Booking</h4>
                              <p className="text-xs text-stone-500 dark:text-stone-400">{booking.date} at {booking.timeSlot}</p>
                              <div className="flex items-center mt-1 space-x-2">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                  booking.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 
                                  booking.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                                }`}>
                                  {booking.status}
                                </span>
                                {booking.isOnline && (
                                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">Online</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-bold text-stone-900 dark:text-white">₹{booking.totalAmount}</p>
                            </div>
                            <button 
                              onClick={() => handleFetchReceipt('booking', booking.id)}
                              className="p-2 text-stone-400 hover:text-orange-500 transition-colors"
                              title="Download Receipt"
                            >
                              <FileText className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <div className="text-center py-20">
                        <Package className="w-12 h-12 text-stone-200 dark:text-stone-800 mx-auto mb-4" />
                        <p className="text-stone-400 dark:text-stone-500">No orders found.</p>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div key={order.id} className="p-6 rounded-2xl border border-stone-100 dark:border-stone-800 hover:border-orange-100 dark:hover:border-orange-900/30 transition-colors bg-white dark:bg-stone-900">
                          <div className="flex justify-between mb-4">
                            <span className="text-xs font-bold text-stone-400 dark:text-stone-500">Order #{order.id.toString().slice(-6).toUpperCase()}</span>
                            <span className="text-xs text-stone-500 dark:text-stone-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-sm font-bold text-stone-900 dark:text-white">{order.items.length} Items</p>
                              <p className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-[200px]">{order.shippingAddress}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="font-bold text-stone-900 dark:text-white">₹{order.totalAmount}</p>
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                  {order.status}
                                </span>
                              </div>
                              <button 
                                onClick={() => handleFetchReceipt('order', order.id)}
                                className="p-2 text-stone-400 hover:text-orange-500 transition-colors"
                                title="Download Receipt"
                              >
                                <FileText className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm print:bg-white print:p-0">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl print:shadow-none print:rounded-none">
            <div className="p-8 border-b border-stone-100 flex justify-between items-center print:hidden">
              <h3 className="text-xl font-serif font-bold text-stone-900">Digital Receipt</h3>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handlePrint}
                  className="flex items-center text-sm font-bold text-stone-600 hover:text-orange-600 transition-colors"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </button>
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-12 print:p-8" id="printable-receipt">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">DivineConnect</h2>
                <p className="text-stone-500 text-sm">Your Spiritual Companion</p>
                <div className="mt-4 inline-block px-4 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest">
                  Official Receipt
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-12 text-sm">
                <div>
                  <p className="text-stone-400 uppercase text-[10px] font-bold tracking-wider mb-1">Receipt ID</p>
                  <p className="font-bold text-stone-900">{selectedReceipt.receiptId}</p>
                </div>
                <div className="text-right">
                  <p className="text-stone-400 uppercase text-[10px] font-bold tracking-wider mb-1">Date</p>
                  <p className="font-bold text-stone-900">{new Date(selectedReceipt.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-stone-400 uppercase text-[10px] font-bold tracking-wider mb-1">Customer</p>
                  <p className="font-bold text-stone-900">{selectedReceipt.customer}</p>
                  <p className="text-stone-500">{selectedReceipt.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-stone-400 uppercase text-[10px] font-bold tracking-wider mb-1">Status</p>
                  <p className="font-bold text-emerald-600 uppercase">{selectedReceipt.status}</p>
                </div>
              </div>

              <div className="border-t border-b border-stone-100 py-8 mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      <th className="pb-4">Description</th>
                      <th className="pb-4 text-center">Qty</th>
                      <th className="pb-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-stone-900 font-medium">
                    {selectedReceipt.item ? (
                      <tr>
                        <td className="py-2">
                          <p className="font-bold">{selectedReceipt.item}</p>
                          <p className="text-xs text-stone-500">{selectedReceipt.type} Service • {selectedReceipt.samagriStatus}</p>
                        </td>
                        <td className="py-2 text-center">1</td>
                        <td className="py-2 text-right">₹{selectedReceipt.amount}</td>
                      </tr>
                    ) : (
                      selectedReceipt.items?.map((item, i) => (
                        <tr key={i}>
                          <td className="py-2 font-bold">{item.name}</td>
                          <td className="py-2 text-center">{item.qty}</td>
                          <td className="py-2 text-right">₹{item.price * item.qty}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-12">
                <div className="w-48 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Subtotal</span>
                    <span className="font-bold text-stone-900">₹{selectedReceipt.amount || selectedReceipt.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Tax (GST 5%)</span>
                    <span className="font-bold text-stone-900">₹0.00</span>
                  </div>
                  <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
                    <span className="text-stone-900 font-bold">Total</span>
                    <span className="text-xl font-serif font-bold text-orange-600">₹{selectedReceipt.amount || selectedReceipt.total}</span>
                  </div>
                </div>
              </div>

              {selectedReceipt.samagriList && (
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 mb-8">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">Required Samagri List</h4>
                  <p className="text-xs text-stone-600 leading-relaxed italic">
                    {selectedReceipt.samagriList}
                  </p>
                </div>
              )}

              {selectedReceipt.address && (
                <div className="mb-8">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Shipping Address</h4>
                  <p className="text-sm text-stone-600">{selectedReceipt.address}</p>
                </div>
              )}

              <div className="text-center pt-8 border-t border-stone-100">
                <p className="text-xs text-stone-400">Thank you for choosing DivineConnect. May your journey be blessed.</p>
                <p className="text-[10px] text-stone-300 mt-2">This is a computer-generated receipt and does not require a physical signature.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Vendor Registration Modal */}
      <AnimatePresence>
        {isVendorModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVendorModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 sm:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-stone-900">Become a Vendor</h2>
                    <p className="text-stone-500 text-sm">Join our community of spiritual service providers</p>
                  </div>
                  <button onClick={() => setIsVendorModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-900">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleVendorRegister} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Business/Pandit Name</label>
                    <input
                      type="text"
                      required
                      value={vendorForm.businessName}
                      onChange={(e) => setVendorForm({ ...vendorForm, businessName: e.target.value })}
                      className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="e.g., Pandit Sharma or Spiritual Store"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Business Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setVendorForm({ ...vendorForm, businessType: 'Pandit' })}
                        className={`p-4 rounded-2xl border flex items-center justify-center space-x-2 transition-all ${vendorForm.businessType === 'Pandit' ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-white border-stone-100 text-stone-500'}`}
                      >
                        <User className="w-5 h-5" />
                        <span className="font-bold">Pandit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVendorForm({ ...vendorForm, businessType: 'Shop' })}
                        className={`p-4 rounded-2xl border flex items-center justify-center space-x-2 transition-all ${vendorForm.businessType === 'Shop' ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-white border-stone-100 text-stone-500'}`}
                      >
                        <ShoppingBag className="w-5 h-5" />
                        <span className="font-bold">Shop</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Description</label>
                    <textarea
                      required
                      value={vendorForm.description}
                      onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
                      className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none h-32 resize-none"
                      placeholder="Tell us about your services or products..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={vendorLoading}
                    className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {vendorLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Briefcase className="w-5 h-5" />
                        <span>Submit Registration</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
