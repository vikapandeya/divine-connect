import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, MapPin, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { auth } from '../firebase';
import { VendorProfile } from '../types';

interface WhatsAppBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pujaTitle?: string;
}

export default function WhatsAppBookingModal({ isOpen, onClose, pujaTitle = "General Puja" }: WhatsAppBookingModalProps) {
  const [step, setStep] = useState<'location' | 'searching' | 'results' | 'success'>('location');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyPandits, setNearbyPandits] = useState<(VendorProfile & { distance: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearbyPandits = async (lat: number, lng: number) => {
    setLoading(true);
    setStep('searching');
    try {
      const response = await fetch('/api/vendors');
      if (response.ok) {
        const vendors: VendorProfile[] = await response.json();
        const nearby = vendors
          .filter(v => v.type === 'priest' && v.status === 'approved' && v.location)
          .map(v => ({
            ...v,
            distance: calculateDistance(lat, lng, v.location!.lat, v.location!.lng)
          }))
          .filter(v => v.distance <= 6) // Within 6km
          .sort((a, b) => a.distance - b.distance);
        
        setNearbyPandits(nearby);
        setStep('results');
      } else {
        throw new Error('Failed to fetch vendors');
      }
    } catch (err) {
      setError('Could not find nearby pandits. Please try again.');
      setStep('location');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(loc);
        findNearbyPandits(loc.lat, loc.lng);
      },
      (err) => {
        setError('Please enable location access to find nearby pandits.');
        setLoading(false);
      }
    );
  };

  const handleBookingRequest = async (vendor: VendorProfile & { distance: number }) => {
    if (!whatsappNumber) {
      alert('Please enter your WhatsApp number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.currentUser?.uid,
          vendorId: vendor.uid,
          pujaTitle,
          userLocation,
          distance: vendor.distance,
          whatsappNumber,
          totalAmount: 501, // Default price for WhatsApp booking
          status: 'pending'
        })
      });

      if (response.ok) {
        setStep('success');
      } else {
        throw new Error('Failed to submit booking request');
      }
    } catch (err) {
      alert('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-stone-900">Book Pandit via WhatsApp</h2>
                  <p className="text-stone-500 text-sm">Find verified pandits within 5-6 km range</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              {step === 'location' && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-10 h-10 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">Share Your Location</h3>
                  <p className="text-stone-500">We need your location to find the nearest registered pandits for your puja.</p>
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm justify-center">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                  <button
                    onClick={handleGetLocation}
                    disabled={loading}
                    className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                    Use Current Location
                  </button>
                </div>
              )}

              {step === 'searching' && (
                <div className="space-y-6 text-center py-12">
                  <div className="relative w-24 h-24 mx-auto">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-orange-500/20 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Search className="w-10 h-10 text-orange-600 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">Finding Nearby Pandits...</h3>
                  <p className="text-stone-500">Searching for verified priests within 6km of your location.</p>
                </div>
              )}

              {step === 'results' && (
                <div className="space-y-6">
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-stone-700 mb-2">Your WhatsApp Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>

                  <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {nearbyPandits.length > 0 ? (
                      nearbyPandits.map((pandit) => (
                        <div key={pandit.uid} className="p-4 rounded-2xl border border-stone-100 bg-stone-50 hover:border-orange-200 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-200">
                              <img src={pandit.photoURL || `https://picsum.photos/seed/${pandit.uid}/100/100`} alt={pandit.businessName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-bold text-stone-900">{pandit.businessName}</h4>
                              <div className="flex items-center gap-3 text-xs text-stone-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {pandit.distance.toFixed(1)} km away
                                </span>
                                <span className="text-emerald-600 font-bold">Verified</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleBookingRequest(pandit)}
                              className="bg-stone-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-500 transition-all"
                            >
                              Request
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                        <p className="text-stone-500">No registered pandits found within 6km.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">Request Sent!</h3>
                  <p className="text-stone-500">Your booking request has been sent. Once the admin approves, the Pandit Ji will contact you via WhatsApp.</p>
                  <button
                    onClick={onClose}
                    className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-stone-800 transition-all"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
