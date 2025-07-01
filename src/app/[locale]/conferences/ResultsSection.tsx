// src/components/conferences/ResultsSection.tsx

import React, { useState, useEffect, useCallback } from 'react';
import EventCard from './EventCard';
import EventTable from './EventTable';
import useConferenceResults from '@/src/hooks/conferences/useConferenceResults';
import { useTranslations } from 'next-intl';
import Pagination from '../utils/Pagination';
import { useAuth } from '@/src/contexts/AuthContext';
import { fetchFollowedConferences, toggleFollowConference } from '@/src/app/apis/user/followApi';
import { fetchCalendarConferences, toggleCalendarConference } from '@/src/app/apis/user/calendarApi';
import { Loader2 } from 'lucide-react';
import { ConferenceListResponse } from '@/src/models/response/conference.list.response'; // Import type

interface ResultsSectionProps {
  userBlacklist: string[];
  initialData: ConferenceListResponse; // Thêm prop này
}

const LoadingSpinner = ({ message }: { message: string }) => (
  <div className='flex h-96 flex-col items-center justify-center text-gray-500'>
    <Loader2 className='h-10 w-10 animate-spin text-indigo-600' />
    <p className='mt-4 text-lg'>{message}</p>
  </div>
);

const ResultsSection: React.FC<ResultsSectionProps> = ({ userBlacklist, initialData }) => {
  const t = useTranslations('');
  const { isLoggedIn } = useAuth();
  const [viewType, setViewType] = useState<'card' | 'table'>('card');
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [calendarIds, setCalendarIds] = useState<Set<string>>(new Set());
  // const [statusLoading, setStatusLoading] = useState(true);

  // Truyền initialData vào hook
  const {
    sortedEvents,
    totalItems,
    eventsPerPage,
    currentPage,
    paginate,
    handleEventPerPageChange,
    loading: conferencesLoading,
    error
  } = useConferenceResults({ initialData });

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const fetchUserStatuses = async () => {
      // Không set loading ở đây nữa. Việc fetch này diễn ra ngầm.
      try {
        const [followedData, calendarData] = await Promise.all([
          fetchFollowedConferences(),
          fetchCalendarConferences()
        ]);
        setFollowedIds(new Set(followedData.map(conf => conf.id)));
        setCalendarIds(new Set(calendarData.map(conf => conf.id)));
      } catch (err) {
        // console.error('Failed to fetch user conference statuses:', err);
      }
      // Không có finally set loading
    };

    fetchUserStatuses();
  }, [isLoggedIn]);


  // Hàm xử lý toggle follow, được truyền xuống EventCard
  const handleToggleFollow = useCallback(
    async (conferenceId: string, currentStatus: boolean) => {
      // Logic gọi API thêm/xóa follow
      await toggleFollowConference(conferenceId, currentStatus)

      // Cập nhật state tập trung một cách an toàn (immutable)
      setFollowedIds(prevIds => {
        const newIds = new Set(prevIds)
        if (currentStatus) {
          newIds.delete(conferenceId)
        } else {
          newIds.add(conferenceId)
        }
        return newIds
      })
    },
    [] // Không có dependency vì hàm API đã đóng gói logic
  )

  // Hàm xử lý toggle calendar, được truyền xuống EventCard
  const handleToggleCalendar = useCallback(
    async (conferenceId: string, currentStatus: boolean) => {
      // Logic gọi API thêm/xóa calendar
      await toggleCalendarConference(conferenceId, currentStatus)

      // Cập nhật state tập trung
      setCalendarIds(prevIds => {
        const newIds = new Set(prevIds)
        if (currentStatus) {
          newIds.delete(conferenceId)
        } else {
          newIds.add(conferenceId)
        }
        return newIds
      })
    },
    []
  )
  // --- KẾT THÚC LOGIC TỐI ƯU ---

  // Chỉ có một nguồn loading duy nhất
  if (conferencesLoading) {
    return (
      <div className='w-full'>
        <LoadingSpinner message={t('Loading_conferences')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-red-500'>
        {t('Error')}: {error}
      </div>
    );
  }

  return (
    <div className='w-full p-4 '>
      <div className='mb-4 flex flex-col items-center justify-between sm:flex-row'>
        <h2 className='mb-2 text-xl font-semibold sm:mb-0'>
          {t('Conference_Results')} ({totalItems})
        </h2>
        {/* ... Các control sort, view type không đổi ... */}
        <div className='flex items-center space-x-2'>
            {/* Sort Controls */}
            <div className='flex items-center space-x-2'>
              <label htmlFor='event-per-page' className=' text-sm'>
                {t('Events_per_page')}:
              </label>
              <select
                id='event-per-page'
                className='rounded border bg-gray-10 px-2 py-1 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 '
                value={eventsPerPage}
                onChange={handleEventPerPageChange}
                title='Select number of event per page'
              >
                <option value='4'>4</option>
                <option value='8'>8</option>
                <option value='12'>12</option>
                <option value='20'>20</option>
                <option value='50'>50</option>
                <option value='100'>100</option>
              </select>
            </div>

            {/* View Type Toggle */}
            <button
              onClick={() =>
                setViewType(prev => (prev === 'card' ? 'table' : 'card'))
              }
              className='rounded bg-gray-20 px-1 py-1 text-sm hover:bg-gray-30 focus:outline-none focus:ring-2 focus:ring-blue-500 '
              title={
                viewType === 'card'
                  ? 'Switch to Table View'
                  : 'Switch to Card View'
              }
            >
              {viewType === 'card' ? (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='var(--primary)'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-sheet'
                >
                  <rect width='18' height='18' x='3' y='3' rx='2' ry='2' />
                  <line x1='3' x2='21' y1='9' y2='9' />
                  <line x1='3' x2='21' y1='15' y2='15' />
                  <line x1='9' x2='9' y1='9' y2='21' />
                  <line x1='15' x2='15' y1='9' y2='21' />
                </svg>
              ) : (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='var(--primary)'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-layout-grid'
                >
                  <rect width='7' height='7' x='3' y='3' rx='1' />
                  <rect width='7' height='7' x='14' y='3' rx='1' />
                  <rect width='7' height='7' x='14' y='14' rx='1' />
                  <rect width='7' height='7' x='3' y='14' rx='1' />
                </svg>
              )}
            </button>
          </div>
      </div>

      {sortedEvents && sortedEvents?.payload?.length > 0 ? (
        <>
          {viewType === 'card' ? (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {sortedEvents.payload.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  userBlacklist={userBlacklist}
                  // --- TRUYỀN PROPS MỚI XUỐNG EVENTCARD ---
                  isFollowing={followedIds.has(event.id)}
                  isAddToCalendar={calendarIds.has(event.id)}
                  onToggleFollow={handleToggleFollow}
                  onToggleCalendar={handleToggleCalendar}
                />
              ))}
            </div>
          ) : (
            <EventTable
              events={sortedEvents.payload}
              userBlacklist={userBlacklist}
              // Lưu ý: EventTable cũng cần được cập nhật tương tự nếu nó có các nút action
            />
          )}
          <div className='mt-4'>
            <Pagination
              eventsPerPage={Number(eventsPerPage)}
              totalEvents={totalItems}
              paginate={paginate}
              currentPage={currentPage}
            />
          </div>
        </>
      ) : (
        <p>{t('No_conferences_found_matching_your_criteria')}</p>
      )}
    </div>
  )
}

export default ResultsSection