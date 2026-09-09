import React, { useRef, useState, useEffect } from 'react';
import { Building2, MapPin, Phone, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function OutletSelector({ outlets = [], selectedOutletId, onSelectOutlet }) {
  const { t } = useLanguage();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate approximate page index based on card width
    if (clientWidth > 0 && outlets.length > 0) {
      const cardWidth = scrollRef.current.firstElementChild?.offsetWidth || clientWidth;
      const index = Math.round(scrollLeft / (cardWidth + 20));
      setActivePageIndex(Math.min(index, outlets.length - 1));
      
      const cardsVisible = Math.max(1, Math.round(clientWidth / cardWidth));
      setTotalPages(Math.max(1, Math.ceil(outlets.length / cardsVisible)));
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [outlets]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild?.offsetWidth || 340;
    const scrollAmount = (cardWidth + 24) * (direction === 'left' ? -1 : 1);
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const scrollToIndex = (index) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild?.offsetWidth || 340;
    scrollRef.current.scrollTo({ left: index * (cardWidth + 24), behavior: 'smooth' });
  };

  return (
    <section id="outlets" className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>{t('outletsTag')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mt-1">{t('outletsHeading')}</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {t('outletsSub')}
            </p>
          </div>

          {/* Right Action: All Outlets Button & Carousel Controls */}
          <div className="flex items-center space-x-3 self-start md:self-auto">
            <button
              onClick={() => onSelectOutlet('')}
              className={`px-4 py-2 rounded-button text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                selectedOutletId === ''
                  ? 'bg-navy text-white border-navy shadow-md'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span>{t('allOutlets')}</span>
              {selectedOutletId === '' && <CheckCircle2 className="w-3.5 h-3.5 text-sportgreen" />}
            </button>

            {/* Horizontal Pagination Prev / Next Buttons */}
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-button border border-slate-200">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                className="p-1.5 rounded-md hover:bg-white text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm disabled:shadow-none"
                title="Previous Branch"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight && outlets.length <= 3}
                className="p-1.5 rounded-md hover:bg-white text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm disabled:shadow-none"
                title="Next Branch"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scrollable / Paginated Outlets Container */}
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollBehavior: 'smooth' }}
          >
            {outlets.map((outlet, idx) => {
              const isSelected = selectedOutletId === outlet.id || selectedOutletId === String(outlet.id);

              return (
                <div
                  key={outlet.id}
                  onClick={() => onSelectOutlet(outlet.id)}
                  className={`snap-start shrink-0 w-[88%] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] group relative rounded-card border-2 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between select-none ${
                    isSelected
                      ? 'border-primary shadow-xl shadow-primary/20 scale-[1.01] bg-white ring-2 ring-primary/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Outlet Cover Image */}
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img
                        src={outlet.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'}
                        alt={outlet.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />

                      {/* Active Selected Badge */}
                      {isSelected && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-primary text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center space-x-1 shadow-md animate-pulse">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>DIPILIH</span>
                        </span>
                      )}

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="text-[10px] uppercase font-mono font-extrabold text-blue-300 block mb-0.5">
                          CABANG #{idx + 1}
                        </span>
                        <h3 className="font-extrabold text-base sm:text-lg leading-snug drop-shadow-sm line-clamp-1">
                          {outlet.name}
                        </h3>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-4 space-y-2 text-xs">
                      <p className="text-slate-600 flex items-start gap-1.5 leading-snug line-clamp-2 min-h-[34px]">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{outlet.address}</span>
                      </p>

                      {outlet.phone && (
                        <p className="text-slate-500 flex items-center gap-1.5 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-sportgreen shrink-0" />
                          <span>{outlet.phone}</span>
                        </p>
                      )}

                      {outlet.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 pt-1 border-t border-slate-100">
                          {outlet.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer Action Card */}
                  <div className={`px-4 py-3 border-t text-xs font-bold flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-blue-50/80 border-blue-100 text-primary' : 'bg-slate-50 border-slate-100 text-slate-600 group-hover:bg-slate-100'
                  }`}>
                    <span className="text-[11px]">
                      {outlet.courts_count ? `${outlet.courts_count} Lapangan Tersedia` : 'Lihat Lapangan'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span>{isSelected ? 'Outlet Aktif' : 'Pilih Outlet Ini'}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-0.5' : 'group-hover:translate-x-1'}`} />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Pagination Indicators / Dots */}
          {outlets.length > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              {outlets.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activePageIndex === idx
                      ? 'w-6 bg-primary'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Slide to branch ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
