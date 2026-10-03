import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, Award, DollarSign, ChevronLeft, ChevronRight, Search, Trash2, FileSpreadsheet, Download, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { exportToCsv } from '../../utils/excelExport';
import { getWaUrl } from '../../utils/whatsapp';
import Pagination from '../common/Pagination';

export default function CustomersTab({ currentUser }) {
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
          <h3 className="text-xl font-extrabold text-navy">{t('customerDirTitle')}</h3>
          <p className="text-xs text-slate-500">{t('customerDirSub')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={t('searchCustomerPlaceholder')}
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
            <span>{t('exportExcel')}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-card border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-bold">{t('loadingCustomers')}</div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-navy text-white font-bold">
                    <th className="p-4">{t('tableCustomer')}</th>
                    <th className="p-4">{t('phone')}</th>
                    <th className="p-4">{t('email')}</th>
                    <th className="p-4">{t('totalBookingsLabel')}</th>
                    <th className="p-4">{t('totalSpentLabel')}</th>
                    <th className="p-4 text-center">{t('tableActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-navy">
                  {currentDisplayedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">{t('noCustomersFound')}</td>
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
                        <td className="p-4 font-mono font-bold text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <span>{c.phone}</span>
                            {c.phone && (
                              <a
                                href={getWaUrl(c.phone, `Halo ${c.name}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#25D366] hover:bg-[#20bd5a] text-white text-[10px] font-bold shadow-2xs transition-all hover:scale-105"
                                title={`Chat WhatsApp dengan ${c.name}`}
                              >
                                <MessageCircle className="w-3 h-3 fill-current" />
                                <span>WA</span>
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-slate-500">{c.email || '-'}</td>
                        <td className="p-4 font-extrabold text-primary">{c.total_bookings} {t('sessions')}</td>
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
                            <span>{t('btnDeletePermanent')}</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              startIndex={startIndex}
              endIndex={Math.min(startIndex + itemsPerPage, totalItems)}
              totalItems={totalItems}
              label="pelanggan"
            />
          </div>
        )}
      </div>

    </div>
  );
}
