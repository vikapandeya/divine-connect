import { Booking, Order, Product } from '../types';
import { knowledgeHighlights } from './knowledge';

export type AppLocale = 'en' | 'hi' | 'sa';

export type PlatformNotification = {
  id: string;
  audience: 'user' | 'vendor' | 'admin';
  title: string;
  message: string;
  tone: 'orange' | 'blue' | 'emerald' | 'violet';
  createdAt: string;
  isUnread: boolean;
};

export type VendorLedgerEntry = {
  id: string;
  source: string;
  category: 'order' | 'booking';
  grossAmount: number;
  commissionAmount: number;
  vendorAmount: number;
  status: 'available' | 'pending' | 'withdrawn';
  availableOn: string;
};

export type VendorFinanceSnapshot = {
  grossSales: number;
  platformCommission: number;
  vendorEarnings: number;
  withdrawableBalance: number;
  pendingClearance: number;
  commissionRate: number;
  ledger: VendorLedgerEntry[];
};

export type TempleSpotlight = {
  id: string;
  name: string;
  city: string;
  state: string;
  specialty: string;
  services: string[];
  annualVisitors: string;
};

export type SpiritualArticle = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
};

export type PanchangInsight = {
  dateLabel: string;
  tithi: string;
  nakshatra: string;
  muhurat: string;
  focus: string;
};

export type HoroscopeHighlight = {
  sign: string;
  guidance: string;
  remedy: string;
};

export type ReviewMedia = {
  id: string;
  productId: string;
  devotee: string;
  caption: string;
  image: string;
};

export type LiveSessionInfo = {
  provider: string;
  roomCode: string;
  joinWindow: string;
  host: string;
  streamType: string;
};

const STORAGE_KEYS = {
  locale: 'divine-connect-locale',
  wishlist: 'divine-connect-wishlist',
};

const EVENTS = {
  locale: 'divine-connect-locale-updated',
  wishlist: 'divine-connect-wishlist-updated',
};

const localeCopy = {
  en: {
    platformDemo: 'Spiritual platform demo',
    headline: 'Puja booking, darshan support, prasad delivery, and astrology in one guided experience.',
    needHelp: 'Need help?',
    searchPlaceholder: 'Search offerings',
    demoMode: 'Demo Mode Active',
    bookPuja: 'Book Puja',
    templePrasad: 'Temple Prasad',
    myProfile: 'My Profile',
    panchangTitle: 'Daily Panchang',
    panchangDescription: 'Today\'s auspicious guidance, muhurat, and devotional timing highlights.',
    blogTitle: 'Spiritual Knowledge Base',
    blogDescription: 'Hardcoded editorial cards for rituals, festivals, and family guidance.',
  },
  hi: {
    platformDemo: 'आध्यात्मिक प्लेटफॉर्म डेमो',
    headline: 'पूजा बुकिंग, दर्शन सहयोग, प्रसाद डिलीवरी और ज्योतिष एक ही मार्गदर्शित अनुभव में।',
    needHelp: 'सहायता चाहिए?',
    searchPlaceholder: 'सेवाएं खोजें',
    demoMode: 'डेमो मोड सक्रिय',
    bookPuja: 'पूजा बुक करें',
    templePrasad: 'मंदिर प्रसाद',
    myProfile: 'मेरा प्रोफाइल',
    panchangTitle: 'दैनिक पंचांग',
    panchangDescription: 'आज के शुभ समय, मुहूर्त और आध्यात्मिक संकेत।',
    blogTitle: 'आध्यात्मिक ज्ञान केंद्र',
    blogDescription: 'अनुष्ठान, पर्व और परिवार मार्गदर्शन के लिए हार्डकोडेड लेख।',
  },
  sa: {
    platformDemo: 'आध्यात्मिक मंच डेमो',
    headline: 'पूजा-आरक्षणम्, दर्शन-सहाय्यम्, प्रसाद-प्रेषणम्, ज्योतिष-मार्गदर्शनं च एकस्मिन् अनुभवपथे।',
    needHelp: 'साहाय्यम्?',
    searchPlaceholder: 'सेवाः अन्विष्यन्ताम्',
    demoMode: 'डेमो मोड सक्रियः',
    bookPuja: 'पूजां आरक्षत',
    templePrasad: 'मन्दिर-प्रसादः',
    myProfile: 'मम प्रोफाइल्',
    panchangTitle: 'दैनिक पञ्चाङ्गम्',
    panchangDescription: 'अद्यतनं शुभमुहूर्तम्, नक्षत्रम्, आध्यात्मिक-मार्गदर्शनं च।',
    blogTitle: 'आध्यात्मिक ज्ञानकोशः',
    blogDescription: 'व्रत, उत्सव, परिवार-मार्गदर्शनाय लेखाः।',
  },
} as const;

