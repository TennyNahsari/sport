import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, DollarSign, Activity, CheckCircle, Clock, 
  TrendingUp, Users, PlusCircle, ArrowUpRight, ShieldCheck, MessageCircle 
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { getWaUrl } from '../../utils/whatsapp';

export default function OverviewTab({ onOpenManualBooking }) {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/dashboard')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold">{t('loadingDashboard')}</div>;
  }

  if (!data) return null;

  const formattedRevenue = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(data.todayRevenue || 0);

  return (
    <div className="space-y-6">
      
      {/* Top Stats 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Widget 1: Revenue Hari Ini */}
        <div className="bg-white p-5 rounded-card border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">{t('statTodayRev')}</span>
            <p className="text-2xl font-extrabold text-navy mt-1">{formattedRevenue}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sportgreen mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12%
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Widget 2: Booking Hari Ini */}
        <div className="bg-white p-5 rounded-card border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">{t('statTodayBookings')}</span>
            <p className="text-2xl font-extrabold text-navy mt-1">{data.todayBookings} {t('sessions')}</p>
            <span className="text-[11px] font-bold text-slate-400 mt-1 block">{t('recordedInSystem')}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-sportgreen flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Widget 3: Lapangan Terpakai */}
        <div className="bg-white p-5 rounded-card border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">{t('statOccupiedCourts')}</span>
            <p className="text-2xl font-extrabold text-navy mt-1">{data.occupiedCourts} / {data.totalCourts}</p>
            <span className="text-[11px] font-bold text-orange mt-1 block">
              {data.availableCourts} {t('courtsAvailable')}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-light text-orange flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Widget 4: Occupancy Rate */}
        <div className="bg-white p-5 rounded-card border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">{t('statOccupancyRate')}</span>
            <p className="text-2xl font-extrabold text-navy mt-1">{data.occupancyRate}%</p>
            <div className="w-24 bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-sportgreen h-full rounded-full" style={{ width: `${data.occupancyRate}%` }} />
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: Today's Schedule & Upcoming Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upcoming Bookings Table */}
        <div className="lg:col-span-8 bg-white rounded-card border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-navy text-lg">{t('upcomingBookingsTitle')}</h3>
              <p className="text-xs text-slate-500">{t('upcomingBookingsSub')}</p>
            </div>
            <button
              onClick={onOpenManualBooking}
              className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1"
            >
              + {t('btnManualStaff')}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-3">{t('tableBookingCode')}</th>
                  <th className="p-3">{t('tableCourtSport')}</th>
                  <th className="p-3">{t('tableDateTime')}</th>
                  <th className="p-3">{t('tableCustomer')}</th>
                  <th className="p-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-navy">
                {data.upcomingBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">{t('noUpcomingBookings')}</td>
                  </tr>
                ) : (
                  data.upcomingBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-primary">{b.booking_code}</td>
                      <td className="p-3">
                        <div className="font-bold">{b.court_name}</div>
                        <div className="text-[10px] text-slate-400">{b.sport_name}</div>
                      </td>
                      <td className="p-3">
                        <div>{b.booking_date}</div>
                        <div className="text-[11px] text-slate-500 font-bold">{b.start_time} - {b.end_time}</div>
                      </td>
                      <td className="p-3">
                        <div>{b.customer_name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{b.customer_phone}</span>
                          {b.customer_phone && (
                            <a
                              href={getWaUrl(b.customer_phone, `Halo ${b.customer_name}, mengenai booking ${b.booking_code}`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#25D366] hover:bg-[#20bd5a] text-white text-[9px] font-bold shadow-2xs transition-all hover:scale-105"
                              title={`Chat WA ${b.customer_name}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MessageCircle className="w-2.5 h-2.5 fill-current" />
                              <span>WA</span>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          b.payment_status === 'Paid' ? 'bg-sportgreen-light text-sportgreen' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {b.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Sports Breakdown */}
        <div className="lg:col-span-4 bg-white rounded-card border border-slate-200 shadow-sm p-6">
          <h3 className="font-extrabold text-navy text-lg mb-4">{t('statBySport')}</h3>
          <div className="space-y-4">
            {data.bookingsBySport.map((sport, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-navy">
                  <span>{sport.sport_name}</span>
                  <span className="text-primary">{sport.booking_count} {t('sessions')}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full" 
                    style={{ width: `${Math.min((sport.booking_count / (data.todayBookings || 1)) * 100, 100)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
