import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, CheckCircle2, AlertTriangle, ShieldCheck, CreditCard, Copy } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function BookingModal({ court, sports, initialSlot, initialDate, onClose, onBookingSuccess }) {
  const { t } = useLanguage();
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedSportId, setSelectedSportId] = useState(court ? court.sport_id : '');
  const [selectedCourtId, setSelectedCourtId] = useState(court ? court.id : '');
  const [bookingDate, setBookingDate] = useState(initialDate || todayStr);
  const [startTime, setStartTime] = useState(initialSlot ? initialSlot.time : '19:00');
  const [durationHours, setDurationHours] = useState(1);
  
  // Customer Data
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const currentCourt = court || { price_per_hour: 80000, name: 'Selected Court' };
  const totalPrice = (currentCourt.price_per_hour || 80000) * parseInt(durationHours);

  const formattedTotalPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(totalPrice);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          court_id: selectedCourtId || court.id,
          booking_date: bookingDate,
          start_time: startTime,
          duration_hours: parseInt(durationHours),
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          payment_status: 'unpaid'
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Booking failed.');
      }

      setConfirmedBooking(data.data);
      setCurrentStep(2);
      if (onBookingSuccess) onBookingSuccess(data.data);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy/80 backdrop-blur-sm">
      
      {/* Fixed Container with Max Height & Flex Column */}
      <div className="bg-white rounded-card shadow-2xl max-w-xl w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Fixed Header */}
        <div className="shrink-0 bg-navy text-white px-5 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-sportgreen shrink-0" />
            <h3 className="font-extrabold text-sm sm:text-base">
              {currentStep === 1 ? t('modalTitleForm') : t('modalTitleSuccess')}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-4">
          
          {/* STEP 1: BOOKING FORM */}
          {currentStep === 1 && (
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              
              {errorMessage && (
                <div className="p-3.5 rounded-button bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Summary Card */}
              <div className="bg-slate-50 p-3.5 rounded-button border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-navy text-sm sm:text-base">{currentCourt.name}</h4>
                  <p className="text-xs text-slate-500 font-semibold">{currentCourt.sport_name || 'Sports Venue'}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium">{t('courtPriceLabel')}</span>
                  <p className="text-xs sm:text-sm font-extrabold text-primary">
                    Rp {(currentCourt.price_per_hour || 80000).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Date & Time Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">{t('labelDate')}</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    min={todayStr}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-button text-xs font-bold text-navy"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">{t('labelStartTime')}</label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-button text-xs font-bold text-navy"
                  >
                    {Array.from({ length: 15 }, (_, i) => {
                      const hour = (8 + i).toString().padStart(2, '0');
                      return (
                        <option key={hour} value={`${hour}:00`}>
                          {`${hour}:00 WIB`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">{t('labelDuration')}</label>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-button text-xs font-bold text-navy"
                  >
                    <option value={1}>{t('duration1')}</option>
                    <option value={2}>{t('duration2')}</option>
                    <option value={3}>{t('duration3')}</option>
                    <option value={4}>{t('duration4')}</option>
                  </select>
                </div>
              </div>

              {/* Customer Data Inputs */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <span className="text-xs font-extrabold text-navy block">{t('custDataTitle')}</span>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t('fullName')}</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Budi Santoso"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-button focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t('phone')}</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        placeholder="081234567890"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-button focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t('email')}</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        placeholder="email@domain.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-button focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Calculation Footer */}
              <div className="bg-blue-50 p-4 rounded-button border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                <div>
                  <span className="text-xs font-semibold text-slate-600">{t('totalPriceLabel')}</span>
                  <p className="text-lg sm:text-xl font-extrabold text-primary">{formattedTotalPrice}</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm rounded-button shadow-lg shadow-primary/30 flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('btnConfirmBooking')}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* STEP 2: CONFIRMED */}
          {currentStep === 2 && confirmedBooking && (
            <div className="space-y-5 text-center">
              
              <div className="w-14 h-14 bg-sportgreen-light text-sportgreen rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold text-sportgreen uppercase tracking-wider">{t('modalTitleSuccess')}</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-navy mt-1">{t('bookingCodeLabel')} {confirmedBooking.booking_code}</h3>
                <p className="text-xs text-slate-500 mt-1">{t('saveCodeNotice')}</p>
              </div>

              {/* Details Ticket Card */}
              <div className="bg-slate-50 p-4 rounded-card border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 font-semibold">{t('tableCourtSport')}:</span>
                  <span className="font-extrabold text-navy">{confirmedBooking.court_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-semibold">{t('tableDateTime')}:</span>
                  <span className="font-extrabold text-navy">
                    {confirmedBooking.booking_date} ({confirmedBooking.start_time} - {confirmedBooking.end_time})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-semibold">{t('tableCustomer')}:</span>
                  <span className="font-extrabold text-navy">{confirmedBooking.customer_name} ({confirmedBooking.customer_phone})</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 font-semibold">{t('paymentStatusLabel')}</span>
                  <span className="px-2 py-0.5 rounded bg-orange-light text-orange font-bold text-[11px] uppercase">
                    {confirmedBooking.payment_status} {t('payTransferNote')}
                  </span>
                </div>
              </div>

              {/* Bank Transfer Instructions */}
              <div className="bg-slate-900 text-white p-4 rounded-card text-left space-y-2.5 text-xs">
                <div className="flex items-center space-x-2 font-bold text-sm text-primary-light">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span>{t('bankInstructionsTitle')}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded-button">
                  <div>
                    <p className="text-[11px] text-slate-400">BCA Virtual Account / Rekening</p>
                    <p className="font-mono font-bold text-white text-sm">8830-1920-3341</p>
                    <p className="text-[10px] text-slate-400">a.n. SportBook Venue Management</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText('883019203341')}
                    className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                    title="Copy Account Number"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-navy hover:bg-slate-800 text-white font-extrabold rounded-button text-xs sm:text-sm transition-colors"
              >
                {t('btnCloseReturn')}
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
