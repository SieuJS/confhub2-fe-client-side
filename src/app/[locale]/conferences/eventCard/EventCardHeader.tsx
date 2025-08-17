// src/components/conferences/eventCard/EventCardHeader.tsx
import React from 'react';
import { Link } from '@/src/navigation';
import { ConferenceInfo } from '../../../../models/response/conference.list.response';
import { getRankColor, getAccessTypeColor, getMatchScoreColor } from '@/src/app/[locale]/conferences/utils/styleUtils';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Sparkles } from 'lucide-react';

interface EventCardHeaderProps {
  event: Pick<ConferenceInfo, 'id' | 'title' | 'acronym' | 'rank' | 'accessType' | 'creatorId'>;
  isBlacklisted: boolean;
  recommendationScore?: number;
  t: (key: string) => string;
}

export const EventCardHeader: React.FC<EventCardHeaderProps> = ({ event, isBlacklisted, recommendationScore, t }) => {
  const titleContent = `${event.title} ${event.acronym ? `(${event.acronym})` : ''}`;
  const isByUserEvent = event.creatorId !== null && event.creatorId !== undefined;

  return (
    <div className="relative mb-2 flex flex-col items-start">
      <div className="w-full flex-grow">
        {isBlacklisted ? (
          <h3 className="text-left text-base font-bold opacity-50">{titleContent}</h3>
        ) : (
          <Link href={{ pathname: `/conferences/detail`, query: { id: event.id } }} className="group">
            <h3 className="cursor-pointer text-left text-base font-bold transition duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {titleContent}
            </h3>
          </Link>
        )}
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {isByUserEvent ? (
          <span className="font-semibold bg-gray-100 text-gray-60 border border-gray-300 rounded px-2 py-1 text-xs">
            {t('By_Users')}
          </span>
        ) : (
          event.rank && (
            <span className={`font-semibold ${getRankColor(event.rank)} rounded px-2 py-1 text-xs`}>
              {`Rank: ${event.rank}`}
            </span>
          )
        )}
        {event.accessType && (
          <span
            className={`rounded px-2 py-1 text-xs font-semibold ${getAccessTypeColor(event.accessType)}`}
            title={`${t('Access_Type')}: ${event.accessType}`}
          >
            {event.accessType}
          </span>
        )}
        {recommendationScore !== undefined && (
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className={`flex items-center rounded px-2 py-1 text-xs font-semibold ${getMatchScoreColor(recommendationScore)}`}>
                  <Sparkles className="mr-1" size={14} />
                  {`Match: ${(recommendationScore / 5 * 100).toFixed(0)}%`}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="max-w-xs rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-lg" sideOffset={5}>
                  Personalized match score based on your activity.
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        )}
      </div>
    </div>
  );
};