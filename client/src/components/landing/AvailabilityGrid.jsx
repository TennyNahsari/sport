import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function AvailabilityGrid({ courts, availabilityMap, selectedDate, onSelectSlot }) {
  const { t } = useLanguage();
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

  return (
    <section id="availability" className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Legend */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-extrabold text-sportgreen uppercase tracking-wider">{t('availTag')}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mt-1">{t('availHeading')}</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {t('availDateLabel')} <span className="font-extrabold text-navy underline">{selectedDate}</span>
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-slate-50 p-3 rounded-card border border-slate-200 mt-4 md:mt-0 text-xs font-extrabold">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-sportgreen" />
              <span className="text-slate-700">{t('availLegendAvailable')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-primary" />
              <span className="text-slate-700">{t('availLegendSelected')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-300" />
              <span className="text-slate-700">{t('availLegendBooked')}</span>
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-card shadow-sm bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-navy text-white font-bold border-b border-slate-700">
                <th className="p-4 sticky left-0 bg-navy z-20 min-w-[160px] sm:min-w-[180px]">{t('tableCourtHeader')}</th>
                {hours.map((hour) => (
                  <th key={hour} className="p-3 text-center min-w-[65px] border-l border-slate-800">
                    {hour}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courts.map((court) => {
                const slots = availabilityMap[court.id]?.slots || [];
                return (
                  <tr key={court.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Court Name (Sticky Left Column) */}
                    <td className="p-4 font-extrabold text-navy sticky left-0 bg-white shadow-sm border-r border-slate-200 z-10">
                      <div className="text-xs sm:text-sm">{court.name}</div>
                      <div className="text-[10px] sm:text-[11px] font-normal text-slate-500">{court.sport_name}</div>
                    </td>

                    {/* Hours Slots */}
                    {hours.map((hour) => {
                      const slot = slots.find((s) => s.time === hour);
                      const isAvailable = slot ? slot.status === 'Available' : true;

                      return (
                        <td key={hour} className="p-1.5 sm:p-2 text-center border-l border-slate-100">
                          {isAvailable ? (
                            <button
                              onClick={() => onSelectSlot(court, slot || { time: hour, endTime: `${parseInt(hour) + 1}:00` })}
                              className="w-full py-2 px-1 rounded-md bg-sportgreen-light hover:bg-sportgreen text-sportgreen hover:text-white font-bold text-[10px] sm:text-[11px] transition-all border border-sportgreen/20 cursor-pointer"
                            >
                              {t('statusAvailable')}
                            </button>
                          ) : (
                            <span className="inline-block w-full py-2 px-1 rounded-md bg-slate-100 text-slate-400 font-bold text-[10px] sm:text-[11px] cursor-not-allowed">
                              {t('statusBooked')}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}
