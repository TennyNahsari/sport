import React from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function CourtCard({ court, slots, selectedDate, onSelectSlot, onBookCourt }) {
  const { t } = useLanguage();

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(court.price_per_hour);

  const previewSlots = slots ? slots.slice(10, 16) : [];

  return (
    <div className="bg-white rounded-card overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      
      {/* Top Image & Badge */}
      <div>
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
          <img
            src={court.image_url}
            alt={court.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 bg-navy/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {court.sport_name}
          </div>
          
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-navy text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
            {formattedPrice} <span className="text-[10px] font-normal text-slate-500">{t('perHour')}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <h3 className="text-xl font-extrabold text-navy group-hover:text-primary transition-colors">
            {court.name}
          </h3>

          {/* Facilities Pills */}
          <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
            {court.facilities && court.facilities.map((fac, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-slate-200">
                {fac}
              </span>
            ))}
          </div>

          {/* Time Slot Availability Preview */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" /> {t('availabilityFor')} ({selectedDate}):
              </span>
              <span className="text-[11px] text-sportgreen font-bold">{t('availLegendAvailable')}</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {previewSlots.map((slot, i) => {
                const isAvailable = slot.status === 'Available';
                return (
                  <button
                    key={i}
                    disabled={!isAvailable}
                    onClick={() => onSelectSlot(court, slot)}
                    className={`py-1.5 px-1 text-center rounded text-[11px] font-bold border transition-all ${
                      isAvailable
                        ? 'bg-sportgreen-light text-sportgreen border-sportgreen/30 hover:bg-sportgreen hover:text-white cursor-pointer'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-5 pt-0">
        <button
          onClick={() => onBookCourt(court)}
          className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm rounded-button shadow-md shadow-primary/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
        >
          <Calendar className="w-4 h-4" />
          <span>{t('btnBookSelectDate')}</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

    </div>
  );
}
