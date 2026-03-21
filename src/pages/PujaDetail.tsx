import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { Puja } from '../types';
import { motion } from 'framer-motion';
import { Clock, IndianRupee, CheckCircle2, Calendar, User, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PujaDetail() {
  const currentUser = auth?.currentUser;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [puja, setPuja] = useState<Puja | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [bringSamagri, setBringSamagri] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchPuja = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/api/pujas/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPuja(data);
        } else {
          // Fallback mock data for demo
          const mockPujas: Record<string, any> = {
            '1': { title: 'Ganesh Puja', onlinePrice: 1100, offlinePrice: 2100, duration: '1.5 Hours', description: 'Invoke the blessings of Lord Ganesha for new beginnings and removing obstacles.', samagriList: 'Ganesha Idol, Turmeric, Kumkum, Sandalwood Paste, Incense Sticks, Lamp, Flowers, Fruits, Betel Leaves, Betel Nuts, Coconut, Rice, Sweets (Modak).' },
            '2': { title: 'Satyanarayan Katha', onlinePrice: 2500, offlinePrice: 5100, duration: '3 Hours', description: 'A sacred ritual dedicated to Lord Vishnu for peace, prosperity, and happiness.', samagriList: 'Satyanarayan Photo, Panchamrit, Banana Leaves, Flowers, Fruits, Tulsi Leaves, Kalash, Mango Leaves, Wheat, Ghee for Havan.' },
            '3': { title: 'Lakshmi Puja', onlinePrice: 1800, offlinePrice: 3500, duration: '2 Hours', description: 'Attract wealth and prosperity with this special puja dedicated to Goddess Lakshmi.', samagriList: 'Lakshmi Idol/Photo, Lotus Flowers, Red Cloth, Rice, Turmeric, Kumkum, Sandalwood, Incense, Lamp, Ghee, Fruits, Sweets.' }
          };
          if (mockPujas[id]) {
            setPuja({ id, ...mockPujas[id] } as Puja);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPuja();
  }, [id]);

  const handleBooking = async () => {
    if (!currentUser) {
      alert('Please sign in to book a puja.');
      return;
    }
    if (!bookingDate || !bookingTime) {
      alert('Please select a date and time.');
      return;
    }

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
          totalAmount: isOnline ? puja?.onlinePrice : puja?.offlinePrice,
          isOnline,
          bringSamagri: !isOnline && bringSamagri,
          samagriList: puja?.samagriList
        })
      });
      if (response.ok) {
        alert('Puja booked successfully! You can view it in your profile.');
        navigate('/profile');
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!puja) return <div className="min-h-screen flex items-center justify-center">Puja not found.</div>;

  const currentPrice = isOnline ? puja.onlinePrice : puja.offlinePrice;

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
          <div className="aspect-video rounded-[2rem] overflow-hidden border border-stone-200 shadow-sm">
            <img 
              src={`https://picsum.photos/seed/${id}/1200/800`} 
              alt={puja.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
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
            <h3 className="font-bold text-stone-900">Required Samagri:</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {puja.samagriList}
            </p>
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
          className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-stone-200 shadow-xl shadow-stone-200/50 h-fit sticky top-24"
        >
          <div className="flex items-center justify-between mb-8">
            <span className="text-stone-500 font-medium">Service Price</span>
            <div className="flex items-center text-3xl font-serif font-bold text-orange-600">
              <IndianRupee className="w-6 h-6" />
              <span>{currentPrice}</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Online/Offline Toggle */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <label className="block text-sm font-bold text-stone-700 mb-3">Service Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsOnline(true)}
                  className={`py-2 rounded-xl text-sm font-bold transition-all ${isOnline ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-stone-600 border border-stone-200'}`}
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
                {isOnline ? 'Pandit Ji will perform the puja via high-quality video call.' : 'Pandit Ji will visit your location for the puja.'}
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
                    Pandit Ji Brings
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

            <div className="pt-4">
              <button 
                onClick={handleBooking}
                disabled={isBooking}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {isBooking ? 'Processing...' : 'Confirm Booking'}
              </button>
              <p className="text-center text-xs text-stone-400 mt-4">
                Secure checkout powered by DivineConnect. No hidden charges.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
