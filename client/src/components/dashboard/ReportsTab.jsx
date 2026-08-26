import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Award, Activity } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function ReportsTab() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/reports/dashboard')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
      });
  }, []);

  if (!data) return <div className="p-8 text-center text-slate-500 font-bold">{t('loadingDashboard')}</div>;

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm">
        <h3 className="text-xl font-extrabold text-navy">{t('reportsHeading')}</h3>
        <p className="text-xs text-slate-500">{t('reportsSub')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bookings & Revenue per Court */}
        <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm">
          <h4 className="font-extrabold text-navy text-base mb-4">{t('revenuePerCourt')}</h4>
          <div className="space-y-3">
            {data.bookingsByCourt.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-button border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <div className="font-extrabold text-navy">{item.court_name}</div>
                  <div className="text-[10px] text-slate-500">{item.sport_name} · {item.booking_count} {t('sessions')}</div>
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
          <h4 className="font-extrabold text-navy text-base">{t('occupancyMetrics')}</h4>
          
          <div className="bg-blue-50 p-4 rounded-card border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-600 font-bold">{t('todayUsage')}</span>
              <p className="text-3xl font-extrabold text-primary">{data.occupancyRate}%</p>
            </div>
            <Activity className="w-10 h-10 text-primary opacity-80" />
          </div>

          <div className="text-xs text-slate-600 space-y-2 pt-2">
            <div className="flex justify-between border-b pb-2">
              <span>{t('totalActiveCourts')}</span>
              <span className="font-bold text-navy">{data.totalCourts}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>{t('occupiedCourtsCount')}</span>
              <span className="font-bold text-sportgreen">{data.occupiedCourts}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>{t('emptyCourtsCount')}</span>
              <span className="font-bold text-orange">{data.availableCourts}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
