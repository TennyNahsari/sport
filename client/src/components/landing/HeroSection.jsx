import React from 'react';
import BookingSearchWidget from './BookingSearchWidget';
import { ShieldCheck, Zap, Star, Users } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function HeroSection({ sports, outlets = [], onSearch }) {
  const { t } = useLanguage();

  return (
    <section className="relative bg-navy text-white overflow-hidden py-12 md:py-24">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-sportgreen/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & Features */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-bold text-orange">
              <Zap className="w-4 h-4 text-orange animate-bounce" />
              <span>{t('badgeNoLogin')}</span>
            </div>

            {/* Main Headline H1 */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
              {t('heroHeadline1')} <br />
              <span className="bg-gradient-to-r from-blue-400 via-primary to-sportgreen bg-clip-text text-transparent">
                {t('heroHeadline2')}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-slate-300 text-sm sm:text-lg max-w-2xl leading-relaxed">
              {t('heroSubheadline')}
            </p>

            {/* Feature Badges */}
            <div className="pt-2 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg border-t border-slate-800">
              <div className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs font-semibold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-sportgreen shrink-0" />
                <span>{t('featAntiDouble')}</span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs font-semibold text-slate-300">
                <Star className="w-4 h-4 text-orange shrink-0" />
                <span>{t('featProStandard')}</span>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs font-semibold text-slate-300">
                <Users className="w-4 h-4 text-primary shrink-0" />
                <span>{t('featNoAccount')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Search Widget */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <BookingSearchWidget sports={sports} outlets={outlets} onSearch={onSearch} />
          </div>

        </div>
      </div>
    </section>
  );
}
