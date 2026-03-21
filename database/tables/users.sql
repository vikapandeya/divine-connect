CREATE TABLE IF NOT EXISTS users (
  uid VARCHAR(255) PRIMARY KEY,
  displayName VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  photoURL TEXT,
  role ENUM('devotee', 'vendor', 'admin') DEFAULT 'devotee',
  createdAt DATETIME
);
