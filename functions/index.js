const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { onRequest } = require('firebase-functions/v2/https');
const { onInit } = require('firebase-functions/v2/core');
const { defineSecret } = require('firebase-functions/params');
const { GoogleGenAI } = require('@google/genai');

admin.initializeApp();

const db = getFirestore();
const app = express();
const geminiApiKey = defineSecret('GEMINI_API_KEY');
const tathaastuApiKey = defineSecret('TATHAASTU_API_KEY');
const FUNCTIONS_REGION = 'asia-south1';
const ADMIN_EMAIL = 'pg2331427@gmail.com';
const DEFAULT_PANCHANG_LOCATION = {
  latitude: 25.3176,
  longitude: 82.9739,
  label: 'Varanasi, Uttar Pradesh',
};

let aiClient = null;
let seedPromise = null;

const defaultProducts = [
  {
    id: 'prod-brass-ganesha',
    vendorId: 'system',
    name: 'Brass Ganesha Idol',
    description: 'Handcrafted pure brass Ganesha idol for your home altar.',
    price: 1250,
    category: 'Idols',
    stock: 50,
    rating: 4.8,
    image: 'https://picsum.photos/seed/ganesha/400/400',
    offeringType: 'Murti',
    dispatchWindow: 'Ships in 2-4 days',
  },
  {
    id: 'prod-sandalwood-incense',
    vendorId: 'system',
    name: 'Sandalwood Incense',
    description: 'Premium Mysore sandalwood incense sticks for a divine aroma.',
    price: 150,
    category: 'Incense',
    stock: 200,
    rating: 4.5,
    image: 'https://picsum.photos/seed/incense/400/400',
    offeringType: 'Fragrance',
    dispatchWindow: 'Ships in 1-2 days',
  },
  {
    id: 'prod-rudraksha-mala',
    vendorId: 'system',
    name: 'Rudraksha Mala',
    description: 'Original 108+1 beads Panchmukhi Rudraksha mala from Nepal.',
    price: 450,
    category: 'Mala',
    stock: 100,
    rating: 4.9,
    image: 'https://picsum.photos/seed/mala/400/400',
    size: '108 + 1 beads',
    dispatchWindow: 'Ships in 2-3 days',
  },
  {
    id: 'prod-bhagavad-gita',
    vendorId: 'system',
    name: 'Bhagavad Gita',
    description: 'The Bhagavad Gita As It Is - Deluxe Hardbound Edition.',
    price: 599,
    category: 'Books',
    stock: 75,
    rating: 5,
    image: 'https://picsum.photos/seed/gita/400/400',
    size: 'Hardbound',
    dispatchWindow: 'Ships in 2-4 days',
  },
  {
    id: 'prod-copper-shri-yantra',
    vendorId: 'system',
    name: 'Copper Shri Yantra',
    description: 'Energized copper Shri Yantra for prosperity and positive energy.',
    price: 850,
    category: 'Yantras',
    stock: 30,
    rating: 4.7,
    image: 'https://picsum.photos/seed/yantra/400/400',
    size: '4 x 4 inch',
    dispatchWindow: 'Ships in 2-5 days',
  },
  {
    id: 'prod-kashi-vishwanath-prasad',
    vendorId: 'system',
    name: 'Kashi Vishwanath Mahaprasad Box',
    description: 'Temple prasad box with mishri, dry fruits, sacred raksha sutra, and blessed tulsi leaves.',
    price: 699,
    category: 'Prasad',
    stock: 120,
    rating: 4.9,
    image: 'https://picsum.photos/seed/kashi-prasad/400/400',
    templeName: 'Kashi Vishwanath Mandir',
    weight: '500 g',
    size: 'Family Box',
    city: 'Varanasi',
    offeringType: 'Mahaprasad',
    dispatchWindow: 'Blessed fresh and dispatched within 24 hours',
    tags: ['Temple Packed', 'Fresh Offering'],
  },
  {
    id: 'prod-tirupati-laddu',
    vendorId: 'system',
    name: 'Tirupati Srivari Laddu Prasadam',
    description: 'Devotional laddu prasadam packed in sealed boxes with temple-origin details and dispatch notes.',
    price: 899,
    category: 'Prasad',
    stock: 80,
    rating: 5,
    image: 'https://picsum.photos/seed/tirupati-prasad/400/400',
    templeName: 'Tirumala Tirupati Devasthanam',
    weight: '750 g',
    size: 'Temple Gift Pack',
    city: 'Tirupati',
    offeringType: 'Laddu Prasadam',
    dispatchWindow: 'Dispatch in 48 hours subject to temple batch schedule',
    tags: ['Temple Packed', 'Popular'],
  },
  {
    id: 'prod-jagannath-khaja',
    vendorId: 'system',
    name: 'Jagannath Puri Khaja Prasad',
    description: 'Crisp khaja prasadam from Jagannath temple traditions, packed for safe travel and gifting.',
    price: 549,
    category: 'Prasad',
    stock: 60,
    rating: 4.8,
    image: 'https://picsum.photos/seed/puri-prasad/400/400',
    templeName: 'Jagannath Mandir',
    weight: '400 g',
    size: 'Travel Pack',
    city: 'Puri',
    offeringType: 'Khaja Prasad',
    dispatchWindow: 'Ships in 1-3 days depending on fresh batch availability',
    tags: ['Fresh Batch', 'Gift Friendly'],
  },
];

