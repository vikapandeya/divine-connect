import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Product, PRODUCT_CATEGORIES, VendorProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, Search, IndianRupee, X, Eye, Heart, Store, Info } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { addToCart } from '../lib/cart';
import { formatIndianRupees } from '../lib/utils';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../lib/wishlist';
import { auth } from '../firebase';
import AIGroundedSearch from '../components/AIGroundedSearch';

const categories = ['all', ...PRODUCT_CATEGORIES];

const fallbackProducts = [
  // ── IDOLS ──────────────────────────────────────────────────────────────────
  { id: 'i1', vendorId: 'system', name: 'Brass Ganesha Idol', category: 'Idols', price: 1250, rating: 4.8, stock: 50,
    description: 'Handcrafted pure brass Lord Ganesha idol for home temple. Intricately detailed with traditional motifs, perfect for daily worship and gifting.',
    image: '/products/ganesha-idol.jpg' },
  { id: 'i2', vendorId: 'system', name: 'Marble Radha Krishna Idol', category: 'Idols', price: 2499, rating: 4.9, stock: 30,
    description: 'Beautiful white marble Radha Krishna murti, hand-carved by Rajasthani artisans. Ideal for home temple and as an auspicious gift.',
    image: '/products/radha-krishna-idol.jpg' },
  { id: 'i3', vendorId: 'system', name: 'Brass Shiva Parivar Idol', category: 'Idols', price: 3999, rating: 4.8, stock: 20,
    description: 'Elegant brass Shiva family idol depicting Lord Shiva with Parvati, Ganesha and Kartikeya. A divine centrepiece for your prayer space.',
    image: '/products/shiva-idol.jpg' },
  { id: 'i4', vendorId: 'system', name: 'Hanuman Ji Murti', category: 'Idols', price: 899, rating: 4.7, stock: 75,
    description: 'Devotional Hanuman Ji murti in sitting posture, finished in antique brass. Believed to bestow courage, protection and strength.',
    image: '/products/hanuman-murti.jpg' },
  { id: 'i5', vendorId: 'system', name: 'Lakshmi Ganesh Idol Set', category: 'Idols', price: 1999, rating: 4.9, stock: 40,
    description: 'Auspicious Lakshmi-Ganesh brass idol set, perfect for Diwali puja and housewarming. Brings wealth, prosperity and new beginnings.',
    image: '/products/lakshmi-ganesh-set.jpg' },

  // ── INCENSE ────────────────────────────────────────────────────────────────
  { id: 'in1', vendorId: 'system', name: 'Sandalwood Incense Sticks', category: 'Incense', price: 150, rating: 4.6, stock: 200,
    description: 'Premium Mysore sandalwood agarbatti, each stick burns 45–60 minutes. Fills your space with a calming divine aroma ideal for puja and meditation.',
    image: '/products/incense-sticks.jpg' },
  { id: 'in2', vendorId: 'system', name: 'Rose Agarbatti Premium Pack', category: 'Incense', price: 120, rating: 4.5, stock: 300,
    description: 'Pure rose-fragrance agarbatti sourced from Indian rose farms. Long-lasting, charcoal-free sticks for daily worship and relaxation.',
    image: '/products/incense-sticks.jpg' },
  { id: 'in3', vendorId: 'system', name: 'Guggal Dhoop Sticks', category: 'Incense', price: 180, rating: 4.7, stock: 150,
    description: 'Authentic Guggal dhoop sticks prepared using traditional Ayurvedic resin. Purifies the environment and wards off negative energy.',
    image: '/products/dhoop-sticks.jpg' },
  { id: 'in4', vendorId: 'system', name: 'Jasmine Incense Cones', category: 'Incense', price: 99, rating: 4.4, stock: 250,
    description: 'Handrolled jasmine incense cones with gentle, floral fragrance. Perfect for meditation, yoga sessions and evening puja.',
    image: '/products/incense-cones.jpg' },
  { id: 'in5', vendorId: 'system', name: 'Temple Fragrance Combo Pack', category: 'Incense', price: 299, rating: 4.8, stock: 100,
    description: 'Curated combo of 5 temple fragrances — sandalwood, rose, jasmine, camphor and kevda. 200 sticks in premium gift packaging.',
    image: '/products/incense-sticks.jpg' },

  // ── MALA ───────────────────────────────────────────────────────────────────
  { id: 'm1', vendorId: 'system', name: '108 Bead Rudraksha Mala', category: 'Mala', price: 499, rating: 4.9, stock: 100,
    description: 'Original 108+1 beads Panchmukhi Rudraksha mala from Nepal. Energized and blessed as per Vedic rituals — ideal for japa and spiritual protection.',
    image: '/products/rudraksha-mala.jpg' },
  { id: 'm2', vendorId: 'system', name: 'Tulsi Japa Mala', category: 'Mala', price: 299, rating: 4.7, stock: 150,
    description: 'Sacred Vrindavan Tulsi wood japa mala, hand-knotted with 108 beads. Revered by Vaishnavas for chanting and meditation.',
    image: '/products/tulsi-mala.jpg' },
  { id: 'm3', vendorId: 'system', name: 'Sphatik Crystal Mala', category: 'Mala', price: 999, rating: 4.8, stock: 60,
    description: 'Natural clear quartz Sphatik crystal mala with 108 beads. Amplifies positive energy, enhances focus and is prized for Goddess Saraswati puja.',
    image: '/products/crystal-mala.jpg' },
  { id: 'm4', vendorId: 'system', name: 'Chandan Mala', category: 'Mala', price: 599, rating: 4.6, stock: 80,
    description: 'Authentic sandalwood (chandan) mala with 108 beads. Naturally fragrant, cool to touch and traditionally used for Vishnu and Shiva mantras.',
    image: '/products/rudraksha-mala.jpg' },
  { id: 'm5', vendorId: 'system', name: 'Five Mukhi Rudraksha Mala', category: 'Mala', price: 799, rating: 4.9, stock: 50,
    description: 'Premium Five-Mukhi (Panchmukhi) Rudraksha mala, representing Lord Shiva. Promotes calmness, clarity and spiritual well-being.',
    image: '/products/rudraksha-mala.jpg' },

  // ── BOOKS ──────────────────────────────────────────────────────────────────
  { id: 'b1', vendorId: 'system', name: 'Bhagavad Gita Deluxe Edition', category: 'Books', price: 599, rating: 5.0, stock: 75,
    description: 'Srila Prabhupada\'s Bhagavad Gita As It Is — deluxe hardbound with Sanskrit shlokas, transliteration, word-for-word meanings and commentary.',
    image: '/products/bhagavad-gita.jpg' },
  { id: 'b2', vendorId: 'system', name: 'Ramayana Illustrated Edition', category: 'Books', price: 799, rating: 4.8, stock: 50,
    description: 'Valmiki Ramayana in English — beautifully illustrated collector\'s edition with 200+ colour plates depicting key scenes from the epic.',
    image: '/products/ramayana-book.jpg' },
  { id: 'b3', vendorId: 'system', name: 'Vishnu Sahasranama', category: 'Books', price: 299, rating: 4.7, stock: 120,
    description: 'Complete Vishnu Sahasranama with Sanskrit text, Roman transliteration, meaning and significance of all 1000 names of Lord Vishnu.',
    image: '/products/bhagavad-gita.jpg' },
  { id: 'b4', vendorId: 'system', name: 'Hanuman Chalisa Hardcover', category: 'Books', price: 199, rating: 4.6, stock: 200,
    description: 'Elegant hardcover Hanuman Chalisa with original Awadhi text, Hindi translation and colour illustrations. A devotional treasure for every home.',
    image: '/products/hanuman-chalisa.jpg' },
  { id: 'b5', vendorId: 'system', name: 'Shiva Purana Essentials', category: 'Books', price: 699, rating: 4.9, stock: 40,
    description: 'Curated Shiva Purana essentials — creation stories, Shiva Sahasranama, Rudrashtakam and key rituals from the original Mahapurana.',
    image: '/products/bhagavad-gita.jpg' },

  // ── YANTRAS ────────────────────────────────────────────────────────────────
  { id: 'y1', vendorId: 'system', name: 'Shri Yantra Copper Plate', category: 'Yantras', price: 799, rating: 4.8, stock: 45,
    description: 'Geometrically precise energized copper Shri Yantra for prosperity and positive energy. Consecrated under specific Vedic planetary configurations.',
    image: '/products/shri-yantra.jpg' },
  { id: 'y2', vendorId: 'system', name: 'Kuber Yantra', category: 'Yantras', price: 999, rating: 4.7, stock: 35,
    description: 'Energized Kuber Yantra for wealth attraction and financial abundance. Etched on pure copper, consecrated during Pushya Nakshatra.',
    image: '/products/kuber-yantra.jpg' },
  { id: 'y3', vendorId: 'system', name: 'Maha Mrityunjaya Yantra', category: 'Yantras', price: 899, rating: 4.9, stock: 30,
    description: 'Sacred Maha Mrityunjaya Yantra for health, longevity and protection from negativity. Hand-engraved on pure copper plate.',
    image: '/products/shri-yantra.jpg' },
  { id: 'y4', vendorId: 'system', name: 'Navgraha Yantra', category: 'Yantras', price: 1299, rating: 4.8, stock: 25,
    description: 'Powerful Navgraha Yantra representing all nine planets. Balances planetary energies and removes doshas affecting career and relationships.',
    image: '/products/kuber-yantra.jpg' },
  { id: 'y5', vendorId: 'system', name: 'Lakshmi Prosperity Yantra', category: 'Yantras', price: 699, rating: 4.7, stock: 50,
    description: 'Lakshmi Yantra etched on gold-plated copper, ideal for attracting wealth and success. Install in home puja room or business premises.',
    image: '/products/shri-yantra.jpg' },

  // ── PRASAD ─────────────────────────────────────────────────────────────────
  { id: 'p1', vendorId: 'system', name: 'Tirupati Laddu Prasad', category: 'Prasad', price: 299, rating: 5.0, stock: 50,
    description: 'Authentic Tirupati Balaji Temple Laddu Prasad prepared by temple priests using the original sacred recipe. Carries divine blessings of Lord Venkateswara.',
    image: '/products/tirupati-laddu.jpg', templeName: 'Tirupati Balaji',
    weightOptions: [{ label: '1 Unit', price: 299 }, { label: '2 Units', price: 549 }] },
  { id: 'p2', vendorId: 'system', name: 'Panchmewa Prasad Pack', category: 'Prasad', price: 249, rating: 4.8, stock: 80,
    description: 'Auspicious Panchmewa prasad blend of five dried fruits — cashews, raisins, almonds, dates and pistachios. Offered during Satyanarayan puja.',
    image: '/products/kashi-prasad.jpg',
    weightOptions: [{ label: '250g', price: 249 }, { label: '500g', price: 449 }] },
  { id: 'p3', vendorId: 'system', name: 'Mishri Bhog Pack', category: 'Prasad', price: 149, rating: 4.6, stock: 120,
    description: 'Pure rock sugar Mishri (crystallized sugar) for bhog offering. Used in milk prasad, charnamrit preparation and as naivedyam to deities.',
    image: '/products/kashi-prasad.jpg',
    weightOptions: [{ label: '250g', price: 149 }, { label: '500g', price: 249 }] },
  { id: 'p4', vendorId: 'system', name: 'Kashi Vishwanath Prasad', category: 'Prasad', price: 299, rating: 4.9, stock: 60,
    description: 'Special Ladoo Prasad from Kashi Vishwanath Temple, Varanasi. Freshly prepared by temple priests with the blessings of Lord Shiva.',
    image: '/products/kashi-prasad.jpg', templeName: 'Kashi Vishwanath',
    weightOptions: [{ label: '250g', price: 299 }, { label: '500g', price: 549 }] },
  { id: 'p5', vendorId: 'system', name: 'Charnamrit Prasad Kit', category: 'Prasad', price: 199, rating: 4.7, stock: 90,
    description: 'Complete charnamrit preparation kit with Gangajal, milk, curd, honey, ghee and Tulsi. Everything needed for abhishek and prasad offering.',
    image: '/products/kashi-prasad.jpg' },

  // ── PUJA ESSENTIALS ────────────────────────────────────────────────────────
  { id: 'pe1', vendorId: 'system', name: 'Brass Puja Thali Set', category: 'Puja Essentials', price: 799, rating: 4.8, stock: 60,
    description: 'Complete brass puja thali set with diya, incense holder, small bell, kumkum container and aarti plate. Elegantly engraved for daily worship.',
    image: '/products/puja-thali.jpg' },
  { id: 'pe2', vendorId: 'system', name: 'Copper Kalash', category: 'Puja Essentials', price: 699, rating: 4.7, stock: 45,
    description: 'Pure copper kalash for Vastu puja, Griha Pravesh and all Vedic rituals. Storing water in copper kalash carries significant spiritual merit.',
    image: '/products/copper-kalash.jpg' },
  { id: 'pe3', vendorId: 'system', name: 'Brass Temple Bell', category: 'Puja Essentials', price: 399, rating: 4.6, stock: 80,
    description: 'Resonant brass puja bell with Om engraving and wooden handle. The sound of the bell dispels negative energy and invites divine presence.',
    image: '/products/brass-bell.jpg' },
  { id: 'pe4', vendorId: 'system', name: 'Camphor Pack (Bhimseni)', category: 'Puja Essentials', price: 149, rating: 4.5, stock: 200,
    description: 'Pure Bhimseni camphor for aarti and havan. Naturally sourced, burns clean without residue and releases divine fragrance during puja.',
    image: '/products/brass-diya.jpg',
    weightOptions: [{ label: '50g', price: 149 }, { label: '100g', price: 269 }] },
  { id: 'pe5', vendorId: 'system', name: 'Akhand Jyot Diya', category: 'Puja Essentials', price: 499, rating: 4.9, stock: 55,
    description: 'Handcrafted brass akhand diya for continuous flame during Navratri and auspicious vrats. Deep-set bowl holds oil for 24–48 hour burning.',
    image: '/products/brass-diya.jpg' },

  // ── SAMAGRI KITS ───────────────────────────────────────────────────────────
  { id: 'sk1', vendorId: 'system', name: 'Satyanarayan Puja Kit', category: 'Samagri Kits', price: 1299, rating: 4.8, stock: 40,
    description: 'Complete Satyanarayan Katha puja samagri kit with 51 items — panchamrit, fruits, banana leaves, panchmewa, puja thali and all ritual essentials.',
    image: '/products/puja-samagri.jpg' },
  { id: 'sk2', vendorId: 'system', name: 'Lakshmi Puja Kit', category: 'Samagri Kits', price: 999, rating: 4.7, stock: 55,
    description: 'Diwali Lakshmi puja samagri kit with lotus seeds, red cloth, kumkum, chandan, coins, diyas and all items required for a complete Lakshmi puja.',
    image: '/products/puja-samagri.jpg' },
  { id: 'sk3', vendorId: 'system', name: 'Rudrabhishek Puja Kit', category: 'Samagri Kits', price: 1999, rating: 4.9, stock: 25,
    description: 'Premium Rudrabhishek kit with Shivalinga, panchamrit, bel leaves, Gangajal, rudraksha mala, dhatura and all ritual items required for Shiva abhishek.',
    image: '/products/puja-samagri.jpg' },
  { id: 'sk4', vendorId: 'system', name: 'Navratri Puja Kit', category: 'Samagri Kits', price: 1499, rating: 4.8, stock: 35,
    description: 'All-inclusive Navratri puja kit for 9-day celebration — Kalash, red cloth, Durga idol, akhand diya, sindoor, bangles, coconut and fresh flowers.',
    image: '/products/navratri-kit.jpg' },
  { id: 'sk5', vendorId: 'system', name: 'Griha Pravesh Puja Kit', category: 'Samagri Kits', price: 2499, rating: 4.9, stock: 20,
    description: 'Complete Griha Pravesh puja samagri with 75+ items — copper kalash, Ganesh idol, havan samagri, holy thread, mango leaves and all Vastu essentials.',
    image: '/products/puja-samagri.jpg' },
];

