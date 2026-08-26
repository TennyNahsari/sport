import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, User, Phone, Calendar, Clock } from 'lucide-react';

export default function ManualBookingModal({ onClose }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [courts, setCourts] = useState([]);
  const [selectedCourtId, setSelectedCourtId] = useState('');
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('19:00');
  const [durationHours, setDurationHours] = useState(1);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Paid'); // Staff usually collect payment upfront

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/courts?status=active')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data.length > 0) {
          setCourts(res.data);
          setSelectedCourtId(res.data[0].id);
        }
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          court_id: parseInt(selectedCourtId),
          booking_date: bookingDate,
          start_time: startTime,
          duration_hours: parseInt(durationHours),
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          payment_status: paymentStatus
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Gagal membuat manual booking.');
      }

      setSuccess(true);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
      <div className="bg-white rounded-card shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="font-extrabold text-base">Booking Manual (Input Staff / On-site)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded bg-slate-800 hover:bg-slate-700">
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-sportgreen mx-auto" />
              <h4 className="font-extrabold text-navy text-lg">Booking Manual Berhasil Dibuat!</h4>
              <p className="text-xs text-slate-500">Jadwal telah diperbarui di sistem dan kalender visual.</p>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-navy text-white text-xs font-bold rounded-button"
              >
                TUTUP
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {errorMessage && (
                <div className="p-3 rounded bg-red-50 text-red-700 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Lapangan *</label>
                <select
                  value={selectedCourtId}
                  onChange={(e) => setSelectedCourtId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-button font-bold text-navy bg-slate-50"
                >
                  {courts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.sport_name}) — Rp {c.price_per_hour.toLocaleString('id-ID')}/jam
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-button font-bold text-navy"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jam Mulai</label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-button font-bold text-navy"
                  >
                    {Array.from({ length: 15 }, (_, i) => {
                      const h = (8 + i).toString().padStart(2, '0');
                      return <option key={h} value={`${h}:00`}>{`${h}:00`}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Durasi</label>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    className="w-full px-3 py-2 border rounded-button font-bold text-navy"
                  >
                    <option value={1}>1 Jam</option>
                    <option value={2}>2 Jam</option>
                    <option value={3}>3 Jam</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <span className="font-extrabold text-navy block">Data Customer (Walk-in / Telepon)</span>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Nama Customer *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-button font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">No HP / WhatsApp *</label>
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0812..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-3 py-2 border rounded-button font-medium font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Status Pembayaran</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full px-3 py-2 border rounded-button font-bold"
                    >
                      <option value="Paid">Paid (Lunas)</option>
                      <option value="Unpaid">Unpaid (Belum Bayar)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 font-bold rounded-button text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-primary text-white font-extrabold rounded-button shadow-md"
                >
                  {loading ? 'Menyimpan...' : 'SIMPAN BOOKING MANUAL'}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
