const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET dashboard overview metrics
router.get('/dashboard', async (req, res) => {
  try {
    const { outlet_id } = req.query;
    const todayStr = new Date().toISOString().split('T')[0];

    let todayBookingsQuery = `
      SELECT COUNT(b.id) as count 
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      WHERE b.booking_date = $1 AND LOWER(b.booking_status) NOT IN ('cancelled', 'available')
    `;
    const todayBookingsParams = [todayStr];
    if (outlet_id) {
      todayBookingsParams.push(outlet_id);
      todayBookingsQuery += ` AND c.outlet_id = $${todayBookingsParams.length}`;
    }
    const todayBookingsRes = await db.query(todayBookingsQuery, todayBookingsParams);

    let todayRevenueQuery = `
      SELECT COALESCE(SUM(b.total_price), 0) as total 
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      WHERE b.booking_date = $1 AND LOWER(b.booking_status) NOT IN ('cancelled', 'available') AND LOWER(b.payment_status) = 'paid'
    `;
    const todayRevenueParams = [todayStr];
    if (outlet_id) {
      todayRevenueParams.push(outlet_id);
      todayRevenueQuery += ` AND c.outlet_id = $${todayRevenueParams.length}`;
    }
    const todayRevenueRes = await db.query(todayRevenueQuery, todayRevenueParams);

    let totalCourtsQuery = `SELECT COUNT(*) as count FROM courts WHERE status = 'active'`;
    const totalCourtsParams = [];
    if (outlet_id) {
      totalCourtsParams.push(outlet_id);
      totalCourtsQuery += ` AND outlet_id = $1`;
    }
    const totalCourtsRes = await db.query(totalCourtsQuery, totalCourtsParams);

    let occupiedCourtsQuery = `
      SELECT COUNT(DISTINCT b.court_id) as count 
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      WHERE b.booking_date = $1 AND LOWER(b.booking_status) NOT IN ('cancelled', 'available')
    `;
    const occupiedCourtsParams = [todayStr];
    if (outlet_id) {
      occupiedCourtsParams.push(outlet_id);
      occupiedCourtsQuery += ` AND c.outlet_id = $${occupiedCourtsParams.length}`;
    }
    const occupiedCourtsRes = await db.query(occupiedCourtsQuery, occupiedCourtsParams);

    const todayBookingsCount = parseInt(todayBookingsRes.rows[0].count);
    const todayRevenue = parseInt(todayRevenueRes.rows[0].total);
    const totalCourtsCount = parseInt(totalCourtsRes.rows[0].count);
    const occupiedCourtsToday = parseInt(occupiedCourtsRes.rows[0].count);

    const occupancyPercentage = totalCourtsCount > 0 ? Math.round((occupiedCourtsToday / totalCourtsCount) * 100) : 0;

    let bookingsBySportQuery = `
      SELECT s.name as sport_name, COUNT(b.id) as booking_count, COALESCE(SUM(b.total_price), 0) as total_revenue
      FROM sports s
      LEFT JOIN courts c ON s.id = c.sport_id
      LEFT JOIN bookings b ON c.id = b.court_id AND LOWER(b.booking_status) NOT IN ('cancelled', 'available')
      WHERE 1=1
    `;
    const sportParams = [];
    if (outlet_id) {
      sportParams.push(outlet_id);
      bookingsBySportQuery += ` AND c.outlet_id = $1`;
    }
    bookingsBySportQuery += `
      GROUP BY s.id, s.name
      ORDER BY booking_count DESC
    `;
    const bookingsBySportRes = await db.query(bookingsBySportQuery, sportParams);

    let bookingsByCourtQuery = `
      SELECT c.name as court_name, s.name as sport_name, o.name as outlet_name, COUNT(b.id) as booking_count, COALESCE(SUM(b.total_price), 0) as total_revenue
      FROM courts c
      JOIN sports s ON c.sport_id = s.id
      LEFT JOIN outlets o ON c.outlet_id = o.id
      LEFT JOIN bookings b ON c.id = b.court_id AND LOWER(b.booking_status) NOT IN ('cancelled', 'available')
      WHERE 1=1
    `;
    const courtParams = [];
    if (outlet_id) {
      courtParams.push(outlet_id);
      bookingsByCourtQuery += ` AND c.outlet_id = $1`;
    }
    bookingsByCourtQuery += `
      GROUP BY c.id, c.name, s.name, o.name
      ORDER BY total_revenue DESC
    `;
    const bookingsByCourtRes = await db.query(bookingsByCourtQuery, courtParams);

    let upcomingBookingsQuery = `
      SELECT b.*, c.name as court_name, o.name as outlet_name, s.name as sport_name, cust.name as customer_name, cust.phone as customer_phone
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      LEFT JOIN outlets o ON c.outlet_id = o.id
      JOIN sports s ON c.sport_id = s.id
      JOIN customers cust ON b.customer_id = cust.id
      WHERE b.booking_date >= $1 AND LOWER(b.booking_status) NOT IN ('cancelled', 'available')
    `;
    const upcomingParams = [todayStr];
    if (outlet_id) {
      upcomingParams.push(outlet_id);
      upcomingBookingsQuery += ` AND c.outlet_id = $2`;
    }
    upcomingBookingsQuery += `
      ORDER BY b.booking_date ASC, b.start_time ASC
      LIMIT 6
    `;
    const upcomingBookingsRes = await db.query(upcomingBookingsQuery, upcomingParams);

    res.json({
      success: true,
      data: {
        todayBookings: todayBookingsCount,
        todayRevenue,
        totalCourts: totalCourtsCount,
        occupiedCourts: occupiedCourtsToday,
        availableCourts: Math.max(0, totalCourtsCount - occupiedCourtsToday),
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
