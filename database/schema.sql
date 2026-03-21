-- Users Table
CREATE TABLE IF NOT EXISTS users (
  uid VARCHAR(255) PRIMARY KEY,
  displayName VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  photoURL TEXT,
  address TEXT,
  role ENUM('devotee', 'vendor', 'admin') DEFAULT 'devotee',
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

-- OTPs Table
CREATE TABLE IF NOT EXISTS otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255),
  otp VARCHAR(6),
  expiresAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