const templeSpotlights: TempleSpotlight[] = [
  {
    id: 'kashi-vishwanath',
    name: 'Kashi Vishwanath Temple',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    specialty: 'Jyotirlinga darshan, Rudrabhishek, temple prasad dispatch',
    services: ['Live Puja', 'Prasad Delivery', 'Festival Sankalp'],
    annualVisitors: '7M+ pilgrims',
  },
  {
    id: 'tirupati-balaji',
    name: 'Tirupati Balaji Temple',
    city: 'Tirupati',
    state: 'Andhra Pradesh',
    specialty: 'Laddu prasadam, family darshan support, seva scheduling',
    services: ['Darshan Support', 'Temple Prasad', 'Special Occasion Booking'],
    annualVisitors: '25M+ pilgrims',
  },
  {
    id: 'jagannath-puri',
    name: 'Jagannath Temple',
    city: 'Puri',
    state: 'Odisha',
    specialty: 'Khaja prasad, seasonal seva, Rath Yatra planning',
    services: ['Prasad Dispatch', 'Festival Booking', 'Remote Sankalp'],
    annualVisitors: '3M+ pilgrims',
  },
];

const articles: SpiritualArticle[] = knowledgeHighlights.map((article) => ({
  id: article.id,
  title: article.title,
  excerpt: article.excerpt,
  category: article.category,
  readTime: article.readTime,
}));

const reviewMedia: ReviewMedia[] = [
  {
    id: 'review-kashi-1',
    productId: 'prod-kashi-vishwanath-prasad',
    devotee: 'Ananya Sharma',
    caption: 'Freshly packed and beautifully presented for our family sankalp.',
    image: 'https://picsum.photos/seed/review-kashi/320/240',
  },
  {
    id: 'review-tirupati-1',
    productId: 'prod-tirupati-laddu',
    devotee: 'Rajesh Iyer',
    caption: 'The prasadam box felt authentic and arrived in perfect condition.',
    image: 'https://picsum.photos/seed/review-tirupati/320/240',
  },
  {
    id: 'review-rudraksha-1',
    productId: 'prod-rudraksha-mala',
    devotee: 'Meera Joshi',
    caption: 'The mala quality and finish were exactly right for daily japa.',
    image: 'https://picsum.photos/seed/review-rudraksha/320/240',
  },
];

function isBrowser() {
  return typeof window !== 'undefined';
}

function notify(eventName: string) {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(eventName));
}

function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function addDays(dateIso: string, days: number) {
  const next = new Date(dateIso);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

export function getLocale() {
  return readStorage<AppLocale>(STORAGE_KEYS.locale, 'en');
}

export function setLocale(locale: AppLocale) {
  writeStorage(STORAGE_KEYS.locale, locale);
  notify(EVENTS.locale);
}

export function subscribeToLocale(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEYS.locale) {
      callback();
    }
  };

  window.addEventListener(EVENTS.locale, callback);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(EVENTS.locale, callback);
    window.removeEventListener('storage', handleStorage);
  };
}

export function getLocaleCopy(locale = getLocale()) {
  return localeCopy[locale];
}

export function getLanguageOptions() {
  return [
    { value: 'en' as const, label: 'EN' },
    { value: 'hi' as const, label: 'HI' },
    { value: 'sa' as const, label: 'SA' },
  ];
}

export function getWishlistIds() {
  return readStorage<string[]>(STORAGE_KEYS.wishlist, []);
}

export function isWishlisted(productId: string) {
  return getWishlistIds().includes(productId);
}

export function toggleWishlist(productId: string) {
  const current = getWishlistIds();
  const next = current.includes(productId)
    ? current.filter((id) => id !== productId)
    : [productId, ...current];

  writeStorage(STORAGE_KEYS.wishlist, next);
  notify(EVENTS.wishlist);
}

