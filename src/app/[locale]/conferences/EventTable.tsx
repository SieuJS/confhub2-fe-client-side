// src/components/conferences/EventTable.tsx
import React, { useCallback } from 'react';
import { ConferenceInfo } from '../../../models/response/conference.list.response';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/navigation';
import {
  CalendarDays,
  MapPin,
  Award,
  KeyRound,
  Tags,
  Ban,
} from 'lucide-react';

interface EventTableProps {
  events: ConferenceInfo[];
  userBlacklist: string[];
}

const EventTable: React.FC<EventTableProps> = ({ events, userBlacklist }) => {
  const t = useTranslations('');

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

  const renderBadge = (text: string, colorClass: string) => (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colorClass}`}
    >
      {text}
    </span>
  );

  const formatDateRange = (
    fromDate: string | undefined,
    toDate: string | undefined
  ) => {
    if (!fromDate || !toDate) return 'TBD';
    try {
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 'Invalid Date';
      }
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      if (startDate.toDateString() === endDate.toDateString()) {
        return startDate.toLocaleDateString('en-US', options);
      }
      return `${startDate.toLocaleDateString(
        'en-US',
        options
      )} - ${endDate.toLocaleDateString('en-US', options)}`;
    } catch (e) {
      console.error(
        'Error formatting date range in table:',
        fromDate,
        toDate,
        e
      );
      return 'Invalid Date Range';
    }
  };

  return (
    <div className='w-full'>
      {/* Table Header for Desktop */}
      <div className='hidden rounded-t-lg bg-gray-10 md:grid md:grid-cols-12 md:gap-4 md:px-6 md:py-3'>
        <div className='col-span-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500'>
          {t('Conference')}
        </div>
        {/* Date Column Header with Icon */}
        <div className='col-span-2 flex items-center justify-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500'>
          <CalendarDays className='h-4 w-4 flex-shrink-0' />
          {t('Date')}
        </div>
        {/* Location Column Header with Icon */}
        <div className='col-span-2 flex items-center justify-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500'>
          <MapPin className='h-4 w-4 flex-shrink-0' />
          {t('Location')}
        </div>
        {/* Rank Column Header with Icon */}
        <div className='col-span-1 flex items-center justify-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500'>
          <Award className='h-4 w-4 flex-shrink-0' />
          {t('Rank')}
        </div>
        {/* Access Column Header with Icon */}
        <div className='col-span-1 flex items-center justify-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500'>
          <KeyRound className='h-4 w-4 flex-shrink-0' />
          {t('Access')}
        </div>
        {/* Topics Column Header with Icon */}
        <div className='col-span-3 flex items-center justify-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500'>
          <Tags className='h-4 w-4 flex-shrink-0' />
          {t('Topics')}
        </div>
      </div>

      {/* Table Body */}
      <div className='space-y-4 md:space-y-0'>
        {events.map((event) => {
          const isBlacklisted = userBlacklist?.includes(event.id) ?? false;
          const rowClasses = isBlacklisted
            ? 'opacity-60 pointer-events-none cursor-not-allowed'
            : 'hover:bg-gray-10';

          const hasLocationDetails =
            event.location?.cityStateProvince || event.location?.country;
          const isOnlineAccess =
            event.accessType?.toUpperCase() === 'ONLINE' ||
            event.accessType?.toUpperCase() === 'HYBRID';

          let locationText: string;
          let isLocationPlaceholder = false;
          if (hasLocationDetails) {
            locationText = `${event.location?.cityStateProvince ? `${event.location.cityStateProvince}, ` : ''}${event.location?.country || ''}`;
          } else if (isOnlineAccess) {
            locationText = t('Online');
          } else {
            locationText = t('No_location_available');
            isLocationPlaceholder = true;
          }

          // Kiểm tra xem có topic nào để hiển thị không
          const hasTopics = event.topics && event.topics.length > 0;

          return (
            <div
              key={event.id}
              className={`relative block rounded-lg border bg-white transition-colors duration-200 md:grid md:grid-cols-12 md:gap-4 md:rounded-none md:border-b md:border-x-0 md:border-t-0 ${rowClasses}`}
            >
              {/* --- Name Column --- */}
              <div className='col-span-3 p-2 md:p-4 flex flex-col items-center justify-center'>
                <div>
                  {isBlacklisted ? (
                    <span className='font-semibold text-sm text-gray-800 text-center'>
                      {event.title}
                    </span>
                  ) : (
                    <Link
                      href={{
                        pathname: `/conferences/detail`,
                        query: { id: event.id },
                      }}
                      className='font-semibold text-sm text-blue-600 hover:underline text-center'
                    >
                      {event.title}
                    </Link>
                  )}

                  {(event.acronym || isBlacklisted) && (
                    <p className='text-sm text-gray-500 mt-1 flex items-center justify-center gap-2'>
                      {event.acronym && `(${event.acronym})`}
                      {isBlacklisted && (
                        <span className='inline-block rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800'>
                          Blacklisted
                        </span>
                      )}
                    </p>
                  )}
                </div>
                {isBlacklisted && (
                  <div className='ml-2 flex-shrink-0 md:hidden'>
                    <Ban className='h-5 w-5 text-red-500' />
                  </div>
                )}
              </div>

              {/* --- Date Column (No Icon) --- */}
              <div
                className='responsive-table-cell col-span-2 flex items-center justify-center gap-2 p-4 pt-0 text-sm text-gray-700 md:p-6 md:pt-6'
                data-label={`${t('Date')}: `}
              >
                <span>
                  {formatDateRange(event.dates?.fromDate, event.dates?.toDate)}
                </span>
              </div>

              {/* --- Location Column (No Icon) --- */}
              <div
                className='responsive-table-cell col-span-2 flex items-center justify-center gap-2 p-4 pt-0 text-sm text-gray-700 md:p-6 md:pt-6'
                data-label={`${t('Location')}: `}
              >
                <span
                  // Áp dụng hover:text-blue-600 và cursor-pointer cho tất cả trường hợp
                  // Áp dụng in nghiêng và màu xám chỉ khi là placeholder
                  className={`truncate cursor-pointer transition-colors duration-200 
                              ${isLocationPlaceholder ? 'italic text-gray-500 hover:text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                  title={locationText} // Thêm title để hiển thị tooltip khi hover
                >
                  {locationText}
                </span>
              </div>

              {/* --- Rank Column (No Icon) --- */}
              <div
                className='responsive-table-cell col-span-1 flex items-center justify-center gap-2 p-4 pt-0 md:p-6 md:pt-6'
                data-label={`${t('Rank')}: `}
              >
                {event.rank
                  ? renderBadge(event.rank, getRankColor(event.rank))
                  : renderBadge(t('Unranked'), getRankColor(''))}
              </div>

              {/* --- Access Type Column (No Icon) --- */}
              <div
                className='responsive-table-cell col-span-1 flex items-center justify-center gap-2 p-4 pt-0 md:p-6 md:pt-6'
                data-label={`${t('Access')}: `}
              >
                {event.accessType
                  ? renderBadge(event.accessType, getAccessTypeColor(event.accessType))
                  : renderBadge(t('N/A'), getAccessTypeColor(''))}
              </div>

              {/* --- Topics Column (No Icon) --- */}
              <div
                className='responsive-table-cell col-span-3 flex p-4 pt-0 pb-4 md:p-6 md:pt-6'
                data-label={`${t('Topics')}: `}
              >
                <div
                  className={`flex flex-wrap gap-2 w-full ${hasTopics ? 'justify-start items-start' : 'justify-center items-center'}`}
                >
                  {hasTopics ? (
                    event.topics
                      .slice(0, 5)
                      .map((topic) => (
                        <span
                          key={topic}
                          className='rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700'
                        >
                          {topic}
                        </span>
                      ))
                  ) : (
                    <span className='text-sm italic text-gray-500'>
                      {t('No_topics_listed')}
                    </span>
                  )}
                  {hasTopics && event.topics!.length > 5 && (
                    <span className='rounded bg-gray-300 px-2 py-0.5 text-xs text-gray-900'>
                      +{event.topics!.length - 5} {t('more')}
                    </span>
                  )}
                </div>
              </div>

              {/* Blacklist indicator - only shows on desktop in the flow */}
              {isBlacklisted && (
                <div className='absolute right-6 top-6 hidden md:block'>
                  <span title={t('Blacklisted')}>
                    <Ban className='h-5 w-5 text-red-500' />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventTable;