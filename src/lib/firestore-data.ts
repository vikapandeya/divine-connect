import type { AstrologyReading, Booking, Order, Product, Puja, UserProfile } from '../types';

const STORAGE_KEYS = {
  products: 'divine-connect-demo-products',
  pujas: 'divine-connect-demo-pujas',
  bookings: 'divine-connect-demo-bookings',
  orders: 'divine-connect-demo-orders',
  readings: 'divine-connect-demo-readings',
  feedback: 'divine-connect-demo-feedback',
};

const nowIso = () => new Date().toISOString();

export const DEMO_CREDENTIALS = {
  email: 'demo@divineconnect.com',
  password: 'demo1234',
};

export const DEMO_DEVOTEE_PROFILE: UserProfile = {
  uid: 'demo-devotee',
  displayName: 'Demo Devotee',
  email: DEMO_CREDENTIALS.email,
  photoURL: 'https://ui-avatars.com/api/?name=Demo+Devotee&background=ff7a10&color=ffffff',
  role: 'devotee',
  phoneNumber: '+91 9876543210',
  addresses: ['Assi Ghat, Varanasi, Uttar Pradesh 221005'],
  createdAt: nowIso(),
};

export const DEMO_VENDOR_PROFILE: UserProfile = {
  uid: 'demo-vendor',
  displayName: 'Temple Vendor Demo',
  email: 'vendor.demo@divineconnect.com',
  photoURL: 'https://ui-avatars.com/api/?name=Temple+Vendor&background=111827&color=ffffff',
  role: 'vendor',
  phoneNumber: '+91 9123456780',
  addresses: ['Temple Lane, Varanasi, Uttar Pradesh 221001'],
  createdAt: nowIso(),
};

export const DEMO_ADMIN_PROFILE: UserProfile = {
  uid: 'demo-admin',
  displayName: 'Admin Demo',
  email: 'admin.demo@divineconnect.com',
  photoURL: 'https://ui-avatars.com/api/?name=Admin+Demo&background=0f172a&color=ffffff',
  role: 'admin',
  phoneNumber: '+91 9000000000',
  addresses: ['Dashashwamedh Road, Varanasi, Uttar Pradesh 221001'],
  createdAt: nowIso(),
};

