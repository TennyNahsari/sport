import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function WhatsAppFloatingButton() {
  const { t } = useLanguage();
  const [waNumber, setWaNumber] = useState('6281234567890');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.whatsapp_number) {
          setWaNumber(data.data.whatsapp_number);
        }
      })
      .catch(err => console.error('Failed to load WA number:', err));
  }, []);

  const cleanWaNumber = (waNumber || '6281234567890').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent('Halo SportBook Admin, saya ingin bertanya mengenai sewa lapangan.')}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-3 sm:px-4 sm:py-3.5 rounded-full shadow-2xl flex items-center space-x-2.5 transition-all duration-300 transform hover:scale-105 group border-2 border-white/30"
      title={t('chatWAAdmin')}
    >
      <div className="relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
        <MessageSquare className="w-6 h-6 fill-current relative z-10" />
      </div>
      <span className="text-xs sm:text-sm font-extrabold tracking-wide hidden sm:inline-block">
        {t('chatWAAdmin')}
      </span>
    </a>
  );
}
