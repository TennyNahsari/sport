import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit3, Trash2, Building2, MapPin, Phone, CheckCircle, XCircle, FileSpreadsheet, ShieldAlert, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { exportToCsv } from '../../utils/excelExport';

export default function OutletsTab() {
  const { t } = useLanguage();
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');

  const fetchOutlets = () => {
    setLoading(true);
    fetch('/api/outlets')
      .then(res => res.json())
      .then(res => {
        if (res.success) setOutlets(res.data);
      })
      .catch(err => console.error('Failed to load outlets:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  const handleOpenAdd = () => {
    setEditingOutlet(null);
    setName('');
    setAddress('');
    setPhone('');
    setImageUrl('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80');
    setDescription('');
    setStatus('active');
    setShowModal(true);
  };

  const handleOpenEdit = (outlet) => {
    setEditingOutlet(outlet);
    setName(outlet.name);
    setAddress(outlet.address);
    setPhone(outlet.phone || '');
    setImageUrl(outlet.image_url || '');
    setDescription(outlet.description || '');
    setStatus(outlet.status || 'active');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      address,
      phone,
      image_url: imageUrl,
      description,
      status
    };

    try {
      const url = editingOutlet ? `/api/outlets/${editingOutlet.id}` : '/api/outlets';
      const method = editingOutlet ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchOutlets();
      } else {
        alert(data.message || 'Gagal menyimpan data outlet');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan data outlet');
    }
  };

  const handleDelete = async (id, outletName) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus outlet "${outletName}"? Lapangan yang terhubung akan dialihkan ke status unassigned.`)) return;

    try {
      const res = await fetch(`/api/outlets/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchOutlets();
      } else {
        alert(data.message || 'Gagal menghapus outlet');
      }
    } catch (err) {
      alert('Gagal menghapus outlet');
    }
  };

  const handleExportExcel = () => {
    const headers = {
      id: 'ID Outlet',
      name: 'Nama Outlet',
      address: 'Alamat Lokasi',
      phone: 'No. Telepon / WA',
      courts_count: 'Jumlah Lapangan',
      status: 'Status Outlet'
    };
    const todayStr = new Date().toISOString().split('T')[0];
    exportToCsv(`Report_Outlets_${todayStr}`, outlets, headers);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-card border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-navy flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span>{t('outletMgmtTitle')}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('outletMgmtSub')}</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="py-2.5 px-4 bg-sportgreen hover:bg-sportgreen-hover text-white text-xs font-bold rounded-button shadow-md flex items-center space-x-1.5 transition-all shrink-0"
            title="Export data outlet ke file Excel (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('exportExcel')}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-button shadow-md flex items-center space-x-2 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('addNewOutletBtn')}</span>
          </button>
        </div>
      </div>

      {/* Outlets Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 font-bold bg-white rounded-card border">{t('loadingOutlets')}</div>
      ) : outlets.length === 0 ? (
        <div className="bg-white p-12 rounded-card border border-slate-200 text-center text-slate-400 space-y-3">
          <Building2 className="w-12 h-12 mx-auto text-slate-300" />
          <p className="font-bold text-sm text-navy">Belum ada data outlet terdaftar.</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-button inline-flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('addNewOutletBtn')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outlets.map((outlet) => (
            <div key={outlet.id} className="bg-white rounded-card border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              
              <div>
                {/* Image Header */}
                <div className="relative h-44 bg-slate-100 overflow-hidden group">
                  <img
                    src={outlet.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'}
                    alt={outlet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-navy/85 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-primary" />
                    <span>Outlet #{outlet.id}</span>
                  </span>

                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                    outlet.status === 'active' ? 'bg-sportgreen text-white shadow-sm' : 'bg-slate-500 text-white'
                  }`}>
                    {outlet.status}
                  </span>
                </div>

                {/* Outlet Content Details */}
                <div className="p-5 space-y-3.5">
                  <div>
                    <h4 className="font-extrabold text-navy text-lg">{outlet.name}</h4>
                    <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1 leading-snug">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      <span>{outlet.address}</span>
                    </p>
                    {outlet.phone && (
                      <p className="text-xs text-slate-600 font-mono font-bold flex items-center gap-1.5 mt-1">
                        <Phone className="w-3.5 h-3.5 text-sportgreen shrink-0" />
                        <span>{outlet.phone}</span>
                      </p>
                    )}
                  </div>

                  {outlet.description && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded border border-slate-100">
                      {outlet.description}
                    </p>
                  )}

                  {/* Registered Courts Tag */}
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold">{t('courtsInOutlet')}:</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-primary font-extrabold text-xs border border-blue-200">
                      {outlet.courts_count || 0} Lapangan
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button
                  onClick={() => handleOpenEdit(outlet)}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-navy font-bold text-xs rounded-button flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-primary" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(outlet.id, outlet.name)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-button border border-red-200 flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('btnDeletePermanent')}</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Outlet Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
          <div className="bg-white rounded-card shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar border border-slate-200">
            <h3 className="text-lg font-extrabold text-navy border-b pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span>{editingOutlet ? t('editOutletTitle') : t('addNewOutletTitle')}</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('outletNameLabel')}</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Cilandak Sport Center"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-button font-bold text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('outletAddressLabel')}</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Jl. Cilandak KKO No. 12, Pasar Minggu, Jakarta Selatan"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-button font-medium text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('outletPhoneLabel')}</label>
                <input
                  type="text"
                  placeholder="081299887766"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-button font-mono text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('outletImageUrlLabel')}</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-button font-medium text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('outletDescLabel')}</label>
                <textarea
                  rows={2}
                  placeholder="Fasilitas lapangan badminton & padel panoramic standar internasional..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-button font-medium text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('outletStatusLabel')}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-button font-bold text-navy"
                >
                  <option value="active">{t('activeStatus')}</option>
                  <option value="inactive">Inactive (Tutup Sementara)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 font-bold rounded-button text-slate-700"
                >
                  {t('btnCancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-extrabold rounded-button shadow-md"
                >
                  {t('saveOutletBtn')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
