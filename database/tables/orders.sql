CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(255),
  totalAmount DECIMAL(10, 2),
  status ENUM('processing', 'shipped', 'delivered', 'cancelled'),
  shippingAddress TEXT,
  createdAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(uid)
);