export function subscribeToWishlist(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEYS.wishlist) {
      callback();
    }
  };

  window.addEventListener(EVENTS.wishlist, callback);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(EVENTS.wishlist, callback);
    window.removeEventListener('storage', handleStorage);
  };
}

export function getTempleSpotlights() {
  return templeSpotlights;
}

export function getSpiritualArticles() {
  return articles;
}

export function getReviewMedia(productId?: string) {
  return productId
    ? reviewMedia.filter((item) => item.productId === productId)
    : reviewMedia;
}

export function getReviewCount(productId: string) {
  return getReviewMedia(productId).length;
}

export function getDailyPanchang(locale = getLocale()): PanchangInsight {
  if (locale === 'hi') {
    return {
      dateLabel: 'रविवार, 22 मार्च 2026',
      tithi: 'शुक्ल पक्ष नवमी',
      nakshatra: 'मृगशीर्षा',
      muhurat: 'अभिजीत मुहूर्त: 12:05 PM - 12:51 PM',
      focus: 'गणेश अथवा लक्ष्मी पूजन, गृह शुद्धि और संकल्प के लिए अनुकूल दिन।',
    };
  }

  if (locale === 'sa') {
    return {
      dateLabel: 'रविवासरः, 22 मार्च 2026',
      tithi: 'शुक्ल-नवमी',
      nakshatra: 'मृगशीर्षा',
      muhurat: 'अभिजित् मुहूर्तम्: 12:05 PM - 12:51 PM',
      focus: 'गणेश-लक्ष्मी-पूजनाय, गृह-शुद्धये, संकल्पाय च अनुकूलः दिवसः।',
    };
  }

  return {
    dateLabel: 'Sunday, March 22, 2026',
    tithi: 'Shukla Paksha Navami',
    nakshatra: 'Mrigashirsha',
    muhurat: 'Abhijit Muhurat: 12:05 PM - 12:51 PM',
    focus: 'Strong day for Ganesh or Lakshmi puja, home sanctification, and fresh family sankalp.',
  };
}

export function getDailyHoroscope(locale = getLocale()): HoroscopeHighlight[] {
  if (locale === 'hi') {
    return [
      { sign: 'मेष', guidance: 'नए कार्यों में गति मिलेगी, पर निर्णय संयम से लें।', remedy: 'सुबह दीपक जलाएं।' },
      { sign: 'वृषभ', guidance: 'परिवार और वित्त दोनों में संतुलन लाभ देगा।', remedy: 'शुक्रवार को सफेद पुष्प अर्पित करें।' },
      { sign: 'मीन', guidance: 'आध्यात्मिक अभ्यास से मन की स्पष्टता बढ़ेगी।', remedy: 'गुरु मंत्र का जप करें।' },
    ];
  }

  if (locale === 'sa') {
    return [
      { sign: 'मेष', guidance: 'नवकार्येषु प्रगति: भविष्यति, परं निर्णयः संयमेन कार्यः।', remedy: 'प्रातः दीपं प्रज्वालयन्तु।' },
      { sign: 'वृषभ', guidance: 'कुटुम्ब-वित्तयोः समत्वं लाभकरं भविष्यति।', remedy: 'शुक्रवासरे श्वेतपुष्पाणि अर्पयन्तु।' },
      { sign: 'मीन', guidance: 'आध्यात्मिकाभ्यासेन मनसः स्पष्टता वर्धते।', remedy: 'गुरुमन्त्रं जपन्तु।' },
    ];
  }

  return [
    { sign: 'Aries', guidance: 'Momentum improves for new work, but decisions should stay measured.', remedy: 'Light a diya before starting important tasks.' },
    { sign: 'Taurus', guidance: 'Family and finances both benefit from calm practical planning.', remedy: 'Offer white flowers on Friday.' },
    { sign: 'Pisces', guidance: 'Spiritual discipline brings better clarity than reactive decisions.', remedy: 'Keep a short guru mantra in your morning routine.' },
  ];
}

