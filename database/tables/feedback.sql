CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(255),
  serviceId VARCHAR(255),
  vendorId VARCHAR(255),
  type VARCHAR(50) DEFAULT 'general',
  name VARCHAR(255),
  city VARCHAR(255),
  rating INT,
  message TEXT,
  imageURL TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
