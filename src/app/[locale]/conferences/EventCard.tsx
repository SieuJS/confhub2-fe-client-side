// src/components/conferences/EventCard.tsx

import React, { memo } from 'react';
import { ConferenceInfo } from '../../../models/response/conference.list.response';
import { useTranslations } from 'next-intl';
import { MapPin, CalendarDays } from 'lucide-react';

// Import new sub-components
import { BlacklistOverlay } from './eventCard/BlacklistOverlay';
import { EventCardHeader } from './eventCard/EventCardHeader';
import { EventCardInfoRow } from './eventCard/EventCardInfoRow';
import { EventCardSubmissionDate } from './eventCard/EventCardSubmissionDate';
import { EventCardTopics } from './eventCard/EventCardTopics';
import { EventCardActions } from './eventCard/EventCardActions';

// Import new utils
import { formatDateRange } from '@/src/app/[locale]/conferences/utils/dateUtils';

interface EventCardProps {
  event: ConferenceInfo;
  className?: string;
  style?: React.CSSProperties;
  userBlacklist: string[];
  isFollowing: boolean;
  isAddToCalendar: boolean;
  onToggleFollow: (conferenceId: string, currentStatus: boolean) => Promise<void>;
  onToggleCalendar: (conferenceId: string, currentStatus: boolean) => Promise<void>;
  recommendationScore?: number;
}

const EventCardComponent: React.FC<EventCardProps> = ({
  event,
  className,
  style,
  userBlacklist,
  isFollowing,
  isAddToCalendar,
  onToggleFollow,
  onToggleCalendar,
  recommendationScore,
}) => {
  const t = useTranslations('');
  
  const isBlacklisted = userBlacklist?.includes(event.id) ?? false;
  
  const locationString = [event.location?.address].filter(Boolean).join(', ') || t('Location_not_available');
  const dateRangeString = formatDateRange(event.dates?.fromDate, event.dates?.toDate);

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg bg-white-pure shadow-lg transition duration-300 ease-in-out ${isBlacklisted ? '' : 'hover:shadow-xl'} ${className || ''}`}
      style={{ position: 'relative', ...style }}
    >
      {isBlacklisted && <BlacklistOverlay t={t} />}

      <div className={`flex flex-grow flex-col px-4 py-4 ${isBlacklisted ? 'pointer-events-none' : ''}`}>
        
        <EventCardHeader
          event={event}
          isBlacklisted={isBlacklisted}
          recommendationScore={recommendationScore}
          t={t}
        />

        <EventCardInfoRow icon={<MapPin className="mr-1.5 flex-shrink-0 text-red-600" size={16} strokeWidth={1.5} />}>
          <span className="line-clamp-1 text-left">{locationString}</span>
        </EventCardInfoRow>

        <EventCardInfoRow icon={<CalendarDays className="mr-1.5 flex-shrink-0 text-red-600" size={16} strokeWidth={1.5} />}>
          <span className="text-left">{dateRangeString}</span>
        </EventCardInfoRow>

        <EventCardSubmissionDate submissionDates={event.submissionDates} />

        <EventCardTopics topics={event.topics} isBlacklisted={isBlacklisted} t={t} />

        <EventCardActions
          eventId={event.id}
          eventLink={event.link}
          isFollowing={isFollowing}
          isAddToCalendar={isAddToCalendar}
          isBlacklisted={isBlacklisted}
          onToggleFollow={onToggleFollow}
          onToggleCalendar={onToggleCalendar}
          t={t}
        />
      </div>
    </div>
  );
};

export const EventCard = memo(EventCardComponent);
export default EventCard;