import React from 'react';
import { ShieldCheck, Zap, Award, Clock } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function WhyChooseUs() {
  const { t } = useLanguage();

  const features = [
    {
      icon: ShieldCheck,
      title: t('feat1Title'),
      description: t('feat1Desc'),
      color: 'text-sportgreen',
      bg: 'bg-sportgreen-light'
    },
    {
      icon: Zap,
      title: t('feat2Title'),
      description: t('feat2Desc'),
      color: 'text-primary',
      bg: 'bg-blue-50'
    },
    {
      icon: Award,
      title: t('feat3Title'),
      description: t('feat3Desc'),
      color: 'text-orange',
      bg: 'bg-orange-light'
    },
    {
      icon: Clock,
      title: t('feat4Title'),
      description: t('feat4Desc'),
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ];

  return (
    <section id="why-us" className="py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold text-primary uppercase tracking-widest">{t('whyUsTag')}</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy mt-1">{t('whyUsHeading')}</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">
            {t('whyUsSub')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-card border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
