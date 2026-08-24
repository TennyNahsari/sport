const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all sports
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sports ORDER BY display_order ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new sport
router.post('/', async (req, res) => {
  try {
    const { name, icon, description, slug } = req.body;
    const sportSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

    const result = await db.query(
      'INSERT INTO sports (slug, name, icon, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [sportSlug, name, icon || 'Trophy', description || '']
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update sport
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, description } = req.body;

    const result = await db.query(
      'UPDATE sports SET name = $1, icon = $2, description = $3 WHERE id = $4 RETURNING *',
      [name, icon, description, id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE sport
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM sports WHERE id = $1', [id]);
    res.json({ success: true, message: 'Sport category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
