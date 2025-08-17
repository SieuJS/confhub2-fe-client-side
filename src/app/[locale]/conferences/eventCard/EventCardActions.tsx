// src/components/conferences/eventCard/EventCardActions.tsx
import React from 'react';
import { useEventCardActions } from '@/src/hooks/conferences/useEventCardActions';
import { SquareArrowOutUpRight, CalendarPlus, Star } from 'lucide-react';

interface EventCardActionsProps {
  eventId: string;
  eventLink: string | null | undefined;
  isFollowing: boolean;
  isAddToCalendar: boolean;
  isBlacklisted: boolean;
  onToggleFollow: (conferenceId: string, currentStatus: boolean) => Promise<void>;
  onToggleCalendar: (conferenceId: string, currentStatus: boolean) => Promise<void>;
  t: (key: string) => string;
}

export const EventCardActions: React.FC<EventCardActionsProps> = (props) => {
  const { followLoading, calendarLoading, handleFavoriteClick, handleAddCalendarClick, handleGoToWebsite } = useEventCardActions(props);
  const { t, eventLink, isBlacklisted, isFollowing, isAddToCalendar } = props;

  return (
    <div className="mt-auto flex items-center justify-end border-t border-gray-200 pt-3">
      <div className="flex space-x-2">
        <button
          onClick={e => handleGoToWebsite(e, eventLink || undefined)}
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-10 p-2 transition hover:bg-gray-20 hover:text-gray-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${isBlacklisted || !eventLink ? 'disabled:cursor-not-allowed disabled:opacity-50' : ''}`}
          disabled={isBlacklisted || !eventLink}
          title={t('Go_to_Website')}
        >
          <SquareArrowOutUpRight size={18} strokeWidth={1.75} />
        </button>
        <button
          onClick={handleAddCalendarClick}
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-10 p-2 transition hover:bg-gray-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${isBlacklisted ? 'disabled:cursor-not-allowed disabled:opacity-50' : ''} ${isAddToCalendar ? 'bg-blue-50 text-blue-600 hover:text-blue-700' : 'hover:text-gray-80'} ${calendarLoading ? 'opacity-70' : ''}`}
          disabled={isBlacklisted || calendarLoading}
          title={isAddToCalendar ? t('Remove_from_Calendar') : t('Add_to_Calendar')}
        >
          {calendarLoading ? (
            <div className={`h-4 w-4 animate-spin rounded-full border-2 ${isAddToCalendar ? 'border-blue-500 border-t-blue-100' : 'border-gray-400 border-t-transparent'}`}></div>
          ) : (
            <CalendarPlus size={18} strokeWidth={1.75} />
          )}
        </button>
        <button
          onClick={handleFavoriteClick}
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-10 p-2 transition hover:bg-gray-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${isBlacklisted ? 'disabled:cursor-not-allowed disabled:opacity-50' : ''} ${isFollowing ? 'bg-yellow-50 text-yellow-500 hover:text-yellow-600' : 'hover:text-gray-80'} ${followLoading ? 'opacity-70' : ''}`}
          disabled={isBlacklisted || followLoading}
          title={isFollowing ? t('Unfollow') : t('Follow')}
        >
          {followLoading ? (
            <div className={`h-4 w-4 animate-spin rounded-full border-2 ${isFollowing ? 'border-yellow-500 border-t-yellow-100' : 'border-gray-400 border-t-transparent'}`}></div>
          ) : (
            <Star size={20} strokeWidth={1.5} fill={isFollowing ? 'currentColor' : 'none'} />
          )}
        </button>
      </div>
    </div>
  );
};