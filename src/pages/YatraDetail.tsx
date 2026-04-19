import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Yatra, VendorProfile } from '../types';
import { motion } from 'framer-motion';
import { Clock, IndianRupee, MapPin, Calendar, CheckCircle2, ArrowLeft, Star, Phone, Mail, ShieldCheck } from 'lucide-react';
import YatraBookingModal from '../components/YatraBookingModal';

export default function YatraDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [yatra, setYatra] = useState<Yatra | null>(null);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const fetchYatra = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/api/yatras`);
        if (response.ok) {
          const data = await response.json();
          const found = data.find((y: any) => y.id === id);
          if (found) {
            setYatra(found);
            if (found.vendorId) {
              const vRes = await fetch(`/api/vendors/${found.vendorId}`);
              if (vRes.ok) setVendor(await vRes.json());
            }
          } else {
            // Mock fallback
            const mockYatras: Record<string, any> = {
              'y1': { 
                id: 'y1', 
                title: 'Chardham Yatra 2026', 
                description: 'A complete spiritual journey to Yamunotri, Gangotri, Kedarnath, and Badrinath.', 
                price: 45000, 
                duration: '12 Days / 11 Nights', 
                location: 'Haridwar', 
                category: 'Pilgrimage', 
                vendorId: 'v1', 
                rating: 4.9, 
                itinerary: [
                  { day: 1, title: 'Arrival in Haridwar', description: 'Pick up from station/airport and evening Ganga Aarti.' },
                  { day: 2, title: 'Haridwar to Barkot', description: 'Drive to Barkot via Mussoorie.' },
                  { day: 3, title: 'Barkot to Yamunotri', description: 'Trek to the first Dham, Yamunotri.' }
                ], 
                included: ['Accommodation', 'Satvik Meals', 'VIP Darshan', 'Local Transport'], 
                excluded: ['Personal expenses', 'Horse/Palki charges'] 
              },
              'y2': { 
                id: 'y2', 
                title: 'Varanasi Spiritual Tour', 
                description: 'Experience the ancient city of Kashi, Ganga Aarti, and holy temples.', 
                price: 8500, 
                duration: '3 Days / 2 Nights', 
                location: 'Varanasi', 
                category: 'Spiritual', 
                vendorId: 'v2', 
                rating: 4.8, 
                itinerary: [
                  { day: 1, title: 'Evening Ganga Aarti', description: 'Witness the divine light ceremony at Dashashwamedh Ghat.' },
                  { day: 2, title: 'Temple Tour', description: 'Early morning boat ride and visit Kashi Vishwanath temple.' }
                ], 
                included: ['Hotel stay', 'Temple guide', 'Boat ride'], 
                excluded: ['Airfare', 'Lunch'] 
              },
              'y3': { 
                id: 'y3', 
                title: 'Tirupati Balaji Darshan', 
                description: 'Seamless darshan experience with accommodation and local visits.', 
                price: 5500, 
                duration: '2 Days / 1 Night', 
                location: 'Tirupathi', 
                category: 'Darshan', 
                vendorId: 'v3', 
                rating: 4.7, 
                itinerary: [
                  { day: 1, title: 'Tirupathi Arrival', description: 'Check-in and local temple visits.' },
                  { day: 2, title: 'Main Darshan', description: 'Sheegra darshan of Lord Venkateswara.' }
                ], 
                included: ['Darshan Ticket', 'Accommodation', 'Breakfast'], 
                excluded: ['Additional services'] 
              }
            };
            if (mockYatras[id]) setYatra(mockYatras[id]);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchYatra();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!yatra) return <div className="min-h-screen flex items-center justify-center">Yatra package not found.</div>;

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-stone-500 hover:text-stone-900 mb-8 transition-colors font-bold"
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
            <div className="aspect-[16/9] rounded-[2.5rem] overflow-hidden border border-stone-200 shadow-xl">
              <img 
                src={`https://picsum.photos/seed/${yatra.id}/1200/800`} 
                alt={yatra.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {yatra.category}
                </span>
                <div className="flex items-center text-amber-500 ml-2">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  <span className="font-bold">{yatra.rating}</span>
                </div>
              </div>
              <h1 className="text-4xl font-serif font-bold text-stone-900 mb-6">{yatra.title}</h1>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <Clock className="w-5 h-5 text-orange-500 mb-2" />
                  <p className="text-[10px] text-stone-400 font-bold uppercase">Duration</p>
                  <p className="text-sm font-bold text-stone-900">{yatra.duration}</p>
                </div>
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <MapPin className="w-5 h-5 text-blue-500 mb-2" />
                  <p className="text-[10px] text-stone-400 font-bold uppercase">Start City</p>
                  <p className="text-sm font-bold text-stone-900">{yatra.location}</p>
                </div>
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
                  <p className="text-[10px] text-stone-400 font-bold uppercase">Safe Travel</p>
                  <p className="text-sm font-bold text-stone-900">Verified</p>
                </div>
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <CheckCircle2 className="w-5 h-5 text-orange-500 mb-2" />
                  <p className="text-[10px] text-stone-400 font-bold uppercase">Assistance</p>
                  <p className="text-sm font-bold text-stone-900">24/7 Support</p>
                </div>
              </div>

              <div className="prose prose-stone max-w-none">
                <h3 className="text-xl font-bold mb-4">About the Journey</h3>
                <p className="text-stone-600 leading-relaxed">
                  {yatra.description}
                </p>
              </div>

              {yatra.itinerary && yatra.itinerary.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-xl font-bold mb-6">Itinerary Highlights</h3>
                  <div className="space-y-6">
                    {yatra.itinerary.map((item, idx) => (
                      <div key={idx} className="flex gap-6">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            Day {item.day || idx + 1}
                          </div>
                          {idx < yatra.itinerary!.length - 1 && (
                            <div className="w-0.5 h-full bg-stone-200 my-2" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-stone-900 mb-1">{item.title}</h4>
                          <p className="text-stone-600 text-sm leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Booking Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-stone-200 shadow-xl sticky top-24">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Starts from</span>
                  <div className="flex items-center text-3xl font-serif font-bold text-orange-600">
                    <IndianRupee className="w-6 h-6" />
                    <span>{yatra.price}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-stone-400 font-bold">PER PERSON</p>
                  <p className="text-xs text-stone-500">Includes all taxes</p>
                </div>
              </div>

              <div className="space-y-6 mb-8 pt-6 border-t border-stone-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Inclusions</h4>
                    <ul className="space-y-3">
                      {(yatra.included || ['Accommodation', 'Satvik Meals', 'Local Transport']).map(item => (
                        <li key={item} className="flex items-center text-sm text-stone-600">
                          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Exclusions</h4>
                    <ul className="space-y-3">
                      {(yatra.excluded || ['Personal expenses', 'Airfare']).map(item => (
                        <li key={item} className="flex items-center text-sm text-stone-600/60">
                          <div className="w-4 h-4 mr-2 border border-stone-200 rounded-full flex items-center justify-center text-[10px]">✕</div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                >
                  Book This Yatra
                </button>
                <button className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-stone-800 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  Call for Inquiry
                </button>
              </div>

              {vendor && (
                <div className="mt-10 pt-10 border-t border-stone-100">
                  <p className="text-[10px] font-bold text-stone-400 uppercase mb-4">Organized By</p>
                  <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl">
                    <img 
                      src={vendor.photoURL || `https://picsum.photos/seed/${vendor.uid}/100/100`} 
                      alt={vendor.businessName}
                      className="w-12 h-12 rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h5 className="font-bold text-stone-900 text-sm">{vendor.businessName}</h5>
                      <p className="text-[10px] text-stone-500">{vendor.type.toUpperCase()} • {vendor.location?.lat ? 'Verified Location' : 'Online Operator'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {yatra && (
        <YatraBookingModal 
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          yatra={yatra}
        />
      )}
    </div>
  );
}
