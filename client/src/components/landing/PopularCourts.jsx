import React, { useRef } from 'react';
import CourtCard from './CourtCard';
import { Sparkles, Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function PopularCourts({ courts, availabilityMap, selectedDate, setSelectedDate, onSelectSlot, onBookCourt }) {
  const { t } = useLanguage();
  const todayStr = new Date().toISOString().split('T')[0];
  const scrollContainerRef = useRef(null);

  // Horizontal Side-to-Side Pagination Controls
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  return (
    <section id="courts" className="py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('courtsBadge')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">{t('courtsHeading')}</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {t('courtsSub')}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
            {/* Date Picker Bar */}
            <div className="flex items-center space-x-2 bg-white p-2 rounded-card border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-600 pl-1 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-primary" /> {t('labelDate')}:
              </span>
              <input
                type="date"
                value={selectedDate}
                min={todayStr}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-button text-xs font-extrabold text-navy focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              />
            </div>

            {/* Side-to-Side Pagination Buttons */}
            {courts.length > 0 && (
              <div className="flex items-center space-x-2 bg-white p-1.5 rounded-card border border-slate-200 shadow-sm">
                <button
                  onClick={handleScrollLeft}
                  className="p-2 rounded-button bg-slate-50 hover:bg-primary hover:text-white text-navy font-bold transition-all shadow-xs"
                  title="Geser Ke Kiri / Slide Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleScrollRight}
                  className="p-2 rounded-button bg-slate-50 hover:bg-primary hover:text-white text-navy font-bold transition-all shadow-xs"
                  title="Geser Ke Kanan / Slide Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Scrollable Carousel Slider */}
        {courts.length === 0 ? (
          <div className="bg-white p-12 rounded-card border text-center text-slate-500">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-navy">{t('noCourtsMatch')}</p>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex space-x-6 overflow-x-auto custom-scrollbar pb-6 pt-2 snap-x snap-mandatory"
          >
            {courts.map((court) => (
              <div
                key={court.id}
                className="w-[300px] sm:w-[360px] flex-shrink-0 snap-start"
              >
                <CourtCard
                  court={court}
                  slots={availabilityMap[court.id]?.slots}
                  selectedDate={selectedDate}
                  onSelectSlot={onSelectSlot}
                  onBookCourt={onBookCourt}
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
