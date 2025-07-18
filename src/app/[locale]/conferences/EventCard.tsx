// src/components/conferences/EventCard.tsx

import React, { useState, useCallback, memo } from 'react';
import { ConferenceInfo } from '../../../models/response/conference.list.response';
import { Link, useRouter } from '@/src/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/src/contexts/AuthContext';
import { MapPin, CalendarDays, SquareArrowOutUpRight, CalendarPlus, Star, Clock } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface EventCardProps {
  event: ConferenceInfo;
  className?: string;
  style?: React.CSSProperties;
  userBlacklist: string[];
  isFollowing: boolean;
  isAddToCalendar: boolean;
  onToggleFollow: (conferenceId: string, currentStatus: boolean) => Promise<void>;
  onToggleCalendar: (conferenceId: string, currentStatus: boolean) => Promise<void>;
}

const EventCardComponent: React.FC<EventCardProps> = ({
  event,
  className,
  style,
  userBlacklist,
  isFollowing,
  isAddToCalendar,
  onToggleFollow,
  onToggleCalendar
}) => {
  const t = useTranslations('');
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [followLoading, setFollowLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const isBlacklisted = userBlacklist?.includes(event.id) ?? false;

  const checkLoginAndRedirect = useCallback(
    (callback: () => void) => {
      if (!isLoggedIn) {
        const currentPath = window.location.pathname + window.location.search
        localStorage.setItem('returnUrl', currentPath)
        router.push(`/auth/login`)
      } else {
        callback()
      }
    },
    [isLoggedIn, router]
  )

  const handleFavoriteClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      if (isBlacklisted) return

      checkLoginAndRedirect(async () => {
        setFollowLoading(true)
        try {
          await onToggleFollow(event.id, isFollowing)
        } catch (error) {
          // console.error('Failed to toggle follow:', error)
          // Hiển thị thông báo lỗi cho người dùng ở đây nếu cần
        } finally {
          setFollowLoading(false)
        }
      })
    },
    [
      checkLoginAndRedirect,
      isBlacklisted,
      onToggleFollow,
      event.id,
      isFollowing
    ]
  )

  const handleAddCalendarClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      if (isBlacklisted) return

      checkLoginAndRedirect(async () => {
        setCalendarLoading(true)
        try {
          await onToggleCalendar(event.id, isAddToCalendar)
        } catch (error) {
          // console.error('Failed to toggle calendar:', error)
          // Hiển thị thông báo lỗi cho người dùng ở đây nếu cần
        } finally {
          setCalendarLoading(false)
        }
      })
    },
    [
      checkLoginAndRedirect,
      isBlacklisted,
      onToggleCalendar,
      event.id,
      isAddToCalendar
    ]
  )

  const formatDate = useCallback((dateString: string | undefined): string => {
    if (!dateString) return 'TBD'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (e) {
      return 'Invalid Date'
    }
  }, [])

  const formatDateRange = useCallback(
    (fromDate: string | undefined, toDate: string | undefined) => {
      if (!fromDate || !toDate) return 'TBD'
      const formattedFromDate = formatDate(fromDate)
      const formattedToDate = formatDate(toDate)
      if (
        formattedFromDate === 'Invalid Date' ||
        formattedToDate === 'Invalid Date'
      ) {
        return 'Invalid Date Range'
      }
      if (formattedFromDate === formattedToDate) {
        return formattedFromDate
      }
      return `${formattedFromDate} - ${formattedToDate}`
    },
    [formatDate]
  )

  const getEarliestSubmissionDate = useCallback(() => {
    if (!event.submissionDates || event.submissionDates.length === 0) {
      return null;
    }

    const now = new Date();
    const validDates = event.submissionDates
      .filter(subDate => {
        const date = new Date(subDate.fromDate);
        return !isNaN(date.getTime()) && date >= now; // Only future dates
      })
      .sort((a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime());

    return validDates.length > 0 ? validDates[0] : null;
  }, [event.submissionDates])

  const formatSubmissionDate = useCallback(() => {
    const earliestSubmission = getEarliestSubmissionDate();
    if (!earliestSubmission) {
      return 'No upcoming deadlines';
    }

    const formatted = formatDateRange(earliestSubmission.fromDate, earliestSubmission.toDate);
    return formatted;
  }, [getEarliestSubmissionDate, formatDateRange])

  const getSubmissionDateTooltipContent = useCallback(() => {
    if (!event.submissionDates || event.submissionDates.length === 0) {
      return 'No submission dates available';
    }

    const now = new Date();
    const upcomingDates = event.submissionDates
      .filter(subDate => {
        const date = new Date(subDate.fromDate);
        return !isNaN(date.getTime()) && date >= now;
      })
      .sort((a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime());

    if (upcomingDates.length === 0) {
      return 'No upcoming submission deadlines';
    }

    return upcomingDates.map(subDate => {
      const dateRange = formatDateRange(subDate.fromDate, subDate.toDate);
      return `${subDate.name}: ${dateRange}`;
    }).join('\n');
  }, [event.submissionDates, formatDateRange])

  const getSubmissionDateName = useCallback(() => {
    const earliestSubmission = getEarliestSubmissionDate();
    return earliestSubmission ? earliestSubmission.name : '';
  }, [getEarliestSubmissionDate])

  const handleGoToWebsite = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, url: string | undefined) => {
      e.preventDefault()
      e.stopPropagation()
      if (!isBlacklisted && url) {
        window.open(url, '_blank', 'noopener noreferrer')
      } else if (!url) {
        // console.warn('No URL provided for Go to Website')
      }
    },
    [isBlacklisted]
  )

  const locationString =
    [event.location?.address].filter(Boolean).join(', ') ||
    t('Location_not_available')

  const getRankColor = useCallback((rank?: string) => {
    rank = rank?.toUpperCase()
    switch (rank) {
      case 'A*':
        return 'bg-amber-100 text-amber-700 border border-amber-300'
      case 'A':
        return 'bg-green-100 text-green-700 border border-green-300'
      case 'B':
        return 'bg-sky-100 text-sky-700 border border-sky-300'
      case 'C':
        return 'bg-orange-100 text-orange-700 border border-orange-300'
      default:
        return 'bg-gray-100 text-gray-60 border border-gray-300'
    }
  }, [])

  const getAccessTypeColor = useCallback((accessType?: string) => {
    accessType = accessType?.toUpperCase()
    switch (accessType) {
      case 'ONLINE':
        return 'bg-green-100 text-green-700 border border-green-300'
      case 'OFFLINE':
        return 'bg-red-100 text-red-700 border border-red-300'
      case 'HYBRID':
        return 'bg-blue-100 text-blue-700 border border-blue-300'
      default:
        return 'bg-gray-100 text-gray-60 border border-gray-300'
    }
  }, [])

  const isByUserEvent = event.creatorId !== null && event.creatorId !== undefined;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg bg-white-pure shadow-lg transition duration-300 ease-in-out ${isBlacklisted ? '' : 'hover:shadow-xl'} ${className || ''}`}
      style={{ position: 'relative', ...style }}
    >
      {isBlacklisted && (
        <>
          <div className='pointer-events-none absolute inset-0 z-10 bg-gray-200 opacity-70 grayscale'></div>
          <div className='absolute left-2 top-2 z-20 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white'>
            {t('Blacklisted')}
          </div>
        </>
      )}

      <div className={`flex flex-grow flex-col px-4 py-4 ${isBlacklisted ? 'pointer-events-none' : ''}`}>
        <div className='relative mb-2 flex flex-col items-start'> {/* Thay đổi từ items-start justify-between sang flex-col items-start */}
          <div className='flex-grow w-full'> {/* Đảm bảo title chiếm đủ không gian */}
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
                <h3 className='cursor-pointer text-left text-base font-bold transition duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'>
                  {event.title} {event.acronym ? `(${event.acronym})` : ''}
                </h3>
              </Link>
            )}
          </div>
          {/* Di chuyển phần rank và accessType xuống dưới title */}
          <div className='mt-1 flex flex-wrap gap-1'> {/* Thêm mt-1 để tạo khoảng cách với title, dùng flex-wrap và gap-1 để các tag nằm cạnh nhau nếu đủ chỗ */}
            {isByUserEvent ? (
              <span
                className={`font-semibold bg-gray-100 text-gray-60 border border-gray-300 rounded px-2 py-1 text-xs`}
              >
                {t('By_Users')}
              </span>
            ) : (
              event.rank &&
              <span
                className={`font-semibold ${getRankColor(event?.rank || 'No info')} rounded px-2 py-1 text-xs`}
              >
                {`Rank: ${event.rank}`}
              </span>
            )}
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

        <div className='mb-3 flex items-center text-xs transition duration-300 '>
          <MapPin
            className='mr-1.5 flex-shrink-0 text-red-600'
            size={16}
            strokeWidth={1.5}
          />
          <span className='line-clamp-1 text-left'>{locationString}</span>
        </div>
        <div className='mb-3 flex items-center text-xs transition duration-300 '>
          <CalendarDays
            className='mr-1.5 flex-shrink-0 text-red-600'
            size={16}
            strokeWidth={1.5}
          />
          <span className='text-left'>
            {formatDateRange(event.dates?.fromDate, event.dates?.toDate)}
          </span>
        </div>
        
        {/* Submission Date Section - Only display if submission dates exist */}
        {event.submissionDates && event.submissionDates.length > 0 && getEarliestSubmissionDate() && (
          <div className='mb-3 flex items-center text-xs transition duration-300'>
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div className='flex items-center cursor-help'>
                    <Clock
                      className='mr-1.5 flex-shrink-0 text-blue-600'
                      size={16}
                      strokeWidth={1.5}
                    />
                    <div className='flex flex-col text-left'>
                      <span className='font-medium text-blue-700'>
                        {getSubmissionDateName()}
                      </span>
                      <span className='text-gray-600'>
                        {formatSubmissionDate()}
                      </span>
                    </div>
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className='max-w-xs rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-lg'
                    sideOffset={5}
                  >
                    <div className='whitespace-pre-line'>
                      {getSubmissionDateTooltipContent()}
                    </div>
                    <Tooltip.Arrow className='fill-gray-900' />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        )}
        <div className='mb-4'>
          <div className='flex flex-wrap items-center gap-1.5'>
            {event.topics && event.topics.length > 0 ? (
              <>
                {event.topics.slice(0, 3).map(topic =>
                  isBlacklisted ? (
                    <span
                      key={topic}
                      className='inline-flex max-w-full cursor-default items-center justify-center break-words rounded-full bg-gray-10 px-2.5 py-1.5 text-center text-xs font-medium leading-normal opacity-50 '
                      title={topic}
                    >
                      {topic}
                    </span>
                  ) : (
                    <Link
                      key={topic}
                      href={{
                        pathname: `/conferences`,
                        query: { topics: topic }
                      }}
                    >
                      <span
                        className='inline-flex max-w-full cursor-pointer items-center justify-center break-words rounded-full bg-gray-10 px-2.5 py-1 text-center text-xs font-medium leading-normal transition duration-200 hover:bg-gray-20 '
                        title={topic}
                      >
                        {topic}
                      </span>
                    </Link>
                  )
                )}
                {event.topics.length > 3 && (
                  <span
                    key='more-topics'
                    className='mt-1 inline-flex max-w-full cursor-default items-center justify-center rounded-full bg-gray-30 px-2.5 py-1 text-xs font-medium '
                    title={`${event.topics.length - 3} more topics`}
                  >
                    +{event.topics.length - 3} {t('more')}
                  </span>
                )}
              </>
            ) : (
              <span className='text-xs italic '>{t('No_topics_listed')}</span>
            )}
          </div>
        </div>
        <div className='mt-auto flex items-center justify-end border-t border-gray-200 pt-3 '>
          <div className='flex space-x-2'>
            <div className='relative'>
              <button
                onClick={e => handleGoToWebsite(e, event.link || undefined)}
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-10 p-2 transition hover:bg-gray-20 hover:text-gray-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${isBlacklisted || !event.link ? 'disabled:cursor-not-allowed disabled:opacity-50' : ''}`}
                disabled={isBlacklisted || !event.link}
                title={t('Go_to_Website')}
              >
                <SquareArrowOutUpRight size={18} strokeWidth={1.75} />
              </button>
            </div>

            <div className='relative'>
              <button
                onClick={handleAddCalendarClick}
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-10 p-2 transition hover:bg-gray-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${isBlacklisted ? 'disabled:cursor-not-allowed disabled:opacity-50' : ''} ${isAddToCalendar ? 'bg-blue-50 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300' : ' hover:text-gray-80 '} ${calendarLoading ? 'opacity-70' : ''}`}
                style={{ minWidth: '36px', minHeight: '36px' }}
                disabled={isBlacklisted || calendarLoading}
                title={
                  isAddToCalendar
                    ? t('Remove_from_Calendar')
                    : t('Add_to_Calendar')
                }
              >
                {calendarLoading ? (
                  <div
                    className={`h-4 w-4 animate-spin rounded-full border-2 ${isAddToCalendar ? 'border-blue-500 border-t-blue-100' : 'border-gray-400 border-t-transparent'}`}
                  ></div>
                ) : (
                  <CalendarPlus size={18} strokeWidth={1.75} />
                )}
              </button>
            </div>

            <div className='relative'>
              <button
                onClick={handleFavoriteClick}
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-10 p-2 transition hover:bg-gray-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${isBlacklisted ? 'disabled:cursor-not-allowed disabled:opacity-50' : ''} ${isFollowing ? 'bg-yellow-50 text-yellow-500 hover:text-yellow-600 ' : ' hover:text-gray-80 '} ${followLoading ? 'opacity-70' : ''}`}
                style={{ minWidth: '36px', minHeight: '36px' }}
                disabled={isBlacklisted || followLoading}
                title={isFollowing ? t('Unfollow') : t('Follow')}
              >
                {followLoading ? (
                  <div
                    className={`h-4 w-4 animate-spin rounded-full border-2 ${isFollowing ? 'border-yellow-500 border-t-yellow-100' : 'border-gray-400 border-t-transparent'}`}
                  ></div>
                ) : (
                  <Star
                    size={20}
                    strokeWidth={1.5}
                    fill={isFollowing ? 'currentColor' : 'none'}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const EventCard = memo(EventCardComponent);
export default EventCard;