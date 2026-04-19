import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IndianRupee, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  History, 
  Plus, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ChevronRight,
  Store,
  Package,
  Calendar,
  Settings
} from 'lucide-react';
import { formatIndianRupees } from '../lib/utils';

export default function VendorDashboard() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'transactions' | 'payouts'>('overview');
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    accountHolder: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    if (!currentUser) return;
    try {
      const [walletRes, bookingsRes, waBookingsRes, payoutsRes] = await Promise.all([
        fetch(`/api/vendor/wallet/${currentUser.uid}`),
        fetch(`/api/vendor/bookings/${currentUser.uid}`),
        fetch(`/api/vendor/whatsapp-bookings/${currentUser.uid}`),
        fetch(`/api/vendor/payouts/${currentUser.uid}`)
      ]);

      if (walletRes.ok) {
        const data = await walletRes.json();
        setWallet(data);
        setTransactions(data.transactions || []);
      }
      
      let allBookings: any[] = [];
      if (bookingsRes.ok) {
        const regularBookings = await bookingsRes.json();
        allBookings = [...allBookings, ...regularBookings.map((b: any) => ({ ...b, source: 'Regular' }))];
      }
      if (waBookingsRes.ok) {
        const waBookings = await waBookingsRes.json();
        allBookings = [...allBookings, ...waBookings.map((b: any) => ({ ...b, source: 'WhatsApp', type: 'puja' }))];
      }
      setBookings(allBookings.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()));

      if (payoutsRes.ok) {
        setPayouts(await payoutsRes.json());
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const handleUpdateBookingStatus = async (id: string, status: string, source: string) => {
    try {
      const endpoint = source === 'WhatsApp' 
        ? `/api/whatsapp-bookings/${id}/status`
        : `/api/bookings/${id}/status`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        alert(`Booking ${status} successfully!`);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handlePayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !wallet) return;
    
    if (Number(payoutAmount) > wallet.balance) {
      alert('Insufficient balance');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/vendor/payout/${currentUser.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(payoutAmount),
          bankDetails
        })
      });

      if (response.ok) {
        alert('Payout request submitted successfully!');
        setIsPayoutModalOpen(false);
        setPayoutAmount('');
        fetchData();
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'vendor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <p className="text-stone-500">Access denied. Vendor privileges required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-2">Vendor Dashboard</h1>
            <p className="text-stone-600 dark:text-stone-400">Manage your earnings, payouts, and business performance.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => window.location.href = '/profile'}
              className="px-6 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 rounded-2xl font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-all flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button 
              onClick={() => setIsPayoutModalOpen(true)}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              Request Payout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-stone-100 dark:bg-stone-900 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'bookings' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
          >
            Bookings
            {bookings.filter(b => b.status === 'pending').length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-[10px] rounded-full">
                {bookings.filter(b => b.status === 'pending').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'transactions' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
          >
            Transactions
          </button>
          <button 
            onClick={() => setActiveTab('payouts')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'payouts' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
          >
            Payouts
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                  <Wallet className="w-20 h-20 text-orange-500" />
                </div>
                <p className="text-stone-500 dark:text-stone-400 text-sm font-bold uppercase tracking-wider mb-2">Available Balance</p>
                <h2 className="text-4xl font-serif font-bold text-stone-900 dark:text-white flex items-baseline gap-2">
                  <span className="text-2xl text-orange-500">₹</span>
                  {wallet?.balance?.toLocaleString() || '0'}
                </h2>
                <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-bold">
                  <TrendingUp className="w-4 h-4" />
                  <span>Ready for payout</span>
                </div>
              </div>

              <div className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-20 h-20 text-emerald-500" />
                </div>
                <p className="text-stone-500 dark:text-stone-400 text-sm font-bold uppercase tracking-wider mb-2">Total Earnings</p>
                <h2 className="text-4xl font-serif font-bold text-stone-900 dark:text-white flex items-baseline gap-2">
                  <span className="text-2xl text-emerald-500">₹</span>
                  {wallet?.totalEarned?.toLocaleString() || '0'}
                </h2>
                <p className="mt-4 text-stone-400 text-sm">Lifetime earnings on PunyaSeva</p>
              </div>

              <div className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                  <History className="w-20 h-20 text-blue-500" />
                </div>
                <p className="text-stone-500 dark:text-stone-400 text-sm font-bold uppercase tracking-wider mb-2">Active Orders/Bookings</p>
                <h2 className="text-4xl font-serif font-bold text-stone-900 dark:text-white">
                  {transactions.filter(t => t.type === 'order' || t.type === 'booking').length}
                </h2>
                <p className="mt-4 text-stone-400 text-sm">Recent business activity</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Transactions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
                  <div className="px-8 py-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
                    <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
                      <History className="w-5 h-5 text-orange-500" />
                      Recent Transactions
                    </h3>
                    <button onClick={() => setActiveTab('transactions')} className="text-sm font-bold text-orange-600 hover:text-orange-700">View All</button>
                  </div>
                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {transactions.length === 0 ? (
                      <div className="p-12 text-center">
                        <History className="w-12 h-12 text-stone-200 dark:text-stone-800 mx-auto mb-4" />
                        <p className="text-stone-500 dark:text-stone-400">No transactions found.</p>
                      </div>
                    ) : (
                      transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="p-6 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${tx.amount > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                              {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-bold text-stone-900 dark:text-white capitalize">{tx.type} Earning</p>
                              <p className="text-xs text-stone-500 dark:text-stone-400">{new Date(tx.createdAt).toLocaleDateString()} • Ref: {tx.referenceId?.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {tx.amount > 0 ? '+' : ''}₹{tx.amount}
                            </p>
                            <p className="text-[10px] text-stone-400 uppercase font-bold">Commission: ₹{tx.commission || 0}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Payout History */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
                  <div className="px-8 py-6 border-b border-stone-100 dark:border-stone-800">
                    <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
                      <ArrowUpRight className="w-5 h-5 text-orange-500" />
                      Payout History
                    </h3>
                  </div>
                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {payouts.length === 0 ? (
                      <div className="p-12 text-center">
                        <Clock className="w-10 h-10 text-stone-200 dark:text-stone-800 mx-auto mb-4" />
                        <p className="text-stone-500 dark:text-stone-400 text-sm">No payout history.</p>
                      </div>
                    ) : (
                      payouts.slice(0, 3).map((payout) => (
                        <div key={payout.id} className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-stone-900 dark:text-white">₹{payout.amount}</p>
                              <p className="text-[10px] text-stone-500 dark:text-stone-400">{new Date(payout.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              payout.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700' :
                              payout.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700' :
                              'bg-amber-100 dark:bg-amber-900/30 text-amber-700'
                            }`}>
                              {payout.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-orange-500 rounded-[2.5rem] p-8 text-white shadow-lg shadow-orange-500/20">
                  <h4 className="text-xl font-serif font-bold mb-4">Need Help?</h4>
                  <p className="text-orange-100 text-sm mb-6">Our vendor support team is available 24/7 to help you with your business.</p>
                  <button className="w-full py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-all">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 shadow-sm">
              <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-2">Manage Bookings</h3>
              <p className="text-stone-500 dark:text-stone-400">Approve or reject booking requests from devotees.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {bookings.length === 0 ? (
                <div className="bg-white dark:bg-stone-900 p-12 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 text-center shadow-sm">
                  <Calendar className="w-12 h-12 text-stone-200 dark:text-stone-800 mx-auto mb-4" />
                  <p className="text-stone-500 dark:text-stone-400">No bookings found.</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="bg-white dark:bg-stone-900 p-6 rounded-[2rem] border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600">
                        <Calendar className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-bold text-stone-900 dark:text-white capitalize">{booking.type || booking.pujaTitle} Booking</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            booking.source === 'WhatsApp' ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700'
                          }`}>
                            {booking.source}
                          </span>
                        </div>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          {booking.date ? `${booking.date} at ${booking.timeSlot}` : `Requested on ${new Date(booking.createdAt).toLocaleDateString()}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ['confirmed', 'approved'].includes(booking.status) ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700' :
                            ['rejected', 'cancelled'].includes(booking.status) ? 'bg-red-100 dark:bg-red-900/30 text-red-700' :
                            'bg-orange-100 dark:bg-orange-900/30 text-orange-700'
                          }`}>
                            {booking.status}
                          </span>
                          <span className="text-xs text-stone-400">Amount: ₹{booking.totalAmount || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleUpdateBookingStatus(booking.id, booking.source === 'WhatsApp' ? 'approved' : 'confirmed', booking.source)}
                            className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {booking.source === 'WhatsApp' ? 'Approve' : 'Confirm'}
                          </button>
                          <button 
                            onClick={() => handleUpdateBookingStatus(booking.id, 'rejected', booking.source)}
                            className="flex-1 md:flex-none px-6 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                      {['confirmed', 'approved'].includes(booking.status) && (
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          {booking.status === 'approved' ? 'Approved' : 'Confirmed'}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-stone-100 dark:border-stone-800">
                <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white">All Transactions</h3>
              </div>
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {transactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <History className="w-12 h-12 text-stone-200 dark:text-stone-800 mx-auto mb-4" />
                    <p className="text-stone-500 dark:text-stone-400">No transactions found.</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="p-6 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${tx.amount > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                          {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 dark:text-white capitalize">{tx.type} Earning</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">{new Date(tx.createdAt).toLocaleDateString()} • Ref: {tx.referenceId?.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {tx.amount > 0 ? '+' : ''}₹{tx.amount}
                        </p>
                        <p className="text-[10px] text-stone-400 uppercase font-bold">Commission: ₹{tx.commission || 0}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-stone-100 dark:border-stone-800">
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white">Payout History</h3>
                </div>
                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  {payouts.length === 0 ? (
                    <div className="p-12 text-center">
                      <Clock className="w-10 h-10 text-stone-200 dark:text-stone-800 mx-auto mb-4" />
                      <p className="text-stone-500 dark:text-stone-400 text-sm">No payout history.</p>
                    </div>
                  ) : (
                    payouts.map((payout) => (
                      <div key={payout.id} className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-stone-900 dark:text-white">₹{payout.amount}</p>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400">{new Date(payout.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            payout.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700' :
                            payout.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700' :
                            'bg-amber-100 dark:bg-amber-900/30 text-amber-700'
                          }`}>
                            {payout.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="bg-orange-500 rounded-[2.5rem] p-8 text-white shadow-lg shadow-orange-500/20 h-fit">
              <h4 className="text-xl font-serif font-bold mb-4">Payout Info</h4>
              <p className="text-orange-100 text-sm mb-6">Payouts are processed within 3-5 business days after approval.</p>
              <button 
                onClick={() => setIsPayoutModalOpen(true)}
                className="w-full py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-all"
              >
                Request New Payout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      <AnimatePresence>
        {isPayoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-stone-200 dark:border-stone-800"
            >
              <div className="p-8 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">Request Payout</h2>
                <button onClick={() => setIsPayoutModalOpen(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
                  <XCircle className="w-6 h-6 text-stone-400" />
                </button>
              </div>

              <form onSubmit={handlePayoutRequest} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Amount to Withdraw (₹)</label>
                  <input
                    required
                    type="number"
                    min="100"
                    max={wallet?.balance || 0}
                    className="w-full px-4 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-2xl font-bold text-stone-900 dark:text-white"
                    placeholder="0.00"
                    value={payoutAmount}
                    onChange={e => setPayoutAmount(e.target.value)}
                  />
                  <p className="text-xs text-stone-500">Available: ₹{wallet?.balance || 0}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Bank Details</p>
                  <div className="space-y-3">
                    <input
                      required
                      type="text"
                      placeholder="Account Holder Name"
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                      value={bankDetails.accountHolder}
                      onChange={e => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                    />
                    <input
                      required
                      type="text"
                      placeholder="Account Number"
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                      value={bankDetails.accountNumber}
                      onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    />
                    <input
                      required
                      type="text"
                      placeholder="IFSC Code"
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                      value={bankDetails.ifscCode}
                      onChange={e => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !payoutAmount || Number(payoutAmount) < 100}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Confirm Request
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
