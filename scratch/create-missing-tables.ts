import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'divine',
});

const tables = [
  `CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(255),
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50) DEFAULT 'system',
    \`read\` BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(uid) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS vendor_wallets (
    vendorId VARCHAR(255) PRIMARY KEY,
    balance DECIMAL(10,2) DEFAULT 0,
    totalEarned DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (vendorId) REFERENCES users(uid) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS vendor_payouts (
    id VARCHAR(50) PRIMARY KEY,
    vendorId VARCHAR(255),
    amount DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    bankDetails JSON,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS vendor_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendorId VARCHAR(255),
    amount DECIMAL(10,2),
    originalAmount DECIMAL(10,2),
    commission DECIMAL(10,2),
    type VARCHAR(50),
    referenceId VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS whatsapp_bookings (
    id VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(255),
    vendorId VARCHAR(255),
    pujaTitle VARCHAR(255),
    whatsappNumber VARCHAR(20),
    distance FLOAT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    totalAmount FLOAT DEFAULT 0,
    paidAmount FLOAT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
];

(async () => {
  for (const sql of tables) {
    const name = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || '?';
    try {
      await pool.execute(sql);
      console.log(`✅ Table ready: ${name}`);
    } catch (e: any) {
      console.error(`❌ ${name}: ${e.message}`);
    }
  }
  await pool.end();
  console.log('Done.');
})();
