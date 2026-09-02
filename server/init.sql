-- ============================================================
-- INIT DATABASE & SCHEMA UNTUK APLIKASI SPORTBOOK (POSTGRESQL)
-- ============================================================

-- 1. TABEL SPORTS (Cabang Olahraga)
CREATE TABLE IF NOT EXISTS sports (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0
);

-- 2. TABEL COURTS (Lapangan)
CREATE TABLE IF NOT EXISTS courts (
  id SERIAL PRIMARY KEY,
  sport_id INT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  price_per_hour INT NOT NULL,
  image_url TEXT NOT NULL,
  facilities JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'active'
);

-- 3. TABEL CUSTOMERS (Pelanggan)
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL BOOKINGS (Pemesanan Lapangan)
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  booking_code VARCHAR(50) NOT NULL,
  court_id INT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  booking_date VARCHAR(20) NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  duration_hours INT NOT NULL,
  total_price INT NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'unpaid',
  payment_proof TEXT,
  payment_deadline TIMESTAMP,
  booking_status VARCHAR(20) DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABEL USERS (Admin / Operator / Staff)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(50) DEFAULT 'staff'
);

-- 6. TABEL SETTINGS (Pengaturan Tempat & Pembayaran)
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT
);

-- ============================================================
-- INSERT SEED DATA (USER ADMIN, SPORTS, COURTS & SETTINGS)
-- ============================================================

-- Insert Admin & Operator User dengan Passwords Bcrypt Hashed:
-- admin    : admin123 -> $2b$10$wOpg7x95grL3FqD0J6ZNbe2lMSHIEG81iuHlB0NVcEEgQ8Uggsb76
-- operator : op123    -> $2b$10$/zONVBMzfjDp3k6STm8r/eJFGTZLNcfqB6h0.MLqD8596fkk2kNG6
INSERT INTO users (username, password, name, role) VALUES 
('admin', '$2b$10$wOpg7x95grL3FqD0J6ZNbe2lMSHIEG81iuHlB0NVcEEgQ8Uggsb76', 'Super Admin', 'admin'),
('operator', '$2b$10$/zONVBMzfjDp3k6STm8r/eJFGTZLNcfqB6h0.MLqD8596fkk2kNG6', 'Venue Operator', 'operator')
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password, name = EXCLUDED.name, role = EXCLUDED.role;

-- Insert Data Sports
INSERT INTO sports (slug, name, icon, description, display_order) VALUES
('badminton', 'Badminton', 'Trophy', 'Lapangan karpet & kayu berkualitas tinggi dengan penerangan LED standar turnamen', 1),
('padel', 'Padel', 'Award', 'Lapangan padel panoramic modern dengan rumput sintetis premium', 2),
('pingpong', 'Pingpong', 'Disc', 'Meja tennis meja standar ITTF dengan ruangan ber-AC nyaman', 3),
('futsal', 'Futsal', 'Activity', 'Lapangan futsal vinyl & rumput sintetis dengan jaring pengaman full', 4),
('minisoccer', 'Minisoccer', 'Compass', 'Lapangan mini soccer 7v7 rumput sintetis FIFA grade', 5),
('tenis', 'Tenis', 'Target', 'Lapangan tenis hardcourt & clay court outdoor/indoor dengan pencahayaan malam', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert Data Courts (Lapangan)
INSERT INTO courts (id, sport_id, name, price_per_hour, image_url, facilities, status) VALUES
(1, 1, 'Badminton Court 01', 80000, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', '["Indoor", "AC", "Wooden Floor", "Standard LED"]'::jsonb, 'active'),
(2, 1, 'Badminton Court 02', 80000, 'https://images.unsplash.com/photo-1521537634581-0ddea2eed258?auto=format&fit=crop&w=800&q=80', '["Indoor", "Rubber Mat", "Pro Lighting"]'::jsonb, 'active'),
(3, 1, 'Badminton Court 03 (VIP)', 110000, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', '["VIP Lounge", "AC", "Yonex Flooring", "Shower"]'::jsonb, 'active'),
(4, 2, 'Padel Court Alpha', 220000, 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80', '["Panoramic Glass", "Mondo Turf", "Night Floodlight"]'::jsonb, 'active'),
(5, 2, 'Padel Court Beta', 200000, 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80', '["Outdoor Covered", "Pro Turf", "Resto Bar Access"]'::jsonb, 'active'),
(6, 3, 'Pingpong Table A1', 45000, 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80', '["DHS ITTF Table", "Air Conditioned", "Robot Trainer Option"]'::jsonb, 'active'),
(7, 3, 'Pingpong Table A2', 45000, 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?auto=format&fit=crop&w=800&q=80', '["Butterfly Table", "AC", "Private Space"]'::jsonb, 'active'),
(8, 4, 'Futsal Arena 01', 180000, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80', '["Interlock Floor", "Digital Scoreboard", "Sound System"]'::jsonb, 'active'),
(9, 4, 'Futsal Arena 02', 160000, 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80', '["Synthetic Grass", "Safety Netting", "Bleachers"]'::jsonb, 'active'),
(10, 5, 'Mini Soccer Stadium', 450000, 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80', '["7v7 Pitch", "Monofilament Turf", "VAR Ready Camera", "Locker Room"]'::jsonb, 'active'),
(11, 6, 'Tennis Court Center', 150000, 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80', '["Hard Court", "Tournament Floodlight", "Umpire Chair"]'::jsonb, 'active'),
(12, 6, 'Tennis Court Clay', 170000, 'https://images.unsplash.com/photo-1530915534664-4ac6423ca938?auto=format&fit=crop&w=800&q=80', '["Red Clay Surface", "Shaded Seating", "Pro Ball Machine"]'::jsonb, 'active')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence untuk courts id
SELECT setval('courts_id_seq', (SELECT MAX(id) FROM courts));

-- Insert Data Settings awal
INSERT INTO settings (key, value) VALUES 
('bank_name', 'BCA'),
('bank_account_number', '8830-1920-3341'),
('bank_account_holder', 'SportBook Venue Management'),
('qris_merchant_name', 'SportBook Venue QRIS'),
('qris_image_url', ''),
('whatsapp_number', '6281234567890'),
('instagram_url', 'https://instagram.com'),
('twitter_url', 'https://x.com'),
('youtube_url', 'https://youtube.com'),
('facebook_url', 'https://facebook.com'),
('linkedin_url', 'https://linkedin.com'),
('threads_url', 'https://threads.net'),
('payment_limit_hours', '1')
ON CONFLICT (key) DO NOTHING;
