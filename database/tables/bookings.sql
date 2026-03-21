CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(255),
  serviceId INT,
  vendorId VARCHAR(255),
  type ENUM('puja', 'darshan'),
  date DATE,
  timeSlot VARCHAR(50),
  status ENUM('pending', 'confirmed', 'completed', 'cancelled'),
  totalAmount DECIMAL(10, 2),
  FOREIGN KEY (userId) REFERENCES users(uid)
);
