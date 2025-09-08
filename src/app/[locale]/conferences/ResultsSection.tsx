// src/components/conferences/ResultsSection.tsx

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/src/contexts/AuthContext';
import { ConferenceListResponse } from '@/src/models/response/conference.list.response';

// Import hooks
import useConferenceResults from '@/src/hooks/conferences/useConferenceResults';
import { useUserConferenceStatus } from '@/src/hooks/conferences/useUserConferenceStatus';

// Import sub-components
import { LoadingSpinner } from './resultsSection/LoadingSpinner';
import { ResultsHeader } from './resultsSection/ResultsHeader';
import { ResultsContent } from './resultsSection/ResultsContent';
import Pagination from '../utils/Pagination';

interface ResultsSectionProps {
  userBlacklist: string[];
  initialData: ConferenceListResponse;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ userBlacklist, initialData }) => {
  const t = useTranslations('');
  const { isLoggedIn } = useAuth();
  const [viewType, setViewType] = useState<'card' | 'table'>('card');

  const {
    events,
    totalItems,
    eventsPerPage,
    currentPage,
    paginate,
    handleEventPerPageChange,
    loading: conferencesLoading,
    error,
    recommendationScores,
    sortConfig,
    handleSortChange,
  } = useConferenceResults({ initialData });

  const {
    followedIds,
    calendarIds,
    handleToggleFollow,
    handleToggleCalendar,
  } = useUserConferenceStatus(isLoggedIn);

  if (conferencesLoading) {
    return <LoadingSpinner message={t('Loading_conferences')} />;
  }

  if (error) {
    return <div className="text-red-500 p-4">{t('Error')}: {error}</div>;
  }

  return (
    <div className="w-full p-4">
      <ResultsHeader
        totalItems={totalItems}
        viewType={viewType}
        eventsPerPage={eventsPerPage}
        sortConfig={sortConfig}
        onViewTypeChange={() => setViewType(prev => (prev === 'card' ? 'table' : 'card'))}
        onEventsPerPageChange={handleEventPerPageChange}
        onSortChange={handleSortChange}
        t={t}
        isLoggedIn={isLoggedIn}
      />
      {events && events.payload?.length > 0 ? (
        <>
          <ResultsContent
            viewType={viewType}
            events={events.payload}
            userBlacklist={userBlacklist}
            followedIds={followedIds}
            calendarIds={calendarIds}
            onToggleFollow={handleToggleFollow}
            onToggleCalendar={handleToggleCalendar}
            recommendationScores={recommendationScores}
          />
          <div className="mt-4">
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
  );
};

export default ResultsSection;