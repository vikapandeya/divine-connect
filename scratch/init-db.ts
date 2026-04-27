import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function initDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'divine',
      port: Number(process.env.MYSQL_PORT) || 3306,
    });

    console.log('✅ Connected to MySQL.');

    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        uid VARCHAR(255) PRIMARY KEY,
        displayName VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        photoURL TEXT,
        address TEXT,
        phoneNumber VARCHAR(20),
        bio TEXT,
        bannerURL TEXT,
        role VARCHAR(50) DEFAULT 'devotee',
        vendorStatus VARCHAR(50) DEFAULT 'none',
        fcmToken TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS vendors (
        userId VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        type VARCHAR(50),
        description TEXT,
        rating FLOAT DEFAULT 0,
        reviews INT DEFAULT 0,
        joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(uid) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendorId VARCHAR(255),
        name VARCHAR(255),
        description TEXT,
        price FLOAT,
        category VARCHAR(100),
        templeName VARCHAR(255),
        weightOptions JSON,
        stock INT DEFAULT 0,
        rating FLOAT DEFAULT 0,
        image TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendorId) REFERENCES users(uid) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS pujas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendorId VARCHAR(255),
        title VARCHAR(255),
        description TEXT,
        onlinePrice FLOAT,
        offlinePrice FLOAT,
        duration VARCHAR(100),
        samagriList TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendorId) REFERENCES users(uid) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS yatras (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendorId VARCHAR(255),
        title VARCHAR(255),
        description TEXT,
        price FLOAT,
        duration VARCHAR(100),
        location VARCHAR(255),
        category VARCHAR(100),
        rating FLOAT DEFAULT 0,
        images JSON,
        itinerary JSON,
        included JSON,
        excluded JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendorId) REFERENCES users(uid) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(255),
        serviceId INT,
        vendorId VARCHAR(255),
        type VARCHAR(50),
        isOnline BOOLEAN,
        bringSamagri BOOLEAN,
        date DATE,
        timeSlot VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        totalAmount FLOAT,
        paidAmount FLOAT DEFAULT 0,
        samagriList TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(uid),
        FOREIGN KEY (vendorId) REFERENCES users(uid)
      )`,
      `CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(255),
        totalAmount FLOAT,
        status VARCHAR(50) DEFAULT 'pending',
        shippingAddress TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(uid)
      )`,
      `CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        orderId INT,
        productId INT,
        quantity INT,
        price FLOAT,
        selectedOption VARCHAR(255),
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(255),
        name VARCHAR(255),
        city VARCHAR(255),
        rating INT,
        message TEXT,
        imageURL TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS stats (
        id VARCHAR(50) PRIMARY KEY,
        total INT DEFAULT 0,
        \`new\` INT DEFAULT 0,
        lastReset DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS naam_jap (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(255),
        date DATE,
        count INT DEFAULT 0,
        target INT DEFAULT 108,
        mantraName VARCHAR(255),
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY (userId, date, mantraName),
        FOREIGN KEY (userId) REFERENCES users(uid) ON DELETE CASCADE
      )`
    ];

    for (const sql of tables) {
      await connection.execute(sql);
    }

    console.log('✅ All tables initialized successfully.');
    await connection.end();
  } catch (err: any) {
    console.error('❌ Database initialization failed:', err.message);
  }
}

initDB();
