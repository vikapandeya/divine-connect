import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Search, IndianRupee, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { addToCart } from '../lib/cart';
import { formatIndianRupees } from '../lib/utils';

const categories = [
  'all',
  'Idols',
  'Incense',
  'Mala',
  'Books',
  'Yantras',
  'Prasad',
  'Puja Essentials',
];

const fallbackProducts = [
  {
    id: '1',
    name: 'Brass Ganesha Idol',
    price: 1299,
    category: 'Idols',
    rating: 4.8,
    image: 'https://picsum.photos/seed/ganesha/400/400',
  },
  {
    id: '2',
    name: 'Sandalwood Incense',
    price: 250,
    category: 'Incense',
    rating: 4.5,
    image: 'https://picsum.photos/seed/incense/400/400',
  },
  {
    id: '3',
    name: 'Rudraksha Mala',
    price: 599,
    category: 'Mala',
    rating: 4.9,
    image: 'https://picsum.photos/seed/mala/400/400',
  },
  {
    id: '4',
    name: 'Bhagavad Gita',
    price: 450,
    category: 'Books',
    rating: 5.0,
    image: 'https://picsum.photos/seed/gita/400/400',
  },
  {
    id: '5',
    name: 'Shree Yantra',
    price: 899,
    category: 'Yantras',
    rating: 4.7,
    image: 'https://picsum.photos/seed/yantra/400/400',
  },
  {
    id: '6',
    name: 'Kashi Vishwanath Prasad',
    price: 250,
    category: 'Prasad',
    rating: 4.9,
    image: 'https://picsum.photos/seed/kashi/400/400',
    templeName: 'Kashi Vishwanath',
    weightOptions: [{ label: '250g', price: 250 }, { label: '500g', price: 450 }]
  },
  {
    id: '7',
    name: 'Tirupati Laddu',
    price: 350,
    category: 'Prasad',
    rating: 5.0,
    image: 'https://picsum.photos/seed/tirupati/400/400',
    templeName: 'Tirupati Balaji',
    weightOptions: [{ label: '1 Unit', price: 350 }, { label: '2 Units', price: 650 }]
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
  const [selectedTemple, setSelectedTemple] = useState<string>('all');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});

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

    return matchesCategory && matchesQuery && matchesTemple;
  });

  const temples = Array.from(new Set(displayProducts.filter((p: any) => p.category === 'Prasad').map((p: any) => p.templeName))).filter(Boolean);

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
    alert(`Added ${product.name}${option ? ` (${option.label})` : ''} to cart!`);
  };

  return (
    <div className="pb-20">
      <section className="relative h-[40vh] flex items-center overflow-hidden mb-12">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/shop-hero/1920/1080?blur=2"
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
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">
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
                placeholder="Search products..."
                className="w-full md:w-72 pl-10 pr-10 py-2 bg-white border border-stone-200 rounded-full text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
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
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-orange-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {selectedCategory === 'Prasad' && temples.length > 0 && (
          <div className="mb-8 p-6 bg-stone-100 rounded-3xl">
            <h3 className="text-sm font-bold text-stone-900 mb-4">Filter by Temple:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTemple('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedTemple === 'all' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
              >
                All Temples
              </button>
              {temples.map((temple: any) => (
                <button
                  key={temple}
                  onClick={() => setSelectedTemple(temple)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedTemple === temple ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
                >
                  {temple}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-10 text-sm text-stone-500">
          {loading ? 'Refreshing catalog...' : `${filteredProducts.length} items found`}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-stone-200 p-10 text-center">
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200 group hover:shadow-xl transition-all flex flex-col"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={product.image || 'https://picsum.photos/400/400'}
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
                  {product.templeName && (
                    <div className="absolute bottom-4 left-4 bg-orange-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-white">
                      {product.templeName}
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-bold text-stone-900 mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  
                  {product.weightOptions && product.weightOptions.length > 0 && (
                    <div className="mb-4">
                      <label className="text-[10px] font-bold text-stone-500 mb-2 block">Select Option:</label>
                      <div className="flex flex-wrap gap-2">
                        {product.weightOptions.map((opt: any) => (
                          <button
                            key={opt.label}
                            onClick={() => handleOptionChange(product.id, opt)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                              selectedOptions[product.id]?.label === opt.label
                                ? 'bg-stone-900 text-white border-stone-900'
                                : 'bg-white text-stone-600 border-stone-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex justify-between items-center gap-3">
                    <div className="flex items-center text-xl font-serif font-bold text-orange-600">
                      <IndianRupee className="w-4 h-4" />
                      <span>{formatIndianRupees(selectedOptions[product.id]?.price || product.price)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
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
    </div>
  );
}
