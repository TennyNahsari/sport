const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');

// Staff / Admin Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const userRes = await db.query(`
      SELECT u.*, o.name as outlet_name, o.address as outlet_address
      FROM users u
      LEFT JOIN outlets o ON u.outlet_id = o.id
      WHERE LOWER(u.username) = LOWER($1)
    `, [username ? username.trim() : '']);

    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const user = userRes.rows[0];

    if (user.status && user.status.toLowerCase() === 'inactive') {
      return res.status(403).json({ success: false, message: 'Akun Anda sedang dinonaktifkan. Hubungi Admin.' });
    }

    // Cek password menggunakan bcrypt (atau fallback plaintext untuk kompatibilitas data lama)
    const isMatch = await bcrypt.compare(password, user.password) || user.password === password;

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        outlet_id: user.outlet_id,
        outlet_name: user.outlet_name,
        outlet_address: user.outlet_address,
        status: user.status || 'active',
        token: `token-${user.id}-${Date.now()}`
      },
      message: 'Login berhasil!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
