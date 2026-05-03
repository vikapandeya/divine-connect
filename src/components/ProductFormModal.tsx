import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Upload, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any | null;
  title?: string;
  isSubmitting?: boolean;
}

export default function ProductFormModal({ isOpen, onClose, onSubmit, initialData, title = "Add New Product", isSubmitting = false }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Puja Samagri',
    stock: '',
    image: '',
    templeName: '',
    weightOptions: [] as { label: string; price: string }[]
  });

  const [imageType, setImageType] = useState<'url' | 'upload'>('url');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price?.toString() || '',
        category: initialData.category || 'Puja Samagri',
        stock: initialData.stock?.toString() || '',
        image: initialData.image || '',
        templeName: initialData.templeName || '',
        weightOptions: initialData.weightOptions 
          ? (typeof initialData.weightOptions === 'string' ? JSON.parse(initialData.weightOptions) : initialData.weightOptions)
          : []
      });
      if (initialData.image && !initialData.image.startsWith('http')) {
        setImageType('upload');
      } else {
        setImageType('url');
      }
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Puja Samagri',
        stock: '',
        image: '',
        templeName: '',
        weightOptions: []
      });
      setImageType('url');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      weightOptions: formData.weightOptions.map(opt => ({
        label: opt.label,
        price: Number(opt.price)
      }))
    };
    console.log('Submitting Product Data:', submissionData);
    await onSubmit(submissionData);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formUploadData = new FormData();
    formUploadData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formUploadData
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }));
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const addWeightOption = () => {
    setFormData({
      ...formData,
      weightOptions: [...formData.weightOptions, { label: '', price: '' }]
    });
  };

  const updateWeightOption = (index: number, field: 'label' | 'price', value: string) => {
    const newOptions = [...formData.weightOptions];
    newOptions[index][field] = value;
    setFormData({ ...formData, weightOptions: newOptions });
  };

  const removeWeightOption = (index: number) => {
    const newOptions = formData.weightOptions.filter((_, i) => i !== index);
    setFormData({ ...formData, weightOptions: newOptions });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl my-8 overflow-hidden border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh]"
        >
          <div className="p-6 md:p-8 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center sticky top-0 bg-white dark:bg-stone-900 z-10">
            <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">
              {title}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
              <X className="w-6 h-6 text-stone-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Product Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                  placeholder="e.g. Brass Ganesha Idol"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                >
                  <option value="">Select Category</option>
                  <option value="Puja Samagri">Puja Samagri</option>
                  <option value="Idols & Statues">Idols & Statues</option>
                  <option value="Rudraksha">Rudraksha</option>
                  <option value="Gems & Stones">Gems & Stones</option>
                  <option value="Books & Texts">Books & Texts</option>
                  <option value="Prasad">Prasad</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Price (₹) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Stock *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Product Image *</label>
                <div className="flex bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setImageType('url')}
                    className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-all ${imageType === 'url' ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                  >
                    <LinkIcon className="w-3 h-3" /> URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageType('upload')}
                    className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-all ${imageType === 'upload' ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                  >
                    <Upload className="w-3 h-3" /> Upload
                  </button>
                </div>
              </div>
              
              {imageType === 'url' ? (
                <input
                  required
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                  placeholder="https://example.com/image.jpg or /products/image.jpg"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                  {isUploading && <span className="text-xs text-orange-500 font-bold animate-pulse">Uploading...</span>}
                </div>
              )}
              {formData.image && imageType === 'upload' && !isUploading && (
                <p className="text-[10px] text-emerald-600 font-bold mt-1">Image selected: {formData.image.split('/').pop()}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Description *</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none dark:text-white"
                placeholder="Describe the product..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Temple Name <span className="text-stone-400 lowercase normal-case text-[10px]">(for Prasad products)</span></label>
              <input
                type="text"
                value={formData.templeName}
                onChange={(e) => setFormData({ ...formData, templeName: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                placeholder="e.g. Tirupati Balaji"
              />
            </div>

            <div className="space-y-3 bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Weight / Quantity Options <span className="text-stone-400 lowercase normal-case text-[10px]">(optional)</span></label>
                <button
                  type="button"
                  onClick={addWeightOption}
                  className="text-xs font-bold text-orange-500 flex items-center hover:text-orange-600"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Option
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.weightOptions.map((opt, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Label (e.g. 250g)"
                      value={opt.label}
                      onChange={(e) => updateWeightOption(index, 'label', e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={opt.price}
                      onChange={(e) => updateWeightOption(index, 'price', e.target.value)}
                      className="w-32 px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeWeightOption(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {formData.weightOptions.length === 0 && (
                  <p className="text-[10px] text-stone-400 italic">No dynamic weight or quantity options added. Standard price will be used.</p>
                )}
              </div>
            </div>

            <div className="flex space-x-4 pt-4 border-t border-stone-100 dark:border-stone-800 sticky bottom-0 bg-white dark:bg-stone-900 pb-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="flex-1 px-6 py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold rounded-2xl hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{initialData ? 'Update Product' : 'Save Product'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
