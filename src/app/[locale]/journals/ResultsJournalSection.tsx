// ResultsJournalSection.tsx
'use client'

import React from 'react'
import EventJournalCard from './EventJournalCard'
import Pagination from '../utils/Pagination'
import useJournalResults from '@/src/hooks/journals/useJournalResults'
import { useTranslations } from 'next-intl'

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
    loading,
    error,
    paginate,
    handleSortByChange
  } = useJournalResults()

  if (loading) {
    return <p>{t('loading')}</p>
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
        <h2 className='text-2xl font-semibold'>
          {/* Sử dụng totalJournals từ hook để hiển thị tổng số kết quả */}
          {t('resultsCount', { count: totalJournals })}
        </h2>
        <div className='flex items-center rounded-md px-2 py-1'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='mr-1 h-5 w-5'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M3 5a1 1 0 011-1h12a1 1 0 0110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 0110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 0110 2H4a1 1 0 01-1-1z'
              clipRule='evenodd'
            />
          </svg>
          <span className='mr-1 text-sm'>{t('sortByLabel')}:</span>
          <select
            className='rounded border bg-transparent px-2 py-1 text-sm focus:outline-none'
            value={sortBy}
            onChange={handleSortByChange}
          >
            <option value='title'>{t('sortByTitle')}</option>
            <option value='issn'>{t('sortByISSN')}</option>
            <option value='publisher'>{t('sortByPublisher')}</option>
            <option value='impactFactor'>{t('sortByImpactFactor')}</option>
            <option value='sjr'>{t('sortBySJR')}</option>
            <option value='hIndex'>{t('sortByHIndex')}</option>
          </select>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
        {/* currentJournals (hoặc journals) là mảng JournalData[] */}
        {journals?.map(journal => ( // Đảm bảo map qua journals hoặc currentJournals
          <EventJournalCard key={journal.id} journal={journal} />
        ))}
      </div>

      {/* Điều kiện hiển thị phân trang dựa trên totalPages */}
      {totalPages > 1 && ( // Chỉ hiển thị phân trang nếu có nhiều hơn 1 trang
        <Pagination
          eventsPerPage={journalsPerPage} // Đây là limit từ meta
          totalEvents={totalJournals} // Đây là tổng số record từ meta
          paginate={paginate}
          currentPage={currentPage} // Trang hiện tại từ meta
        />
      )}
    </div>
  )
}

export default ResultsJournalSection