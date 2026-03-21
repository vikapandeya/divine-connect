import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  type QueryConstraint,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import type {
  AstrologyReading,
  Booking,
  Order,
  Product,
  Puja,
  UserProfile,
} from '../types';

type BookingRecord = Booking & {
  customerName?: string;
};

const PRODUCT_FALLBACK_CATEGORY = 'Puja Essentials';
const PRODUCT_CATEGORIES = new Set([
  'Prasad',
  'Idols',
  'Incense',
  'Mala',
  'Books',
  'Yantras',
  'Puja Essentials',
]);
const PUJA_MODES = new Set(['online', 'offline', 'hybrid']);
const BOOKING_TYPES = new Set(['puja', 'darshan']);
const BOOKING_STATUSES = new Set(['pending', 'confirmed', 'completed', 'cancelled']);

function cleanString(value: unknown, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  return value.trim();
}

function cleanOptionalString(value: unknown) {
  const cleanedValue = cleanString(value);
  return cleanedValue || undefined;
}

function normalizeStringList(values: unknown, maxItems = 12) {
  if (!Array.isArray(values)) {
    return [] as string[];
  }

  return Array.from(
    new Set(
      values
        .map((value) => cleanString(value))
        .filter(Boolean),
    ),
  ).slice(0, maxItems);
}

function normalizeNumber(value: unknown, min: number, max: number, fallback: number) {
  const parsedValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsedValue));
}

function normalizeInteger(value: unknown, min: number, max: number, fallback: number) {
  return Math.round(normalizeNumber(value, min, max, fallback));
}

function buildSearchKeywords(parts: Array<unknown>) {
  const keywords = parts.flatMap((part) => {
    const normalizedPart = cleanString(part).toLowerCase();
    if (!normalizedPart) {
      return [];
    }

    return [
      normalizedPart,
      ...normalizedPart.split(/[\s,./()_-]+/).filter((token) => token.length > 1),
    ];
  });

  return Array.from(new Set(keywords)).slice(0, 24);
}

function ensureImageUrl(value: unknown, seed: string) {
  const imageUrl = cleanString(value);
  if (imageUrl) {
    return imageUrl;
  }

  const fallbackSeed = encodeURIComponent(seed.toLowerCase().replace(/\s+/g, '-'));
  return `https://picsum.photos/seed/${fallbackSeed}/400/400`;
}

function normalizeProductPayload(payload: Omit<Product, 'id'> & { id?: string }) {
  const category = cleanString(payload.category) || PRODUCT_FALLBACK_CATEGORY;
  const normalizedCategory = PRODUCT_CATEGORIES.has(category) ? category : category.slice(0, 60);
  const name = cleanString(payload.name);
  const templeName = cleanOptionalString(payload.templeName);
  const offeringType = cleanOptionalString(payload.offeringType);
  const city = cleanOptionalString(payload.city);
  const searchKeywords = buildSearchKeywords([
    name,
    normalizedCategory,
    payload.description,
    templeName,
    offeringType,
    city,
    ...(payload.tags || []),
  ]);

  return {
    vendorId: cleanString(payload.vendorId) || 'system',
    name,
    description: cleanString(payload.description),
    price: normalizeNumber(payload.price, 0, 1000000, 0),
    category: normalizedCategory || PRODUCT_FALLBACK_CATEGORY,
    image: ensureImageUrl(payload.image, name || normalizedCategory || 'divine-connect-offering'),
    stock: normalizeInteger(payload.stock, 0, 100000, 0),
    rating: normalizeNumber(payload.rating, 0, 5, 4.5),
    templeName,
    weight: cleanOptionalString(payload.weight),
    size: cleanOptionalString(payload.size),
    dispatchWindow: cleanOptionalString(payload.dispatchWindow),
    city,
    offeringType,
    tags: normalizeStringList(payload.tags),
    searchKeywords,
    isActive: payload.isActive !== false,
  };
}

