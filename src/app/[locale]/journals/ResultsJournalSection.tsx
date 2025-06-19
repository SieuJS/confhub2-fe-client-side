// ResultsJournalSection.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import EventJournalCard from './EventJournalCard'
import Pagination from '../utils/Pagination'
import useJournalResults from '@/src/hooks/journals/useJournalResults'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react' // Import Loader2
import { journalFollowService } from '@/src/services/journal-follow.service' // Import service

interface ResultsJournalSectionProps {}

const ResultsJournalSection: React.FC<ResultsJournalSectionProps> = () => {
  const t = useTranslations('JournalResults')

  const {
    journals, // Bây giờ là dữ liệu của trang hiện tại
    totalJournals, // Tổng số tạp chí từ meta.total
    currentPage,   // Trang hiện tại từ meta.page
    journalsPerPage, // Số tạp chí trên mỗi trang từ meta.limit
    totalPages,    // Tổng số trang từ meta.totalPages
    sortBy,
    loading, // Loading trạng thái của journals
    error,
    paginate,
    handleSortByChange
  } = useJournalResults()

  // State mới để lưu trữ danh sách ID của các journal mà user đã follow
  const [followedJournalIds, setFollowedJournalIds] = useState<Set<string>>(new Set());
  // State để quản lý trạng thái loading của việc fetch danh sách follow
  const [loadingFollows, setLoadingFollows] = useState(true);

  // Effect để fetch danh sách journal IDs mà user đã follow
  useEffect(() => {
    const fetchFollowedJournalIds = async () => {
      try {
        setLoadingFollows(true);
        const ids = await journalFollowService.getFollowedJournalIdsByUser();
        setFollowedJournalIds(new Set(ids));
      } catch (err) {
        console.error('Failed to fetch followed journal IDs:', err);
        // Có thể thêm toast.error hoặc xử lý lỗi khác ở đây
      } finally {
        setLoadingFollows(false);
      }
    };
    fetchFollowedJournalIds();
  }, []); // Chỉ gọi một lần khi component mount

  // Callback để cập nhật trạng thái follow khi người dùng nhấn nút trong EventJournalCard
  const handleFollowStatusChange = useCallback((journalId: string, isFollowing: boolean) => {
    setFollowedJournalIds(prevIds => {
      const newIds = new Set(prevIds);
      if (isFollowing) {
        newIds.add(journalId);
      } else {
        newIds.delete(journalId);
      }
      return newIds;
    });
  }, []); // useCallback để tránh re-render không cần thiết

  // Hiển thị loading chung cho cả journals và followedJournalIds
  if (loading || loadingFollows) {
    return (
      <div className='flex h-96 flex-col items-center justify-center text-gray-500'>
        <Loader2 className='h-10 w-10 animate-spin text-indigo-600' />
        <p className='mt-4 text-lg'>{t('loading')}</p>
      </div>
    )
  }

  // journals có thể là undefined hoặc mảng rỗng
  if (!journals || journals.length === 0) {
    if (error) {
        return <p className="text-red-500">{t('errorFetchingResults', { error: error })}</p>
    }
    return <p>{t('noResults')}</p>
  }

  return (
    <div className='w-full'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>
          {/* Sử dụng totalJournals từ hook để hiển thị tổng số kết quả */}
          {t('resultsCount', { count: totalJournals })}
        </h2>
        {/* Phần sắp xếp (đã comment out) */}
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
        {journals?.map(journal => (
          <EventJournalCard
            key={journal.id}
            journal={journal}
            // Truyền trạng thái follow ban đầu
            isInitiallyFollowing={followedJournalIds.has(journal.id)}
            // Truyền callback để cập nhật trạng thái follow
            onFollowStatusChange={handleFollowStatusChange}
          />
        ))}
      </div>

      {/* Điều kiện hiển thị phân trang dựa trên totalPages */}
      {totalPages > 1 && (
        <Pagination
          eventsPerPage={journalsPerPage}
          totalEvents={totalJournals}
          paginate={paginate}
          currentPage={currentPage}
        />
      )}
    </div>
  )
}

export default ResultsJournalSection