import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Search, IndianRupee, X, Heart, MapPin, ShieldCheck, Images } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { addToCart } from '../lib/cart';
import { formatIndianRupees, getProductPlaceholderImage } from '../lib/utils';
import { listProductsDirect } from '../lib/firestore-data';
import { getProductSpiritualImage } from '../lib/spiritual-images';
import {
  getReviewCount,
  getSearchSuggestions,
  getWishlistIds,
  subscribeToWishlist,
  toggleWishlist,
} from '../lib/platform';

const categories = [
  'all',
  'Prasad',
  'Idols',
  'Incense',
  'Mala',
  'Books',
  'Yantras',
  'Puja Essentials',
];

const fallbackProducts: Product[] = [
  {
    id: 'prasad-1',
    vendorId: 'system',
    name: 'Kashi Vishwanath Mahaprasad Box',
    price: 699,
    category: 'Prasad',
    rating: 4.9,
    image: getProductSpiritualImage('Prasad', 'Kashi Vishwanath Mahaprasad Box').src,
    templeName: 'Kashi Vishwanath Mandir',
    weight: '500 g',
    size: 'Family Box',
    dispatchWindow: 'Dispatched within 24 hours',
    description: 'Fresh temple prasad with mishri, dry fruits, tulsi leaves, and sacred thread.',
    stock: 20,
  },
  {
    id: 'prasad-2',
    vendorId: 'system',
    name: 'Tirupati Srivari Laddu Prasadam',
    price: 899,
    category: 'Prasad',
    rating: 5,
    image: getProductSpiritualImage('Prasad', 'Tirupati Srivari Laddu Prasadam').src,
    templeName: 'Tirumala Tirupati Devasthanam',
    weight: '750 g',
    size: 'Temple Gift Pack',
    dispatchWindow: 'Dispatch within 48 hours',
    description: 'Temple-packed laddu prasadam suitable for family sharing and gifting.',
    stock: 14,
  },
  {
    id: '1',
    vendorId: 'system',
    name: 'Brass Ganesha Idol',
    price: 1299,
    category: 'Idols',
    rating: 4.8,
    image: getProductSpiritualImage('Idols', 'Brass Ganesha Idol').src,
    description: 'Handcrafted brass murti for home altar and festive puja spaces.',
    stock: 18,
  },
  {
    id: '2',
    vendorId: 'system',
    name: 'Sandalwood Incense',
    price: 250,
    category: 'Incense',
    rating: 4.5,
    image: getProductSpiritualImage('Incense', 'Sandalwood Incense').src,
    description: 'Classic devotional fragrance for daily aarti, meditation, and prayer.',
    stock: 60,
  },
  {
    id: '3',
    vendorId: 'system',
    name: 'Rudraksha Mala',
    price: 599,
    category: 'Mala',
    rating: 4.9,
    image: getProductSpiritualImage('Mala', 'Rudraksha Mala').src,
    size: '108 + 1 beads',
    description: 'Traditional japa mala selected for chanting, meditation, and gifting.',
    stock: 33,
  },
  {
    id: '4',
    vendorId: 'system',
    name: 'Bhagavad Gita',
    price: 450,
    category: 'Books',
    rating: 5,
    image: getProductSpiritualImage('Books', 'Bhagavad Gita').src,
    size: 'Hardbound',
    description: 'Devotional reading edition for daily study, family satsang, and gifting.',
    stock: 21,
  },
  {
    id: '5',
    vendorId: 'system',
    name: 'Shree Yantra',
    price: 899,
    category: 'Yantras',
    rating: 4.7,
    image: getProductSpiritualImage('Yantras', 'Shree Yantra').src,
    size: '4 x 4 inch',
    description: 'Copper yantra designed for worship space placement and prosperity rituals.',
    stock: 11,
  },
  {
    id: '6',
    vendorId: 'system',
    name: 'Silver Diya',
    price: 1500,
    category: 'Puja Essentials',
    rating: 4.6,
    image: getProductSpiritualImage('Puja Essentials', 'Silver Diya').src,
    size: 'Set of 2',
    description: 'Elegant diya set for daily deepam, festivals, and spiritual gifting.',
    stock: 17,
  },
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = normalizeCategory(searchParams.get('category'));
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') ?? 'all');
  const [minRating, setMinRating] = useState(searchParams.get('rating') ?? 'all');
  const [priceBand, setPriceBand] = useState(searchParams.get('price') ?? 'all');
  const [wishlistIds, setWishlistIds] = useState<string[]>(getWishlistIds());

  useEffect(() => {
    setSearchInput(searchParams.get('q') ?? '');
    setSelectedCity(searchParams.get('city') ?? 'all');
    setMinRating(searchParams.get('rating') ?? 'all');
    setPriceBand(searchParams.get('price') ?? 'all');
  }, [searchParams]);

  useEffect(() => subscribeToWishlist(() => setWishlistIds(getWishlistIds())), []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const data = await listProductsDirect(
          selectedCategory === 'all' ? {} : { category: selectedCategory },
        );
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const updateSearchParams = (
    category: string,
    query: string,
    city: string,
    rating: string,
    price: string,
  ) => {
    const nextParams = new URLSearchParams();
    if (category !== 'all') {
      nextParams.set('category', category.toLowerCase());
    }
    if (query.trim()) {
      nextParams.set('q', query.trim());
    }
    if (city !== 'all') {
      nextParams.set('city', city);
    }
    if (rating !== 'all') {
      nextParams.set('rating', rating);
    }
    if (price !== 'all') {
      nextParams.set('price', price);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleCategoryChange = (category: string) => {
    updateSearchParams(category, searchInput, selectedCity, minRating, priceBand);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    updateSearchParams(selectedCategory, value, selectedCity, minRating, priceBand);
  };

  const displayProducts = products.length > 0 ? products : fallbackProducts;
  const normalizedQuery = searchInput.trim().toLowerCase();
  const cities = ['all', ...new Set(displayProducts.map((product) => product.city).filter(Boolean) as string[])];
  const suggestions = getSearchSuggestions(displayProducts);

  const filteredProducts = displayProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesCity =
      selectedCity === 'all' || (product.city || '').toLowerCase() === selectedCity.toLowerCase();
    const matchesRating =
      minRating === 'all' || product.rating >= Number(minRating);
    const matchesPrice =
      priceBand === 'all' ||
      (priceBand === 'under-600'
        ? product.price < 600
        : priceBand === '600-1000'
          ? product.price >= 600 && product.price <= 1000
          : product.price > 1000);
    const matchesQuery =
      normalizedQuery.length === 0 ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery) ||
      product.templeName?.toLowerCase().includes(normalizedQuery) ||
      product.city?.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesCity && matchesRating && matchesPrice && matchesQuery;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <PageHero
        tone="stone"
        eyebrow="Spiritual Shop"
        title="Curated offerings with cleaner filtering, stronger hierarchy, and faster product scanning."
        description="Browse prasad, idols, incense, books, malas, and puja essentials through a calmer commerce layout designed for trust and quick comparison."
        stats={[
          { label: 'Catalog Categories', value: `${categories.length - 1}` },
          { label: 'Temple-linked Picks', value: 'Prasad Focused' },
          { label: 'Checkout Support', value: 'Invoice Ready' },
        ]}
        aside={
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-600">
              Smart Catalog Search
            </p>
            <div className="relative mt-5">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search products, temples, or categories"
                className="w-full rounded-[1.5rem] border border-stone-200 bg-stone-50 py-3 pl-11 pr-10 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-orange-500"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-stone-500">
              Search works across product names, categories, descriptions, and temple names.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.slice(0, 4).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSearchChange(suggestion)}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-bold text-stone-600 hover:border-orange-200 hover:text-orange-600"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => handleCategoryChange(category)}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
              selectedCategory === category
                ? 'bg-stone-900 text-white shadow-md shadow-stone-900/15'
                : 'border border-stone-200 bg-white text-stone-600 hover:border-orange-200 hover:text-orange-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm lg:grid-cols-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-400">Temple City</p>
          <select
            value={selectedCity}
            onChange={(event) => updateSearchParams(selectedCategory, searchInput, event.target.value, minRating, priceBand)}
            className="mt-3 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-orange-500"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city === 'all' ? 'All cities' : city}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-400">Minimum Rating</p>
          <select
            value={minRating}
            onChange={(event) => updateSearchParams(selectedCategory, searchInput, selectedCity, event.target.value, priceBand)}
            className="mt-3 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All ratings</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
            <option value="4.8">4.8+</option>
          </select>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-400">Price Band</p>
          <select
            value={priceBand}
            onChange={(event) => updateSearchParams(selectedCategory, searchInput, selectedCity, minRating, event.target.value)}
            className="mt-3 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All prices</option>
            <option value="under-600">Under Rs. 600</option>
            <option value="600-1000">Rs. 600 - 1000</option>
            <option value="over-1000">Above Rs. 1000</option>
          </select>
        </div>
        <div className="rounded-[1.5rem] border border-orange-100 bg-orange-50 px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-600">Commerce UX</p>
          <p className="mt-3 text-sm text-stone-600">
            Wishlist, city filters, review media, and temple-linked search are all hardcoded into this demo catalog.
          </p>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-stone-200 bg-white px-5 py-4 text-sm text-stone-500 shadow-sm">
        {loading
          ? 'Refreshing catalog...'
          : `${filteredProducts.length} items found${selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}${normalizedQuery ? ` for "${searchInput}"` : ''}`}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-3">
            No products matched your search
          </h2>
          <p className="text-stone-600 mb-6">
            Try a different keyword or reset the category filter to explore the
            full catalog.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              updateSearchParams('all', '', 'all', 'all', 'all');
            }}
            className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10"
            >
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={product.image || getProductSpiritualImage(product.category, product.name).src}
                  alt={`${product.name} spiritual product image`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  onError={(event) => {
                    if (event.currentTarget.dataset.fallbackApplied === 'true') {
                      return;
                    }

                    event.currentTarget.dataset.fallbackApplied = 'true';
                    event.currentTarget.src = getProductPlaceholderImage(
                      product.name,
                      product.category,
                      product.templeName || product.offeringType || product.city,
                    );
                  }}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold text-stone-900">
                    {product.rating}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={wishlistIds.includes(product.id) ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
                  className={`absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm transition-colors ${
                    wishlistIds.includes(product.id)
                      ? 'border-rose-200 bg-rose-50 text-rose-600'
                      : 'border-white/60 bg-white/85 text-stone-600 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${wishlistIds.includes(product.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">
                  {product.category}
                </p>
                <h3 className="font-bold text-stone-900 mb-3 line-clamp-1">
                  {product.name}
                </h3>
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Vendor
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                    <Images className="h-3 w-3" />
                    {getReviewCount(product.id)} review photos
                  </span>
                </div>
                <p className="text-sm text-stone-500 line-clamp-2 mb-4">
                  {product.description}
                </p>
                {(product.templeName || product.weight || product.size) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.templeName && (
                      <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-[11px] font-bold">
                        {product.templeName}
                      </span>
                    )}
                    {product.weight && (
                      <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[11px] font-bold">
                        {product.weight}
                      </span>
                    )}
                    {product.size && (
                      <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[11px] font-bold">
                        {product.size}
                      </span>
                    )}
                    {product.city && (
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {product.city}
                      </span>
                    )}
                  </div>
                )}
                {product.dispatchWindow && (
                  <p className="text-xs text-stone-500 mb-4">{product.dispatchWindow}</p>
                )}
                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-center text-xl font-serif font-bold text-orange-600">
                    <IndianRupee className="w-4 h-4" />
                    <span>{formatIndianRupees(product.price)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="bg-stone-900 text-white p-2.5 rounded-xl hover:bg-orange-500 transition-colors"
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
  );
}
