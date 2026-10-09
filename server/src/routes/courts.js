const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../db/database');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper to delete local court image file from disk if stored in /uploads/
function deleteLocalCourtImage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return;
  
  let filename = '';
  if (imageUrl.startsWith('/uploads/')) {
    filename = path.basename(imageUrl);
  } else if (imageUrl.includes('/uploads/')) {
    filename = imageUrl.split('/uploads/').pop();
  }

  if (filename) {
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`[Courts] Deleted court image file: ${filePath}`);
      } catch (err) {
        console.error('[Courts] Failed to delete court image file:', err.message);
      }
    }
  }
}

// Helper to process base64 image or keep URL
function processCourtImageUrl(imageUrl) {
  if (imageUrl && typeof imageUrl === 'string' && (imageUrl.startsWith('data:image/') || imageUrl.includes(';base64,'))) {
    const parts = imageUrl.split(';base64,');
    const header = parts[0];
    const base64Data = parts[1];

    let ext = 'png';
    if (header.includes('jpeg') || header.includes('jpg')) ext = 'jpg';
    else if (header.includes('webp')) ext = 'webp';
    else if (header.includes('svg')) ext = 'svg';
    else if (header.includes('gif')) ext = 'gif';

    const fileName = `court_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    fs.writeFileSync(filePath, Buffer.from(base64Data.trim(), 'base64'));
    console.log(`[Courts] Successfully saved uploaded court image: ${filePath}`);
    return `/uploads/${fileName}`;
  }
  return imageUrl;
}

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

    let finalImageUrl = processCourtImageUrl(image_url);
    if (!finalImageUrl) {
      finalImageUrl = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80';
    }

    const result = await db.query(`
      INSERT INTO courts (sport_id, outlet_id, name, price_per_hour, image_url, facilities, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [sport_id, outlet_id ? parseInt(outlet_id) : null, name, price_per_hour, finalImageUrl, facilitiesJson, status || 'active', created_by ? parseInt(created_by) : null]);

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

    const current = await db.query('SELECT * FROM courts WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lapangan tidak ditemukan' });
    }

    const cur = current.rows[0];

    let finalImageUrl = cur.image_url;
    if (image_url !== undefined) {
      if (typeof image_url === 'string' && (image_url.startsWith('data:image/') || image_url.includes(';base64,'))) {
        deleteLocalCourtImage(cur.image_url);
        finalImageUrl = processCourtImageUrl(image_url);
      } else {
        if (image_url !== cur.image_url) {
          deleteLocalCourtImage(cur.image_url);
        }
        finalImageUrl = image_url;
      }
    }

    const result = await db.query(`
      UPDATE courts
      SET sport_id = $1, outlet_id = $2, name = $3, price_per_hour = $4, image_url = $5, facilities = $6, status = $7,
          created_by = COALESCE($8, created_by)
      WHERE id = $9
      RETURNING *
    `, [sport_id, outlet_id ? parseInt(outlet_id) : null, name, price_per_hour, finalImageUrl, facilitiesJson, status, created_by ? parseInt(created_by) : null, id]);

    res.json({ success: true, data: formatCourt(result.rows[0]) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE court
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const current = await db.query('SELECT * FROM courts WHERE id = $1', [id]);
    if (current.rows.length > 0) {
      deleteLocalCourtImage(current.rows[0].image_url);
    }

    await db.query('DELETE FROM courts WHERE id = $1', [id]);
    res.json({ success: true, message: 'Lapangan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
