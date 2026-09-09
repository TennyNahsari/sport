import React, { useState, useEffect } from 'react';
import { Search, Filter, PlusCircle, CheckCircle, XCircle, DollarSign, Calendar, Eye, Image as ImageIcon, Trash2, ShieldAlert, ChevronLeft, ChevronRight, ExternalLink, Download, FileSpreadsheet, X, Clock, RefreshCw, Printer, MessageCircle, Building2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { exportToCsv } from '../../utils/excelExport';
import { getWaUrl } from '../../utils/whatsapp';
import PrintReceiptModal from './PrintReceiptModal';

export default function BookingsTab({ onOpenManualBooking, filterPaymentOnly, currentUser }) {
  const { t } = useLanguage();
  const todayStr = new Date().toISOString().split('T')[0];
  const isAdmin = currentUser?.role === 'admin' || !currentUser?.outlet_id;
  const userOutletId = currentUser?.outlet_id ? String(currentUser.outlet_id) : '';

  const [bookings, setBookings] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [outletFilter, setOutletFilter] = useState(userOutletId);
  const [paymentFilter, setPaymentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(filterPaymentOnly ? 'finished' : '');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Proof Modal Viewer State
  const [viewProofModal, setViewProofModal] = useState(null);
  const [deletingProof, setDeletingProof] = useState(false);

  // Print Receipt Modal State
  const [printReceiptModal, setPrintReceiptModal] = useState(null);

  // Export Excel Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(todayStr);
  const [exportEndDate, setExportEndDate] = useState(todayStr);

  // Refresh & Cleanup Overdue State
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState('');

  useEffect(() => {
    fetch('/api/outlets')
      .then(res => res.json())
      .then(res => {
        if (res.success) setOutlets(res.data);
      })
      .catch(err => console.error('Failed to load outlets in bookings tab:', err));
  }, []);

  const fetchBookings = () => {
    setLoading(true);
    let url = `/api/bookings?search=${encodeURIComponent(searchTerm)}`;
    if (outletFilter) url += `&outlet_id=${outletFilter}`;
    if (paymentFilter) url += `&payment_status=${paymentFilter}`;
    if (statusFilter) url += `&booking_status=${statusFilter}`;

    fetch(url)
      .then(res => res.json())
      .then(res => {
        if (res.success) setBookings(res.data);
      })
      .finally(() => setLoading(false));
  };

  const handleRefreshBookings = async () => {
    setRefreshing(true);
    setRefreshMsg('');
    try {
      const res = await fetch('/api/bookings/cleanup-overdue', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        if (data.cancelledCount > 0) {
          setRefreshMsg(`${data.cancelledCount} ${t('autoCancelledMsg')}`);
        } else {
          setRefreshMsg(t('noOverdueMsg'));
        }
        setTimeout(() => setRefreshMsg(''), 5000);
      }
    } catch (err) {
      console.error('Refresh cleanup error:', err);
    } finally {
      fetchBookings();
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    setCurrentPage(1);
  }, [searchTerm, outletFilter, paymentFilter, statusFilter]);

  const handleUpdateStatus = async (id, newBookingStatus, newPaymentStatus) => {
    try {
      const payload = {};
      if (newBookingStatus) payload.booking_status = newBookingStatus;
      if (newPaymentStatus) payload.payment_status = newPaymentStatus;

      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setViewProofModal(null);
        fetchBookings();
      }
    } catch (e) {
      alert('Gagal update status booking');
    }
  };

  const handleDeletePaymentProof = async (id) => {
    if (!confirm('Apakah Staff yakin ingin MENGHAPUS foto bukti pembayaran ini?')) return;
    setDeletingProof(true);

    try {
      const res = await fetch(`/api/bookings/${id}/payment-proof`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setViewProofModal(null);
        fetchBookings();
      } else {
        alert(data.message || 'Gagal menghapus bukti pembayaran.');
      }
    } catch (e) {
      alert('Gagal menghapus bukti pembayaran');
    } finally {
      setDeletingProof(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm('Apakah Staff yakin ingin membatalkan booking ini? (Status akan diubah menjadi Cancelled)')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchBookings();
    } catch (e) {
      alert('Gagal membatalkan booking');
    }
  };

  const handleHardDeleteBooking = async (id, bookingCode) => {
    if (!confirm(`PERINGATAN: Apakah Staff benar-benar ingin MENGHAPUS PERMANEN booking ${bookingCode} dari database PostgreSQL? Seluruh data booking & foto bukti transfer akan otomatis terhapus.`)) return;

    try {
      const res = await fetch(`/api/bookings/${id}?permanent=true`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchBookings();
    } catch (e) {
      alert('Gagal menghapus booking secara permanen');
    }
  };

  const handleExecuteExportExcel = () => {
    const rawFiltered = bookings.filter(b => {
      if (!b.booking_date) return true;
      return b.booking_date >= exportStartDate && b.booking_date <= exportEndDate;
    });

    if (rawFiltered.length === 0) {
      alert(`Tidak ada data ${filterPaymentOnly ? 'pembayaran' : 'booking'} pada rentang tanggal ${exportStartDate} s/d ${exportEndDate}`);
      return;
    }

    const exportRows = [];
    rawFiltered.forEach(b => {
      if (b.items && b.items.length > 0) {
        b.items.forEach(item => {
          exportRows.push({
            booking_code: b.booking_code,
            outlet_name: item.outlet_name || b.outlet_name || '',
            customer_name: b.customer_name,
            customer_phone: b.customer_phone,
            customer_email: b.customer_email || '',
            court_name: item.court_name,
            sport_name: item.sport_name || '',
            booking_date: item.booking_date,
            start_time: item.start_time,
            end_time: item.end_time,
            duration_hours: item.duration_hours,
            total_price: item.total_price,
            payment_status: b.payment_status,
            booking_status: b.booking_status
          });
        });
      } else {
        exportRows.push({
          ...b,
          outlet_name: b.outlet_name || ''
        });
      }
    });

    const headers = {
      booking_code: 'Kode Booking',
      outlet_name: 'Nama Outlet',
      customer_name: 'Nama Customer',
      customer_phone: 'No Telephone',
      customer_email: 'Email',
      court_name: 'Lapangan',
      sport_name: 'Cabang Olahraga',
      booking_date: 'Tanggal Booking',
      start_time: 'Jam Mulai',
      end_time: 'Jam Selesai',
      duration_hours: 'Durasi (Jam)',
      total_price: 'Biaya Item (Rp)',
      payment_status: 'Payment Status',
      booking_status: 'Booking Status'
    };

    const fileName = filterPaymentOnly ? `Report_Payments_${exportStartDate}_to_${exportEndDate}` : `Report_Bookings_${exportStartDate}_to_${exportEndDate}`;
    exportToCsv(fileName, exportRows, headers);
    setShowExportModal(false);
  };

  const getStatusBadgeClass = (statusStr) => {
    const status = (statusStr || '').toLowerCase();
    switch (status) {
      case 'paid':
        return 'bg-blue-50 text-primary border border-blue-200';
      case 'unpaid':
        return 'bg-amber-50 text-amber-600 border border-amber-200';
      case 'occupied':
        return 'bg-orange-light text-orange border border-orange/30';
      case 'finished':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'available':
        return 'bg-sportgreen-light text-sportgreen border border-sportgreen/30';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  // Calculate Pagination Slices
  const totalItems = bookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDisplayedBookings = bookings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">

      {filterPaymentOnly && (
        <div className="p-3.5 rounded-button bg-blue-50 border border-blue-200 text-primary text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4.5 h-4.5 text-primary shrink-0" />
            <span>{t('paymentsFinishedNotice')}</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-primary text-white text-[10px] font-extrabold uppercase tracking-wider">
            STATUS: FINISHED
          </span>
        </div>
      )}

      {refreshMsg && (
        <div className="p-3.5 rounded-button bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{refreshMsg}</span>
          </div>
          <button onClick={() => setRefreshMsg('')} className="text-amber-700 hover:text-navy">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Header */}
      <div className="bg-white p-4 rounded-card border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={t('searchBookingsPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-button focus:outline-none focus:ring-2 focus:ring-primary font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Outlet Filter */}
          {isAdmin ? (
            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-button border border-slate-200">
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <select
                value={outletFilter}
                onChange={(e) => setOutletFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-navy focus:outline-none cursor-pointer"
              >
                <option value="">{t('allOutlets')}</option>
                {outlets.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-2 rounded-button text-xs font-bold">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Cabang: {currentUser?.outlet_name || 'Outlet Anda'}</span>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={handleRefreshBookings}
            disabled={refreshing}
            className="py-2 px-3.5 bg-navy hover:bg-slate-800 text-white rounded-button text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all disabled:opacity-50"
            title="Refresh data & auto-cancel booking yang lewat telat bayar"
          >
            <RefreshCw className={`w-4 h-4 text-sportgreen ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? t('refreshing') : t('btnRefreshBookings')}</span>
          </button>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-button bg-slate-50 font-bold text-navy focus:outline-none"
          >
            <option value="">{t('allBookingStatus')}</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="occupied">Occupied</option>
            <option value="finished">Finished</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Export Excel Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="py-2 px-3.5 bg-sportgreen hover:bg-sportgreen-hover text-white rounded-button text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
            title="Export data ke file Excel (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('exportExcel')}</span>
          </button>

          {onOpenManualBooking && (
            <button
              onClick={onOpenManualBooking}
              className="py-2 px-4 bg-primary text-white rounded-button text-xs font-bold flex items-center space-x-1 shadow-md hover:bg-primary-hover transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ {t('btnManualStaff')}</span>
            </button>
          )}
        </div>

      </div>

      {/* Bookings Data Table */}
      <div className="bg-white rounded-card border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-bold">{t('loadingCalendar')}</div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-navy text-white font-bold">
                    <th className="p-4">{t('tableBookingCode')}</th>
                    <th className="p-4">{t('tableCustomer')}</th>
                    <th className="p-4">{t('tableCourtSport')}</th>
                    <th className="p-4">{t('tableDateTime')}</th>
                    <th className="p-4">{t('paymentDeadlineTime')}</th>
                    <th className="p-4">{t('tableTotalPrice')}</th>
                    <th className="p-4">{t('tableProof')}</th>
                    <th className="p-4">{t('tableStatus')}</th>
                    <th className="p-4 text-center">{t('tableActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-navy">
                  {currentDisplayedBookings.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">{t('noBookingsFound')}</td>
                    </tr>
                  ) : (
                    currentDisplayedBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        
                        <td className="p-4 font-mono font-bold text-primary">
                          {b.booking_code}
                        </td>

                        <td className="p-4">
                          <div className="font-extrabold">{b.customer_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                            <span>{b.customer_phone}</span>
                            {b.customer_phone && (
                              <a
                                href={getWaUrl(b.customer_phone, `Halo ${b.customer_name}, mengenai booking ${b.booking_code}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#25D366] hover:bg-[#20bd5a] text-white text-[10px] font-bold shadow-2xs transition-all hover:scale-105"
                                title={`Chat WhatsApp dengan ${b.customer_name}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MessageCircle className="w-3 h-3 fill-current" />
                                <span>WA</span>
                              </a>
                            )}
                          </div>
                          {b.customer_email && (
                            <div className="text-[10px] text-slate-400 font-medium truncate max-w-[145px]">{b.customer_email}</div>
                          )}
                        </td>

                        <td className="p-4">
                          {b.outlet_name && (
                            <div className="text-[10px] font-bold text-primary flex items-center gap-1 mb-1">
                              <Building2 className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[150px]">{b.outlet_name}</span>
                            </div>
                          )}
                          {b.items && b.items.length > 1 ? (
                            <div className="space-y-2">
                              <span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-primary text-[10px] font-extrabold uppercase">
                                {b.items.length} Lapangan Disewa
                              </span>
                              {b.items.map((item, idx) => (
                                <div key={idx} className="border-b border-slate-100 pb-1.5 last:border-b-0">
                                  <div className="font-extrabold text-navy">{item.court_name}</div>
                                  <div className="text-[10px] text-slate-400 uppercase">{item.sport_name || 'Sport'}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <div className="font-extrabold">{b.court_name}</div>
                              <div className="text-[10px] text-slate-400 uppercase">{b.sport_name}</div>
                            </>
                          )}
                        </td>

                        <td className="p-4">
                          {b.items && b.items.length > 1 ? (
                            <div className="space-y-2">
                              <span className="inline-block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Rincian Jam
                              </span>
                              {b.items.map((item, idx) => (
                                <div key={idx} className="border-b border-slate-100 pb-1.5 last:border-b-0">
                                  <div className="font-bold text-slate-700">{item.booking_date}</div>
                                  <div className="text-[11px] font-bold text-primary">{item.start_time} - {item.end_time} ({item.duration_hours} Jam)</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <div className="font-bold">{b.booking_date}</div>
                              <div className="text-[11px] font-bold text-primary">{b.start_time} - {b.end_time} ({b.duration_hours} Jam)</div>
                            </>
                          )}
                        </td>

                        {/* Column Batas Waktu Pembayaran */}
                        <td className="p-4">
                          {b.payment_deadline ? (
                            <div>
                              <div className="font-mono font-extrabold text-navy flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{new Date(b.payment_deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                              </div>
                              {(b.booking_status || 'unpaid').toLowerCase() === 'unpaid' && new Date() > new Date(b.payment_deadline) ? (
                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 text-[10px] font-extrabold uppercase">
                                  {t('latePaymentNotice')}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {new Date(b.payment_deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">-</span>
                          )}
                        </td>

                        <td className="p-4 font-extrabold text-navy">
                          Rp {b.total_price.toLocaleString('id-ID')}
                        </td>

                        {/* Column Bukti Transfer */}
                        <td className="p-4">
                          {b.payment_proof ? (
                            <button
                              onClick={() => setViewProofModal(b)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-primary border border-blue-200 rounded text-[11px] font-extrabold flex items-center gap-1 shadow-2xs"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>{t('btnViewProof')}</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-medium italic">-</span>
                          )}
                        </td>

                        {/* Dropdown Status Booking */}
                        <td className="p-4">
                          <select
                            value={(b.booking_status || 'unpaid').toLowerCase()}
                            onChange={(e) => handleUpdateStatus(b.id, e.target.value, null)}
                            className={`px-2.5 py-1.5 rounded text-[11px] font-extrabold uppercase focus:outline-none cursor-pointer ${getStatusBadgeClass(b.booking_status)}`}
                          >
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                            <option value="occupied">Occupied</option>
                            <option value="finished">Finished</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-center space-x-2">
                          <button
                            onClick={() => setPrintReceiptModal(b)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded text-[11px] font-bold border border-emerald-200 transition-all inline-flex items-center gap-1 shadow-2xs"
                            title={t('btnPrintReceipt')}
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{t('btnPrintReceiptShort')}</span>
                          </button>

                          {b.booking_status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="px-2 py-1 bg-slate-100 hover:bg-amber-50 text-amber-700 rounded text-[11px] font-bold border border-amber-200"
                              title="Set Cancelled"
                            >
                              {t('btnCancel')}
                            </button>
                          )}

                          <button
                            onClick={() => handleHardDeleteBooking(b.id, b.booking_code)}
                            className="px-2 py-1 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded text-[11px] font-bold border border-red-200 transition-colors"
                            title="Hapus Permanen"
                          >
                            {t('btnDeletePermanent')}
                          </button>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            {totalItems > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
                <div>
                  {t('showingData')} <span className="font-bold text-navy">{startIndex + 1}</span> {t('to')} <span className="font-bold text-navy">{Math.min(startIndex + itemsPerPage, totalItems)}</span> {t('of')} <span className="font-bold text-navy">{totalItems}</span> {t('bookingsCount')}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="font-bold text-navy px-2">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export Excel Filter Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
          <div className="bg-white rounded-card shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-sportgreen" />
                <h3 className="font-extrabold text-navy text-base">{t('exportModalTitle')}</h3>
              </div>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-navy">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('exportDateStart')}</label>
                <input
                  type="date"
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-button font-bold text-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('exportDateEnd')}</label>
                <input
                  type="date"
                  value={exportEndDate}
                  onChange={(e) => setExportEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-button font-bold text-navy"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2 border-t">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-button text-slate-700 text-xs"
              >
                {t('btnCancel')}
              </button>

              <button
                onClick={handleExecuteExportExcel}
                className="px-5 py-2 bg-sportgreen hover:bg-sportgreen-hover text-white font-extrabold rounded-button text-xs shadow-md flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>{t('downloadExcelBtn')}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Staff View Payment Proof Modal */}
      {viewProofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-card shadow-2xl max-w-xl w-full p-6 space-y-4 my-8 max-h-[90vh] flex flex-col justify-between overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <h3 className="font-extrabold text-navy text-base">{t('transferProofModalTitle')}</h3>
                <p className="text-xs text-slate-500">{t('tableBookingCode')}: <strong className="font-mono text-primary">{viewProofModal.booking_code}</strong> ({viewProofModal.customer_name})</p>
              </div>
              <button onClick={() => setViewProofModal(null)} className="text-slate-400 hover:text-navy p-1">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Image Container */}
            <div className="p-3 border rounded-card bg-slate-950/5 overflow-auto custom-scrollbar max-h-[55vh] flex justify-center items-start">
              <img
                src={viewProofModal.payment_proof}
                alt="Bukti Transfer"
                className="max-w-full h-auto object-contain rounded shadow-md border border-slate-200 cursor-zoom-in"
                onClick={() => {
                  const win = window.open();
                  if (win) win.document.write(`<img src="${viewProofModal.payment_proof}" style="max-width:100%; height:auto;" />`);
                }}
                title="Klik untuk membuka ukuran penuh di tab baru"
              />
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t shrink-0">
              <div className="text-xs text-slate-600 font-semibold">
                {t('tableTotalPrice')}: <span className="font-extrabold text-primary text-sm">Rp {viewProofModal.total_price?.toLocaleString('id-ID')}</span>
              </div>
              
              <div className="flex flex-wrap items-center space-x-2 w-full sm:w-auto justify-end">
                
                {/* Tombol Hapus Bukti Pembayaran */}
                <button
                  disabled={deletingProof}
                  onClick={() => handleDeletePaymentProof(viewProofModal.id)}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 font-bold rounded-button text-xs border border-red-200 flex items-center space-x-1 transition-all"
                  title="Hapus foto bukti pembayaran ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{deletingProof ? 'Deleting...' : t('deleteProofBtn')}</span>
                </button>

                <button
                  onClick={() => {
                    const targetBooking = viewProofModal;
                    setViewProofModal(null);
                    setPrintReceiptModal(targetBooking);
                  }}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold rounded-button text-xs border border-emerald-200 flex items-center space-x-1 transition-all"
                  title={t('btnPrintReceipt')}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t('btnPrintReceiptShort')}</span>
                </button>

                <button
                  onClick={() => setViewProofModal(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-button text-slate-700 text-xs"
                >
                  {t('btnClose')}
                </button>

                {viewProofModal.payment_status !== 'paid' && (
                  <button
                    onClick={() => handleUpdateStatus(viewProofModal.id, 'paid', 'paid')}
                    className="px-4 py-2 bg-sportgreen hover:bg-sportgreen-hover text-white font-bold rounded-button text-xs shadow-md"
                  >
                    {t('verifySetPaidBtn')}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {printReceiptModal && (
        <PrintReceiptModal
          booking={printReceiptModal}
          onClose={() => setPrintReceiptModal(null)}
        />
      )}

    </div>
  );
}