const defaultPujas = [
  {
    id: 'puja-ganesh',
    vendorId: 'system',
    title: 'Ganesh Puja',
    description: 'Invoke the blessings of Lord Ganesha for new beginnings and removing obstacles.',
    price: 2100,
    duration: '1.5 Hours',
    samagriIncluded: true,
    mode: 'hybrid',
    onlineTimings: ['06:30 AM - 08:00 AM', '07:00 PM - 08:30 PM'],
    offlineTimings: ['08:00 AM - 10:00 AM', '05:00 PM - 06:30 PM'],
    templeName: 'PunyaSeva Certified Pandit Seva',
    liveDarshanAvailable: false,
  },
  {
    id: 'puja-satyanarayan',
    vendorId: 'system',
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
  },
  {
    id: 'puja-lakshmi',
    vendorId: 'system',
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
  },
];

onInit(() => {
  aiClient = new GoogleGenAI({ apiKey: geminiApiKey.value() });
});

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

const apiWelcomePayload = {
  status: 'ok',
  service: 'PunyaSeva API',
  database: 'firestore',
  backend: 'firebase-functions',
  healthEndpoint: '/health',
};

function getAiClient() {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey.value() });
  }

  return aiClient;
}

function serializeValue(value) {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, serializeValue(nestedValue)]),
    );
  }

  return value;
}

function serializeDoc(documentSnapshot) {
  return {
    id: documentSnapshot.id,
    ...serializeValue(documentSnapshot.data() || {}),
  };
}

function buildShippingAddress(details = {}) {
  return [
    details.addressLine1,
    details.addressLine2,
    details.city && details.state ? `${details.city}, ${details.state}` : details.city || details.state,
    details.pincode,
  ]
    .filter(Boolean)
    .join(', ');
}

function createOrderNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DC-${stamp}-${suffix}`;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function buildOrderTimeline(createdAtIso) {
  return [
    {
      status: 'processing',
      label: 'Order placed',
      note: 'We received your sacred offering request and are preparing the fulfillment flow.',
      completedAt: createdAtIso,
    },
    {
      status: 'packed',
      label: 'Temple packing',
      note: 'Your items are being packed, blessed, and quality-checked before dispatch.',
      completedAt: addDays(createdAtIso, 1).toISOString(),
    },
    {
      status: 'shipped',
      label: 'Out for dispatch',
      note: 'The parcel is expected to move into courier delivery after temple dispatch.',
      completedAt: addDays(createdAtIso, 2).toISOString(),
    },
    {
      status: 'delivered',
      label: 'Estimated delivery',
      note: 'The package is expected to reach the devotee address within the estimated window.',
      completedAt: addDays(createdAtIso, 4).toISOString(),
    },
  ];
}

function isAdmin(requester) {
  return Boolean(
    requester &&
      (requester.role === 'admin' ||
        (requester.email === ADMIN_EMAIL && requester.emailVerified === true)),
  );
}

function isVendor(requester) {
  return Boolean(requester && requester.role === 'vendor');
}

async function getRequester(req) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  const idToken = authHeader.slice(7);
  const decoded = await admin.auth().verifyIdToken(idToken);
  const userSnapshot = await db.collection('users').doc(decoded.uid).get();

  return {
    uid: decoded.uid,
    email: decoded.email || null,
    emailVerified: decoded.email_verified === true,
    role: userSnapshot.exists ? userSnapshot.data().role || 'devotee' : 'devotee',
  };
}

async function requireAuth(req, res) {
  try {
    const requester = await getRequester(req);

    if (!requester) {
      res.status(401).json({ error: 'Please sign in to continue.' });
      return null;
    }

    return requester;
  } catch (error) {
    console.error('Auth verification failed:', error);
    res.status(401).json({ error: 'Your session is invalid. Please sign in again.' });
    return null;
  }
}

function assert(condition, message, statusCode = 400) {
  if (!condition) {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
  }
}

function getIstDateString(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function formatDisplayDate(dateString) {
  const displayDate = new Date(`${dateString}T12:00:00+05:30`);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(displayDate);
}

function normalizeCoordinate(value, fallback) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

async function fetchJsonOrThrow(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();

  let payload = {};

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      payload = { raw: text };
    }
  }

  assert(
    response.ok,
    payload.message || payload.error || `Request failed with status ${response.status}.`,
    response.status,
  );

  return payload;
}

function formatTithiLabel(tithi = {}, hinduCalendar = {}) {
  const monthLabel = hinduCalendar.amanta || hinduCalendar.purnimanta || '';
  const pakshaLabel = tithi.paksha || '';
  const tithiName = tithi.name || '';
  return [monthLabel, pakshaLabel, tithiName].filter(Boolean).join(' ').trim();
}

function extractFestivalName(payload) {
  if (!Array.isArray(payload?.festivals) || payload.festivals.length === 0) {
    return null;
  }

  const primaryFestival = payload.festivals[0];

  if (typeof primaryFestival === 'string') {
    return primaryFestival;
  }

  if (primaryFestival && typeof primaryFestival === 'object') {
    return primaryFestival.name || primaryFestival.title || primaryFestival.code || null;
  }

  return null;
}

function formatAbhijitLabel(timingsPayload) {
  const abhijitCandidates = [
    timingsPayload?.abhijit,
    timingsPayload?.abhijit_muhurat,
    timingsPayload?.muhurta?.abhijit,
    timingsPayload?.timings?.abhijit,
    timingsPayload?.timings?.abhijit_muhurat,
  ].filter(Boolean);

  for (const candidate of abhijitCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return `Abhijit Muhurat: ${candidate.trim()}`;
    }

    if (candidate && typeof candidate === 'object') {
      const startLabel = candidate.start || candidate.start_time || candidate.from || null;
      const endLabel = candidate.end || candidate.end_time || candidate.to || null;

      if (startLabel && endLabel) {
        return `Abhijit Muhurat: ${startLabel} - ${endLabel}`;
      }
    }
  }

  return 'Abhijit Muhurat: check local noon window for the selected city.';
}

function buildPanchangFocus(payload) {
  const festivalName = extractFestivalName(payload);

  if (festivalName) {
    return `${festivalName} is highlighted today, making it a strong day for prayer, family sankalp, and devotional observances.`;
  }

  const tithiName = payload?.tithi?.name || 'today';
  const nakshatraName = payload?.nakshatra?.name || 'the current nakshatra';

  return `Auspicious focus for ${tithiName}: align your prayers with ${nakshatraName}, keep the sankalp simple, and use the day for calm devotional practice.`;
}

async function ensureSeedData() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const bootstrapRef = db.collection('_system').doc('bootstrap');
      const bootstrapSnapshot = await bootstrapRef.get();

      if (bootstrapSnapshot.exists && bootstrapSnapshot.data().seedVersion === 2) {
        return;
      }

      const batch = db.batch();
      const productDocs = await Promise.all(
        defaultProducts.map((product) => db.collection('products').doc(product.id).get()),
      );
      const pujaDocs = await Promise.all(
        defaultPujas.map((puja) => db.collection('pujas').doc(puja.id).get()),
      );

      defaultProducts.forEach((product, index) => {
        if (!productDocs[index].exists) {
          batch.set(db.collection('products').doc(product.id), {
            ...product,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      });

      defaultPujas.forEach((puja, index) => {
        if (!pujaDocs[index].exists) {
          batch.set(db.collection('pujas').doc(puja.id), {
            ...puja,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      });

      batch.set(
        bootstrapRef,
        {
          seedVersion: 2,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      await batch.commit();
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }

  return seedPromise;
}

async function getUserProfile(uid) {
  const snapshot = await db.collection('users').doc(uid).get();
  return snapshot.exists ? serializeDoc(snapshot) : null;
}

app.get(['/', '/api'], async (req, res) => {
  res.json(apiWelcomePayload);
});

app.get(['/health', '/api/health'], async (req, res) => {
  res.json({
    ...apiWelcomePayload,
  });
});

app.get(['/panchang/today', '/api/panchang/today'], async (req, res) => {
  try {
    const apiKey = tathaastuApiKey.value();
    assert(apiKey && apiKey.trim(), 'Panchang API key is not configured.', 503);

    const date =
      typeof req.query.date === 'string' && req.query.date.trim()
        ? req.query.date.trim()
        : getIstDateString();
    const latitude = normalizeCoordinate(req.query.lat, DEFAULT_PANCHANG_LOCATION.latitude);
    const longitude = normalizeCoordinate(req.query.lon, DEFAULT_PANCHANG_LOCATION.longitude);
    const locationLabel =
      typeof req.query.location === 'string' && req.query.location.trim()
        ? req.query.location.trim()
        : DEFAULT_PANCHANG_LOCATION.label;

    const baseUrl = 'https://api.tathaastuapi.com/v1';
    const headers = {
      'X-API-Key': apiKey,
    };

    const [panchangPayload, timingsPayload] = await Promise.all([
      fetchJsonOrThrow(
        `${baseUrl}/panchang?date=${date}&lat=${latitude}&lon=${longitude}&include=festivals`,
        { headers },
      ),
      fetchJsonOrThrow(
        `${baseUrl}/timings?date=${date}&lat=${latitude}&lon=${longitude}`,
        { headers },
      ),
    ]);

    res.json({
      success: true,
      source: 'tathaastu',
      fetchedAt: new Date().toISOString(),
      location: {
        label: locationLabel,
        latitude,
        longitude,
      },
      panchang: {
        date,
        dateLabel: formatDisplayDate(date),
        tithi:
          formatTithiLabel(panchangPayload.tithi, panchangPayload.hindu_calendar)
          || panchangPayload.tithi?.name
          || 'Tithi unavailable',
        nakshatra: panchangPayload.nakshatra?.name || 'Nakshatra unavailable',
        muhurat: formatAbhijitLabel(timingsPayload),
        focus: buildPanchangFocus(panchangPayload),
        festivalName: extractFestivalName(panchangPayload),
      },
      engine: panchangPayload.engine || null,
    });
  } catch (error) {
    console.error('Panchang API error:', error);
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to fetch daily panchang.',
    });
  }
});

app.get(['/users/:uid', '/api/users/:uid'], async (req, res) => {
  const requester = await requireAuth(req, res);
  if (!requester) {
    return;
  }

  if (requester.uid !== req.params.uid && !isAdmin(requester)) {
    return res.status(403).json({ error: 'You are not allowed to view this profile.' });
  }

  const profile = await getUserProfile(req.params.uid);

  if (!profile) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json(profile);
});

app.post(['/users', '/api/users'], async (req, res) => {
  try {
    const requester = await requireAuth(req, res);
    if (!requester) {
      return;
    }

    const { uid, displayName, email, photoURL, role } = req.body || {};
    assert(typeof uid === 'string' && uid.length > 0, 'User ID is required.');
    assert(uid === requester.uid, 'You can only update your own profile.', 403);

    const userRef = db.collection('users').doc(uid);
    const existingSnapshot = await userRef.get();
    const existingData = existingSnapshot.exists ? existingSnapshot.data() : {};

    const resolvedRole = existingData.role
      || (requester.email === ADMIN_EMAIL && requester.emailVerified ? 'admin' : null)
      || (role === 'vendor' ? 'vendor' : 'devotee');

    const userProfile = {
      uid,
      displayName: displayName || existingData.displayName || '',
      email: email || requester.email || existingData.email || '',
      photoURL: photoURL || existingData.photoURL || '',
      role: resolvedRole,
      phoneNumber: existingData.phoneNumber || '',
      addresses: existingData.addresses || [],
      createdAt: existingData.createdAt || FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await userRef.set(userProfile, { merge: true });
    const savedSnapshot = await userRef.get();

    res.json({ success: true, user: serializeDoc(savedSnapshot) });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to save user profile.' });
  }
});

app.get(['/admin/stats', '/api/admin/stats'], async (req, res) => {
  const requester = await requireAuth(req, res);
  if (!requester) {
    return;
  }

  if (!isAdmin(requester)) {
    return res.status(403).json({ error: 'Admin access is required.' });
  }

  await ensureSeedData();

  const [usersSnapshot, vendorsSnapshot, productsSnapshot, bookingsSnapshot] = await Promise.all([
    db.collection('users').get(),
    db.collection('users').where('role', '==', 'vendor').get(),
    db.collection('products').get(),
    db.collection('bookings').get(),
  ]);

  res.json({
    totalUsers: usersSnapshot.size,
    totalVendors: vendorsSnapshot.size,
    totalProducts: productsSnapshot.size,
    totalBookings: bookingsSnapshot.size,
  });
});

app.get(['/products', '/api/products'], async (req, res) => {
  await ensureSeedData();

  let query = db.collection('products');
  const { category, vendorId } = req.query;

  if (typeof category === 'string' && category && category !== 'all') {
    query = query.where('category', '==', category);
  }

  if (typeof vendorId === 'string' && vendorId) {
    query = query.where('vendorId', '==', vendorId);
  }

  const snapshot = await query.get();
  res.json(snapshot.docs.map(serializeDoc));
});

app.post(['/products', '/api/products'], async (req, res) => {
  try {
    const requester = await requireAuth(req, res);
    if (!requester) {
      return;
    }

    if (!isVendor(requester) && !isAdmin(requester)) {
      return res.status(403).json({ error: 'Vendor or admin access is required.' });
    }

    const payload = req.body || {};
    const vendorId = payload.vendorId || requester.uid;

    if (!isAdmin(requester) && vendorId !== requester.uid) {
      return res.status(403).json({ error: 'You can only create products for your own account.' });
    }

    assert(typeof payload.name === 'string' && payload.name.trim(), 'Product name is required.');
    assert(typeof payload.category === 'string' && payload.category.trim(), 'Product category is required.');
    assert(Number.isFinite(payload.price), 'Valid product price is required.');
    assert(Number.isInteger(payload.stock), 'Valid stock quantity is required.');

    const productRef = db.collection('products').doc();
    const productData = {
      vendorId,
      name: payload.name.trim(),
      description: payload.description || '',
      price: Number(payload.price),
      category: payload.category,
      stock: Number(payload.stock),
      rating: Number(payload.rating || 4.5),
      image: payload.image || '',
      templeName: payload.templeName || '',
      weight: payload.weight || '',
      size: payload.size || '',
      dispatchWindow: payload.dispatchWindow || '',
      city: payload.city || '',
      offeringType: payload.offeringType || '',
      tags: Array.isArray(payload.tags) ? payload.tags.filter(Boolean) : [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await productRef.set(productData);
    const createdSnapshot = await productRef.get();
    res.json({ success: true, product: serializeDoc(createdSnapshot) });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to save product.' });
  }
});

app.put(['/products/:id', '/api/products/:id'], async (req, res) => {
  try {
    const requester = await requireAuth(req, res);
    if (!requester) {
      return;
    }

    const productRef = db.collection('products').doc(req.params.id);
    const productSnapshot = await productRef.get();
    assert(productSnapshot.exists, 'Product not found.', 404);

    const existingProduct = productSnapshot.data();
    const canEdit = isAdmin(requester)
      || (isVendor(requester) && existingProduct.vendorId === requester.uid);

    if (!canEdit) {
      return res.status(403).json({ error: 'You are not allowed to edit this product.' });
    }

    const payload = req.body || {};
    await productRef.set(
      {
        name: payload.name ?? existingProduct.name,
        description: payload.description ?? existingProduct.description,
        price: Number(payload.price ?? existingProduct.price),
        category: payload.category ?? existingProduct.category,
        stock: Number(payload.stock ?? existingProduct.stock),
        rating: Number(payload.rating ?? existingProduct.rating),
        image: payload.image ?? existingProduct.image,
        templeName: payload.templeName ?? existingProduct.templeName ?? '',
        weight: payload.weight ?? existingProduct.weight ?? '',
        size: payload.size ?? existingProduct.size ?? '',
        dispatchWindow: payload.dispatchWindow ?? existingProduct.dispatchWindow ?? '',
        city: payload.city ?? existingProduct.city ?? '',
        offeringType: payload.offeringType ?? existingProduct.offeringType ?? '',
        tags: Array.isArray(payload.tags) ? payload.tags.filter(Boolean) : existingProduct.tags ?? [],
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    const updatedSnapshot = await productRef.get();
    res.json({ success: true, product: serializeDoc(updatedSnapshot) });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update product.' });
  }
});

app.delete(['/products/:id', '/api/products/:id'], async (req, res) => {
  try {
    const requester = await requireAuth(req, res);
    if (!requester) {
      return;
    }

    const productRef = db.collection('products').doc(req.params.id);
    const productSnapshot = await productRef.get();
    assert(productSnapshot.exists, 'Product not found.', 404);

    const existingProduct = productSnapshot.data();
    const canDelete = isAdmin(requester)
      || (isVendor(requester) && existingProduct.vendorId === requester.uid);

    if (!canDelete) {
      return res.status(403).json({ error: 'You are not allowed to delete this product.' });
    }

    await productRef.delete();
    res.json({ success: true });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to delete product.' });
  }
});

app.get(['/pujas', '/api/pujas'], async (req, res) => {
  await ensureSeedData();

  let query = db.collection('pujas');
  const { vendorId } = req.query;

  if (typeof vendorId === 'string' && vendorId) {
    query = query.where('vendorId', '==', vendorId);
  }

  const snapshot = await query.get();
  res.json(snapshot.docs.map(serializeDoc));
});

app.get(['/pujas/:id', '/api/pujas/:id'], async (req, res) => {
  await ensureSeedData();

  const snapshot = await db.collection('pujas').doc(req.params.id).get();

  if (!snapshot.exists) {
    return res.status(404).json({ error: 'Puja not found.' });
  }

  res.json(serializeDoc(snapshot));
});

app.post(['/pujas', '/api/pujas'], async (req, res) => {
  try {
    const requester = await requireAuth(req, res);
    if (!requester) {
      return;
    }

    if (!isVendor(requester) && !isAdmin(requester)) {
      return res.status(403).json({ error: 'Vendor or admin access is required.' });
    }

    const payload = req.body || {};
    const vendorId = payload.vendorId || requester.uid;

    if (!isAdmin(requester) && vendorId !== requester.uid) {
      return res.status(403).json({ error: 'You can only create pujas for your own account.' });
    }

    assert(typeof payload.title === 'string' && payload.title.trim(), 'Puja title is required.');
    assert(Number.isFinite(payload.price), 'Valid puja price is required.');

    const pujaRef = db.collection('pujas').doc();
    const pujaData = {
      vendorId,
      title: payload.title.trim(),
      description: payload.description || '',
      price: Number(payload.price),
      duration: payload.duration || '',
      samagriIncluded: payload.samagriIncluded !== false,
      mode: payload.mode || 'hybrid',
      onlineTimings: Array.isArray(payload.onlineTimings) ? payload.onlineTimings.filter(Boolean) : [],
      offlineTimings: Array.isArray(payload.offlineTimings) ? payload.offlineTimings.filter(Boolean) : [],
      templeName: payload.templeName || '',
      liveDarshanAvailable: payload.liveDarshanAvailable === true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await pujaRef.set(pujaData);
    const createdSnapshot = await pujaRef.get();
    res.json({ success: true, puja: serializeDoc(createdSnapshot) });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to save puja.' });
  }
});

app.put(['/pujas/:id', '/api/pujas/:id'], async (req, res) => {
  try {
    const requester = await requireAuth(req, res);
    if (!requester) {
      return;
    }

    const pujaRef = db.collection('pujas').doc(req.params.id);
    const pujaSnapshot = await pujaRef.get();
    assert(pujaSnapshot.exists, 'Puja not found.', 404);

    const existingPuja = pujaSnapshot.data();
    const canEdit = isAdmin(requester)
      || (isVendor(requester) && existingPuja.vendorId === requester.uid);

    if (!canEdit) {
      return res.status(403).json({ error: 'You are not allowed to edit this puja.' });
    }

    const payload = req.body || {};
    await pujaRef.set(
      {
        title: payload.title ?? existingPuja.title,
        description: payload.description ?? existingPuja.description,
        price: Number(payload.price ?? existingPuja.price),
        duration: payload.duration ?? existingPuja.duration,
        samagriIncluded:
          typeof payload.samagriIncluded === 'boolean'
            ? payload.samagriIncluded
            : existingPuja.samagriIncluded,
        mode: payload.mode ?? existingPuja.mode ?? 'hybrid',
        onlineTimings: Array.isArray(payload.onlineTimings)
          ? payload.onlineTimings.filter(Boolean)
          : existingPuja.onlineTimings ?? [],
        offlineTimings: Array.isArray(payload.offlineTimings)
          ? payload.offlineTimings.filter(Boolean)
          : existingPuja.offlineTimings ?? [],
        templeName: payload.templeName ?? existingPuja.templeName ?? '',
        liveDarshanAvailable:
          typeof payload.liveDarshanAvailable === 'boolean'
            ? payload.liveDarshanAvailable
            : existingPuja.liveDarshanAvailable ?? false,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    const updatedSnapshot = await pujaRef.get();
    res.json({ success: true, puja: serializeDoc(updatedSnapshot) });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update puja.' });
  }
});

app.delete(['/pujas/:id', '/api/pujas/:id'], async (req, res) => {
  try {
    const requester = await requireAuth(req, res);
    if (!requester) {
      return;
    }

    const pujaRef = db.collection('pujas').doc(req.params.id);
    const pujaSnapshot = await pujaRef.get();
    assert(pujaSnapshot.exists, 'Puja not found.', 404);

    const existingPuja = pujaSnapshot.data();
    const canDelete = isAdmin(requester)
      || (isVendor(requester) && existingPuja.vendorId === requester.uid);

    if (!canDelete) {
      return res.status(403).json({ error: 'You are not allowed to delete this puja.' });
    }

    await pujaRef.delete();
    res.json({ success: true });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to delete puja.' });
  }
});

app.get(['/bookings/:uid', '/api/bookings/:uid'], async (req, res) => {
  const requester = await requireAuth(req, res);
  if (!requester) {
    return;
  }

  if (requester.uid !== req.params.uid && !isAdmin(requester)) {
    return res.status(403).json({ error: 'You are not allowed to view these bookings.' });
  }

  const snapshot = await db.collection('bookings').where('userId', '==', req.params.uid).get();
  res.json(snapshot.docs.map(serializeDoc));
});

app.get(['/vendor/bookings/:vendorId', '/api/vendor/bookings/:vendorId'], async (req, res) => {
  const requester = await requireAuth(req, res);
  if (!requester) {
    return;
  }

  if (requester.uid !== req.params.vendorId && !isAdmin(requester)) {
    return res.status(403).json({ error: 'You are not allowed to view these vendor bookings.' });
  }

  const snapshot = await db.collection('bookings').where('vendorId', '==', req.params.vendorId).get();
  const bookings = await Promise.all(
    snapshot.docs.map(async (bookingSnapshot) => {
      const booking = serializeDoc(bookingSnapshot);
      const userProfile = await getUserProfile(booking.userId);

      return {
        ...booking,
        customerName: userProfile?.displayName || userProfile?.email || 'Customer',
      };
    }),
  );

  res.json(bookings);
});

app.patch(['/bookings/:id/status', '/api/bookings/:id/status'], async (req, res) => {
  try {
    const requester = await requireAuth(req, res);
    if (!requester) {
      return;
    }

    const bookingRef = db.collection('bookings').doc(req.params.id);
    const bookingSnapshot = await bookingRef.get();
    assert(bookingSnapshot.exists, 'Booking not found.', 404);

    const booking = bookingSnapshot.data();
    const canUpdate = isAdmin(requester) || booking.vendorId === requester.uid;

    if (!canUpdate) {
      return res.status(403).json({ error: 'You are not allowed to update this booking.' });
    }

    assert(
      ['pending', 'confirmed', 'completed', 'cancelled'].includes(req.body?.status),
      'Invalid booking status.',
    );

    await bookingRef.set(
      {
        status: req.body.status,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    const updatedSnapshot = await bookingRef.get();
    res.json({ success: true, booking: serializeDoc(updatedSnapshot) });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update booking status.' });
  }
});

app.post(['/bookings', '/api/bookings'], async (req, res) => {
  try {
    const requester = await requireAuth(req, res);
    if (!requester) {
      return;
    }

    const payload = req.body || {};
    const bookingType = payload.type || 'puja';
    const bookingMode = payload.mode === 'offline' ? 'offline' : 'online';
    assert(payload.userId === requester.uid, 'You can only create bookings for your own account.', 403);
    assert(typeof payload.serviceId === 'string' && payload.serviceId, 'Service ID is required.');
    assert(typeof payload.vendorId === 'string' && payload.vendorId, 'Vendor ID is required.');
    assert(
      ['puja', 'darshan', 'yatra'].includes(bookingType),
      'Booking type must be puja, darshan, or yatra.',
    );
    assert(
      ['online', 'offline'].includes(bookingMode),
      'Booking mode must be online or offline.',
    );
    assert(typeof payload.date === 'string' && payload.date, 'Booking date is required.');
    assert(typeof payload.timeSlot === 'string' && payload.timeSlot, 'Booking time slot is required.');

    if (bookingType === 'puja' && bookingMode === 'offline') {
      assert(
        typeof payload.offlineLocationLabel === 'string' && payload.offlineLocationLabel.trim(),
        'Offline location is required for offline puja booking.',
      );
      assert(
        ['live', 'manual'].includes(payload.offlineLocationSource),
        'Offline location source must be live or manual.',
      );
      assert(
        ['available', 'limited'].includes(payload.panditAvailabilityStatus),
        'Offline puja booking requires a serviceable pandit availability check.',
      );
    }

    const bookingRef = db.collection('bookings').doc();
    await bookingRef.set({
      userId: payload.userId,
      serviceId: payload.serviceId,
      serviceTitle: payload.serviceTitle || '',
      vendorId: payload.vendorId,
      type: bookingType,
      mode: bookingMode,
      date: payload.date,
      timeSlot: payload.timeSlot,
      status: payload.status || 'confirmed',
      totalAmount: Number(payload.totalAmount || 0),
      offlineLocationLabel: payload.offlineLocationLabel?.trim() || '',
      offlineLocationSource: payload.offlineLocationSource || '',
      offlineLocationCity: payload.offlineLocationCity || '',
      offlineLocationState: payload.offlineLocationState || '',
      offlineLocationLatitude:
        typeof payload.offlineLocationLatitude === 'number' ? payload.offlineLocationLatitude : null,
      offlineLocationLongitude:
        typeof payload.offlineLocationLongitude === 'number' ? payload.offlineLocationLongitude : null,
      panditAvailabilityStatus: payload.panditAvailabilityStatus || '',
      panditAvailabilitySummary: payload.panditAvailabilitySummary || '',
      panditAvailabilityNote: payload.panditAvailabilityNote || '',
      serviceZoneLabel: payload.serviceZoneLabel || '',
      travelSurcharge: Number(payload.travelSurcharge || 0),
      availabilityCheckedAt: payload.availabilityCheckedAt || '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const createdSnapshot = await bookingRef.get();
    res.json({ success: true, booking: serializeDoc(createdSnapshot) });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to create booking.' });
  }
});

app.get(['/orders/:uid', '/api/orders/:uid'], async (req, res) => {
  const requester = await requireAuth(req, res);
  if (!requester) {
    return;
  }

  if (requester.uid !== req.params.uid && !isAdmin(requester)) {
    return res.status(403).json({ error: 'You are not allowed to view these orders.' });
  }

  const snapshot = await db.collection('orders').where('userId', '==', req.params.uid).get();
  const orders = snapshot.docs
    .map(serializeDoc)
    .sort((left, right) => String(right.createdAt || '').localeCompare(String(left.createdAt || '')));

  res.json(orders);
});

app.get(['/astrology/readings/:uid', '/api/astrology/readings/:uid'], async (req, res) => {
  const requester = await requireAuth(req, res);
  if (!requester) {
    return;
  }

  if (requester.uid !== req.params.uid && !isAdmin(requester)) {
    return res.status(403).json({ error: 'You are not allowed to view these astrology readings.' });
  }

  const snapshot = await db.collection('astrologyReadings').where('userId', '==', req.params.uid).get();
  const readings = snapshot.docs
    .map(serializeDoc)
    .sort((left, right) => String(right.createdAt || '').localeCompare(String(left.createdAt || '')));

  res.json(readings);
});

app.post(['/orders', '/api/orders'], async (req, res) => {
  try {
    const requester = await requireAuth(req, res);
    if (!requester) {
      return;
    }

    const payload = req.body || {};
    assert(payload.userId === requester.uid, 'You can only create orders for your own account.', 403);
    assert(Array.isArray(payload.items) && payload.items.length > 0, 'At least one order item is required.');
    assert(payload.customerDetails && typeof payload.customerDetails === 'object', 'Customer details are required.');
    assert(typeof payload.customerDetails.fullName === 'string' && payload.customerDetails.fullName.trim(), 'Full name is required.');
    assert(typeof payload.customerDetails.email === 'string' && payload.customerDetails.email.trim(), 'Email is required.');
    assert(typeof payload.customerDetails.phoneNumber === 'string' && payload.customerDetails.phoneNumber.trim(), 'Phone number is required.');
    assert(typeof payload.customerDetails.addressLine1 === 'string' && payload.customerDetails.addressLine1.trim(), 'Address line 1 is required.');
    assert(typeof payload.customerDetails.city === 'string' && payload.customerDetails.city.trim(), 'City is required.');
    assert(typeof payload.customerDetails.state === 'string' && payload.customerDetails.state.trim(), 'State is required.');
    assert(typeof payload.customerDetails.pincode === 'string' && payload.customerDetails.pincode.trim(), 'Pincode is required.');

    const orderRef = db.collection('orders').doc();
    const orderNumber = createOrderNumber();
    const customerDetails = {
      fullName: payload.customerDetails.fullName.trim(),
      email: payload.customerDetails.email.trim(),
      phoneNumber: payload.customerDetails.phoneNumber.trim(),
      addressLine1: payload.customerDetails.addressLine1.trim(),
      addressLine2: payload.customerDetails.addressLine2?.trim() || '',
      city: payload.customerDetails.city.trim(),
      state: payload.customerDetails.state.trim(),
      pincode: payload.customerDetails.pincode.trim(),
      deliveryNotes: payload.customerDetails.deliveryNotes?.trim() || '',
    };
    const normalizedItems = payload.items.map((item) => ({
      productId: item.productId,
      name: item.name || 'Sacred Offering',
      category: item.category || 'Offerings',
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
      image: item.image || '',
      templeName: item.templeName || '',
      weight: item.weight || '',
      size: item.size || '',
    }));
    const totalAmount = Number(payload.totalAmount || 0);
    const createdAtIso = new Date().toISOString();
    const estimatedDeliveryDate = addDays(createdAtIso, 4).toISOString();
    const receipt = {
      orderNumber,
      issuedAt: createdAtIso,
      paymentMethod: payload.paymentMethod || 'Secure checkout',
      subtotal: totalAmount,
      shippingFee: Number(payload.shippingFee || 0),
      totalAmount,
    };
    const statusTimeline = buildOrderTimeline(createdAtIso);

    await orderRef.set({
      userId: payload.userId,
      orderNumber,
      items: normalizedItems,
      totalAmount,
      status: payload.status || 'processing',
      shippingAddress: buildShippingAddress(customerDetails),
      customerDetails,
      receipt,
      estimatedDeliveryDate,
      statusTimeline,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const createdSnapshot = await orderRef.get();
    res.json({ success: true, order: serializeDoc(createdSnapshot) });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to create order.' });
  }
});

app.get(['/orders/:uid/:orderId/receipt', '/api/orders/:uid/:orderId/receipt'], async (req, res) => {
  const requester = await requireAuth(req, res);
  if (!requester) {
    return;
  }

  if (requester.uid !== req.params.uid && !isAdmin(requester)) {
    return res.status(403).json({ error: 'You are not allowed to view this receipt.' });
  }

  const orderSnapshot = await db.collection('orders').doc(req.params.orderId).get();
  if (!orderSnapshot.exists) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const order = serializeDoc(orderSnapshot);
  if (order.userId !== req.params.uid && !isAdmin(requester)) {
    return res.status(403).json({ error: 'You are not allowed to view this receipt.' });
  }

  res.json({
    orderNumber: order.orderNumber,
    status: order.status,
    customerDetails: order.customerDetails,
    items: order.items,
    receipt: order.receipt,
  });
});

app.post(['/feedback', '/api/feedback'], async (req, res) => {
  try {
    const requester = await getRequester(req);
    const payload = req.body || {};

    assert(typeof payload.name === 'string' && payload.name.trim(), 'Name is required.');
    assert(typeof payload.email === 'string' && payload.email.trim(), 'Email is required.');
    assert(Number.isFinite(payload.rating), 'Rating is required.');
    assert(typeof payload.message === 'string' && payload.message.trim(), 'Feedback message is required.');

    await db.collection('feedbackSubmissions').add({
      userId: requester?.uid || null,
      name: payload.name.trim(),
      email: payload.email.trim(),
      rating: Number(payload.rating),
      subject: payload.subject?.trim() || '',
      message: payload.message.trim(),
      createdAt: FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to submit feedback.',
    });
  }
});

app.post(['/astrology/reading', '/api/astrology/reading'], async (req, res) => {
  try {
    const requester = await requireAuth(req, res);
    if (!requester) {
      return;
    }

    const { name, dob, tob, pob, query, userId } = req.body || {};
    assert(!userId || userId === requester.uid, 'User mismatch.', 403);
    assert(typeof name === 'string' && name.trim(), 'Name is required.');
    assert(typeof dob === 'string' && dob.trim(), 'Date of birth is required.');
    assert(typeof tob === 'string' && tob.trim(), 'Time of birth is required.');
    assert(typeof pob === 'string' && pob.trim(), 'Place of birth is required.');

    const prompt = `
