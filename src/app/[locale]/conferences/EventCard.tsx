// src/components/conferences/EventCard.tsx
import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import { ConferenceInfo } from '../../../models/response/conference.list.response'
import { Link, useRouter } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/src/contexts/AuthContext'

// Import các Lucide icons cần thiết
import {
  MapPin,
  CalendarDays,
  SquareArrowOutUpRight,
  CalendarPlus,
  Star // Star icon cho Favorite/Follow
} from 'lucide-react'; // Đảm bảo bạn đã cài đặt lucide-react

interface EventCardProps {
  event: ConferenceInfo
  className?: string
  style?: React.CSSProperties
  userBlacklist: string[]
  // --- PROPS MỚI THAY THẾ CHO HOOKS ---
  isFollowing: boolean
  isAddToCalendar: boolean
  onToggleFollow: (
    conferenceId: string,
    currentStatus: boolean
  ) => Promise<void>
  onToggleCalendar: (
    conferenceId: string,
    currentStatus: boolean
  ) => Promise<void>
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  className,
  style,
  userBlacklist,
  // --- NHẬN PROPS MỚI ---
  isFollowing,
  isAddToCalendar,
  onToggleFollow,
  onToggleCalendar
}) => {
  const t = useTranslations('')
  const router = useRouter()
  const { isLoggedIn } = useAuth()

  // State cục bộ để quản lý loading của từng card riêng lẻ
  const [followLoading, setFollowLoading] = useState(false)
  const [calendarLoading, setCalendarLoading] = useState(false)

  const isBlacklisted = userBlacklist?.includes(event.id) ?? false

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
          console.error('Failed to toggle follow:', error)
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
          console.error('Failed to toggle calendar:', error)
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

  // ... các hàm format, get color không đổi ...
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
  
  const handleGoToWebsite = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, url: string | undefined) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isBlacklisted && url) {
        window.open(url, '_blank', 'noopener noreferrer');
      } else if (!url) {
        console.warn('No URL provided for Go to Website');
      }
    },
    [isBlacklisted]
  );

  const locationString =
    [event.location?.address]
      .filter(Boolean)
      .join(', ') || t('Location_not_available');

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

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg bg-white-pure shadow-lg transition duration-300 ease-in-out ${isBlacklisted ? '' : 'hover:shadow-xl'} ${className || ''}`}
      style={{ position: 'relative', ...style }}
    >
      {/* Lớp phủ mờ và chữ Blacklisted */}
      {isBlacklisted && (
        <>
          {/* Lớp phủ mờ */}
          <div className='absolute inset-0 z-10 bg-gray-200 opacity-70 grayscale pointer-events-none'></div>
          {/* Chữ Blacklisted */}
          <div className='absolute left-2 top-2 z-20 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white'>
            {t('Blacklisted')}
          </div>
        </>
      )}

        <div className='relative'>
            <Image
            src={'/bg-2.jpg'}
            alt={event.title || 'Conference Image'}
            width={400}
            height={225}
            style={{ objectFit: 'cover', width: '100%', height: '180px' }}
            className={`w-full ${isBlacklisted ? 'grayscale' : 'hover:opacity-90'}`} 
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

        <div className={`flex flex-grow flex-col px-4 py-4 ${isBlacklisted ? 'pointer-events-none' : ''}`}> {/* Thêm pointer-events-none vào đây để vô hiệu hóa tương tác */}
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
            {/* Sử dụng Lucide MapPin */}
            <MapPin className='mr-1.5 flex-shrink-0 text-red-600' size={16} strokeWidth={1.5} />
            <span className='line-clamp-1 text-left'>{locationString}</span>
            </div>
            <div className='mb-3 flex items-center text-xs text-gray-600 transition duration-300 dark:text-gray-400'>
            {/* Sử dụng Lucide CalendarDays */}
            <CalendarDays className='mr-1.5 flex-shrink-0 text-red-600' size={16} strokeWidth={1.5} />
            <span className='text-left'>
                {formatDateRange(event.dates?.fromDate, event.dates?.toDate)}
            </span>
            </div>
            <div className='mb-4'>
            {/* --- SỬA ĐỔI TẠI ĐÂY --- */}
            <div className='flex flex-wrap items-center gap-1.5'>
                {event.topics && event.topics.length > 0 ? (
                <>
                    {event.topics.slice(0, 3).map(topic =>
                    isBlacklisted ? (
                        <span key={topic} className='inline-flex items-center justify-center max-w-full cursor-default rounded-full bg-gray-100 px-2.5 py-1.5 text-center text-xs font-medium text-gray-700 opacity-50 dark:bg-gray-700 dark:text-gray-300 break-words leading-normal' title={topic}>
                        {topic}
                        </span>
                    ) : (
                        <Link key={topic} href={{ pathname: `/conferences`, query: { topics: topic } }}>
                        <span className='inline-flex items-center justify-center max-w-full cursor-pointer rounded-full bg-gray-100 px-2.5 py-1 text-center text-xs font-medium text-gray-700 transition duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 break-words leading-normal' title={topic}>
                            {topic}
                        </span>
                        </Link>
                    )
                    )}
                    {event.topics.length > 3 && (
                    /* --- BỎ mt-2 TẠY ĐÂY --- */
                    <span key='more-topics' className='inline-flex items-center justify-center max-w-full cursor-default rounded-full bg-gray-300 px-2.5 py-1 mt-1 text-xs font-medium text-gray-900 dark:bg-gray-700 dark:text-gray-300' title={`${event.topics.length - 3} more topics`}>
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
                            onClick={e => handleGoToWebsite(e, event.link || undefined)}
                            className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-100 ${isBlacklisted || !event.link ? 'disabled:cursor-not-allowed disabled:opacity-50' : ''}`}
                            disabled={isBlacklisted || !event.link}
                            title={t('Go_to_Website')}
                        >
                            {/* Sử dụng Lucide SquareArrowOutUpRight */}
                            <SquareArrowOutUpRight size={18} strokeWidth={1.75} />
                        </button>
                    </div>

                    <div className='relative'>
                        <button
                            onClick={handleAddCalendarClick}
                            className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 p-2 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:bg-gray-700 dark:hover:bg-gray-600 ${isBlacklisted ? 'disabled:cursor-not-allowed disabled:opacity-50' : ''}  ${isAddToCalendar ? 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100'} ${calendarLoading ? 'opacity-70' : ''}`}
                            style={{ minWidth: '36px', minHeight: '36px' }}
                            disabled={isBlacklisted || calendarLoading}
                            title={isAddToCalendar ? t('Remove_from_Calendar') : t('Add_to_Calendar')}
                        >
                            {calendarLoading ? (
                            <div className={`h-4 w-4 animate-spin rounded-full border-2 ${isAddToCalendar ? 'border-blue-500 border-t-blue-100' : 'border-gray-400 border-t-transparent'}`}></div>
                            ) : (
                            <CalendarPlus size={18} strokeWidth={1.75} />
                            )}
                        </button>
                    </div>

                    <div className='relative'>
                        <button
                            onClick={handleFavoriteClick}
                            className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 p-2 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 dark:bg-gray-700 dark:hover:bg-gray-600 ${isBlacklisted ? 'disabled:cursor-not-allowed disabled:opacity-50' : ''}  ${isFollowing ? 'text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100'} ${followLoading ? 'opacity-70' : ''}`}
                            style={{ minWidth: '36px', minHeight: '36px' }}
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
            </div>
        </div>
    </div>
  )
}

export default EventCard