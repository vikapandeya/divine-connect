CREATE TABLE IF NOT EXISTS pujas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendorId VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  price DECIMAL(10, 2),
  duration VARCHAR(50)
);
