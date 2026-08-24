const { Pool } = require('pg');
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
        name VARCHAR(150) NOT NULL,
        price_per_hour INT NOT NULL,
        image_url TEXT NOT NULL,
        facilities JSONB NOT NULL,
        status VARCHAR(20) CHECK(status IN ('active', 'inactive')) DEFAULT 'active'
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
        booking_code VARCHAR(50) UNIQUE NOT NULL,
        court_id INT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
        customer_id INT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        booking_date VARCHAR(20) NOT NULL,
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        duration_hours INT NOT NULL,
        total_price INT NOT NULL,
        payment_status VARCHAR(20) DEFAULT 'unpaid',
        payment_proof TEXT,
        booking_status VARCHAR(20) DEFAULT 'unpaid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(150) NOT NULL,
        role VARCHAR(50) DEFAULT 'staff'
      );

      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_proof TEXT;
      ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
      ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_booking_status_check;
    `);

    console.log('[PostgreSQL] Migration completed successfully.');

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

    // Seed courts if empty
    const courtsRes = await client.query('SELECT COUNT(*) FROM courts');
    if (parseInt(courtsRes.rows[0].count) === 0) {
      console.log('[PostgreSQL] Seeding courts data...');
      const courtsData = [
        [1, 'Badminton Court 01', 80000, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Indoor', 'AC', 'Wooden Floor', 'Standard LED']), 'active'],
        [1, 'Badminton Court 02', 80000, 'https://images.unsplash.com/photo-1521537634581-0ddea2eed258?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Indoor', 'Rubber Mat', 'Pro Lighting']), 'active'],
        [1, 'Badminton Court 03 (VIP)', 110000, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', JSON.stringify(['VIP Lounge', 'AC', 'Yonex Flooring', 'Shower']), 'active'],
        [2, 'Padel Court Alpha', 220000, 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Panoramic Glass', 'Mondo Turf', 'Night Floodlight']), 'active'],
        [2, 'Padel Court Beta', 200000, 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Outdoor Covered', 'Pro Turf', 'Resto Bar Access']), 'active'],
        [3, 'Pingpong Table A1', 45000, 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80', JSON.stringify(['DHS ITTF Table', 'Air Conditioned', 'Robot Trainer Option']), 'active'],
        [3, 'Pingpong Table A2', 45000, 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Butterfly Table', 'AC', 'Private Space']), 'active'],
        [4, 'Futsal Arena 01', 180000, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Interlock Floor', 'Digital Scoreboard', 'Sound System']), 'active'],
        [4, 'Futsal Arena 02', 160000, 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Synthetic Grass', 'Safety Netting', 'Bleachers']), 'active'],
        [5, 'Mini Soccer Stadium', 450000, 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80', JSON.stringify(['7v7 Pitch', 'Monofilament Turf', 'VAR Ready Camera', 'Locker Room']), 'active'],
        [6, 'Tennis Court Center', 150000, 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Hard Court', 'Tournament Floodlight', 'Umpire Chair']), 'active'],
        [6, 'Tennis Court Clay', 170000, 'https://images.unsplash.com/photo-1530915534664-4ac6423ca938?auto=format&fit=crop&w=800&q=80', JSON.stringify(['Red Clay Surface', 'Shaded Seating', 'Pro Ball Machine']), 'active']
      ];

      for (const c of courtsData) {
        await client.query(
          'INSERT INTO courts (sport_id, name, price_per_hour, image_url, facilities, status) VALUES ($1, $2, $3, $4, $5, $6)',
          c
        );
      }
    }

    // Seed bookings if empty
    const bookingsRes = await client.query('SELECT COUNT(*) FROM bookings');
    if (parseInt(bookingsRes.rows[0].count) === 0) {
      console.log('[PostgreSQL] Seeding initial customer & booking records...');
      const cust1 = await client.query('INSERT INTO customers (name, phone, email) VALUES ($1, $2, $3) RETURNING id', ['Budi Santoso', '081234567890', 'budi@gmail.com']);
      const cust2 = await client.query('INSERT INTO customers (name, phone, email) VALUES ($1, $2, $3) RETURNING id', ['Siti Rahma', '081987654321', 'siti@yahoo.com']);
      const cust3 = await client.query('INSERT INTO customers (name, phone, email) VALUES ($1, $2, $3) RETURNING id', ['Rian Pratama', '085711223344', 'rian@outlook.com']);

      const todayStr = new Date().toISOString().split('T')[0];

      const ymSeed = todayStr.replace(/-/g, '').substring(0, 6);
      await client.query(`
        INSERT INTO bookings (booking_code, court_id, customer_id, booking_date, start_time, end_time, duration_hours, total_price, payment_status, booking_status)
        VALUES 
        ('SB-' || $4 || '-1001', 1, $1, $5, '19:00', '21:00', 2, 160000, 'paid', 'paid'),
        ('SB-' || $4 || '-1002', 2, $2, $5, '18:00', '19:00', 1, 80000, 'paid', 'paid'),
        ('SB-' || $4 || '-1003', 4, $3, $5, '20:00', '22:00', 2, 440000, 'unpaid', 'unpaid')
      `, [cust1.rows[0].id, cust2.rows[0].id, cust3.rows[0].id, ymSeed, todayStr]);
    }

    // Seed admin and operator users
    const usersRes = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(usersRes.rows[0].count) === 0) {
      console.log('[PostgreSQL] Seeding staff users (admin & operator)...');
      await client.query('INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4)', ['admin', 'admin123', 'Super Admin', 'admin']);
      await client.query('INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4)', ['operator', 'op123', 'Venue Operator', 'operator']);
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
