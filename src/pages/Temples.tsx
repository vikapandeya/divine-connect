import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, ArrowRight, Search, Filter, Info, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const temples = [
  {
    id: 'kashi',
    name: 'Kashi Vishwanath Temple',
    location: 'Varanasi, Uttar Pradesh',
    image: 'https://picsum.photos/seed/kashi/800/600',
    description: 'One of the most famous Hindu temples dedicated to Lord Shiva. It is located in Varanasi, the holiest city for Hindus.',
    rating: 4.9,
    services: ['Puja', 'Prasad Delivery', 'Darshan Guidance'],
    history: 'The temple has been destroyed and rebuilt several times throughout history. The current structure was built by Ahilyabai Holkar in 1780.'
  },
  {
    id: 'tirupati',
    name: 'Tirupati Balaji Temple',
    location: 'Tirumala, Andhra Pradesh',
    image: 'https://picsum.photos/seed/tirupati/800/600',
    description: 'Dedicated to Lord Venkateswara, an incarnation of Vishnu, who is believed to have appeared here to save mankind from trials and troubles of Kali Yuga.',
    rating: 5.0,
    services: ['Laddu Prasad', 'Special Entry Darshan', 'Seva Booking'],
    history: 'The temple is one of the richest temples in the world in terms of donations received and wealth.'
  },
  {
    id: 'somnath',
    name: 'Somnath Temple',
    location: 'Prabhas Patan, Gujarat',
    image: 'https://picsum.photos/seed/somnath/800/600',
    description: 'The first among the twelve Jyotirlinga shrines of Shiva. It is an important pilgrimage and tourist spot of Gujarat.',
    rating: 4.8,
    services: ['Aarti Booking', 'Prasad Delivery', 'Accommodation'],
    history: 'Known as "the Eternal Shrine", it has been destroyed by many invaders and rebuilt several times.'
  },
  {
    id: 'meenakshi',
    name: 'Meenakshi Amman Temple',
    location: 'Madurai, Tamil Nadu',
    image: 'https://picsum.photos/seed/madurai/800/600',
    description: 'A historic Hindu temple located on the southern bank of the Vaigai River in the temple city of Madurai.',
    rating: 4.9,
    services: ['Guided Tour', 'Special Puja', 'Cultural Events'],
    history: 'The temple forms the heart and lifeline of the 2,500-year-old city of Madurai.'
  },
  {
    id: 'jagannath',
    name: 'Jagannath Temple',
    location: 'Puri, Odisha',
    image: 'https://picsum.photos/seed/puri/800/600',
    description: 'An important Hindu temple dedicated to Jagannath, a form of Vishnu, in Puri in the state of Odisha on the eastern coast of India.',
    rating: 4.8,
    services: ['Mahaprasad', 'Ratha Yatra Guidance', 'Puja'],
    history: 'The temple is famous for its annual Ratha Yatra, or chariot festival.'
  }
];

export default function Temples() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemple, setSelectedTemple] = useState<any>(null);

  const filteredTemples = temples.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-20 bg-white dark:bg-stone-950 transition-colors duration-300">
      <section className="relative h-[50vh] flex items-center overflow-hidden mb-12">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/temples-hero/1920/1080?blur=2"
            alt="Famous Temples of India"
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
            <div className="flex justify-center mb-8">
              <img 
                src="/logo/full-logo.png" 
                alt="PunyaSeva" 
                className="h-20 w-auto brightness-0 invert" 
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">
              Famous Temples
            </h1>
            <p className="text-lg text-stone-200 max-w-2xl mx-auto">
              Explore the spiritual heritage of India and book services directly from these sacred sites.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by temple name or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-4 text-sm font-bold text-stone-500">
            <Filter className="w-4 h-4" />
            <span>{filteredTemples.length} Temples Found</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemples.map((temple, index) => (
            <motion.div
              key={temple.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-stone-900 rounded-[2.5rem] overflow-hidden border border-stone-200 dark:border-stone-800 group hover:shadow-2xl transition-all flex flex-col"
            >
              <div className="h-64 overflow-hidden relative">
                <img
                  src={temple.image}
                  alt={temple.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold text-stone-900 dark:text-white">{temple.rating}</span>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-stone-900/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold">
                  <MapPin className="w-3 h-3" />
                  <span>{temple.location}</span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-3 group-hover:text-orange-500 transition-colors">
                  {temple.name}
                </h3>
                <p className="text-stone-600 dark:text-stone-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {temple.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {temple.services.map(service => (
                    <span key={service} className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {service}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between pt-6 border-t border-stone-100 dark:border-stone-800">
                  <button 
                    onClick={() => setSelectedTemple(temple)}
                    className="text-stone-900 dark:text-white font-bold text-sm flex items-center hover:text-orange-500 transition-colors"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    History
                  </button>
                  <Link 
                    to={`/shop?q=${encodeURIComponent(temple.name)}`}
                    className="bg-stone-900 dark:bg-stone-800 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-orange-500 transition-colors flex items-center"
                  >
                    Book Services
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Temple Detail Modal */}
      {selectedTemple && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-stone-900 w-full max-w-3xl rounded-[3rem] overflow-hidden shadow-2xl relative"
          >
            <button 
              onClick={() => setSelectedTemple(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white z-10 transition-all"
            >
              <ArrowRight className="w-6 h-6 rotate-180" />
            </button>
            
            <div className="h-64 relative">
              <img 
                src={selectedTemple.image} 
                alt={selectedTemple.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <h2 className="text-3xl font-serif font-bold text-white mb-2">{selectedTemple.name}</h2>
                <p className="text-stone-300 flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  {selectedTemple.location}
                </p>
              </div>
            </div>

            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4 flex items-center">
                    <Info className="w-4 h-4 mr-2" /> Historical Significance
                  </h4>
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                    {selectedTemple.history}
                  </p>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" /> Available Services
                    </h4>
                    <div className="space-y-3">
                      {selectedTemple.services.map((s: string) => (
                        <div key={s} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700">
                          <span className="text-sm font-bold text-stone-800 dark:text-stone-200">{s}</span>
                          <Link to="/shop" className="text-orange-500 text-xs font-bold hover:underline">Book Now</Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 flex justify-center">
                <button 
                  onClick={() => setSelectedTemple(null)}
                  className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-10 py-4 rounded-full font-bold hover:bg-orange-500 dark:hover:bg-orange-500 dark:hover:text-white transition-all"
                >
                  Close Details
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