You are an expert Vedic Astrologer for PunyaSeva.
Provide a detailed, spiritual, and compassionate reading based on:
- Name: ${name}
- Date of Birth: ${dob}
- Time of Birth: ${tob}
- Place of Birth: ${pob}
- User Query: ${query || 'General life reading and spiritual guidance'}

Include:
1. A brief reading of likely planetary influences.
2. Personality and spiritual-path insights.
3. Guidance for the present period.
4. A practical remedy, mantra, or puja suggestion.

Keep it warm, structured, and easy to read.
    `.trim();

    const response = await getAiClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction:
          'You are Jyotish AI, a compassionate Vedic astrology guide for PunyaSeva.',
      },
    });

    const reading = response.text?.trim();
    assert(reading, 'The astrology response was empty.', 502);

    await db.collection('astrologyReadings').add({
      userId: requester.uid,
      name: name.trim(),
      dob,
      tob,
      pob: pob.trim(),
      userQuery: query || null,
      reading,
      createdAt: FieldValue.serverTimestamp(),
    });

    res.json({ reading });
  } catch (error) {
    console.error('Astrology API error:', error);
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to generate astrology reading.',
    });
  }
});

app.post(['/support/chat', '/api/support/chat'], async (req, res) => {
  try {
    const requester = await getRequester(req);
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];

    const sanitizedMessages = messages
      .filter(
        (message) =>
          message
          && (message.role === 'user' || message.role === 'assistant')
          && typeof message.content === 'string'
          && message.content.trim(),
      )
      .slice(-8);

    assert(sanitizedMessages.length > 0, 'At least one chat message is required.');

    const transcript = sanitizedMessages
      .map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`)
      .join('\n\n');

    const response = await getAiClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
