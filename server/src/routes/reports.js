const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET dashboard overview metrics
router.get('/dashboard', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const todayBookingsRes = await db.query(`
      SELECT COUNT(*) as count FROM bookings 
      WHERE booking_date = $1 AND LOWER(booking_status) NOT IN ('cancelled', 'available')
    `, [todayStr]);

    const todayRevenueRes = await db.query(`
      SELECT COALESCE(SUM(total_price), 0) as total FROM bookings 
      WHERE booking_date = $1 AND LOWER(booking_status) NOT IN ('cancelled', 'available') AND LOWER(payment_status) = 'paid'
    `, [todayStr]);

    const totalCourtsRes = await db.query(`SELECT COUNT(*) as count FROM courts WHERE status = 'active'`);

    const occupiedCourtsRes = await db.query(`
      SELECT COUNT(DISTINCT court_id) as count FROM bookings 
      WHERE booking_date = $1 AND LOWER(booking_status) NOT IN ('cancelled', 'available')
    `, [todayStr]);

    const todayBookingsCount = parseInt(todayBookingsRes.rows[0].count);
    const todayRevenue = parseInt(todayRevenueRes.rows[0].total);
    const totalCourtsCount = parseInt(totalCourtsRes.rows[0].count);
    const occupiedCourtsToday = parseInt(occupiedCourtsRes.rows[0].count);

    const occupancyPercentage = totalCourtsCount > 0 ? Math.round((occupiedCourtsToday / totalCourtsCount) * 100) : 0;

    const bookingsBySportRes = await db.query(`
      SELECT s.name as sport_name, COUNT(b.id) as booking_count, COALESCE(SUM(b.total_price), 0) as total_revenue
      FROM sports s
      LEFT JOIN courts c ON s.id = c.sport_id
      LEFT JOIN bookings b ON c.id = b.court_id AND LOWER(b.booking_status) NOT IN ('cancelled', 'available')
      GROUP BY s.id, s.name
      ORDER BY booking_count DESC
    `);

    const bookingsByCourtRes = await db.query(`
      SELECT c.name as court_name, s.name as sport_name, COUNT(b.id) as booking_count, COALESCE(SUM(b.total_price), 0) as total_revenue
      FROM courts c
      JOIN sports s ON c.sport_id = s.id
      LEFT JOIN bookings b ON c.id = b.court_id AND LOWER(b.booking_status) NOT IN ('cancelled', 'available')
      GROUP BY c.id, c.name, s.name
      ORDER BY total_revenue DESC
    `);

    const upcomingBookingsRes = await db.query(`
      SELECT b.*, c.name as court_name, s.name as sport_name, cust.name as customer_name, cust.phone as customer_phone
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      JOIN sports s ON c.sport_id = s.id
      JOIN customers cust ON b.customer_id = cust.id
      WHERE b.booking_date >= $1 AND LOWER(b.booking_status) NOT IN ('cancelled', 'available')
      ORDER BY b.booking_date ASC, b.start_time ASC
      LIMIT 6
    `, [todayStr]);

    res.json({
      success: true,
      data: {
        todayBookings: todayBookingsCount,
        todayRevenue,
        totalCourts: totalCourtsCount,
        occupiedCourts: occupiedCourtsToday,
        availableCourts: totalCourtsCount - occupiedCourtsToday,
        occupancyRate: occupancyPercentage,
        bookingsBySport: bookingsBySportRes.rows.map(r => ({ ...r, booking_count: parseInt(r.booking_count), total_revenue: parseInt(r.total_revenue) })),
        bookingsByCourt: bookingsByCourtRes.rows.map(r => ({ ...r, booking_count: parseInt(r.booking_count), total_revenue: parseInt(r.total_revenue) })),
        upcomingBookings: upcomingBookingsRes.rows
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET customers list
router.get('/customers', async (req, res) => {
  try {
    const customersRes = await db.query(`
      SELECT c.*, 
             COUNT(b.id) as total_bookings, 
             COALESCE(SUM(b.total_price), 0) as total_spent
      FROM customers c
      LEFT JOIN bookings b ON c.id = b.customer_id AND LOWER(b.booking_status) NOT IN ('cancelled', 'available')
      GROUP BY c.id
      ORDER BY total_spent DESC
    `);

    res.json({
      success: true,
      data: customersRes.rows.map(c => ({
        ...c,
        total_bookings: parseInt(c.total_bookings),
        total_spent: parseInt(c.total_spent)
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE customer by ID (staff action)
router.delete('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM customers WHERE id = $1', [id]);
    res.json({
      success: true,
      message: 'Data customer beserta seluruh riwayat bookingnya berhasil dihapus.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
