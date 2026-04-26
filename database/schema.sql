-- Users Table
CREATE TABLE IF NOT EXISTS users (
  uid VARCHAR(255) PRIMARY KEY,
  displayName VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  photoURL TEXT,
  address TEXT,
  phoneNumber VARCHAR(20),
  bio TEXT,
  bannerURL TEXT,
  role ENUM('devotee', 'vendor', 'admin') DEFAULT 'devotee',
  vendorStatus ENUM('none', 'pending', 'approved', 'rejected') DEFAULT 'none',
  fcmToken TEXT,
  createdAt DATETIME
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendorId VARCHAR(255),
  name VARCHAR(255),
  description TEXT,
  price DECIMAL(10, 2),
  category VARCHAR(100), -- 'Idols', 'Incense', 'Mala', 'Books', 'Yantras', 'Prasad'
  templeName VARCHAR(255), -- For Prasad category
  weightOptions JSON, -- e.g., [{"label": "250g", "price": 150}, {"label": "500g", "price": 280}]
  stock INT,
  rating DECIMAL(3, 2),
  image TEXT
);

-- Pujas Table
CREATE TABLE IF NOT EXISTS pujas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendorId VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  onlinePrice DECIMAL(10, 2),
  offlinePrice DECIMAL(10, 2),
  duration VARCHAR(50),
  samagriList TEXT -- Detailed list of items required
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(255),
  serviceId INT,
  vendorId VARCHAR(255),
  type ENUM('puja', 'darshan'),
  isOnline BOOLEAN DEFAULT FALSE,
  bringSamagri BOOLEAN DEFAULT FALSE, -- If offline, does Pandit Ji bring it?
  date DATE,
  timeSlot VARCHAR(50),
  status ENUM('pending', 'confirmed', 'completed', 'cancelled'),
  totalAmount DECIMAL(10, 2),
  samagriList TEXT, -- Snapshot of samagri list for the receipt
  FOREIGN KEY (userId) REFERENCES users(uid)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(255),
  totalAmount DECIMAL(10, 2),
  status ENUM('processing', 'shipped', 'delivered', 'cancelled'),
  shippingAddress TEXT,
  createdAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(uid)
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT,
  productId INT,
  quantity INT,
  price DECIMAL(10, 2),
  selectedOption VARCHAR(255),
  FOREIGN KEY (orderId) REFERENCES orders(id)
);

-- Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  city VARCHAR(255),
  rating INT,
  message TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
  userId VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(100),
  description TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews INT DEFAULT 0,
  joinedAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(uid)
);

-- Vendor Wallets Table
CREATE TABLE IF NOT EXISTS vendor_wallets (
  vendorId VARCHAR(255) PRIMARY KEY,
  balance DECIMAL(10, 2) DEFAULT 0,
  totalEarned DECIMAL(10, 2) DEFAULT 0,
  FOREIGN KEY (vendorId) REFERENCES users(uid)
);

-- Vendor Payouts Table
CREATE TABLE IF NOT EXISTS vendor_payouts (
  id VARCHAR(50) PRIMARY KEY,
  vendorId VARCHAR(255),
  amount DECIMAL(10, 2),
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  bankDetails JSON,
  createdAt DATETIME,
  FOREIGN KEY (vendorId) REFERENCES vendor_wallets(vendorId)
);

-- Vendor Transactions Table
CREATE TABLE IF NOT EXISTS vendor_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendorId VARCHAR(255),
  amount DECIMAL(10, 2),
  originalAmount DECIMAL(10, 2),
  commission DECIMAL(10, 2),
  type ENUM('order', 'booking'),
  referenceId VARCHAR(255),
  createdAt DATETIME,
  FOREIGN KEY (vendorId) REFERENCES vendor_wallets(vendorId)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(255),
  title VARCHAR(255),
  message TEXT,
  type ENUM('order', 'booking', 'system'),
  `read` BOOLEAN DEFAULT FALSE,
  createdAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(uid)
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  discount DECIMAL(10, 2),
  type ENUM('percentage', 'fixed'),
  minAmount DECIMAL(10, 2),
  active BOOLEAN DEFAULT TRUE
);

-- Stats Table
CREATE TABLE IF NOT EXISTS stats (
  id VARCHAR(50) PRIMARY KEY,
  total INT DEFAULT 0,
  `new` INT DEFAULT 0,
  lastReset DATETIME
);
