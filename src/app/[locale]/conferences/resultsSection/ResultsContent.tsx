// src/components/conferences/resultsSection/ResultsContent.tsx
import React from 'react';
import EventCard from '../EventCard';
import EventTable from '../EventTable';
import { ConferenceInfo } from '@/src/models/response/conference.list.response';

interface ResultsContentProps {
  viewType: 'card' | 'table';
  events: ConferenceInfo[];
  userBlacklist: string[];
  followedIds: Set<string>;
  calendarIds: Set<string>;
  onToggleFollow: (conferenceId: string, currentStatus: boolean) => Promise<void>;
  onToggleCalendar: (conferenceId: string, currentStatus: boolean) => Promise<void>;
  recommendationScores: { [key: string]: number };
}

export const ResultsContent: React.FC<ResultsContentProps> = ({
  viewType,
  events,
  userBlacklist,
  followedIds,
  calendarIds,
  onToggleFollow,
  onToggleCalendar,
  recommendationScores,
}) => {
  if (viewType === 'card') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {events.map(event => {
          const conferenceKey = `${event.acronym} - ${event.title}`;
          const score = recommendationScores[conferenceKey];
          return (
            <EventCard
              key={event.id}
              event={event}
              userBlacklist={userBlacklist}
              isFollowing={followedIds.has(event.id)}
              isAddToCalendar={calendarIds.has(event.id)}
              onToggleFollow={onToggleFollow}
              onToggleCalendar={onToggleCalendar}
              recommendationScore={score}
            />
          );
        })}
      </div>
    );
  }

  return (
    <EventTable
      events={events}
      userBlacklist={userBlacklist}
      recommendationScores={recommendationScores}
      // Note: You would need to update EventTable to accept and use these props
      // if you want follow/calendar actions directly in the table view.
      // For now, we assume actions are primarily in the card view.
    />
  );
};