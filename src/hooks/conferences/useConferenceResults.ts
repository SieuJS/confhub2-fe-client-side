// src/hooks/useConferenceResults.ts
import { useState, useEffect, useCallback } from 'react';
import { ConferenceInfo } from '@/src/models/response/conference.list.response';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

type SortOption = 'date' | 'rank' | 'name' | 'submissionDate' | 'startDate' | 'endDate';
type SortOrder = 'asc' | 'desc'; // Define SortOrder type

interface UseConferenceResultsProps {
  initialData?: ConferenceInfo[];
  initialTotalItems?: number; // Keep this for SSR/SSG if needed
}

const API_FILTERED_CONFERENCES_ENDPOINT = 'http://localhost:3000/api/v1/filter-conferences';

const useConferenceResults = ({ initialData, initialTotalItems }: UseConferenceResultsProps = {}) => {
  const [events, setEvents] = useState<ConferenceInfo[]>(initialData || []);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc'); // Add sortOrder state
  const [totalItems, setTotalItems] = useState(initialTotalItems || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();

      // Existing query parameter handling
      const searchQuery = searchParams.get('keyword') || '';
      const selectedLocation = searchParams.get('country') || null;
      const selectedType = searchParams.get('type') as 'Online' | 'Offline' | 'Hybrid' || null;
      const startDateStr = searchParams.get('startDate');
      const endDateStr = searchParams.get('endDate');
      const selectedRank = searchParams.get('rank') || null;
      const selectedSourceYear = searchParams.get('sourceYear') || null;
      const selectedTopics = searchParams.getAll('topics');
      const selectedPublisher = searchParams.get('publisher') || null;
      const page = searchParams.get('page') || '1';
      const sortByParam = searchParams.get('sortBy') || 'date';
      const sortOrderParam = searchParams.get('sortOrder') || 'asc'; // Get sortOrder from URL

      // Add existing parameters
      if (searchQuery) queryParams.append('keyword', searchQuery);
      if (selectedLocation) queryParams.append('country', selectedLocation);
      if (selectedType) queryParams.append('type', selectedType);
      if (startDateStr) {
        try {
          const startDate = new Date(startDateStr);
          queryParams.append('startDate', startDate.toISOString().split('T')[0]);
        } catch (error) {
          console.error("Invalid startDate format:", startDateStr);
        }
      }
      if (endDateStr) {
        try {
          const endDate = new Date(endDateStr);
          queryParams.append('endDate', endDate.toISOString().split('T')[0]);
        } catch (error) {
          console.error("Invalid endDate format:", endDateStr);
        }
      }
      if (selectedRank) queryParams.append('rank', selectedRank);
      if (selectedSourceYear) queryParams.append('sourceYear', selectedSourceYear);
      if (selectedTopics.length > 0) {
        selectedTopics.forEach(topic => queryParams.append('topics', topic));
      }
      if (selectedPublisher) queryParams.append('publisher', selectedPublisher);
      queryParams.append('page', page);
      queryParams.append('sortBy', sortByParam);
      queryParams.append('sortOrder', sortOrderParam); // Add sortOrder to the API request
      queryParams.append('limit', String(eventsPerPage));

      console.log(`Query: ${API_FILTERED_CONFERENCES_ENDPOINT}?${queryParams.toString()}`);
      const response = await fetch(`${API_FILTERED_CONFERENCES_ENDPOINT}?${queryParams.toString()}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('No conferences found matching your criteria.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      setEvents(data.items);
      setTotalItems(data.total);
      setCurrentPage(parseInt(page, 10));
      setSortBy(sortByParam as SortOption);
      setSortOrder(sortOrderParam as SortOrder); // Set sortOrder from the API response

    } catch (error: any) {
      console.error("Failed to fetch conferences:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [searchParams, eventsPerPage]); // Add eventsPerPage to dependencies

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const paginate = (pageNumber: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', String(pageNumber));

    const localePrefix = pathname.split('/')[1];
    router.push(`/${localePrefix}/conferences?${newParams.toString()}`);
  };

  const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = event.target.value as SortOption;
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('sortBy', newSortBy);
    newParams.delete('page'); // Reset to page 1 when sorting changes

    const localePrefix = pathname.split('/')[1];
    router.push(`/${localePrefix}/conferences?${newParams.toString()}`);
  };

  // Add handleSortOrderChange
  const handleSortOrderChange = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('sortOrder', newSortOrder);
    newParams.delete('page'); // Reset to page 1 when sorting changes

    const localePrefix = pathname.split('/')[1];
    router.push(`/${localePrefix}/conferences?${newParams.toString()}`);
  };


  const sortedEvents = events; // Use events directly, as they are sorted by the API

  return {
    sortedEvents,
    totalItems,
    eventsPerPage,
    currentPage,
    sortBy,
    sortOrder, // Return sortOrder
    paginate,
    handleSortByChange,
    handleSortOrderChange, // Return handleSortOrderChange
    loading,
    error,
  };
};

export default useConferenceResults;