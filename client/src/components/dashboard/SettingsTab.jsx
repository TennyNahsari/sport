import React, { useState, useEffect } from 'react';
import { Building2, QrCode, Save, Trash2, Upload, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Copy } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function SettingsTab() {
  const { t } = useLanguage();

  const [bankName, setBankName] = useState('BCA');
  const [bankAccountNumber, setBankAccountNumber] = useState('8830-1920-3341');
  const [bankAccountHolder, setBankAccountHolder] = useState('SportBook Venue Management');
  const [qrisMerchantName, setQrisMerchantName] = useState('SportBook Venue QRIS');
  const [qrisImageUrl, setQrisImageUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('6281234567890');

  // Image Upload State
  const [qrisPreview, setQrisPreview] = useState('');
  const [qrisBase64, setQrisBase64] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingQris, setDeletingQris] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        const s = data.data;
        setBankName(s.bank_name || 'BCA');
        setBankAccountNumber(s.bank_account_number || '8830-1920-3341');
        setBankAccountHolder(s.bank_account_holder || 'SportBook Venue Management');
        setQrisMerchantName(s.qris_merchant_name || 'SportBook Venue QRIS');
        setQrisImageUrl(s.qris_image_url || '');
        setQrisPreview(s.qris_image_url || '');
        setWhatsappNumber(s.whatsapp_number || '6281234567890');
        setQrisBase64('');
      }
    } catch (err) {
      setErrorMsg('Failed to load settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Select an image file (PNG, JPG, JPEG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setQrisPreview(reader.result);
      setQrisBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_name: bankName,
          bank_account_number: bankAccountNumber,
          bank_account_holder: bankAccountHolder,
          qris_merchant_name: qrisMerchantName,
          whatsapp_number: whatsappNumber,
          qris_image: qrisBase64 || ''
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSuccessMsg(data.message || 'Settings saved successfully!');
      if (data.data) {
        setQrisImageUrl(data.data.qris_image_url || '');
        setQrisPreview(data.data.qris_image_url || '');
        setQrisBase64('');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQris = async () => {
    if (!window.confirm('Delete QRIS image permanently from server?')) {
      return;
    }

    setDeletingQris(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_name: bankName,
          bank_account_number: bankAccountNumber,
          bank_account_holder: bankAccountHolder,
          qris_merchant_name: qrisMerchantName,
          qris_action: 'delete'
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setQrisImageUrl('');
      setQrisPreview('');
      setQrisBase64('');
      setSuccessMsg('QRIS image deleted successfully!');
    } catch (err) {
      setErrorMsg('Failed to delete QRIS: ' + err.message);
    } finally {
      setDeletingQris(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-card border border-slate-200 text-center py-16">
        <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-bold">Loading Venue Settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-navy text-white p-6 rounded-card shadow-md border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-sportgreen text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('venuePaymentConfig')}</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">{t('paymentSettingsHeading')}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('paymentSettingsSub')}
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-button bg-green-50 border border-green-200 text-sportgreen text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-button bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: BANK ACCOUNT SETTINGS */}
        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-primary flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-navy text-base">{t('bankInfoHeading')}</h3>
              <p className="text-[11px] text-slate-500">{t('bankInfoSub')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('bankNameField')}</label>
              <input
                type="text"
                required
                placeholder="BCA / Mandiri / BNI / BRI"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-button text-xs font-extrabold text-navy focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('accountNumberField')}</label>
              <input
                type="text"
                required
                placeholder="8830-1920-3341"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-button text-xs font-mono font-bold text-navy focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('accountHolderField')}</label>
              <input
                type="text"
                required
                placeholder="SportBook Venue Management"
                value={bankAccountHolder}
                onChange={(e) => setBankAccountHolder(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-button text-xs font-bold text-navy focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: WHATSAPP SUPPORT SETTINGS */}
        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 text-[#25D366] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-navy text-base">{t('waSupportHeading')}</h3>
              <p className="text-[11px] text-slate-500">{t('waSupportSub')}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('waAdminField')}</label>
            <input
              type="text"
              required
              placeholder="6281234567890"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-button text-xs font-mono font-bold text-navy focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* SECTION 3: QRIS SETTINGS & IMAGE MANAGEMENT */}
        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-lg bg-sportgreen-light text-sportgreen flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-navy text-base">{t('qrisInfoHeading')}</h3>
              <p className="text-[11px] text-slate-500">{t('qrisInfoSub')}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('merchantNameField')}</label>
            <input
              type="text"
              placeholder="SportBook Venue QRIS (GoPay, OVO, Dana, ShopeePay, Mobile Banking)"
              value={qrisMerchantName}
              onChange={(e) => setQrisMerchantName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-button text-xs font-bold text-navy focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* QRIS Image Area */}
          <div className="space-y-3 pt-2">
            <span className="block text-xs font-bold text-slate-700 uppercase">{t('activeQrisImage')}</span>

            {qrisPreview ? (
              <div className="bg-slate-50 border border-slate-200 rounded-card p-5 flex flex-col sm:flex-row items-center justify-between gap-6">
                
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative p-3 bg-white rounded-card shadow-md border border-slate-200 shrink-0">
                    <img
                      src={qrisPreview}
                      alt="Barcode QRIS Venue"
                      className="w-44 h-44 object-contain rounded"
                    />
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-sportgreen text-white text-[9px] font-extrabold shadow-sm">
                      ACTIVE
                    </span>
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <h4 className="font-extrabold text-navy text-sm">{qrisMerchantName || 'QRIS Venue Active'}</h4>
                    <p className="text-xs text-slate-500">Status: QRIS image stored on server.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 w-full sm:w-auto">
                  <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-button shadow-sm flex items-center justify-center space-x-2 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{t('changeQrisBtn')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleDeleteQris}
                    disabled={deletingQris}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-button border border-red-200 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span>{deletingQris ? 'Deleting...' : t('deleteQrisBtn')}</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 rounded-card p-8 text-center bg-slate-50 hover:bg-slate-100/80 transition-colors">
                <QrCode className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <h4 className="font-extrabold text-navy text-sm">{t('noQrisTitle')}</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  {t('noQrisSub')}
                </p>
                <label className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-button shadow-md cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{t('uploadNewQrisBtn')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Action Save Bar */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm rounded-button shadow-lg shadow-primary/30 flex items-center space-x-2 disabled:opacity-50 transition-all"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t('savingSettingsMsg')}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t('savePaymentSettingsBtn')}</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
