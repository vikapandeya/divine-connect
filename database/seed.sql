-- Seed Products
INSERT INTO products (vendorId, name, description, price, category, stock, rating, image, templeName, weightOptions) 
SELECT * FROM (
  SELECT 'system' as vId, 'Brass Ganesha Idol' as n, 'Handcrafted pure brass Ganesha idol for your home altar.' as d, 1250.00 as p, 'Idols' as c, 50 as s, 4.8 as r, 'https://picsum.photos/seed/ganesha/400/400' as i, NULL as t, NULL as w
  UNION ALL SELECT 'system', 'Sandalwood Incense', 'Premium Mysore sandalwood incense sticks for a divine aroma.', 150.00, 'Incense', 200, 4.5, 'https://picsum.photos/seed/incense/400/400', NULL, NULL
  UNION ALL SELECT 'system', 'Rudraksha Mala', 'Original 108+1 beads Panchmukhi Rudraksha mala from Nepal.', 450.00, 'Mala', 100, 4.9, 'https://picsum.photos/seed/mala/400/400', NULL, NULL
  UNION ALL SELECT 'system', 'Bhagavad Gita', 'The Bhagavad Gita As It Is - Deluxe Hardbound Edition.', 599.00, 'Books', 75, 5.0, 'https://picsum.photos/seed/gita/400/400', NULL, NULL
  UNION ALL SELECT 'system', 'Copper Shri Yantra', 'Energized copper Shri Yantra for prosperity and positive energy.', 850.00, 'Yantras', 30, 4.7, 'https://picsum.photos/seed/yantra/400/400', NULL, NULL
  UNION ALL SELECT 'system', 'Kashi Vishwanath Prasad', 'Special Ladoo Prasad from Kashi Vishwanath Temple, Varanasi.', 250.00, 'Prasad', 100, 4.9, 'https://picsum.photos/seed/kashi/400/400', 'Kashi Vishwanath', '[{"label": "250g", "price": 250}, {"label": "500g", "price": 450}]'
  UNION ALL SELECT 'system', 'Tirupati Laddu', 'Authentic Tirupati Balaji Temple Laddu Prasad.', 350.00, 'Prasad', 50, 5.0, 'https://picsum.photos/seed/tirupati/400/400', 'Tirupati Balaji', '[{"label": "1 Unit", "price": 350}, {"label": "2 Units", "price": 650}]'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- Seed Pujas
INSERT INTO pujas (vendorId, title, description, onlinePrice, offlinePrice, duration, samagriList)
SELECT * FROM (
  SELECT 'system' as vId, 'Ganesh Puja' as t, 'Invoke the blessings of Lord Ganesha for new beginnings and removing obstacles.' as d, 1100.00 as op, 2100.00 as ofp, '1.5 Hours' as dur, 'Ganesha Idol, Turmeric, Kumkum, Sandalwood Paste, Incense Sticks, Lamp, Flowers, Fruits, Betel Leaves, Betel Nuts, Coconut, Rice, Sweets (Modak).' as sl
  UNION ALL SELECT 'system', 'Satyanarayan Katha', 'A sacred ritual dedicated to Lord Vishnu for peace, prosperity, and happiness.', 2500.00, 5100.00, '3 Hours', 'Satyanarayan Photo, Panchamrit (Milk, Curd, Ghee, Honey, Sugar), Banana Leaves, Flowers, Fruits, Tulsi Leaves, Kalash, Mango Leaves, Wheat, Ghee for Havan, Samidha Sticks.'
  UNION ALL SELECT 'system', 'Lakshmi Puja', 'Attract wealth and prosperity with this special puja dedicated to Goddess Lakshmi.', 1800.00, 3500.00, '2 Hours', 'Lakshmi Idol/Photo, Silver/Gold Coins, Lotus Flowers, Red Cloth, Rice, Turmeric, Kumkum, Sandalwood, Incense, Lamp, Ghee, Fruits, Sweets, Betel Leaves, Nuts.'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM pujas LIMIT 1);
