const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sport',
  user: process.env.DB_USER || 'sport',
  password: process.env.DB_PASSWORD || 'sport',
});

async function runMigrationAndSeed() {
  console.log('[PostgreSQL] Connecting to PostgreSQL database...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS outlets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(50),
        image_url TEXT,
        description TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sports (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(100) NOT NULL,
        description TEXT,
        display_order INT DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS courts (
        id SERIAL PRIMARY KEY,
        sport_id INT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
        outlet_id INT REFERENCES outlets(id) ON DELETE SET NULL,
        name VARCHAR(150) NOT NULL,
        price_per_hour INT NOT NULL,
        image_url TEXT NOT NULL,
        facilities JSONB NOT NULL,
        status VARCHAR(20) DEFAULT 'active'
      );

      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(150),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

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

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(150) NOT NULL,
        role VARCHAR(50) DEFAULT 'operator',
        outlet_id INT REFERENCES outlets(id) ON DELETE SET NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT
      );

      ALTER TABLE courts ADD COLUMN IF NOT EXISTS outlet_id INT REFERENCES outlets(id) ON DELETE SET NULL;
      ALTER TABLE courts ADD COLUMN IF NOT EXISTS created_by INT REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS outlet_id INT REFERENCES outlets(id) ON DELETE SET NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_proof TEXT;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMP;
      ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
      ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_booking_status_check;
      ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_booking_code_key;
      ALTER TABLE courts DROP CONSTRAINT IF EXISTS courts_status_check;
    `);

    console.log('[PostgreSQL] Migration completed successfully.');

    // Seed outlets if empty
    const outletsRes = await client.query('SELECT COUNT(*) FROM outlets');
    if (parseInt(outletsRes.rows[0].count) === 0) {
      console.log('[PostgreSQL] Seeding outlets data...');
      const outletsData = [
        [1, 'Cilandak Sport Center', 'Jl. Cilandak KKO No. 12, Pasar Minggu, Jakarta Selatan', '081299887766', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', 'Kompleks olahraga terpadu di Cilandak dengan arena badminton karpet BWF, lapangan padel panoramic, dan fasilitas shower AC.', 'active'],
        [2, 'Kemang Sport Arena', 'Jl. Kemang Raya No. 45, Mampang Prapatan, Jakarta Selatan', '081388776655', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80', 'Pusat olahraga futsal vinyl interlock, meja tenis meja ITTF, dan area cafe di kawasan strategis Kemang.', 'active'],
        [3, 'Senayan Sports Hub', 'Jl. Asia Afrika No. 8, Gelora, Tanah Abang, Jakarta Pusat', '081122334455', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80', 'Arena olahraga bergengsi di Senayan dengan stadion mini soccer 7v7 FIFA grade dan lapangan tenis pro hard & clay court.', 'active']
      ];

      for (const o of outletsData) {
        await client.query(
          'INSERT INTO outlets (id, name, address, phone, image_url, description, status) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
          o
        );
      }
      await client.query("SELECT setval('outlets_id_seq', (SELECT COALESCE(MAX(id), 1) FROM outlets))");
    }

    // Seed sports if empty
    const sportsRes = await client.query('SELECT COUNT(*) FROM sports');
    if (parseInt(sportsRes.rows[0].count) === 0) {
      console.log('[PostgreSQL] Seeding sports data...');
      const sportsData = [
        ['badminton', 'Badminton', 'Trophy', 'Lapangan karpet & kayu berkualitas tinggi dengan penerangan LED standar turnamen', 1],
        ['padel', 'Padel', 'Award', 'Lapangan padel panoramic modern dengan rumput sintetis premium', 2],
        ['pingpong', 'Pingpong', 'Disc', 'Meja tennis meja standar ITTF dengan ruangan ber-AC nyaman', 3],
        ['futsal', 'Futsal', 'Activity', 'Lapangan futsal vinyl & rumput sintetis dengan jaring pengaman full', 4],
        ['minisoccer', 'Minisoccer', 'Compass', 'Lapangan mini soccer 7v7 rumput sintetis FIFA grade', 5],
        ['tenis', 'Tenis', 'Target', 'Lapangan tenis hardcourt & clay court outdoor/indoor dengan pencahayaan malam', 6]
      ];

      for (const s of sportsData) {
        await client.query(
          'INSERT INTO sports (slug, name, icon, description, display_order) VALUES ($1, $2, $3, $4, $5)',
          s
        );
      }
    }

    // Seed admin and operator users first so courts can reference created_by
    const usersRes = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(usersRes.rows[0].count) === 0) {
      console.log('[PostgreSQL] Seeding staff users (admin & outlet operators)...');
      const adminPassHash = await bcrypt.hash('admin123', 10);
      const cilandakPassHash = await bcrypt.hash('cilandak123', 10);
      const kemangPassHash = await bcrypt.hash('kemang123', 10);
      const senayanPassHash = await bcrypt.hash('senayan123', 10);
      const operatorPassHash = await bcrypt.hash('operator123', 10);

      await client.query('INSERT INTO users (id, username, password, name, role, outlet_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7)', [1, 'admin', adminPassHash, 'Super Admin', 'admin', null, 'active']);
      await client.query('INSERT INTO users (id, username, password, name, role, outlet_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7)', [2, 'cilandak_staff', cilandakPassHash, 'Staff Cilandak', 'operator', 1, 'active']);
      await client.query('INSERT INTO users (id, username, password, name, role, outlet_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7)', [3, 'kemang_staff', kemangPassHash, 'Staff Kemang', 'operator', 2, 'active']);
      await client.query('INSERT INTO users (id, username, password, name, role, outlet_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7)', [4, 'senayan_staff', senayanPassHash, 'Staff Senayan', 'operator', 3, 'active']);
      await client.query('INSERT INTO users (id, username, password, name, role, outlet_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7)', [5, 'operator', operatorPassHash, 'Venue Operator (Cilandak)', 'operator', 1, 'active']);
      await client.query("SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users))");
    } else {
      // Ensure existing users have outlet assignment if missing
      await client.query(`
        UPDATE users SET outlet_id = 1 WHERE username = 'operator' AND outlet_id IS NULL;
      `);
    }

    // Seed courts if empty
    const courtsRes = await client.query('SELECT COUNT(*) FROM courts');
    if (parseInt(courtsRes.rows[0].count) === 0) {
      console.log('[PostgreSQL] Seeding courts data...');
      const courtsData = [
        [1, 1, 1, 'Badminton Court 01', 80000, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Indoor', 'AC', 'Wooden Floor', 'Standard LED']), 'active', 1],
        [2, 1, 1, 'Badminton Court 02', 80000, 'https://images.unsplash.com/photo-1521537634581-0ddea2eed258?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Indoor', 'Rubber Mat', 'Pro Lighting']), 'active', 1],
        [3, 1, 1, 'Badminton Court 03 (VIP)', 110000, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', JSON.stringify(['VIP Lounge', 'AC', 'Yonex Flooring', 'Shower']), 'active', 1],
        [4, 2, 1, 'Padel Court Alpha', 220000, 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Panoramic Glass', 'Mondo Turf', 'Night Floodlight']), 'active', 1],
        [5, 2, 1, 'Padel Court Beta', 200000, 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Outdoor Covered', 'Pro Turf', 'Resto Bar Access']), 'active', 1],
        [6, 3, 2, 'Pingpong Table A1', 45000, 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80', JSON.stringify(['DHS ITTF Table', 'Air Conditioned', 'Robot Trainer Option']), 'active', 1],
        [7, 3, 2, 'Pingpong Table A2', 45000, 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Butterfly Table', 'AC', 'Private Space']), 'active', 1],
        [8, 4, 2, 'Futsal Arena 01', 180000, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Interlock Floor', 'Digital Scoreboard', 'Sound System']), 'active', 1],
        [9, 4, 2, 'Futsal Arena 02', 160000, 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Synthetic Grass', 'Safety Netting', 'Bleachers']), 'active', 1],
        [10, 5, 3, 'Mini Soccer Stadium', 450000, 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80', JSON.stringify(['7v7 Pitch', 'Monofilament Turf', 'VAR Ready Camera', 'Locker Room']), 'active', 1],
        [11, 6, 3, 'Tennis Court Center', 150000, 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Hard Court', 'Tournament Floodlight', 'Umpire Chair']), 'active', 1],
        [12, 6, 3, 'Tennis Court Clay', 170000, 'https://images.unsplash.com/photo-1530915534664-4ac6423ca938?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Red Clay Surface', 'Shaded Seating', 'Pro Ball Machine']), 'active', 1]
      ];

      for (const c of courtsData) {
        await client.query(
          'INSERT INTO courts (id, sport_id, outlet_id, name, price_per_hour, image_url, facilities, status, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
          c
        );
      }
      await client.query("SELECT setval('courts_id_seq', (SELECT COALESCE(MAX(id), 1) FROM courts))");
    } else {
      // Ensure existing courts have outlet_id and created_by assigned if null
      await client.query(`
        UPDATE courts SET outlet_id = 1 WHERE outlet_id IS NULL AND id IN (1, 2, 3, 4, 5);
        UPDATE courts SET outlet_id = 2 WHERE outlet_id IS NULL AND id IN (6, 7, 8, 9);
        UPDATE courts SET outlet_id = 3 WHERE outlet_id IS NULL AND id IN (10, 11, 12);
        UPDATE courts SET outlet_id = 1 WHERE outlet_id IS NULL;
        UPDATE courts SET created_by = 1 WHERE created_by IS NULL;
      `);
    }

    // Seed default settings if empty
    const settingsRes = await client.query('SELECT COUNT(*) FROM settings');
    if (parseInt(settingsRes.rows[0].count) === 0) {
      console.log('[PostgreSQL] Seeding default venue settings (bank & QRIS)...');
      const defaultSettings = [
        ['bank_name', 'BCA'],
        ['bank_account_number', '8830-1920-3341'],
        ['bank_account_holder', 'SportBook Venue Management'],
        ['qris_merchant_name', 'SportBook Venue QRIS'],
        ['qris_image_url', ''],
        ['whatsapp_number', '6281234567890'],
        ['instagram_url', 'https://instagram.com'],
        ['twitter_url', 'https://x.com'],
        ['youtube_url', 'https://youtube.com'],
        ['facebook_url', 'https://facebook.com'],
        ['linkedin_url', 'https://linkedin.com'],
        ['threads_url', 'https://threads.net'],
        ['payment_limit_hours', '1']
      ];
      for (const [key, value] of defaultSettings) {
        await client.query('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [key, value]);
      }
    }

    await client.query('COMMIT');
    console.log('[PostgreSQL] Migration & seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[PostgreSQL] Migration/Seeding Error:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runMigrationAndSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { pool, runMigrationAndSeed };
