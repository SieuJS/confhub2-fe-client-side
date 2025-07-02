// src/app/[locale]/dashboard/notifications/NotificationFilter.tsx

import React from 'react';
import { useTranslations } from 'next-intl';

type FilterType = 'all' | 'unread' | 'read' | 'important';

interface NotificationFilterProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const NotificationFilter: React.FC<NotificationFilterProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  const t = useTranslations('');

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: t('All') },
    { key: 'unread', label: t('Unread') },
    { key: 'read', label: t('Read') },
    { key: 'important', label: t('Important') },
  ];

  return (
    <div className='flex flex-wrap gap-2'>
      {filters.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`rounded px-3 py-1 text-sm md:px-4 md:py-2 ${
            currentFilter === key
              ? 'bg-button text-white'
              : 'bg-gray-20 hover:bg-gray-30'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default NotificationFilter;