-- Seed Products
INSERT INTO products (vendorId, name, description, price, category, stock, rating, image, templeName, weightOptions)
SELECT * FROM (
  SELECT 'system' as vId, 'Brass Ganesha Idol' as n, 'Handcrafted pure brass Ganesha idol for your home altar. Intricately detailed with traditional motifs, perfect for daily worship and gifting.' as d, 1250.00 as p, 'Idols' as c, 50 as s, 4.8 as r, '/products/ganesha-idol.jpg' as i, NULL as t, NULL as w
  UNION ALL SELECT 'system', 'Sandalwood Incense Sticks', 'Premium Mysore sandalwood incense sticks. Each stick burns 45-60 minutes filling your space with a calming, divine aroma ideal for meditation and daily puja.', 150.00, 'Incense', 200, 4.5, '/products/incense-sticks.jpg', NULL, NULL
  UNION ALL SELECT 'system', 'Rudraksha Mala', 'Original 108+1 beads Panchmukhi Rudraksha mala from Nepal. Energized and blessed as per Vedic rituals — ideal for japa meditation and spiritual protection.', 450.00, 'Mala', 100, 4.9, '/products/rudraksha-mala.jpg', NULL, NULL
  UNION ALL SELECT 'system', 'Bhagavad Gita', 'The Bhagavad Gita As It Is — Deluxe hardbound edition with original Sanskrit shlokas, English transliteration, word-for-word meanings, and commentary.', 599.00, 'Books', 75, 5.0, '/products/bhagavad-gita.jpg', NULL, NULL
  UNION ALL SELECT 'system', 'Copper Shri Yantra', 'Geometrically precise energized copper Shri Yantra for prosperity and positive energy. Consecrated as per Vedic rituals.', 850.00, 'Yantras', 30, 4.7, '/products/shri-yantra.jpg', NULL, NULL
  UNION ALL SELECT 'system', 'Kashi Vishwanath Prasad', 'Special Ladoo Prasad from Kashi Vishwanath Temple, Varanasi. Freshly prepared by temple priests and dispatched with the blessings of Lord Shiva.', 250.00, 'Prasad', 100, 4.9, '/products/kashi-prasad.jpg', 'Kashi Vishwanath', '[{"label": "250g", "price": 250}, {"label": "500g", "price": 450}]'
  UNION ALL SELECT 'system', 'Tirupati Laddu', 'Authentic Tirupati Balaji Temple Laddu Prasad prepared by temple priests using the original sacred recipe. Carries the divine blessings of Lord Venkateswara.', 350.00, 'Prasad', 50, 5.0, '/products/tirupati-laddu.jpg', 'Tirupati Balaji', '[{"label": "1 Unit", "price": 350}, {"label": "2 Units", "price": 650}]'
  UNION ALL SELECT 'system', 'Premium Brass Diya', 'Handcrafted brass diya with intricate engravings. Perfect for daily puja, Diwali celebrations, and auspicious occasions. Comes with a cotton wick.', 499.00, 'Puja Essentials', 50, 4.8, '/products/brass-diya.jpg', NULL, NULL
  UNION ALL SELECT 'system', 'Puja Samagri Kit', 'Complete puja samagri kit with all essentials — kumkum, haldi, chandan, camphor, dhoop, supari, paan, and more. Everything you need for a complete puja in one box.', 349.00, 'Samagri Kits', 80, 4.6, '/products/puja-samagri.jpg', NULL, NULL
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
