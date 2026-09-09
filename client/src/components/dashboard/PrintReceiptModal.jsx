import React, { useEffect, useState } from 'react';
import { Printer, X, Receipt } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function PrintReceiptModal({ booking, onClose }) {
  const { t, lang } = useLanguage();
  const [venueSettings, setVenueSettings] = useState(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setVenueSettings(data.data);
        }
      })
      .catch((err) => console.error('Failed to load venue settings for receipt:', err));
  }, []);

  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleString(lang === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const venueName = (booking.outlet_name || venueSettings?.qris_merchant_name || 'SPORTBOOK ARENA').toUpperCase();
  const venueAddress = booking.outlet_address || '';
  const venuePhone = booking.outlet_phone || (venueSettings?.whatsapp_number ? `+${venueSettings.whatsapp_number}` : '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-card shadow-2xl max-w-md w-full p-6 space-y-4 my-8 border border-slate-200 relative">
        
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="no-print flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-primary" />
            <h3 className="font-extrabold text-navy text-sm sm:text-base">{t('eposLayoutTitle')}</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="py-2 px-4 bg-sportgreen hover:bg-sportgreen-hover text-white rounded-button text-xs font-black flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('btnPrintEpos')}</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-navy rounded-button hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area Container for EPOS Thermal Receipt */}
        <div className="printable-area">
          <div className="epos-receipt-print font-mono text-black text-xs mx-auto w-full max-w-[300px] bg-white p-4 border border-slate-300 rounded shadow-sm leading-tight select-all">
            
            {/* Header */}
            <div className="text-center space-y-0.5 mb-2">
              <p className="font-bold text-sm tracking-wide uppercase">{venueName}</p>
              {venueAddress ? (
                <p className="text-[9px] text-slate-600 leading-tight px-2">{venueAddress}</p>
              ) : (
                <p className="text-[10px] text-slate-600">{t('receiptSub')}</p>
              )}
              {venuePhone && <p className="text-[10px] font-mono">Telp/WA: {venuePhone}</p>}
            </div>

            <div className="text-center font-bold my-1 text-[11px] overflow-hidden whitespace-nowrap">
              ================================
            </div>

            {/* Receipt Title Subhead */}
            <div className="text-center uppercase font-bold text-[11px] mb-1">
              *** {t('receiptTitle')} ***
            </div>

            {/* Booking Info */}
            <div className="space-y-0.5 text-[11px] mb-2 font-mono">
              <div className="flex justify-between">
                <span>{t('receiptNo')}:</span>
                <span className="font-bold">{booking.booking_code}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('receiptDate')}:</span>
                <span>{currentDateStr}</span>
              </div>
            </div>

            <div className="text-center font-bold my-1 text-[11px] overflow-hidden whitespace-nowrap">
              --------------------------------
            </div>

            {/* Customer Info */}
            <div className="space-y-0.5 text-[11px] mb-2 font-mono">
              <p className="font-bold uppercase text-[10px] text-slate-700">{t('receiptCustomerInfo')}:</p>
              <div className="flex justify-between">
                <span>{t('tableCustomer')}:</span>
                <span className="font-bold">{booking.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span>No. HP:</span>
                <span>{booking.customer_phone}</span>
              </div>
            </div>

            <div className="text-center font-bold my-1 text-[11px] overflow-hidden whitespace-nowrap">
              --------------------------------
            </div>

            {/* Items / Courts Details */}
            <div className="space-y-2 mb-2 font-mono text-[11px]">
              <p className="font-bold uppercase text-[10px] text-slate-700">{t('receiptBookingDetails')}:</p>
              
              {booking.items && booking.items.length > 0 ? (
                booking.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5 pb-1 border-b border-dashed border-slate-300 last:border-b-0">
                    <div className="font-bold">{item.court_name} ({item.sport_name || 'Sport'})</div>
                    <div className="text-[10px] text-slate-700">{item.booking_date} | {item.start_time} - {item.end_time}</div>
                    <div className="flex justify-between text-[10px]">
                      <span>Durasi: {item.duration_hours} Jam</span>
                      <span className="font-bold">Rp {Number(item.total_price || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-0.5">
                  <div className="font-bold">{booking.court_name} ({booking.sport_name || 'Sport'})</div>
                  <div className="text-[10px] text-slate-700">{booking.booking_date} | {booking.start_time} - {booking.end_time}</div>
                  <div className="flex justify-between text-[10px]">
                    <span>Durasi: {booking.duration_hours} Jam</span>
                    <span className="font-bold">Rp {Number(booking.total_price || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center font-bold my-1 text-[11px] overflow-hidden whitespace-nowrap">
              --------------------------------
            </div>

            {/* Total & Status */}
            <div className="space-y-1 my-2 font-mono text-[11px]">
              <div className="flex justify-between items-center font-bold text-sm">
                <span>TOTAL:</span>
                <span>Rp {Number(booking.total_price || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>{t('receiptPaymentStatus')}:</span>
                <span className="font-bold">{booking.payment_status === 'paid' ? t('receiptStatusPaid') : (booking.payment_status || 'PAID').toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>{t('receiptBookingStatus')}:</span>
                <span className="font-bold">{booking.booking_status === 'finished' ? t('receiptStatusFinished') : (booking.booking_status || 'FINISHED').toUpperCase()}</span>
              </div>
            </div>

            <div className="text-center font-bold my-1 text-[11px] overflow-hidden whitespace-nowrap">
              ================================
            </div>

            {/* Footer Notice */}
            <div className="text-center text-[10px] space-y-0.5 mt-2 font-mono">
              <p className="font-bold">{t('receiptThankYou')}</p>
              <p className="text-[9px] text-slate-500">{t('receiptContactNotice')}</p>
              <p className="text-[8px] text-slate-400 mt-1">EPOS THERMAL POS SYSTEM</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
