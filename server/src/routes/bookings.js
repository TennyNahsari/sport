const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all bookings with filters
router.get('/', async (req, res) => {
  try {
    const { date, court_id, booking_status, payment_status, search } = req.query;

    let query = `
      SELECT b.*, 
             c.name as court_name, 
             s.name as sport_name,
             s.icon as sport_icon,
             cust.name as customer_name,
             cust.phone as customer_phone,
             cust.email as customer_email
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      JOIN sports s ON c.sport_id = s.id
      JOIN customers cust ON b.customer_id = cust.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      params.push(date);
      query += ` AND b.booking_date = $${params.length}`;
    }

    if (court_id) {
      params.push(court_id);
      query += ` AND b.court_id = $${params.length}`;
    }

    if (booking_status) {
      params.push(booking_status.toLowerCase());
      query += ` AND LOWER(b.booking_status) = $${params.length}`;
    }

    if (payment_status) {
      params.push(payment_status.toLowerCase());
      query += ` AND LOWER(b.payment_status) = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      const pIdx = params.length;
      query += ` AND (cust.name ILIKE $${pIdx} OR cust.phone ILIKE $${pIdx} OR b.booking_code ILIKE $${pIdx})`;
    }

    query += ' ORDER BY b.booking_date DESC, b.start_time DESC';

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET check booking status by Booking Code or Phone Number
router.get('/check/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const result = await db.query(`
      SELECT b.*, 
             c.name as court_name, 
             c.price_per_hour,
             c.image_url as court_image,
             s.name as sport_name,
             cust.name as customer_name,
             cust.phone as customer_phone,
             cust.email as customer_email
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      JOIN sports s ON c.sport_id = s.id
      JOIN customers cust ON b.customer_id = cust.id
      WHERE b.booking_code ILIKE $1 OR cust.phone ILIKE $1
      ORDER BY b.created_at DESC
      LIMIT 1
    `, [code.trim()]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kode booking atau nomor WhatsApp tidak ditemukan.' });
    }

    const booking = result.rows[0];

    res.json({
      success: true,
      data: {
        ...booking,
        whatsapp_number: process.env.WHATSAPP_NUMBER || '6281234567890'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET grid calendar matrix view
router.get('/calendar', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const courtsRes = await db.query(`
      SELECT c.id, c.name, s.name as sport_name
      FROM courts c
      JOIN sports s ON c.sport_id = s.id
      WHERE c.status = 'active'
      ORDER BY s.display_order, c.id
    `);

    const bookingsRes = await db.query(`
      SELECT b.*, cust.name as customer_name
      FROM bookings b
      JOIN customers cust ON b.customer_id = cust.id
      WHERE b.booking_date = $1 AND LOWER(b.booking_status) NOT IN ('cancelled', 'finished', 'available')
    `, [targetDate]);

    const courts = courtsRes.rows;
    const bookings = bookingsRes.rows;

    const hours = [];
    for (let h = 8; h <= 22; h++) {
      hours.push(`${h.toString().padStart(2, '0')}:00`);
    }

    const grid = hours.map(hour => {
      const nextHour = `${(parseInt(hour.split(':')[0]) + 1).toString().padStart(2, '0')}:00`;
      
      const row = { time: hour };
      courts.forEach(court => {
        const booking = bookings.find(b => 
          b.court_id === court.id && 
          (hour < b.end_time && nextHour > b.start_time)
        );

        if (booking) {
          row[court.id] = {
            id: booking.id,
            status: 'Booked',
            booking_code: booking.booking_code,
            customer_name: booking.customer_name,
            payment_status: booking.payment_status,
            booking_status: booking.booking_status,
            payment_proof: booking.payment_proof
          };
        } else {
          row[court.id] = { status: 'Available' };
        }
      });

      return row;
    });

    res.json({
      success: true,
      data: {
        date: targetDate,
        courts,
        hours,
        grid
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST Create Booking
router.post('/', async (req, res) => {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const { court_id, booking_date, start_time, duration_hours, customer_name, customer_phone, customer_email, payment_status, booking_status } = req.body;

    const startHour = parseInt(start_time.split(':')[0]);
    const endHour = startHour + parseInt(duration_hours);
    if (endHour > 24) {
      throw new Error('Waktu selesai booking melebihi batas jam Operasional');
    }
    const end_time = `${endHour.toString().padStart(2, '0')}:00`;

    const courtRes = await client.query('SELECT * FROM courts WHERE id = $1 AND status = \'active\'', [court_id]);
    if (courtRes.rows.length === 0) {
      throw new Error('Lapangan tidak aktif atau tidak ditemukan');
    }
    const court = courtRes.rows[0];

    const conflictRes = await client.query(`
      SELECT id, booking_code, start_time, end_time
      FROM bookings
      WHERE court_id = $1 
        AND booking_date = $2 
        AND LOWER(booking_status) NOT IN ('cancelled', 'finished', 'available')
        AND (start_time < $3 AND end_time > $4)
    `, [court_id, booking_date, end_time, start_time]);

    if (conflictRes.rows.length > 0) {
      const conflict = conflictRes.rows[0];
      throw new Error(`DOUBLE_BOOKING_PREVENTED: Lapangan sudah dibooking pada ${conflict.start_time} - ${conflict.end_time} (${conflict.booking_code})`);
    }

    let customerRes;
    const cleanPhone = (customer_phone || '').trim();
    const cleanEmail = (customer_email || '').trim();
    const cleanName = (customer_name || '').trim();

    if (cleanEmail !== '') {
      customerRes = await client.query('SELECT * FROM customers WHERE phone = $1 OR email = $2', [cleanPhone, cleanEmail]);
    } else {
      customerRes = await client.query('SELECT * FROM customers WHERE phone = $1', [cleanPhone]);
    }

    let customer_id;

    if (customerRes.rows.length === 0) {
      const newCust = await client.query(
        'INSERT INTO customers (name, phone, email) VALUES ($1, $2, $3) RETURNING id',
        [cleanName, cleanPhone, cleanEmail]
      );
      customer_id = newCust.rows[0].id;
    } else {
      customer_id = customerRes.rows[0].id;
      await client.query('UPDATE customers SET name = $1, email = $2 WHERE id = $3', [
        cleanName,
        cleanEmail || customerRes.rows[0].email,
        customer_id
      ]);
    }

    const ymStr = booking_date ? booking_date.replace(/-/g, '').substring(0, 6) : new Date().toISOString().slice(0, 7).replace('-', '');
    const randomSeq = Math.floor(10000 + Math.random() * 90000);
    const booking_code = `SB-${ymStr}-${randomSeq}`;
    const total_price = court.price_per_hour * parseInt(duration_hours);
    const initialPaymentStatus = (payment_status || 'unpaid').toLowerCase();
    const initialBookingStatus = (booking_status || 'unpaid').toLowerCase();

    const newBookingRes = await client.query(`
      INSERT INTO bookings (
        booking_code, court_id, customer_id, booking_date, start_time, end_time,
        duration_hours, total_price, payment_status, booking_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [booking_code, court_id, customer_id, booking_date, start_time, end_time, parseInt(duration_hours), total_price, initialPaymentStatus, initialBookingStatus]);

    await client.query('COMMIT');

    const confirmedBooking = await db.query(`
      SELECT b.*, c.name as court_name, cust.name as customer_name, cust.phone as customer_phone
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      JOIN customers cust ON b.customer_id = cust.id
      WHERE b.id = $1
    `, [newBookingRes.rows[0].id]);

    res.status(201).json({
      success: true,
      data: {
        ...confirmedBooking.rows[0],
        whatsapp_number: process.env.WHATSAPP_NUMBER || '6281234567890'
      },
      message: 'Booking berhasil dikonfirmasi!'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    const isConflict = error.message.includes('DOUBLE_BOOKING_PREVENTED');
    res.status(isConflict ? 409 : 400).json({
      success: false,
      message: error.message.replace('DOUBLE_BOOKING_PREVENTED: ', '')
    });
  } finally {
    client.release();
  }
});

// PUT Upload Payment Proof by Customer
router.put('/:id/payment-proof', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_proof } = req.body;

    if (!payment_proof) {
      return res.status(400).json({ success: false, message: 'Bukti transfer tidak boleh kosong' });
    }

    await db.query(`
      UPDATE bookings
      SET payment_proof = $1
      WHERE id = $2
    `, [payment_proof, id]);

    const updatedRes = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
    res.json({
      data: updatedRes.rows[0],
      message: 'Bukti transfer berhasil terunggah! Staff akan segera melakukan verifikasi.'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE Payment Proof only (staff action)
router.delete('/:id/payment-proof', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE bookings SET payment_proof = NULL WHERE id = $1', [id]);
    res.json({
      success: true,
      message: 'Bukti pembayaran berhasil dihapus oleh staff.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT Update Booking Payment or Status (by Staff)
// Allowed booking statuses: unpaid, paid, occupied, available, cancelled
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, booking_status, payment_proof } = req.body;

    const currentRes = await db.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
    }
    const current = currentRes.rows[0];

    const newPayment = payment_status ? payment_status.toLowerCase() : current.payment_status;
    const newStatus = booking_status ? booking_status.toLowerCase() : current.booking_status;
    const newProof = payment_proof !== undefined ? payment_proof : current.payment_proof;

    await db.query('UPDATE bookings SET payment_status = $1, booking_status = $2, payment_proof = $3 WHERE id = $4', [newPayment, newStatus, newProof, id]);

    const updated = await db.query(`
      SELECT b.*, c.name as court_name, cust.name as customer_name
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      JOIN customers cust ON b.customer_id = cust.id
      WHERE b.id = $1
    `, [id]);

    res.json({ success: true, data: updated.rows[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE Booking (Permanent Delete or Cancel)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    if (permanent === 'true') {
      await db.query('DELETE FROM bookings WHERE id = $1', [id]);
      return res.json({ success: true, message: 'Booking telah dihapus secara permanen dari database.' });
    } else {
      await db.query("UPDATE bookings SET booking_status = 'cancelled' WHERE id = $1", [id]);
      return res.json({ success: true, message: 'Booking telah dibatalkan (Cancelled).' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
