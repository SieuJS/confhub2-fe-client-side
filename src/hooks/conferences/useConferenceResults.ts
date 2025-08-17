// src/hooks/conferences/useConferenceResults.ts

import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { ConferenceListResponse } from '@/src/models/response/conference.list.response';

// Import the new, specialized hooks
import { useConferenceDataFetching } from './results/useConferenceDataFetching';
import { useRecommendationScores } from './results/useRecommendationScores';
import { useConferenceFiltering } from './results/useConferenceFiltering'; // Import our new hook
import { useConferenceSorting } from './results/useConferenceSorting';
import { useConferencePagination } from './results/useConferencePagination';

interface UseConferenceResultsProps {
  initialData?: ConferenceListResponse;
}

const useConferenceResults = ({ initialData }: UseConferenceResultsProps = {}) => {
  // --- NEW: Read the match score range from the URL ---
  const searchParams = useSearchParams();
  const rangeParam = searchParams.get('matchScoreRange');
  const matchScoreRange = rangeParam ? rangeParam.split(',').map(Number) : [0, 100];

  // 1. Fetch the core conference data from the API
  const { events, totalItems, currentPage, eventsPerPage, loading, error } = 
    useConferenceDataFetching({ initialData });

  // 2. Fetch recommendation scores for the *unfiltered* data
  const { recommendationScores, recommendationLoading } = 
    useRecommendationScores(events);

  // --- NEW STEP 3: Filter the data on the client-side ---
  const { filteredEvents, filteredTotalItems } = 
    useConferenceFiltering(events, recommendationScores, matchScoreRange);

  // 4. Handle sorting based on the *filtered* data and scores
  const { sortedEvents, sortConfig, handleSortChange } = 
    useConferenceSorting(filteredEvents, recommendationScores);

  // 5. Handle pagination and URL updates
  const { paginate, handleEventPerPageChange } = 
    useConferencePagination();

  // 6. Return the combined state and handlers
  return {
    sortedEvents,
    // IMPORTANT: Return the total count *after* filtering
    totalItems: loading ? totalItems : filteredTotalItems, 
    eventsPerPage,
    currentPage,
    paginate,
    handleEventPerPageChange,
    loading,
    error,
    recommendationScores,
    recommendationLoading,
    sortConfig,
    handleSortChange,
  };
};

export default useConferenceResults;