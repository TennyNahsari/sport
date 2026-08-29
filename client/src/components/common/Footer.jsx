import React, { useState, useEffect } from 'react';
import { Trophy, Phone, Mail, MapPin, Instagram, Facebook, ShieldCheck, Twitter, Youtube, Linkedin } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

// Custom Threads SVG Icon component
function ThreadsIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.186 24.004c-3.142 0-5.834-.95-7.795-2.748-2.102-1.928-3.167-4.675-3.167-8.165 0-3.535 1.077-6.31 3.203-8.247C6.442 3.003 9.245 2.012 12.56 2.012c3.42 0 6.223.99 8.33 2.946 1.942 1.802 2.922 4.298 2.922 7.42 0 .61-.044 1.258-.13 1.93-.095.747-.247 1.487-.453 2.2-.423 1.465-1.127 2.668-2.09 3.578-1.026.968-2.316 1.503-3.834 1.59-.22.012-.44.018-.658.018-1.28 0-2.36-.375-3.21-1.116-.764-.666-1.196-1.572-1.286-2.696h.024c.732.612 1.63.923 2.67.923.972 0 1.776-.296 2.388-.88.636-.607.96-1.444.96-2.487 0-.968-.316-1.764-.94-2.366-.605-.584-1.393-.88-2.345-.88-1.076 0-1.986.37-2.705 1.1-.736.745-1.104 1.737-1.104 2.948 0 1.348.437 2.44 1.3 3.245.748.697 1.688 1.066 2.795 1.097-1.087.697-2.378 1.05-3.838 1.05-1.84 0-3.37-.53-4.545-1.575-1.185-1.054-1.786-2.58-1.786-4.536 0-1.97.608-3.52 1.808-4.607 1.19-1.077 2.812-1.623 4.823-1.623 2.08 0 3.738.547 4.928 1.626 1.144 1.037 1.724 2.474 1.724 4.27 0 2.214-.644 3.96-1.916 5.188-1.18 1.14-2.735 1.718-4.62 1.718h-.06c-1.312 0-2.476-.328-3.46-.975-1.07-.704-1.614-1.758-1.614-3.132 0-1.096.386-2.023 1.15-2.756.748-.718 1.706-1.082 2.848-1.082 1.042 0 1.874.296 2.472.88.583.57.878 1.318.878 2.224 0 .615-.173 1.12-.515 1.5-.333.37-.788.556-1.352.556-.47 0-.85-.147-1.13-.44-.273-.284-.41-.673-.41-1.157 0-.398.118-.737.35-.97.23-.23.55-.347.96-.347.16 0 .317.02.47.06.12-.416.036-.783-.25-1.1-.28-.31-.69-.465-1.23-.465-.68 0-1.235.215-1.65.645-.41.43-.615 1.002-.615 1.715 0 .848.293 1.54.88 2.076.577.525 1.334.79 2.25.79 1.13 0 2.094-.378 2.868-1.13.784-.764 1.176-1.77 1.176-3.02 0-1.353-.456-2.464-1.368-3.3-1.01-1.002-2.39-1.51-4.103-1.51-1.848 0-3.328.533-4.4 1.583-1.054 1.033-1.59 2.457-1.59 4.233 0 1.77.536 3.195 1.59 4.234 1.072 1.05 2.552 1.583 4.4 1.583.82 0 1.623-.112 2.388-.334z" />
    </svg>
  );
}

export default function Footer() {
  const { t } = useLanguage();

  const [socialLinks, setSocialLinks] = useState({
    instagram_url: 'https://instagram.com',
    twitter_url: 'https://x.com',
    youtube_url: 'https://youtube.com',
    facebook_url: 'https://facebook.com',
    linkedin_url: 'https://linkedin.com',
    threads_url: 'https://threads.net'
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSocialLinks({
            instagram_url: data.data.instagram_url || '',
            twitter_url: data.data.twitter_url || '',
            youtube_url: data.data.youtube_url || '',
            facebook_url: data.data.facebook_url || '',
            linkedin_url: data.data.linkedin_url || '',
            threads_url: data.data.threads_url || ''
          });
        }
      })
      .catch(err => console.error('[Footer] Failed to fetch settings:', err));
  }, []);

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
            <div className="flex flex-wrap items-center gap-2.5 text-slate-400 pt-1">
              {socialLinks.instagram_url && (
                <a href={socialLinks.instagram_url} target="_blank" rel="noopener noreferrer" title="Instagram" className="p-2 rounded-lg bg-slate-800/80 hover:bg-primary hover:text-white transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {socialLinks.twitter_url && (
                <a href={socialLinks.twitter_url} target="_blank" rel="noopener noreferrer" title="Twitter / X" className="p-2 rounded-lg bg-slate-800/80 hover:bg-primary hover:text-white transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {socialLinks.youtube_url && (
                <a href={socialLinks.youtube_url} target="_blank" rel="noopener noreferrer" title="YouTube" className="p-2 rounded-lg bg-slate-800/80 hover:bg-primary hover:text-white transition-all">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {socialLinks.facebook_url && (
                <a href={socialLinks.facebook_url} target="_blank" rel="noopener noreferrer" title="Facebook" className="p-2 rounded-lg bg-slate-800/80 hover:bg-primary hover:text-white transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {socialLinks.linkedin_url && (
                <a href={socialLinks.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="p-2 rounded-lg bg-slate-800/80 hover:bg-primary hover:text-white transition-all">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {socialLinks.threads_url && (
                <a href={socialLinks.threads_url} target="_blank" rel="noopener noreferrer" title="Threads" className="p-2 rounded-lg bg-slate-800/80 hover:bg-primary hover:text-white transition-all">
                  <ThreadsIcon className="w-4 h-4" />
                </a>
              )}
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