You are PunyaSeva AI Support.
Your role is to help users with:
- puja bookings
- darshan and prasad guidance
- order and delivery support
- account and sign-in issues
- vendor onboarding questions

Rules:
- Be concise, practical, and warm.
- Stay focused on product support, not open-ended spiritual predictions.
- If the user needs direct human help, tell them to use the Contact Us page email or phone support.
- Do not invent order status, account status, or booking confirmations.
- If information is unavailable, say so clearly.

Conversation:
${transcript}

Write the next assistant reply only.
      `.trim(),
      config: {
        temperature: 0.4,
      },
    });

    const reply = response.text?.trim();
    assert(reply, 'The AI support response was empty.', 502);

    const latestUserMessage = [...sanitizedMessages]
      .reverse()
      .find((message) => message.role === 'user');

    if (latestUserMessage) {
      await db.collection('supportChatLogs').add({
        userId: requester?.uid || null,
        userMessage: latestUserMessage.content,
        assistantMessage: reply,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    res.json({ reply });
  } catch (error) {
    console.error('AI support error:', error);
    res.status(error.statusCode || 500).json({
      error: error.message || 'AI support is temporarily unavailable. Please try again shortly.',
    });
  }
});

exports.api = onRequest(
  {
    region: FUNCTIONS_REGION,
    timeoutSeconds: 60,
    secrets: [geminiApiKey, tathaastuApiKey],
  },
  app,
);
exports.app = app;
