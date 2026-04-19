import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Store, User, FileText, Send, CheckCircle2 } from 'lucide-react';

interface VendorRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export const VendorRegistrationModal: React.FC<VendorRegistrationModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'priest',
    description: '',
    gstNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/vendor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData
        }),
      });

      if (!response.ok) throw new Error('Failed to submit registration');

      setStep(3);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-stone-200 dark:border-stone-800"
          >
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-800/50">
              <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Store className="w-6 h-6 text-orange-500" />
                Vendor Registration
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <div className="p-8">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <p className="text-stone-600 dark:text-stone-400">
                      Join our spiritual community and offer your services to devotees worldwide.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 flex gap-4 items-start">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 dark:text-white">Expand Your Reach</h4>
                        <p className="text-sm text-stone-500">Connect with thousands of devotees looking for authentic spiritual services.</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 flex gap-4 items-start">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 dark:text-white">Secure Payments</h4>
                        <p className="text-sm text-stone-500">Transparent wallet system with easy payout requests.</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/20"
                  >
                    Get Started
                  </button>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                      <Store className="w-4 h-4" /> Business Name
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      placeholder="e.g. Kashi Vishwanath Puja Services"
                      value={formData.businessName}
                      onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                      <User className="w-4 h-4" /> Business Type
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      value={formData.businessType}
                      onChange={e => setFormData({ ...formData, businessType: e.target.value as any })}
                    >
                      <option value="priest">Priest / Pandit</option>
                      <option value="temple">Temple / Trust</option>
                      <option value="shop">Spiritual Shop</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Description
                    </label>
                    <textarea
                      required
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                      placeholder="Tell us about your services and experience..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 rounded-xl font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[2] py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Submit Application
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <div className="text-center space-y-6 py-4">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">Application Submitted!</h3>
                    <p className="text-stone-600 dark:text-stone-400">
                      Our team will review your application and notify you via email and notification within 24-48 hours.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-2xl font-bold transition-all"
                  >
                    Got it
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
