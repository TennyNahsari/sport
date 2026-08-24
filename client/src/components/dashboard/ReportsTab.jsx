import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Award, Activity } from 'lucide-react';

export default function ReportsTab() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/reports/dashboard')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
      });
  }, []);

  if (!data) return <div className="p-8 text-center text-slate-500 font-bold">Memuat laporan...</div>;

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm">
        <h3 className="text-xl font-extrabold text-navy">Laporan Pendapatan & Occupancy Venue</h3>
        <p className="text-xs text-slate-500">Ringkasan performa bisnis venue per lapangan & cabang olahraga</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bookings & Revenue per Court */}
        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm">
          <h4 className="font-extrabold text-navy text-base mb-4">Laporan Revenue Per Lapangan</h4>
          <div className="space-y-3">
            {data.bookingsByCourt.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-button border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <div className="font-extrabold text-navy">{item.court_name}</div>
                  <div className="text-[10px] text-slate-500">{item.sport_name} · {item.booking_count} Sesi</div>
                </div>
                <div className="font-extrabold text-sportgreen text-sm">
                  Rp {item.total_revenue.toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Occupancy summary */}
        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-extrabold text-navy text-base">Metrik Occupancy Rate</h4>
          
          <div className="bg-blue-50 p-4 rounded-card border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-600 font-bold">Tingkat Penggunaan Hari Ini</span>
              <p className="text-3xl font-extrabold text-primary">{data.occupancyRate}%</p>
            </div>
            <Activity className="w-10 h-10 text-primary opacity-80" />
          </div>

          <div className="text-xs text-slate-600 space-y-2 pt-2">
            <div className="flex justify-between border-b pb-2">
              <span>Total Lapangan Aktif:</span>
              <span className="font-bold text-navy">{data.totalCourts} Lapangan</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Lapangan Terpakai:</span>
              <span className="font-bold text-sportgreen">{data.occupiedCourts} Lapangan</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Lapangan Kosong:</span>
              <span className="font-bold text-orange">{data.availableCourts} Lapangan</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
