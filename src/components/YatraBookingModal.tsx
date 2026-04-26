import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, Phone, MessageSquare, CreditCard, Sparkles, CheckCircle2, MapPin, IndianRupee } from 'lucide-react';
import { Yatra, Booking } from '../types';
import { formatIndianRupees } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

interface YatraBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  yatra: Yatra;
}

export default function YatraBookingModal({ isOpen, onClose, yatra }: YatraBookingModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: '',
    travelers: 1,
    contactNumber: (user as any)?.phoneNumber || '',
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to book a yatra.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const totalAmount = yatra.price * formData.travelers;

      const bookingData: Booking = {
        id: bookingId,
        userId: user.uid,
        serviceId: yatra.id,
        vendorId: yatra.vendorId,
        type: 'yatra',
        isOnline: false,
        bringSamagri: false,
        date: formData.date,
        status: 'pending',
        totalAmount,
        paidAmount: 0,
        travelers: formData.travelers,
        contactNumber: formData.contactNumber,
        specialRequests: formData.specialRequests,
        createdAt: new Date().toISOString()
      };

      await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: bookingId,
        ...bookingData,
        createdAt: serverTimestamp()
      }) });

      setSuccess(bookingId);
      setTimeout(() => {
        onClose();
        setSuccess(null);
        setFormData({ date: '', travelers: 1, contactNumber: (user as any)?.phoneNumber || '', specialRequests: '' });
      }, 5000);
    } catch (err) {
      console.error('Booking error:', err);
      setError('Failed to book yatra. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl bg-white rounded-[2.5rem] shadow-2xl z-[101] overflow-hidden flex flex-col"
          >
            {success ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-8 animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Booking Requested!</h2>
                <p className="text-stone-500 leading-relaxed max-w-sm">
                  Your divine journey to <span className="font-bold text-stone-900">{yatra.title}</span> has been requested. Our team will contact you shortly to confirm the details.
                </p>
                <div className="mt-8 pt-8 border-t border-stone-100 w-full">
                  <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">Booking ID: {success}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-8 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-stone-900">Book Your Yatra</h3>
                      <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">{yatra.category}</p>
                    </div>
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-stone-200 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-stone-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="mb-8 p-6 bg-stone-50 rounded-3xl border border-stone-100">
                    <h4 className="font-bold text-stone-900 mb-2">{yatra.title}</h4>
                    <p className="text-sm text-stone-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {yatra.location}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-400 uppercase">Package Price</span>
                      <span className="text-xl font-serif font-bold text-orange-600">{formatIndianRupees(yatra.price)} <span className="text-xs text-stone-400 font-sans">/ person</span></span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Preferred Start Date
                      </label>
                      <input
                        required
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 text-stone-900 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" />
                        Number of Travelers
                      </label>
                      <div className="flex items-center bg-stone-50 border border-stone-100 rounded-2xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, travelers: Math.max(1, formData.travelers - 1) })}
                          className="px-6 py-4 hover:bg-stone-100 text-stone-600 transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={formData.travelers}
                          onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) || 1 })}
                          className="flex-1 text-center bg-transparent border-none focus:ring-0 text-stone-900 font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, travelers: Math.min(20, formData.travelers + 1) })}
                          className="px-6 py-4 hover:bg-stone-100 text-stone-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" />
                        Contact Number
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 text-stone-900 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Special Requests (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Diet requirements, room preference..."
                        value={formData.specialRequests}
                        onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-5 py-4 text-stone-900 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all font-medium resize-none"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold">
                      {error}
                    </div>
                  )}

                  <div className="mt-10 p-8 border-t border-stone-100 -mx-8 -mb-8 bg-stone-50/50">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Total Amount</span>
                        <div className="flex items-center text-3xl font-serif font-black text-stone-900">
                          <IndianRupee className="w-6 h-6 text-orange-500" />
                          <span>{formatIndianRupees(yatra.price * formData.travelers)}</span>
                        </div>
                      </div>
                      <div className="w-px h-10 bg-stone-200 mx-6 hidden md:block" />
                      <div className="hidden md:block">
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none mb-1">Tax Status</p>
                        <p className="text-xs font-bold text-emerald-600">All Inclusive</p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-orange-500 text-white py-5 rounded-[2rem] font-bold text-lg hover:bg-orange-600 disabled:opacity-50 transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-6 h-6" />
                          <span>Confirm & Book Yatra</span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-stone-400 mt-6 uppercase tracking-[0.2em] font-bold">Safe & Divine Experience Guaranteed</p>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
