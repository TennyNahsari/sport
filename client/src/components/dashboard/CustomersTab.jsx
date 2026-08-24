import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, Award, DollarSign, ChevronLeft, ChevronRight, Search, Trash2, FileSpreadsheet, Download } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { exportToCsv } from '../../utils/excelExport';

export default function CustomersTab() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchCustomers = () => {
    setLoading(true);
    fetch('/api/reports/customers')
      .then(res => res.json())
      .then(res => {
        if (res.success) setCustomers(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDeleteCustomer = async (id, name) => {
    if (!confirm(`PERINGATAN: Apakah Staff yakin ingin MENGHAPUS customer "${name}"? Seluruh data profil dan riwayat booking milik customer ini akan terhapus dari database PostgreSQL.`)) return;

    try {
      const res = await fetch(`/api/reports/customers/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        fetchCustomers();
      } else {
        alert(data.message || 'Gagal menghapus customer.');
      }
    } catch (err) {
      alert('Gagal menghapus customer');
    }
  };

  const handleExportExcel = () => {
    const headers = {
      id: 'ID Customer',
      name: 'Nama Customer',
      phone: 'No Telephone',
      email: 'Email',
      total_bookings: 'Total Sesi Booking',
      total_spent: 'Total Spent (Rp)'
    };
    const todayStr = new Date().toISOString().split('T')[0];
    exportToCsv(`Report_Customers_${todayStr}`, customers, headers);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDisplayedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-4 rounded-card border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-navy">Data Pelanggan (Customer Directory)</h3>
          <p className="text-xs text-slate-500">Riwayat penyewa, total booking, dan total pengeluaran</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari nama, no hp, atau email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-button focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            />
          </div>

          <button
            onClick={handleExportExcel}
            className="py-2 px-3.5 bg-sportgreen hover:bg-sportgreen-hover text-white rounded-button text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
            title="Export data pelanggan ke file Excel (.csv)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>EXPORT EXCEL</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-card border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-bold">Memuat data penyewa...</div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-navy text-white font-bold">
                    <th className="p-4">Nama Customer</th>
                    <th className="p-4">No. Telephone</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Total Sesi Booking</th>
                    <th className="p-4">Total Spent</th>
                    <th className="p-4 text-center">Aksi Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-navy">
                  {currentDisplayedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">Tidak ada data customer ditemukan.</td>
                    </tr>
                  ) : (
                    currentDisplayedCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-4 font-extrabold flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold">
                            {c.name.charAt(0)}
                          </div>
                          <span>{c.name}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-700">{c.phone}</td>
                        <td className="p-4 text-slate-500">{c.email || '-'}</td>
                        <td className="p-4 font-extrabold text-primary">{c.total_bookings} Sesi</td>
                        <td className="p-4 font-extrabold text-sportgreen">
                          Rp {c.total_spent.toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteCustomer(c.id, c.name)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded text-[11px] font-bold border border-red-200 transition-colors inline-flex items-center space-x-1"
                            title="Hapus Customer Permanen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalItems > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
                <div>
                  Menampilkan <span className="font-bold text-navy">{startIndex + 1}</span> sampai <span className="font-bold text-navy">{Math.min(startIndex + itemsPerPage, totalItems)}</span> dari <span className="font-bold text-navy">{totalItems}</span> pelanggan
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

    </div>
  );
}
