// src/app/[locale]/dashboard/note/DateDetailsLegend.tsx
import React from 'react';
import { useTranslations } from 'next-intl';

const DateDetailsLegend: React.FC = () => {
  const t = useTranslations('');
  return (
    <section className="mb-4 rounded-md bg-background py-2 px-4 shadow">
      <ul className="flex flex-wrap flex-row gap-2 md:gap-4 lg:gap-8 justify-center">
        <li className="flex items-center"><div className="mr-2 h-4 w-4 rounded-full bg-teal-400"></div><span className="text-sm">{t('Conference')}</span></li>
        <li className="flex items-center"><div className="mr-2 h-4 w-4 rounded-full bg-red-400"></div><span className="text-sm">{t('Submission')}</span></li>
        <li className="flex items-center"><div className="mr-2 h-4 w-4 rounded-full bg-blue-400"></div><span className="text-sm">{t('Notification')}</span></li>
        <li className="flex items-center"><div className="mr-2 h-4 w-4 rounded-full bg-orange-400"></div><span className="text-sm">{t('Camera_Ready')}</span></li>
        <li className="flex items-center"><div className="mr-2 h-4 w-4 rounded-full bg-cyan-400"></div><span className="text-sm">{t('Registration')}</span></li>
        {/* <li className="flex items-center"><div className="mr-2 h-4 w-4 rounded-full bg-yellow-400"></div><span className="text-sm">{t('Your_notes')}</span></li> */}
        <li className="flex items-center"><div className="mr-2 h-4 w-4 rounded-full bg-gray-400"></div><span className="text-sm">{t('Other')}</span></li>
      </ul>
    </section>
  );
};

export default DateDetailsLegend;