CREATE DATABASE IF NOT EXISTS test_system;
USE test_system;

DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE user_roles (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    is_best_selling BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO roles (role_name) VALUES ('user'), ('vendor'), ('admin');

INSERT INTO users (name, email, password) VALUES 
('Devotee User', 'devotee@test.com', '123456'),
('Normal User', 'user@test.com', '123456'),
('Vendor User', 'vendor@test.com', '123456'),
('Admin User', 'admin@test.com', '123456');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r 
WHERE (u.email = 'devotee@test.com' AND r.role_name IN ('user', 'vendor'))
   OR (u.email = 'user@test.com' AND r.role_name = 'user')
   OR (u.email = 'vendor@test.com' AND r.role_name = 'vendor')
   OR (u.email = 'admin@test.com' AND r.role_name = 'admin');

INSERT INTO products (vendor_id, name, description, price, category, is_best_selling)
SELECT id, 'Tulsi Mala', 'Holy beads', 150.00, 'Pooja Items', true FROM users WHERE email = 'vendor@test.com'
UNION ALL
SELECT id, 'Incense Sticks', 'Rose fragrance', 50.00, 'Pooja Items', false FROM users WHERE email = 'vendor@test.com'
UNION ALL
SELECT id, 'Ganga Jal', 'Holy water', 100.00, 'Essentials', true FROM users WHERE email = 'devotee@test.com'
UNION ALL
SELECT id, 'Brass Diya', 'Traditional lamp', 250.00, 'Decor', false FROM users WHERE email = 'devotee@test.com';

SELECT 'DATABASE SETUP COMPLETE' AS Status;
SELECT u.name, u.email, GROUP_CONCAT(r.role_name SEPARATOR ', ') as assigned_roles
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
GROUP BY u.id;
