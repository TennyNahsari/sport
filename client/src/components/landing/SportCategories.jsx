import React, { useRef, useState, useEffect } from 'react';
import { Trophy, Award, Disc, Activity, Compass, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

const iconMap = {
  badminton: Trophy,
  padel: Award,
  pingpong: Disc,
  futsal: Activity,
  minisoccer: Compass,
  tenis: Target
};

export default function SportCategories({ sports = [], selectedSportId, onSelectSport }) {
  const { t } = useLanguage();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);

  const allItems = [{ id: '', name: t('allCourts'), isAll: true }, ...sports];

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const cardWidth = scrollRef.current.firstElementChild?.offsetWidth || clientWidth;
    const index = Math.round(scrollLeft / (cardWidth + 16));
    setActivePageIndex(Math.min(index, allItems.length - 1));
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [sports]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild?.offsetWidth || 180;
    const scrollAmount = (cardWidth + 16) * (direction === 'left' ? -2 : 2);
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const scrollToIndex = (index) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild?.offsetWidth || 180;
    scrollRef.current.scrollTo({ left: index * (cardWidth + 16), behavior: 'smooth' });
  };

  return (
    <section id="sports" className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-extrabold text-primary uppercase tracking-widest">{t('catTitle')}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mt-1">{t('catHeading')}</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{t('catSub')}</p>
          </div>

          {/* Carousel Navigation Buttons */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-button border border-slate-200 self-start md:self-auto">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className="p-1.5 rounded-md hover:bg-white text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm disabled:shadow-none"
              title="Previous Category"
              aria-label="Previous Sport"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight && allItems.length <= 6}
              className="p-1.5 rounded-md hover:bg-white text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm disabled:shadow-none"
              title="Next Category"
              aria-label="Next Sport"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories Horizontal Carousel Container */}
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollBehavior: 'smooth' }}
          >
            {/* All Sports Card */}
            <button
              onClick={() => onSelectSport('')}
              className={`snap-start shrink-0 w-[46%] sm:w-[30%] md:w-[22%] lg:w-[calc(16.666%-14px)] p-4 rounded-card border text-left transition-all duration-200 flex flex-col justify-between select-none cursor-pointer ${
                selectedSportId === '' 
                  ? 'bg-navy text-white border-navy shadow-lg scale-[1.02] ring-2 ring-primary/30' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-navy'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm ${selectedSportId === '' ? 'bg-primary text-white' : 'bg-white text-navy border'}`}>
                ALL
              </div>
              <div className="mt-4">
                <h3 className="font-extrabold text-xs sm:text-sm">{t('allCourts')}</h3>
                <p className={`text-[11px] mt-0.5 line-clamp-1 ${selectedSportId === '' ? 'text-slate-300' : 'text-slate-500'}`}>{t('showAll')}</p>
              </div>
            </button>

            {/* Individual Sports Cards */}
            {sports.map((sport) => {
              const IconComponent = iconMap[sport.slug] || Trophy;
              const isSelected = selectedSportId === sport.id || selectedSportId === String(sport.id);

              return (
                <button
                  key={sport.id}
                  onClick={() => onSelectSport(sport.id)}
                  className={`snap-start shrink-0 w-[46%] sm:w-[30%] md:w-[22%] lg:w-[calc(16.666%-14px)] p-4 rounded-card border text-left transition-all duration-200 flex flex-col justify-between group select-none cursor-pointer ${
                    isSelected 
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-[1.02] ring-2 ring-primary/30' 
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-navy'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-white text-primary' : 'bg-slate-100 text-primary group-hover:bg-primary group-hover:text-white'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="mt-4">
                    <h3 className="font-extrabold text-xs sm:text-sm">{sport.name}</h3>
                    <p className={`text-[11px] mt-0.5 line-clamp-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {sport.description || 'Pro Facilities'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination Indicators / Dots */}
          {allItems.length > 4 && (
            <div className="flex items-center justify-center space-x-1.5 mt-4">
              {allItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activePageIndex === idx
                      ? 'w-5 bg-primary'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Slide to sport ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
