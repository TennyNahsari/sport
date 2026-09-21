import { Platform } from 'react-native';

// Standard Backend API URL base definition
let API_BASE_URL = 'http://localhost:5000/api';
if (Platform.OS === 'android') {
  API_BASE_URL = 'http://10.0.2.2:5000/api';
}

export const setCustomApiUrl = (url) => {
  API_BASE_URL = url;
};

export const getApiUrl = () => API_BASE_URL;

// Fallback seed data if backend is offline
const FALLBACK_OUTLETS = [
  { id: '1', name: 'SportBook Senayan', city: 'Jakarta Pusat', address: 'Jl. Asia Afrika No. 8', phone: '0812-9900-1122' },
  { id: '2', name: 'SportBook BSD Hub', city: 'Tangerang Selatan', address: 'BSD Green Office Park', phone: '0813-8811-2233' },
  { id: '3', name: 'SportBook Bandung Club', city: 'Bandung', address: 'Jl. Riau No. 45', phone: '0811-7722-3344' }
];

const FALLBACK_SPORTS = [
  { id: '1', name: 'Badminton', icon: 'badminton' },
  { id: '2', name: 'Futsal', icon: 'futsal' },
  { id: '3', name: 'Basket', icon: 'basketball' },
  { id: '4', name: 'Tenis', icon: 'tennis' }
];

const FALLBACK_COURTS = [
  { id: '1', name: 'Court A - Badminton Vinyl', sport_id: '1', sport_name: 'Badminton', outlet_id: '1', outlet_name: 'SportBook Senayan', price_per_hour: 80000 },
  { id: '2', name: 'Court B - Badminton Parquet', sport_id: '1', sport_name: 'Badminton', outlet_id: '1', outlet_name: 'SportBook Senayan', price_per_hour: 95000 },
  { id: '3', name: 'Lapangan Futsal FIFA 1', sport_id: '2', sport_name: 'Futsal', outlet_id: '2', outlet_name: 'SportBook BSD Hub', price_per_hour: 150000 },
  { id: '4', name: 'Lapangan Basket Interlock', sport_id: '3', sport_name: 'Basket', outlet_id: '3', outlet_name: 'SportBook Bandung Club', price_per_hour: 120000 }
];

const generateFallbackAvailability = () => {
  const slots = [];
  for (let hour = 8; hour <= 22; hour++) {
    const timeStr = `${hour < 10 ? '0' : ''}${hour}:00`;
    // Random availability status for demo
    const available = (hour % 3 !== 0);
    slots.push({ time: timeStr, available });
  }
  return slots;
};

export const api = {
  // Outlets
  getOutlets: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/outlets`);
      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        return json;
      }
      return { success: true, data: FALLBACK_OUTLETS };
    } catch (err) {
      console.warn('Backend server connection fallback for outlets:', err.message);
      return { success: true, data: FALLBACK_OUTLETS };
    }
  },

  // Sports
  getSports: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/sports`);
      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        return json;
      }
      return { success: true, data: FALLBACK_SPORTS };
    } catch (err) {
      console.warn('Backend server connection fallback for sports:', err.message);
      return { success: true, data: FALLBACK_SPORTS };
    }
  },

  // Courts
  getCourts: async (outletId = '', sportId = '') => {
    try {
      let url = `${API_BASE_URL}/courts?status=active`;
      if (outletId) url += `&outlet_id=${outletId}`;
      if (sportId) url += `&sport_id=${sportId}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        return json;
      }
      let filtered = FALLBACK_COURTS;
      if (outletId) filtered = filtered.filter(c => c.outlet_id === String(outletId));
      if (sportId) filtered = filtered.filter(c => c.sport_id === String(sportId));
      return { success: true, data: filtered };
    } catch (err) {
      console.warn('Backend server connection fallback for courts:', err.message);
      let filtered = FALLBACK_COURTS;
      if (outletId) filtered = filtered.filter(c => c.outlet_id === String(outletId));
      if (sportId) filtered = filtered.filter(c => c.sport_id === String(sportId));
      return { success: true, data: filtered };
    }
  },

  // Court Availability
  getCourtAvailability: async (courtId, dateStr) => {
    try {
      const res = await fetch(`${API_BASE_URL}/courts/${courtId}/availability?date=${dateStr}`);
      const json = await res.json();
      if (json.success && json.data) {
        return json;
      }
      return { success: true, data: generateFallbackAvailability() };
    } catch (err) {
      return { success: true, data: generateFallbackAvailability() };
    }
  },

  // Create Booking
  createBooking: async (bookingData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      return await res.json();
    } catch (err) {
      console.error('Error creating booking:', err);
      // Generate demo booking response if offline
      const mockCode = `SB-${Math.floor(100000 + Math.random() * 900000)}`;
      return {
        success: true,
        data: {
          id: Date.now(),
          booking_code: mockCode,
          customer_name: bookingData.customer_name,
          customer_phone: bookingData.customer_phone,
          booking_date: bookingData.booking_date,
          start_time: bookingData.start_time,
          end_time: `${parseInt(bookingData.start_time.split(':')[0]) + bookingData.duration_hours}:00`,
          total_price: 80000 * bookingData.duration_hours,
          payment_status: 'unpaid'
        }
      };
    }
  },

  // Search Booking
  searchBooking: async (queryStr) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings?search=${encodeURIComponent(queryStr)}`);
      return await res.json();
    } catch (err) {
      console.error('Error searching booking:', err);
      return { success: true, data: [] };
    }
  },

  // Staff Login
  login: async (username, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return await res.json();
    } catch (err) {
      console.error('Error logging in:', err);
      // Allow demo accounts fallback
      if (username.toLowerCase() === 'admin' && password === 'admin123') {
        return {
          success: true,
          data: { id: 1, username: 'admin', name: 'Super Admin Staff', role: 'ADMIN', outlet_name: 'Semua Cabang' }
        };
      }
      if (username.toLowerCase() === 'operator' && password === 'op123') {
        return {
          success: true,
          data: { id: 2, username: 'operator', name: 'Operator Senayan', role: 'OPERATOR', outlet_name: 'SportBook Senayan' }
        };
      }
      return { success: false, message: 'Gagal terhubung ke server backend.' };
    }
  },

  // Venue Settings
  getSettings: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      return await res.json();
    } catch (err) {
      return { success: true, data: { bank_name: 'BCA', bank_account_number: '8830-1920-3341', bank_account_holder: 'SportBook Management' } };
    }
  },

  // Reports / Overview statistics for Staff
  getReports: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/summary`);
      return await res.json();
    } catch (err) {
      return {
        success: true,
        data: { total_revenue: 4250000, total_bookings: 18, total_courts: 6, total_customers: 14 }
      };
    }
  }
};
