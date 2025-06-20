// ResultsJournalSection.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import EventJournalCard from './EventJournalCard'
import Pagination from '../utils/Pagination'
import useJournalResults from '@/src/hooks/journals/useJournalResults'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { journalFollowService } from '@/src/services/journal-follow.service'

interface ResultsJournalSectionProps {}

const ResultsJournalSection: React.FC<ResultsJournalSectionProps> = () => {
  const t = useTranslations('JournalResults')

  const {
    journals,
    totalJournals,
    currentPage,
    journalsPerPage,
    totalPages,
    sortBy,
    loading,
    error,
    paginate,
    handleSortByChange
  } = useJournalResults()

  const [followedJournalIds, setFollowedJournalIds] = useState<Set<string>>(new Set());
  const [loadingFollows, setLoadingFollows] = useState(true);

  useEffect(() => {
    const fetchFollowedJournalIds = async () => {
      try {
        setLoadingFollows(true);
        const ids = await journalFollowService.getFollowedJournalIdsByUser();
        setFollowedJournalIds(new Set(ids));
      } catch (err) {
        console.error('Failed to fetch followed journal IDs:', err);
      } finally {
        setLoadingFollows(false);
      }
    };
    fetchFollowedJournalIds();
  }, []);

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
  }, []);

  if (loading || loadingFollows) {
    return (
      <div className='flex h-96 flex-col items-center justify-center text-gray-500'>
        <Loader2 className='h-10 w-10 animate-spin text-indigo-600' />
        <p className='mt-4 text-lg'>{t('loading')}</p>
      </div>
    )
  }

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
          {t('resultsCount', { count: totalJournals })}
        </h2>
      </div>

      {/* THAY ĐỔI TẠI ĐÂY: Thêm grid-auto-rows-fr */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-auto-rows-fr'>
        {journals?.map(journal => (
          <EventJournalCard
            key={journal.id}
            journal={journal}
            isInitiallyFollowing={followedJournalIds.has(journal.id)}
            onFollowStatusChange={handleFollowStatusChange}
          />
        ))}
      </div>

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