function normalizeCategory(category: string | null) {
  if (!category) {
    return 'all';
  }

  const matchedCategory = categories.find(
    (item) => item.toLowerCase() === category.toLowerCase(),
  );

  return matchedCategory ?? 'all';
}

export default function Shop() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = normalizeCategory(searchParams.get('category'));
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const [selectedTemple, setSelectedTemple] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [selectedVendorType, setSelectedVendorType] = useState<string>('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState<string>('featured');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!auth.currentUser) return;
      try {
        const res = await fetch(`/api/wishlist/${auth.currentUser.uid}`);
        if (!res.ok) return;
        const data = await res.json();
        const itemIds = new Set<string>((data as { itemId: string }[]).map(w => w.itemId));
        setWishlistItems(itemIds);
      } catch {
        // wishlist load failure is non-critical
      }
    };
    fetchWishlist();
  }, []);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch('/api/admin/vendors-performance');
        if (res.ok) {
          const data = await res.json();
          setVendors(data);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    setSearchInput(searchParams.get('q') ?? '');
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const url =
          selectedCategory === 'all'
            ? '/api/products'
            : `/api/products?category=${encodeURIComponent(selectedCategory)}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          // Parse weightOptions if it's a string from DB
          const parsedData = data.map((p: any) => ({
            ...p,
            weightOptions: typeof p.weightOptions === 'string' ? JSON.parse(p.weightOptions) : p.weightOptions
          }));
          setProducts(parsedData);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const updateSearchParams = (category: string, query: string) => {
    const nextParams = new URLSearchParams();
    if (category !== 'all') {
      nextParams.set('category', category.toLowerCase());
    }
    if (query.trim()) {
      nextParams.set('q', query.trim());
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleCategoryChange = (category: string) => {
    updateSearchParams(category, searchInput);
    setSelectedTemple('all');
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    updateSearchParams(selectedCategory, value);
  };

  const displayProducts = products.length > 0 ? products : (fallbackProducts as any);
  const normalizedQuery = searchInput.trim().toLowerCase();

  const filteredProducts = displayProducts.filter((product: any) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery) ||
      (product.templeName && product.templeName.toLowerCase().includes(normalizedQuery));
    const matchesTemple = selectedTemple === 'all' || product.templeName === selectedTemple;
    const matchesVendor = selectedVendor === 'all' || product.vendorId === selectedVendor;
    const vendor = vendors.find(v => v.uid === product.vendorId);
    const matchesVendorType = selectedVendorType === 'all' || (vendor && vendor.type === selectedVendorType);
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;

    return matchesCategory && matchesQuery && matchesTemple && matchesVendor && matchesVendorType && matchesPrice;
  }).sort((a: any, b: any) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
    return 0;
  });

  const temples = Array.from(new Set(displayProducts.filter((p: any) => p.category === 'Prasad').map((p: any) => p.templeName))).filter(Boolean);
  const availableVendorIds = Array.from(new Set(displayProducts.map((p: any) => p.vendorId))).filter(Boolean);

  const handleOptionChange = (productId: string, option: any) => {
    setSelectedOptions(prev => ({ ...prev, [productId]: option }));
  };

  const handleAddToCart = (product: any) => {
    const option = selectedOptions[product.id];
    const itemToAdd = {
      id: product.id,
      name: product.name,
      price: option ? option.price : product.price,
      image: product.image,
      selectedOption: option ? option.label : undefined
    };
    addToCart(itemToAdd);
    alert(`Added ${product.name} to cart!`);
  };

  const toggleWishlist = async (productId: string) => {
    if (!auth.currentUser) {
      alert(t('Please login to add items to wishlist'));
      return;
    }

    if (wishlistItems.has(productId)) {
      await removeFromWishlist(productId, 'product');
      setWishlistItems(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    } else {
      await addToWishlist(productId, 'product');
      setWishlistItems(prev => {
        const next = new Set(prev);
        next.add(productId);
        return next;
      });
    }
  };

  return (
    <div className="pb-20 bg-white dark:bg-stone-950 transition-colors duration-300">
      <section className="relative h-[40vh] flex items-center overflow-hidden mb-12">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero/shop-hero.png"
            alt="Spiritual Marketplace"
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
                src="/logo/full-logo.svg" 
                alt="PunyaSeva" 
                className="h-12 md:h-16 w-auto" 
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-serif font-bold text-white mb-4">
              Spiritual Marketplace
            </h1>
            <p className="text-lg text-stone-200 max-w-2xl mx-auto">
              Find everything you need for your spiritual journey.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div className="w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder={t('shop.searchPlaceholder')}
                className="w-full md:w-72 pl-10 pr-10 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none dark:text-white"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:border-orange-200 dark:hover:border-orange-900/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-12 p-5 sm:p-8 bg-stone-50 dark:bg-stone-900/50 rounded-[2rem] sm:rounded-[2.5rem] border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Price Range (₹)</label>
              <div className="flex items-center space-x-3">
                <input 
                  type="number" 
                  placeholder={t('shop.min')}
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: Math.max(0, Number(e.target.value)) }))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
                <span className="text-stone-400 font-bold">-</span>
                <input 
                  type="number" 
                  placeholder={t('shop.max')}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Math.max(0, Number(e.target.value)) }))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-3 space-y-4">
              <label className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">{t('shop.filterVendor')}</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Types' },
                  { id: 'priest', label: 'Priests / Pandits' },
                  { id: 'temple', label: 'Temples / Trusts' },
                  { id: 'shop', label: 'Spiritual Shops' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedVendorType(type.id)}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                      selectedVendorType === type.id
                        ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-lg'
                        : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:border-orange-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Vendor</label>
              <select 
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              >
                <option value="all">{t('shop.allVendors')}</option>
                {availableVendorIds
                  .filter((vId: any) => selectedVendorType === 'all' || vendors.find(v => v.uid === vId)?.type === selectedVendorType)
                  .map((vId: any) => (
                  <option key={vId} value={vId}>
                    {vendors.find(v => v.uid === vId)?.businessName || 'Sacred Vendor'}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">{t('shop.sortBy')}</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              >
                <option value="featured">{t('shop.featured')}</option>
                <option value="price-low">{t('shop.priceLow')}</option>
                <option value="price-high">{t('shop.priceHigh')}</option>
                <option value="rating">{t('shop.topRated')}</option>
                <option value="newest">{t('shop.newest')}</option>
              </select>
            </div>

            <div className="flex items-end space-x-4">
              <button 
                onClick={() => {
                  setPriceRange({ min: 0, max: 10000 });
                  setSelectedVendor('all');
                  setSelectedVendorType('all');
                  setSelectedTemple('all');
                  setSearchInput('');
                  setSortBy('featured');
                  updateSearchParams('all', '');
                }}
                className="flex-1 px-6 py-2.5 bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-xl text-sm font-bold hover:bg-stone-300 dark:hover:bg-stone-700 transition-all flex items-center justify-center"
              >
                <X className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>

        <AIGroundedSearch query={searchInput} type="product" />

        {selectedCategory === 'Prasad' && temples.length > 0 && (
          <div className="mb-8 p-6 bg-stone-100 dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-4">Filter by Temple:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTemple('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedTemple === 'all' ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900' : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700'}`}
              >
                All Temples
              </button>
              {temples.map((temple: any) => (
                <button
                  key={temple}
                  onClick={() => setSelectedTemple(temple)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedTemple === temple ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900' : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700'}`}
                >
                  {temple}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-10 flex items-center gap-3">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-orange-500 font-medium">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              Refreshing catalog...
            </div>
          ) : (
            <span className="text-sm text-stone-500 font-medium">{filteredProducts.length} items found</span>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-200 dark:border-stone-800 p-10 text-center">
            <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white mb-3">
              No products matched your search
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              Try a different keyword or reset the category filter to explore the
              full catalog.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                updateSearchParams('all', '');
                setSelectedTemple('all');
              }}
              className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product: any, index: number) => (
              <motion.div
                key={product.id}
                layoutId={`product-${product.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 group hover:shadow-xl transition-all flex flex-col shadow-sm"
              >
                <div className="aspect-square overflow-hidden relative group/img">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.image || 'https://picsum.photos/400/400'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setQuickViewProduct(product);
                          }}
                          className="p-3 bg-white text-stone-900 rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-xl"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product.id);
                          }}
                          className={`p-3 bg-white rounded-full hover:scale-110 transition-all shadow-xl ${wishlistItems.has(product.id) ? 'text-red-500' : 'text-stone-400'}`}
                        >
                          <Heart className={`w-5 h-5 ${wishlistItems.has(product.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </Link>
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-stone-900 dark:text-white">
                      {product.rating}
                    </span>
                  </div>
                  {product.templeName && (
                    <div className="absolute bottom-4 left-4 bg-orange-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-white">
                      {product.templeName}
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="absolute top-4 left-4 p-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white dark:hover:bg-stone-800 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${wishlistItems.has(product.id) ? 'fill-red-500 text-red-500' : 'text-stone-400'}`} />
                  </button>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-bold mb-1">
                    {product.category}
                  </p>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-bold text-stone-900 dark:text-white mb-1 line-clamp-1 hover:text-orange-500 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  {product.vendorId && (
                    <div className="mb-3">
                      <Link 
                        to={`/vendor/${product.vendorId}`}
                        className="text-[10px] font-bold text-stone-400 hover:text-orange-500 transition-colors flex items-center gap-1"
                      >
                        <Store className="w-3 h-3" />
                        {vendors.find(v => v.uid === product.vendorId)?.businessName || 'Sacred Vendor'}
                      </Link>
                    </div>
                  )}
                  
                  {product.weightOptions && product.weightOptions.length > 0 && (
                    <div className="mb-4">
                      <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 mb-2 block">Select Option:</label>
                      <div className="flex flex-wrap gap-2">
                        {product.weightOptions.map((opt: any) => (
                          <button
                            key={opt.label}
                            onClick={() => handleOptionChange(product.id, opt)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                              selectedOptions[product.id]?.label === opt.label
                                ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900 dark:border-white'
                                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex justify-between items-center gap-3">
                    <div className="flex items-center text-xl font-serif font-bold text-orange-600 dark:text-orange-400">
                      <IndianRupee className="w-4 h-4" />
                      <span>{formatIndianRupees(selectedOptions[product.id]?.price || product.price)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="bg-stone-900 dark:bg-stone-700 text-white p-2.5 rounded-xl hover:bg-orange-500 transition-colors"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
            />
            <motion.div
              layoutId={`product-${quickViewProduct.id}`}
              className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-stone-100 dark:bg-stone-800 rounded-full hover:rotate-90 transition-all font-bold"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full md:w-1/2 aspect-square">
                <img src={quickViewProduct.image} alt={quickViewProduct.name} className="w-full h-full object-cover" />
              </div>

              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
                <div className="mb-8">
                  <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                    {quickViewProduct.category}
                  </span>
                  <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white mb-4 line-clamp-2">{quickViewProduct.name}</h2>
                  <div className="flex items-center gap-6 text-stone-500 border-y border-stone-100 dark:border-stone-800 py-3 mb-6">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-stone-900 dark:text-white">{quickViewProduct.rating} Rating</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Store className="w-4 h-4" />
                      {quickViewProduct.stock > 0 ? (
                        <span className="text-sm text-green-600">In Stock ({quickViewProduct.stock})</span>
                      ) : (
                        <span className="text-sm text-red-600">{t('shop.outOfStock')}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-stone-500 dark:text-stone-400 leading-relaxed max-h-40 overflow-y-auto pr-4 mb-4">{quickViewProduct.description}</p>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-serif font-bold text-stone-900 dark:text-white">₹{formatIndianRupees(quickViewProduct.price)}</span>
                      <span className="text-xs text-stone-400">incl. of all taxes</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Link 
                      to={`/product/${quickViewProduct.id}`}
                      className="flex items-center justify-center gap-2 py-4 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white rounded-2xl font-bold hover:bg-stone-200 transition-all border border-stone-200 dark:border-stone-700"
                    >
                      <Info className="w-5 h-5" />
                      Full Details
                    </Link>
                    <button 
                      onClick={() => {
                        handleAddToCart(quickViewProduct);
                        setQuickViewProduct(null);
                      }}
                      disabled={quickViewProduct.stock === 0}
                      className="flex items-center justify-center gap-2 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