export function getLiveSessionInfo(serviceTitle: string): LiveSessionInfo {
  const slug = serviceTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 16) || 'divine-live';
  return {
    provider: serviceTitle.toLowerCase().includes('darshan') ? 'Zoom SDK Demo' : 'Jitsi Demo Room',
    roomCode: `${slug}-2026`,
    joinWindow: 'Join link opens 15 minutes before the ritual starts',
    host: 'Certified DivineConnect Host',
    streamType: 'One-click livestream placeholder for online seva participation',
  };
}

export function buildUserNotifications(bookings: Booking[], orders: Order[]): PlatformNotification[] {
  const bookingAlerts = bookings.slice(0, 2).map((booking, index) => ({
    id: `user-booking-${booking.id}`,
    audience: 'user' as const,
    title:
      booking.status === 'confirmed'
        ? booking.type === 'yatra'
          ? 'Yatra package confirmed'
          : booking.type === 'darshan'
            ? 'Darshan slot confirmed'
            : 'Puja slot confirmed'
        : 'Booking update available',
    message:
      booking.type === 'yatra'
        ? `${booking.serviceTitle || 'Yatra package'} is ${booking.status} for departure on ${booking.date} with ${booking.timeSlot}.`
        : `${booking.serviceTitle || 'Sacred service'} is ${booking.status} for ${booking.date} at ${booking.timeSlot}.`,
    tone:
      booking.type === 'darshan'
        ? 'blue' as const
        : booking.type === 'yatra'
          ? 'violet' as const
          : 'orange' as const,
    createdAt: booking.updatedAt || booking.createdAt || new Date().toISOString(),
    isUnread: index === 0,
  }));

  const orderAlerts = orders.slice(0, 2).map((order, index) => ({
    id: `user-order-${order.id}`,
    audience: 'user' as const,
    title: order.status === 'shipped' ? 'Order shipped' : 'Receipt emailed',
    message:
      order.status === 'shipped'
        ? `Order ${order.orderNumber} is marked as shipped and visible in your order timeline.`
        : `Invoice and product certificate for ${order.orderNumber} are ready in your profile and demo email queue.`,
    tone: order.status === 'shipped' ? 'blue' as const : 'emerald' as const,
    createdAt: order.updatedAt || order.createdAt,
    isUnread: index === 0 && bookingAlerts.length === 0,
  }));

  return [...orderAlerts, ...bookingAlerts].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export function buildVendorNotifications(
  bookings: Booking[],
  orders: Order[],
  products: Product[],
): PlatformNotification[] {
  const lowStockProducts = products.filter((product) => product.stock < 5);
  const bookingAlerts = bookings.slice(0, 2).map((booking, index) => ({
    id: `vendor-booking-${booking.id}`,
    audience: 'vendor' as const,
    title: 'New service reservation',
    message:
      booking.type === 'yatra'
        ? `${booking.serviceTitle || 'Yatra package'} is booked for departure on ${booking.date} with ${booking.timeSlot}.`
        : `${booking.serviceTitle || 'Sacred service'} is booked for ${booking.date} at ${booking.timeSlot}.`,
    tone: 'orange' as const,
    createdAt: booking.updatedAt || booking.createdAt || new Date().toISOString(),
    isUnread: index === 0,
  }));

  const orderAlerts = orders.slice(0, 2).map((order, index) => ({
    id: `vendor-order-${order.id}`,
    audience: 'vendor' as const,
    title: 'New marketplace order',
    message: `${order.orderNumber} worth Rs. ${order.totalAmount} entered payout settlement tracking.`,
    tone: 'emerald' as const,
    createdAt: order.updatedAt || order.createdAt,
    isUnread: index === 0 && bookingAlerts.length === 0,
  }));

  const stockAlerts = lowStockProducts.map((product, index) => ({
    id: `vendor-stock-${product.id}`,
    audience: 'vendor' as const,
    title: 'Inventory alert',
    message: `${product.name} is down to ${product.stock} unit${product.stock === 1 ? '' : 's'}. Restock before the next dispatch cycle.`,
    tone: 'violet' as const,
    createdAt: addDays(new Date().toISOString(), -index),
    isUnread: true,
  }));

  return [...stockAlerts, ...orderAlerts, ...bookingAlerts].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export function buildAdminNotifications(
  products: Product[],
  bookings: Booking[],
  orders: Order[],
): PlatformNotification[] {
  const lowStockCount = products.filter((product) => product.stock < 5).length;

  return [
    {
      id: 'admin-payouts',
      audience: 'admin',
      title: 'Payout queue ready',
      message: `${Math.max(1, orders.length)} order settlements are ready for vendor wallet clearance in demo mode.`,
      tone: 'emerald',
      createdAt: new Date().toISOString(),
      isUnread: true,
    },
    {
      id: 'admin-realtime',
      audience: 'admin',
      title: 'Realtime channels simulated',
      message: `${bookings.length} bookings and ${orders.length} orders are eligible for WebSocket or FCM-style notifications.`,
      tone: 'blue',
      createdAt: addDays(new Date().toISOString(), -1),
      isUnread: true,
    },
    {
      id: 'admin-stock',
      audience: 'admin',
      title: 'Inventory threshold watch',
      message: `${lowStockCount} catalog item${lowStockCount === 1 ? ' is' : 's are'} below the hardcoded low-stock threshold of 5 units.`,
      tone: 'violet',
      createdAt: addDays(new Date().toISOString(), -2),
      isUnread: false,
    },
  ];
}

export function buildVendorFinanceSnapshot(
  orders: Order[],
  bookings: Booking[],
  commissionRate = 0.1,
): VendorFinanceSnapshot {
  const orderEntries: VendorLedgerEntry[] = orders.map((order) => {
    const grossAmount = order.totalAmount;
    const commissionAmount = Math.round(grossAmount * commissionRate);
    const vendorAmount = grossAmount - commissionAmount;
    const status: VendorLedgerEntry['status'] =
      order.status === 'delivered'
        ? 'available'
        : order.status === 'cancelled'
          ? 'withdrawn'
          : 'pending';

    return {
      id: order.id,
      source: order.orderNumber,
      category: 'order' as const,
      grossAmount,
      commissionAmount,
      vendorAmount,
      status,
      availableOn: addDays(order.createdAt, 3),
    };
  });

  const bookingEntries: VendorLedgerEntry[] = bookings
    .filter((booking) => booking.totalAmount > 0)
    .map((booking) => {
      const grossAmount = booking.totalAmount;
      const commissionAmount = Math.round(grossAmount * commissionRate);
      const vendorAmount = grossAmount - commissionAmount;
      const status: VendorLedgerEntry['status'] =
        booking.status === 'completed'
          ? 'available'
          : booking.status === 'cancelled'
            ? 'withdrawn'
            : 'pending';

      return {
        id: booking.id,
        source: booking.bookingReference || booking.id,
        category: 'booking' as const,
        grossAmount,
        commissionAmount,
        vendorAmount,
        status,
        availableOn: addDays(booking.createdAt || new Date().toISOString(), 2),
      };
    });

  const ledger = [...orderEntries, ...bookingEntries].sort((left, right) =>
    right.availableOn.localeCompare(left.availableOn),
  );

  const grossSales = ledger.reduce((sum, entry) => sum + entry.grossAmount, 0);
  const platformCommission = ledger.reduce((sum, entry) => sum + entry.commissionAmount, 0);
  const vendorEarnings = ledger.reduce((sum, entry) => sum + entry.vendorAmount, 0);
  const withdrawableBalance = ledger
    .filter((entry) => entry.status === 'available')
    .reduce((sum, entry) => sum + entry.vendorAmount, 0);
  const pendingClearance = ledger
    .filter((entry) => entry.status === 'pending')
    .reduce((sum, entry) => sum + entry.vendorAmount, 0);

  return {
    grossSales,
    platformCommission,
    vendorEarnings,
    withdrawableBalance,
    pendingClearance,
    commissionRate,
    ledger,
  };
}

export function getSearchSuggestions(products: Product[]) {
  const suggestions = new Set<string>();

  products.forEach((product) => {
    suggestions.add(product.name);
    suggestions.add(product.category);
    if (product.templeName) {
      suggestions.add(product.templeName);
    }
    if (product.city) {
      suggestions.add(product.city);
    }
  });

  return [...suggestions].slice(0, 8);
}

export function getPwaReadinessSummary() {
  return {
    installable: true,
    offlineShell: true,
    receiptsCaching: true,
    manifestVersion: '2026.03 hardcoded demo',
  };
}