function normalizePujaPayload(payload: Omit<Puja, 'id'> & { id?: string }) {
  const title = cleanString(payload.title);
  const templeName = cleanOptionalString(payload.templeName);
  const mode = PUJA_MODES.has(String(payload.mode)) ? payload.mode : 'hybrid';
  const onlineTimings = normalizeStringList(payload.onlineTimings, 10);
  const offlineTimings = normalizeStringList(payload.offlineTimings, 10);

  return {
    vendorId: cleanString(payload.vendorId) || 'system',
    title,
    description: cleanString(payload.description),
    price: normalizeNumber(payload.price, 0, 1000000, 0),
    duration: cleanString(payload.duration) || '1 Hour',
    samagriIncluded: payload.samagriIncluded !== false,
    mode,
    onlineTimings,
    offlineTimings,
    templeName,
    liveDarshanAvailable: payload.liveDarshanAvailable === true,
    searchKeywords: buildSearchKeywords([
      title,
      payload.description,
      templeName,
      mode,
      ...onlineTimings,
      ...offlineTimings,
    ]),
    isActive: payload.isActive !== false,
  };
}

function createBookingReference() {
  return `BK-${Date.now().toString().slice(-8)}`;
}

function normalizeBookingPayload(payload: Omit<Booking, 'id'>) {
  return {
    userId: cleanString(payload.userId),
    serviceId: cleanString(payload.serviceId),
    vendorId: cleanString(payload.vendorId) || 'system',
    type: BOOKING_TYPES.has(payload.type) ? payload.type : 'puja',
    mode: payload.mode === 'offline' ? 'offline' : 'online',
    date: cleanString(payload.date),
    timeSlot: cleanString(payload.timeSlot),
    status: BOOKING_STATUSES.has(payload.status) ? payload.status : 'confirmed',
    totalAmount: normalizeNumber(payload.totalAmount, 0, 1000000, 0),
    bookingReference: cleanOptionalString(payload.bookingReference) || createBookingReference(),
  };
}

function normalizeOrderItems(items: Order['items']) {
  return items
    .map((item) => ({
      productId: cleanString(item.productId),
      name: cleanString(item.name),
      category: cleanString(item.category) || PRODUCT_FALLBACK_CATEGORY,
      quantity: normalizeInteger(item.quantity, 1, 99, 1),
      price: normalizeNumber(item.price, 0, 1000000, 0),
      image: cleanOptionalString(item.image),
      templeName: cleanOptionalString(item.templeName),
      weight: cleanOptionalString(item.weight),
      size: cleanOptionalString(item.size),
    }))
    .filter((item) => item.productId && item.name);
}

function normalizeCustomerDetails(details: Order['customerDetails']) {
  return {
    fullName: cleanString(details.fullName),
    email: cleanString(details.email),
    phoneNumber: cleanString(details.phoneNumber),
    addressLine1: cleanString(details.addressLine1),
    addressLine2: cleanOptionalString(details.addressLine2),
    city: cleanString(details.city),
    state: cleanString(details.state),
    pincode: cleanString(details.pincode),
    deliveryNotes: cleanOptionalString(details.deliveryNotes),
  };
}

function buildShippingAddress(details: ReturnType<typeof normalizeCustomerDetails>) {
  return [
    details.addressLine1,
    details.addressLine2,
    details.city && details.state ? `${details.city}, ${details.state}` : details.city || details.state,
    details.pincode,
  ]
    .filter(Boolean)
    .join(', ');
}

function requireDb() {
  if (!db) {
    throw new Error('Firestore is unavailable. Please verify your Firebase configuration.');
  }

  return db;
}

function serializeValue(value: unknown): unknown {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
        key,
        serializeValue(nestedValue),
      ]),
    );
  }

  return value;
}

function serializeDoc<T>(snapshot: { id: string; data: () => Record<string, unknown> | undefined }) {
  const serializedData = serializeValue(snapshot.data() || {}) as Record<string, unknown>;

  return {
    id: snapshot.id,
    ...serializedData,
  } as T;
}

function createOrderNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DC-${stamp}-${suffix}`;
}

function addDays(dateIso: string, days: number) {
  const nextDate = new Date(dateIso);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString();
}

function buildOrderTimeline(createdAtIso: string) {
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
      note: 'The parcel is expected to move into courier delivery after temple dispatch.',
      completedAt: addDays(createdAtIso, 2),
    },
    {
      status: 'delivered',
      label: 'Estimated delivery',
      note: 'The package is expected to reach the devotee address within the estimated window.',
      completedAt: addDays(createdAtIso, 4),
    },
  ] as Order['statusTimeline'];
}

export async function upsertUserProfileDirect({
  uid,
  displayName,
  email,
  photoURL,
  role,
}: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: string;
}) {
  const firestore = requireDb();
  const userRef = doc(firestore, 'users', uid);
  const existingSnapshot = await getDoc(userRef);
  const existingProfile = existingSnapshot.exists()
    ? (serializeDoc<UserProfile>(existingSnapshot) as UserProfile)
    : null;

  const resolvedRole =
    existingProfile?.role ||
    (auth?.currentUser?.email === 'pg2331427@gmail.com' && auth.currentUser.emailVerified
      ? 'admin'
      : role === 'vendor'
        ? 'vendor'
        : 'devotee');

  await setDoc(
    userRef,
    {
      uid,
      displayName: displayName || existingProfile?.displayName || '',
      email: email || existingProfile?.email || '',
      photoURL: photoURL || existingProfile?.photoURL || '',
      role: resolvedRole,
      phoneNumber: existingProfile?.phoneNumber || '',
      addresses: existingProfile?.addresses || [],
      createdAt: existingSnapshot.exists() ? existingSnapshot.data()?.createdAt || serverTimestamp() : serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  const savedSnapshot = await getDoc(userRef);
  return serializeDoc<UserProfile>(savedSnapshot);
}

export async function getUserProfileDirect(uid: string) {
  const snapshot = await getDoc(doc(requireDb(), 'users', uid));
  return snapshot.exists() ? serializeDoc<UserProfile>(snapshot) : null;
}

export async function listProductsDirect(
  filters: { category?: string; vendorId?: string; includeInactive?: boolean } = {},
) {
  const firestore = requireDb();
  const constraints: QueryConstraint[] = [];

  if (filters.category) {
    constraints.push(where('category', '==', filters.category));
  }

  if (filters.vendorId) {
    constraints.push(where('vendorId', '==', filters.vendorId));
  }

  constraints.push(orderBy('updatedAt', 'desc'));

  const snapshot = constraints.length
    ? await getDocs(query(collection(firestore, 'products'), ...constraints))
    : await getDocs(query(collection(firestore, 'products'), orderBy('updatedAt', 'desc')));

  return snapshot.docs
    .map((docSnapshot) => serializeDoc<Product>(docSnapshot))
    .filter((product) => filters.includeInactive || product.isActive !== false)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function saveProductDirect(
  payload: Omit<Product, 'id'> & { id?: string },
) {
  const firestore = requireDb();
  const normalizedPayload = normalizeProductPayload(payload);

  if (payload.id) {
    await setDoc(
      doc(firestore, 'products', payload.id),
      {
        ...normalizedPayload,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    return payload.id;
  }

  const createdRef = await addDoc(collection(firestore, 'products'), {
    ...normalizedPayload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return createdRef.id;
}

export async function deleteProductDirect(id: string) {
  await deleteDoc(doc(requireDb(), 'products', id));
}

export async function listPujasDirect(
  filters: { vendorId?: string; includeInactive?: boolean } = {},
) {
  const firestore = requireDb();
  const constraints: QueryConstraint[] = [];

  if (filters.vendorId) {
    constraints.push(where('vendorId', '==', filters.vendorId));
  }

  constraints.push(orderBy('updatedAt', 'desc'));

  const snapshot = constraints.length
    ? await getDocs(query(collection(firestore, 'pujas'), ...constraints))
    : await getDocs(query(collection(firestore, 'pujas'), orderBy('updatedAt', 'desc')));

  return snapshot.docs
    .map((docSnapshot) => serializeDoc<Puja>(docSnapshot))
    .filter((puja) => filters.includeInactive || puja.isActive !== false)
    .sort((left, right) => left.title.localeCompare(right.title));
}

export async function getPujaDirect(id: string) {
  const snapshot = await getDoc(doc(requireDb(), 'pujas', id));
  return snapshot.exists() ? serializeDoc<Puja>(snapshot) : null;
}

export async function savePujaDirect(payload: Omit<Puja, 'id'> & { id?: string }) {
  const firestore = requireDb();
  const normalizedPayload = normalizePujaPayload(payload);

  if (payload.id) {
    await setDoc(
      doc(firestore, 'pujas', payload.id),
      {
        ...normalizedPayload,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    return payload.id;
  }

  const createdRef = await addDoc(collection(firestore, 'pujas'), {
    ...normalizedPayload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return createdRef.id;
}

export async function deletePujaDirect(id: string) {
  await deleteDoc(doc(requireDb(), 'pujas', id));
}

export async function listBookingsByUserDirect(uid: string) {
  const snapshot = await getDocs(
    query(
      collection(requireDb(), 'bookings'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(50),
    ),
  );

  return snapshot.docs.map((docSnapshot) => serializeDoc<Booking>(docSnapshot));
}

export async function listBookingsByVendorDirect(uid: string) {
  const firestore = requireDb();
  const snapshot = await getDocs(
    query(
      collection(firestore, 'bookings'),
      where('vendorId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(100),
    ),
  );
  const bookings = snapshot.docs.map((docSnapshot) => serializeDoc<BookingRecord>(docSnapshot));
  const userIds = Array.from(new Set(bookings.map((booking) => booking.userId).filter(Boolean)));
  const userProfiles = await Promise.all(userIds.map((userId) => getUserProfileDirect(userId)));
  const profileMap = new Map(
    userProfiles.filter(Boolean).map((profile) => [profile!.uid, profile!]),
  );

  return bookings
    .map((booking) => ({
      ...booking,
      customerName:
        profileMap.get(booking.userId)?.displayName ||
        profileMap.get(booking.userId)?.email ||
        'Customer',
    }))
    .sort((left, right) => String(right.date).localeCompare(String(left.date)));
}

export async function createBookingDirect(payload: Omit<Booking, 'id'>) {
  const normalizedPayload = normalizeBookingPayload(payload);
  const createdRef = await addDoc(collection(requireDb(), 'bookings'), {
    ...normalizedPayload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return createdRef.id;
}

export async function updateBookingStatusDirect(id: string, status: Booking['status']) {
  await updateDoc(doc(requireDb(), 'bookings', id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function listOrdersByUserDirect(uid: string) {
  const snapshot = await getDocs(
    query(
      collection(requireDb(), 'orders'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(50),
    ),
  );

  return snapshot.docs.map((docSnapshot) => serializeDoc<Order>(docSnapshot));
}

export async function createOrderDirect(
  payload: Omit<Order, 'id' | 'orderNumber' | 'receipt' | 'createdAt'> & {
    paymentMethod: string;
    shippingFee: number;
  },
) {
  const createdAtIso = new Date().toISOString();
  const orderNumber = createOrderNumber();
  const normalizedItems = normalizeOrderItems(payload.items);
  const customerDetails = normalizeCustomerDetails(payload.customerDetails);
  const shippingAddress = buildShippingAddress(customerDetails);
  const totalAmount = normalizeNumber(payload.totalAmount, 0, 1000000, 0);
  const shippingFee = normalizeNumber(payload.shippingFee, 0, 50000, 0);
  const receipt = {
    orderNumber,
    issuedAt: createdAtIso,
    paymentMethod: cleanString(payload.paymentMethod) || 'Online',
    subtotal: totalAmount,
    shippingFee,
    totalAmount,
  };

  await addDoc(collection(requireDb(), 'orders'), {
    userId: cleanString(payload.userId),
    orderNumber,
    items: normalizedItems,
    itemCount: normalizedItems.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount,
    status: payload.status,
    shippingAddress,
    customerDetails,
    receipt,
    estimatedDeliveryDate: addDays(createdAtIso, 4),
    statusTimeline: buildOrderTimeline(createdAtIso),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function listAstrologyReadingsDirect(uid: string) {
  const snapshot = await getDocs(
    query(
      collection(requireDb(), 'astrologyReadings'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(25),
    ),
  );

  return snapshot.docs.map((docSnapshot) => serializeDoc<AstrologyReading>(docSnapshot));
}

export async function createFeedbackDirect(payload: {
  name: string;
  email: string;
  subject?: string;
  rating: number;
  message: string;
}) {
  await addDoc(collection(requireDb(), 'feedbackSubmissions'), {
    userId: auth?.currentUser?.uid || null,
    name: payload.name.trim(),
    email: payload.email.trim(),
    subject: payload.subject?.trim() || '',
    rating: payload.rating,
    message: payload.message.trim(),
    createdAt: serverTimestamp(),
  });
}

export async function getAdminStatsDirect() {
  const firestore = requireDb();
  const [usersSnapshot, productsSnapshot, bookingsSnapshot] = await Promise.all([
    getDocs(collection(firestore, 'users')),
    getDocs(collection(firestore, 'products')),
    getDocs(collection(firestore, 'bookings')),
  ]);

  const totalUsers = usersSnapshot.size;
  const totalVendors = usersSnapshot.docs.filter((docSnapshot) => docSnapshot.data().role === 'vendor').length;

  return {
    totalUsers,
    totalVendors,
    totalProducts: productsSnapshot.size,
    totalBookings: bookingsSnapshot.size,
  };
}
