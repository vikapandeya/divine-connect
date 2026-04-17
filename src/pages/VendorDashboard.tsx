import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Product, Puja, Booking } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Plus, Edit2, Trash2, X, Save, Package, IndianRupee, Star, Calendar, Clock, User, CheckCircle, XCircle, ChevronLeft, ChevronRight, List, Filter, TrendingUp, LayoutDashboard, Wallet, Menu, Settings, LogOut } from 'lucide-react';
import { useToast } from '../components/Toast';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay
} from 'date-fns';

export default function VendorDashboard() {
  const { toast } = useToast();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'pujas' | 'bookings' | 'wallet'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vendorStats, setVendorStats] = useState({
    totalProducts: 0,
    totalBookings: 0,
    lastBookingPrice: 0,
    balance: 0,
    totalEarned: 0,
    performance: [] as { month: string; bookings: number; revenue: number }[]
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  });

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: ''
  });

  const [pujaForm, setPujaForm] = useState({
    title: '',
    description: '',
    price: '',
    duration: ''
  });

  const [vendor, setVendor] = useState<any>(null);

  // Calendar & Filtering states
  const [bookingView, setBookingView] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const vendorId = currentUser.uid;
      
      const [prodRes, pujaRes, bookRes, statsRes, walletRes, vendorRes] = await Promise.all([
        fetch(`/api/products?vendorId=${vendorId}`),
        fetch(`/api/pujas?vendorId=${vendorId}`),
        fetch(`/api/vendor/bookings/${vendorId}`),
        fetch(`/api/vendor/stats/${vendorId}`),
        fetch(`/api/vendor/wallet/${vendorId}`),
        fetch(`/api/vendors/${vendorId}`)
      ]);

      if (prodRes.ok) setProducts(await prodRes.json());
      if (pujaRes.ok) setPujas(await pujaRes.json());
      if (bookRes.ok) setBookings(await bookRes.json());
      if (statsRes.ok) setVendorStats(await statsRes.json());
      if (walletRes.ok) setWallet(await walletRes.json());
      if (vendorRes.ok) setVendor(await vendorRes.json());
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

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-stone-500">Please sign in to access the vendor dashboard.</p>
      </div>
    );
  }

  const handleOpenModal = (item?: any) => {
    if (activeTab === 'products') {
      if (item) {
        setEditingItem(item);
        setProductForm({
          name: item.name,
          description: item.description,
          price: item.price.toString(),
          category: item.category,
          stock: item.stock.toString(),
          image: item.image
        });
      } else {
        setEditingItem(null);
        setProductForm({ name: '', description: '', price: '', category: '', stock: '', image: '' });
      }
    } else if (activeTab === 'pujas') {
      if (item) {
        setEditingItem(item);
        setPujaForm({
          title: item.title,
          description: item.description,
          price: item.price.toString(),
          duration: item.duration
        });
      } else {
        setEditingItem(null);
        setPujaForm({ title: '', description: '', price: '', duration: '' });
      }
    }
    setIsModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(productForm.price);
    const stock = parseInt(productForm.stock);

    if (isNaN(price) || price <= 0) {
      toast('Please enter a valid positive price.', 'warning');
      return;
    }

    if (isNaN(stock) || stock < 0) {
      toast('Please enter a valid stock quantity (0 or more).', 'warning');
      return;
    }

    const url = editingItem ? `/api/products/${editingItem.id}` : '/api/products';
    const method = editingItem ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          price,
          stock,
          rating: editingItem?.rating || 4.5,
          vendorId: currentUser?.uid
        })
      });
      if (response.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handlePujaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(pujaForm.price);

    if (isNaN(price) || price <= 0) {
      toast('Please enter a valid positive price.', 'warning');
      return;
    }

    const url = editingItem ? `/api/pujas/${editingItem.id}` : '/api/pujas';
    const method = editingItem ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pujaForm,
          price,
          vendorId: currentUser?.uid
        })
      });
      if (response.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving puja:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    const url = activeTab === 'products' ? `/api/products/${id}` : `/api/pujas/${id}`;
    try {
      const response = await fetch(url, { method: 'DELETE' });
      if (response.ok) fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) fetchData();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/vendor/payout/${currentUser.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(payoutForm.amount),
          bankDetails: {
            bankName: payoutForm.bankName,
            accountNumber: payoutForm.accountNumber,
            ifscCode: payoutForm.ifscCode
          }
        })
      });
      if (response.ok) {
        setIsPayoutModalOpen(false);
        setPayoutForm({ amount: '', bankName: '', accountNumber: '', ifscCode: '' });
        fetchData();
      } else {
        const err = await response.json();
        toast(err.error || "Payout failed", 'error');
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const statusMatch = filterStatus === 'all' || b.status === filterStatus;
    const bookingDate = parseISO(b.date);
    const dateMatch = isWithinInterval(bookingDate, {
      start: startOfDay(parseISO(dateRange.start)),
      end: endOfDay(parseISO(dateRange.end))
    });
    return statusMatch && dateMatch;
  });

  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const getBookingsForDay = (day: Date) => {
    return bookings.filter(b => {
      const bDate = parseISO(b.date);
      return isSameDay(bDate, day) && (filterStatus === 'all' || b.status === filterStatus);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-4xl font-serif font-bold text-stone-900">Vendor Dashboard</h1>
            {vendor?.isVerified && (
              <div className="bg-blue-100 text-blue-600 p-1 rounded-full" title="Verified Vendor">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}
          </div>
          <p className="text-stone-600">Manage your divine offerings and bookings.</p>
        </div>
        <div className="flex bg-stone-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Products
          </button>
          <button 
            onClick={() => setActiveTab('pujas')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'pujas' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Pujas
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'bookings' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Bookings
          </button>
          <button 
            onClick={() => setActiveTab('wallet')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'wallet' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Wallet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Products</p>
              <p className="text-2xl font-bold text-stone-900">{vendorStats.totalProducts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Bookings</p>
              <p className="text-2xl font-bold text-stone-900">{vendorStats.totalBookings}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Withdrawable Balance</p>
              <p className="text-2xl font-bold text-stone-900">₹{vendorStats.balance.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Revenue Performance</h3>
              <p className="text-sm text-stone-500">Monthly revenue trends</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vendorStats.performance}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#78716c', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#78716c', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Booking Trends</h3>
              <p className="text-sm text-stone-500">Monthly booking volume</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-xl">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorStats.performance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#78716c', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#78716c', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="bookings" 
                  fill="#a855f7" 
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mb-8 flex justify-end">
        {activeTab === 'wallet' ? (
          <button 
            onClick={() => setIsPayoutModalOpen(true)}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
          >
            <IndianRupee className="w-5 h-5" />
            <span className="font-bold">Request Payout</span>
          </button>
        ) : activeTab !== 'bookings' && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-5 h-5" />
            <span className="font-bold">Add {activeTab === 'products' ? 'Product' : 'Puja'}</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
          {activeTab === 'products' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Product</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Stock</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={p.image || null} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <span className="font-bold text-stone-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-orange-600">₹{p.price}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${p.stock <= 5 ? 'text-red-500 flex items-center gap-1' : 'text-stone-600'}`}>
                          {p.stock}
                          {p.stock <= 5 && <span className="text-[10px] bg-red-100 px-1.5 py-0.5 rounded uppercase">Low Stock</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => window.open(`/product/${p.id}`, '_blank')} 
                            className="p-2 text-stone-400 hover:text-blue-500"
                            title="View Product Details"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleOpenModal(p)} className="p-2 text-stone-400 hover:text-orange-500"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-stone-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'pujas' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Puja Title</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Duration</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {pujas.map(p => (
                    <tr key={p.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-stone-900">{p.title}</span>
                          {p.isLive && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold uppercase w-fit animate-pulse">Live</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-orange-600">₹{p.price}</td>
                      <td className="px-6 py-4 text-stone-600">{p.duration}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => window.open(`/pujas/${p.id}`, '_blank')} 
                            className="p-2 text-stone-400 hover:text-blue-500"
                            title="View Puja Details"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleOpenModal(p)} className="p-2 text-stone-400 hover:text-orange-500"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-stone-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* Filters & View Toggle */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-stone-200 shadow-sm">
                    <button 
                      onClick={() => setBookingView('list')}
                      className={`p-2 rounded-lg transition-all ${bookingView === 'list' ? 'bg-orange-500 text-white shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setBookingView('calendar')}
                      className={`p-2 rounded-lg transition-all ${bookingView === 'calendar' ? 'bg-orange-500 text-white shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-stone-400" />
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium text-stone-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {bookingView === 'list' && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-stone-400" />
                      <div className="flex items-center gap-1">
                        <input 
                          type="date" 
                          value={dateRange.start}
                          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                          className="bg-white border border-stone-200 rounded-xl px-2 py-1.5 text-xs font-medium text-stone-700 outline-none"
                        />
                        <span className="text-stone-400">-</span>
                        <input 
                          type="date" 
                          value={dateRange.end}
                          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                          className="bg-white border border-stone-200 rounded-xl px-2 py-1.5 text-xs font-medium text-stone-700 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {bookingView === 'calendar' && (
                  <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-sm">
                    <button 
                      onClick={() => setCurrentMonth(new Date())}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 px-2 py-1 hover:bg-orange-50 rounded-lg transition-colors mr-2"
                    >
                      Today
                    </button>
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-stone-100 rounded-lg transition-colors">
                      <ChevronLeft className="w-5 h-5 text-stone-600" />
                    </button>
                    <span className="text-sm font-bold text-stone-900 min-w-[120px] text-center">
                      {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-stone-100 rounded-lg transition-colors">
                      <ChevronRight className="w-5 h-5 text-stone-600" />
                    </button>
                  </div>
                )}
              </div>

              {bookingView === 'list' ? (
                <div className="overflow-x-auto bg-white rounded-2xl border border-stone-100 shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 border-b border-stone-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Customer</th>
                        <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Service</th>
                        <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Date/Time</th>
                        <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredBookings.map(b => (
                        <tr key={b.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-stone-900">{b.customerName}</td>
                          <td className="px-6 py-4 capitalize text-stone-600">{b.type}</td>
                          <td className="px-6 py-4 text-stone-500 text-sm">{b.date} at {b.timeSlot}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                              b.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'
                            }`}>{b.status}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end space-x-2">
                              {b.status === 'pending' && (
                                <>
                                  <button onClick={() => updateBookingStatus(b.id, 'confirmed')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"><CheckCircle className="w-4 h-4" /></button>
                                  <button onClick={() => updateBookingStatus(b.id, 'cancelled')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><XCircle className="w-4 h-4" /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredBookings.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-stone-500">No bookings found for the selected criteria.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                  <div className="grid grid-cols-7 bg-stone-50 border-b border-stone-200">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="py-3 text-center text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => {
                      const dayBookings = getBookingsForDay(day);
                      const isCurrentMonth = isSameMonth(day, currentMonth);
                      const isToday = isSameDay(day, new Date());

                      return (
                        <div 
                          key={idx} 
                          className={`min-h-[120px] p-2 border-r border-b border-stone-100 last:border-r-0 transition-colors hover:bg-stone-50/80 ${!isCurrentMonth ? 'bg-stone-50/50' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-bold ${isToday ? 'bg-orange-500 text-white w-6 h-6 flex items-center justify-center rounded-full' : isCurrentMonth ? 'text-stone-900' : 'text-stone-300'}`}>
                              {format(day, 'd')}
                            </span>
                            {dayBookings.length > 0 && (
                              <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-full font-bold">
                                {dayBookings.length}
                              </span>
                            )}
                          </div>
                          <div className="space-y-1">
                            {dayBookings.slice(0, 3).map(b => (
                              <div 
                                key={b.id} 
                                className={`text-[9px] p-1 rounded border truncate ${
                                  b.status === 'confirmed' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                                  b.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-stone-50 border-stone-100 text-stone-500'
                                }`}
                                title={`${b.customerName} - ${b.type}`}
                              >
                                <strong>{b.timeSlot}</strong> {b.customerName}
                              </div>
                            ))}
                            {dayBookings.length > 3 && (
                              <div className="text-[9px] text-stone-400 text-center font-medium">
                                + {dayBookings.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'wallet' && wallet && (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 mb-6">Recent Transactions</h3>
                  <div className="space-y-4">
                    {wallet.transactions?.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-xl ${t.type === 'order' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            {t.type === 'order' ? <Package className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900 capitalize">{t.type} Earning</p>
                            <p className="text-xs text-stone-500">{new Date(t.createdAt?._seconds * 1000).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600">+₹{t.amount.toFixed(2)}</p>
                          <p className="text-[10px] text-stone-400">Comm: ₹{t.commission.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    {(!wallet.transactions || wallet.transactions.length === 0) && (
                      <p className="text-stone-500 text-center py-8">No transactions yet.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-stone-900 mb-6">Payout History</h3>
                  <div className="space-y-4">
                    {wallet.payouts?.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                        <div>
                          <p className="font-bold text-stone-900">₹{p.amount.toFixed(2)}</p>
                          <p className="text-xs text-stone-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                          p.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'
                        }`}>{p.status}</span>
                      </div>
                    ))}
                    {(!wallet.payouts || wallet.payouts.length === 0) && (
                      <p className="text-stone-500 text-center py-8">No payout requests yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payout Modal */}
      <AnimatePresence>
        {isPayoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPayoutModalOpen(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold text-stone-900">Request Payout</h2>
                <button onClick={() => setIsPayoutModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full"><X className="w-6 h-6 text-stone-400" /></button>
              </div>

              <form onSubmit={handlePayoutSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">Amount (₹)</label>
                  <input required type="number" min="1" max={vendorStats.balance} step="0.01" value={payoutForm.amount} onChange={e => setPayoutForm({...payoutForm, amount: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" placeholder={`Max: ₹${vendorStats.balance.toFixed(2)}`} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">Bank Name</label>
                  <input required type="text" value={payoutForm.bankName} onChange={e => setPayoutForm({...payoutForm, bankName: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">Account Number</label>
                  <input required type="text" value={payoutForm.accountNumber} onChange={e => setPayoutForm({...payoutForm, accountNumber: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase">IFSC Code</label>
                  <input required type="text" value={payoutForm.ifscCode} onChange={e => setPayoutForm({...payoutForm, ifscCode: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={() => setIsPayoutModalOpen(false)} className="flex-1 px-6 py-4 border rounded-2xl font-bold hover:bg-stone-50">Cancel</button>
                  <button type="submit" className="flex-1 px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors">
                    Confirm
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold text-stone-900">{editingItem ? 'Edit' : 'Add'} {activeTab === 'products' ? 'Product' : 'Puja'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full"><X className="w-6 h-6 text-stone-400" /></button>
              </div>

              <form onSubmit={activeTab === 'products' ? handleProductSubmit : handlePujaSubmit} className="p-8 space-y-6">
                {activeTab === 'products' ? (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Name</label>
                        <input required type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Category</label>
                        <input required type="text" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Price (₹)</label>
                        <input required type="number" min="0.01" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Stock</label>
                        <input required type="number" min="0" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase">Image URL</label>
                      <input required type="url" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase">Description</label>
                      <textarea required rows={3} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase">Puja Title</label>
                      <input required type="text" value={pujaForm.title} onChange={e => setPujaForm({...pujaForm, title: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Price (₹)</label>
                        <input required type="number" min="0.01" step="0.01" value={pujaForm.price} onChange={e => setPujaForm({...pujaForm, price: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Duration</label>
                        <input required type="text" value={pujaForm.duration} onChange={e => setPujaForm({...pujaForm, duration: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. 2 Hours" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
                      <input
                        type="checkbox"
                        id="isLive"
                        checked={pujaForm.isLive || false}
                        onChange={(e) => setPujaForm({ ...pujaForm, isLive: e.target.checked })}
                        className="w-5 h-5 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                      />
                      <label htmlFor="isLive" className="text-xs font-bold text-stone-700 uppercase">Go Live Now</label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase">Description</label>
                      <textarea required rows={3} value={pujaForm.description} onChange={e => setPujaForm({...pujaForm, description: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                    </div>
                  </>
                )}

                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border rounded-2xl font-bold hover:bg-stone-50">Cancel</button>
                  <button type="submit" className="flex-1 px-6 py-4 bg-stone-900 text-white font-bold rounded-2xl hover:bg-orange-500 transition-colors flex items-center justify-center space-x-2">
                    <Save className="w-5 h-5" />
                    <span>Save {activeTab === 'products' ? 'Product' : 'Puja'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
