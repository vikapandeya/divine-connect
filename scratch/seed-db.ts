import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function seedDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'divine',
      port: Number(process.env.MYSQL_PORT) || 3306,
    });

    console.log('✅ Connected to MySQL for seeding.');

    // Seed Admin User
    const bcrypt = await import('bcryptjs');
    const adminPassword = await bcrypt.default.hash('Admin@123', 10);
    await connection.execute(
      "INSERT INTO users (uid, displayName, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      ['admin_01', 'System Admin', 'pg2331427@gmail.com', adminPassword, 'admin', new Date()]
    );
    console.log('✅ Admin user seeded.');

    // Seed Products
    const products = [
      ['Brass Ganesha Idol', 'Handcrafted brass idol for your home temple.', 1299, 'Idols', 'Kashi Vishwanath', JSON.stringify({ '200g': 1299, '500g': 2499 }), 50, 4.8, 'https://images.unsplash.com/photo-1544731612-de7f96afe55f?auto=format&fit=crop&q=80&w=400'],
      ['Sandalwood Mala', 'Natural sandalwood beads (108+1) for meditation.', 450, 'Malas', 'General', JSON.stringify({ 'Standard': 450 }), 100, 4.7, 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=400'],
      ['Pure Cow Ghee (500ml)', 'Pure desi ghee for diya and cooking.', 650, 'Essentials', 'General', JSON.stringify({ '500ml': 650, '1L': 1200 }), 30, 4.9, 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=80&w=400'],
      ['Rudraksha Pendant', 'Authentic 5-mukhi rudraksha with silver capping.', 850, 'Accessories', 'Pashupatinath', JSON.stringify({ 'Small': 850, 'Medium': 1200 }), 20, 4.6, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400']
    ];

    for (const p of products) {
      await connection.execute(
        "INSERT INTO products (name, description, price, category, templeName, weightOptions, stock, rating, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        p
      );
    }

    // Seed Pujas
    const pujas = [
      ['Satyanarayan Katha', 'A sacred puja for prosperity and well-being.', 2100, 5100, '2 Hours', 'Moly, Flowers, Fruits, Sweets'],
      ['Ganesh Puja', 'Invocation of Lord Ganesha for success and removing obstacles.', 1100, 3100, '1 Hour', 'Durva, Modaks, Hibiscus'],
      ['Mahamrityunjaya Jaap', 'Powerful Vedic chant for health and longevity.', 5100, 11000, '4 Hours', 'Bael leaves, Honey, Milk']
    ];

    for (const p of pujas) {
      await connection.execute(
        "INSERT INTO pujas (title, description, onlinePrice, offlinePrice, duration, samagriList) VALUES (?, ?, ?, ?, ?, ?)",
        p
      );
    }

    console.log('✅ Seeding completed successfully.');
    await connection.end();
  } catch (err: any) {
    console.error('❌ Seeding failed:', err.message);
  }
}

seedDB();
