import React from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Hand,
  Utensils,
  BookOpen,
  ArrowRight,
  Star,
  ShoppingCart,
  IndianRupee,
  Sparkles,
  Quote,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { addToCart } from '../lib/cart';
import { formatIndianRupees } from '../lib/utils';

const services = [
  {
    id: 'puja',
    title: 'Puja Booking',
    description: 'Book pandit and puja online for any occasion.',
    icon: <Flame className="w-8 h-8 text-orange-500" />,
    color: 'bg-orange-50',
    link: '/services/puja',
  },
  {
    id: 'darshan',
    title: 'Darshan',
    description: 'Reserve temple darshan guidance and plan your visit with ease.',
    icon: <Hand className="w-8 h-8 text-blue-500" />,
    color: 'bg-blue-50',
    link: '/contact',
  },
  {
    id: 'prasad',
    title: 'Prasad',
    description: 'Order authentic temple prasad delivered to your door.',
    icon: <Utensils className="w-8 h-8 text-emerald-500" />,
    color: 'bg-emerald-50',
    link: '/shop',
  },
  {
    id: 'books',
    title: 'Spiritual Books',
    description: 'Explore our collection of sacred texts and e-books.',
    icon: <BookOpen className="w-8 h-8 text-purple-500" />,
    color: 'bg-purple-50',
    link: '/shop?category=books',
  },
  {
    id: 'astrology',
    title: 'AI Astrology',
    description: 'Get guided astrological insights after sign-in from our AI assistant.',
    icon: <Sparkles className="w-8 h-8 text-amber-500" />,
    color: 'bg-amber-50',
    link: '/astrology',
  },
];

const featuredProducts = [
  {
    id: '1',
    name: 'Brass Ganesha Idol',
    price: 1299,
    image: 'https://picsum.photos/seed/ganesha/400/400',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Natural Sandalwood Incense',
    price: 250,
    image: 'https://picsum.photos/seed/incense/400/400',
    rating: 4.5,
  },
  {
    id: '3',
    name: 'Rudraksha Mala (108 Beads)',
    price: 599,
    image: 'https://picsum.photos/seed/mala/400/400',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Handcrafted Puja Thali',
    price: 850,
    image: 'https://picsum.photos/seed/thali/400/400',
    rating: 4.7,
  },
];

const feedback = [
  {
    name: 'Anjali Sharma',
    city: 'Mumbai',
    rating: 5,
    message:
      'Booking a Satyanarayan Puja felt smooth and respectful. The experience was simple even for my family elders.',
  },
  {
    name: 'Rohan Iyer',
    city: 'Bengaluru',
    rating: 5,
    message:
      'The product flow is clean, and I liked that I could find essentials quickly without feeling lost in the catalog.',
  },
  {
    name: 'Meera Kapoor',
    city: 'Delhi',
    rating: 4.9,
    message:
      'The platform feels warm and trustworthy. I would especially recommend the guided support and puja discovery flow.',
  },
];

const ratingStats = [
  { label: 'Average Rating', value: '4.9/5' },
  { label: 'Verified Reviews', value: '2,100+' },
  { label: 'Repeat Users', value: '78%' },
];

export default function Home() {
  return (
    <div className="space-y-20 pb-20">
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/temple/1920/1080?blur=2"
            alt="Spiritual Background"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-6">
              Connect with the <span className="text-orange-400">Divine</span> from
              Anywhere
            </h1>
            <p className="text-xl text-stone-100 mb-8 leading-relaxed">
              Experience sacred rituals, book darshans, and shop for spiritual
              essentials on India&apos;s most trusted spiritual platform.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/services/puja"
                className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 text-center"
              >
                Book a Puja
              </Link>
              <Link
                to="/shop"
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all text-center"
              >
                Explore Shop
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">
            Sacred Services
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Choose from a variety of spiritual services tailored to your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white p-8 rounded-3xl border border-stone-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all"
            >
              <div
                className={`${service.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">
                {service.title}
              </h3>
              <p className="text-stone-600 text-sm mb-6 leading-relaxed">
                {service.description}
              </p>
              <Link
                to={service.link}
                className="flex items-center text-orange-500 font-bold text-sm group-hover:translate-x-1 transition-transform"
              >
                Explore <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-stretch">
          <div className="bg-stone-900 text-white rounded-[3rem] p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.3),_transparent_35%)]" />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-300 mb-4">
                Feedback & Rating
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                Loved by devotees looking for trust, clarity, and ease.
              </h2>
              <p className="text-stone-300 leading-relaxed mb-8">
                User feedback matters because this platform is built for moments
                that feel personal. We focus on making each journey feel simple,
                respectful, and reliable.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ratingStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[2rem] bg-white/5 border border-white/10 px-5 py-6"
                  >
                    <p className="text-3xl font-serif font-bold text-white mb-2">
                      {stat.value}
                    </p>
                    <p className="text-sm text-stone-300">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {feedback.map((item) => (
              <div
                key={item.name}
                className="bg-white rounded-[2rem] border border-stone-200 p-6 shadow-sm"
              >
                <Quote className="w-8 h-8 text-orange-200 mb-5" />
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(item.rating)
                          ? 'text-orange-500 fill-orange-500'
                          : 'text-stone-200'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-bold text-stone-700">
                    {item.rating}
                  </span>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-6">
                  {item.message}
                </p>
                <div>
                  <p className="font-bold text-stone-900">{item.name}</p>
                  <p className="text-sm text-stone-500">{item.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">
                Spiritual Essentials
              </h2>
              <p className="text-stone-600">
                Handpicked items for your daily spiritual practice.
              </p>
            </div>
            <Link
              to="/shop"
              className="hidden sm:flex items-center text-orange-500 font-bold hover:underline"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200 group"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-stone-900">
                      {product.rating}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-stone-900 mb-1">{product.name}</h3>
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center text-lg font-serif font-bold text-orange-600">
                      <IndianRupee className="w-4 h-4" />
                      <span>{formatIndianRupees(product.price)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="bg-stone-900 text-white p-2 rounded-xl hover:bg-orange-500 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-orange-500 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <Star className="w-12 h-12 text-orange-200 mx-auto mb-8 fill-orange-200" />
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 italic">
              &quot;DivineConnect has made it so easy for me to stay connected
              with my roots. Booking a Satyanarayan Puja was seamless and the
              pandit was very knowledgeable.&quot;
            </h2>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-orange-400 border-2 border-white/20" />
              <div className="text-left">
                <p className="font-bold">Anjali Sharma</p>
                <p className="text-orange-100 text-sm">Devotee from Mumbai</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
