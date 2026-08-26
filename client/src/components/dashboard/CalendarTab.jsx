import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Filter, CheckCircle2, User, XCircle, Trash2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function CalendarTab() {
  const { t } = useLanguage();
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchCalendar = () => {
    setLoading(true);
    fetch(`/api/bookings/calendar?date=${selectedDate}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) setCalendarData(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCalendar();
  }, [selectedDate]);

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_status: status })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedBooking(null);
        fetchCalendar();
      }
    } catch (e) {
      alert('Gagal mengupdate status');
    }
  };

  const handleHardDeleteBooking = async (bookingId, bookingCode) => {
    if (!confirm(`PERINGATAN: Hapus permanen booking ${bookingCode} dari PostgreSQL? Slot jam akan langsung tersedia kembali.`)) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}?permanent=true`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSelectedBooking(null);
        fetchCalendar();
      }
    } catch (e) {
      alert('Gagal menghapus booking');
    }
  };

  const getStatusBadgeStyle = (statusStr) => {
    const s = (statusStr || '').toLowerCase();
    switch (s) {
      case 'paid': return 'bg-blue-100 text-primary';
      case 'unpaid': return 'bg-amber-100 text-amber-800';
      case 'occupied': return 'bg-orange-100 text-orange-700 font-extrabold';
      case 'available': return 'bg-sportgreen-light text-sportgreen';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Calendar Bar */}
      <div className="bg-white p-4 rounded-card border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-navy text-lg">{t('visualCalendarTitle')}</h3>
          <p className="text-xs text-slate-500">{t('visualCalendarSub')}</p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <CalendarIcon className="w-4 h-4 text-primary" /> {t('labelDate')}:
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-button text-xs font-extrabold text-navy cursor-pointer"
          />
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white rounded-card border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-bold">{t('loadingCalendar')}</div>
        ) : !calendarData ? null : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-navy text-white font-bold">
                  <th className="p-3 sticky left-0 bg-navy z-10 w-24">{t('hourHeader')}</th>
                  {calendarData.courts.map((court) => (
                    <th key={court.id} className="p-3 border-l border-slate-800 text-center min-w-[140px]">
                      <div>{court.name}</div>
                      <div className="text-[10px] font-normal text-slate-400">{court.sport_name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {calendarData.grid.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    
                    {/* Hour Column */}
                    <td className="p-3 font-mono font-bold text-navy sticky left-0 bg-white shadow-sm border-r border-slate-200">
                      {row.time}
                    </td>

                    {/* Court Slots */}
                    {calendarData.courts.map((court) => {
                      const slotInfo = row[court.id];
                      const isBooked = slotInfo && slotInfo.status === 'Booked';

                      return (
                        <td key={court.id} className="p-2 border-l border-slate-100 text-center">
                          {isBooked ? (
                            <button
                              onClick={() => setSelectedBooking({ ...slotInfo, court_name: court.name, time: row.time })}
                              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded border border-slate-300 text-[11px] font-bold shadow-2xs text-center transition-all cursor-pointer group"
                              title="Klik untuk ubah status atau hapus booking"
                            >
                              <div className="text-navy group-hover:text-primary truncate font-extrabold">{slotInfo.customer_name}</div>
                              <div className="text-[10px] font-mono text-primary">{slotInfo.booking_code}</div>
                              <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${getStatusBadgeStyle(slotInfo.booking_status)}`}>
                                {slotInfo.booking_status || slotInfo.payment_status}
                              </span>
                            </button>
                          ) : (
                            <div className="bg-sportgreen-light text-sportgreen p-2 rounded border border-sportgreen/20 font-bold text-[11px]">
                              {t('statusAvailable')}
                            </div>
                          )}
                        </td>
                      );
                    })}

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Booking Detail & Quick Status Change Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
          <div className="bg-white rounded-card shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-navy text-base">{t('manageBookingStatusTitle')}</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-navy">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-navy">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">{t('tableBookingCode')}:</span>
                <span className="font-mono font-bold text-primary">{selectedBooking.booking_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">{t('tableCustomer')}:</span>
                <span className="font-bold">{selectedBooking.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">{t('tableCourtSport')}:</span>
                <span className="font-bold">{selectedBooking.court_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">{t('currentStatusLabel')}</span>
                <select
                  value={(selectedBooking.booking_status || 'paid').toLowerCase()}
                  onChange={(e) => handleUpdateBookingStatus(selectedBooking.id, e.target.value)}
                  className="px-2 py-1 border rounded text-xs font-bold text-navy bg-slate-50"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="occupied">Occupied (Sedang Pakai)</option>
                  <option value="available">Available (Bebaskan Slot)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between items-center">
              <button
                onClick={() => handleHardDeleteBooking(selectedBooking.id, selectedBooking.booking_code)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 font-bold rounded-button text-xs transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> {t('btnDeletePermanent')}
              </button>

              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-navy text-white font-bold rounded-button text-xs"
              >
                {t('finishBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
