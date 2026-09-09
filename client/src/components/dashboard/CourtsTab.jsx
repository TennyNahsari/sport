import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit3, Trash2, ShieldAlert, CheckCircle, XCircle, FileSpreadsheet, Download, Building2, MapPin, Search, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { exportToCsv } from '../../utils/excelExport';

export default function CourtsTab({ currentUser }) {
  const { t } = useLanguage();
  const isAdmin = currentUser?.role === 'admin' || !currentUser?.outlet_id;
  const userOutletId = currentUser?.outlet_id ? String(currentUser.outlet_id) : '';

  const [courts, setCourts] = useState([]);
  const [sports, setSports] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletFilter, setSelectedOutletFilter] = useState(userOutletId);
  const [selectedSportFilter, setSelectedSportFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  
  const [sportId, setSportId] = useState('');
  const [outletId, setOutletId] = useState(userOutletId);
  const [name, setName] = useState('');
  const [pricePerHour, setPricePerHour] = useState(80000);
  const [imageUrl, setImageUrl] = useState('');
  const [facilitiesStr, setFacilitiesStr] = useState('Indoor, AC, Wooden Floor');
  const [status, setStatus] = useState('active');

  const fetchData = () => {
    setLoading(true);
    let courtUrl = '/api/courts';
    const queryParams = [];

    if (!isAdmin && currentUser) {
      queryParams.push(`scope_outlet_id=${currentUser.outlet_id}`);
      queryParams.push(`scope_user_id=${currentUser.id}`);
    } else if (selectedOutletFilter) {
      queryParams.push(`outlet_id=${selectedOutletFilter}`);
    }

    if (queryParams.length > 0) {
      courtUrl += `?${queryParams.join('&')}`;
    }

    Promise.all([
      fetch(courtUrl).then(res => res.json()),
      fetch('/api/sports').then(res => res.json()),
      fetch('/api/outlets').then(res => res.json())
    ]).then(([courtsRes, sportsRes, outletsRes]) => {
      if (courtsRes.success) setCourts(courtsRes.data);
      if (sportsRes.success) {
        setSports(sportsRes.data);
        if (sportsRes.data.length > 0 && !sportId) setSportId(sportsRes.data[0].id);
      }
      if (outletsRes.success) {
        setOutlets(outletsRes.data);
        if (outletsRes.data.length > 0 && !outletId) {
          setOutletId(userOutletId || outletsRes.data[0].id);
        }
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [selectedOutletFilter, currentUser]);

  // Client-side Filtering & Pagination
  const filteredCourts = courts.filter((c) => {
    const matchSearch = !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.sport_name && c.sport_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.outlet_name && c.outlet_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchSport = !selectedSportFilter || String(c.sport_id) === String(selectedSportFilter);
    return matchSearch && matchSport;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCourts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourts = filteredCourts.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenAdd = () => {
    setEditingCourt(null);
    setSportId(sports.length > 0 ? sports[0].id : '');
    setOutletId(userOutletId || (outlets.length > 0 ? outlets[0].id : ''));
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
    setOutletId(court.outlet_id || (userOutletId || (outlets.length > 0 ? outlets[0].id : '')));
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
    const assignedOutlet = userOutletId ? parseInt(userOutletId) : (outletId ? parseInt(outletId) : null);
    
    const payload = { 
      sport_id: parseInt(sportId), 
      outlet_id: assignedOutlet,
      name, 
      price_per_hour: parseInt(pricePerHour), 
      image_url: imageUrl, 
      facilities, 
      status,
      created_by: editingCourt ? editingCourt.created_by : (currentUser?.id || null)
    };

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
      } else {
        alert(data.message || 'Gagal menyimpan data lapangan');
      }
    } catch (err) {
      alert('Gagal menyimpan data lapangan');
    }
  };

  const handleDelete = async (id, court) => {
    const canDelete = isAdmin || (currentUser && court.created_by === currentUser.id);
    if (!canDelete) {
      alert('Hanya Admin atau Pembuat lapangan yang dapat menghapus lapangan ini.');
      return;
    }

    if (!confirm('Apakah anda yakin ingin menghapus lapangan ini?')) return;
    try {
      const res = await fetch(`/api/courts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.message || 'Gagal menghapus lapangan');
      }
    } catch (err) {
      alert('Gagal menghapus lapangan');
    }
  };

  const handleExportExcel = () => {
    const headers = {
      id: 'ID Lapangan',
      name: 'Nama Lapangan',
      outlet_name: 'Nama Outlet',
      sport_name: 'Cabang Olahraga',
      price_per_hour: 'Harga Per Jam (Rp)',
      status: 'Status Lapangan'
    };
    const todayStr = new Date().toISOString().split('T')[0];
    exportToCsv(`Report_Courts_${todayStr}`, filteredCourts, headers);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-card border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-navy">{t('courtMgmtTitle')}</h3>
          <p className="text-xs text-slate-500">{t('courtMgmtSub')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleExportExcel}
            className="py-2 px-3.5 bg-sportgreen hover:bg-sportgreen-hover text-white text-xs font-bold rounded-button shadow-md flex items-center space-x-1.5 transition-all shrink-0"
            title="Export data lapangan ke file Excel (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('exportExcel')}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="py-2 px-3.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-button shadow-md flex items-center space-x-1.5 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('addNewCourtBtn')}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-card border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama lapangan / cabang..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-button text-xs font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Outlet Filter Dropdown or Fixed Outlet Pill */}
          {isAdmin ? (
            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-button border border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <select
                value={selectedOutletFilter}
                onChange={(e) => setSelectedOutletFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-navy focus:outline-none cursor-pointer"
              >
                <option value="">{t('allOutlets')}</option>
                {outlets.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-button text-xs font-bold">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>Cabang: {currentUser?.outlet_name || 'Assigned Outlet'}</span>
            </div>
          )}

          {/* Sport Filter Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-button border border-slate-200">
            <Activity className="w-3.5 h-3.5 text-orange shrink-0" />
            <select
              value={selectedSportFilter}
              onChange={(e) => {
                setSelectedSportFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-bold text-navy focus:outline-none cursor-pointer"
            >
              <option value="">{t('allSports')}</option>
              {sports.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Per-Page Selector & Summary */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 w-full sm:w-auto justify-between sm:justify-end">
          <span className="font-semibold">{filteredCourts.length} Lapangan</span>
          <div className="flex items-center space-x-1">
            <span className="text-[11px]">Tampil:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-navy"
            >
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courts Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 font-bold bg-white rounded-card border">{t('loadingCourts')}</div>
      ) : filteredCourts.length === 0 ? (
        <div className="bg-white p-12 rounded-card border border-slate-200 text-center text-slate-400 space-y-3">
          <ShieldAlert className="w-12 h-12 mx-auto text-slate-300" />
          <p className="font-bold text-sm text-navy">Tidak ada lapangan yang sesuai dengan filter.</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-button inline-flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('addNewCourtBtn')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCourts.map((court) => {
              const isOwnCourt = currentUser && court.created_by === currentUser.id;
              const isCreatedByAdmin = court.creator_role === 'admin' || !court.created_by;
              const canModify = isAdmin || isOwnCourt;

              return (
                <div key={court.id} className="bg-white rounded-card border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                  
                  <div>
                    {/* Court Image Header */}
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img
                        src={court.image_url || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'}
                        alt={court.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-navy/85 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                        {court.sport_name}
                      </span>

                      <span className={`absolute top-3 right-3 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                        court.status === 'active' ? 'bg-sportgreen text-white shadow-sm' : 'bg-red-600 text-white'
                      }`}>
                        {court.status}
                      </span>
                    </div>

                    {/* Court Details */}
                    <div className="p-5 space-y-3">
                      {/* Outlet & Creator Badge Pills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <div className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">
                          <Building2 className="w-3 h-3 text-primary shrink-0" />
                          <span>{court.outlet_name || t('unassignedOutlet')}</span>
                        </div>

                        {isOwnCourt ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded">
                            ✓ Dibuat oleh Anda
                          </span>
                        ) : isCreatedByAdmin ? (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded">
                            Admin ({court.creator_name || 'Super Admin'})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold rounded">
                            {court.creator_name || 'Operator'}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-navy text-lg">{court.name}</h4>
                        <p className="text-primary font-extrabold text-sm mt-0.5">
                          Rp {court.price_per_hour.toLocaleString('id-ID')} <span className="text-xs text-slate-400 font-normal">{t('perHour')}</span>
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
                    {canModify ? (
                      <>
                        <button
                          onClick={() => handleOpenEdit(court)}
                          className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-navy font-bold text-xs rounded-button flex items-center space-x-1"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-primary" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDelete(court.id, court)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-button border border-red-200 flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t('btnDeletePermanent')}</span>
                        </button>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-between text-xs text-slate-400 font-medium">
                        <span className="italic text-[11px]">Dibuat oleh Admin (Hanya Lihat)</span>
                        <span className="px-2.5 py-1 bg-slate-200/60 text-slate-500 rounded text-[10px] font-bold">
                          Read Only
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Pagination Navigation Footer */}
          {totalPages > 1 && (
            <div className="bg-white p-4 rounded-card border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 font-semibold">
                Menampilkan <span className="text-navy font-bold">{startIndex + 1}</span> - <span className="text-navy font-bold">{Math.min(startIndex + itemsPerPage, filteredCourts.length)}</span> dari <span className="text-navy font-bold">{filteredCourts.length}</span> lapangan
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-button border border-slate-200 hover:bg-slate-100 text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-button text-xs font-bold transition-colors ${
                      currentPage === pageNum
                        ? 'bg-primary text-white shadow-md'
                        : 'border border-slate-200 hover:bg-slate-100 text-navy'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded-button border border-slate-200 hover:bg-slate-100 text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Court Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
          <div className="bg-white rounded-card shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar border border-slate-200">
            <h3 className="text-lg font-extrabold text-navy border-b pb-3">
              {editingCourt ? t('editCourtTitle') : t('addNewCourtTitle')}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Outlet Assignment Dropdown */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('assignOutletLabel')}</label>
                {isAdmin ? (
                  <select
                    value={outletId}
                    onChange={(e) => setOutletId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-button font-bold text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">-- {t('unassignedOutlet')} --</option>
                    {outlets.map(o => (
                      <option key={o.id} value={o.id}>{o.name} ({o.address})</option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-button font-bold text-navy flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <span>{currentUser?.outlet_name || 'Cabang Terassign Anda'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('sportCategoryLabel')}</label>
                <select
                  value={sportId}
                  onChange={(e) => setSportId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-button font-bold text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {sports.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('courtNameLabel')}</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Badminton Court 01 / Lapangan A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-button font-bold text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('pricePerHourLabel')}</label>
                <input
                  type="number"
                  required
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-button font-bold text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('imageUrlLabel')}</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-button font-medium text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('facilitiesCommaLabel')}</label>
                <input
                  type="text"
                  value={facilitiesStr}
                  onChange={(e) => setFacilitiesStr(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-button font-medium text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('courtStatusLabel')}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-button font-bold text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="active">{t('activeStatus')}</option>
                  <option value="maintenance">{t('maintenanceStatus')}</option>
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
                  {t('saveCourtBtn')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
