import React from 'react';
import { Trophy, Phone, Mail, MapPin, Instagram, Facebook, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-navy text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">Sport<span className="text-primary">Book</span></span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {t('footerDesc')}
            </p>
            <div className="flex space-x-3 text-slate-400">
              <a href="#" className="hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Olahraga */}
          <div>
            <h4 className="text-white font-bold mb-4">{t('navSports')}</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#sports" className="hover:text-white transition-colors">Badminton Court</a></li>
              <li><a href="#sports" className="hover:text-white transition-colors">Padel Arena</a></li>
              <li><a href="#sports" className="hover:text-white transition-colors">Pingpong Studio</a></li>
              <li><a href="#sports" className="hover:text-white transition-colors">Futsal Field</a></li>
              <li><a href="#sports" className="hover:text-white transition-colors">Minisoccer Stadium</a></li>
              <li><a href="#sports" className="hover:text-white transition-colors">Tennis Hard & Clay Court</a></li>
            </ul>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="text-white font-bold mb-4">{t('footerCustomerService')}</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#courts" className="hover:text-white transition-colors">{t('navCourts')}</a></li>
              <li><a href="#availability" className="hover:text-white transition-colors">{t('navAvailability')}</a></li>
              <li><a href="#why-us" className="hover:text-white transition-colors">{t('navWhyUs')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4">{t('footerContactUs')}</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>Jl. Sports Club No. 88, Jakarta Selatan</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-sportgreen shrink-0" />
                <span>+62 812 3456 7890 (WhatsApp)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-orange shrink-0" />
                <span>support@sportbook.co.id</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 SportBook. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-sportgreen" /> {t('feat1Title')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
