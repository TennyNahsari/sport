const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { runMigrationAndSeed } = require('./db/database');

const sportsRoutes = require('./routes/sports');
const courtsRoutes = require('./routes/courts');
const bookingsRoutes = require('./routes/bookings');
const reportsRoutes = require('./routes/reports');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/api/sports', sportsRoutes);
app.use('/api/courts', courtsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sports Court Rental API (PostgreSQL) is running smoothly' });
});

// Run migration & seeder before listening
runMigrationAndSeed()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[SportBook Backend] Connected to PostgreSQL on ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
      console.log(`[SportBook Backend] Running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[SportBook Backend] Failed to migrate/connect PostgreSQL database:', err.message);
    // Still start server to allow error inspection
    app.listen(PORT, () => {
      console.log(`[SportBook Backend] Server listening on http://localhost:${PORT} (PostgreSQL Pending)`);
    });
  });