const defaultProducts: Product[] = [
  {
    id: 'prod-kashi-vishwanath-prasad',
    vendorId: DEMO_VENDOR_PROFILE.uid,
    name: 'Kashi Vishwanath Mahaprasad Box',
    description: 'Temple prasad box with mishri, dry fruits, sacred raksha sutra, and blessed tulsi leaves.',
    price: 699,
    category: 'Prasad',
    image: 'https://picsum.photos/seed/kashi-prasad/400/400',
    stock: 120,
    rating: 4.9,
    templeName: 'Kashi Vishwanath Mandir',
    weight: '500 g',
    size: 'Family Box',
    city: 'Varanasi',
    offeringType: 'Mahaprasad',
    dispatchWindow: 'Fresh blessing dispatch in 24 hours',
    tags: ['Temple Packed', 'Fresh Offering'],
    isActive: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'prod-tirupati-laddu',
    vendorId: DEMO_VENDOR_PROFILE.uid,
    name: 'Tirupati Srivari Laddu Prasadam',
    description: 'Temple-origin laddu prasadam packed for family sharing and gifting.',
    price: 899,
    category: 'Prasad',
    image: 'https://picsum.photos/seed/tirupati-prasad/400/400',
    stock: 80,
    rating: 5,
    templeName: 'Tirumala Tirupati Devasthanam',
    weight: '750 g',
    size: 'Temple Gift Pack',
    city: 'Tirupati',
    offeringType: 'Laddu Prasadam',
    dispatchWindow: 'Dispatch within 48 hours',
    tags: ['Temple Packed', 'Popular'],
    isActive: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'prod-jagannath-khaja',
    vendorId: DEMO_VENDOR_PROFILE.uid,
    name: 'Jagannath Puri Khaja Prasad',
    description: 'Traditional khaja prasadam from Jagannath temple traditions, packed for safe travel.',
    price: 549,
    category: 'Prasad',
    image: 'https://picsum.photos/seed/puri-prasad/400/400',
    stock: 60,
    rating: 4.8,
    templeName: 'Jagannath Mandir',
    weight: '400 g',
    size: 'Travel Pack',
    city: 'Puri',
    offeringType: 'Khaja Prasad',
    dispatchWindow: 'Ships in 1 to 3 days',
    tags: ['Fresh Batch', 'Gift Friendly'],
    isActive: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'prod-brass-ganesha',
    vendorId: DEMO_VENDOR_PROFILE.uid,
    name: 'Brass Ganesha Idol',
    description: 'Handcrafted pure brass Ganesha idol for your home altar and sacred decor.',
    price: 1250,
    category: 'Idols',
    image: 'https://picsum.photos/seed/ganesha/400/400',
    stock: 50,
    rating: 4.8,
    offeringType: 'Murti',
    dispatchWindow: 'Ships in 2 to 4 days',
    isActive: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'prod-rudraksha-mala',
    vendorId: DEMO_VENDOR_PROFILE.uid,
    name: 'Rudraksha Mala',
    description: 'Original 108+1 beads Panchmukhi Rudraksha mala selected for daily chanting.',
    price: 450,
    category: 'Mala',
    image: 'https://picsum.photos/seed/mala/400/400',
    stock: 4,
    rating: 4.9,
    size: '108 + 1 beads',
    dispatchWindow: 'Ships in 2 to 3 days',
    isActive: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'prod-bhagavad-gita',
    vendorId: DEMO_VENDOR_PROFILE.uid,
    name: 'Bhagavad Gita Deluxe Edition',
    description: 'Hardbound devotional edition for daily study, satsang, and gifting.',
    price: 599,
    category: 'Books',
    image: 'https://picsum.photos/seed/gita/400/400',
    stock: 3,
    rating: 5,
    size: 'Hardbound',
    dispatchWindow: 'Ships in 2 to 4 days',
    isActive: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

const defaultPujas: Puja[] = [
  {
    id: 'puja-ganesh',
    vendorId: DEMO_VENDOR_PROFILE.uid,
    title: 'Ganesh Puja',
    description: 'Invoke the blessings of Lord Ganesha for new beginnings and removing obstacles.',
    price: 2100,
    duration: '1.5 Hours',
    samagriIncluded: true,
    mode: 'hybrid',
    onlineTimings: ['06:30 AM - 08:00 AM', '07:00 PM - 08:30 PM'],
    offlineTimings: ['08:00 AM - 10:00 AM', '05:00 PM - 06:30 PM'],
    templeName: 'DivineConnect Certified Pandit Seva',
    liveDarshanAvailable: false,
    isActive: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'puja-satyanarayan',
    vendorId: DEMO_VENDOR_PROFILE.uid,
    title: 'Satyanarayan Katha',
    description: 'A sacred ritual dedicated to Lord Vishnu for peace, prosperity, and happiness.',
    price: 5100,
    duration: '3 Hours',
    samagriIncluded: true,
    mode: 'hybrid',
    onlineTimings: ['09:00 AM - 12:00 PM'],
    offlineTimings: ['08:30 AM - 11:30 AM', '04:00 PM - 07:00 PM'],
    templeName: 'Family Home or Temple Mandap Setup',
    liveDarshanAvailable: true,
    isActive: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'puja-lakshmi',
    vendorId: DEMO_VENDOR_PROFILE.uid,
    title: 'Lakshmi Puja',
    description: 'Attract wealth and prosperity with this special puja dedicated to Goddess Lakshmi.',
    price: 3500,
    duration: '2 Hours',
    samagriIncluded: true,
    mode: 'hybrid',
    onlineTimings: ['07:30 AM - 09:30 AM', '06:30 PM - 08:30 PM'],
    offlineTimings: ['10:00 AM - 12:00 PM', '07:00 PM - 09:00 PM'],
    templeName: 'Festival and Griha Lakshmi Seva',
    liveDarshanAvailable: false,
    isActive: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 'puja-maha-mrityunjaya',
    vendorId: DEMO_VENDOR_PROFILE.uid,
    title: 'Maha Mrityunjaya Jaap',
    description: 'Powerful Vedic chanting for health, longevity, and spiritual protection.',
    price: 11000,
    duration: '5 Hours',
    samagriIncluded: true,
    mode: 'hybrid',
    onlineTimings: ['06:00 AM - 11:00 AM'],
    offlineTimings: ['05:30 AM - 10:30 AM'],
    templeName: 'Special Sankalp Seva',
    liveDarshanAvailable: true,
    isActive: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

function isBrowser() {
  return typeof window !== 'undefined';
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return clone(fallback);
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : clone(fallback);
  } catch (error) {
    console.error(`Failed to read demo storage for ${key}:`, error);
    return clone(fallback);
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function ensureDemoData() {
  if (!isBrowser()) {
    return;
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.products)) {
    writeStorage(STORAGE_KEYS.products, defaultProducts);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.pujas)) {
    writeStorage(STORAGE_KEYS.pujas, defaultPujas);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.bookings)) {
    writeStorage(STORAGE_KEYS.bookings, []);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.orders)) {
    writeStorage(STORAGE_KEYS.orders, []);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.readings)) {
    writeStorage(STORAGE_KEYS.readings, []);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.feedback)) {
    writeStorage(STORAGE_KEYS.feedback, []);
  }

  const storedProducts = readStorage<Product[]>(STORAGE_KEYS.products, defaultProducts);
  const migratedProducts = storedProducts.map((product) => {
    if (product.id === 'prod-rudraksha-mala' && product.stock === 100) {
      return { ...product, stock: 4 };
    }

    if (product.id === 'prod-bhagavad-gita' && product.stock === 75) {
      return { ...product, stock: 3 };
    }

    return product;
  });

  writeStorage(STORAGE_KEYS.products, migratedProducts);
}

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

