import React from 'react';
import { motion } from 'framer-motion';
import { Github, Heart, Shield, Globe, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-stone-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Star className="w-4 h-4" />
            <span>Our Mission</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-serif font-bold text-stone-900 mb-8"
          >
            Bridging the <span className="text-orange-500 italic">Divine</span> & the <span className="text-orange-500 italic">Digital</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-stone-600 leading-relaxed"
          >
            DivineConnect is a platform dedicated to making spiritual services accessible to everyone, everywhere. 
            We believe that technology can be a powerful tool to foster faith and connect devotees with sacred traditions.
          </motion.p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {[
            {
              icon: <Heart className="w-8 h-8 text-red-500" />,
              title: "Devotion First",
              desc: "Every service we provide is rooted in deep respect for spiritual traditions."
            },
            {
              icon: <Shield className="w-8 h-8 text-blue-500" />,
              title: "Authentic & Secure",
              desc: "We partner only with verified temples and vendors to ensure authenticity."
            },
            {
              icon: <Globe className="w-8 h-8 text-emerald-500" />,
              title: "Global Reach",
              desc: "Bringing the sacred energy of holy sites to devotees across the globe."
            }
          ].map((value, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 text-center"
            >
              <div className="flex justify-center mb-6">{value.icon}</div>
              <h3 className="text-xl font-bold text-stone-900 mb-4">{value.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{value.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Developer Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-stone-900 rounded-[3rem] p-12 text-white overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="w-48 h-48 rounded-[2rem] overflow-hidden border-4 border-white/10 shrink-0">
              <img 
                src="https://github.com/vikapandeya.png" 
                alt="Vikash Pandey" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h2 className="text-3xl font-serif font-bold mb-4">Meet the Developer</h2>
              <p className="text-stone-400 text-lg mb-8 leading-relaxed">
                Hi, I&apos;m <span className="text-white font-bold">Vikash Pandey</span>. I&apos;m building DivineConnect to make spiritual services feel trustworthy, accessible, and beautifully connected online.
                My focus is on blending thoughtful product design with practical full-stack engineering so devotees get a smooth and meaningful experience.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <a 
                  href="https://github.com/vikapandeya" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl transition-all font-bold"
                >
                  <Github className="w-5 h-5" />
                  <span>GitHub Profile</span>
                </a>
                <Link 
                  to="/contact" 
                  className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-2xl transition-all font-bold"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>Contact Us</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
