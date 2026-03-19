import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { UserProfile, Booking, Order } from '../types';
import { User, Package, Calendar, Settings, Phone, Mail } from 'lucide-react';

export default function Profile() {
  const currentUser = auth?.currentUser;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'orders' | 'profile'>('bookings');
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-stone-500">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-stone-200 text-center">
            <img 
              src={currentUser.photoURL || ''} 
              alt="" 
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-orange-100"
            />
            <h2 className="text-xl font-bold text-stone-900">{currentUser.displayName}</h2>
            <p className="text-stone-500 text-sm mb-6 capitalize">{profile?.role || 'Devotee'}</p>
            
            <div className="space-y-3 text-left">
              <div className="flex items-center text-sm text-stone-600">
                <Mail className="w-4 h-4 mr-2 text-stone-400" />
                <span className="truncate">{currentUser.email}</span>
              </div>
              {profile?.phoneNumber && (
                <div className="flex items-center text-sm text-stone-600">
                  <Phone className="w-4 h-4 mr-2 text-stone-400" />
                  <span>{profile.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>

          <nav className="bg-white rounded-[2rem] border border-stone-200 overflow-hidden">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${activeTab === 'profile' ? 'bg-orange-50 text-orange-600' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              <User className="w-5 h-5 mr-3" />
              My Profile
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${activeTab === 'bookings' ? 'bg-orange-50 text-orange-600' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              <Calendar className="w-5 h-5 mr-3" />
              My Bookings
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center px-6 py-4 text-sm font-bold transition-colors ${activeTab === 'orders' ? 'bg-orange-50 text-orange-600' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              <Package className="w-5 h-5 mr-3" />
              My Orders
            </button>
            {profile?.role === 'vendor' && (
              <button 
                onClick={() => window.location.href = '/vendor'}
                className="w-full flex items-center px-6 py-4 text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <Settings className="w-5 h-5 mr-3" />
                Vendor Dashboard
              </button>
            )}
            {profile?.role === 'admin' && (
              <button 
                onClick={() => window.location.href = '/admin'}
                className="w-full flex items-center px-6 py-4 text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <Settings className="w-5 h-5 mr-3" />
                Admin Dashboard
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] border border-stone-200 min-h-[600px] overflow-hidden">
            <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center">
              <h3 className="text-xl font-serif font-bold text-stone-900">
                {activeTab === 'bookings' ? 'Service Bookings' : activeTab === 'orders' ? 'Order History' : 'Account Settings'}
              </h3>
              <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold">
                {activeTab === 'bookings' ? bookings.length : activeTab === 'orders' ? orders.length : 'Security'}
              </span>
            </div>

            <div className="p-8">
              {activeTab === 'profile' ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Full Name</label>
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 font-bold text-stone-900">
                        {currentUser.displayName}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Email Address</label>
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 font-bold text-stone-900">
                        {currentUser.email}
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-stone-100">
                    <h4 className="text-lg font-bold text-stone-900 mb-6">Reset Password</h4>
                    <form onSubmit={handleResetPassword} className="max-w-md space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">New Password</label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isResetting}
                        className="bg-stone-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-500 transition-colors disabled:opacity-50"
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
                      <Calendar className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                      <p className="text-stone-400">No bookings found.</p>
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-6 rounded-2xl border border-stone-100 hover:border-orange-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-stone-900 capitalize">{booking.type} Booking</h4>
                            <p className="text-xs text-stone-500">{booking.date} at {booking.timeSlot}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-stone-900">₹{booking.totalAmount}</p>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                            booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-20">
                      <Package className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                      <p className="text-stone-400">No orders found.</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="p-6 rounded-2xl border border-stone-100">
                        <div className="flex justify-between mb-4">
                          <span className="text-xs font-bold text-stone-400">Order #{order.id.slice(-6).toUpperCase()}</span>
                          <span className="text-xs text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-sm font-bold text-stone-900">{order.items.length} Items</p>
                            <p className="text-xs text-stone-500 truncate max-w-[200px]">{order.shippingAddress}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-stone-900">₹{order.totalAmount}</p>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {order.status}
                            </span>
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
  );
}
