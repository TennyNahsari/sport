import React, { useState } from 'react';
import { Search, Calendar as CalendarIcon, Clock, Activity } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function BookingSearchWidget({ sports, outlets = [], onSearch }) {
  const { t } = useLanguage();
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState('19:00');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch({
      outletId: selectedOutlet,
      sportId: selectedSport,
      date: selectedDate,
      time: selectedTime
    });
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-card shadow-2xl p-6 md:p-8 border border-slate-100 max-w-xl w-full">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-3 h-3 rounded-full bg-sportgreen animate-pulse" />
        <h3 className="text-lg font-extrabold text-navy">{t('quickSearchTitle')}</h3>
      </div>

      <form onSubmit={handleSearchSubmit} className="space-y-4">
        {/* Outlet & Olahraga Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Outlet */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-primary" /> {t('labelOutlet') || 'Outlet'}
            </label>
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-button text-xs sm:text-sm font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('allOutlets')}</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Olahraga */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-primary" /> {t('labelSport')}
            </label>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-button text-xs sm:text-sm font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('allSports')}</option>
              {sports.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tanggal & Jam Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tanggal */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-primary" /> {t('labelDate')}
            </label>
            <input
              type="date"
              value={selectedDate}
              min={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-button text-xs sm:text-sm font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Jam */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" /> {t('labelStartTime')}
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-button text-xs sm:text-sm font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Array.from({ length: 15 }, (_, i) => {
                const hour = (8 + i).toString().padStart(2, '0');
                return (
                  <option key={hour} value={`${hour}:00`}>
                    {`${hour}:00 WIB`}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          className="w-full mt-2 py-4 bg-primary hover:bg-primary-hover text-white font-extrabold text-sm sm:text-base rounded-button shadow-lg shadow-primary/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Search className="w-5 h-5" />
          <span>{t('btnSearchAvailable')}</span>
        </button>
      </form>
    </div>
  );
}
