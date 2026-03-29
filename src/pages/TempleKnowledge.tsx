import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Info, ArrowRight, BookOpen, Sparkles, Search, Filter, X, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const temples = [
  {
    id: 1,
    name: "Kashi Vishwanath Temple",
    location: "Varanasi, Uttar Pradesh",
    description: "One of the most famous Hindu temples dedicated to Lord Shiva. It is located in Varanasi, the holiest city for Hindus.",
    image: "https://images.unsplash.com/photo-1590050752117-23a9d7fc6bbd?auto=format&fit=crop&q=80&w=800",
    significance: "One of the twelve Jyotirlingas.",
    category: "Temple"
  },
  {
    id: 2,
    name: "Meenakshi Amman Temple",
    location: "Madurai, Tamil Nadu",
    description: "A historic Hindu temple located on the southern bank of the Vaigai River in the temple city of Madurai.",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800",
    significance: "Dedicated to Meenakshi, a form of Parvati, and her consort, Sundareshwar, a form of Shiva.",
    category: "Temple"
  },
  {
    id: 3,
    name: "Kedarnath Temple",
    location: "Kedarnath, Uttarakhand",
    description: "Located in the Himalayas, this temple is one of the highest and most sacred pilgrimages in India.",
    image: "https://images.unsplash.com/photo-1621360241104-79948730b474?auto=format&fit=crop&q=80&w=800",
    significance: "Part of the Chota Char Dham and one of the twelve Jyotirlingas.",
    category: "Temple"
  },
  {
    id: 4,
    name: "Jagannath Temple",
    location: "Puri, Odisha",
    description: "An important Hindu temple dedicated to Jagannath, a form of Vishnu, in Puri in the state of Odisha.",
    image: "https://images.unsplash.com/photo-1626078436898-9a6745582390?auto=format&fit=crop&q=80&w=800",
    significance: "Famous for its annual Ratha Yatra, or chariot festival.",
    category: "Temple"
  },
  {
    id: 5,
    name: "Golden Temple (Harmandir Sahib)",
    location: "Amritsar, Punjab",
    description: "The preeminent spiritual site of Sikhism, known for its stunning golden architecture and peaceful atmosphere.",
    image: "https://images.unsplash.com/photo-1588096344356-9b64627651e7?auto=format&fit=crop&q=80&w=800",
    significance: "Symbol of human brotherhood and equality.",
    category: "Temple"
  },
  {
    id: 6,
    name: "Somnath Temple",
    location: "Prabhas Patan, Gujarat",
    description: "Located on the western coast of Gujarat, it is believed to be the first among the twelve Jyotirlinga shrines of Shiva.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eaa0ae?auto=format&fit=crop&q=80&w=800",
    significance: "Known as 'The Eternal Shrine' due to its multiple reconstructions.",
    category: "Temple"
  }
];

const tirthplaces = [
  {
    id: 101,
    name: "Varanasi",
    state: "Uttar Pradesh",
    description: "The spiritual capital of India, known for its ghats and the sacred river Ganges.",
    image: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&q=80&w=800",
    category: "Tirth"
  },
  {
    id: 102,
    name: "Rameshwaram",
    state: "Tamil Nadu",
    description: "A sacred island town, part of the Char Dham pilgrimage, where Lord Rama built a bridge to Lanka.",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800",
    category: "Tirth"
  },
  {
    id: 103,
    name: "Haridwar",
    state: "Uttarakhand",
    description: "Where the Ganges leaves the mountains and enters the plains, famous for the Kumbh Mela.",
    image: "https://images.unsplash.com/photo-1590050752117-23a9d7fc6bbd?auto=format&fit=crop&q=80&w=800",
    category: "Tirth"
  }
];

const didYouKnow = [
  {
    title: "The Floating Stone of Rameshwaram",
    fact: "Some stones found in Rameshwaram are said to float on water, believed to be from the bridge built by Lord Rama's army."
  },
  {
    title: "The Unending Kitchen of Jagannath",
    fact: "The kitchen at Jagannath Temple is the largest in the world, where food is cooked in pots stacked one above the other."
  },
  {
    title: "The Eternal Flame of Jwala Ji",
    fact: "In the Jwala Ji temple, a natural flame has been burning for centuries without any known source of fuel."
  }
];

