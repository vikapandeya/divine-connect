import React, { useState, useEffect } from 'react';
import { Product, Puja } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, CheckCircle, XCircle, Bell, Wallet, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatIndianRupees } from '../lib/utils';
import {
  deleteProductDirect,
  deletePujaDirect,
  DEMO_VENDOR_PROFILE,
  listBookingsByVendorDirect,
  listOrdersByVendorDirect,
  listProductsDirect,
  listPujasDirect,
  saveProductDirect,
  savePujaDirect,
  updateBookingStatusDirect,
} from '../lib/firestore-data';
import { buildVendorFinanceSnapshot, buildVendorNotifications } from '../lib/platform';

export default function VendorDashboard() {
  const currentUser = DEMO_VENDOR_PROFILE;
  const [activeTab, setActiveTab] = useState<'products' | 'pujas' | 'bookings'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    templeName: '',
    weight: '',
    size: '',
    dispatchWindow: '',
    city: '',
    offeringType: '',
    isActive: true,
  });

  const [pujaForm, setPujaForm] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    templeName: '',
    mode: 'hybrid',
    onlineTimings: '',
    offlineTimings: '',
    liveDarshanAvailable: false,
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const vendorId = currentUser.uid;
      
      const [productsData, pujasData, bookingsData, ordersData] = await Promise.all([
        listProductsDirect({ vendorId, includeInactive: true }),
        listPujasDirect({ vendorId, includeInactive: true }),
        listBookingsByVendorDirect(vendorId),
        listOrdersByVendorDirect(vendorId),
      ]);

      setProducts(productsData);
      setPujas(pujasData);
      setBookings(bookingsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const financeSnapshot = buildVendorFinanceSnapshot(orders, bookings, 0.1);
  const vendorNotifications = buildVendorNotifications(bookings, orders, products).slice(0, 4);
  const lowStockProducts = products.filter((product) => product.stock < 5);

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
          image: item.image,
          templeName: item.templeName || '',
          weight: item.weight || '',
          size: item.size || '',
          dispatchWindow: item.dispatchWindow || '',
          city: item.city || '',
          offeringType: item.offeringType || '',
          isActive: item.isActive !== false,
        });
      } else {
        setEditingItem(null);
        setProductForm({
          name: '',
          description: '',
          price: '',
          category: '',
          stock: '',
          image: '',
          templeName: '',
          weight: '',
          size: '',
          dispatchWindow: '',
          city: '',
          offeringType: '',
          isActive: true,
        });
      }
    } else if (activeTab === 'pujas') {
      if (item) {
        setEditingItem(item);
        setPujaForm({
          title: item.title,
          description: item.description,
          price: item.price.toString(),
          duration: item.duration,
          templeName: item.templeName || '',
          mode: item.mode || 'hybrid',
          onlineTimings: (item.onlineTimings || []).join(', '),
          offlineTimings: (item.offlineTimings || []).join(', '),
          liveDarshanAvailable: item.liveDarshanAvailable === true,
          isActive: item.isActive !== false,
        });
      } else {
        setEditingItem(null);
        setPujaForm({
          title: '',
          description: '',
          price: '',
          duration: '',
          templeName: '',
          mode: 'hybrid',
          onlineTimings: '',
          offlineTimings: '',
          liveDarshanAvailable: false,
          isActive: true,
        });
      }
    }
    setIsModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProductDirect({
        id: editingItem?.id,
        vendorId: currentUser?.uid || editingItem?.vendorId || 'system',
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        stock: parseInt(productForm.stock, 10),
        rating: editingItem?.rating || 4.5,
        image: productForm.image,
        templeName: productForm.templeName,
        weight: productForm.weight,
        size: productForm.size,
        dispatchWindow: productForm.dispatchWindow,
        city: productForm.city,
        offeringType: productForm.offeringType,
        isActive: productForm.isActive,
      });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handlePujaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savePujaDirect({
        id: editingItem?.id,
        vendorId: currentUser?.uid || editingItem?.vendorId || 'system',
        title: pujaForm.title,
        description: pujaForm.description,
        price: parseFloat(pujaForm.price),
        duration: pujaForm.duration,
        samagriIncluded: editingItem?.samagriIncluded ?? true,
        templeName: pujaForm.templeName,
        mode: pujaForm.mode,
        onlineTimings: pujaForm.onlineTimings.split(',').map((item) => item.trim()).filter(Boolean),
        offlineTimings: pujaForm.offlineTimings.split(',').map((item) => item.trim()).filter(Boolean),
        liveDarshanAvailable: pujaForm.liveDarshanAvailable,
        isActive: pujaForm.isActive,
      });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving puja:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      if (activeTab === 'products') {
        await deleteProductDirect(id);
      } else {
        await deletePujaDirect(id);
      }
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      await updateBookingStatusDirect(id, status as 'pending' | 'confirmed' | 'completed' | 'cancelled');
      fetchData();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">Vendor Dashboard</h1>
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
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr] mb-10">
        <div className="rounded-[2.5rem] border border-stone-200 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">
                Wallet and payouts
              </p>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                Hardcoded vendor finance model
              </h2>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { label: 'Gross Sales', value: `Rs. ${formatIndianRupees(financeSnapshot.grossSales)}` },
              { label: 'Platform Commission', value: `Rs. ${formatIndianRupees(financeSnapshot.platformCommission)}` },
              { label: 'Withdrawable Balance', value: `Rs. ${formatIndianRupees(financeSnapshot.withdrawableBalance)}` },
              { label: 'Pending Clearance', value: `Rs. ${formatIndianRupees(financeSnapshot.pendingClearance)}` },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-4 py-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-stone-400">{stat.label}</p>
                <p className="mt-3 text-lg font-bold text-stone-900">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-orange-100 bg-orange-50 px-5 py-4">
            <div>
              <p className="text-sm font-bold text-stone-900">Commission logic</p>
              <p className="mt-1 text-sm text-stone-600">
                DivineConnect keeps a hardcoded {Math.round(financeSnapshot.commissionRate * 100)}% platform fee before vendor payout settlement.
              </p>
            </div>
            <button type="button" className="rounded-full bg-stone-900 px-5 py-3 text-sm font-bold text-white hover:bg-orange-500">
              Request Payout
            </button>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-stone-200 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">
                Realtime operations
              </p>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                Alerts, KYC, and stock safety
              </h2>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 px-4 py-4">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
                Verified Vendor Badge Active
              </div>
              <p className="mt-2 text-sm text-stone-600">
                KYC and service verification are represented as hardcoded trust states in this demo dashboard.
              </p>
            </div>
            {lowStockProducts.length ? (
              <div className="rounded-[1.5rem] border border-amber-100 bg-amber-50 px-4 py-4">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
                  <AlertTriangle className="w-4 h-4" />
                  Inventory alert
                </div>
                <p className="mt-2 text-sm text-stone-600">
                  {lowStockProducts.map((product) => `${product.name} (${product.stock})`).join(', ')}
                </p>
              </div>
            ) : null}
            {vendorNotifications.map((notification) => (
              <div key={notification.id} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-4 py-4">
                <p className="text-sm font-bold text-stone-900">{notification.title}</p>
                <p className="mt-2 text-sm text-stone-600">{notification.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8 flex justify-end">
        {activeTab !== 'bookings' && (
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
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Temple / Detail</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Stock</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Visibility</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={p.image} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <span className="font-bold text-stone-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-500">
                        <div>{p.templeName || p.offeringType || 'General offering'}</div>
                        {(p.weight || p.size) && (
                          <div className="text-xs text-stone-400">
                            {[p.weight, p.size].filter(Boolean).join(' | ')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-orange-600">Rs. {formatIndianRupees(p.price)}</td>
                      <td className="px-6 py-4 text-stone-600">{p.stock}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          p.isActive === false ? 'bg-stone-100 text-stone-500' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {p.isActive === false ? 'Hidden' : 'Live'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
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
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Mode / Timings</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Duration</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Visibility</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {pujas.map(p => (
                    <tr key={p.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4 font-bold text-stone-900">{p.title}</td>
                      <td className="px-6 py-4 text-sm text-stone-500">
                        <div className="capitalize">{p.mode || 'hybrid'}</div>
                        <div className="text-xs text-stone-400">
                          {p.onlineTimings?.[0] || p.offlineTimings?.[0] || 'Timing added on service page'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-orange-600">Rs. {formatIndianRupees(p.price)}</td>
                      <td className="px-6 py-4 text-stone-600">{p.duration}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          p.isActive === false ? 'bg-stone-100 text-stone-500' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {p.isActive === false ? 'Hidden' : 'Live'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
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
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Customer</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Service</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Mode</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Date/Time</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4 font-bold text-stone-900">{b.customerName}</td>
                      <td className="px-6 py-4 text-stone-600">
                        <div className="font-medium text-stone-900">{b.serviceTitle || `${b.type} service`}</div>
                        <div className="capitalize text-xs text-stone-500">{b.type}</div>
                      </td>
                      <td className="px-6 py-4 capitalize text-stone-500">{b.mode || 'online'}</td>
                      <td className="px-6 py-4 text-stone-500 text-sm">{b.date} at {b.timeSlot}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                          b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          b.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-500'
                        }`}>{b.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          {b.status === 'pending' && (
                            <>
                              <button onClick={() => updateBookingStatus(b.id, 'confirmed')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"><CheckCircle className="w-4 h-4" /></button>
                              <button onClick={() => updateBookingStatus(b.id, 'cancelled')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><XCircle className="w-4 h-4" /></button>
                            </>
                          )}
                          {b.status === 'confirmed' && (
                            <>
                              <button onClick={() => updateBookingStatus(b.id, 'completed')} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><CheckCircle className="w-4 h-4" /></button>
                              <button onClick={() => updateBookingStatus(b.id, 'cancelled')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><XCircle className="w-4 h-4" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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
                        <select required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500">
                          <option value="">Select category</option>
                          <option value="Prasad">Prasad</option>
                          <option value="Idols">Idols</option>
                          <option value="Incense">Incense</option>
                          <option value="Mala">Mala</option>
                          <option value="Books">Books</option>
                          <option value="Yantras">Yantras</option>
                          <option value="Puja Essentials">Puja Essentials</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Price (Rs.)</label>
                        <input required type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Stock</label>
                        <input required type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase">Temple / Source</label>
                      <input type="text" value={productForm.templeName} onChange={e => setProductForm({...productForm, templeName: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. Kashi Vishwanath Mandir" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Offering Type</label>
                        <input type="text" value={productForm.offeringType} onChange={e => setProductForm({...productForm, offeringType: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. Mahaprasad" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Weight</label>
                        <input type="text" value={productForm.weight} onChange={e => setProductForm({...productForm, weight: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. 500 g" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Size / Pack</label>
                        <input type="text" value={productForm.size} onChange={e => setProductForm({...productForm, size: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. Family Box" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Dispatch Window</label>
                        <input type="text" value={productForm.dispatchWindow} onChange={e => setProductForm({...productForm, dispatchWindow: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. Dispatch in 24 hours" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">City</label>
                        <input type="text" value={productForm.city} onChange={e => setProductForm({...productForm, city: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. Varanasi" />
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
                    <label className="flex items-center space-x-3 text-sm font-medium text-stone-600">
                      <input type="checkbox" checked={productForm.isActive} onChange={e => setProductForm({...productForm, isActive: e.target.checked})} className="w-4 h-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500" />
                      <span>Show this offering on the public shop</span>
                    </label>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase">Puja Title</label>
                      <input required type="text" value={pujaForm.title} onChange={e => setPujaForm({...pujaForm, title: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Price (Rs.)</label>
                        <input required type="number" value={pujaForm.price} onChange={e => setPujaForm({...pujaForm, price: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Duration</label>
                        <input required type="text" value={pujaForm.duration} onChange={e => setPujaForm({...pujaForm, duration: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. 2 Hours" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Temple / Service Area</label>
                        <input type="text" value={pujaForm.templeName} onChange={e => setPujaForm({...pujaForm, templeName: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. DivineConnect Certified Pandit Seva" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Mode</label>
                        <select value={pujaForm.mode} onChange={e => setPujaForm({...pujaForm, mode: e.target.value as 'online' | 'offline' | 'hybrid'})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500">
                          <option value="hybrid">Hybrid</option>
                          <option value="online">Online</option>
                          <option value="offline">Offline</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Online Timings</label>
                        <input type="text" value={pujaForm.onlineTimings} onChange={e => setPujaForm({...pujaForm, onlineTimings: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" placeholder="Comma separated slots" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase">Offline Timings</label>
                        <input type="text" value={pujaForm.offlineTimings} onChange={e => setPujaForm({...pujaForm, offlineTimings: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" placeholder="Comma separated slots" />
                      </div>
                    </div>
                    <label className="flex items-center space-x-3 text-sm font-medium text-stone-600">
                      <input type="checkbox" checked={pujaForm.liveDarshanAvailable} onChange={e => setPujaForm({...pujaForm, liveDarshanAvailable: e.target.checked})} className="w-4 h-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500" />
                      <span>Live darshan assistance available with this puja</span>
                    </label>
                    <label className="flex items-center space-x-3 text-sm font-medium text-stone-600">
                      <input type="checkbox" checked={pujaForm.isActive} onChange={e => setPujaForm({...pujaForm, isActive: e.target.checked})} className="w-4 h-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500" />
                      <span>Show this puja on the public services page</span>
                    </label>
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
