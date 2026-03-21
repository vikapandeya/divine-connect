import React, { useState, useEffect } from 'react';
import { Puja } from '../types';
import { motion } from 'framer-motion';
import { Flame, Clock, IndianRupee, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Services() {
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPujas = async () => {
      try {
        const response = await fetch('/api/pujas');
        if (response.ok) {
          const data = await response.json();
          setPujas(data);
        }
      } catch (error) {
        console.error('Error fetching pujas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPujas();
  }, []);

  // Mock data if Firestore is empty
  const displayPujas = pujas.length > 0 ? pujas : [
    {
      id: '1',
      title: 'Ganesh Puja',
      description: 'Invoke the blessings of Lord Ganesha for new beginnings and removing obstacles.',
      price: 2100,
      duration: '1.5 Hours',
      samagriIncluded: true
    },
    {
      id: '2',
      title: 'Satyanarayan Katha',
      description: 'A sacred ritual dedicated to Lord Vishnu for peace, prosperity, and happiness.',
      price: 5100,
      duration: '3 Hours',
      samagriIncluded: true
    },
    {
      id: '3',
      title: 'Lakshmi Puja',
      description: 'Attract wealth and prosperity with this special puja dedicated to Goddess Lakshmi.',
      price: 3500,
      duration: '2 Hours',
      samagriIncluded: true
    },
    {
      id: '4',
      title: 'Maha Mrityunjaya Jaap',
      description: 'Powerful Vedic chanting for health, longevity, and spiritual protection.',
      price: 11000,
      duration: '5 Hours',
      samagriIncluded: true
    }
  ];

  return (
    <div className="pb-20">
      <section className="relative h-[40vh] flex items-center overflow-hidden mb-12">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/puja-hero/1920/1080?blur=2"
            alt="Sacred Services"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">
              Sacred Puja Services
            </h1>
            <p className="text-lg text-stone-200 max-w-2xl mx-auto">
              Connect with experienced pandits for authentic Vedic rituals performed with devotion and precision.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayPujas.map((puja, index) => (
          <motion.div
            key={puja.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-3xl border border-stone-200 overflow-hidden hover:shadow-xl transition-all flex flex-col"
          >
            <div className="h-48 bg-orange-100 relative overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/${puja.id}/800/400`} 
                alt={puja.title} 
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-stone-900">Popular</span>
              </div>
            </div>
            
            <div className="p-8 flex-grow">
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-3">{puja.title}</h3>
              <p className="text-stone-600 text-sm mb-6 line-clamp-2">{puja.description}</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-stone-500 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Duration: {puja.duration}</span>
                </div>
                <div className="flex items-center text-stone-500 text-sm">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                  <span>Samagri Included</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-stone-100">
                <div className="flex items-center text-2xl font-serif font-bold text-orange-600">
                  <IndianRupee className="w-5 h-5" />
                  <span>{puja.price}</span>
                </div>
                <Link 
                  to={`/services/puja/${puja.id}`}
                  className="bg-stone-900 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-500 transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);
}
