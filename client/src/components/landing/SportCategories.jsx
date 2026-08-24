import React from 'react';
import { Trophy, Award, Disc, Activity, Compass, Target } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

const iconMap = {
  badminton: Trophy,
  padel: Award,
  pingpong: Disc,
  futsal: Activity,
  minisoccer: Compass,
  tenis: Target
};

export default function SportCategories({ sports, selectedSportId, onSelectSport }) {
  const { t } = useLanguage();

  return (
    <section id="sports" className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-extrabold text-primary uppercase tracking-widest">{t('catTitle')}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mt-1">{t('catHeading')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 md:mt-0">{t('catSub')}</p>
        </div>

        {/* Categories Grid / Horizontal Scroll for Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <button
            onClick={() => onSelectSport('')}
            className={`p-4 rounded-card border text-left transition-all duration-200 flex flex-col justify-between ${
              selectedSportId === '' 
                ? 'bg-navy text-white border-navy shadow-lg scale-[1.03]' 
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-navy'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm ${selectedSportId === '' ? 'bg-primary text-white' : 'bg-white text-navy border'}`}>
              ALL
            </div>
            <div className="mt-4">
              <h3 className="font-extrabold text-xs sm:text-sm">{t('allCourts')}</h3>
              <p className={`text-[11px] mt-0.5 ${selectedSportId === '' ? 'text-slate-300' : 'text-slate-500'}`}>{t('showAll')}</p>
            </div>
          </button>

          {sports.map((sport) => {
            const IconComponent = iconMap[sport.slug] || Trophy;
            const isSelected = selectedSportId === sport.id || selectedSportId === String(sport.id);

            return (
              <button
                key={sport.id}
                onClick={() => onSelectSport(sport.id)}
                className={`p-4 rounded-card border text-left transition-all duration-200 flex flex-col justify-between group ${
                  isSelected 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-[1.03]' 
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

      </div>
    </section>
  );
}
