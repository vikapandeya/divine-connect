import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, ArrowRight, Info, CheckCircle2, Phone, Mail, Clock, MessageSquare, Star, ShieldCheck, Plane } from 'lucide-react';
import { Link } from 'react-router-dom';

const yatraPackages = [
  {
    id: 'char-dham',
    title: 'Char Dham Yatra',
    description: 'A sacred journey to Yamunotri, Gangotri, Kedarnath, and Badrinath.',
    duration: '12 Days / 11 Nights',
    location: 'Uttarakhand',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800',
    price: '₹25,000 onwards',
  },
  {
    id: 'amarnath',
    title: 'Amarnath Yatra',
    description: 'Experience the divine presence of Lord Shiva in the holy cave.',
    duration: '5 Days / 4 Nights',
    location: 'Jammu & Kashmir',
    image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&q=80&w=800',
    price: '₹15,000 onwards',
  },
  {
    id: 'vaishno-devi',
    title: 'Vaishno Devi Yatra',
    description: 'A spiritual trek to the holy shrine of Mata Vaishno Devi.',
    duration: '3 Days / 2 Nights',
    location: 'Katra, J&K',
    image: 'https://images.unsplash.com/photo-1621360241104-79948730b474?auto=format&fit=crop&q=80&w=800',
    price: '₹5,000 onwards',
  },
  {
    id: 'kashi-vishwanath',
    title: 'Kashi Vishwanath Darshan',
    description: 'Explore the spiritual heart of India in the ancient city of Varanasi.',
    duration: '4 Days / 3 Nights',
    location: 'Varanasi, UP',
    image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&q=80&w=800',
    price: '₹8,000 onwards',
  },
];

const inclusions = [
  'Comfortable Accommodation',
  'Pure Veg Satvik Meals',
  'Guided Temple Tours',
  'VIP Darshan Assistance',
  'Safe Transportation',
  'Spiritual Sessions',
];

export default function Yatra() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    yatra: 'Char Dham Yatra',
    date: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setIsSuccess(true);
        setFormData({ name: '', phone: '', yatra: 'Char Dham Yatra', date: '', message: '' });
        setTimeout(() => setIsSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-950 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero/temples-hero.png"
            alt="Yatra Banner"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-8">
              <img 
                src="/logo/full-logo.svg" 
                alt="PunyaSeva" 
                className="h-20 w-auto brightness-0 invert" 
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
              Divine Yatra Services
            </h1>
            <p className="text-xl text-stone-200 max-w-3xl mx-auto leading-relaxed">
              Embark on a soul-stirring journey to the most sacred pilgrimage sites in India. 
              We handle all arrangements so you can focus on your spiritual connection.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Packages */}
          <div className="lg:col-span-2 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {yatraPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-stone-900 rounded-[2.5rem] overflow-hidden border border-stone-200 dark:border-stone-800 shadow-xl group"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                      {pkg.location}
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-4 text-stone-500 dark:text-stone-400 text-sm mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{pkg.duration}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-3">
                      {pkg.title}
                    </h3>
                    <p className="text-stone-600 dark:text-stone-400 text-sm mb-6 leading-relaxed">
                      {pkg.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-orange-600 dark:text-orange-400 font-bold">
                        {pkg.price}
                      </span>
                      <button className="bg-stone-900 dark:bg-stone-800 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-orange-500 transition-colors">
                        Enquire Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Why Choose Us */}
            <section className="bg-orange-50 dark:bg-orange-900/10 rounded-[3rem] p-10 md:p-16 border border-orange-100 dark:border-orange-900/20">
              <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white mb-8 text-center">
                Why Choose Our Yatra Services?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-stone-800 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Users className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-white mb-2">Expert Guides</h4>
                    <p className="text-stone-600 dark:text-stone-400 text-sm">Experienced spiritual guides who know the history and significance of every site.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-stone-800 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Info className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-white mb-2">Complete Assistance</h4>
                    <p className="text-stone-600 dark:text-stone-400 text-sm">From registration to VIP darshan, we handle all the logistics for you.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-8">
            {/* Inquiry Form */}
            <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 border border-stone-200 dark:border-stone-800 shadow-xl sticky top-24">
              <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-6">
                Plan Your Journey
              </h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                    placeholder="Your Name" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                    placeholder="+91 00000 00000" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Select Yatra</label>
                  <select 
                    value={formData.yatra}
                    onChange={(e) => setFormData({ ...formData, yatra: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    {yatraPackages.map(pkg => (
                      <option key={pkg.id} value={pkg.title}>{pkg.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Preferred Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Message (Optional)</label>
                  <textarea 
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                    placeholder="Any special requirements?"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                  <ArrowRight className="w-4 h-4" />
                </button>
                {isSuccess && (
                  <p className="text-green-500 text-sm text-center font-medium mt-4">
                    Inquiry sent successfully! We'll contact you soon.
                  </p>
                )}
              </form>

              <div className="mt-10 pt-10 border-t border-stone-100 dark:border-stone-800">
                <h4 className="font-bold text-stone-900 dark:text-white mb-6">What's Included?</h4>
                <ul className="space-y-4">
                  {inclusions.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-stone-600 dark:text-stone-400 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 p-6 bg-stone-50 dark:bg-stone-800/50 rounded-2xl">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Need Help?</p>
                <div className="space-y-3">
                  <a href="tel:+911234567890" className="flex items-center gap-3 text-stone-700 dark:text-stone-300 hover:text-orange-500 transition-colors">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">+91 12345 67890</span>
                  </a>
                  <a href="mailto:yatra@punyaseva.in" className="flex items-center gap-3 text-stone-700 dark:text-stone-300 hover:text-orange-500 transition-colors">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">yatra@punyaseva.in</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
