import React, { useState } from 'react';
import { Trophy, Calendar, Search, UserCheck, Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function Navbar({ activeView, setActiveView, onQuickBooking, onOpenCheckBooking }) {
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLang(lang === 'id' ? 'en' : 'id');
  };

  return (
    <nav className="sticky top-0 z-40 bg-navy/95 backdrop-blur-md text-white border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('customer')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-md shadow-primary/30">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-1">
                {t('brandName')}
              </span>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 tracking-wider uppercase -mt-1">
                {t('slogan')}
              </p>
            </div>
          </div>

          {/* Desktop Center Links */}
          {activeView === 'customer' && (
            <div className="hidden lg:flex items-center space-x-7 text-xs font-bold text-slate-300">
              <a href="#sports" className="hover:text-white transition-colors">{t('navSports')}</a>
              <a href="#courts" className="hover:text-white transition-colors">{t('navCourts')}</a>
              <a href="#availability" className="hover:text-white transition-colors">{t('navAvailability')}</a>
              <a href="#facilities" className="hover:text-white transition-colors">{t('navFacilities')}</a>
              <a href="#why-us" className="hover:text-white transition-colors">{t('navWhyUs')}</a>
            </div>
          )}

          {/* Action Buttons & Language Switcher */}
          <div className="hidden sm:flex items-center space-x-2.5">
            
            {/* Multi-Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-button bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all cursor-pointer"
              title="Switch Language / Ganti Bahasa"
            >
              <Globe className="w-4 h-4 text-primary" />
              <span className="uppercase">{lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
            </button>

            {activeView === 'customer' ? (
              <>
                {/* Tombol Cek Booking */}
                <button
                  onClick={onOpenCheckBooking}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-button text-xs font-extrabold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                >
                  <Search className="w-3.5 h-3.5 text-primary" />
                  <span>{t('btnCheckBooking')}</span>
                </button>

                {/* Tombol Booking Sekarang */}
                <button
                  onClick={onQuickBooking}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-button text-xs font-extrabold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30 transition-all hover:scale-105"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t('btnBookNow')}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveView('customer')}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-button text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                <UserCheck className="w-4 h-4 text-sportgreen" />
                <span>{t('btnCustomerView')}</span>
              </button>
            )}

          </div>

          {/* Mobile Hamburger & Controls */}
          <div className="flex sm:hidden items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-button bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 uppercase"
            >
              {lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-button bg-slate-800 text-slate-200 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-navy border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-300">
            <a href="#sports" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-800">{t('navSports')}</a>
            <a href="#courts" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-800">{t('navCourts')}</a>
            <a href="#availability" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-800">{t('navAvailability')}</a>
            <a href="#facilities" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-800">{t('navFacilities')}</a>
          </div>

          <div className="pt-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenCheckBooking(); }}
              className="w-full py-2.5 px-3 bg-slate-800 text-white rounded-button text-xs font-bold flex items-center justify-center space-x-1 mb-2"
            >
              <Search className="w-4 h-4 text-primary" />
              <span>{t('btnCheckBooking')}</span>
            </button>

            <button
              onClick={() => { setMobileMenuOpen(false); onQuickBooking(); }}
              className="w-full py-3 bg-primary text-white rounded-button text-xs font-extrabold shadow-md flex items-center justify-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('btnBookNow')}</span>
            </button>
          </div>
        </div>
      )}

    </nav>
  );
}
