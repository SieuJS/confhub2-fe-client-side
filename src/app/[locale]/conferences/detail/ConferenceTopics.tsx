// src/app/[locale]/conference/detail/ConferenceTopics.tsx
import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/navigation'; //

interface ConferenceTopicsProps {
  displayedTopics: string[];
  hasMoreTopics: boolean;
  showAllTopics: boolean;
  setShowAllTopics: (show: boolean) => void;
}

const ConferenceTopics: React.FC<ConferenceTopicsProps> = ({
  displayedTopics,
  hasMoreTopics,
  showAllTopics,
  setShowAllTopics,
}) => {
  const t = useTranslations('');

  return (
    <div className='mt-4 border-t pt-4 md:mt-2 md:border-0 md:pt-0'>
      <h2 className='mb-2 text-base font-semibold md:text-lg'>{t('Topics')}:</h2>
      <div className='flex flex-wrap gap-2'>
        {displayedTopics.length > 0 ? (
          displayedTopics.map(topic => (
            <Link
              key={topic}
              href={{
                pathname: `/conferences`,
                query: { topics: topic },
              }}
            >
              <span className='bg-gray-20 hover:bg-gray-30 cursor-pointer rounded-full px-3 py-1 text-sm font-medium'>
                {topic}
              </span>
            </Link>
          ))
        ) : (
          <p className='text-sm'>{t('No_topics_listed')}</p>
        )}
        {hasMoreTopics && (
          <button
            className='rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200'
            onClick={() => setShowAllTopics(!showAllTopics)}
          >
            {showAllTopics ? t('View_Less') : t('View_More')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ConferenceTopics;