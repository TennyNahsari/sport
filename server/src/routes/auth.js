const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Staff / Admin Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const userRes = await db.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);

    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const user = userRes.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        token: `token-${user.id}-${Date.now()}`
      },
      message: 'Login berhasil!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
