-- Migration: Add missing columns and yatras table
-- Run this on any existing database that was provisioned before this migration.

-- Add paidAmount and totalAmount to whatsapp_bookings
ALTER TABLE whatsapp_bookings
  ADD COLUMN IF NOT EXISTS totalAmount DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paidAmount DECIMAL(10,2) DEFAULT 0;

-- Add missing columns to feedback
ALTER TABLE feedback
  ADD COLUMN IF NOT EXISTS userId VARCHAR(255),
  ADD COLUMN IF NOT EXISTS serviceId VARCHAR(255),
  ADD COLUMN IF NOT EXISTS vendorId VARCHAR(255),
  ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS imageURL TEXT;

-- Create yatras table if it does not exist
CREATE TABLE IF NOT EXISTS yatras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendorId VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  duration VARCHAR(100),
  location VARCHAR(255),
  category VARCHAR(100),
  rating DECIMAL(3,2) DEFAULT 0,
  images JSON,
  itinerary JSON,
  included JSON,
  excluded JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