export default function TempleKnowledge() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTemples = useMemo(() => {
    return temples.filter(temple => {
      const matchesSearch = temple.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          temple.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || activeCategory === 'temples';
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const filteredTirths = useMemo(() => {
    return tirthplaces.filter(tirth => {
      const matchesSearch = tirth.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tirth.state.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || activeCategory === 'tirths';
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="pb-20 bg-stone-50 dark:bg-stone-950 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center overflow-hidden mb-12">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=1920"
            alt="Sacred Temples"
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
              Sacred Temples & Tirthplaces
            </h1>
            <p className="text-lg text-stone-200 max-w-2xl mx-auto">
              Explore the rich spiritual heritage of India through its ancient temples and holy pilgrimage sites.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search and Category Bar */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 p-4 mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search temples, cities, or significance..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-stone-800 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all dark:text-white"
              />
            </div>
            <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl">
              {['all', 'temples', 'tirths'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                    activeCategory === cat
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                      : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-24">
          {/* Temples Section */}
          {(activeCategory === 'all' || activeCategory === 'temples') && filteredTemples.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-12">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white">Ancient Temples</h2>
                  <p className="text-stone-500 dark:text-stone-400">Architectural marvels and spiritual centers</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredTemples.map((temple, idx) => (
                    <motion.div
                      key={temple.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="group bg-white dark:bg-stone-900 rounded-[2.5rem] overflow-hidden border border-stone-200 dark:border-stone-800 hover:shadow-2xl transition-all w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1.5rem)] min-w-[300px] max-w-sm"
                    >
                      <div className="h-64 relative overflow-hidden">
                        <img 
                          src={temple.image} 
                          alt={temple.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-6 flex items-center text-white text-sm font-medium">
                          <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                          {temple.location}
                        </div>
                      </div>
                      <div className="p-8">
                        <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-3">{temple.name}</h3>
                        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-6">{temple.description}</p>
                        <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 mb-6">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Significance</p>
                              <p className="text-xs text-stone-700 dark:text-stone-300 font-medium">{temple.significance}</p>
                            </div>
                          </div>
                        </div>
                        <button className="flex items-center text-orange-600 font-bold text-sm group-hover:gap-3 gap-2 transition-all">
                          Read More <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* Did You Know Section */}
          <section>
            <div className="bg-stone-900 dark:bg-orange-950/20 rounded-[3rem] p-12 relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-orange-500/20 p-3 rounded-2xl">
                    <Lightbulb className="w-6 h-6 text-orange-400" />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-white">Did You Know?</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {didYouKnow.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-3xl"
                    >
                      <h4 className="text-orange-400 font-bold text-sm mb-2 uppercase tracking-wider">{item.title}</h4>
                      <p className="text-stone-300 text-sm leading-relaxed">{item.fact}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Tirthplaces Section */}
          {(activeCategory === 'all' || activeCategory === 'tirths') && filteredTirths.length > 0 && (
            <section className="pb-20">
              <div className="flex items-center gap-3 mb-12">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white">Sacred Tirthplaces</h2>
                  <p className="text-stone-500 dark:text-stone-400">Holy pilgrimage sites for spiritual awakening</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredTirths.map((tirth, idx) => (
                    <motion.div
                      key={tirth.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="group relative h-80 rounded-[3rem] overflow-hidden shadow-xl w-full md:w-[calc(50%-1rem)] max-w-lg"
                    >
                      <img 
                        src={tirth.image} 
                        alt={tirth.name} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Tirth</span>
                          <span className="text-stone-300 text-xs font-medium">{tirth.state}</span>
                        </div>
                        <h3 className="text-3xl font-serif font-bold text-white mb-4">{tirth.name}</h3>
                        <p className="text-stone-300 text-sm max-w-md line-clamp-2 group-hover:line-clamp-none transition-all duration-500">{tirth.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {filteredTemples.length === 0 && filteredTirths.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-200 dark:border-stone-800">
              <div className="bg-stone-100 dark:bg-stone-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-2">No results found</h3>
              <p className="text-stone-500 dark:text-stone-400 mb-6">Try adjusting your search query or category.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="bg-stone-900 dark:bg-stone-700 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-500 transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
