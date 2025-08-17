// src/components/conferences/eventCard/EventCardTopics.tsx
import React from 'react';
import { Link } from '@/src/navigation';

interface EventCardTopicsProps {
  topics: string[] | undefined;
  isBlacklisted: boolean;
  t: (key: string) => string;
}

export const EventCardTopics: React.FC<EventCardTopicsProps> = ({ topics, isBlacklisted, t }) => (
  <div className="mb-4">
    <div className="flex flex-wrap items-center gap-1.5">
      {topics && topics.length > 0 ? (
        <>
          {topics.slice(0, 3).map(topic =>
            isBlacklisted ? (
              <span key={topic} className="inline-flex max-w-full cursor-default items-center justify-center break-words rounded-full bg-gray-10 px-2.5 py-1.5 text-center text-xs font-medium leading-normal opacity-50" title={topic}>
                {topic}
              </span>
            ) : (
              <Link key={topic} href={{ pathname: `/conferences`, query: { topics: topic } }}>
                <span className="inline-flex max-w-full cursor-pointer items-center justify-center break-words rounded-full bg-gray-10 px-2.5 py-1 text-center text-xs font-medium leading-normal transition duration-200 hover:bg-gray-20" title={topic}>
                  {topic}
                </span>
              </Link>
            )
          )}
          {topics.length > 3 && (
            <span key="more-topics" className="mt-1 inline-flex max-w-full cursor-default items-center justify-center rounded-full bg-gray-30 px-2.5 py-1 text-xs font-medium" title={`${topics.length - 3} more topics`}>
              +{topics.length - 3} {t('more')}
            </span>
          )}
        </>
      ) : (
        <span className="text-xs italic">{t('No_topics_listed')}</span>
      )}
    </div>
  </div>
);