const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all outlets with court count
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT o.*, 
             COUNT(c.id) as courts_count,
             COALESCE(JSON_AGG(JSON_BUILD_OBJECT('id', c.id, 'name', c.name, 'sport_id', c.sport_id, 'status', c.status)) FILTER (WHERE c.id IS NOT NULL), '[]') as courts_preview
      FROM outlets o
      LEFT JOIN courts c ON o.id = c.outlet_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND o.status = $${params.length}`;
    }

    query += ' GROUP BY o.id ORDER BY o.id ASC';

    const result = await db.query(query, params);
    const outlets = result.rows.map(o => ({
      ...o,
      courts_count: parseInt(o.courts_count || 0)
    }));

    res.json({ success: true, data: outlets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single outlet by id with courts
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const outletRes = await db.query('SELECT * FROM outlets WHERE id = $1', [id]);

    if (outletRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Outlet tidak ditemukan' });
    }

    const outlet = outletRes.rows[0];

    const courtsRes = await db.query(`
      SELECT c.*, s.name as sport_name, s.slug as sport_slug
      FROM courts c
      JOIN sports s ON c.sport_id = s.id
      WHERE c.outlet_id = $1
      ORDER BY c.id ASC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...outlet,
        courts: courtsRes.rows.map(c => ({
          ...c,
          facilities: typeof c.facilities === 'string' ? JSON.parse(c.facilities || '[]') : c.facilities
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new outlet
router.post('/', async (req, res) => {
  try {
    const { name, address, phone, image_url, description, status } = req.body;

    if (!name || !address) {
      return res.status(400).json({ success: false, message: 'Nama dan alamat outlet wajib diisi.' });
    }

    const result = await db.query(`
      INSERT INTO outlets (name, address, phone, image_url, description, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      name.trim(),
      address.trim(),
      (phone || '').trim(),
      image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      description || '',
      status || 'active'
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Outlet baru berhasil ditambahkan!'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update outlet
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, image_url, description, status } = req.body;

    const current = await db.query('SELECT * FROM outlets WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Outlet tidak ditemukan' });
    }

    const cur = current.rows[0];

    const result = await db.query(`
      UPDATE outlets
      SET name = $1, address = $2, phone = $3, image_url = $4, description = $5, status = $6
      WHERE id = $7
      RETURNING *
    `, [
      name !== undefined ? name.trim() : cur.name,
      address !== undefined ? address.trim() : cur.address,
      phone !== undefined ? phone.trim() : cur.phone,
      image_url !== undefined ? image_url : cur.image_url,
      description !== undefined ? description : cur.description,
      status !== undefined ? status : cur.status,
      id
    ]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Data outlet berhasil diperbarui!'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE outlet
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if outlet exists
    const current = await db.query('SELECT * FROM outlets WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Outlet tidak ditemukan' });
    }

    // Set outlet_id to NULL on courts before deleting
    await db.query('UPDATE courts SET outlet_id = NULL WHERE outlet_id = $1', [id]);

    await db.query('DELETE FROM outlets WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Outlet berhasil dihapus. Lapangan terkait kini berstatus unassigned.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
