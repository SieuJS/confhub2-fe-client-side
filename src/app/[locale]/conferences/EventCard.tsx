// components/conferences/EventCard.tsx
import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { ConferenceInfo } from '../../../models/response/conference.list.response'; // Điều chỉnh path nếu cần
import { ConferenceResponse } from '@/src/models/response/conference.response';
import { Link } from '@/src/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/src/navigation';
import { useAuth } from '@/src/contexts/AuthContext';

import useFollowConference from '@/src/hooks/conferenceDetails/useFollowConference';
import useAddToCalendar from '@/src/hooks/conferenceDetails/useAddToCalendar';

interface EventCardProps {
  event: ConferenceInfo;
  className?: string;
  style?: React.CSSProperties; // style prop đã có trong interface
  userBlacklist: string[];
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  className,
  style, // <<<< SỬA LỖI 1: Destructure style từ props
  userBlacklist
}) => {
  const t = useTranslations('');
  const router = useRouter();
  const { isLoggedIn, isInitializing: isAuthInitializing } = useAuth();

  const isBlacklisted = userBlacklist?.includes(event.id) ?? false;
  const conferenceDataForHook = event as unknown as ConferenceResponse | null;

  const {
    isFollowing,
    handleFollowClick: triggerFollowAction,
    loading: followLoading,
  } = useFollowConference(conferenceDataForHook);

  const {
    isAddToCalendar,
    handleAddToCalendar: triggerCalendarAction,
    loading: calendarLoading,
  } = useAddToCalendar(conferenceDataForHook);

  const [showWebsiteTooltip, setShowWebsiteTooltip] = useState(false);
  const [showFavoriteTooltip, setShowFavoriteTooltip] = useState(false);
  const [showAddCalendarTooltip, setShowAddCalendarTooltip] = useState(false);

  const checkLoginAndRedirect = useCallback(
    (callback: () => void) => {
      if (!isLoggedIn) {
        const currentPath = window.location.pathname + window.location.search;
        localStorage.setItem('returnUrl', currentPath);
        router.push(`/auth/login`);
      } else {
        callback();
      }
    },
    [isLoggedIn, router]
  );

  const formatDate = useCallback((dateString: string | undefined): string => {
    if (!dateString) return 'TBD';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return 'Invalid Date';
    }
  }, []);

  const formatDateRange = useCallback(
    (fromDate: string | undefined, toDate: string | undefined) => {
      if (!fromDate || !toDate) return 'TBD';
      const formattedFromDate = formatDate(fromDate);
      const formattedToDate = formatDate(toDate);
      if (formattedFromDate === 'Invalid Date' || formattedToDate === 'Invalid Date') {
        return 'Invalid Date Range';
      }
      if (formattedFromDate === formattedToDate) {
        return formattedFromDate;
      }
      return `${formattedFromDate} - ${formattedToDate}`;
    },
    [formatDate]
  );

  const locationString =
    [event.location?.cityStateProvince, event.location?.country]
      .filter(Boolean)
      .join(', ') || t('Location_Not_Available');

  const getRankColor = useCallback((rank?: string) => {
    rank = rank?.toUpperCase();
    switch (rank) {
      case 'A*': return 'bg-amber-100 text-amber-700 border border-amber-300';
      case 'A': return 'bg-green-100 text-green-700 border border-green-300';
      case 'B': return 'bg-sky-100 text-sky-700 border border-sky-300';
      case 'C': return 'bg-orange-100 text-orange-700 border border-orange-300';
      default: return 'bg-gray-100 text-gray-600 border border-gray-300';
    }
  }, []);

  const getAccessTypeColor = useCallback((accessType?: string) => {
    accessType = accessType?.toUpperCase();
    switch (accessType) {
      case 'ONLINE': return 'bg-green-100 text-green-700 border border-green-300';
      case 'OFFLINE': return 'bg-red-100 text-red-700 border border-red-300';
      case 'HYBRID': return 'bg-blue-100 text-blue-700 border border-blue-300';
      default: return 'bg-gray-100 text-gray-600 border border-gray-300';
    }
  }, []);

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (!isBlacklisted) {
        checkLoginAndRedirect(triggerFollowAction);
      }
      setShowFavoriteTooltip(false);
    },
    [checkLoginAndRedirect, triggerFollowAction, isBlacklisted]
  );

  const handleAddCalendarClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (!isBlacklisted) {
        checkLoginAndRedirect(triggerCalendarAction);
      }
      setShowAddCalendarTooltip(false);
    },
    [checkLoginAndRedirect, triggerCalendarAction, isBlacklisted]
  );

  const handleGoToWebsite = useCallback(
    // Chấp nhận url có thể là string hoặc undefined
    (e: React.MouseEvent<HTMLButtonElement>, url: string | undefined) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isBlacklisted && url) {
        window.open(url, '_blank', 'noopener noreferrer');
      } else if (!url) {
        console.warn('No URL provided for Go to Website');
      }
      setShowWebsiteTooltip(false);
    },
    [isBlacklisted]
  );

  const isLoadingAction = followLoading || calendarLoading;

  const blacklistedStyles = isBlacklisted
    ? 'opacity-50 grayscale pointer-events-none cursor-default'
    : '';

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg bg-white-pure shadow-lg transition duration-300 ease-in-out ${isBlacklisted ? '' : 'hover:shadow-xl'} ${className || ''} ${blacklistedStyles}`} // Thêm || '' cho className
      style={{ position: 'relative', ...style }} // style đã được destructure
    >
      {isBlacklisted && (
        <div className='pointer-events-auto absolute left-2 top-2 z-10 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white'>
          {t('Blacklisted')}
        </div>
      )}

      <div className='relative'>
        <Image
          src={'/bg-2.jpg'}
          alt={event.title || 'Conference Image'}
          width={400}
          height={225}
          style={{ objectFit: 'cover', width: '100%', height: '180px' }}
          className={`w-full ${isBlacklisted ? '' : 'hover:opacity-90'}`}
          priority
          onError={e => {
            (e.target as HTMLImageElement).src = '/bg-2.jpg';
          }}
        />
        <div className='absolute right-2 top-2 flex flex-col items-end space-y-1'>
          <span
            className={`font-semibold ${getRankColor(event?.rank || 'No info')} rounded px-2 py-1 text-xs`}
          >
            {event.rank ? `Rank: ${event.rank}` : t('By_Users')}
          </span>
          {event.accessType && (
            <span
              className={`rounded px-2 py-1 text-xs font-semibold ${getAccessTypeColor(event.accessType)}`}
              title={`${t('Access_Type')}: ${event.accessType}`}
            >
              {event.accessType}
            </span>
          )}
        </div>
      </div>

      <div className='flex flex-grow flex-col px-4 py-4'>
        <div className='mb-2'>
          {isBlacklisted ? (
            <h3 className='text-left text-base font-bold opacity-50'>
              {event.title} {event.acronym ? `(${event.acronym})` : ''}
            </h3>
          ) : (
            <Link
              href={{
                pathname: `/conferences/detail`,
                query: { id: event.id }
              }}
              className='group'
            >
              <h3 className='cursor-pointer text-left text-base font-bold text-gray-800 transition duration-300 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400'>
                {event.title} {event.acronym ? `(${event.acronym})` : ''}
              </h3>
            </Link>
          )}
        </div>
        <div className='mb-3 flex items-center text-xs text-gray-600 transition duration-300 dark:text-gray-400'>
          <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-map-pin mr-1.5 flex-shrink-0 text-red-600'>
            <path d='M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0' /><circle cx='12' cy='10' r='3' />
          </svg>
          <span className='line-clamp-1 text-left'>{locationString}</span>
        </div>
        <div className='mb-3 flex items-center text-xs text-gray-600 transition duration-300 dark:text-gray-400'>
          <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-calendar-days mr-1.5 flex-shrink-0 text-red-600'>
            <path d='M8 2v4' /><path d='M16 2v4' /><rect width='18' height='18' x='3' y='4' rx='2' /><path d='M3 10h18' /><path d='M8 14h.01' /><path d='M12 14h.01' /><path d='M16 14h.01' /><path d='M8 18h.01' /><path d='M12 18h.01' /><path d='M16 18h.01' />
          </svg>
          <span className='text-left'>
            {formatDateRange(event.dates?.fromDate, event.dates?.toDate)}
          </span>
        </div>
        <div className='mb-4'>
          <div className='flex flex-wrap gap-1.5'>
            {event.topics && event.topics.length > 0 ? (
              <>
                {event.topics.slice(0, 3).map(topic =>
                  isBlacklisted ? (
                    <span key={topic} className='inline-block max-w-full cursor-default overflow-hidden text-ellipsis whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 opacity-50 dark:bg-gray-700 dark:text-gray-300' title={topic}>
                      {topic}
                    </span>
                  ) : (
                    <Link key={topic} href={{ pathname: `/conferences`, query: { topics: topic } }}>
                      <span className='inline-block max-w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 transition duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600' title={topic}>
                        {topic}
                      </span>
                    </Link>
                  )
                )}
                {event.topics.length > 3 && (
                  <span key='more-topics' className='inline-block max-w-full cursor-default overflow-hidden text-ellipsis whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300' title={`${event.topics.length - 3} more topics`}>
                    +{event.topics.length - 3} {t('more')}
                  </span>
                )}
              </>
            ) : (
              <span className='text-xs italic text-gray-500 dark:text-gray-400'>{t('No_topics_listed')}</span>
            )}
          </div>
        </div>
        <div className='mt-auto flex items-center justify-end border-t border-gray-200 pt-3 dark:border-gray-700'>
          <div className='flex space-x-2'>
            <div className='relative'>
              <button
                // <<<< SỬA LỖI 2: Truyền event.link || undefined
                onClick={e => handleGoToWebsite(e, event.link || undefined)}
                onMouseEnter={() => setShowWebsiteTooltip(true)}
                onMouseLeave={() => setShowWebsiteTooltip(false)}
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-100 ${isBlacklisted || !event.link ? 'disabled:cursor-not-allowed disabled:opacity-50' : ''}`}
                disabled={isBlacklisted || !event.link}
                title={t('Go_to_Website')}
              >
                <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-square-arrow-out-up-right'>
                  <path d='M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6' /><path d='m21 3-9 9' /><path d='M15 3h6v6' />
                </svg>
              </button>
            </div>

            <div className='relative'>
              <button
                onClick={handleAddCalendarClick}
                onMouseEnter={() => setShowAddCalendarTooltip(true)}
                onMouseLeave={() => setShowAddCalendarTooltip(false)}
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 ${isBlacklisted || isLoadingAction ? 'disabled:cursor-not-allowed disabled:opacity-50' : ''}  ${isAddToCalendar ? 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300' : 'hover:text-gray-800 dark:hover:text-gray-100'}`}
                style={{ minWidth: '36px', minHeight: '36px' }}
                disabled={isBlacklisted || isLoadingAction}
                title={isAddToCalendar ? t('Remove_from_Calendar') : t('Add_to_Calendar')}
              >
                {isLoadingAction && calendarLoading ? (
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent'></div>
                ) : (
                  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-calendar-plus'>
                    <path d='M8 2v4' /><path d='M16 2v4' /><path d='M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8' /><path d='M3 10h18' /><path d='M16 19h6' /><path d='M19 16v6' />
                  </svg>
                )}
              </button>
            </div>

            <div className='relative'>
              <button
                onClick={handleFavoriteClick}
                onMouseEnter={() => setShowFavoriteTooltip(true)}
                onMouseLeave={() => setShowFavoriteTooltip(false)}
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 ${isBlacklisted || isLoadingAction ? 'disabled:cursor-not-allowed disabled:opacity-50' : ''}  ${isFollowing ? 'text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300' : 'hover:text-gray-800 dark:hover:text-gray-100'}`}
                style={{ minWidth: '36px', minHeight: '36px' }}
                disabled={isBlacklisted || isLoadingAction}
                title={isFollowing ? t('Unfollow') : t('Follow')}
              >
                {isLoadingAction && followLoading ? (
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent'></div>
                ) : (
                  <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill={isFollowing ? 'currentColor' : 'none'} stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.122 2.122 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z' />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;