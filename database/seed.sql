-- Seed Products — 5 per category × 8 categories = 40 products
INSERT INTO products (vendorId, name, description, price, category, stock, rating, image, templeName, weightOptions)
SELECT * FROM (
  -- IDOLS
  SELECT 'system' as vId,'Brass Ganesha Idol' as n,'Handcrafted pure brass Lord Ganesha idol for home temple. Intricately detailed with traditional motifs, perfect for daily worship and gifting.' as d,1250.00 as p,'Idols' as c,50 as s,4.8 as r,'/products/ganesha-idol.jpg' as i,NULL as t,NULL as w
  UNION ALL SELECT 'system','Marble Radha Krishna Idol','Beautiful white marble Radha Krishna murti hand-carved by Rajasthani artisans. Ideal for home temple and as an auspicious gift.',2499.00,'Idols',30,4.9,'/products/radha-krishna-idol.jpg',NULL,NULL
  UNION ALL SELECT 'system','Brass Shiva Parivar Idol','Elegant brass Shiva family idol depicting Lord Shiva with Parvati, Ganesha and Kartikeya. A divine centrepiece for your prayer space.',3999.00,'Idols',20,4.8,'/products/shiva-idol.jpg',NULL,NULL
  UNION ALL SELECT 'system','Hanuman Ji Murti','Devotional Hanuman Ji murti in sitting posture, finished in antique brass. Bestows courage, protection and strength to the home.',899.00,'Idols',75,4.7,'/products/hanuman-murti.jpg',NULL,NULL
  UNION ALL SELECT 'system','Lakshmi Ganesh Idol Set','Auspicious Lakshmi-Ganesh brass idol set for Diwali puja and housewarming. Brings wealth, prosperity and new beginnings.',1999.00,'Idols',40,4.9,'/products/lakshmi-ganesh-set.jpg',NULL,NULL
  -- INCENSE
  UNION ALL SELECT 'system','Sandalwood Incense Sticks','Premium Mysore sandalwood agarbatti burning 45-60 minutes per stick. Fills your space with a calming divine aroma for puja and meditation.',150.00,'Incense',200,4.6,'/products/incense-sticks.jpg',NULL,NULL
  UNION ALL SELECT 'system','Rose Agarbatti Premium Pack','Pure rose-fragrance agarbatti sourced from Indian rose farms. Long-lasting charcoal-free sticks for daily worship and relaxation.',120.00,'Incense',300,4.5,'/products/incense-sticks.jpg',NULL,NULL
  UNION ALL SELECT 'system','Guggal Dhoop Sticks','Authentic Guggal dhoop sticks prepared using traditional Ayurvedic resin. Purifies the environment and wards off negative energy.',180.00,'Incense',150,4.7,'/products/dhoop-sticks.jpg',NULL,NULL
  UNION ALL SELECT 'system','Jasmine Incense Cones','Handrolled jasmine incense cones with gentle floral fragrance. Perfect for meditation, yoga sessions and evening puja.',99.00,'Incense',250,4.4,'/products/incense-cones.jpg',NULL,NULL
  UNION ALL SELECT 'system','Temple Fragrance Combo Pack','Curated combo of 5 temple fragrances — sandalwood, rose, jasmine, camphor and kevda. 200 sticks in premium gift packaging.',299.00,'Incense',100,4.8,'/products/incense-sticks.jpg',NULL,NULL
  -- MALA
  UNION ALL SELECT 'system','108 Bead Rudraksha Mala','Original 108+1 beads Panchmukhi Rudraksha mala from Nepal. Energized and blessed as per Vedic rituals for japa and spiritual protection.',499.00,'Mala',100,4.9,'/products/rudraksha-mala.jpg',NULL,NULL
  UNION ALL SELECT 'system','Tulsi Japa Mala','Sacred Vrindavan Tulsi wood japa mala, hand-knotted with 108 beads. Revered by Vaishnavas for chanting and meditation.',299.00,'Mala',150,4.7,'/products/tulsi-mala.jpg',NULL,NULL
  UNION ALL SELECT 'system','Sphatik Crystal Mala','Natural clear quartz Sphatik crystal mala with 108 beads. Amplifies positive energy and enhances focus. Prized for Goddess Saraswati puja.',999.00,'Mala',60,4.8,'/products/crystal-mala.jpg',NULL,NULL
  UNION ALL SELECT 'system','Chandan Mala','Authentic sandalwood chandan mala with 108 beads. Naturally fragrant, cool to touch and traditionally used for Vishnu and Shiva mantras.',599.00,'Mala',80,4.6,'/products/rudraksha-mala.jpg',NULL,NULL
  UNION ALL SELECT 'system','Five Mukhi Rudraksha Mala','Premium Five-Mukhi Panchmukhi Rudraksha mala representing Lord Shiva. Promotes calmness, clarity and spiritual well-being.',799.00,'Mala',50,4.9,'/products/rudraksha-mala.jpg',NULL,NULL
  -- BOOKS
  UNION ALL SELECT 'system','Bhagavad Gita Deluxe Edition','Srila Prabhupada Bhagavad Gita As It Is — deluxe hardbound with Sanskrit shlokas, transliteration, word-for-word meanings and commentary.',599.00,'Books',75,5.0,'/products/bhagavad-gita.jpg',NULL,NULL
  UNION ALL SELECT 'system','Ramayana Illustrated Edition','Valmiki Ramayana in English — beautifully illustrated collector edition with 200+ colour plates depicting key scenes from the epic.',799.00,'Books',50,4.8,'/products/ramayana-book.jpg',NULL,NULL
  UNION ALL SELECT 'system','Vishnu Sahasranama','Complete Vishnu Sahasranama with Sanskrit text, Roman transliteration, meaning and significance of all 1000 names of Lord Vishnu.',299.00,'Books',120,4.7,'/products/bhagavad-gita.jpg',NULL,NULL
  UNION ALL SELECT 'system','Hanuman Chalisa Hardcover','Elegant hardcover Hanuman Chalisa with original Awadhi text, Hindi translation and colour illustrations. A devotional treasure for every home.',199.00,'Books',200,4.6,'/products/hanuman-chalisa.jpg',NULL,NULL
  UNION ALL SELECT 'system','Shiva Purana Essentials','Curated Shiva Purana essentials — creation stories, Shiva Sahasranama, Rudrashtakam and key rituals from the original Mahapurana.',699.00,'Books',40,4.9,'/products/bhagavad-gita.jpg',NULL,NULL
  -- YANTRAS
  UNION ALL SELECT 'system','Shri Yantra Copper Plate','Geometrically precise energized copper Shri Yantra for prosperity and positive energy. Consecrated under Vedic planetary configurations.',799.00,'Yantras',45,4.8,'/products/shri-yantra.jpg',NULL,NULL
  UNION ALL SELECT 'system','Kuber Yantra','Energized Kuber Yantra for wealth attraction and financial abundance. Etched on pure copper, consecrated during Pushya Nakshatra.',999.00,'Yantras',35,4.7,'/products/kuber-yantra.jpg',NULL,NULL
  UNION ALL SELECT 'system','Maha Mrityunjaya Yantra','Sacred Maha Mrityunjaya Yantra for health, longevity and protection from negativity. Hand-engraved on pure copper plate.',899.00,'Yantras',30,4.9,'/products/shri-yantra.jpg',NULL,NULL
  UNION ALL SELECT 'system','Navgraha Yantra','Powerful Navgraha Yantra representing all nine planets. Balances planetary energies and removes doshas affecting career and relationships.',1299.00,'Yantras',25,4.8,'/products/kuber-yantra.jpg',NULL,NULL
  UNION ALL SELECT 'system','Lakshmi Prosperity Yantra','Lakshmi Yantra etched on gold-plated copper, attracting wealth and success. Install in home puja room or business premises.',699.00,'Yantras',50,4.7,'/products/shri-yantra.jpg',NULL,NULL
  -- PRASAD
  UNION ALL SELECT 'system','Tirupati Laddu Prasad','Authentic Tirupati Balaji Temple Laddu Prasad prepared by temple priests using the original sacred recipe. Carries divine blessings of Lord Venkateswara.',299.00,'Prasad',50,5.0,'/products/tirupati-laddu.jpg','Tirupati Balaji','[{"label":"1 Unit","price":299},{"label":"2 Units","price":549}]'
  UNION ALL SELECT 'system','Panchmewa Prasad Pack','Auspicious Panchmewa prasad blend of five dried fruits — cashews, raisins, almonds, dates and pistachios. Offered during Satyanarayan puja.',249.00,'Prasad',80,4.8,'/products/kashi-prasad.jpg',NULL,'[{"label":"250g","price":249},{"label":"500g","price":449}]'
  UNION ALL SELECT 'system','Mishri Bhog Pack','Pure rock sugar Mishri for bhog offering. Used in milk prasad, charnamrit preparation and as naivedyam to deities.',149.00,'Prasad',120,4.6,'/products/kashi-prasad.jpg',NULL,'[{"label":"250g","price":149},{"label":"500g","price":249}]'
  UNION ALL SELECT 'system','Kashi Vishwanath Prasad','Special Ladoo Prasad from Kashi Vishwanath Temple, Varanasi. Freshly prepared by temple priests with the blessings of Lord Shiva.',299.00,'Prasad',60,4.9,'/products/kashi-prasad.jpg','Kashi Vishwanath','[{"label":"250g","price":299},{"label":"500g","price":549}]'
  UNION ALL SELECT 'system','Charnamrit Prasad Kit','Complete charnamrit preparation kit with Gangajal, milk, curd, honey, ghee and Tulsi. Everything needed for abhishek and prasad offering.',199.00,'Prasad',90,4.7,'/products/kashi-prasad.jpg',NULL,NULL
  -- PUJA ESSENTIALS
  UNION ALL SELECT 'system','Brass Puja Thali Set','Complete brass puja thali set with diya, incense holder, bell, kumkum container and aarti plate. Elegantly engraved for daily worship.',799.00,'Puja Essentials',60,4.8,'/products/puja-thali.jpg',NULL,NULL
  UNION ALL SELECT 'system','Copper Kalash','Pure copper kalash for Vastu puja, Griha Pravesh and all Vedic rituals. Storing water in copper carries significant spiritual merit.',699.00,'Puja Essentials',45,4.7,'/products/copper-kalash.jpg',NULL,NULL
  UNION ALL SELECT 'system','Brass Temple Bell','Resonant brass puja bell with Om engraving and wooden handle. The sound dispels negative energy and invites divine presence.',399.00,'Puja Essentials',80,4.6,'/products/brass-bell.jpg',NULL,NULL
  UNION ALL SELECT 'system','Camphor Pack Bhimseni','Pure Bhimseni camphor for aarti and havan. Naturally sourced, burns clean without residue and releases divine fragrance during puja.',149.00,'Puja Essentials',200,4.5,'/products/brass-diya.jpg',NULL,'[{"label":"50g","price":149},{"label":"100g","price":269}]'
  UNION ALL SELECT 'system','Akhand Jyot Diya','Handcrafted brass akhand diya for continuous flame during Navratri and auspicious vrats. Deep-set bowl holds oil for 24-48 hour burning.',499.00,'Puja Essentials',55,4.9,'/products/brass-diya.jpg',NULL,NULL
  -- SAMAGRI KITS
  UNION ALL SELECT 'system','Satyanarayan Puja Kit','Complete Satyanarayan Katha samagri with 51 items — panchamrit, fruits, banana leaves, panchmewa, puja thali and all ritual essentials.',1299.00,'Samagri Kits',40,4.8,'/products/puja-samagri.jpg',NULL,NULL
  UNION ALL SELECT 'system','Lakshmi Puja Kit','Diwali Lakshmi puja samagri with lotus seeds, red cloth, kumkum, chandan, coins, diyas and all items for a complete Lakshmi puja.',999.00,'Samagri Kits',55,4.7,'/products/puja-samagri.jpg',NULL,NULL
  UNION ALL SELECT 'system','Rudrabhishek Puja Kit','Premium Rudrabhishek kit with Shivalinga, panchamrit, bel leaves, Gangajal, rudraksha mala, dhatura and all items for Shiva abhishek.',1999.00,'Samagri Kits',25,4.9,'/products/puja-samagri.jpg',NULL,NULL
  UNION ALL SELECT 'system','Navratri Puja Kit','All-inclusive Navratri kit for 9-day celebration — Kalash, red cloth, Durga idol, akhand diya, sindoor, bangles, coconut and fresh flowers.',1499.00,'Samagri Kits',35,4.8,'/products/navratri-kit.jpg',NULL,NULL
  UNION ALL SELECT 'system','Griha Pravesh Puja Kit','Complete Griha Pravesh samagri with 75+ items — copper kalash, Ganesh idol, havan samagri, holy thread, mango leaves and Vastu essentials.',2499.00,'Samagri Kits',20,4.9,'/products/puja-samagri.jpg',NULL,NULL
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- Seed Pujas
INSERT INTO pujas (vendorId, title, description, onlinePrice, offlinePrice, duration, samagriList)
SELECT * FROM (
  SELECT 'system' as vId, 'Ganesh Puja' as t, 'Invoke the blessings of Lord Ganesha for new beginnings and removing obstacles.' as d, 1100.00 as op, 2100.00 as ofp, '1.5 Hours' as dur, '["Ganesha Idol","Turmeric","Kumkum","Sandalwood Paste","Incense Sticks","Lamp","Flowers","Fruits","Betel Leaves","Betel Nuts","Coconut","Rice","Sweets (Modak)"]' as sl
  UNION ALL SELECT 'system', 'Satyanarayan Katha', 'A sacred ritual dedicated to Lord Vishnu for peace, prosperity, and happiness.', 2500.00, 5100.00, '3 Hours', '["Satyanarayan Photo","Panchamrit (Milk, Curd, Ghee, Honey, Sugar)","Banana Leaves","Flowers","Fruits","Tulsi Leaves","Kalash","Mango Leaves","Wheat","Ghee for Havan","Samidha Sticks"]'
  UNION ALL SELECT 'system', 'Lakshmi Puja', 'Attract wealth and prosperity with this special puja dedicated to Goddess Lakshmi.', 1800.00, 3500.00, '2 Hours', '["Lakshmi Idol/Photo","Silver/Gold Coins","Lotus Flowers","Red Cloth","Rice","Turmeric","Kumkum","Sandalwood","Incense","Lamp","Ghee","Fruits","Sweets","Betel Leaves","Nuts"]'
  UNION ALL SELECT 'system', 'Navgraha Shanti', 'Pacify the nine planets and bring harmony and balance in life.', 3100.00, 6100.00, '2.5 Hours', '["Navgraha Yantra","Nine Grains","Colored Cloth (9 colors)","Sesame Seeds","Mustard","Ghee","Honey","Flowers","Incense","Lamp","Coconut","Rice","Turmeric","Kumkum"]'
  UNION ALL SELECT 'system', 'Rudrabhishek', 'A powerful Shiva puja involving ritual bathing of the Shivalinga with sacred substances.', 5100.00, 11000.00, '3 Hours', '["Shivalinga","Panchamrit","Bel Leaves","Dhatura","Blue Flowers","Honey","Milk","Curd","Ghee","Gangajal","Sandalwood Paste","Rudraksha Mala","Incense","Lamp"]'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM pujas LIMIT 1);

-- Seed Feedback
INSERT INTO feedback (name, city, rating, message, createdAt)
SELECT * FROM (
  SELECT 'Anjali Sharma' as n, 'Mumbai' as c, 5 as r, 'Booking a Satyanarayan Puja felt smooth and respectful. The experience was simple even for my family elders.' as m, NOW() - INTERVAL 10 DAY as ca
  UNION ALL SELECT 'Rohan Iyer', 'Bengaluru', 5, 'The product flow is clean, and I liked that I could find essentials quickly without feeling lost in the catalog.', NOW() - INTERVAL 7 DAY
  UNION ALL SELECT 'Meera Kapoor', 'Delhi', 5, 'The platform feels warm and trustworthy. I would especially recommend the guided support and puja discovery flow.', NOW() - INTERVAL 5 DAY
  UNION ALL SELECT 'Suresh Nair', 'Chennai', 5, 'Ordered the Tirupati Laddu Prasad and it arrived beautifully packed. Felt truly blessed. Will order again.', NOW() - INTERVAL 3 DAY
  UNION ALL SELECT 'Priya Mishra', 'Varanasi', 5, 'The Rudrabhishek puja was conducted with complete devotion. The pandit was knowledgeable and the experience felt sacred.', NOW() - INTERVAL 1 DAY
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM feedback LIMIT 1);

-- Seed Yatras
INSERT INTO yatras (vendorId, title, description, price, duration, location, category, rating, images, itinerary, included, excluded)
SELECT * FROM (
  SELECT
    'system' as vId, 'Char Dham Yatra' as t,
    'Embark on the most sacred Hindu pilgrimage covering Yamunotri, Gangotri, Kedarnath, and Badrinath. A spiritually transformative journey through the Himalayas.' as d,
    18500.00 as p, '12 Nights / 13 Days' as dur, 'Uttarakhand, India' as loc, 'Himalayan Pilgrimages' as cat, 4.9 as rat,
    '["/hero/about-hero.png"]' as img,
    '[{"day":1,"title":"Haridwar to Yamunotri","description":"Depart Haridwar early morning. Drive to Janki Chatti, trek to Yamunotri temple."},{"day":2,"title":"Yamunotri to Gangotri","description":"Morning aarti then drive to Gangotri. Evening prayers at the Ganga Ghat."},{"day":3,"title":"Gangotri to Kedarnath","description":"Drive to Gaurikund, trek 22 km to Kedarnath temple."},{"day":4,"title":"Kedarnath to Badrinath","description":"Descent and drive to Badrinath. Attend the Maha Abhishek ceremony."}]' as itin,
    '["AC transport","Accommodation (twin sharing)","All meals (veg)","Experienced guide","Puja samagri for all four dhams"]' as inc,
    '["Personal expenses","Camera fees","Tips","Insurance"]' as exc
  UNION ALL SELECT
    'system', 'Kashi Vishwanath Darshan',
    'A 3-night guided spiritual immersion in Varanasi — the city of Lord Shiva. Includes Ganga Aarti, Kashi Vishwanath darshan, sunrise boat ride, and Sarnath visit.',
    4200.00, '3 Nights / 4 Days', 'Varanasi, Uttar Pradesh', 'Temple Tours', 4.8,
    '["/hero/about-hero.png"]',
    '[{"day":1,"title":"Arrival & Ganga Aarti","description":"Arrive Varanasi. Evening Ganga Aarti at Dashashwamedh Ghat."},{"day":2,"title":"Kashi Vishwanath & Annapurna","description":"Early morning mangala aarti at Kashi Vishwanath Jyotirlinga."},{"day":3,"title":"Sunrise Boat Ride & Sarnath","description":"Sunrise boat ride on the Ganga. Afternoon visit to Sarnath."},{"day":4,"title":"Morning Puja & Departure","description":"Last morning puja at the ghats and departure with blessings."}]',
    '["Accommodation 3 nights","All breakfasts","Experienced guide","Ganga aarti seating","Boat ride","Entry fees"]',
    '["Flights/train tickets","Lunch and dinner","Personal expenses"]'
  UNION ALL SELECT
    'system', 'Tirupati Balaji Darshan',
    'A complete guided Tirupati darshan with special entry, Abhishekam booking assistance, and accommodation near the temple.',
    5500.00, '2 Nights / 3 Days', 'Tirupati, Andhra Pradesh', 'Temple Tours', 4.9,
    '["/hero/about-hero.png"]',
    '[{"day":1,"title":"Arrival & Alipiri Walk","description":"Arrive Tirupati. Evening Alipiri footpath climb as a devotional offering."},{"day":2,"title":"Main Darshan & Abhishekam","description":"Early morning special entry darshan of Lord Venkateswara."},{"day":3,"title":"Padmavathi Temple & Departure","description":"Morning visit to Padmavathi Ammavari temple. Collect Prasad Laddu and depart."}]',
    '["Accommodation 2 nights","All meals (veg)","Special entry darshan ticket","Experienced guide","Return transfers"]',
    '["Abhishekam seva charges","Personal expenses","Travel to Tirupati"]'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM yatras LIMIT 1);

-- Seed Bookings
INSERT INTO bookings (userId, serviceId, vendorId, type, date, timeSlot, status, totalAmount, isOnline, bringSamagri, paymentStatus, createdAt)
SELECT * FROM (
  SELECT 'system_devotee_1' as uid, 1 as sid, 'system' as vid, 'puja' as t, DATE_ADD(CURDATE(), INTERVAL 3 DAY) as d, '10:00 AM' as ts, 'confirmed' as st, 1100.00 as amt, 1 as io, 0 as bs, 'paid' as ps, DATE_SUB(NOW(), INTERVAL 2 DAY) as ca
  UNION ALL SELECT 'system_devotee_1', 2, 'system', 'puja', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '11:00 AM', 'pending', 5100.00, 0, 1, 'pending', DATE_SUB(NOW(), INTERVAL 1 DAY)
  UNION ALL SELECT 'system_devotee_1', 3, 'system', 'puja', DATE_SUB(CURDATE(), INTERVAL 5 DAY), '09:00 AM', 'completed', 1800.00, 1, 0, 'paid', DATE_SUB(NOW(), INTERVAL 6 DAY)
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM bookings LIMIT 1);
