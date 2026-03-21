import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, Package, Star, Users, Store, Calendar } from 'lucide-react';
import { formatIndianRupees } from '../lib/utils';
import {
  deleteProductDirect,
  getAdminStatsDirect,
  listProductsDirect,
  saveProductDirect,
} from '../lib/firestore-data';

export default function AdminDashboard() {
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
    image: '',
    templeName: '',
    weight: '',
    size: '',
    dispatchWindow: '',
    city: '',
    offeringType: '',
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalBookings: 0
  });

  const fetchStats = async () => {
    try {
      setStats(await getAdminStatsDirect());
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setProducts(await listProductsDirect());
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

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
        image: product.image,
        templeName: product.templeName || '',
        weight: product.weight || '',
        size: product.size || '',
        dispatchWindow: product.dispatchWindow || '',
        city: product.city || '',
        offeringType: product.offeringType || '',
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
        image: '',
        templeName: '',
        weight: '',
        size: '',
        dispatchWindow: '',
        city: '',
        offeringType: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await saveProductDirect({
        id: editingProduct?.id,
        vendorId: editingProduct?.vendorId || 'system',
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock, 10),
        rating: parseFloat(formData.rating),
        image: formData.image,
        templeName: formData.templeName,
        weight: formData.weight,
        size: formData.size,
        dispatchWindow: formData.dispatchWindow,
        city: formData.city,
        offeringType: formData.offeringType,
      });
      alert(editingProduct ? 'Product updated!' : 'Product added!');
      setIsModalOpen(false);
      fetchProducts();
      fetchStats();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProductDirect(id);
      alert('Product deleted!');
      fetchProducts();
      fetchStats();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">Admin Dashboard</h1>
          <p className="text-stone-600">Manage your spiritual marketplace inventory.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">Add Product</span>
        </button>
      </div>

      {/* Stats Section */}
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
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Temple / Detail</th>
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
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <span className="font-bold text-stone-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-bold">{product.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-stone-500">
                        <div>{product.templeName || product.offeringType || 'General offering'}</div>
                        {(product.weight || product.size) && (
                          <div className="text-xs text-stone-400">
                            {[product.weight, product.size].filter(Boolean).join(' | ')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-orange-600">
                        Rs. {formatIndianRupees(product.price)}
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
                      <option value="Prasad">Prasad</option>
                      <option value="Puja Essentials">Puja Essentials</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Price (Rs.)</label>
                    <input
                      required
                      type="number"
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
                  <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Temple / Source</label>
                  <input
                    type="text"
                    value={formData.templeName}
                    onChange={(e) => setFormData({ ...formData, templeName: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Tirumala Tirupati Devasthanam"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Offering Type</label>
                    <input
                      type="text"
                      value={formData.offeringType}
                      onChange={(e) => setFormData({ ...formData, offeringType: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Mahaprasad"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Weight</label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      placeholder="e.g. 500 g"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Size / Pack</label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Family Box"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Dispatch Window</label>
                    <input
                      type="text"
                      value={formData.dispatchWindow}
                      onChange={(e) => setFormData({ ...formData, dispatchWindow: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Dispatch within 24 hours"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Varanasi"
                    />
                  </div>
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
