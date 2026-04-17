import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, Package, IndianRupee, Star, Tag, Database, Users, Store, Calendar } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    rating: '4.5',
    image: ''
  });

  const [activeTab, setActiveTab] = useState<'inventory' | 'vendors' | 'approvals'>('inventory');
  const [vendorsPerformance, setVendorsPerformance] = useState<any[]>([]);
  const [pendingVendors, setPendingVendors] = useState<any[]>([]);
  const [vendorFilter, setVendorFilter] = useState<'all' | 'high' | 'low'>('all');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalBookings: 0,
    visitorCount: 0
  });

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        setStats(await response.json());
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorsPerformance = async () => {
    try {
      const response = await fetch('/api/admin/vendors-performance');
      if (response.ok) {
        setVendorsPerformance(await response.json());
      }
    } catch (error) {
      console.error('Error fetching vendor performance:', error);
    }
  };

  const fetchPendingVendors = async () => {
    try {
      const response = await fetch('/api/admin/pending-vendors');
      if (response.ok) {
        setPendingVendors(await response.json());
      }
    } catch (error) {
      console.error('Error fetching pending vendors:', error);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      fetchProducts();
      fetchStats();
      fetchVendorsPerformance();
      fetchPendingVendors();
    }
  }, [currentUser]);

  const filteredVendors = vendorsPerformance.filter(v => {
    if (vendorFilter === 'all') return true;
    if (vendorFilter === 'high') return v.totalBookings >= 5;
    if (vendorFilter === 'low') return v.totalBookings < 5;
    return true;
  }).sort((a, b) => b.totalBookings - a.totalBookings);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-stone-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString(),
        rating: product.rating.toString(),
        image: product.image
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        rating: '4.5',
        image: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);
    const rating = parseFloat(formData.rating);

    if (isNaN(price) || price <= 0) {
      toast('Please enter a valid positive price.', 'warning');
      return;
    }

    if (isNaN(stock) || stock < 0) {
      toast('Please enter a valid stock quantity (0 or more).', 'warning');
      return;
    }

    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price,
          stock,
          rating
        })
      });

      if (response.ok) {
        toast(editingProduct ? 'Product updated!' : 'Product added!', 'success');
        setIsModalOpen(false);
        fetchProducts();
        fetchStats();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast('Product deleted!', 'info');
        fetchProducts();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleApproveVendor = async (vendorId: string) => {
    if (!window.confirm('Approve this vendor?')) return;
    try {
      const response = await fetch('/api/admin/approve-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId })
      });
      if (response.ok) {
        toast('Vendor approved!', 'success');
        fetchPendingVendors();
        fetchStats();
      }
    } catch (error) {
      console.error('Error approving vendor:', error);
    }
  };

  const handleRejectVendor = async (vendorId: string) => {
    const reason = window.prompt('Reason for rejection?');
    if (reason === null) return;
    try {
      const response = await fetch('/api/admin/reject-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, reason })
      });
      if (response.ok) {
        toast('Vendor rejected.', 'info');
        fetchPendingVendors();
        fetchStats();
      }
    } catch (error) {
      console.error('Error rejecting vendor:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">Admin Dashboard</h1>
          <p className="text-stone-600">Manage your spiritual marketplace inventory.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-stone-100 p-1 rounded-2xl mr-4">
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'inventory' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Inventory
            </button>
            <button 
              onClick={() => setActiveTab('vendors')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'vendors' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Vendors
            </button>
            <button 
              onClick={() => setActiveTab('approvals')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'approvals' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
            >
              Approvals
              {pendingVendors.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-[10px] rounded-full">
                  {pendingVendors.length}
                </span>
              )}
            </button>
          </div>
          {activeTab === 'inventory' && (
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
            >
              <Plus className="w-5 h-5" />
              <span className="font-bold">Add Product</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Users</p>
                  <p className="text-2xl font-bold text-stone-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Vendors</p>
                  <p className="text-2xl font-bold text-stone-900">{stats.totalVendors}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Products</p>
                  <p className="text-2xl font-bold text-stone-900">{stats.totalProducts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Bookings</p>
                  <p className="text-2xl font-bold text-stone-900">{stats.totalBookings}</p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : activeTab === 'inventory' ? (
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-bottom border-stone-200">
                      <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <img src={product.image || null} alt={product.name} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                            <span className="font-bold text-stone-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-bold">{product.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center font-bold text-orange-600">
                            <IndianRupee className="w-3 h-3 mr-1" />
                            {product.price}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-stone-600 font-medium">{product.stock}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-bold text-stone-900">{product.rating}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleOpenModal(product)}
                              className="p-2 text-stone-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'vendors' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-xl font-serif font-bold text-stone-900">Vendor Performance</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setVendorFilter('all')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${vendorFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setVendorFilter('high')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${vendorFilter === 'high' ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                  >
                    High Performance (5+)
                  </button>
                  <button 
                    onClick={() => setVendorFilter('low')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${vendorFilter === 'low' ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                  >
                    Low Performance (&lt;5)
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-bottom border-stone-200">
                        <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Vendor</th>
                        <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Total Bookings</th>
                        <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Performance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredVendors.map((vendor) => (
                        <tr key={vendor.uid} className="hover:bg-stone-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-stone-900">{vendor.displayName || 'Unnamed Vendor'}</span>
                          </td>
                          <td className="px-6 py-4 text-stone-600">{vendor.email}</td>
                          <td className="px-6 py-4 font-bold text-stone-900">{vendor.totalBookings}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              vendor.totalBookings >= 5 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {vendor.totalBookings >= 5 ? 'High' : 'Low'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-xl font-serif font-bold text-stone-900">Pending Vendor Registrations</h3>
              </div>

              {pendingVendors.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center shadow-sm">
                  <Store className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                  <p className="text-stone-500">No pending vendor registrations at the moment.</p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50 border-bottom border-stone-200">
                          <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Business Name</th>
                          <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {pendingVendors.map((vendor) => (
                          <tr key={vendor.uid} className="hover:bg-stone-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-stone-900">{vendor.displayName || 'Unnamed'}</span>
                                <span className="text-xs text-stone-500">{vendor.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-stone-900">{vendor.businessDetails?.name || 'N/A'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                {vendor.businessDetails?.type || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-stone-600 line-clamp-2 max-w-xs">{vendor.businessDetails?.description || 'No description provided'}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end space-x-2">
                                <button 
                                  onClick={() => handleApproveVendor(vendor.uid)}
                                  className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleRejectVendor(vendor.uid)}
                                  className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold text-stone-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-stone-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Product Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Brass Ganesha Idol"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Category</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Select Category</option>
                      <option value="Idols">Idols</option>
                      <option value="Incense">Incense</option>
                      <option value="Mala">Mala</option>
                      <option value="Books">Books</option>
                      <option value="Yantras">Yantras</option>
                      <option value="Puja Essentials">Puja Essentials</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Price (₹)</label>
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Stock Quantity</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Image URL</label>
                  <input
                    required
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Describe the product..."
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 border border-stone-200 text-stone-600 font-bold rounded-2xl hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-4 bg-stone-900 text-white font-bold rounded-2xl hover:bg-orange-500 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>{editingProduct ? 'Update Product' : 'Save Product'}</span>
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
