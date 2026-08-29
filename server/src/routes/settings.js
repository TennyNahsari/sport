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

// Helper to delete local QRIS image file from disk
function deleteLocalQrisFile(qrisUrl) {
  if (!qrisUrl || typeof qrisUrl !== 'string') return;
  
  let filename = '';
  if (qrisUrl.startsWith('/uploads/')) {
    filename = path.basename(qrisUrl);
  } else if (qrisUrl.includes('/uploads/')) {
    filename = qrisUrl.split('/uploads/').pop();
  }

  if (filename) {
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`[Settings] Deleted QRIS image file: ${filePath}`);
      } catch (err) {
        console.error('[Settings] Failed to delete QRIS file:', err.message);
      }
    }
  }
}

// GET venue settings
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT key, value FROM settings');
    const settings = {
      bank_name: 'BCA',
      bank_account_number: '8830-1920-3341',
      bank_account_holder: 'SportBook Venue Management',
      qris_merchant_name: 'SportBook Venue QRIS',
      qris_image_url: '',
      whatsapp_number: '6281234567890',
      instagram_url: 'https://instagram.com',
      twitter_url: 'https://x.com',
      youtube_url: 'https://youtube.com',
      facebook_url: 'https://facebook.com',
      linkedin_url: 'https://linkedin.com',
      threads_url: 'https://threads.net'
    };

    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update venue settings (Bank & QRIS & WA & Social Media)
router.post('/', async (req, res) => {
  res.redirect(307, '/api/settings');
});

router.put('/', async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const {
      bank_name,
      bank_account_number,
      bank_account_holder,
      qris_merchant_name,
      whatsapp_number,
      instagram_url,
      twitter_url,
      youtube_url,
      facebook_url,
      linkedin_url,
      threads_url,
      qris_image, // Base64 data string or empty
      qris_action // 'delete' or 'update' or empty
    } = req.body;

    // Fetch existing settings to check current qris_image_url
    const currentQrisRes = await client.query("SELECT value FROM settings WHERE key = 'qris_image_url'");
    const currentQrisUrl = currentQrisRes.rows.length > 0 ? currentQrisRes.rows[0].value : '';

    let newQrisUrl = currentQrisUrl;

    // Action 1: Delete QRIS
    if (qris_action === 'delete') {
      deleteLocalQrisFile(currentQrisUrl);
      newQrisUrl = '';
    } 
    // Action 2: Update QRIS (New Base64 image uploaded)
    else if (qris_image && typeof qris_image === 'string' && qris_image.includes(';base64,')) {
      // 1. Delete old file if exists
      deleteLocalQrisFile(currentQrisUrl);

      // 2. Parse Base64 extension & buffer safely
      const parts = qris_image.split(';base64,');
      const header = parts[0];
      const base64Data = parts[1];

      let ext = 'png';
      if (header.includes('jpeg') || header.includes('jpg')) ext = 'jpg';
      else if (header.includes('webp')) ext = 'webp';
      else if (header.includes('svg')) ext = 'svg';
      else if (header.includes('gif')) ext = 'gif';

      const fileName = `qris_${Date.now()}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, fileName);

      fs.writeFileSync(filePath, Buffer.from(base64Data.trim(), 'base64'));
      newQrisUrl = `/uploads/${fileName}`;
      console.log(`[Settings] Successfully saved QRIS image: ${filePath}`);
    }

    // Save key-value settings to database
    const settingsToUpdate = {
      bank_name: bank_name !== undefined ? bank_name : 'BCA',
      bank_account_number: bank_account_number !== undefined ? bank_account_number : '8830-1920-3341',
      bank_account_holder: bank_account_holder !== undefined ? bank_account_holder : 'SportBook Venue Management',
      qris_merchant_name: qris_merchant_name !== undefined ? qris_merchant_name : 'SportBook Venue QRIS',
      whatsapp_number: whatsapp_number !== undefined ? whatsapp_number.replace(/[^0-9]/g, '') : '6281234567890',
      instagram_url: instagram_url !== undefined ? instagram_url : 'https://instagram.com',
      twitter_url: twitter_url !== undefined ? twitter_url : 'https://x.com',
      youtube_url: youtube_url !== undefined ? youtube_url : 'https://youtube.com',
      facebook_url: facebook_url !== undefined ? facebook_url : 'https://facebook.com',
      linkedin_url: linkedin_url !== undefined ? linkedin_url : 'https://linkedin.com',
      threads_url: threads_url !== undefined ? threads_url : 'https://threads.net',
      qris_image_url: newQrisUrl
    };

    for (const [key, val] of Object.entries(settingsToUpdate)) {
      await client.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        [key, val]
      );
    }

    await client.query('COMMIT');

    // Retrieve updated settings
    const updatedRes = await db.query('SELECT key, value FROM settings');
    const updatedSettings = {};
    updatedRes.rows.forEach(row => {
      updatedSettings[row.key] = row.value;
    });

    res.json({
      success: true,
      data: updatedSettings,
      message: 'Pengaturan metode pembayaran (Bank & QRIS) berhasil diperbarui!'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;
