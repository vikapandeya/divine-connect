CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT,
  productId INT,
  quantity INT,
  price DECIMAL(10, 2),
  FOREIGN KEY (orderId) REFERENCES orders(id)
);
