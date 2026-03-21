CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendorId VARCHAR(255),
  name VARCHAR(255),
  description TEXT,
  price DECIMAL(10, 2),
  category VARCHAR(100),
  stock INT,
  rating DECIMAL(3, 2),
  image TEXT
);
