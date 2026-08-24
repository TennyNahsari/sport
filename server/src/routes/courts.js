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
    const { sport_id, status } = req.query;
    let query = `
      SELECT c.*, s.name as sport_name, s.slug as sport_slug
      FROM courts c
      JOIN sports s ON c.sport_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (sport_id) {
      params.push(sport_id);
      query += ` AND c.sport_id = $${params.length}`;
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
      SELECT c.*, s.name as sport_name
      FROM courts c
      JOIN sports s ON c.sport_id = s.id
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
    const { sport_id, name, price_per_hour, image_url, facilities, status } = req.body;
    const facilitiesJson = JSON.stringify(Array.isArray(facilities) ? facilities : [facilities]);

    const result = await db.query(`
      INSERT INTO courts (sport_id, name, price_per_hour, image_url, facilities, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [sport_id, name, price_per_hour, image_url, facilitiesJson, status || 'active']);

    res.status(201).json({ success: true, data: formatCourt(result.rows[0]) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update court
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sport_id, name, price_per_hour, image_url, facilities, status } = req.body;
    const facilitiesJson = JSON.stringify(Array.isArray(facilities) ? facilities : [facilities]);

    const result = await db.query(`
      UPDATE courts
      SET sport_id = $1, name = $2, price_per_hour = $3, image_url = $4, facilities = $5, status = $6
      WHERE id = $7
      RETURNING *
    `, [sport_id, name, price_per_hour, image_url, facilitiesJson, status, id]);

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
