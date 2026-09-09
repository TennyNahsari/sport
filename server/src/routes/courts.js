const express = require('express');
const router = express.Router();
const db = require('../db/database');

const formatCourt = (court) => ({
  ...court,
  facilities: typeof court.facilities === 'string' ? JSON.parse(court.facilities || '[]') : court.facilities
});

// GET all courts
router.get('/', async (req, res) => {
  try {
    const { sport_id, outlet_id, status, created_by, scope_user_id, scope_outlet_id } = req.query;
    let query = `
      SELECT c.*, 
             s.name as sport_name, 
             s.slug as sport_slug,
             o.name as outlet_name,
             o.address as outlet_address,
             o.phone as outlet_phone,
             u.name as creator_name,
             u.username as creator_username,
             u.role as creator_role
      FROM courts c
      JOIN sports s ON c.sport_id = s.id
      LEFT JOIN outlets o ON c.outlet_id = o.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (sport_id) {
      params.push(sport_id);
      query += ` AND c.sport_id = $${params.length}`;
    }

    if (outlet_id) {
      params.push(outlet_id);
      query += ` AND c.outlet_id = $${params.length}`;
    }

    if (created_by) {
      params.push(created_by);
      query += ` AND c.created_by = $${params.length}`;
    }

    // Strict Operator Scoping:
    // If scope_user_id & scope_outlet_id are provided:
    // Only show courts in that outlet created by THIS user OR created by admin / unassigned
    if (scope_outlet_id && scope_user_id) {
      params.push(scope_outlet_id);
      const pOutlet = `$${params.length}`;
      params.push(scope_user_id);
      const pUser = `$${params.length}`;
      query += ` AND c.outlet_id = ${pOutlet} AND (c.created_by = ${pUser} OR u.role = 'admin' OR c.created_by IS NULL)`;
    }

    if (status) {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }

    query += ' ORDER BY c.id ASC';

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows.map(formatCourt) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single court with availability slots for a date
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const courtRes = await db.query(`
      SELECT c.*, 
             s.name as sport_name, 
             s.slug as sport_slug,
             o.name as outlet_name,
             o.address as outlet_address,
             o.phone as outlet_phone,
             u.name as creator_name
      FROM courts c
      JOIN sports s ON c.sport_id = s.id
      LEFT JOIN outlets o ON c.outlet_id = o.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = $1
    `, [id]);

    if (courtRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lapangan tidak ditemukan' });
    }

    const court = courtRes.rows[0];

    const bookingsRes = await db.query(`
      SELECT start_time, end_time, booking_status
      FROM bookings
      WHERE court_id = $1 AND booking_date = $2 AND LOWER(booking_status) NOT IN ('cancelled', 'finished', 'available')
    `, [id, targetDate]);

    const bookings = bookingsRes.rows;

    const timeSlots = [];
    for (let hour = 8; hour < 23; hour++) {
      const startStr = `${hour.toString().padStart(2, '0')}:00`;
      const endStr = `${(hour + 1).toString().padStart(2, '0')}:00`;

      const isBooked = bookings.some(b => (startStr < b.end_time && endStr > b.start_time));

      timeSlots.push({
        time: startStr,
        endTime: endStr,
        status: isBooked ? 'Booked' : 'Available'
      });
    }

    res.json({
      success: true,
      data: {
        court: formatCourt(court),
        date: targetDate,
        slots: timeSlots
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new court
router.post('/', async (req, res) => {
  try {
    const { sport_id, outlet_id, name, price_per_hour, image_url, facilities, status, created_by } = req.body;
    const facilitiesJson = JSON.stringify(Array.isArray(facilities) ? facilities : [facilities]);

    const result = await db.query(`
      INSERT INTO courts (sport_id, outlet_id, name, price_per_hour, image_url, facilities, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [sport_id, outlet_id ? parseInt(outlet_id) : null, name, price_per_hour, image_url, facilitiesJson, status || 'active', created_by ? parseInt(created_by) : null]);

    res.status(201).json({ success: true, data: formatCourt(result.rows[0]) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update court
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sport_id, outlet_id, name, price_per_hour, image_url, facilities, status, created_by } = req.body;
    const facilitiesJson = JSON.stringify(Array.isArray(facilities) ? facilities : [facilities]);

    const result = await db.query(`
      UPDATE courts
      SET sport_id = $1, outlet_id = $2, name = $3, price_per_hour = $4, image_url = $5, facilities = $6, status = $7,
          created_by = COALESCE($8, created_by)
      WHERE id = $9
      RETURNING *
    `, [sport_id, outlet_id ? parseInt(outlet_id) : null, name, price_per_hour, image_url, facilitiesJson, status, created_by ? parseInt(created_by) : null, id]);

    res.json({ success: true, data: formatCourt(result.rows[0]) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE court
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM courts WHERE id = $1', [id]);
    res.json({ success: true, message: 'Lapangan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
