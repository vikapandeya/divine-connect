import type {
  AstrologyReading,
  Booking,
  Order,
  Product,
  Puja,
  UserProfile,
  YatraPackage,
} from '../types';

const STORAGE_KEYS = {
  products: 'divine-connect-demo-products',
  pujas: 'divine-connect-demo-pujas',
  bookings: 'divine-connect-demo-bookings',
  orders: 'divine-connect-demo-orders',
  readings: 'divine-connect-demo-readings',
  feedback: 'divine-connect-demo-feedback',
};

const nowIso = () => new Date().toISOString();

function buildAiProductImage(seed: string, prompt: string) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=800&model=flux&seed=${seed}&nologo=true`;
}

function createSeedProduct(
  payload: Omit<Product, 'vendorId' | 'isActive' | 'createdAt' | 'updatedAt'> & Partial<Pick<Product, 'isActive'>>,
): Product {
  return {
    vendorId: DEMO_VENDOR_PROFILE.uid,
    isActive: payload.isActive ?? true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...payload,
  };
}

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
  createSeedProduct({
    id: 'prod-kashi-vishwanath-prasad',
    name: 'Kashi Vishwanath Mahaprasad Box',
    description: 'Temple prasad box with mishri, dry fruits, sacred raksha sutra, and blessed tulsi leaves for family sankalp and gifting.',
    price: 699,
    category: 'Prasad',
    image: buildAiProductImage('kashi-prasad', 'premium devotional product photography of Kashi Vishwanath Mahaprasad box with sacred thread dry fruits brass bell warm spiritual lighting'),
    stock: 120,
    rating: 4.9,
    templeName: 'Kashi Vishwanath Mandir',
    weight: '500 g',
    size: 'Family Box',
    city: 'Varanasi',
    offeringType: 'Mahaprasad',
    dispatchWindow: 'Fresh blessing dispatch in 24 hours',
    tags: ['Temple Packed', 'Fresh Offering'],
  }),
  createSeedProduct({
    id: 'prod-tirupati-laddu',
    name: 'Tirupati Srivari Laddu Prasadam',
    description: 'Temple-origin laddu prasadam packed for family sharing, gifting, and festival offering at home.',
    price: 899,
    category: 'Prasad',
    image: buildAiProductImage('tirupati-laddu', 'realistic ai product photo of Tirupati Srivari Laddu Prasadam in premium temple gift pack on saffron cloth'),
    stock: 80,
    rating: 5,
    templeName: 'Tirumala Tirupati Devasthanam',
    weight: '750 g',
    size: 'Temple Gift Pack',
    city: 'Tirupati',
    offeringType: 'Laddu Prasadam',
    dispatchWindow: 'Dispatch within 48 hours',
    tags: ['Temple Packed', 'Popular'],
  }),
  createSeedProduct({
    id: 'prod-jagannath-khaja',
    name: 'Jagannath Puri Khaja Prasad',
    description: 'Traditional khaja prasadam from Jagannath temple traditions, packed for safe travel and sacred family sharing.',
    price: 549,
    category: 'Prasad',
    image: buildAiProductImage('jagannath-khaja', 'ai product image of Jagannath Puri khaja prasad in travel friendly devotional box with temple inspired styling'),
    stock: 60,
    rating: 4.8,
    templeName: 'Jagannath Mandir',
    weight: '400 g',
    size: 'Travel Pack',
    city: 'Puri',
    offeringType: 'Khaja Prasad',
    dispatchWindow: 'Ships in 1 to 3 days',
    tags: ['Fresh Batch', 'Gift Friendly'],
  }),
  createSeedProduct({
    id: 'prod-vaishno-devi-prasad',
    name: 'Vaishno Devi Dry Prasad Box',
    description: 'Dry prasad assortment with mishri, chunri ribbon, and sacred blessing card inspired by Vaishno Devi pilgrim offerings.',
    price: 649,
    category: 'Prasad',
    image: buildAiProductImage('vaishno-prasad', 'premium ai product photo of Vaishno Devi dry prasad box with red chunri coconuts and devotional packaging'),
    stock: 54,
    rating: 4.8,
    templeName: 'Mata Vaishno Devi Shrine',
    weight: '450 g',
    size: 'Blessing Box',
    city: 'Katra',
    offeringType: 'Dry Prasad',
    dispatchWindow: 'Ships in 2 to 4 days',
    tags: ['Pilgrim Favorite', 'Blessing Ready'],
  }),
  createSeedProduct({
    id: 'prod-mahakaleshwar-bhasma-prasad',
    name: 'Mahakaleshwar Bhasma Prasad Kit',
    description: 'Sacred ash blessing kit with prasad token, mantra card, and temple-inspired packaging for Shiva devotees.',
    price: 799,
    category: 'Prasad',
    image: buildAiProductImage('mahakaleshwar-prasad', 'realistic ai image of Mahakaleshwar bhasma prasad kit with sacred ash brass bowl rudraksha and deepam'),
    stock: 38,
    rating: 4.9,
    templeName: 'Mahakaleshwar Jyotirlinga',
    weight: '300 g',
    size: 'Shiva Blessing Kit',
    city: 'Ujjain',
    offeringType: 'Bhasma Prasad',
    dispatchWindow: 'Ships in 2 to 3 days',
    tags: ['Jyotirlinga Linked', 'Shiva Devotion'],
  }),
  createSeedProduct({
    id: 'prod-brass-ganesha',
    name: 'Brass Ganesha Idol',
    description: 'Handcrafted pure brass Ganesha idol designed for home altar placement, vastu corners, and festive puja decor.',
    price: 1250,
    category: 'Idols',
    image: buildAiProductImage('brass-ganesha', 'studio quality ai product photo of handcrafted brass Ganesha idol on marble pedestal with warm temple light'),
    stock: 50,
    rating: 4.8,
    offeringType: 'Murti',
    size: '8 inch murti',
    city: 'Jaipur',
    dispatchWindow: 'Ships in 2 to 4 days',
    tags: ['Handcrafted', 'Festival Favorite'],
  }),
  createSeedProduct({
    id: 'prod-marble-lakshmi-idol',
    name: 'Marble Lakshmi Murti',
    description: 'Graceful marble Lakshmi murti for Diwali puja, prosperity altar setups, and premium gifting.',
    price: 1850,
    category: 'Idols',
    image: buildAiProductImage('marble-lakshmi', 'premium ai product image of white marble Lakshmi murti with lotus detailing and festive diya lighting'),
    stock: 32,
    rating: 4.9,
    offeringType: 'Murti',
    size: '10 inch statue',
    city: 'Makrana',
    dispatchWindow: 'Ships in 3 to 5 days',
    tags: ['Prosperity Idol', 'Premium Marble'],
  }),
  createSeedProduct({
    id: 'prod-shiv-parivar-idol',
    name: 'Panchdhatu Shiv Parivar Idol',
    description: 'Detailed Panchdhatu Shiv Parivar murti set for daily worship spaces and sacred gifting.',
    price: 2499,
    category: 'Idols',
    image: buildAiProductImage('shiv-parivar', 'realistic ai product photo of Panchdhatu Shiv Parivar idol set with spiritual brass finish and dramatic temple background'),
    stock: 18,
    rating: 4.9,
    offeringType: 'Panchdhatu Murti',
    size: '9 inch set',
    city: 'Haridwar',
    dispatchWindow: 'Ships in 3 to 5 days',
    tags: ['Shiva Family', 'Temple Craft'],
  }),
  createSeedProduct({
    id: 'prod-nandi-stone-idol',
    name: 'Black Stone Nandi Murti',
    description: 'Compact black stone Nandi murti ideal for Shiva altar placement and temple-inspired decor.',
    price: 990,
    category: 'Idols',
    image: buildAiProductImage('nandi-stone', 'ai generated product photo of black stone Nandi murti on wooden altar with incense smoke'),
    stock: 26,
    rating: 4.7,
    offeringType: 'Stone Murti',
    size: '6 inch murti',
    city: 'Varanasi',
    dispatchWindow: 'Ships in 2 to 4 days',
    tags: ['Shiva Altar', 'Stone Craft'],
  }),
  createSeedProduct({
    id: 'prod-bal-gopal-idol',
    name: 'Bal Gopal Silver Finish Idol',
    description: 'Playful Bal Gopal idol with silver-tone finish suited for Janmashtami decor and family mandir spaces.',
    price: 1450,
    category: 'Idols',
    image: buildAiProductImage('bal-gopal', 'premium ai product image of Bal Gopal silver finish idol with butter pot styling and festive home mandir decor'),
    stock: 24,
    rating: 4.8,
    offeringType: 'Decorative Murti',
    size: '7 inch idol',
    city: 'Mathura',
    dispatchWindow: 'Ships in 2 to 4 days',
    tags: ['Krishna Bhakti', 'Gift Ready'],
  }),
  createSeedProduct({
    id: 'prod-sandalwood-incense',
    name: 'Sandalwood Temple Incense Sticks',
    description: 'Classic chandan fragrance for daily aarti, meditation sessions, and calm devotional ambience.',
    price: 250,
    category: 'Incense',
    image: buildAiProductImage('sandalwood-incense', 'clean ai product photography of sandalwood incense sticks with smoke trails brass incense holder and warm spiritual background'),
    stock: 95,
    rating: 4.6,
    offeringType: 'Agarbatti',
    weight: '120 sticks',
    city: 'Mysuru',
    dispatchWindow: 'Ships in 1 to 2 days',
    tags: ['Daily Prayer', 'Chandan Fragrance'],
  }),
  createSeedProduct({
    id: 'prod-guggal-dhoop',
    name: 'Guggal Dhoop Cones',
    description: 'Rich guggal dhoop cones for evening cleansing rituals, temple ambience, and meditation rooms.',
    price: 320,
    category: 'Incense',
    image: buildAiProductImage('guggal-dhoop', 'realistic ai image of guggal dhoop cones with glowing charcoal incense stand and moody temple smoke'),
    stock: 72,
    rating: 4.7,
    offeringType: 'Dhoop',
    weight: '40 cones',
    city: 'Ujjain',
    dispatchWindow: 'Ships in 1 to 2 days',
    tags: ['Purification', 'Evening Ritual'],
  }),
  createSeedProduct({
    id: 'prod-rose-agarbatti',
    name: 'Rose Temple Agarbatti',
    description: 'Soft rose fragrance incense crafted for puja rooms, satsang spaces, and devotional gifting.',
    price: 210,
    category: 'Incense',
    image: buildAiProductImage('rose-agarbatti', 'ai product image of rose temple agarbatti box with pink petals incense holder and devotional styling'),
    stock: 88,
    rating: 4.5,
    offeringType: 'Agarbatti',
    weight: '100 sticks',
    city: 'Kannauj',
    dispatchWindow: 'Ships in 1 to 2 days',
    tags: ['Floral', 'Gift Friendly'],
  }),
  createSeedProduct({
    id: 'prod-loban-resin',
    name: 'Loban Resin Havan Blend',
    description: 'Traditional loban resin blend for dhoopan, havan preparation, and sacred space purification.',
    price: 390,
    category: 'Incense',
    image: buildAiProductImage('loban-resin', 'premium ai product photo of loban resin blend in brass bowl with smoke and puja elements'),
    stock: 41,
    rating: 4.8,
    offeringType: 'Resin Blend',
    weight: '250 g',
    city: 'Haridwar',
    dispatchWindow: 'Ships in 2 to 3 days',
    tags: ['Havan Ready', 'Purification'],
  }),
  createSeedProduct({
    id: 'prod-camphor-incense',
    name: 'Camphor Aarti Incense Blend',
    description: 'Refreshing camphor blend designed for morning aarti, festive worship, and temple-style fragrance.',
    price: 280,
    category: 'Incense',
    image: buildAiProductImage('camphor-incense', 'realistic ai generated product shot of camphor incense blend with diya flame silver thali and aromatic smoke'),
    stock: 57,
    rating: 4.6,
    offeringType: 'Incense Blend',
    weight: '90 sticks',
    city: 'Bengaluru',
    dispatchWindow: 'Ships in 1 to 2 days',
    tags: ['Morning Ritual', 'Fresh Aroma'],
  }),
  createSeedProduct({
    id: 'prod-rudraksha-mala',
    name: 'Rudraksha Mala',
    description: 'Original 108+1 beads Panchmukhi Rudraksha mala selected for daily mantra chanting and Shiva devotion.',
    price: 450,
    category: 'Mala',
    image: buildAiProductImage('rudraksha-mala', 'premium ai product image of panchmukhi rudraksha mala arranged on saffron cloth with copper kalash'),
    stock: 4,
    rating: 4.9,
    size: '108 + 1 beads',
    city: 'Nepal Selection',
    dispatchWindow: 'Ships in 2 to 3 days',
    tags: ['Low Stock', 'Shiva Devotion'],
  }),
  createSeedProduct({
    id: 'prod-tulsi-kanthi-mala',
    name: 'Tulsi Kanthi Mala',
    description: 'Sacred tulsi kanthi mala crafted for Vaishnav devotees, daily jap, and simple devotional wear.',
    price: 299,
    category: 'Mala',
    image: buildAiProductImage('tulsi-mala', 'ai product photo of tulsi kanthi mala on clean white cloth with temple leaf styling'),
    stock: 67,
    rating: 4.7,
    size: 'Double loop kanthi',
    city: 'Vrindavan',
    dispatchWindow: 'Ships in 2 to 3 days',
    tags: ['Vaishnav', 'Daily Wear'],
  }),
  createSeedProduct({
    id: 'prod-sphatik-japa-mala',
    name: 'Sphatik Japa Mala',
    description: 'Cooling crystal mala chosen for mantra sadhana, meditation, and Lakshmi-related worship.',
    price: 799,
    category: 'Mala',
    image: buildAiProductImage('sphatik-mala', 'realistic ai product image of sphatik japa mala with crystal transparency and soft prayer lighting'),
    stock: 29,
    rating: 4.8,
    size: '108 crystal beads',
    city: 'Jaipur',
    dispatchWindow: 'Ships in 2 to 4 days',
    tags: ['Crystal', 'Meditation'],
  }),
  createSeedProduct({
    id: 'prod-chandan-mala',
    name: 'Chandan Bead Mala',
    description: 'Natural sandalwood bead mala with soothing fragrance for chanting, meditation, and gifting.',
    price: 520,
    category: 'Mala',
    image: buildAiProductImage('chandan-mala', 'ai product photo of sandalwood bead mala on wooden altar with subtle incense smoke'),
    stock: 36,
    rating: 4.6,
    size: '108 beads',
    city: 'Mysuru',
    dispatchWindow: 'Ships in 2 to 3 days',
    tags: ['Sandalwood', 'Gift Ready'],
  }),
  createSeedProduct({
    id: 'prod-kamal-gatta-mala',
    name: 'Kamal Gatta Lakshmi Mala',
    description: 'Lotus seed mala traditionally used in Lakshmi jap, prosperity rituals, and festive sankalp.',
    price: 410,
    category: 'Mala',
    image: buildAiProductImage('kamal-gatta-mala', 'premium ai product image of kamal gatta lotus seed mala with gold cloth and Lakshmi altar styling'),
    stock: 44,
    rating: 4.7,
    size: '108 lotus seeds',
    city: 'Ayodhya',
    dispatchWindow: 'Ships in 2 to 3 days',
    tags: ['Lakshmi Jap', 'Prosperity Ritual'],
  }),
  createSeedProduct({
    id: 'prod-bhagavad-gita',
    name: 'Bhagavad Gita Deluxe Edition',
    description: 'Hardbound devotional edition for daily study, satsang sessions, and meaningful spiritual gifting.',
    price: 599,
    category: 'Books',
    image: buildAiProductImage('bhagavad-gita', 'premium ai product photo of Bhagavad Gita deluxe hardbound edition with bookmark beads and diya'),
    stock: 3,
    rating: 5,
    size: 'Hardbound',
    city: 'Delhi',
    dispatchWindow: 'Ships in 2 to 4 days',
    tags: ['Low Stock', 'Study Edition'],
  }),
  createSeedProduct({
    id: 'prod-shiv-puran-book',
    name: 'Shiv Puran Katha Edition',
    description: 'Reader-friendly Shiv Puran edition with clear chapter layout for family reading and Shiv bhakti study.',
    price: 720,
    category: 'Books',
    image: buildAiProductImage('shiv-puran', 'realistic ai product shot of Shiv Puran katha edition book with rudraksha and trishul motifs'),
    stock: 22,
    rating: 4.8,
    size: 'Hardbound',
    city: 'Haridwar',
    dispatchWindow: 'Ships in 2 to 4 days',
    tags: ['Shiva Study', 'Family Reading'],
  }),
  createSeedProduct({
    id: 'prod-hanuman-chalisa-pocket',
    name: 'Hanuman Chalisa Pocket Book',
    description: 'Compact daily-path edition with bold print, transliteration, and easy travel carry format.',
    price: 149,
    category: 'Books',
    image: buildAiProductImage('hanuman-chalisa', 'ai product image of Hanuman Chalisa pocket book with sindoor cloth and brass gada decor'),
    stock: 76,
    rating: 4.9,
    size: 'Pocket edition',
    city: 'Varanasi',
    dispatchWindow: 'Ships in 1 to 2 days',
    tags: ['Pocket Path', 'Daily Devotion'],
  }),
  createSeedProduct({
    id: 'prod-durga-saptashati-book',
    name: 'Durga Saptashati Chanting Book',
    description: 'Festival-ready chanting edition with clean print design for Navratri path and home recitation.',
    price: 380,
    category: 'Books',
    image: buildAiProductImage('durga-saptashati', 'premium ai generated product photo of Durga Saptashati chanting book with red flowers and brass lamp'),
    stock: 31,
    rating: 4.8,
    size: 'Medium format',
    city: 'Kolkata',
    dispatchWindow: 'Ships in 2 to 3 days',
    tags: ['Navratri', 'Chanting Guide'],
  }),
  createSeedProduct({
    id: 'prod-vishnu-sahasranama-book',
    name: 'Vishnu Sahasranama Meaning Edition',
    description: 'Readable devotional book with shloka text and concise meaning notes for regular recitation.',
    price: 440,
    category: 'Books',
    image: buildAiProductImage('vishnu-sahasranama', 'realistic ai product image of Vishnu Sahasranama meaning edition on blue silk with tulsi beads'),
    stock: 27,
    rating: 4.7,
    size: 'Softbound premium print',
    city: 'Chennai',
    dispatchWindow: 'Ships in 2 to 3 days',
    tags: ['Vaishnav Text', 'Meaning Guide'],
  }),
  createSeedProduct({
    id: 'prod-shree-yantra',
    name: 'Shree Yantra Copper Plate',
    description: 'Finely etched copper Shree Yantra for prosperity altar placement, meditation desks, and Lakshmi worship.',
    price: 899,
    category: 'Yantras',
    image: buildAiProductImage('shree-yantra', 'premium ai product photo of copper Shree Yantra plate with lotus petals gold cloth and diya'),
    stock: 33,
    rating: 4.7,
    size: '4 x 4 inch',
    city: 'Varanasi',
    offeringType: 'Copper Yantra',
    dispatchWindow: 'Ships in 2 to 3 days',
    tags: ['Prosperity', 'Copper Plate'],
  }),
  createSeedProduct({
    id: 'prod-kubera-yantra',
    name: 'Kubera Dhan Akarshan Yantra',
    description: 'Brass-finish prosperity yantra created for wealth attraction rituals, office desks, and festive gifting.',
    price: 1150,
    category: 'Yantras',
    image: buildAiProductImage('kubera-yantra', 'ai generated product image of Kubera yantra in brass finish with coins marigold flowers and premium spiritual styling'),
    stock: 21,
    rating: 4.8,
    size: '5 x 5 inch',
    city: 'Mumbai',
    offeringType: 'Brass Yantra',
    dispatchWindow: 'Ships in 2 to 4 days',
    tags: ['Wealth Ritual', 'Office Ready'],
  }),
  createSeedProduct({
    id: 'prod-mahamrityunjaya-yantra',
    name: 'Maha Mrityunjaya Protection Yantra',
    description: 'Protection yantra associated with Shiva mantra sadhana, healing sankalp, and altar use.',
    price: 990,
    category: 'Yantras',
    image: buildAiProductImage('mahamrityunjaya-yantra', 'realistic ai image of Maha Mrityunjaya yantra with rudraksha trishul motif and sacred smoke'),
    stock: 19,
    rating: 4.9,
    size: '4.5 x 4.5 inch',
    city: 'Ujjain',
    offeringType: 'Protective Yantra',
    dispatchWindow: 'Ships in 2 to 4 days',
    tags: ['Healing Focus', 'Shiva Ritual'],
  }),
  createSeedProduct({
    id: 'prod-navagraha-yantra',
    name: 'Navagraha Harmony Yantra',
    description: 'Balanced graha yantra intended for planetary peace rituals, study desks, and family puja shelves.',
    price: 850,
    category: 'Yantras',
    image: buildAiProductImage('navagraha-yantra', 'premium ai product photo of Navagraha yantra with cosmic motif brass texture and puja setup'),
    stock: 28,
    rating: 4.6,
    size: '4 x 4 inch',
    city: 'Nashik',
    offeringType: 'Graha Yantra',
    dispatchWindow: 'Ships in 2 to 3 days',
    tags: ['Planetary Peace', 'Family Puja'],
  }),
  createSeedProduct({
    id: 'prod-vastu-yantra',
    name: 'Vastu Dosh Nivaran Yantra',
    description: 'Home-placement yantra for entrance, study, or office use with vastu-focused devotional styling.',
    price: 780,
    category: 'Yantras',
    image: buildAiProductImage('vastu-yantra', 'ai product image of Vastu Dosh Nivaran yantra framed for home office altar with clean modern spiritual styling'),
    stock: 25,
    rating: 4.6,
    size: 'Frame ready plate',
    city: 'Jaipur',
    offeringType: 'Vastu Yantra',
    dispatchWindow: 'Ships in 2 to 3 days',
    tags: ['Home Harmony', 'Entrance Ready'],
  }),
  createSeedProduct({
    id: 'prod-silver-diya-set',
    name: 'Silver Finish Diya Set',
    description: 'Elegant diya pair for daily deepam, festive aarti, and compact mandir styling.',
    price: 1500,
    category: 'Puja Essentials',
    image: buildAiProductImage('silver-diya', 'premium ai product photo of silver finish diya set on carved puja thali with marigold and flame'),
    stock: 17,
    rating: 4.6,
    size: 'Set of 2',
    city: 'Jaipur',
    offeringType: 'Deepam Set',
    dispatchWindow: 'Ships in 2 to 4 days',
    tags: ['Aarti Ready', 'Festive Decor'],
  }),
  createSeedProduct({
    id: 'prod-panchpatra-set',
    name: 'Brass Panchpatra Arghya Set',
    description: 'Traditional brass panchpatra and spoon set for daily puja, achman, and sankalp rituals.',
    price: 620,
    category: 'Puja Essentials',
    image: buildAiProductImage('panchpatra-set', 'realistic ai product image of brass panchpatra arghya set on temple cloth with holy water bowl'),
    stock: 42,
    rating: 4.7,
    size: 'Standard puja set',
    city: 'Haridwar',
    offeringType: 'Brass Utility',
    dispatchWindow: 'Ships in 2 to 3 days',
    tags: ['Daily Puja', 'Brassware'],
  }),
  createSeedProduct({
    id: 'prod-puja-thali',
    name: 'Handcrafted Puja Thali Combo',
    description: 'Decorative puja thali combo with bell, roli bowls, diya space, and festive carving for family rituals.',
    price: 850,
    category: 'Puja Essentials',
    image: buildAiProductImage('puja-thali', 'premium ai product photo of handcrafted puja thali combo with kumkum bowls bell diya and marigold styling'),
    stock: 34,
    rating: 4.8,
    size: '12 inch set',
    city: 'Moradabad',
    offeringType: 'Puja Combo',
    dispatchWindow: 'Ships in 2 to 4 days',
    tags: ['Gift Ready', 'Festival Favorite'],
  }),
  createSeedProduct({
    id: 'prod-copper-kalash',
    name: 'Copper Kalash with Coconut Stand',
    description: 'Sacred copper kalash for griha pravesh, Navratri setup, and sankalp ceremonies.',
    price: 940,
    category: 'Puja Essentials',
    image: buildAiProductImage('copper-kalash', 'realistic ai product image of copper kalash with coconut stand mango leaves and festive puja setup'),
    stock: 23,
    rating: 4.7,
    size: 'Medium ritual kalash',
    city: 'Nashik',
    offeringType: 'Kalash',
    dispatchWindow: 'Ships in 2 to 4 days',
    tags: ['Griha Pravesh', 'Festival Ritual'],
  }),
  createSeedProduct({
    id: 'prod-camphor-aarti-box',
    name: 'Camphor and Aarti Samagri Box',
    description: 'Compact ritual box with camphor tablets, cotton wicks, and small puja support items for daily worship.',
    price: 360,
    category: 'Puja Essentials',
    image: buildAiProductImage('aarti-box', 'ai generated product photo of camphor and aarti samagri box with cotton wicks diya and devotional tray'),
    stock: 49,
    rating: 4.6,
    size: 'Daily puja kit',
    city: 'Varanasi',
    offeringType: 'Samagri Box',
    dispatchWindow: 'Ships in 1 to 2 days',
    tags: ['Daily Ritual', 'Starter Kit'],
  }),
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

const defaultYatraPackages: YatraPackage[] = [
  {
    id: 'yatra-char-dham-divya',
    title: 'Char Dham Divya Yatra',
    description:
      'A full Himalayan pilgrimage package covering Yamunotri, Gangotri, Kedarnath, and Badrinath with guided spiritual support, stays, meals, and transfers.',
    duration: '11 Nights / 12 Days',
    packageType: 'char-dham',
    startingPrice: 48500,
    destinations: ['Haridwar', 'Barkot', 'Yamunotri', 'Gangotri', 'Guptkashi', 'Kedarnath', 'Badrinath', 'Rishikesh'],
    departureCities: ['Delhi', 'Haridwar', 'Dehradun'],
    transport: 'AC coach, local jeep support, and trek coordination',
    stay: 'Temple-town hotels, dharamshalas, and deluxe guest houses',
    meals: 'Breakfast and dinner included daily',
    bestSeason: 'May to June, September to October',
    inclusions: ['Accommodation', 'Transfers', 'Yatra coordinator', 'Darshan guidance', 'Basic medical support'],
    routePlan: ['Arrival in Haridwar', 'Yamunotri darshan', 'Gangotri darshan', 'Kedarnath trek and stay', 'Badrinath darshan', 'Return via Rishikesh'],
    badge: 'Most Requested',
    image: 'https://picsum.photos/seed/char-dham/1200/800',
  },
  {
    id: 'yatra-do-dham-family',
    title: 'Do Dham Family Package',
    description:
      'A calmer full-package yatra for Kedarnath and Badrinath designed for families wanting shorter pilgrimage duration with strong support.',
    duration: '7 Nights / 8 Days',
    packageType: 'dham-circuit',
    startingPrice: 31900,
    destinations: ['Haridwar', 'Guptkashi', 'Kedarnath', 'Joshimath', 'Badrinath'],
    departureCities: ['Delhi', 'Haridwar', 'Dehradun'],
    transport: 'AC transfers with mountain route handling',
    stay: 'Comfort stays with family-friendly room options',
    meals: 'Breakfast and dinner included daily',
    bestSeason: 'May to June, September to October',
    inclusions: ['Hotel stay', 'Ground transfers', 'Helpline support', 'Darshan assistance'],
    routePlan: ['Haridwar arrival', 'Guptkashi halt', 'Kedarnath darshan', 'Joshimath stay', 'Badrinath darshan', 'Departure'],
    badge: 'Family Friendly',
    image: 'https://picsum.photos/seed/do-dham/1200/800',
  },
  {
    id: 'yatra-jyotirlinga-west',
    title: 'Jyotirlinga West Circuit',
    description:
      'Full package pilgrimage covering Somnath, Nageshwar, and Mahakaleshwar with transport, stay planning, and devotional route guidance.',
    duration: '6 Nights / 7 Days',
    packageType: 'jyotirlinga',
    startingPrice: 28800,
    destinations: ['Ahmedabad', 'Somnath', 'Dwarka', 'Nageshwar', 'Ujjain'],
    departureCities: ['Ahmedabad', 'Mumbai', 'Delhi'],
    transport: 'Flight add-on ready with AC road transfers',
    stay: 'Standard and premium temple-city hotels',
    meals: 'Daily breakfast with selected dinners',
    bestSeason: 'October to March',
    inclusions: ['Hotel stay', 'Sightseeing transfers', 'Temple queue planning', 'Yatra support desk'],
    routePlan: ['Ahmedabad arrival', 'Somnath darshan', 'Dwarka and Nageshwar', 'Transfer to Ujjain', 'Mahakaleshwar darshan', 'Departure'],
    badge: 'Jyotirlinga Circuit',
    image: 'https://picsum.photos/seed/jyotirlinga-west/1200/800',
  },
  {
    id: 'yatra-kashi-ayodhya-prayagraj',
    title: 'Kashi Ayodhya Prayagraj Tirth Yatra',
    description:
      'A sacred north India pilgrimage package for Kashi Vishwanath, Ram Janmabhoomi, and Triveni Sangam with guided darshan and ritual-friendly pacing.',
    duration: '4 Nights / 5 Days',
    packageType: 'tirth-sthal',
    startingPrice: 18200,
    destinations: ['Varanasi', 'Prayagraj', 'Ayodhya'],
    departureCities: ['Varanasi', 'Lucknow', 'Delhi'],
    transport: 'Sedan, tempo traveller, and group coach options',
    stay: 'Temple-near hotels and curated dharamshala options',
    meals: 'Breakfast included with optional satvik lunch packs',
    bestSeason: 'October to March, festival calendars',
    inclusions: ['Hotel stay', 'Local transfers', 'Aarti guidance', 'Sangam coordination', 'Temple support'],
    routePlan: ['Kashi Vishwanath darshan', 'Ganga aarti evening', 'Prayagraj sangam ritual support', 'Ayodhya temple circuit', 'Return transfer'],
    badge: 'Popular Tirth Circuit',
    image: 'https://picsum.photos/seed/kashi-ayodhya/1200/800',
  },
  {
    id: 'yatra-pancha-jyotirlinga',
    title: 'Pancha Jyotirlinga Maha Package',
    description:
      'A longer premium route covering five major Jyotirlinga destinations with itinerary management, accommodation, and guided temple windows.',
    duration: '9 Nights / 10 Days',
    packageType: 'jyotirlinga',
    startingPrice: 52900,
    destinations: ['Ujjain', 'Omkareshwar', 'Somnath', 'Dwarka', 'Bhimashankar', 'Trimbakeshwar'],
    departureCities: ['Delhi', 'Mumbai', 'Ahmedabad'],
    transport: 'Air-plus-road hybrid pilgrimage routing',
    stay: 'Premium hotels and pilgrimage support properties',
    meals: 'Breakfast and dinner with selected packed meal days',
    bestSeason: 'October to March',
    inclusions: ['Premium stay', 'Transfers', 'Support executive', 'Temple coverage', 'Daily itinerary guidance'],
    routePlan: ['Ujjain and Omkareshwar', 'Somnath', 'Dwarka and Nageshwar zone', 'Maharashtra Jyotirlinga stops', 'Departure'],
    badge: 'Premium Package',
    image: 'https://picsum.photos/seed/pancha-jyotirlinga/1200/800',
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

function mergeSeedProducts(storedProducts: Product[]) {
  const seedById = new Map(defaultProducts.map((product) => [product.id, product]));
  const mergedSeedProducts = defaultProducts.map((seedProduct) => {
    const existingProduct = storedProducts.find((product) => product.id === seedProduct.id);

    if (!existingProduct) {
      return seedProduct;
    }

    const legacyStock =
      seedProduct.id === 'prod-rudraksha-mala' && existingProduct.stock === 100
        ? seedProduct.stock
        : seedProduct.id === 'prod-bhagavad-gita' && existingProduct.stock === 75
          ? seedProduct.stock
          : existingProduct.stock;

    return {
      ...seedProduct,
      price: existingProduct.price ?? seedProduct.price,
      stock: legacyStock ?? seedProduct.stock,
      rating: existingProduct.rating ?? seedProduct.rating,
      isActive: existingProduct.isActive ?? seedProduct.isActive,
      createdAt: existingProduct.createdAt || seedProduct.createdAt,
      updatedAt: existingProduct.updatedAt || seedProduct.updatedAt,
    };
  });

  const customProducts = storedProducts.filter((product) => !seedById.has(product.id));
  return [...mergedSeedProducts, ...customProducts];
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
  writeStorage(STORAGE_KEYS.products, mergeSeedProducts(storedProducts));
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

export async function listYatraPackagesDirect(
  filters: { packageType?: YatraPackage['packageType'] } = {},
) {
  return clone(defaultYatraPackages)
    .filter((yatraPackage) =>
      filters.packageType ? yatraPackage.packageType === filters.packageType : true,
    )
    .sort((left, right) => left.startingPrice - right.startingPrice);
}

export async function getYatraPackageDirect(id: string) {
  return clone(defaultYatraPackages.find((yatraPackage) => yatraPackage.id === id) || null);
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
