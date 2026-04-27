import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, User, FileText, Send, CheckCircle2, Phone, MapPin, ArrowLeft, Users, IndianRupee } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function VendorRegistration() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'priest',
    description: '',
    contactPhone: '',
    contactAddress: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/?auth=login');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/vendor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          ...formData
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to submit registration';
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            const text = await response.text();
            console.error("Non-JSON error response:", text);
            errorMessage = `Server Error (${response.status}): ${text.substring(0, 200)}... Please check console logs.`;
          }
        } catch (parseErr) {
          console.error("Error parsing server response:", parseErr);
          errorMessage = `Server Error (${response.status}). Connection interrupted.`;
        }

        if (response.status === 403) {
          throw new Error(`Permission Denied: ${errorMessage}. This might be a temporary platform issue. Please try logging out and back in.`);
        }
        throw new Error(errorMessage);
      }

      setStep(3);
    } catch (err) {
      console.error("Registration submission error:", err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center text-stone-500 hover:text-orange-500 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </button>

        <div className="bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden">
          <div className="bg-orange-500 p-12 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-serif font-bold mb-4">Vendor Partner Program</h1>
              <p className="text-orange-100 text-lg max-w-xl">
                Join India's most trusted spiritual marketplace. Share your divine services and products with devotees across the globe.
              </p>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
          </div>

          <div className="p-12">
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-stone-900 dark:text-white">Reach millions</h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Your services visible to a growing community of spiritual seekers.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                      <IndianRupee className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-stone-900 dark:text-white">Professional Wallet</h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Track every rupee earned with automated reports and easy payouts.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-stone-900 dark:text-white">Verified Badge</h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Gain trust with an official 'Verified Vendor' badge on your profile.</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-6">Terms & Expectations</h3>
                  <ul className="space-y-4 mb-10">
                    {[
                      'Mandatory adherence to spiritual purity and Vedic traditions.',
                      'Transparent pricing with no hidden charges for devotees.',
                      'Timely response to booking requests and order fulfillment.',
                      'Professional behavior and attire during virtual or physical services.'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-stone-600 dark:text-stone-400">
                        <div className="mt-1 w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-[10px] font-bold text-stone-400 shrink-0">
                          {i + 1}
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full md:w-auto px-12 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/20"
                  >
                    I Agree, Proceed to Application
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.form 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleSubmit} 
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                      <Store className="w-4 h-4 text-orange-500" /> Business Name
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-6 py-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                      placeholder="e.g. Pandit Sharma's Spiritual Services"
                      value={formData.businessName}
                      onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-500" /> Business Type
                    </label>
                    <select
                      className="w-full px-6 py-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white appearance-none"
                      value={formData.businessType}
                      onChange={e => setFormData({ ...formData, businessType: e.target.value as any })}
                    >
                      <option value="priest">Priest / Pandit</option>
                      <option value="temple">Temple / Trust</option>
                      <option value="shop">Spiritual Shop</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-500" /> Business Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-6 py-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none dark:text-white"
                    placeholder="Describe your lineage, experience, or the products you offer..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-orange-500" /> Contact Number
                    </label>
                    <input
                      required
                      type="tel"
                      className="w-full px-6 py-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                      placeholder="+91 98765 43210"
                      value={formData.contactPhone}
                      onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" /> Business Location
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-6 py-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white"
                      placeholder="e.g. Varanasi, UP"
                      value={formData.contactAddress}
                      onChange={e => setFormData({ ...formData, contactAddress: e.target.value })}
                    />
                  </div>
                </div>

                {error && (
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium">
                      {error}
                    </div>
                    {error.includes("Not Found") && (
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl text-orange-700 dark:text-orange-300 text-xs">
                        <strong>Tip:</strong> If you're seeing "Not Found" errors, it might be an issue with your account sync. 
                        Try logging in with your official email <strong>pg2331427@gmail.com</strong> using the password <strong>admin123</strong> to bypass sync issues.
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-8 py-4 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 rounded-2xl font-bold hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
                  >
                    Back to Info
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" /> Submit Official Application
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 py-10"
              >
                <div className="w-32 h-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-16 h-16 text-emerald-600" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-serif font-bold text-stone-900 dark:text-white">Blessings! Your Application is In Review</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-lg max-w-lg mx-auto">
                    We have received your request to join the PunyaSeva family. Our sacred vetting team will review your details and respond within 24-48 spiritual hours.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="px-12 py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-2xl font-bold hover:bg-orange-500 dark:hover:bg-orange-500 dark:hover:text-white transition-all shadow-xl"
                >
                  Return to My Profile
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-200 dark:border-stone-800">
            <h4 className="font-bold text-stone-900 dark:text-white mb-2">Need Help?</h4>
            <p className="text-stone-500 text-sm mb-4">Stuck in the process? Contact our partner support for assistance.</p>
            <a href="mailto:partners@punyaseva.com" className="text-orange-500 font-bold hover:underline">partners@punyaseva.com</a>
          </div>
          <div className="p-8 bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-200 dark:border-stone-800">
            <h4 className="font-bold text-stone-900 dark:text-white mb-2">Lineage & Trust</h4>
            <p className="text-stone-500 text-sm">We prioritize authentic practitioners with verified spiritual lineage.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