function addDays(dateIso: string, days: number) {
  const nextDate = new Date(dateIso);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString();
}

function createOrderNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DC-${stamp}-${suffix}`;
}

function createTransactionId() {
  const suffix = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `TXN-${suffix}`;
}

function createBookingReference() {
  return `BK-${Date.now().toString().slice(-8)}`;
}

function buildOrderTimeline(createdAtIso: string): Order['statusTimeline'] {
  return [
    {
      status: 'processing',
      label: 'Order placed',
      note: 'We received your sacred offering request and started fulfillment.',
      completedAt: createdAtIso,
    },
    {
      status: 'packed',
      label: 'Temple packing',
      note: 'Items are being packed, blessed, and quality-checked before dispatch.',
      completedAt: addDays(createdAtIso, 1),
    },
    {
      status: 'shipped',
      label: 'Out for dispatch',
      note: 'The parcel is moving through the courier network.',
      completedAt: addDays(createdAtIso, 2),
    },
    {
      status: 'delivered',
      label: 'Estimated delivery',
      note: 'The parcel should reach the devotee address in the estimated window.',
      completedAt: addDays(createdAtIso, 4),
    },
  ];
}

function readProducts() {
  ensureDemoData();
  return readStorage<Product[]>(STORAGE_KEYS.products, defaultProducts);
}

function writeProducts(products: Product[]) {
  writeStorage(STORAGE_KEYS.products, products);
}

function readPujas() {
  ensureDemoData();
  return readStorage<Puja[]>(STORAGE_KEYS.pujas, defaultPujas);
}

function writePujas(pujas: Puja[]) {
  writeStorage(STORAGE_KEYS.pujas, pujas);
}

function readBookings() {
  ensureDemoData();
  return readStorage<Booking[]>(STORAGE_KEYS.bookings, []);
}

function writeBookings(bookings: Booking[]) {
  writeStorage(STORAGE_KEYS.bookings, bookings);
}

function readOrders() {
  ensureDemoData();
  return readStorage<Order[]>(STORAGE_KEYS.orders, []);
}

function writeOrders(orders: Order[]) {
  writeStorage(STORAGE_KEYS.orders, orders);
}

function readReadings() {
  ensureDemoData();
  return readStorage<AstrologyReading[]>(STORAGE_KEYS.readings, []);
}

function writeReadings(readings: AstrologyReading[]) {
  writeStorage(STORAGE_KEYS.readings, readings);
}

export async function getUserProfileDirect(uid = DEMO_DEVOTEE_PROFILE.uid) {
  const allProfiles = [DEMO_DEVOTEE_PROFILE, DEMO_VENDOR_PROFILE, DEMO_ADMIN_PROFILE];
  return clone(allProfiles.find((profile) => profile.uid === uid) || DEMO_DEVOTEE_PROFILE);
}

export async function listProductsDirect(
  filters: { category?: string; vendorId?: string; includeInactive?: boolean } = {},
) {
  return readProducts()
    .filter((product) => (filters.vendorId ? product.vendorId === filters.vendorId : true))
    .filter((product) => (filters.category ? product.category === filters.category : true))
    .filter((product) => (filters.includeInactive ? true : product.isActive !== false))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function saveProductDirect(payload: Omit<Product, 'id'> & { id?: string }) {
  const products = readProducts();
  const timestamp = nowIso();

  if (payload.id) {
    writeProducts(
      products.map((product) =>
        product.id === payload.id
          ? {
              ...product,
              ...payload,
              updatedAt: timestamp,
            }
          : product,
      ),
    );
    return payload.id;
  }

  const id = nextId('product');
  writeProducts([
    ...products,
    {
      ...payload,
      id,
      isActive: payload.isActive !== false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ]);
  return id;
}

export async function deleteProductDirect(id: string) {
  writeProducts(readProducts().filter((product) => product.id !== id));
}

export async function listPujasDirect(
  filters: { vendorId?: string; includeInactive?: boolean } = {},
) {
  return readPujas()
    .filter((puja) => (filters.vendorId ? puja.vendorId === filters.vendorId : true))
    .filter((puja) => (filters.includeInactive ? true : puja.isActive !== false))
    .sort((left, right) => left.title.localeCompare(right.title));
}

export async function getPujaDirect(id: string) {
  return clone(readPujas().find((puja) => puja.id === id) || null);
}

export async function savePujaDirect(payload: Omit<Puja, 'id'> & { id?: string }) {
  const pujas = readPujas();
  const timestamp = nowIso();

  if (payload.id) {
    writePujas(
      pujas.map((puja) =>
        puja.id === payload.id
          ? {
              ...puja,
              ...payload,
              updatedAt: timestamp,
            }
          : puja,
      ),
    );
    return payload.id;
  }

  const id = nextId('puja');
  writePujas([
    ...pujas,
    {
      ...payload,
      id,
      isActive: payload.isActive !== false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ]);
  return id;
}

export async function deletePujaDirect(id: string) {
  writePujas(readPujas().filter((puja) => puja.id !== id));
}

export async function listBookingsByUserDirect(uid: string) {
  return readBookings()
    .filter((booking) => booking.userId === uid)
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
}

export async function listBookingsByVendorDirect(uid: string) {
  return readBookings()
    .filter((booking) => booking.vendorId === uid)
    .map((booking) => ({
      ...booking,
      customerName: DEMO_DEVOTEE_PROFILE.displayName || DEMO_DEVOTEE_PROFILE.email || 'Demo User',
    }))
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
}

export async function createBookingDirect(payload: Omit<Booking, 'id'>) {
  const timestamp = nowIso();
  const id = nextId('booking');
  const booking: Booking = {
    ...payload,
    id,
    bookingReference: payload.bookingReference || createBookingReference(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  writeBookings([booking, ...readBookings()]);
  return id;
}

export async function updateBookingStatusDirect(id: string, status: Booking['status']) {
  const timestamp = nowIso();
  writeBookings(
    readBookings().map((booking) =>
      booking.id === id ? { ...booking, status, updatedAt: timestamp } : booking,
    ),
  );
}

export async function listOrdersByUserDirect(uid: string) {
  return readOrders()
    .filter((order) => order.userId === uid)
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
}

export async function listOrdersByVendorDirect(uid: string) {
  const products = readProducts().filter((product) => product.vendorId === uid);
  const productIds = new Set(products.map((product) => product.id));

  return readOrders()
    .filter((order) => order.items.some((item) => productIds.has(item.productId)))
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
}

export async function listAllOrdersDirect() {
  return readOrders().sort((left, right) =>
    String(right.createdAt).localeCompare(String(left.createdAt)),
  );
}

export async function listAllBookingsDirect() {
  return readBookings().sort((left, right) =>
    String(right.createdAt).localeCompare(String(left.createdAt)),
  );
}

export async function createOrderDirect(
  payload: Omit<Order, 'id' | 'orderNumber' | 'receipt' | 'createdAt'> & {
    paymentMethod: string;
    shippingFee: number;
  },
) {
  const createdAt = nowIso();
  const id = nextId('order');
  const orderNumber = createOrderNumber();
  const paymentStatus =
    payload.paymentMethod === 'Cash on Delivery' ? 'Pending on delivery' : 'Paid';
  const order: Order = {
    id,
    userId: payload.userId,
    orderNumber,
    items: payload.items,
    itemCount: payload.items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: payload.totalAmount,
    status: payload.status,
    shippingAddress: payload.shippingAddress,
    customerDetails: payload.customerDetails,
    receipt: {
      orderNumber,
      issuedAt: createdAt,
      paymentMethod: payload.paymentMethod,
      paymentStatus,
      transactionId: createTransactionId(),
      subtotal: payload.totalAmount,
      shippingFee: payload.shippingFee,
      totalAmount: payload.totalAmount,
    },
    estimatedDeliveryDate: addDays(createdAt, 4),
    statusTimeline: buildOrderTimeline(createdAt),
    createdAt,
    updatedAt: createdAt,
  };

  writeOrders([order, ...readOrders()]);
  return order;
}

export async function listAstrologyReadingsDirect(uid: string) {
  return readReadings()
    .filter((reading) => reading.userId === uid)
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
}

export async function createAstrologyReadingDirect(
  payload: Omit<AstrologyReading, 'id' | 'createdAt'>,
) {
  const reading: AstrologyReading = {
    ...payload,
    id: nextId('reading'),
    createdAt: nowIso(),
  };
  writeReadings([reading, ...readReadings()]);
  return reading;
}

export async function createFeedbackDirect(payload: {
  name: string;
  email: string;
  subject?: string;
  rating: number;
  message: string;
}) {
  ensureDemoData();
  const feedbackEntries = readStorage<Array<Record<string, unknown>>>(STORAGE_KEYS.feedback, []);
  feedbackEntries.unshift({
    id: nextId('feedback'),
    ...payload,
    createdAt: nowIso(),
  });
  writeStorage(STORAGE_KEYS.feedback, feedbackEntries);
}

export async function getAdminStatsDirect() {
  const products = readProducts();
  const bookings = readBookings();

  return {
    totalUsers: 3,
    totalVendors: 1,
    totalProducts: products.length,
    totalBookings: bookings.length,
  };
}

export function generateDemoAstrologyReading(payload: {
  name: string;
  dob: string;
  tob: string;
  pob: string;
  readingType?: 'vedic-reading' | 'kundali-match' | 'rashi-phal';
  partnerName?: string;
  partnerDob?: string;
  partnerTob?: string;
  partnerPob?: string;
  rashi?: string;
  query?: string;
}) {
  const readingType = payload.readingType || 'vedic-reading';
  const focus = payload.query?.trim() || 'overall life guidance';

  if (readingType === 'kundali-match') {
    return [
      `Namaste ${payload.name} and ${payload.partnerName || 'your partner'}.`,
      '',
      `This demo Kundali Match compares ${payload.name} (${payload.dob}, ${payload.tob}, ${payload.pob}) with ${payload.partnerName || 'your partner'} (${payload.partnerDob}, ${payload.partnerTob}, ${payload.partnerPob}).`,
      '',
      'Compatibility overview:',
      '- Emotional compatibility is steady when both partners communicate gently and avoid reacting in haste.',
      '- Family values and long-term commitment show supportive alignment in this match.',
      '- Practical planning around finances and household responsibilities will strengthen harmony.',
      '',
      'Ashtakoota style demo summary:',
      '- Guna Milan: 25 to 29 out of 36 range indicates a positive match for this showcase result.',
      '- Mutual respect and shared spiritual values are stronger than short-term disagreements.',
      '- Best growth comes through patience, trust, and regular family prayer or temple visits together.',
      '',
      'Recommended remedies:',
      '- Perform Ganesh Puja before major marriage discussions or engagement milestones.',
      '- Offer yellow sweets or flowers on Thursdays for grace and understanding.',
      '- Choose open communication over silence during sensitive phases.',
      '',
      'This is a locally generated demo Kundali Match for the static DivineConnect showcase.',
    ].join('\n');
  }

  if (readingType === 'rashi-phal') {
    return [
      `Namaste ${payload.name}.`,
      '',
      `Here is your demo Rashi Phal for ${payload.rashi || 'your sign'}, generated for the DivineConnect static showcase.`,
      '',
      'Rashi guidance:',
      '- Career: steady progress is supported when you complete pending work before starting something new.',
      '- Relationships: speak clearly and avoid overthinking small misunderstandings.',
      '- Finance: stay practical, review expenses, and avoid emotional purchases this week.',
      '- Health: maintain regular sleep, hydration, and a calm morning routine.',
      '',
      'Auspicious support:',
      '- Favorable days: Monday and Thursday',
      '- Favorable colors: saffron, white, and soft yellow',
      '- Spiritual focus: diya lighting, mantra chanting, and temple darshan',
      '',
      `Special note for ${payload.rashi || 'this rashi'}: ${focus.charAt(0).toUpperCase()}${focus.slice(1)} improves when you stay disciplined and spiritually grounded.`,
      '',
      'This is a locally generated demo Rashi Phal for the static DivineConnect showcase.',
    ].join('\n');
  }

  return [
    `Namaste ${payload.name}.`,
    '',
    `Based on your demo Vedic profile for ${payload.dob} at ${payload.tob} in ${payload.pob}, this reading highlights a practical and devotional life path.`,
    '',
    `Your current planetary energy supports steady progress in ${focus.toLowerCase()}, especially when you combine discipline with prayer or spiritual routine.`,
    '',
    'Key guidance:',
    '- Keep your mornings structured and calm.',
    '- Avoid delaying important family or financial decisions.',
    '- Thursday and Monday are especially supportive for sankalp, mantra, and temple visits.',
    '',
    'Suggested remedies:',
    '- Offer diya or incense before beginning important work.',
    '- Chant a short daily mantra for clarity and grounding.',
    '- Consider booking a Ganesh Puja or Lakshmi Puja for momentum and blessings.',
    '',
    'This is a demo reading created locally for the static showcase version of DivineConnect.',
  ].join('\n');
}

export function generateDemoSupportReply(messages: Array<{ role: 'user' | 'assistant'; content: string }>) {
  const latestUserMessage =
    [...messages].reverse().find((message) => message.role === 'user')?.content.toLowerCase() || '';

  if (latestUserMessage.includes('book') || latestUserMessage.includes('puja')) {
    return 'For demo booking, open Services, choose any puja, select date and slot, and confirm. The booking will appear immediately in the demo Profile page.';
  }

  if (latestUserMessage.includes('order') || latestUserMessage.includes('track') || latestUserMessage.includes('prasad')) {
    return 'For demo ordering, add any item from Shop to cart, complete checkout, and then open Profile > My Orders to download the PDF invoice, print it, or save the order certificate.';
  }

  if (latestUserMessage.includes('vendor')) {
    return 'The demo vendor dashboard is open without sign-in. You can visit the Vendor page to add offerings, update pujas, and manage booking statuses.';
  }

  if (latestUserMessage.includes('login') || latestUserMessage.includes('sign in')) {
    return `This demo no longer requires sign-in. If you still want sample credentials, use ${DEMO_CREDENTIALS.email} / ${DEMO_CREDENTIALS.password}.`;
  }

  return 'This static DivineConnect demo runs fully in the browser with local demo data. You can explore booking, cart, checkout, receipts, astrology, vendor, and admin flows without sign-in.';
}
