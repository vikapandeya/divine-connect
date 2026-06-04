-- Migration: Add performance indexes on high-query foreign key columns
-- Run after 001_add_missing_columns_and_yatras.sql on any existing database.

-- Products
CREATE INDEX IF NOT EXISTS idx_products_vendorId   ON products(vendorId);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category);

-- Pujas
CREATE INDEX IF NOT EXISTS idx_pujas_vendorId      ON pujas(vendorId);

-- Yatras
CREATE INDEX IF NOT EXISTS idx_yatras_vendorId     ON yatras(vendorId);

-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_userId     ON bookings(userId);
CREATE INDEX IF NOT EXISTS idx_bookings_vendorId   ON bookings(vendorId);
CREATE INDEX IF NOT EXISTS idx_bookings_serviceId  ON bookings(serviceId);
CREATE INDEX IF NOT EXISTS idx_bookings_status     ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date       ON bookings(date);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_userId       ON orders(userId);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_createdAt    ON orders(createdAt);

-- Order Items
CREATE INDEX IF NOT EXISTS idx_order_items_orderId    ON order_items(orderId);
CREATE INDEX IF NOT EXISTS idx_order_items_productId  ON order_items(productId);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_userId   ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_read     ON notifications(`read`);

-- WhatsApp Bookings
CREATE INDEX IF NOT EXISTS idx_wa_bookings_userId     ON whatsapp_bookings(userId);
CREATE INDEX IF NOT EXISTS idx_wa_bookings_vendorId   ON whatsapp_bookings(vendorId);

-- Vendor Transactions
CREATE INDEX IF NOT EXISTS idx_vendor_tx_vendorId     ON vendor_transactions(vendorId);
CREATE INDEX IF NOT EXISTS idx_vendor_tx_createdAt    ON vendor_transactions(createdAt);

-- Naam Jap
CREATE INDEX IF NOT EXISTS idx_naam_jap_userId        ON naam_jap(userId);
CREATE INDEX IF NOT EXISTS idx_naam_jap_date          ON naam_jap(date);

-- Feedback
CREATE INDEX IF NOT EXISTS idx_feedback_vendorId      ON feedback(vendorId);
CREATE INDEX IF NOT EXISTS idx_feedback_serviceId     ON feedback(serviceId);
CREATE INDEX IF NOT EXISTS idx_feedback_userId        ON feedback(userId);
