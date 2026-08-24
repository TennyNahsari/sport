import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit3, Trash2, ShieldAlert, CheckCircle, XCircle, FileSpreadsheet, Download } from 'lucide-react';
import { exportToCsv } from '../../utils/excelExport';

export default function CourtsTab() {
  const [courts, setCourts] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  
  const [sportId, setSportId] = useState('');
  const [name, setName] = useState('');
  const [pricePerHour, setPricePerHour] = useState(80000);
  const [imageUrl, setImageUrl] = useState('');
  const [facilitiesStr, setFacilitiesStr] = useState('Indoor, AC, Wooden Floor');
  const [status, setStatus] = useState('active');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/courts').then(res => res.json()),
      fetch('/api/sports').then(res => res.json())
    ]).then(([courtsRes, sportsRes]) => {
      if (courtsRes.success) setCourts(courtsRes.data);
      if (sportsRes.success) {
        setSports(sportsRes.data);
        if (sportsRes.data.length > 0) setSportId(sportsRes.data[0].id);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingCourt(null);
    setName('');
    setPricePerHour(80000);
    setImageUrl('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80');
    setFacilitiesStr('Indoor, AC, Wooden Floor');
    setStatus('active');
    setShowModal(true);
  };

  const handleOpenEdit = (court) => {
    setEditingCourt(court);
    setSportId(court.sport_id);
    setName(court.name);
    setPricePerHour(court.price_per_hour);
    setImageUrl(court.image_url);
    setFacilitiesStr(Array.isArray(court.facilities) ? court.facilities.join(', ') : '');
    setStatus(court.status);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const facilities = facilitiesStr.split(',').map(s => s.trim()).filter(Boolean);
    const payload = { sport_id: sportId, name, price_per_hour: parseInt(pricePerHour), image_url: imageUrl, facilities, status };

    try {
      const url = editingCourt ? `/api/courts/${editingCourt.id}` : '/api/courts';
      const method = editingCourt ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      alert('Gagal menyimpan data lapangan');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah anda yakin ingin menghapus lapangan ini?')) return;
    try {
      const res = await fetch(`/api/courts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (err) {
      alert('Gagal menghapus lapangan');
    }
  };

  const handleExportExcel = () => {
    const headers = {
      id: 'ID Lapangan',
      name: 'Nama Lapangan',
      sport_name: 'Cabang Olahraga',
      price_per_hour: 'Harga Per Jam (Rp)',
      status: 'Status Lapangan'
    };
    const todayStr = new Date().toISOString().split('T')[0];
    exportToCsv(`Report_Courts_${todayStr}`, courts, headers);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-4 rounded-card border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-xl font-extrabold text-navy">Pengelolaan Lapangan (Court Management)</h3>
          <p className="text-xs text-slate-500">Kelola daftar lapangan, harga per jam, foto, dan status aktif</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="py-2.5 px-4 bg-sportgreen hover:bg-sportgreen-hover text-white text-xs font-bold rounded-button shadow-md flex items-center space-x-1.5 transition-all"
            title="Export data lapangan ke file Excel (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>EXPORT EXCEL</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-button shadow-md flex items-center space-x-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>TAMBAH LAPANGAN BARU</span>
          </button>
        </div>
      </div>

      {/* Courts Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 font-bold bg-white rounded-card border">Memuat daftar lapangan...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map((court) => (
            <div key={court.id} className="bg-white rounded-card border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
              
              <div>
                {/* Court Image Header */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={court.image_url || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'}
                    alt={court.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-navy/80 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                    {court.sport_name}
                  </span>

                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                    court.status === 'active' ? 'bg-sportgreen text-white' : 'bg-red-600 text-white'
                  }`}>
                    {court.status}
                  </span>
                </div>

                {/* Court Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <h4 className="font-extrabold text-navy text-lg">{court.name}</h4>
                    <p className="text-primary font-extrabold text-sm mt-0.5">
                      Rp {court.price_per_hour.toLocaleString('id-ID')} <span className="text-xs text-slate-400 font-normal">/ jam</span>
                    </p>
                  </div>

                  {/* Facilities Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(court.facilities) && court.facilities.map((fac, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                        ✓ {fac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button
                  onClick={() => handleOpenEdit(court)}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-navy font-bold text-xs rounded-button flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-primary" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(court.id)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-button border border-red-200 flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Court Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
          <div className="bg-white rounded-card shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-extrabold text-navy border-b pb-3">
              {editingCourt ? 'Edit Data Lapangan' : 'Tambah Lapangan Baru'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cabang Olahraga *</label>
                <select
                  value={sportId}
                  onChange={(e) => setSportId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-button font-bold text-navy"
                >
                  {sports.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lapangan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Badminton Court 01"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-button font-bold text-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Harga Per Jam (Rp) *</label>
                <input
                  type="number"
                  required
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-button font-bold text-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Foto Lapangan</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-button font-medium text-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fasilitas (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={facilitiesStr}
                  onChange={(e) => setFacilitiesStr(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-button font-medium text-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Lapangan</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-button font-bold text-navy"
                >
                  <option value="active">Active (Siap Sewa)</option>
                  <option value="maintenance">Maintenance (Perbaikan)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 font-bold rounded-button text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-extrabold rounded-button shadow-md"
                >
                  Simpan Lapangan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
