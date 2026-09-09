const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');

// GET all users with outlet info
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT u.id,
             u.username,
             u.name,
             u.role,
             u.outlet_id,
             u.status,
             u.created_at,
             o.name as outlet_name,
             o.address as outlet_address
      FROM users u
      LEFT JOIN outlets o ON u.outlet_id = o.id
      ORDER BY u.id ASC
    `;
    const result = await db.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single user
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT u.id,
             u.username,
             u.name,
             u.role,
             u.outlet_id,
             u.status,
             u.created_at,
             o.name as outlet_name
      FROM users u
      LEFT JOIN outlets o ON u.outlet_id = o.id
      WHERE u.id = $1
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create user
router.post('/', async (req, res) => {
  try {
    const { username, password, name, role, outlet_id, status } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ success: false, message: 'Username, password, dan nama wajib diisi' });
    }

    // Check username uniqueness
    const checkUser = await db.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [username.trim()]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedOutlet = role === 'admin' ? null : (outlet_id ? parseInt(outlet_id) : null);

    const result = await db.query(`
      INSERT INTO users (username, password, name, role, outlet_id, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, name, role, outlet_id, status, created_at
    `, [username.trim().toLowerCase(), hashedPassword, name.trim(), role || 'operator', assignedOutlet, status || 'active']);

    res.status(201).json({ success: true, data: result.rows[0], message: 'User berhasil dibuat' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, name, role, outlet_id, status } = req.body;

    const existing = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Check username uniqueness if changed
    if (username && username.trim().toLowerCase() !== existing.rows[0].username.toLowerCase()) {
      const checkUser = await db.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2', [username.trim(), id]);
      if (checkUser.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
      }
    }

    const assignedOutlet = role === 'admin' ? null : (outlet_id ? parseInt(outlet_id) : null);

    let query = '';
    let params = [];

    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      query = `
        UPDATE users
        SET username = $1, password = $2, name = $3, role = $4, outlet_id = $5, status = $6
        WHERE id = $7
        RETURNING id, username, name, role, outlet_id, status, created_at
      `;
      params = [
        username ? username.trim().toLowerCase() : existing.rows[0].username,
        hashedPassword,
        name ? name.trim() : existing.rows[0].name,
        role || existing.rows[0].role,
        assignedOutlet,
        status || existing.rows[0].status,
        id
      ];
    } else {
      query = `
        UPDATE users
        SET username = $1, name = $2, role = $3, outlet_id = $4, status = $5
        WHERE id = $6
        RETURNING id, username, name, role, outlet_id, status, created_at
      `;
      params = [
        username ? username.trim().toLowerCase() : existing.rows[0].username,
        name ? name.trim() : existing.rows[0].name,
        role || existing.rows[0].role,
        assignedOutlet,
        status || existing.rows[0].status,
        id
      ];
    }

    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows[0], message: 'User berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === 1) {
      return res.status(400).json({ success: false, message: 'Super Admin utama tidak dapat dihapus' });
    }

    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
