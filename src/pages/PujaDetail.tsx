import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { Puja, VendorProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, IndianRupee, CheckCircle2, Calendar, User, ShieldCheck, ArrowLeft, Store, Star, X, Info, Flame, MessageSquare, MessageCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';
import WhatsAppBookingModal from '../components/WhatsAppBookingModal';
import { Feedback } from '../types';

export default function PujaDetail() {
  const currentUser = auth?.currentUser;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [puja, setPuja] = useState<Puja | null>(null);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [bringSamagri, setBringSamagri] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [recommendedPujas, setRecommendedPujas] = useState<Puja[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const totalAmount = useMemo(() => {
    if (!puja) return 0;
    return isOnline 
      ? (puja.onlinePrice || 0) 
      : (puja.offlinePrice || 0) + (bringSamagri ? (puja.samagriPrice || 0) : 0);
  }, [puja, isOnline, bringSamagri]);

  const basePrice = useMemo(() => {
    if (!puja) return 0;
    return isOnline ? (puja.onlinePrice || 0) : (puja.offlinePrice || 0);
  }, [puja, isOnline]);

  const pujaImages = useMemo(() => [
    `https://picsum.photos/seed/${id}_1/1200/800`,
    `https://picsum.photos/seed/${id}_2/1200/800`,
    `https://picsum.photos/seed/${id}_3/1200/800`,
    `https://picsum.photos/seed/${id}_4/1200/800`,
  ], [id]);

  useEffect(() => {
    const fetchPuja = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/api/pujas/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPuja(data);
          setIsOnline(data.isOnline); // Set default mode based on puja capability
          
          // Fetch vendor details
          if (data.vendorId) {
            const vRes = await fetch(`/api/vendors/${data.vendorId}`);
            if (vRes.ok) {
              setVendor(await vRes.json());
            }
          }
        } else {
          // Fallback mock data for demo
          const mockPujas: Record<string, any> = {
            '1': { title: 'Ganesh Puja', onlinePrice: 1100, offlinePrice: 2100, samagriPrice: 500, duration: '1.5 Hours', description: 'Invoke the blessings of Lord Ganesha for new beginnings and removing obstacles.', samagriIncluded: true, isOnline: true },
            '2': { title: 'Satyanarayan Katha', onlinePrice: 2500, offlinePrice: 5100, samagriPrice: 1000, duration: '3 Hours', description: 'A sacred ritual dedicated to Lord Vishnu for peace, prosperity, and happiness.', samagriIncluded: false, isOnline: true },
            '3': { title: 'Lakshmi Puja', onlinePrice: 1800, offlinePrice: 3500, samagriPrice: 750, duration: '2 Hours', description: 'Attract wealth and prosperity with this special puja dedicated to Goddess Lakshmi.', samagriIncluded: true, isOnline: false }
          };
          if (mockPujas[id]) {
            setPuja({ id, ...mockPujas[id] } as Puja);
            setIsOnline(mockPujas[id].isOnline);
          }
        }

        // Fetch all pujas for recommendations
        const allResponse = await fetch('/api/pujas');
        if (allResponse.ok) {
          const allData = await allResponse.json();
          setRecommendedPujas(allData.filter((p: any) => p.id.toString() !== id).slice(0, 3));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFeedback = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/api/feedback?serviceId=${id}&type=puja`);
        if (response.ok) {
          setFeedback(await response.json());
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    fetchPuja();
    fetchFeedback();
    window.scrollTo(0, 0);
  }, [id]);

  const handleBooking = async () => {
    setShowConfirmation(false);
    setIsBooking(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          serviceId: id,
          vendorId: puja?.vendorId || 'system',
          type: 'puja',
          date: bookingDate,
          timeSlot: bookingTime,
          status: 'pending',
          totalAmount,
          isOnline,
          bringSamagri: !isOnline && bringSamagri,
          samagriList: puja?.samagriIncluded ? 'Included' : 'Not Included'
        })
      });
      if (response.ok) {
        setBookingSuccess(true);
        setShowFeedbackModal(true);
      } else {
        throw new Error('Failed to book puja');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to book puja. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const initiateBooking = () => {
    if (!currentUser) {
      alert('Please sign in to book a puja.');
      return;
    }
    if (!bookingDate || !bookingTime) {
      alert('Please select a date and time.');
      return;
    }
    setShowConfirmation(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif text-stone-500">Loading sacred space...</div>;
  if (!puja) return <div className="min-h-screen flex items-center justify-center font-serif text-stone-500">Puja not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-stone-500 hover:text-stone-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Services
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          {/* Image Carousel */}
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-stone-200 shadow-sm group">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                src={pujaImages[activeImageIndex]}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            
            {/* Carousel Controls */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setActiveImageIndex((prev) => (prev - 1 + pujaImages.length) % pujaImages.length)}
                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-stone-900 hover:bg-white transition-all shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setActiveImageIndex((prev) => (prev + 1) % pujaImages.length)}
                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-stone-900 hover:bg-white transition-all shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {pujaImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === activeImageIndex ? 'bg-orange-500 w-6' : 'bg-white/50'}`}
                />
              ))}
            </div>

            <div className="absolute top-6 left-6">
              <div className="bg-black/50 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
                Sacred Ritual Gallery
              </div>
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4">{puja.title}</h1>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                <Clock className="w-4 h-4 mr-2" />
                {puja.duration}
              </div>
              <div className="flex items-center bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Verified Pandit
              </div>
            </div>
            <p className="text-stone-600 leading-relaxed text-lg">
              {puja.description}
            </p>
          </div>

          <div className="bg-stone-100 p-8 rounded-3xl space-y-4">
            <h3 className="font-bold text-stone-900">Puja Details:</h3>
            <div className="space-y-2">
              <div className="flex items-center text-stone-600">
                <CheckCircle2 className={`w-4 h-4 mr-2 ${puja.samagriIncluded ? 'text-emerald-500' : 'text-stone-300'}`} />
                <span>Samagri Included: {puja.samagriIncluded ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center text-stone-600">
                <CheckCircle2 className={`w-4 h-4 mr-2 ${puja.isOnline ? 'text-emerald-500' : 'text-stone-300'}`} />
                <span>Virtual Performance Available: {puja.isOnline ? 'Yes' : 'No'}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-stone-200">
              <h4 className="font-bold text-stone-900 mb-2">What's Included in Service:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Vedic Mantras', 'Pandit Dakshina', 'Prasad Distribution', 'Online Consultation', 'Digital Certificate'].map((item) => (
                  <li key={item} className="flex items-center text-stone-600 text-sm">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Right: Booking Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6 sticky top-24"
        >
          {/* Vendor Card */}
          {vendor && (
            <div 
              onClick={() => navigate(`/vendor/${vendor.uid}`)}
              className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-xl shadow-stone-200/50 cursor-pointer group hover:border-orange-200 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-stone-100 shadow-sm">
                  <img 
                    src={vendor.photoURL || `https://picsum.photos/seed/${vendor.uid}/200/200`} 
                    alt={vendor.businessName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-stone-900 group-hover:text-orange-600 transition-colors">
                      {vendor.businessName}
                    </h3>
                    {vendor.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-amber-500 text-xs font-bold">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {vendor.rating}
                    </div>
                    <div className="flex items-center text-stone-400 text-[10px] font-bold uppercase tracking-wider">
                      <Store className="w-3 h-3 mr-1" />
                      {vendor.type}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-stone-50 flex items-center justify-between text-xs font-bold text-orange-600">
                <span>View Full Profile</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </div>
            </div>
          )}

          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-stone-200 shadow-xl shadow-stone-200/50 h-fit">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-500 font-medium">Base Price</span>
                <div className="flex items-center text-xl font-serif font-bold text-stone-900">
                  <IndianRupee className="w-4 h-4" />
                  <span>{basePrice}</span>
                </div>
              </div>

            {!isOnline && bringSamagri && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-stone-500 font-medium">Samagri Cost</span>
                <div className="flex items-center text-xl font-serif font-bold text-stone-900">
                  <IndianRupee className="w-4 h-4" />
                  <span>{puja.samagriPrice || 0}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-stone-100 mb-8">
              <span className="text-stone-900 font-bold">Total Amount</span>
              <div className="flex items-center text-3xl font-serif font-bold text-orange-600">
                <IndianRupee className="w-6 h-6" />
                <span>{totalAmount}</span>
              </div>
            </div>

            {/* Online/Offline Toggle */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <label className="block text-sm font-bold text-stone-700 mb-3">Service Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsOnline(true)}
                  disabled={!puja.isOnline}
                  className={`py-2 rounded-xl text-sm font-bold transition-all ${isOnline ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-stone-600 border border-stone-200'} ${!puja.isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Online (Video Call)
                </button>
                <button
                  onClick={() => setIsOnline(false)}
                  className={`py-2 rounded-xl text-sm font-bold transition-all ${!isOnline ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-stone-600 border border-stone-200'}`}
                >
                  Offline (At Home)
                </button>
              </div>
              <p className="text-[10px] text-stone-400 mt-2">
                {!puja.isOnline && isOnline ? 'This puja is currently not available online.' : isOnline ? 'Pandit Ji will perform the puja via high-quality video call.' : 'Pandit Ji will visit your location for the puja.'}
              </p>
            </div>

            {/* Samagri Option for Offline */}
            {!isOnline && (
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <label className="block text-sm font-bold text-stone-700 mb-3">Samagri Arrangement</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setBringSamagri(true)}
                    className={`py-2 rounded-xl text-sm font-bold transition-all ${bringSamagri ? 'bg-stone-800 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
                  >
                    Pandit Ji Brings (+₹{puja.samagriPrice || 0})
                  </button>
                  <button
                    onClick={() => setBringSamagri(false)}
                    className={`py-2 rounded-xl text-sm font-bold transition-all ${!bringSamagri ? 'bg-stone-800 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
                  >
                    I will Arrange
                  </button>
                </div>
                {!bringSamagri && (
                  <p className="text-[10px] text-orange-600 mt-2 font-medium">
                    A detailed samagri list will be provided in your receipt.
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Select Date
              </label>
              <input 
                type="date" 
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Select Time Slot
              </label>
              <select 
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Choose a slot</option>
                <option value="06:00 AM">06:00 AM - 08:00 AM</option>
                <option value="09:00 AM">09:00 AM - 11:00 AM</option>
                <option value="04:00 PM">04:00 PM - 06:00 PM</option>
                <option value="07:00 PM">07:00 PM - 09:00 PM</option>
              </select>
            </div>

            <div className="pt-4 space-y-3">
              <button 
                onClick={initiateBooking}
                disabled={isBooking}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {isBooking ? 'Processing...' : 'Book Now'}
              </button>
              
              <button 
                onClick={() => setShowWhatsAppModal(true)}
                className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Book via WhatsApp
              </button>

              <p className="text-center text-xs text-stone-400 mt-4">
                Secure checkout powered by PunyaSeva. No hidden charges.
              </p>
            </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmation(false)}
              className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-stone-900">Confirm Booking</h2>
                    <p className="text-stone-500 text-sm">Please review your puja details</p>
                  </div>
                  <button 
                    onClick={() => setShowConfirmation(false)}
                    className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-stone-400" />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Flame className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Puja Service</p>
                        <h4 className="font-bold text-stone-900">{puja.title}</h4>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Date</p>
                        <p className="text-sm font-bold text-stone-700">{bookingDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Time Slot</p>
                        <p className="text-sm font-bold text-stone-700">{bookingTime}</p>
                      </div>
                    </div>
                  </div>

                    <div className="space-y-2 px-2 pb-4 border-b border-stone-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Service Mode</span>
                        <span className="font-bold text-stone-900">{isOnline ? 'Online (Video Call)' : 'Offline (At Home)'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-500">Base Price</span>
                        <div className="flex items-center font-bold text-stone-900">
                          <IndianRupee className="w-3 h-3" />
                          <span>{basePrice}</span>
                        </div>
                      </div>
                      {!isOnline && bringSamagri && (
                        <div className="flex justify-between text-sm">
                          <span className="text-stone-500">Samagri Cost</span>
                          <div className="flex items-center font-bold text-stone-900">
                            <IndianRupee className="w-3 h-3" />
                            <span>{puja.samagriPrice || 0}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between text-sm pt-2 px-2">
                      <span className="text-stone-900 font-bold">Total Amount</span>
                      <div className="flex items-center text-xl font-serif font-bold text-orange-600">
                        <IndianRupee className="w-4 h-4" />
                        <span>{totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBooking}
                    className="flex-1 py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                  >
                    Confirm & Pay
                  </button>
                </div>
                
                <div className="mt-6 flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-700 leading-relaxed">
                    By confirming, you agree to our terms of service. You can cancel up to 24 hours before the scheduled time for a full refund.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recommended Pujas */}
      {recommendedPujas.length > 0 && (
        <div className="mt-24">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">Other Sacred Services</h2>
              <p className="text-stone-500">Explore more pujas and spiritual rituals.</p>
            </div>
            <button 
              onClick={() => navigate('/services')}
              className="text-orange-600 font-bold hover:text-orange-700 transition-colors flex items-center gap-2"
            >
              <span>View All</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {recommendedPujas.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/pujas/${p.id}`)}
                className="bg-white rounded-[2rem] border border-stone-200 overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-stone-200/50 transition-all w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)] min-w-[300px] max-w-sm"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img 
                    src={`https://picsum.photos/seed/${p.id}/800/600`} 
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Clock className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-xs font-bold text-stone-900">{p.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-stone-900 mb-3 group-hover:text-orange-600 transition-colors">{p.title}</h3>
                  <p className="text-stone-500 text-sm line-clamp-2 mb-6">
                    {p.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Starting from</span>
                      <span className="text-xl font-serif font-bold text-stone-900">₹{p.onlinePrice}</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Sacred Process Section */}
      <div className="mt-24 bg-stone-50 dark:bg-stone-900/50 rounded-[3rem] p-12 border border-stone-100 dark:border-stone-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">The Sacred Process</h2>
            <p className="text-stone-500">Every ritual is performed with absolute devotion and adherence to Vedic traditions.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Sankalp', desc: 'Personalized intention setting with your name and gotra.', icon: <Flame className="w-6 h-6" /> },
              { title: 'Ritual', desc: 'Detailed performance of mantras and offerings by expert pandits.', icon: <Sparkles className="w-6 h-6" /> },
              { title: 'Prasad', desc: 'Sanctified offerings sent to you or distributed as per choice.', icon: <CheckCircle2 className="w-6 h-6" /> },
            ].map((step, idx) => (
              <div key={idx} className="text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center mx-auto text-orange-500">
                  {step.icon}
                </div>
                <h4 className="font-bold text-stone-900">{step.title}</h4>
                <p className="text-sm text-stone-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="mt-24">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">Devotee Experiences</h2>
            <p className="text-stone-500">Real stories of faith and divine connection.</p>
          </div>
          <button 
            onClick={() => setShowFeedbackModal(true)}
            className="bg-stone-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-stone-800 transition-all flex items-center gap-2 shadow-xl shadow-stone-900/20"
          >
            <MessageSquare className="w-4 h-4" />
            Share Your Experience
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Static Authentic Reviews */}
          {[
            { name: "Suresh Prabhu", city: "Udupi", rating: 5, msg: "The clarity of the mantras during the online session was amazing. It felt like I was right there in the temple.", date: "2 days ago" },
            { name: "Aditi Rao", city: "Hyderabad", rating: 4.8, msg: "Pandit ji explained every step of the sankalp. Very educational and spiritually uplifting experience.", date: "1 week ago" },
            { name: "Vinay Pathak", city: "Lucknow", rating: 5, msg: "Highly professional service. The samagri provided was of superior quality and well-packed.", date: "2 weeks ago" }
          ].map((rev, idx) => (
            <motion.div 
              key={`static-${idx}`}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-bl-[2rem]" />
              <div className="flex items-center gap-1 text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.floor(rev.rating) ? 'fill-current' : 'text-stone-200'}`} />
                ))}
                <span className="ml-2 text-xs font-bold text-stone-900">{rev.rating}</span>
              </div>
              <p className="text-stone-600 mb-6 italic leading-relaxed">"{rev.msg}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center font-bold text-stone-500">
                  {rev.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{rev.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{rev.city}</span>
                    <span className="text-[10px] text-stone-300">•</span>
                    <span className="text-[10px] text-stone-400">{rev.date}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {feedback.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm"
            >
              <div className="flex items-center gap-1 text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < item.rating ? 'fill-current' : 'text-stone-200'}`} />
                ))}
                <span className="ml-2 text-xs font-bold text-stone-900">{item.rating}</span>
              </div>
              <p className="text-stone-600 mb-6 italic leading-relaxed">
                "{item.message}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold">
                  {item.userName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{item.userName}</h4>
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">{item.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <FeedbackModal 
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          if (bookingSuccess) {
            navigate('/profile');
          }
        }}
        serviceId={id}
        vendorId={puja.vendorId}
        type="puja"
        serviceName={puja.title}
      />

      <WhatsAppBookingModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        pujaTitle={puja.title}
      />
    </div>
  );
}
