import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle2, AlertTriangle, ShieldCheck, CreditCard, Upload, Send, MessageSquare, ExternalLink, QrCode, Copy } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function CheckBookingModal({ onClose }) {
  const { t } = useLanguage();
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [venueSettings, setVenueSettings] = useState({
    bank_name: 'BCA',
    bank_account_number: '8830-1920-3341',
    bank_account_holder: 'SportBook Venue Management',
    qris_merchant_name: 'SportBook Venue QRIS',
    qris_image_url: ''
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setVenueSettings(data.data);
        }
      })
      .catch(err => console.error('Failed to load settings:', err));
  }, []);

  // Proof Upload State
  const [proofInput, setProofInput] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofSuccessMsg, setProofSuccessMsg] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setErrorMsg('');
    setProofSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch(`/api/bookings/check/${encodeURIComponent(searchCode.trim())}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Booking not found.');
      }

      setBookingData(data.data);
      if (data.data.payment_proof) {
        setProofInput(data.data.payment_proof);
      }
    } catch (err) {
      setErrorMsg(err.message);
      setBookingData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofInput(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!proofInput || !bookingData) return;

    setUploadingProof(true);
    setProofSuccessMsg('');

    try {
      const res = await fetch(`/api/bookings/${bookingData.id}/payment-proof`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_proof: proofInput })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setProofSuccessMsg('Transfer proof uploaded successfully! Staff will verify your payment shortly.');
      setBookingData(prev => ({ ...prev, payment_proof: proofInput }));
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingProof(false);
    }
  };

  const waNumber = bookingData?.whatsapp_number || '6281234567890';
  const waText = bookingData 
    ? encodeURIComponent(`Halo SportBook Admin, saya ingin mengonfirmasi pembayaran untuk Kode Booking *${bookingData.booking_code}* atas nama *${bookingData.customer_name}* (${bookingData.court_name}, ${bookingData.booking_date} jam ${bookingData.start_time}). Total: Rp${bookingData.total_price?.toLocaleString('id-ID')}. Mohon diverifikasi. Terimakasih!`)
    : '';
  const waUrl = `https://wa.me/${waNumber}?text=${waText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy/80 backdrop-blur-sm">
      
      {/* Modal Container with Max Height & Vertical Flex */}
      <div className="bg-white rounded-card shadow-2xl max-w-lg w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Fixed Header */}
        <div className="shrink-0 bg-navy text-white px-5 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-primary shrink-0" />
            <h3 className="font-extrabold text-sm sm:text-base">{t('checkModalTitle')}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors">
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-5">
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              {t('bookingCodeLabel')} (<span className="text-primary font-mono font-bold">SB-1001</span>) / Phone:
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                required
                placeholder={t('checkInputPlaceholder')}
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-button text-xs font-bold text-navy focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-button shadow-md flex items-center space-x-1 shrink-0"
              >
                {loading ? (
                  <span>Searching...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>{t('btnCheck')}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Booking Result View */}
          {bookingData && (
            <div className="space-y-4 border-t border-slate-100 pt-4">
              
              {/* Top Banner Status */}
              <div className="bg-slate-50 p-3.5 rounded-card border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">{t('bookingCodeLabel')}</span>
                  <span className="font-mono font-extrabold text-primary text-base">{bookingData.booking_code}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('tableStatus')}</span>
                    <span className={`inline-block mt-0.5 px-2.5 py-1 rounded text-[11px] font-extrabold uppercase ${
                      ['paid', 'confirmed', 'finished'].includes((bookingData.booking_status || '').toLowerCase())
                        ? 'bg-sportgreen-light text-sportgreen border border-sportgreen/30'
                        : (bookingData.booking_status || '').toLowerCase() === 'cancelled'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      {bookingData.booking_status}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('paymentStatusLabel')}</span>
                    <span className={`inline-block mt-0.5 px-2.5 py-1 rounded text-[11px] font-extrabold uppercase ${
                      bookingData.payment_status === 'paid' || bookingData.payment_status === 'Paid' ? 'bg-sportgreen-light text-sportgreen border border-sportgreen/30' : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      {bookingData.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Ticket Summary */}
              <div className="space-y-2.5 text-xs text-navy border border-slate-200 p-3.5 rounded-button bg-white">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-semibold">{t('tableCustomer')}:</span>
                  <span className="font-extrabold text-navy text-sm">{bookingData.customer_name} ({bookingData.customer_phone})</span>
                </div>

                {/* Items List */}
                <div className="space-y-1.5 pt-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Item Lapangan Disewa:</span>
                  {(bookingData.items && bookingData.items.length > 0 ? bookingData.items : [bookingData]).map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-200 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-extrabold text-navy">{item.court_name} <span className="text-slate-500 text-[10px]">({item.sport_name || 'Sport'})</span></p>
                        <p className="text-[11px] text-slate-500">{item.booking_date} ({item.start_time} - {item.end_time})</p>
                      </div>
                      <span className="font-extrabold text-primary">Rp {(parseInt(item.total_price) || 0).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-600 font-bold">{t('tableTotalPrice')}:</span>
                  <span className="font-extrabold text-primary text-base">
                    Rp {(parseInt(bookingData.total_price) || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Upload Proof or WhatsApp Send Section */}
              {bookingData.payment_status !== 'paid' && bookingData.payment_status !== 'Paid' && (
                <div className="space-y-3 pt-2 border-t">
                  
                  {/* Bank & QRIS Payment Info */}
                  <div className="bg-slate-900 text-white p-3.5 rounded-card text-xs space-y-3">
                    <div className="flex items-center space-x-2 font-bold text-xs text-primary-light">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <span>Rekening Pembayaran Venue</span>
                    </div>
                    
                    <div className="flex items-center justify-between bg-slate-800 p-2 rounded-button">
                      <div>
                        <p className="text-[10px] text-slate-400">{venueSettings.bank_name || 'BCA'} Rekening</p>
                        <p className="font-mono font-bold text-white text-xs">{venueSettings.bank_account_number || '8830-1920-3341'}</p>
                        <p className="text-[9px] text-slate-400">a.n. {venueSettings.bank_account_holder || 'SportBook Venue Management'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText((venueSettings.bank_account_number || '').replace(/[^0-9]/g, ''))}
                        className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                        title="Copy Account Number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {venueSettings.qris_image_url && (
                      <div className="pt-2 border-t border-slate-800 space-y-1.5">
                        <div className="flex items-center space-x-1.5 font-bold text-xs text-sportgreen">
                          <QrCode className="w-4 h-4" />
                          <span>Scan QRIS</span>
                        </div>
                        <div className="bg-slate-800 p-2.5 rounded-button text-center space-y-1">
                          <img
                            src={venueSettings.qris_image_url}
                            alt="QRIS Barcode"
                            className="w-36 h-36 mx-auto object-contain bg-white p-1.5 rounded border border-slate-700"
                          />
                          <p className="text-[10px] font-bold text-white">{venueSettings.qris_merchant_name || 'SportBook Venue QRIS'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 p-3 rounded-button border border-blue-100">
                    <h4 className="font-extrabold text-navy text-xs mb-0.5">{t('uploadProofTitle')}</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">{t('uploadProofSub')}</p>
                  </div>

                  {proofSuccessMsg && (
                    <div className="p-3 rounded bg-green-50 border border-green-200 text-sportgreen text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{proofSuccessMsg}</span>
                    </div>
                  )}

                  {/* Upload Form */}
                  <form onSubmit={handleSubmitProof} className="space-y-3">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-button file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer"
                      />
                    </div>

                    {/* Preview Box with Max Height Control */}
                    {proofInput && (
                      <div className="p-2 border rounded-button bg-slate-50 flex items-center space-x-3 max-h-28 overflow-hidden">
                        <img src={proofInput} alt="Bukti Transfer" className="w-16 h-16 object-cover rounded border shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-slate-700 font-bold block truncate">Bukti Transfer Ready</span>
                          <span className="text-[10px] text-sportgreen font-semibold">Klik tombol di bawah untuk unggah</span>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={uploadingProof || !proofInput}
                      className="w-full py-2.5 bg-sportgreen hover:bg-sportgreen-hover text-white text-xs font-extrabold rounded-button shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploadingProof ? 'Uploading...' : t('btnUploadProof')}</span>
                    </button>
                  </form>

                  {/* Divider OR */}
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-slate-400 text-[10px] font-bold uppercase">{t('orWhatsApp')}</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  {/* WhatsApp Direct Action Button */}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs rounded-button shadow-md flex items-center justify-center space-x-2 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>{t('btnSendWA')}</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>

                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
